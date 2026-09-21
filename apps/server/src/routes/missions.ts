import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { gameEventBus } from '../services/GameEventBus';

const router = Router();

// Get all missions (basic info)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const missions = await prisma.mission.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        order: true,
        difficulty: true,
        xpReward: true,
        unlockComponent: true,
      }
    });

    res.json(missions);
  } catch (error) {
    console.error('Fetch missions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific mission details
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const mission = await prisma.mission.findUnique({
      where: { id }
    });

    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    // Check if the user is allowed to access this mission (i.e. it's not locked)
    // For now we allow fetching the definition, but progress determines if they can play it.

    res.json(mission);
  } catch (error) {
    console.error('Fetch mission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

import { executionService } from '../services/ExecutionService';

// Get user progress for a specific mission
router.get('/:id/progress', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let progress = await prisma.missionProgress.findUnique({
      where: {
        userId_missionId: {
          userId,
          missionId: id
        }
      }
    });

    if (!progress) {
      const mission = await prisma.mission.findUnique({ where: { id } });
      if (!mission) {
        return res.status(404).json({ error: 'Mission not found' });
      }

      progress = await prisma.missionProgress.create({
        data: {
          userId,
          missionId: id,
          status: mission.order === 1 ? 'ACTIVE' : 'LOCKED'
        }
      });
    }

    res.json(progress);
  } catch (error) {
    console.error('Fetch mission progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Trigger a lab entry event for real-time demonstration
router.post('/:id/enter', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Only allow for Mission 06 and onwards for the demo
    const mission = await prisma.mission.findUnique({ where: { id } });
    if (!mission) return res.status(404).json({ error: 'Mission not found' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Validate progress (must be ACTIVE or COMPLETE) for regular users, DEMO bypasses
    const progress = await prisma.missionProgress.findUnique({
      where: { userId_missionId: { userId, missionId: id } }
    });

    if (req.user?.role === 'DEMO' || req.user?.role === 'ADMIN' || (progress && progress.status !== 'LOCKED')) {
      // Emit the event to the bus
      gameEventBus.emitEvent({
        type: 'PLAYER_ENTERED',
        playerId: user.username, // using username for display
        teamId: user.teamId || undefined,
        timestamp: new Date().toISOString(),
        metadata: { missionTitle: mission.title }
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Mission enter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Run mission evaluation
router.post('/:id/run', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { code } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ error: 'Valid code input is required' });
    }

    // 1. Verify mission exists and user has access
    const mission = await prisma.mission.findUnique({ where: { id } });
    if (!mission) return res.status(404).json({ error: 'Mission not found' });

    const progress = await prisma.missionProgress.findUnique({
      where: { userId_missionId: { userId, missionId: id } }
    });

    if (!progress || progress.status === 'LOCKED') {
      if (req.user?.role !== 'DEMO' && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Mission is locked' });
      }
    }

    // 2. Evaluate Code
    const evaluation = await executionService.run(id, code);

    // 3. Handle Success & Progression
    if (evaluation.success && (!progress || progress.status !== 'COMPLETE')) {
      // Use transaction to prevent duplicate XP awards and update progress atomically
      await prisma.$transaction(async (tx) => {
        // Mark current mission as COMPLETE
        await tx.missionProgress.upsert({
          where: { userId_missionId: { userId, missionId: id } },
          update: { status: 'COMPLETE', completedAt: new Date() },
          create: { userId, missionId: id, status: 'COMPLETE', completedAt: new Date() }
        });

        // Award XP and update user stats
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (user) {
          const newXp = user.xp + mission.xpReward;
          // Calculate new level (Level up every 200 XP for now, based on dashboard logic)
          const newLevel = Math.floor(newXp / 200) + 1; 

          await tx.user.update({
            where: { id: userId },
            data: {
              xp: newXp,
              level: newLevel,
              missionsCompleted: user.missionsCompleted + 1
            }
          });
        }

        // Unlock next mission (order + 1)
        const nextMission = await tx.mission.findFirst({
          where: { order: mission.order + 1 }
        });

        if (nextMission) {
          await tx.missionProgress.upsert({
            where: { userId_missionId: { userId, missionId: nextMission.id } },
            update: { status: 'ACTIVE' },
            create: { userId, missionId: nextMission.id, status: 'ACTIVE' }
          });
        }
      });
    }

    res.json(evaluation);
  } catch (error) {
    console.error('Mission run error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
