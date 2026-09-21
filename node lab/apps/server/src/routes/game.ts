import express from 'express';
import { authenticate } from '../middleware/auth';
import { GameService } from '../services/GameService';
import prisma from '../utils/prisma';

const router = express.Router();

router.get('/state', authenticate, async (req: any, res) => {
  try {
    const state = await prisma.gameState.findUnique({ where: { id: 'singleton' } });
    const phase = state?.phase || 'ENGINEERING';
    const placementEndsAt = state?.placementEndsAt || null;
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { team: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let homeTeam = 'UNKNOWN';
    let targetTeam = 'UNKNOWN';

    if (user.teamId && user.team) {
      homeTeam = user.team.name;
      const opposingTeam = await prisma.team.findFirst({
        where: { id: { not: user.teamId } }
      });
      if (opposingTeam) {
        targetTeam = opposingTeam.name;
      }
    }

    // Generate score summary for PRINCES and PRINCESSES
    const princes = await prisma.team.findUnique({ where: { name: 'PRINCES' } });
    const princesses = await prisma.team.findUnique({ where: { name: 'PRINCESSES' } });

    const scoreSummary = {
      'PRINCES': princes?.huntScore || 0,
      'PRINCESSES': princesses?.huntScore || 0,
    };

    res.json({
      phase,
      placementEndsAt,
      playerView: {
        homeTeam,
        targetTeam
      },
      huntAvailable: phase === 'HUNT',
      scoreSummary
    });
  } catch (error) {
    console.error('Failed to get game state', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
