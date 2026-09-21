import express from 'express';
import { authenticate } from '../middleware/auth';
import { LeaderboardService } from '../services/LeaderboardService';
import prisma from '../utils/prisma';

const router = express.Router();

const BUG_CATALOG = {
  vulnerabilities: [
    {
      id: 'AUTHORIZATION_BYPASS',
      title: 'AUTHORIZATION BYPASS',
      concept: 'Authenticated PLAYER can access an ADMIN-only resource',
      difficulty: 'HARD',
      description: 'The target system authenticates users but fails to check their role before granting access.'
    },
    {
      id: 'ROLE_CHECK_FLAW',
      title: 'ROLE CHECK FLAW',
      concept: 'Role comparison logic incorrectly allows unauthorized users',
      difficulty: 'MEDIUM',
      description: 'The role-checking logic uses an insecure comparison or bypassable variable.'
    },
    {
      id: 'MISSING_AUTHENTICATION',
      title: 'MISSING AUTHENTICATION',
      concept: 'Protected resource lacks authentication enforcement',
      difficulty: 'EASY',
      description: 'The endpoint does not verify if a user is logged in before processing the request.'
    },
    {
      id: 'MIDDLEWARE_ORDER_FLAW',
      title: 'MIDDLEWARE ORDER FLAW',
      concept: 'Security middleware is placed incorrectly in the request pipeline',
      difficulty: 'MEDIUM',
      description: 'The authorization middleware is attached after the vulnerable route, leaving it exposed.'
    }
  ],
  targetSystems: [
    'SERVER',
    'SMART DOOR',
    'SECURITY GATE',
    'RESOURCE VAULT',
    'ASYNC CORE',
    'SECURITY MONITOR',
    'ADMIN VAULT'
  ]
};

// GET /api/bugs/catalog
router.get('/catalog', authenticate, (req, res) => {
  res.json(BUG_CATALOG);
});

// GET /api/bugs/mine
router.get('/mine', authenticate, async (req: any, res) => {
  try {
    const bugs = await prisma.bug.findMany({
      where: { architectUserId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bugs);
  } catch (error) {
    console.error('Failed to fetch planted bugs', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/bugs
router.post('/', authenticate, async (req: any, res) => {
  try {
    const { vulnerabilityType, targetSystem, configuration } = req.body;

    // 1. Verify Bug Architect eligibility
    const isArchitect = await LeaderboardService.isBugArchitect(req.user.id);
    if (!isArchitect && req.user?.role !== 'DEMO') {
      return res.status(403).json({ error: 'Bug Architect privileges required.' });
    }

    // 2. Validate input against catalog
    if (!BUG_CATALOG.vulnerabilities.some(v => v.id === vulnerabilityType)) {
      return res.status(400).json({ error: 'Invalid vulnerability type.' });
    }
    if (!BUG_CATALOG.targetSystems.includes(targetSystem)) {
      return res.status(400).json({ error: 'Invalid target system.' });
    }
    if (!configuration || typeof configuration !== 'object') {
      return res.status(400).json({ error: 'Invalid configuration metadata.' });
    }

    // 3. Derive Teams
    const architectUserId = req.user.id;
    const architectUser = await prisma.user.findUnique({
      where: { id: architectUserId },
      include: { team: true }
    });

    if (!architectUser || !architectUser.teamId) {
      return res.status(400).json({ error: 'Bug Architect must be assigned to a team.' });
    }

    const architectTeamId = architectUser.teamId;

    // Retrieve opposing team (e.g., if OMEGA, find BETA. If BETA, find OMEGA).
    const opposingTeam = await prisma.team.findFirst({
      where: { id: { not: architectTeamId } }
    });

    if (!opposingTeam) {
      return res.status(500).json({ error: 'Cannot determine opposing team.' });
    }

    const targetTeamId = opposingTeam.id;

    // 4. Enforce Bug Limit
    const MAX_BUGS = 3;
    const currentBugCount = await prisma.bug.count({
      where: { architectUserId }
    });

    if (currentBugCount >= MAX_BUGS) {
      return res.status(403).json({ error: 'Bug limit reached.' });
    }

    // 5. Create Bug
    const newBug = await prisma.bug.create({
      data: {
        architectUserId,
        architectTeamId,
        targetTeamId,
        vulnerabilityType,
        targetSystem,
        configuration: JSON.stringify(configuration),
        status: 'PLANTED'
      }
    });

    // Don't expose internal IDs to client if not necessary, but returning the bug is fine.
    res.json({
      id: newBug.id,
      vulnerabilityType: newBug.vulnerabilityType,
      targetSystem: newBug.targetSystem,
      status: newBug.status,
      targetTeamName: opposingTeam.name,
      createdAt: newBug.createdAt
    });

  } catch (error) {
    console.error('Failed to plant bug', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// GET /api/bugs/my-assignment - The ONE bug auto-assigned to this Bug Architect
// ============================================
router.get('/my-assignment', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'BUG_ARCHITECT') {
      return res.status(403).json({ error: 'Bug Architect privileges required.' });
    }

    const bug = await prisma.bug.findFirst({
      where: { architectUserId: req.user.id },
      orderBy: { createdAt: 'asc' }
    });

    if (!bug) {
      return res.status(404).json({ error: 'No bug assignment found for this architect.' });
    }

    let config: any = {};
    try {
      config = bug.configuration ? JSON.parse(bug.configuration) : {};
    } catch {
      config = {};
    }

    res.json({
      id: bug.id,
      vulnerabilityType: bug.vulnerabilityType,
      targetSystem: bug.targetSystem,
      difficulty: bug.difficulty || config.difficulty || 'UNKNOWN',
      question: config.question,
      options: config.options,
      status: bug.status,
      location: bug.location,
      structureType: bug.structureType
    });
  } catch (error) {
    console.error('Failed to fetch bug assignment', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// POST /api/bugs/:bugId/plant - Plant the assigned bug at a location
// ============================================
router.post('/:bugId/plant', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'BUG_ARCHITECT') {
      return res.status(403).json({ error: 'Bug Architect privileges required.' });
    }

    const { bugId } = req.params;
    const { location, structureType } = req.body;

    if (!location || typeof location !== 'string') {
      return res.status(400).json({ error: 'location is required.' });
    }
    if (!structureType || typeof structureType !== 'string') {
      return res.status(400).json({ error: 'structureType is required.' });
    }

    const bug = await prisma.bug.findUnique({ where: { id: bugId } });
    if (!bug) {
      return res.status(404).json({ error: 'Bug not found.' });
    }

    if (bug.architectUserId !== req.user.id) {
      return res.status(403).json({ error: 'This bug is not assigned to you.' });
    }

    if (bug.status === 'PLANTED') {
      return res.status(400).json({ error: 'Bug is already planted.' });
    }

    const updatedBug = await prisma.bug.update({
      where: { id: bugId },
      data: { status: 'PLANTED', location, structureType }
    });

    res.json({
      id: updatedBug.id,
      status: updatedBug.status,
      location: updatedBug.location,
      structureType: updatedBug.structureType
    });
  } catch (error) {
    console.error('Failed to plant bug', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
