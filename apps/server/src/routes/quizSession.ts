import express from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../utils/prisma';

const router = express.Router();

const QUIZ_DURATION_SECONDS = 600; // 10 minutes
const VALID_PHASES = ['QUIZ_WAITING', 'QUIZ_ACTIVE', 'QUIZ_ENDED'];

// In-memory presence tracking for the waiting room - intentionally not
// persisted to the DB (it's ephemeral, high-frequency, and only meaningful
// while the process is up). A student counts as "present" if their last
// heartbeat was within PRESENCE_TIMEOUT_MS.
const PRESENCE_TIMEOUT_MS = 15000;
const waitingRoom = new Map<string, { username: string; team: string; lastSeen: number }>();

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

// POST /api/quiz-session/heartbeat - a student calls this while sitting in the
// waiting room so the admin dashboard can show who is present.
router.post('/heartbeat', authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { team: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    waitingRoom.set(user.id, {
      username: user.username,
      team: user.team?.name || 'NO TEAM',
      lastSeen: Date.now()
    });

    res.json({ ok: true });
  } catch (error) {
    console.error('Failed to record heartbeat', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/quiz-session/waiting-room (ADMIN only) - who is currently present
router.get('/waiting-room', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin privileges required' });

    const now = Date.now();
    const present: Array<{ username: string; team: string }> = [];
    for (const [userId, entry] of waitingRoom) {
      if (now - entry.lastSeen > PRESENCE_TIMEOUT_MS) {
        waitingRoom.delete(userId);
        continue;
      }
      present.push({ username: entry.username, team: entry.team });
    }
    present.sort((a, b) => a.team.localeCompare(b.team) || a.username.localeCompare(b.username));

    res.json({ count: present.length, students: present });
  } catch (error) {
    console.error('Failed to get waiting room', error);
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
