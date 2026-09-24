import express from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../utils/prisma';

const router = express.Router();

const QUIZ_DURATION_SECONDS = 600; // 10 minutes
const VALID_PHASES = ['QUIZ_WAITING', 'QUIZ_ACTIVE', 'QUIZ_ENDED'];

async function getOrInitState() {
  let state = await prisma.gameState.findUnique({ where: { id: 'singleton' } });
  if (!state || !VALID_PHASES.includes(state.phase)) {
    state = await prisma.gameState.upsert({
      where: { id: 'singleton' },
      update: { phase: 'QUIZ_WAITING', startTime: null, endTime: null },
      create: { id: 'singleton', phase: 'QUIZ_WAITING' }
    });
  }
  return state;
}

// GET /api/quiz-session/state
router.get('/state', authenticate, async (req: any, res) => {
  try {
    let state = await getOrInitState();

    // Auto-transition ACTIVE -> ENDED once the server-side deadline passes.
    if (state.phase === 'QUIZ_ACTIVE' && state.endTime && new Date() >= state.endTime) {
      state = await prisma.gameState.update({
        where: { id: 'singleton' },
        data: { phase: 'QUIZ_ENDED' }
      });
    }

    res.json({
      phase: state.phase,
      startTime: state.startTime,
      endTime: state.endTime
    });
  } catch (error) {
    console.error('Failed to get quiz session state', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/quiz-session/start (ADMIN only)
router.post('/start', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin privileges required' });

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + QUIZ_DURATION_SECONDS * 1000);

    const state = await prisma.gameState.upsert({
      where: { id: 'singleton' },
      update: { phase: 'QUIZ_ACTIVE', startTime, endTime },
      create: { id: 'singleton', phase: 'QUIZ_ACTIVE', startTime, endTime }
    });

    res.json({ phase: state.phase, startTime: state.startTime, endTime: state.endTime });
  } catch (error) {
    console.error('Failed to start quiz session', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/quiz-session/end (ADMIN only) - manually end early
router.post('/end', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin privileges required' });

    const state = await prisma.gameState.upsert({
      where: { id: 'singleton' },
      update: { phase: 'QUIZ_ENDED', endTime: new Date() },
      create: { id: 'singleton', phase: 'QUIZ_ENDED', endTime: new Date() }
    });

    res.json({ phase: state.phase, startTime: state.startTime, endTime: state.endTime });
  } catch (error) {
    console.error('Failed to end quiz session', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/quiz-session/reset (ADMIN only) - for dry runs before the live event
router.post('/reset', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin privileges required' });

    await prisma.attemptQuestion.deleteMany();
    await prisma.quizAttempt.deleteMany();

    const state = await prisma.gameState.upsert({
      where: { id: 'singleton' },
      update: { phase: 'QUIZ_WAITING', startTime: null, endTime: null },
      create: { id: 'singleton', phase: 'QUIZ_WAITING' }
    });

    res.json({ phase: state.phase, startTime: state.startTime, endTime: state.endTime });
  } catch (error) {
    console.error('Failed to reset quiz session', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
