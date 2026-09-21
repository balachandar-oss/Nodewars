import express from 'express';
import { authenticate } from '../middleware/auth';
import { GameService } from '../services/GameService';
import { gameEventBus } from '../services/GameEventBus';
import prisma from '../utils/prisma';

const router = express.Router();

router.post('/scan', authenticate, async (req: any, res) => {
  try {
    const { physicalCode } = req.body;
    if (!physicalCode) {
      return res.status(400).json({ error: 'physicalCode is required' });
    }

    const phase = await GameService.getPhase();
    if (phase !== 'HUNT') {
      return res.status(403).json({ error: 'Hunt phase is not active.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { team: true }
    });

    if (!user || !user.teamId) {
      return res.status(400).json({ error: 'No team assigned.' });
    }

    const component = await prisma.castleComponent.findUnique({
      where: { physicalCode },
      include: { team: true }
    });

    if (!component) {
      return res.status(404).json({ error: 'Castle component not found.' });
    }

    if (component.teamId === user.teamId) {
      return res.status(403).json({ error: 'HOME CASTLE COMPONENT. NOT A VALID HUNT TARGET.' });
    }

    // Identify target safely without revealing bugs
    gameEventBus.emit('ANY_EVENT', {
      type: 'CASTLE_COMPONENT_SCANNED',
      teamId: user.teamId,
      bugId: undefined,
      payload: { systemId: component.systemId }
    });

    res.json({
      component: {
        systemId: component.systemId,
        displayName: component.displayName
      },
      team: component.team.name,
      state: 'UNKNOWN'
    });

  } catch (error) {
    console.error('Scan failed', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
