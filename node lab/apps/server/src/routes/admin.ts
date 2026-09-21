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
    const newPhase = await GameService.transitionTo('BUG_PLACEMENT', 120000);
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

    const princes = await prisma.team.findUnique({ where: { name: 'PRINCES' } });
    const princesses = await prisma.team.findUnique({ where: { name: 'PRINCESSES' } });

    if (!princes || !princesses) {
      return res.status(400).json({ error: 'Teams not found. Seed teams first.' });
    }

    const createComponents = async (teamId: string, teamName: string) => {
      const components = [];
      for (const sys of SYSTEM_IDS) {
        // e.g. NW:T:PRINCES:S:SECURITY_GATE or NW:T:PRINCESSES:S:SECURITY_GATE
        const shortTeam = teamName === 'PRINCES' ? 'PRINCES' : 'PRINCESSES';
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

    const princesComps = await createComponents(princes.id, princes.name);
    const princessesComps = await createComponents(princesses.id, princesses.name);

    res.json({ message: 'Castle components seeded', princesCount: princesComps.length, princessesCount: princessesComps.length });
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

// GET /api/admin/student-results - Admin view of all seminar participants, mission progress, and quiz answers
router.get('/student-results', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const users = await prisma.user.findMany({
      include: {
        team: true,
        progress: {
          include: {
            mission: {
              select: {
                id: true,
                order: true,
                title: true
              }
            }
          },
          orderBy: { mission: { order: 'asc' } }
        },
        quizAttempts: {
          include: {
            questions: {
              include: {
                question: true
              },
              orderBy: { order: 'asc' }
            }
          }
        },
        plantedBugs: true,
        claimedBugs: true
      },
      orderBy: [
        { rollNumber: 'asc' },
        { username: 'asc' }
      ]
    });

    const results = users.map(u => {
      const quizAttempt = u.quizAttempts[0] || null;
      const completedMissionsCount = u.progress.filter(p => p.status === 'COMPLETE').length;

      return {
        id: u.id,
        username: u.username,
        name: u.name,
        classification: u.classification,
        rollNumber: u.rollNumber,
        role: u.role,
        team: u.team?.name || 'UNASSIGNED',
        level: u.level,
        xp: u.xp,
        huntScore: u.huntScore,
        missionsCompleted: completedMissionsCount,
        progress: u.progress.map(p => ({
          missionId: p.missionId,
          order: p.mission.order,
          title: p.mission.title,
          status: p.status,
          completedAt: p.completedAt
        })),
        plantedBugsCount: u.plantedBugs.length,
        claimedBugsCount: u.claimedBugs.length,
        quiz: quizAttempt ? {
          isCompleted: quizAttempt.isCompleted,
          score: quizAttempt.score,
          percentage: quizAttempt.percentage,
          correctAnswers: quizAttempt.correctAnswers,
          totalQuestions: quizAttempt.totalQuestions,
          completedAt: quizAttempt.completedAt,
          questions: quizAttempt.questions.map(aq => ({
            order: aq.order + 1,
            questionId: aq.questionId,
            questionText: aq.question.question,
            options: aq.question.options,
            submittedAnswer: aq.submittedAnswer,
            correctAnswer: aq.question.correctAnswer,
            isCorrect: aq.isCorrect,
            points: aq.question.points,
            explanation: aq.question.explanation
          }))
        } : null
      };
    });

    res.json(results);
  } catch (error) {
    console.error('Failed to fetch student results', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// POST /api/admin/game/reveal-scores
// Atomic + Idempotent reveal of scores and promotion of Top 5 quiz scorers per team to BUG_ARCHITECT.
// Assigns exactly 1 dedicated seminar DRAFT bug (isSeminarPool = true) to each promoted architect.
// ============================================
router.post('/game/reveal-scores', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    // 1. Idempotency Check: if scores were already revealed, do NOT select new architects or reshuffle bugs.
    const currentState = await prisma.gameState.findUnique({
      where: { id: 'singleton' }
    });

    if (currentState?.scoresRevealed) {
      // Return existing promotions and assignments
      const existingArchitects = await prisma.user.findMany({
        where: { role: 'BUG_ARCHITECT' },
        include: {
          team: true,
          plantedBugs: {
            where: { isSeminarPool: true }
          }
        },
        orderBy: { rollNumber: 'asc' }
      });

      const assignments = existingArchitects.flatMap(u =>
        u.plantedBugs.map(b => ({
          userId: u.id,
          username: u.username,
          team: u.team?.name,
          bugId: b.id,
          vulnerabilityType: b.vulnerabilityType,
          targetSystem: b.targetSystem
        }))
      );

      return res.json({
        message: 'Scores already revealed. Returning existing Bug Architect assignments.',
        alreadyRevealed: true,
        promotedCount: existingArchitects.length,
        promotedUsers: existingArchitects.map(u => u.id),
        assignments
      });
    }

    // 2. Fetch authoritative teams
    const princes = await prisma.team.findUnique({ where: { name: 'PRINCES' } });
    const princesses = await prisma.team.findUnique({ where: { name: 'PRINCESSES' } });

    if (!princes || !princesses) {
      return res.status(400).json({ error: 'Teams not configured' });
    }

    // 3. Deterministic candidate selection (top 5 per team, tie-break enforced)
    const princesTop5 = await LeaderboardService.getEligibleQuizScorers(princes.id, 5);
    const princessesTop5 = await LeaderboardService.getEligibleQuizScorers(princesses.id, 5);

    const allPromotedUserIds = [...princesTop5, ...princessesTop5];

    // 4. Atomic Transaction: Promote + 1-to-1 Assign from dedicated seminar pool + mark scoresRevealed
    const transactionResult = await prisma.$transaction(async (tx) => {
      // A. Promote candidates
      for (const userId of allPromotedUserIds) {
        await tx.user.update({
          where: { id: userId },
          data: { role: 'BUG_ARCHITECT' }
        });
      }

      // B. Fetch dedicated, unassigned seminar bugs (isSeminarPool = true, architectUserId = null, status = 'DRAFT')
      const princesDraftBugs = await tx.bug.findMany({
        where: {
          isSeminarPool: true,
          architectTeamId: princes.id,
          architectUserId: null,
          status: 'DRAFT'
        },
        orderBy: { id: 'asc' }
      });

      const princessesDraftBugs = await tx.bug.findMany({
        where: {
          isSeminarPool: true,
          architectTeamId: princesses.id,
          architectUserId: null,
          status: 'DRAFT'
        },
        orderBy: { id: 'asc' }
      });

      const assignBugs = async (userIds: string[], bugs: typeof princesDraftBugs) => {
        const assigned = [];
        const count = Math.min(userIds.length, bugs.length);
        for (let i = 0; i < count; i++) {
          const userId = userIds[i];
          const bug = bugs[i];
          await tx.bug.update({
            where: { id: bug.id },
            data: { architectUserId: userId }
          });
          assigned.push({
            userId,
            bugId: bug.id,
            vulnerabilityType: bug.vulnerabilityType,
            targetSystem: bug.targetSystem
          });
        }
        return assigned;
      };

      const princesAssignments = await assignBugs(princesTop5, princesDraftBugs);
      const princessesAssignments = await assignBugs(princessesTop5, princessesDraftBugs);

      // C. Set scoresRevealed = true on GameState
      await tx.gameState.upsert({
        where: { id: 'singleton' },
        update: { scoresRevealed: true },
        create: { id: 'singleton', scoresRevealed: true, phase: 'ENGINEERING' }
      });

      return [...princesAssignments, ...princessesAssignments];
    });

    res.json({
      message: 'Scores revealed. Top quiz scorers promoted to Bug Architects and assigned one dedicated seminar bug each.',
      promotedCount: allPromotedUserIds.length,
      promotedUsers: allPromotedUserIds,
      assignments: transactionResult
    });
  } catch (error) {
    console.error('Failed to reveal scores', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// POST /api/admin/game/restart
// Reset scores, demote architects back to PLAYER, and unassign the 10 dedicated seminar pool bugs back to DRAFT.
// Mission progress, quiz attempts, and student identities remain untouched.
// ============================================
router.post('/game/restart', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    await prisma.$transaction(async (tx) => {
      // Demote promoted BUG_ARCHITECTs back to PLAYER
      await tx.user.updateMany({
        where: { role: 'BUG_ARCHITECT' },
        data: { role: 'PLAYER' }
      });

      // Reset only the 10 dedicated seminar pool bugs
      await tx.bug.updateMany({
        where: { isSeminarPool: true },
        data: {
          status: 'DRAFT',
          architectUserId: null,
          location: null,
          claimedByUserId: null,
          claimedByTeamId: null,
          discoveredAt: null,
          claimedAt: null,
          resolvedAt: null
        }
      });

      // Reset hunt scores
      await tx.team.updateMany({ data: { huntScore: 0 } });
      await tx.user.updateMany({ data: { huntScore: 0 } });

      // Reset game state
      await tx.gameState.upsert({
        where: { id: 'singleton' },
        update: {
          phase: 'ENGINEERING',
          scoresRevealed: false,
          placementEndsAt: null
        },
        create: {
          id: 'singleton',
          phase: 'ENGINEERING',
          scoresRevealed: false
        }
      });
    });

    // Also cancel the timer if it's running. Since GameService isn't easily reachable
    // inside the transaction to cancel the timeout immediately and reliably, we just
    // call transitionTo('ENGINEERING') which clears the timer. Wait, transitionTo
    // already does the DB update. Let's refactor slightly to just call transitionTo.
    await GameService.transitionTo('ENGINEERING');

    res.json({
      message: 'Game restarted: Bug Architects demoted, seminar pool bugs reset to unassigned DRAFT, scoresRevealed reset.'
    });
  } catch (error) {
    console.error('Failed to restart game', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
