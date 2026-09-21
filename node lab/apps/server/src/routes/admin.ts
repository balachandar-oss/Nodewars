import express from 'express';
import { authenticate } from '../middleware/auth';
import { GameService } from '../services/GameService';
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

    const omega = await prisma.team.findUnique({ where: { name: 'TEAM OMEGA' } });
    const beta = await prisma.team.findUnique({ where: { name: 'TEAM BETA' } });

    if (!omega || !beta) {
      return res.status(400).json({ error: 'Teams not found. Seed teams first.' });
    }

    const createComponents = async (teamId: string, teamName: string) => {
      const components = [];
      for (const sys of SYSTEM_IDS) {
        // e.g. NW:T:OMEGA:S:SECURITY_GATE
        const shortTeam = teamName === 'TEAM OMEGA' ? 'OMEGA' : 'BETA';
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

export default router;
