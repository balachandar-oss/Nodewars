import express from 'express';
import { authenticate } from '../middleware/auth';
import { GameService } from '../services/GameService';
import { LeaderboardService } from '../services/LeaderboardService';
import prisma from '../utils/prisma';

const router = express.Router();

// Development/Admin endpoint to force game phase
router.post('/game/start-placement', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin privileges required' });
    const newPhase = await GameService.transitionTo('BUG_PLACEMENT');
    res.json({ phase: newPhase });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Transition failed' });
  }
});

router.post('/game/start-hunt', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin privileges required' });
    const newPhase = await GameService.transitionTo('HUNT');
    res.json({ phase: newPhase });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Transition failed' });
  }
});

router.post('/game/complete', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin privileges required' });
    const newPhase = await GameService.transitionTo('COMPLETE');
    res.json({ phase: newPhase });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Transition failed' });
  }
});

router.post('/seed-castle', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const SYSTEM_IDS = [
      'SERVER', 'SMART_DOOR', 'SECURITY_GATE', 'RESOURCE_VAULT',
      'ASYNC_CORE', 'SECURITY_MONITOR', 'ADMIN_VAULT'
    ];

    const omega = await prisma.team.findUnique({ where: { name: 'PRINCE' } });
    const beta = await prisma.team.findUnique({ where: { name: 'PRINCESS' } });

    if (!omega || !beta) {
      return res.status(400).json({ error: 'Teams not found. Seed teams first.' });
    }

    const createComponents = async (teamId: string, teamName: string) => {
      const components = [];
      for (const sys of SYSTEM_IDS) {
        // e.g. NW:T:PRINCE:S:SECURITY_GATE
        const shortTeam = teamName === 'PRINCE' ? 'PRINCE' : 'PRINCESS';
        const code = `NW:T:${shortTeam}:S:${sys}`;
        const displayName = sys.replace(/_/g, ' ').replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
        
        const comp = await prisma.castleComponent.upsert({
          where: { physicalCode: code },
          update: {},
          create: {
            teamId,
            systemId: sys,
            physicalCode: code,
            displayName
          }
        });
        components.push(comp);
      }
      return components;
    };

    const omegaComps = await createComponents(omega.id, omega.name);
    const betaComps = await createComponents(beta.id, beta.name);

    res.json({ message: 'Castle components seeded', omegaCount: omegaComps.length, betaCount: betaComps.length });
  } catch (error) {
    console.error('Failed to seed castle', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/castle-components', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const components = await prisma.castleComponent.findMany({
      include: { team: true },
      orderBy: [
        { team: { name: 'asc' } },
        { systemId: 'asc' }
      ]
    });

    res.json(components);
  } catch (error) {
    console.error('Failed to fetch castle components', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// POST /api/admin/designate-architect - Promote user to Bug Architect
// ============================================
router.post('/designate-architect', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user role to BUG_ARCHITECT
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: 'BUG_ARCHITECT' }
    });

    res.json({
      message: `${updatedUser.username} is now a Bug Architect`,
      userId: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role
    });
  } catch (error) {
    console.error('Failed to designate architect', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// GET /api/admin/scores - Get all player and team scores
// ============================================
router.get('/scores', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    // Get team scores
    const teams = await prisma.team.findMany({
      include: {
        users: {
          select: {
            id: true,
            username: true,
            level: true,
            huntScore: true,
            xp: true,
            role: true
          },
          orderBy: { huntScore: 'desc' }
        }
      },
      orderBy: { huntScore: 'desc' }
    });

    const teamScores = teams.map(team => ({
      teamId: team.id,
      teamName: team.name,
      teamScore: team.huntScore,
      playerCount: team.users.length,
      players: team.users
    }));

    res.json({
      timestamp: new Date().toISOString(),
      teams: teamScores
    });
  } catch (error) {
    console.error('Failed to fetch scores', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// GET /api/admin/bug-architects - List all Bug Architects
// ============================================
router.get('/bug-architects', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const architects = await prisma.user.findMany({
      where: { role: 'BUG_ARCHITECT' },
      include: {
        team: { select: { id: true, name: true } },
        plantedBugs: {
          select: {
            id: true,
            vulnerabilityType: true,
            targetSystem: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    const architectList = architects.map(arch => ({
      id: arch.id,
      username: arch.username,
      teamId: arch.teamId,
      teamName: arch.team?.name,
      bugsPlanted: arch.plantedBugs.length,
      bugs: arch.plantedBugs
    }));

    res.json(architectList);
  } catch (error) {
    console.error('Failed to fetch bug architects', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// GET /api/admin/bugs - Get all bugs with details (Admin view)
// ============================================
router.get('/bugs', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const bugs = await prisma.bug.findMany({
      include: {
        architect: { select: { id: true, username: true } },
        architectTeam: { select: { id: true, name: true } },
        targetTeam: { select: { id: true, name: true } },
        claimedByUser: { select: { id: true, username: true } },
        claimedByTeam: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const bugList = bugs.map(bug => ({
      id: bug.id,
      vulnerabilityType: bug.vulnerabilityType,
      targetSystem: bug.targetSystem,
      status: bug.status,
      difficulty: bug.configuration
        ? JSON.parse(bug.configuration).difficulty
        : 'UNKNOWN',
      plantedBy: bug.architect?.username,
      plantedByTeam: bug.architectTeam?.name,
      targetTeam: bug.targetTeam?.name,
      claimedBy: bug.claimedByUser?.username,
      claimedByTeam: bug.claimedByTeam?.name,
      discoveredAt: bug.discoveredAt,
      claimedAt: bug.claimedAt,
      resolvedAt: bug.resolvedAt,
      createdAt: bug.createdAt
    }));

    res.json({
      totalBugs: bugList.length,
      bugs: bugList
    });
  } catch (error) {
    console.error('Failed to fetch bugs', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// GET /api/admin/game/state - Get live game state for admin dashboard
// ============================================
router.get('/game/state', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const phase = await GameService.getPhase();

    // Get all players with their stats
    const players = await prisma.user.findMany({
      where: { role: { not: 'ADMIN' } },
      include: {
        team: true,
        quizAttempts: {
          where: { isCompleted: true },
          orderBy: { completedAt: 'desc' },
          take: 1
        }
      }
    });

    // Get bug stats
    const plantedBugs = await prisma.bug.count({ where: { status: 'PLANTED' } });
    const discoveredBugs = await prisma.bug.count({ where: { status: 'DISCOVERED' } });
    const solvedBugs = await prisma.bug.count({ where: { status: 'RESOLVED' } });

    // Get teams info
    const teams = await prisma.team.findMany({
      include: { users: true }
    });

    // Get rankings for Bug Architects
    const rankings = await LeaderboardService.getRankings();

    // Map players with scores and architect status
    const playerList = players.map(user => ({
      id: user.id,
      username: user.username,
      teamId: user.teamId,
      teamName: user.team?.name || 'NO TEAM',
      score: user.quizAttempts[0]?.score || 0,
      isBugArchitect: rankings.some(r => r.userId === user.id && r.isBugArchitect),
      position: {
        x: Math.random(),
        y: Math.random()
      }
    }));

    const teamList = teams.map(team => ({
      id: team.id,
      name: team.name,
      huntScore: team.huntScore || 0,
      totalPlayers: team.users.length
    }));

    const gameState = {
      gameId: 'singleton',
      phase: phase || 'ENGINEERING',
      players: playerList,
      teams: teamList,
      bugStats: {
        planted: plantedBugs,
        discovered: discoveredBugs,
        solved: solvedBugs
      },
      royalRoomAttempts: 0,
      scoresRevealed: false
    };

    res.json(gameState);
  } catch (error) {
    console.error('Failed to fetch admin game state', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// POST /api/admin/game/start - Start game with countdown
// ============================================
router.post('/game/start', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const { countdownSeconds = 180 } = req.body;

    // Create or update game state with countdown.
    // Phase is set to ENGINEERING (not an arbitrary 'WAITING' string) so it lines up
    // with GameService's state machine: ENGINEERING -> BUG_PLACEMENT -> HUNT -> COMPLETE.
    const gameState = await prisma.gameState.upsert({
      where: { id: 'singleton' },
      update: {
        phase: 'ENGINEERING',
        startTime: new Date(),
        countdownSeconds: countdownSeconds
      },
      create: {
        id: 'singleton',
        phase: 'ENGINEERING',
        startTime: new Date(),
        countdownSeconds: countdownSeconds
      }
    });

    res.json({
      message: 'Game countdown started',
      phase: gameState.phase,
      countdownSeconds: gameState.countdownSeconds
    });
  } catch (error) {
    console.error('Failed to start game', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// POST /api/admin/game/end - End the current game
// ============================================
router.post('/game/end', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const gameState = await prisma.gameState.upsert({
      where: { id: 'singleton' },
      update: {
        phase: 'ENDED',
        endTime: new Date()
      },
      create: {
        id: 'singleton',
        phase: 'ENDED',
        endTime: new Date()
      }
    });

    res.json({
      message: 'Game ended',
      phase: gameState.phase,
      endTime: gameState.endTime
    });
  } catch (error) {
    console.error('Failed to end game', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// POST /api/admin/game/reveal-scores - Reveal scores and promote top 5 as Bug Architects
// ============================================
router.post('/game/reveal-scores', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    // Get rankings
    const rankings = await LeaderboardService.getRankings();

    // Get teams
    const omega = await prisma.team.findUnique({ where: { name: 'PRINCE' } });
    const beta = await prisma.team.findUnique({ where: { name: 'PRINCESS' } });

    if (!omega || !beta) {
      return res.status(400).json({ error: 'Teams not configured' });
    }

    // Get top 5 from each team
    const omegaTop5 = rankings
      .filter(r => r.teamId === omega.id)
      .slice(0, 5)
      .map(r => r.userId);

    const betaTop5 = rankings
      .filter(r => r.teamId === beta.id)
      .slice(0, 5)
      .map(r => r.userId);

    // Promote all top 10 players as Bug Architects
    const allTop10 = [...omegaTop5, ...betaTop5];

    for (const userId of allTop10) {
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'BUG_ARCHITECT' }
      });
    }

    res.json({
      message: 'Scores revealed. Top 5 from each team promoted to Bug Architects',
      promotedCount: allTop10.length,
      promotedUsers: allTop10
    });
  } catch (error) {
    console.error('Failed to reveal scores', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
