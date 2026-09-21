import express from 'express';
import { authenticate } from '../middleware/auth';
import { LeaderboardService } from '../services/LeaderboardService';

const router = express.Router();

// GET /api/leaderboard
router.get('/', authenticate, async (req: any, res) => {
  try {
    const leaderboard = await LeaderboardService.getRankings();
    
    // Omit sensitive data like userId for public view if needed, but for now we just return it
    // Or we map to omit userId if the frontend doesn't need it. Let's omit userId to be safe.
    const publicLeaderboard = leaderboard.map(({ userId, teamId, ...rest }) => rest);

    res.json(publicLeaderboard);
  } catch (error) {
    console.error('Failed to fetch leaderboard', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
