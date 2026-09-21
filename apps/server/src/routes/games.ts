import express from 'express';
import { authenticate } from '../middleware/auth';
import { GameService } from '../services/GameService';
import { gameSeeds } from '../seeds/gameSeeds';
import prisma from '../utils/prisma';

const router = express.Router();

// ============================================
// GET /api/games - List all games
// ============================================
router.get('/', authenticate, async (req: any, res) => {
  try {
    // Fetch all teams (representing games)
    const teams = await prisma.team.findMany({
      include: {
        users: {
          select: { id: true, username: true, level: true, huntScore: true }
        }
      }
    });

    const games = teams.map(team => ({
      id: team.id,
      name: team.name,
      participantCount: team.users.length,
      teamScore: team.huntScore,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt
    }));

    res.json(games);
  } catch (error) {
    console.error('Failed to fetch games', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// GET /api/games/:gameId - Get game state and details
// ============================================
router.get('/:gameId', authenticate, async (req: any, res) => {
  try {
    const { gameId } = req.params;

    const team = await prisma.team.findUnique({
      where: { id: gameId },
      include: {
        users: true,
        plantedBugs: {
          where: { architectTeamId: gameId }
        },
        targetedBugs: {
          where: { targetTeamId: gameId }
        }
      }
    });

    if (!team) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const phase = await GameService.getPhase();
    const bugsPlanted = team.plantedBugs.length;
    const bugsTargeted = team.targetedBugs.length;
    const bugsClaimed = team.targetedBugs.filter(b => b.status === 'CLAIMED').length;
    const bugsResolved = team.targetedBugs.filter(b => b.status === 'RESOLVED').length;

    res.json({
      id: team.id,
      name: team.name,
      phase,
      participants: team.users.length,
      huntScore: team.huntScore,
      stats: {
        bugsPlanted,
        bugsTargeted,
        bugsClaimed,
        bugsResolved
      },
      createdAt: team.createdAt,
      updatedAt: team.updatedAt
    });
  } catch (error) {
    console.error('Failed to fetch game', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// GET /api/games/:gameId/state - Get game state (phase, bug status, scores)
// ============================================
router.get('/:gameId/state', authenticate, async (req: any, res) => {
  try {
    const { gameId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { team: true }
    });

    if (!user?.teamId) {
      return res.status(400).json({ error: 'User not assigned to a team' });
    }

    const phase = await GameService.getPhase();

    const team = await prisma.team.findUnique({
      where: { id: gameId }
    });

    if (!team) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Get bug status summary for this team
    const userTeamBugsPlanted = await prisma.bug.count({
      where: { architectTeamId: user.teamId, targetTeamId: gameId }
    });

    const userTeamBugsClaimed = await prisma.bug.count({
      where: { claimedByTeamId: user.teamId, targetTeamId: gameId }
    });

    // Get all team scores
    const allTeams = await prisma.team.findMany({
      select: { id: true, name: true, huntScore: true }
    });

    const scores: Record<string, number> = {};
    allTeams.forEach(t => {
      scores[t.name] = t.huntScore;
    });

    res.json({
      gameId,
      phase,
      userTeamId: user.teamId,
      userTeamName: user.team?.name,
      targetTeamId: gameId,
      bugStats: {
        bugsPlanted: userTeamBugsPlanted,
        bugsClaimed: userTeamBugsClaimed
      },
      allScores: scores
    });
  } catch (error) {
    console.error('Failed to fetch game state', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// POST /api/games - Create new game (Admin only)
// ============================================
router.post('/', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Game name is required' });
    }

    const existingGame = await prisma.team.findUnique({ where: { name } });
    if (existingGame) {
      return res.status(400).json({ error: 'Game already exists' });
    }

    const newGame = await prisma.team.create({
      data: { name, huntScore: 0 }
    });

    // Initialize game state if it doesn't exist
    await prisma.gameState.upsert({
      where: { id: 'singleton' },
      update: {},
      create: { id: 'singleton', phase: 'ENGINEERING' }
    });

    res.status(201).json({
      id: newGame.id,
      name: newGame.name,
      message: 'Game created successfully'
    });
  } catch (error) {
    console.error('Failed to create game', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// POST /api/games/:gameId/start - Start bug placement phase
// ============================================
router.post('/:gameId/start-placement', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const currentPhase = await GameService.getPhase();
    if (currentPhase !== 'ENGINEERING') {
      return res.status(400).json({
        error: `Cannot start placement. Current phase: ${currentPhase}`
      });
    }

    const newPhase = await GameService.transitionTo('BUG_PLACEMENT');
    res.json({ phase: newPhase, message: 'Bug placement phase started' });
  } catch (error: any) {
    console.error('Failed to start placement phase', error);
    res.status(400).json({ error: error.message || 'Transition failed' });
  }
});

// ============================================
// POST /api/games/:gameId/start-hunt - Start hunt phase
// ============================================
router.post('/:gameId/start-hunt', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const currentPhase = await GameService.getPhase();
    if (currentPhase !== 'BUG_PLACEMENT') {
      return res.status(400).json({
        error: `Cannot start hunt. Current phase: ${currentPhase}`
      });
    }

    const newPhase = await GameService.transitionTo('HUNT');
    res.json({ phase: newPhase, message: 'Hunt phase started' });
  } catch (error: any) {
    console.error('Failed to start hunt phase', error);
    res.status(400).json({ error: error.message || 'Transition failed' });
  }
});

// ============================================
// POST /api/games/:gameId/end - End game
// ============================================
router.post('/:gameId/end', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const currentPhase = await GameService.getPhase();
    if (currentPhase !== 'HUNT') {
      return res.status(400).json({
        error: `Cannot end game. Current phase: ${currentPhase}`
      });
    }

    const newPhase = await GameService.transitionTo('COMPLETE');
    res.json({ phase: newPhase, message: 'Game completed' });
  } catch (error: any) {
    console.error('Failed to end game', error);
    res.status(400).json({ error: error.message || 'Transition failed' });
  }
});

// ============================================
// POST /api/games/:gameId/seed-bugs - Seed 20 bugs to game (Admin only)
// ============================================
router.post('/:gameId/seed-bugs', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const { gameId } = req.params;

    // Get the target team (game)
    const targetTeam = await prisma.team.findUnique({
      where: { id: gameId }
    });

    if (!targetTeam) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Get or create architect team (the team that plants bugs)
    const architectTeam = await prisma.team.findFirst({
      where: { id: { not: gameId } }
    });

    if (!architectTeam) {
      return res.status(400).json({
        error: 'No opposing team found. Create at least 2 teams first.'
      });
    }

    // Get or create admin user to plant bugs on behalf of
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN', teamId: architectTeam.id }
    });

    if (!adminUser) {
      adminUser = await prisma.user.findFirst({
        where: { teamId: architectTeam.id }
      });

      if (!adminUser) {
        return res.status(400).json({
          error: 'No users found in the architect team'
        });
      }
    }

    // Create bugs from gameSeeds with questions and fragments
    const createdBugs: any[] = [];
    let fragmentPosition = 1; // Track fragment positions for the game

    for (const bugSeed of gameSeeds) {
      try {
        // Create the bug question
        const bugQuestion = await (prisma as any).bugQuestion.create({
          data: {
            text: bugSeed.question,
            options: JSON.stringify(bugSeed.options),
            correctAnswer: bugSeed.correctAnswer,
            explanation: `This is a ${bugSeed.difficulty} difficulty security question about ${bugSeed.vulnerabilityType}`
          }
        });

        // Create the flag fragment (position cycles 1-4 for flag parts)
        const fragment = await (prisma as any).flagFragment.create({
          data: {
            position: ((fragmentPosition - 1) % 4) + 1,
            value: `${bugSeed.vulnerabilityType}_FRAG_${fragmentPosition}`,
            gameId,
            teamId: targetTeam.id
          }
        });

        fragmentPosition++;

        // Determine structure type based on difficulty
        const structureTypes = ['ROOM', 'TOWER', 'CORRIDOR', 'VAULT', 'CHAMBER'];
        const structureType = structureTypes[gameSeeds.indexOf(bugSeed) % structureTypes.length];

        // Create the bug with links to question and fragment
        const newBug = await prisma.bug.create({
          data: {
            architectUserId: adminUser.id,
            architectTeamId: architectTeam.id,
            targetTeamId: gameId,
            gameId,
            vulnerabilityType: bugSeed.vulnerabilityType,
            targetSystem: bugSeed.targetSystem,
            structureType,
            difficulty: bugSeed.difficulty,
            questionId: bugQuestion.id,
            fragmentId: fragment.id,
            configuration: JSON.stringify({
              difficulty: bugSeed.difficulty,
              ...bugSeed.configuration
            }),
            status: 'DRAFT' // Set to DRAFT so architects can plant them
          }
        });

        createdBugs.push({
          id: newBug.id,
          vulnerabilityType: newBug.vulnerabilityType,
          targetSystem: newBug.targetSystem,
          difficulty: bugSeed.difficulty,
          structureType,
          question: bugSeed.question
        });
      } catch (error) {
        console.error(`Failed to create bug ${bugSeed.id}:`, error);
      }
    }

    res.json({
      message: `${createdBugs.length} bugs seeded to game`,
      targetTeam: targetTeam.name,
      architectTeam: architectTeam.name,
      bugsCreated: createdBugs.length,
      bugs: createdBugs
    });
  } catch (error) {
    console.error('Failed to seed bugs', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// GET /api/games/:gameId/leaderboard - Get game-specific leaderboard
// ============================================
router.get('/:gameId/leaderboard', authenticate, async (req: any, res) => {
  try {
    const { gameId } = req.params;

    const teams = await prisma.team.findMany({
      include: {
        users: {
          select: {
            id: true,
            username: true,
            level: true,
            huntScore: true,
            xp: true,
            royalRoomCompleted: true,
            bugsSolved: true,
            role: true
          },
          orderBy: { huntScore: 'desc' }
        }
      },
      orderBy: { huntScore: 'desc' }
    });

    // Calculate bugs solved per team (count of resolved bugs)
    const bugsPerTeam: Record<string, number> = {};
    for (const team of teams) {
      const bugCount = await prisma.bug.count({
        where: {
          targetTeamId: team.id,
          status: 'RESOLVED'
        }
      });
      bugsPerTeam[team.id] = bugCount;
    }

    // Build team stats
    const teamStats = teams.map(team => ({
      name: team.name,
      score: team.huntScore,
      bugsSolved: bugsPerTeam[team.id] || 0,
      royalRoomCompleted: team.users.some(u => u.royalRoomCompleted),
      playerCount: team.users.length
    }));

    // Build player leaderboard (top 10)
    const allPlayers = teams
      .flatMap(team =>
        team.users.map(user => ({
          rank: 0,
          username: user.username,
          teamName: team.name,
          teamScore: user.huntScore,
          bugsSolved: user.bugsSolved || 0,
          royalRoomCompleted: user.royalRoomCompleted,
          isBugArchitect: user.role === 'ADMIN' || user.level >= 20
        }))
      )
      .sort((a, b) => b.teamScore - a.teamScore)
      .slice(0, 10)
      .map((player, idx) => ({ ...player, rank: idx + 1 }));

    // Build top bug architects (top 5)
    const architects = teams
      .flatMap(team =>
        team.users
          .filter(u => u.role === 'ADMIN' || u.level >= 20)
          .map(user => ({
            rank: 0,
            username: user.username,
            teamName: team.name,
            teamScore: user.huntScore,
            bugsSolved: user.bugsSolved || 0,
            royalRoomCompleted: user.royalRoomCompleted,
            isBugArchitect: true
          }))
      )
      .sort((a, b) => b.teamScore - a.teamScore)
      .slice(0, 5)
      .map((architect, idx) => ({ ...architect, rank: idx + 1 }));

    res.json({
      teams: teamStats,
      players: allPlayers,
      bugArchitects: architects,
      completedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch leaderboard', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// POST /api/games/:gameId/reveal-scores - Reveal scores and designate Bug Architects
// ============================================
router.post('/:gameId/reveal-scores', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const { gameId } = req.params;

    // Verify game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        scores: {
          include: {
            user: { select: { id: true, username: true } },
            team: { select: { id: true, name: true } }
          },
          orderBy: { score: 'desc' }
        }
      }
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Get highest scoring players for Bug Architect designation
    const topScorers = game.scores.slice(0, 3);

    // Designate Bug Architects (top 3 performers in the game)
    for (const scorer of topScorers) {
      if (scorer.userId) {
        // Create or update BugArchitect designation
        await (prisma as any).bugArchitect.upsert({
          where: {
            gameId_userId: { gameId, userId: scorer.userId }
          },
          update: {},
          create: {
            gameId,
            userId: scorer.userId,
            teamId: scorer.teamId || '',
            bugsPlanted: 0
          }
        });
      }
    }

    // Mark game state as scores revealed
    const gameState = await prisma.gameState.findUnique({
      where: { id: 'singleton' }
    });

    if (gameState) {
      await prisma.gameState.update({
        where: { id: 'singleton' },
        data: { scoresRevealed: true }
      });
    }

    res.json({
      message: 'Scores revealed and Bug Architects designated',
      gameId,
      gameStatus: game.status,
      topPerformers: topScorers.map(s => ({
        username: s.user.username,
        teamName: s.team?.name,
        score: s.score,
        bugsSolved: s.bugsSolved
      }))
    });
  } catch (error) {
    console.error('Failed to reveal scores', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
