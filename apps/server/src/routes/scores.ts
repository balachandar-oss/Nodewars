import express from 'express';
import { authenticate } from '../middleware/auth';
import { gameEventBus } from '../services/GameEventBus';
import prisma from '../utils/prisma';

const router = express.Router();

// ============================================
// GET /api/scores/games/:gameId - Get all player scores in a game
// ============================================
router.get('/games/:gameId', authenticate, async (req: any, res) => {
  try {
    const { gameId } = req.params;

    // Verify game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId }
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Fetch all game scores
    const gameScores = await (prisma as any).gameScore.findMany({
      where: { gameId },
      include: {
        user: { select: { id: true, username: true, level: true } },
        team: { select: { id: true, name: true } }
      },
      orderBy: { score: 'desc' }
    });

    const scores = gameScores.map((gs: any, index: number) => ({
      rank: index + 1,
      userId: gs.userId,
      username: gs.user.username,
      userLevel: gs.user.level,
      teamId: gs.teamId,
      teamName: gs.team?.name || 'UNKNOWN',
      score: gs.score,
      bugsDiscovered: gs.bugsDiscovered,
      bugsSolved: gs.bugsSolved,
      fragmentsCollected: gs.fragmentsCollected,
      royalRoomUnlocked: gs.royalRoomUnlocked
    }));

    res.json({
      gameId,
      totalPlayers: scores.length,
      scores
    });
  } catch (error) {
    console.error('Failed to fetch game scores', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// GET /api/scores - Get current player's scores
// ============================================
router.get('/', authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        team: true,
        claimedBugs: {
          select: { id: true, status: true, createdAt: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate points from claimed bugs
    const resolvedBugs = await prisma.bug.findMany({
      where: {
        claimedByUserId: req.user.id,
        status: 'RESOLVED'
      }
    });

    // Get bug configuration to sum fragment values
    let totalFragments = 0;
    for (const bug of resolvedBugs) {
      try {
        const config = JSON.parse(bug.configuration);
        totalFragments += config.fragmentValue || 0;
      } catch (e) {
        console.error('Failed to parse bug configuration:', e);
      }
    }

    res.json({
      userId: user.id,
      username: user.username,
      teamId: user.teamId,
      teamName: user.team?.name,
      level: user.level,
      xp: user.xp,
      huntScore: user.huntScore,
      missionsCompleted: user.missionsCompleted,
      bugStats: {
        claimedCount: user.claimedBugs.length,
        resolvedCount: resolvedBugs.length,
        totalFragmentsEarned: totalFragments
      }
    });
  } catch (error) {
    console.error('Failed to fetch player scores', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// GET /api/scores/team/:teamId - Get team scores
// ============================================
router.get('/team/:teamId', authenticate, async (req: any, res) => {
  try {
    const { teamId } = req.params;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            level: true,
            xp: true,
            huntScore: true,
            role: true
          },
          orderBy: { huntScore: 'desc' }
        }
      }
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Get team's claimed bugs
    const claimedBugs = await prisma.bug.findMany({
      where: {
        claimedByTeamId: teamId,
        status: 'RESOLVED'
      }
    });

    let totalTeamFragments = 0;
    for (const bug of claimedBugs) {
      try {
        const config = JSON.parse(bug.configuration);
        totalTeamFragments += config.fragmentValue || 0;
      } catch (e) {
        console.error('Failed to parse bug configuration:', e);
      }
    }

    res.json({
      teamId: team.id,
      teamName: team.name,
      teamScore: team.huntScore,
      memberCount: team.users.length,
      members: team.users,
      teamStats: {
        resolvedBugCount: claimedBugs.length,
        totalFragmentsEarned: totalTeamFragments
      }
    });
  } catch (error) {
    console.error('Failed to fetch team scores', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// POST /api/scores/:userId/update - Update user score (Server-internal, Admin only)
// ============================================
router.post('/:userId/update', authenticate, async (req: any, res) => {
  try {
    // Only admins can update scores
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const { userId } = req.params;
    const { gameId, points, reason } = req.body;

    if (!gameId || typeof points !== 'number') {
      return res.status(400).json({ error: 'Invalid gameId or points' });
    }

    // Update game score
    const gameScore = await (prisma as any).gameScore.findFirst({
      where: { gameId, userId }
    });

    if (!gameScore) {
      return res.status(404).json({ error: 'Game score not found' });
    }

    const updatedScore = await (prisma as any).gameScore.update({
      where: { id: gameScore.id },
      data: {
        score: { increment: points }
      },
      include: { user: { select: { username: true } } }
    });

    res.json({
      message: 'Score updated',
      userId,
      gameId,
      pointsChanged: points,
      newScore: updatedScore.score,
      reason
    });
  } catch (error) {
    console.error('Failed to update score', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// POST /api/scores/award - Award points to player (Server-authoritative)
// ============================================
router.post('/award', authenticate, async (req: any, res) => {
  try {
    const { userId, points, reason } = req.body;

    // Only admins can manually award points
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    if (!userId || typeof points !== 'number' || points < 0) {
      return res.status(400).json({ error: 'Invalid userId or points' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        huntScore: { increment: points }
      },
      include: { team: true }
    });

    // Emit event for real-time updates
    gameEventBus.emit('ANY_EVENT', {
      type: 'SCORE_AWARDED',
      payload: {
        userId,
        points,
        reason,
        newScore: user.huntScore,
        teamId: user.teamId
      }
    });

    res.json({
      message: 'Points awarded',
      userId,
      pointsAwarded: points,
      newScore: user.huntScore,
      reason
    });
  } catch (error) {
    console.error('Failed to award points', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// GET /api/scores/leaderboard - Global leaderboard (sorted by hunt score)
// ============================================
router.get('/leaderboard/all', authenticate, async (req: any, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { team: { select: { id: true, name: true } } },
      orderBy: { huntScore: 'desc' },
      take: 100
    });

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      username: user.username,
      teamId: user.teamId,
      teamName: user.team?.name || 'NO TEAM',
      huntScore: user.huntScore,
      level: user.level,
      xp: user.xp
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Failed to fetch leaderboard', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// GET /api/scores/team-leaderboard - Team leaderboard
// ============================================
router.get('/leaderboard/teams', authenticate, async (req: any, res) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        users: {
          select: { id: true, huntScore: true }
        }
      },
      orderBy: { huntScore: 'desc' }
    });

    const teamLeaderboard = teams.map((team, index) => ({
      rank: index + 1,
      teamId: team.id,
      teamName: team.name,
      teamScore: team.huntScore,
      memberCount: team.users.length,
      averageMemberScore:
        team.users.length > 0
          ? Math.round(
              team.users.reduce((sum, u) => sum + u.huntScore, 0) /
                team.users.length
            )
          : 0
    }));

    res.json(teamLeaderboard);
  } catch (error) {
    console.error('Failed to fetch team leaderboard', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
