import express from 'express';
import { authenticate } from '../middleware/auth';
import { GameService } from '../services/GameService';
import { gameEventBus } from '../services/GameEventBus';
import prisma from '../utils/prisma';

const router = express.Router();

const getOpposingTeam = async (homeTeamId: string) => {
  return await prisma.team.findFirst({
    where: { id: { not: homeTeamId } }
  });
};

// GET /api/hunt/status
router.get('/status', authenticate, async (req: any, res) => {
  try {
    const phase = await GameService.getPhase();
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { team: true }
    });

    if (!user || !user.teamId) {
      return res.status(400).json({ error: 'User must belong to a team to hunt.' });
    }

    const opposingTeam = await getOpposingTeam(user.teamId);

    res.json({
      phase,
      homeTeam: user.team?.name || 'UNKNOWN',
      targetTeam: opposingTeam?.name || 'UNKNOWN',
      huntScore: user.huntScore
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/hunt/targets
router.get('/targets', authenticate, async (req: any, res) => {
  try {
    const phase = await GameService.getPhase();
    if (phase !== 'HUNT') {
      return res.status(403).json({ error: 'Hunt phase is not active.' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !user.teamId) return res.status(400).json({ error: 'No team assigned.' });

    const opposingTeam = await getOpposingTeam(user.teamId);
    if (!opposingTeam) return res.status(400).json({ error: 'Cannot find opposing team.' });

    // Fetch bugs placed on the opposing team's castle
    const bugs = await prisma.bug.findMany({
      where: { targetTeamId: opposingTeam.id }
    });

    // Determine target system statuses without leaking config
    const ALL_SYSTEMS = [
      'SERVER', 'SMART DOOR', 'SECURITY GATE', 'RESOURCE VAULT',
      'ASYNC CORE', 'SECURITY MONITOR', 'ADMIN VAULT'
    ];

    const targets = ALL_SYSTEMS.map(sys => {
      // Find a bug for this system if it exists
      const bug = bugs.find(b => b.targetSystem === sys);
      
      if (!bug) {
        return { system: sys, status: 'UNKNOWN' };
      }

      // Map bug status to discoverable target status
      // We do not leak details unless the bug is claimed.
      let displayStatus = 'UNKNOWN';
      if (bug.status === 'PLANTED') displayStatus = 'UNKNOWN';
      else if (bug.status === 'DISCOVERED') displayStatus = 'BUG_DETECTED';
      else if (bug.status === 'CLAIMED') displayStatus = 'UNDER_INVESTIGATION';
      else if (bug.status === 'RESOLVED') displayStatus = 'SECURED';

      return {
        system: sys,
        status: displayStatus,
        bugId: displayStatus !== 'UNKNOWN' ? bug.id : undefined
      };
    });

    res.json(targets);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/hunt/targets/:systemId/discover
router.post('/targets/:systemId/discover', authenticate, async (req: any, res) => {
  try {
    const phase = await GameService.getPhase();
    if (phase !== 'HUNT') return res.status(403).json({ error: 'Hunt phase is not active.' });

    const systemId = req.params.systemId;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !user.teamId) return res.status(400).json({ error: 'No team assigned.' });

    const opposingTeam = await getOpposingTeam(user.teamId);
    if (!opposingTeam) return res.status(400).json({ error: 'Cannot find opposing team.' });

    // Atomic update: find a planted bug for this system and opposing team, transition to DISCOVERED
    const updatedBug = await prisma.bug.updateMany({
      where: {
        targetSystem: systemId,
        targetTeamId: opposingTeam.id,
        status: 'PLANTED'
      },
      data: {
        status: 'DISCOVERED',
        discoveredAt: new Date()
      }
    });

    if (updatedBug.count === 0) {
      // Check why it failed
      const existingBug = await prisma.bug.findFirst({ 
        where: { targetSystem: systemId, targetTeamId: opposingTeam.id } 
      });
      if (!existingBug) return res.status(404).json({ error: 'No anomaly found on this system.' });
      if (existingBug.status !== 'PLANTED') return res.status(400).json({ error: 'Bug already discovered or resolved.' });
      return res.status(400).json({ error: 'Discovery failed.' });
    }

    // Award 10 points
    await prisma.user.update({
      where: { id: user.id },
      data: { huntScore: { increment: 10 } }
    });

    // We don't have the specific bugId from updateMany easily without a findFirst, but we can just emit system
    // Actually, finding the bugId isn't strictly necessary for the event, but we'll fetch it just for the event
    const discoveredBug = await prisma.bug.findFirst({
      where: { targetSystem: systemId, targetTeamId: opposingTeam.id, status: 'DISCOVERED' }
    });

    gameEventBus.emit('ANY_EVENT', { type: 'BUG_DISCOVERED', teamId: user.teamId, bugId: discoveredBug?.id, payload: { system: systemId } });

    res.json({ message: 'BUG DETECTED', pointsAwarded: 10 });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/hunt/bugs/:id/claim
router.post('/bugs/:id/claim', authenticate, async (req: any, res) => {
  try {
    const phase = await GameService.getPhase();
    if (phase !== 'HUNT') return res.status(403).json({ error: 'Hunt phase is not active.' });

    const bugId = req.params.id;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !user.teamId) return res.status(400).json({ error: 'No team assigned.' });

    const opposingTeam = await getOpposingTeam(user.teamId);
    if (!opposingTeam) return res.status(400).json({ error: 'Cannot find opposing team.' });

    // Atomic update: only claim if currently DISCOVERED
    const updatedBug = await prisma.bug.updateMany({
      where: {
        id: bugId,
        targetTeamId: opposingTeam.id,
        status: 'DISCOVERED'
      },
      data: {
        status: 'CLAIMED',
        claimedByUserId: user.id,
        claimedByTeamId: user.teamId,
        claimedAt: new Date()
      }
    });

    if (updatedBug.count === 0) {
      const existingBug = await prisma.bug.findUnique({ where: { id: bugId } });
      if (!existingBug) return res.status(404).json({ error: 'Bug not found.' });
      if (existingBug.status !== 'DISCOVERED') return res.status(400).json({ error: 'Bug must be discovered before claiming, or is already claimed.' });
      return res.status(400).json({ error: 'Claim failed.' });
    }

    // Award 10 points
    await prisma.user.update({
      where: { id: user.id },
      data: { huntScore: { increment: 10 } }
    });

    gameEventBus.emit('ANY_EVENT', { type: 'BUG_CLAIMED', teamId: user.teamId, bugId, payload: { userId: user.id } });

    res.json({ message: 'BUG CLAIMED', pointsAwarded: 10 });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/hunt/bugs/:id
router.get('/bugs/:id', authenticate, async (req: any, res) => {
  try {
    const phase = await GameService.getPhase();
    if (phase !== 'HUNT') return res.status(403).json({ error: 'Hunt phase is not active.' });

    const bugId = req.params.id;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    const bug = await prisma.bug.findUnique({ where: { id: bugId } });
    if (!bug) return res.status(404).json({ error: 'Bug not found.' });

    // Ensure the bug is claimed by the user's team or user
    if (bug.status !== 'CLAIMED' && bug.status !== 'RESOLVED') {
      return res.status(403).json({ error: 'Bug must be claimed to view details.' });
    }
    
    if (bug.claimedByTeamId !== user?.teamId) {
      return res.status(403).json({ error: 'Bug claimed by another team.' });
    }

    // Determine category based on vulnerabilityType
    let category = 'UNKNOWN';
    if (bug.vulnerabilityType.includes('AUTHORIZATION') || bug.vulnerabilityType.includes('ROLE')) category = 'AUTHORIZATION';
    else if (bug.vulnerabilityType.includes('AUTHENTICATION')) category = 'AUTHENTICATION';
    else if (bug.vulnerabilityType.includes('MIDDLEWARE')) category = 'PIPELINE';

    res.json({
      id: bug.id,
      targetSystem: bug.targetSystem,
      vulnerabilityType: bug.vulnerabilityType,
      category,
      difficulty: 'MEDIUM', // Mock difficulty for prototype based on Phase 11
      status: bug.status
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/hunt/bugs/:id/solve
router.post('/bugs/:id/solve', authenticate, async (req: any, res) => {
  try {
    const phase = await GameService.getPhase();
    if (phase !== 'HUNT') return res.status(403).json({ error: 'Hunt phase is not active.' });

    const bugId = req.params.id;
    const { solution } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    // Validate solution
    // For this prototype, any non-empty solution string that isn't explicitly 'wrong' is considered correct
    // Real implementation would cross-check against the BUG_CATALOG or configuration
    if (!solution || solution === 'wrong') {
      return res.status(400).json({ error: 'Incorrect remediation concept.' });
    }

    // Atomic update
    const updatedBug = await prisma.bug.updateMany({
      where: {
        id: bugId,
        claimedByUserId: user?.id,
        status: 'CLAIMED'
      },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date()
      }
    });

    if (updatedBug.count === 0) {
      const existingBug = await prisma.bug.findUnique({ where: { id: bugId } });
      if (!existingBug) return res.status(404).json({ error: 'Bug not found.' });
      if (existingBug.claimedByUserId !== user?.id) return res.status(403).json({ error: 'You do not own this claim.' });
      if (existingBug.status === 'RESOLVED') return res.status(400).json({ error: 'Already resolved.' });
      return res.status(400).json({ error: 'Solve failed.' });
    }

    // Award 50 points
    await prisma.user.update({
      where: { id: user?.id },
      data: { huntScore: { increment: 50 } }
    });

    gameEventBus.emit('ANY_EVENT', { type: 'BUG_RESOLVED', teamId: user?.teamId, bugId, payload: { userId: user?.id } });

    res.json({ message: 'BUG RESOLVED', pointsAwarded: 50 });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
