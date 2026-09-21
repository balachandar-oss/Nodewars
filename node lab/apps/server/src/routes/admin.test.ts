import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import adminRoutes from './admin';

jest.mock('../utils/prisma', () => {
  return {
    __esModule: true,
    default: {
      team: {
        findUnique: jest.fn(),
        updateMany: jest.fn()
      },
      castleComponent: {
        upsert: jest.fn(),
        findMany: jest.fn()
      },
      user: {
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn()
      },
      bug: {
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn()
      },
      gameState: {
        findUnique: jest.fn(),
        upsert: jest.fn()
      },
      $transaction: jest.fn((callback) => {
        if (typeof callback === 'function') {
          return callback(prismaMock);
        }
        return Promise.all(callback);
      })
    }
  };
});

jest.mock('../services/GameService', () => {
  return {
    GameService: {
      transitionTo: jest.fn()
    }
  };
});

jest.mock('../services/LeaderboardService', () => {
  return {
    LeaderboardService: {
      getEligibleQuizScorers: jest.fn()
    }
  };
});

import prismaMock from '../utils/prisma';
import { GameService } from '../services/GameService';
import { LeaderboardService } from '../services/LeaderboardService';

const app = express();
app.use(express.json());
app.use('/admin', adminRoutes);

describe('Admin API', () => {
  const playerToken = jwt.sign({ id: 'user-1', role: 'PLAYER' }, process.env.JWT_SECRET || 'test-secret');
  const adminToken = jwt.sign({ id: 'admin-1', role: 'ADMIN' }, process.env.JWT_SECRET || 'test-secret');
  const instructorToken = jwt.sign({ id: 'instructor-1', role: 'INSTRUCTOR' }, process.env.JWT_SECRET || 'test-secret');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Phase transition', () => {
    it('rejects normal player from changing phase', async () => {
      const res = await request(app).post('/admin/game/start-hunt').set('Authorization', `Bearer ${playerToken}`);
      expect(res.status).toBe(403);
    });

    it('rejects INSTRUCTOR from changing phase', async () => {
      const res = await request(app).post('/admin/game/start-hunt').set('Authorization', `Bearer ${instructorToken}`);
      expect(res.status).toBe(403);
    });

    it('allows admin to change phase', async () => {
      (GameService.transitionTo as jest.Mock).mockResolvedValue('HUNT');
      const res = await request(app).post('/admin/game/start-hunt').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.phase).toBe('HUNT');
    });

    it('rejects start-placement for normal player', async () => {
      const res = await request(app).post('/admin/game/start-placement').set('Authorization', `Bearer ${playerToken}`);
      expect(res.status).toBe(403);
    });

    it('rejects start-placement for INSTRUCTOR', async () => {
      const res = await request(app).post('/admin/game/start-placement').set('Authorization', `Bearer ${instructorToken}`);
      expect(res.status).toBe(403);
    });

    it('allows admin to start-placement', async () => {
      (GameService.transitionTo as jest.Mock).mockResolvedValue('BUG_PLACEMENT');
      const res = await request(app).post('/admin/game/start-placement').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.phase).toBe('BUG_PLACEMENT');
      // Should have called transitionTo with 120000ms duration
      expect(GameService.transitionTo).toHaveBeenCalledWith('BUG_PLACEMENT', 120000);
    });
  });

  describe('Castle Seeding', () => {
    it('rejects normal player from seeding castle', async () => {
      const res = await request(app).post('/admin/seed-castle').set('Authorization', `Bearer ${playerToken}`);
      expect(res.status).toBe(403);
    });

    it('allows admin to seed castle components', async () => {
      (prismaMock.team.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'team-1', name: 'PRINCES' })
        .mockResolvedValueOnce({ id: 'team-2', name: 'PRINCESSES' });
      (prismaMock.castleComponent.upsert as jest.Mock).mockResolvedValue({});

      const res = await request(app).post('/admin/seed-castle').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.princesCount).toBe(7);
      expect(res.body.princessesCount).toBe(7);
    });
  });

  describe('Castle Components API', () => {
    it('rejects normal player', async () => {
      const res = await request(app).get('/admin/castle-components').set('Authorization', `Bearer ${playerToken}`);
      expect(res.status).toBe(403);
    });

    it('returns castle components for admin', async () => {
      (prismaMock.castleComponent.findMany as jest.Mock).mockResolvedValue([
        { id: '1', systemId: 'SERVER', team: { name: 'PRINCES' } }
      ]);
      const res = await request(app).get('/admin/castle-components').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body[0].systemId).toBe('SERVER');
    });
  });

  describe('Student Results API', () => {
    it('rejects student / player from viewing student results', async () => {
      const res = await request(app).get('/admin/student-results').set('Authorization', `Bearer ${playerToken}`);
      expect(res.status).toBe(403);
    });

    it('returns student results with quiz answers and mission progress for admin', async () => {
      (prismaMock.user.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'u-1',
          username: 'ch.sc.u4cys25002',
          name: 'Prince02',
          classification: 'PRINCE',
          rollNumber: 2,
          role: 'PLAYER',
          level: 1,
          xp: 100,
          huntScore: 0,
          team: { name: 'PRINCES' },
          progress: [
            { missionId: 'mission-01', status: 'COMPLETE', completedAt: new Date(), mission: { order: 1, title: 'FIRST SERVER' } }
          ],
          quizAttempts: [
            {
              isCompleted: true,
              score: 20,
              percentage: 100,
              correctAnswers: 4,
              totalQuestions: 4,
              completedAt: new Date(),
              questions: [
                {
                  order: 0,
                  questionId: 'q1',
                  submittedAnswer: 'http',
                  isCorrect: true,
                  question: { question: 'Module?', options: '[]', correctAnswer: 'http', points: 5, explanation: 'http' }
                }
              ]
            }
          ],
          plantedBugs: [],
          claimedBugs: []
        }
      ]);

      const res = await request(app).get('/admin/student-results').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].username).toBe('ch.sc.u4cys25002');
      expect(res.body[0].name).toBe('Prince02');
      expect(res.body[0].classification).toBe('PRINCE');
      expect(res.body[0].rollNumber).toBe(2);
      expect(res.body[0].passwordHash).toBeUndefined(); // Never exposed!
      expect(res.body[0].quiz.score).toBe(20);
      expect(res.body[0].quiz.questions[0].submittedAnswer).toBe('http');
      expect(res.body[0].quiz.questions[0].isCorrect).toBe(true);
    });
  });

  describe('POST /game/reveal-scores', () => {
    it('rejects normal player from revealing scores', async () => {
      const res = await request(app).post('/admin/game/reveal-scores').set('Authorization', `Bearer ${playerToken}`);
      expect(res.status).toBe(403);
    });

    it('rejects INSTRUCTOR from revealing scores', async () => {
      const res = await request(app).post('/admin/game/reveal-scores').set('Authorization', `Bearer ${instructorToken}`);
      expect(res.status).toBe(403);
    });

    it('promotes top 5 per team, assigns 1 bug each from seminar pool, and is atomic', async () => {
      (prismaMock.gameState.findUnique as jest.Mock).mockResolvedValue({ id: 'singleton', scoresRevealed: false });
      (prismaMock.team.findUnique as jest.Mock)
        .mockImplementation(async (args) => {
          if (args.where.name === 'PRINCES') return { id: 'team-princes-id', name: 'PRINCES' };
          if (args.where.name === 'PRINCESSES') return { id: 'team-princesses-id', name: 'PRINCESSES' };
          return null;
        });

      (LeaderboardService.getEligibleQuizScorers as jest.Mock)
        .mockImplementation(async (teamId, limit) => {
          if (teamId === 'team-princes-id') return ['p1', 'p2', 'p3', 'p4', 'p5'];
          if (teamId === 'team-princesses-id') return ['pr1', 'pr2', 'pr3', 'pr4', 'pr5'];
          return [];
        });

      const mockPrincesBugs = [1, 2, 3, 4, 5].map(i => ({
        id: `bug-p2p-${i}`,
        isSeminarPool: true,
        architectTeamId: 'team-princes-id',
        architectUserId: null,
        status: 'DRAFT',
        vulnerabilityType: 'MISSING_AUTHENTICATION',
        targetSystem: 'SMART DOOR'
      }));

      const mockPrincessesBugs = [1, 2, 3, 4, 5].map(i => ({
        id: `bug-pr2p-${i}`,
        isSeminarPool: true,
        architectTeamId: 'team-princesses-id',
        architectUserId: null,
        status: 'DRAFT',
        vulnerabilityType: 'ROLE_CHECK_FLAW',
        targetSystem: 'SERVER'
      }));

      (prismaMock.bug.findMany as jest.Mock)
        .mockImplementation(async (args) => {
          if (args.where.architectTeamId === 'team-princes-id') return mockPrincesBugs;
          if (args.where.architectTeamId === 'team-princesses-id') return mockPrincessesBugs;
          return [];
        });

      const res = await request(app).post('/admin/game/reveal-scores').set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.promotedCount).toBe(10);
      expect(res.body.assignments.length).toBe(10);

      // Verify each architect gets exactly one bug
      const assignedUserIds = res.body.assignments.map((a: any) => a.userId);
      const assignedBugIds = res.body.assignments.map((a: any) => a.bugId);
      expect(new Set(assignedUserIds).size).toBe(10);
      expect(new Set(assignedBugIds).size).toBe(10); // No bug assigned twice

      // Verify 1-to-1 updates were called in the transaction
      expect(prismaMock.user.update).toHaveBeenCalledTimes(10);
      expect(prismaMock.bug.update).toHaveBeenCalledTimes(10);
      expect(prismaMock.gameState.upsert).toHaveBeenCalledWith({
        where: { id: 'singleton' },
        update: { scoresRevealed: true },
        create: { id: 'singleton', scoresRevealed: true, phase: 'ENGINEERING' }
      });
    });

    it('gracefully handles fewer than 5 eligible scorers on a team', async () => {
      (prismaMock.gameState.findUnique as jest.Mock).mockResolvedValue({ id: 'singleton', scoresRevealed: false });
      (prismaMock.team.findUnique as jest.Mock)
        .mockImplementation(async (args) => {
          if (args.where.name === 'PRINCES') return { id: 'team-princes-id', name: 'PRINCES' };
          if (args.where.name === 'PRINCESSES') return { id: 'team-princesses-id', name: 'PRINCESSES' };
          return null;
        });

      (LeaderboardService.getEligibleQuizScorers as jest.Mock)
        .mockImplementation(async (teamId, limit) => {
          if (teamId === 'team-princes-id') return ['p1', 'p2']; // only 2 eligible
          if (teamId === 'team-princesses-id') return ['pr1']; // only 1 eligible
          return [];
        });

      (prismaMock.bug.findMany as jest.Mock).mockResolvedValue([
        { id: 'bug-1', vulnerabilityType: 'AUTH', targetSystem: 'SYS' },
        { id: 'bug-2', vulnerabilityType: 'AUTH', targetSystem: 'SYS' },
        { id: 'bug-3', vulnerabilityType: 'AUTH', targetSystem: 'SYS' }
      ]);

      const res = await request(app).post('/admin/game/reveal-scores').set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.promotedCount).toBe(3);
      expect(res.body.assignments.length).toBe(3);
    });

    it('is idempotent: repeated call returns existing state without re-selecting architects', async () => {
      (prismaMock.gameState.findUnique as jest.Mock).mockResolvedValue({ id: 'singleton', scoresRevealed: true });
      (prismaMock.user.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'p1',
          username: 'ch.sc.u4cys25002',
          role: 'BUG_ARCHITECT',
          team: { name: 'PRINCES' },
          plantedBugs: [{ id: 'bug-p2p-1', vulnerabilityType: 'VULN', targetSystem: 'SYS' }]
        }
      ]);

      const res = await request(app).post('/admin/game/reveal-scores').set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.alreadyRevealed).toBe(true);
      expect(res.body.promotedCount).toBe(1);
      expect(res.body.assignments[0].bugId).toBe('bug-p2p-1');
      // No updates called because it returned existing state
      expect(prismaMock.user.update).not.toHaveBeenCalled();
      expect(prismaMock.bug.update).not.toHaveBeenCalled();
    });

    it('rolls back completely if transaction fails', async () => {
      (prismaMock.gameState.findUnique as jest.Mock).mockResolvedValue({ id: 'singleton', scoresRevealed: false });
      (prismaMock.team.findUnique as jest.Mock).mockResolvedValue({ id: 't1', name: 'PRINCES' });
      (LeaderboardService.getEligibleQuizScorers as jest.Mock).mockResolvedValue(['p1']);
      
      // Simulate transaction throwing an error
      (prismaMock.$transaction as jest.Mock).mockRejectedValueOnce(new Error('DB failure during bug assignment'));

      const res = await request(app).post('/admin/game/reveal-scores').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Server error');
    });
  });

  describe('POST /game/restart', () => {
    it('rejects normal player from restarting game', async () => {
      const res = await request(app).post('/admin/game/restart').set('Authorization', `Bearer ${playerToken}`);
      expect(res.status).toBe(403);
    });

    it('rejects INSTRUCTOR from restarting game', async () => {
      const res = await request(app).post('/admin/game/restart').set('Authorization', `Bearer ${instructorToken}`);
      expect(res.status).toBe(403);
    });

    it('demotes architects and resets seminar pool bugs back to unassigned DRAFT', async () => {
      const res = await request(app).post('/admin/game/restart').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);

      expect(prismaMock.user.updateMany).toHaveBeenCalledWith({
        where: { role: 'BUG_ARCHITECT' },
        data: { role: 'PLAYER' }
      });

      expect(prismaMock.bug.updateMany).toHaveBeenCalledWith({
        where: { isSeminarPool: true },
        data: expect.objectContaining({
          status: 'DRAFT',
          architectUserId: null
        })
      });

      expect(prismaMock.gameState.upsert).toHaveBeenCalledWith(expect.objectContaining({
        update: expect.objectContaining({ scoresRevealed: false })
      }));
    });
  });
});
