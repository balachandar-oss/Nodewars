import express from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../utils/prisma';

const router = express.Router();

// The correct flag assembled from fragments (global)
const CORRECT_FLAG = 'MID_DL@EW#AR!';

// ============================================
// POST /api/flags/:gameId/validate - Game-specific flag validation
// ============================================
router.post('/:gameId/validate', authenticate, async (req: any, res) => {
  try {
    const { gameId } = req.params;
    const { flag } = req.body;
    const userId = req.user.id;

    if (!flag || typeof flag !== 'string') {
      return res.status(400).json({
        success: false,
        points: 0,
        message: 'Invalid flag format'
      });
    }

    // Verify game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { fragments: true }
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Get user's game score
    const gameScore = await (prisma as any).gameScore.findFirst({
      where: { gameId, userId }
    });

    if (!gameScore) {
      return res.status(400).json({
        success: false,
        message: 'User has not started this game'
      });
    }

    // Normalize and check flag
    const normalizedInput = flag.toUpperCase().trim();
    const isCorrect = normalizedInput === CORRECT_FLAG;

    if (isCorrect) {
      // Award 300 points to player
      await (prisma as any).gameScore.update({
        where: { id: gameScore.id },
        data: {
          score: { increment: 300 },
          royalRoomUnlocked: true
        }
      });

      return res.json({
        success: true,
        points: 300,
        message: 'FLAG VALIDATION SUCCESSFUL - ROYAL CHAMBER BREACHED'
      });
    } else {
      // Deduct 20 points for incorrect flag
      await (prisma as any).gameScore.update({
        where: { id: gameScore.id },
        data: {
          score: { increment: -20 }
        }
      });

      return res.json({
        success: false,
        points: -20,
        message: 'Flag validation failed. Access denied.'
      });
    }
  } catch (error) {
    console.error('Flag validation error', error);
    res.status(500).json({
      success: false,
      message: 'Server error during validation'
    });
  }
});

// POST /api/flags/validate
// Validate if the submitted flag is correct
router.post('/validate', authenticate, async (req: any, res) => {
  try {
    const { flag } = req.body;

    if (!flag || typeof flag !== 'string') {
      return res.status(400).json({
        correct: false,
        message: 'Invalid flag format'
      });
    }

    const normalizedInput = flag.toUpperCase().trim();
    const isCorrect = normalizedInput === CORRECT_FLAG;

    if (isCorrect) {
      // Award points to player and mark royal room as completed
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { team: true }
      });

      if (user && user.team) {
        // Add 300 points to team score
        await prisma.team.update({
          where: { id: user.team.id },
          data: {
            huntScore: { increment: 300 }
          }
        });

        // Mark royal room as completed for this user
        await (prisma.user.update as any)({
          where: { id: req.user.id },
          data: {
            royalRoomCompleted: true
          }
        }).catch(() => {});
      }

      return res.json({
        correct: true,
        message: 'FLAG VALIDATION SUCCESSFUL - ROYAL CHAMBER BREACHED',
        pointsAwarded: 300
      });
    } else {
      // Deduct 20 points from team
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { team: true }
      });

      if (user && user.team) {
        await prisma.team.update({
          where: { id: user.team.id },
          data: {
            huntScore: { increment: -20 }
          }
        });
      }

      return res.json({
        correct: false,
        message: 'Flag validation failed. Access denied.',
        pointsDeducted: 20
      });
    }
  } catch (error) {
    console.error('Flag validation error', error);
    res.status(500).json({
      correct: false,
      message: 'Server error during validation'
    });
  }
});

export default router;
