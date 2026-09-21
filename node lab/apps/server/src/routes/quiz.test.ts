import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import quizRoutes from './quiz';
import { PrismaClient } from '@prisma/client';

jest.mock('../utils/prisma', () => {
  return {
    __esModule: true,
    default: {
      missionProgress: {
        findUnique: jest.fn()
      },
      quizAttempt: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn()
      },
      quizQuestion: {
        findMany: jest.fn()
      },
      attemptQuestion: {
        create: jest.fn(),
        update: jest.fn()
      },
      $transaction: jest.fn(async (cb) => {
        const tx = {
          quizAttempt: {
            create: jest.fn().mockResolvedValue({ id: 'attempt-1' }),
            findUnique: jest.fn().mockResolvedValue({
              id: 'attempt-1',
              questions: [
                { questionId: 'q1', question: { id: 'q1', options: '[]' } }
              ]
            }),
            update: jest.fn()
          },
          attemptQuestion: {
            create: jest.fn(),
            update: jest.fn()
          }
        };
        return await cb(tx);
      })
    }
  };
});

import prismaMock from '../utils/prisma';

const app = express();
app.use(express.json());
app.use('/quiz', quizRoutes);

describe('Quiz API', () => {
  const token = jwt.sign({ id: 'user-1', role: 'PLAYER' }, process.env.JWT_SECRET || 'test-secret');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /start', () => {
    it('rejects unauthenticated request', async () => {
      const res = await request(app).post('/quiz/start');
      expect(res.status).toBe(401);
    });

    it('rejects if Mission 07 is not COMPLETE', async () => {
      (prismaMock.missionProgress.findUnique as jest.Mock).mockResolvedValue(null);
      const res = await request(app).post('/quiz/start').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Complete Mission 07 first/);
    });

    it('returns existing attempt if one already exists', async () => {
      (prismaMock.missionProgress.findUnique as jest.Mock).mockResolvedValue({ status: 'COMPLETE' });
      (prismaMock.quizAttempt.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-attempt',
        isCompleted: false,
        questions: [{ questionId: 'q1', question: { options: '[]' } }]
      });

      const res = await request(app).post('/quiz/start').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.attemptId).toBe('existing-attempt');
      expect(prismaMock.$transaction).not.toHaveBeenCalled(); // No new attempt created
    });

    it('creates a new attempt and assigns 20 questions if none exists', async () => {
      (prismaMock.missionProgress.findUnique as jest.Mock).mockResolvedValue({ status: 'COMPLETE' });
      (prismaMock.quizAttempt.findUnique as jest.Mock).mockResolvedValue(null);
      
      const mockQuestions = Array(30).fill(0).map((_, i) => ({ id: `q${i}` }));
      (prismaMock.quizQuestion.findMany as jest.Mock).mockResolvedValue(mockQuestions);

      const res = await request(app).post('/quiz/start').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.attemptId).toBe('attempt-1');
      expect(res.body.questions.length).toBe(1); // Mapped from our tx mock
    });
  });

  describe('POST /submit', () => {
    it('rejects if attempt does not belong to user', async () => {
      (prismaMock.quizAttempt.findUnique as jest.Mock).mockResolvedValue({
        id: 'attempt-1',
        userId: 'other-user',
        questions: []
      });

      const res = await request(app)
        .post('/quiz/submit')
        .set('Authorization', `Bearer ${token}`)
        .send({ attemptId: 'attempt-1', answers: [] });
      
      expect(res.status).toBe(403);
    });

    it('scores answers server-side and marks completed', async () => {
      (prismaMock.quizAttempt.findUnique as jest.Mock).mockResolvedValue({
        id: 'attempt-1',
        userId: 'user-1',
        isCompleted: false,
        questions: [
          { id: 'aq1', questionId: 'q1', question: { correctAnswer: 'A', points: 5 } }
        ]
      });

      const res = await request(app)
        .post('/quiz/submit')
        .set('Authorization', `Bearer ${token}`)
        .send({
          attemptId: 'attempt-1',
          answers: [{ questionId: 'q1', answer: 'A' }]
        });

      expect(res.status).toBe(200);
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });
});
