import express from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../utils/prisma';

const router = express.Router();

// GET /api/bugs/:bugId
// Get bug details (question, options, difficulty)
router.get('/bugs/:bugId', authenticate, async (req: any, res) => {
  try {
    const { bugId } = req.params;

    // Fetch the bug with its question and fragment
    const bug = await (prisma as any).bug.findUnique({
      where: { id: bugId },
      include: {
        bugQuestion: true,
        flagFragment: true,
        architectTeam: { select: { name: true } },
        targetTeam: { select: { name: true } }
      }
    });

    if (!bug) {
      return res.status(404).json({ error: 'Bug not found' });
    }

    // Return bug details (server-authoritative - no internal details)
    res.json({
      id: bug.id,
      difficulty: bug.difficulty || 'MEDIUM',
      structureType: bug.structureType || 'UNKNOWN',
      vulnerabilityType: bug.vulnerabilityType,
      targetSystem: bug.targetSystem,
      status: bug.status,
      question: bug.bugQuestion ? {
        text: bug.bugQuestion.text,
        options: bug.bugQuestion.options ? JSON.parse(bug.bugQuestion.options) : [],
        // correctAnswer is NOT included in response (server-authoritative validation)
      } : null,
      location: bug.location,
      createdAt: bug.createdAt
    });
  } catch (error) {
    console.error('Failed to fetch bug details', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/games/:gameId/available-bugs
// Fetch pre-generated bugs available for planting in a game
router.get('/games/:gameId/available-bugs', authenticate, async (req: any, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;

    // Verify user is a bug architect in this game
    const bugArchitect = await (prisma as any).bugArchitect.findFirst({
      where: { gameId, userId }
    });

    if (!bugArchitect) {
      return res.status(403).json({ error: 'Not authorized as bug architect for this game' });
    }

    // Fetch bugs that are pre-generated (have questions and fragments)
    // and haven't been planted yet (status is DRAFT)
    const bugs = await (prisma as any).bug.findMany({
      where: {
        gameId,
        questionId: { not: null },
        fragmentId: { not: null },
        status: 'DRAFT'
      },
      include: {
        bugQuestion: true,
        flagFragment: true
      },
      orderBy: { difficulty: 'asc' }
    });

    // Get the count of planted bugs by this architect
    const plantedCount = await prisma.bug.count({
      where: {
        gameId,
        architectUserId: userId,
        status: { not: 'DRAFT' }
      }
    });

    // Format the response
    const formattedBugs = bugs.map((bug: any) => ({
      id: bug.id,
      structureType: bug.structureType || 'UNKNOWN',
      difficulty: bug.difficulty || 'MEDIUM',
      question: bug.bugQuestion?.text || '',
      options: bug.bugQuestion?.options ? JSON.parse(bug.bugQuestion.options) : [],
      fragment: bug.flagFragment?.value || '',
      plantedAt: null
    }));

    res.json({
      bugs: formattedBugs,
      plantedCount,
      maxBugs: 20
    });
  } catch (error) {
    console.error('Failed to fetch available bugs', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/bugs/:bugId/plant
// Plant a bug at a specific location
router.post('/bugs/:bugId/plant', authenticate, async (req: any, res) => {
  try {
    const { bugId } = req.params;
    const { location, gameId } = req.body;
    const userId = req.user.id;

    if (!location || !gameId) {
      return res.status(400).json({ error: 'Location and gameId are required' });
    }

    // Verify location is valid
    const validLocations = ['ROOM', 'TOWER', 'CORRIDOR'];
    if (!validLocations.includes(location)) {
      return res.status(400).json({ error: 'Invalid location' });
    }

    // Verify user is a bug architect in this game
    const bugArchitect = await (prisma as any).bugArchitect.findFirst({
      where: { gameId, userId }
    });

    if (!bugArchitect) {
      return res.status(403).json({ error: 'Not authorized as bug architect for this game' });
    }

    // Verify bug exists and is available
    const bug = await (prisma as any).bug.findUnique({
      where: { id: bugId }
    });

    if (!bug) {
      return res.status(404).json({ error: 'Bug not found' });
    }

    if (bug.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Bug has already been planted' });
    }

    if ((bug as any).gameId !== gameId) {
      return res.status(400).json({ error: 'Bug does not belong to this game' });
    }

    // Check planting limit
    const plantedCount = await (prisma as any).bug.count({
      where: {
        gameId,
        architectUserId: userId,
        status: { not: 'DRAFT' }
      }
    });

    if (plantedCount >= 20) {
      return res.status(403).json({ error: 'Bug planting limit reached' });
    }

    // Update bug to PLANTED status with architect info and location
    const updatedBug = await (prisma as any).bug.update({
      where: { id: bugId },
      data: {
        status: 'PLANTED',
        architectUserId: userId,
        architectTeamId: bugArchitect.teamId,
        location
      }
    });

    // Update the architect's planted count
    await (prisma as any).bugArchitect.update({
      where: { id: bugArchitect.id },
      data: { bugsPlanted: { increment: 1 } }
    });

    res.json({
      id: updatedBug.id,
      status: updatedBug.status,
      location: updatedBug.location,
      plantedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to plant bug', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/bounties/:bugId/answer
// Submit an answer to a bounty question
router.post('/bounties/:bugId/answer', authenticate, async (req: any, res) => {
  try {
    const { bugId } = req.params;
    const { answer, timeRemaining } = req.body;
    const userId = req.user.id;

    if (!answer) {
      return res.status(400).json({ error: 'Answer is required' });
    }

    // Fetch the bug with its question
    const bug = await (prisma as any).bug.findUnique({
      where: { id: bugId },
      include: { bugQuestion: true, flagFragment: true }
    });

    if (!bug) {
      return res.status(404).json({ error: 'Bug not found' });
    }

    if (!bug.bugQuestion) {
      return res.status(400).json({ error: 'Bug has no question' });
    }

    // Verify the answer
    const isCorrect = answer.toUpperCase() === (bug as any).bugQuestion.correctAnswer.toUpperCase();

    // Calculate points based on difficulty and time remaining
    let points = 10; // Base points
    if (isCorrect) {
      const difficultyMultiplier: any = {
        'EASY': 1,
        'MEDIUM': 1.5,
        'HARD': 2,
        'CRITICAL': 3
      };
      const multiplier = difficultyMultiplier[(bug as any).difficulty] || 1;
      points = Math.round(10 * multiplier);

      // Bonus points for speed
      if (timeRemaining > 50) {
        points += 5; // Fast answer bonus
      }
    }

    // Update user's score in the game if applicable
    if ((bug as any).gameId) {
      const gameScore = await (prisma as any).gameScore.findFirst({
        where: { gameId: (bug as any).gameId, userId }
      });

      if (gameScore) {
        await (prisma as any).gameScore.update({
          where: { id: gameScore.id },
          data: {
            score: { increment: isCorrect ? points : -5 },
            bugsSolved: { increment: isCorrect ? 1 : 0 }
          }
        });
      }
    }

    // If correct, update bug status and return fragment
    if (isCorrect) {
      await (prisma as any).bug.update({
        where: { id: bugId },
        data: {
          status: 'CLAIMED',
          claimedByUserId: userId,
          claimedAt: new Date()
        }
      });

      return res.json({
        isCorrect: true,
        points,
        fragment: (bug as any).flagFragment?.value || '',
        message: 'Correct! Bug claimed and fragment unlocked.'
      });
    }

    // If incorrect, don't update bug status (player can try again)
    res.json({
      isCorrect: false,
      points: 0,
      penalty: 5,
      message: 'Incorrect answer. Try again!'
    });
  } catch (error) {
    console.error('Failed to process bounty answer', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
