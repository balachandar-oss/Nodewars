import express from 'express';
import { authenticate } from '../middleware/auth';
import { GameService } from '../services/GameService';
import prisma from '../utils/prisma';

const router = express.Router();

router.get('/state', authenticate, async (req: any, res) => {
  try {
    const phase = await GameService.getPhase();
    
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

    // Generate score summary
    const omega = await prisma.team.findUnique({ where: { name: 'PRINCE' } });
    const beta = await prisma.team.findUnique({ where: { name: 'PRINCESS' } });

    const scoreSummary = {
      'PRINCE': omega?.huntScore || 0,
      'PRINCESS': beta?.huntScore || 0,
    };

    res.json({
      phase,
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
