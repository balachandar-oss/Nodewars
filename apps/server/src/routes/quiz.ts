import express from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../utils/prisma';

const router = express.Router();

// GET /api/quiz/results
router.get('/results', authenticate, async (req: any, res) => {
  try {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { userId: req.user.id },
      include: {
        questions: {
          include: {
            question: true
          }
        }
      }
    });

    if (!attempt) {
      return res.status(404).json({ error: 'No quiz attempt found' });
    }

    if (!attempt.isCompleted) {
      return res.status(400).json({ error: 'Quiz attempt not completed yet' });
    }

    res.json(attempt);
  } catch (error) {
    console.error('Failed to get quiz results', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/quiz/start
router.post('/start', authenticate, async (req: any, res) => {
  try {
    // 1. Check the last core mission is completed (was hardcoded to 'mission-07',
    // which no longer exists after the lab was cut down to 4 core missions -
    // look up the real last core mission by order instead of a hardcoded id).
    const lastCoreMission = await prisma.mission.findFirst({
      where: { isBonus: false },
      orderBy: { order: 'desc' }
    });

    const lastCoreProgress = lastCoreMission
      ? await prisma.missionProgress.findUnique({
          where: {
            userId_missionId: {
              userId: req.user.id,
              missionId: lastCoreMission.id
            }
          }
        })
      : null;

    const coreDone = !lastCoreMission || (lastCoreProgress && lastCoreProgress.status === 'COMPLETE');

    // 1a. The capstone (combining all four concepts) must also be completed
    // before the quiz unlocks, if it exists.
    const capstoneMission = await prisma.mission.findUnique({ where: { id: 'capstone' } });
    const capstoneProgress = capstoneMission
      ? await prisma.missionProgress.findUnique({
          where: { userId_missionId: { userId: req.user.id, missionId: 'capstone' } }
        })
      : null;
    const capstoneDone = !capstoneMission || capstoneProgress?.status === 'COMPLETE';

    const isUnlocked = coreDone && capstoneDone;

    if (!isUnlocked && req.user?.role !== 'DEMO' && req.user?.role !== 'ADMIN' && req.user?.role !== 'INSTRUCTOR') {
      return res.status(403).json({ error: coreDone ? 'Quiz Locked. Complete The Build first.' : 'Quiz Locked. Complete all missions first.' });
    }

    // 1b. The quiz only runs during the admin-controlled synchronized session.
    const session = await prisma.gameState.findUnique({ where: { id: 'singleton' } });
    if (session?.phase !== 'QUIZ_ACTIVE' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: session?.phase === 'QUIZ_ENDED' ? 'The quiz has already ended.' : 'The quiz has not started yet. Wait for your admin to begin it.' });
    }

    // 2. Check for existing attempt
    let attempt = await prisma.quizAttempt.findUnique({
      where: { userId: req.user.id },
      include: {
        questions: {
          include: {
            question: {
              select: {
                  id: true,
                  question: true,
                  options: true,
                  points: true,
                  difficulty: true,
                  type: true
                }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (attempt) {
      // Return existing attempt. Correct answers are omitted due to the select clause above.
      return res.json({
        attemptId: attempt.id,
        isCompleted: attempt.isCompleted,
        questions: attempt.questions
      });
    }

    // 3. Create new attempt
    // Only quiz on core (non-bonus) missions - bonus mission content isn't
    // taught in the live session, so it shouldn't be tested.
    const coreMissions = await prisma.mission.findMany({
      where: { isBonus: false },
      select: { id: true }
    });
    const coreMissionIds = coreMissions.map(m => m.id);

    const allQuestions = await prisma.quizQuestion.findMany({
      where: { missionId: { in: coreMissionIds } }
    });

    // Shuffle - all questions in the pool are used (curated to ~12 for the rapid quiz)
    const selectedQuestions = allQuestions.sort(() => 0.5 - Math.random());

    // Create the attempt in a transaction
    attempt = await prisma.$transaction(async (tx) => {
      const newAttempt = await tx.quizAttempt.create({
        data: {
          userId: req.user.id,
          totalQuestions: selectedQuestions.length
        }
      });

      // Create AttemptQuestions
      for (let i = 0; i < selectedQuestions.length; i++) {
        await tx.attemptQuestion.create({
          data: {
            attemptId: newAttempt.id,
            questionId: selectedQuestions[i].id,
            order: i
          }
        });
      }

      return await tx.quizAttempt.findUnique({
        where: { id: newAttempt.id },
        include: {
          questions: {
            include: {
              question: {
                select: {
                  id: true,
                  question: true,
                  options: true,
                  points: true,
                  difficulty: true,
                  type: true
                }
              }
            },
            orderBy: { order: 'asc' }
          }
        }
      });
    }) as any;

    res.json({
      attemptId: attempt!.id,
      isCompleted: false,
      questions: attempt!.questions
    });

  } catch (error) {
    console.error('Failed to start quiz', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/quiz/submit
router.post('/submit', authenticate, async (req: any, res) => {
  const { attemptId, answers } = req.body; // answers is { questionId: string, answer: string }[]

  try {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        questions: {
          include: {
            question: true
          }
        }
      }
    });

    if (!attempt || attempt.userId !== req.user.id) {
      return res.status(403).json({ error: 'Invalid attempt' });
    }

    if (attempt.isCompleted) {
      return res.status(400).json({ error: 'Attempt already completed' });
    }

    let score = 0;
    let correctAnswers = 0;
    const maxScore = attempt.questions.reduce((sum, q) => sum + q.question.points, 0);

    // Score answers and update
    await prisma.$transaction(async (tx) => {
      for (const aq of attempt.questions) {
        const submitted = answers.find((a: any) => a.questionId === aq.questionId);
        const submittedAnswer = submitted ? submitted.answer : null;
        const isCorrect = submittedAnswer === aq.question.correctAnswer;

        if (isCorrect) {
          score += aq.question.points;
          correctAnswers += 1;
        }

        await tx.attemptQuestion.update({
          where: { id: aq.id },
          data: {
            submittedAnswer,
            isCorrect
          }
        });
      }

      const percentage = (score / maxScore) * 100;

      await tx.quizAttempt.update({
        where: { id: attemptId },
        data: {
          isCompleted: true,
          score,
          percentage,
          correctAnswers,
          completedAt: new Date()
        }
      });
    });

    // Fetch the final graded attempt to return
    const gradedAttempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        questions: {
          include: {
            question: true
          }
        }
      }
    });

    res.json(gradedAttempt);
  } catch (error) {
    console.error('Failed to submit quiz', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/quiz/eligibility
router.get('/eligibility', authenticate, async (req: any, res) => {
  try {
    const { LeaderboardService } = await import('../services/LeaderboardService');
    const eligibility = await LeaderboardService.getEligibility(req.user.id);
    res.json(eligibility);
  } catch (error) {
    console.error('Failed to get eligibility', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/quiz/team-results - which team (PRINCE or PRINCESS) is winning/won,
// with every student's score (ranked by score, then by who submitted first).
// Admin-only - students never see scores or the team leaderboard.
router.get('/team-results', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin privileges required' });
    const { LeaderboardService } = await import('../services/LeaderboardService');
    const rankings = await LeaderboardService.getRankings();

    const teams: Record<string, { total: number; students: any[] }> = {
      PRINCE: { total: 0, students: [] },
      PRINCESS: { total: 0, students: [] }
    };

    for (const entry of rankings) {
      const teamName = entry.teamName;
      if (!teams[teamName]) continue;
      teams[teamName].total += entry.score;
      teams[teamName].students.push({
        username: entry.username,
        score: entry.score,
        percentage: entry.percentage,
        teamRank: entry.teamRank
      });
    }

    let winner: string | 'TIE' = 'TIE';
    if (teams.PRINCE.total > teams.PRINCESS.total) winner = 'PRINCE';
    else if (teams.PRINCESS.total > teams.PRINCE.total) winner = 'PRINCESS';

    res.json({ winner, teams });
  } catch (error) {
    console.error('Failed to get team results', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

