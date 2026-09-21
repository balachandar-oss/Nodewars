import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import leaderboardRoutes from './leaderboard';
import { PrismaClient } from '@prisma/client';

jest.mock('../utils/prisma', () => {
  return {
    __esModule: true,
    default: {
      quizAttempt: {
        findMany: jest.fn()
      }
    }
  };
});

import prismaMock from '../utils/prisma';

const app = express();
app.use(express.json());
app.use('/leaderboard', leaderboardRoutes);

describe('Leaderboard API', () => {
  const token = jwt.sign({ id: 'user-1', role: 'PLAYER' }, process.env.JWT_SECRET || 'test-secret');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ranks players and marks Top 5 as Bug Architect', async () => {
    // Generate 6 attempts
    const mockAttempts = Array(6).fill(0).map((_, i) => ({
      score: 100 - (i * 10), // Descending scores
      percentage: 100 - (i * 10),
      user: {
        username: `user_${i}`,
        team: { name: 'PRINCES' }
      }
    }));

    (prismaMock.quizAttempt.findMany as jest.Mock).mockResolvedValue(mockAttempts);

    const res = await request(app).get('/leaderboard').set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(6);
    expect(res.body[0].isBugArchitect).toBe(true);
    expect(res.body[4].isBugArchitect).toBe(true);
    expect(res.body[5].isBugArchitect).toBe(false); // 6th player is not BUG ARCHITECT
  });

  describe('LeaderboardService.getEligibleQuizScorers deterministic ranking and tie-breaking', () => {
    it('applies strict tie-breaking order: score -> correctAnswers -> completedAt -> rollNumber -> userId', async () => {
      const { LeaderboardService } = await import('../services/LeaderboardService');

      const attempts = [
        // Same score (80), same correctAnswers (16), same completedAt, different roll number
        {
          userId: 'user-c',
          score: 80,
          correctAnswers: 16,
          completedAt: new Date('2026-09-21T10:00:00Z'),
          user: { rollNumber: 15, teamId: 'team-1', role: 'PLAYER' }
        },
        {
          userId: 'user-b',
          score: 80,
          correctAnswers: 16,
          completedAt: new Date('2026-09-21T10:00:00Z'),
          user: { rollNumber: 5, teamId: 'team-1', role: 'PLAYER' } // Earlier roll number wins!
        },
        // Higher score (100) -> 1st place
        {
          userId: 'user-a',
          score: 100,
          correctAnswers: 20,
          completedAt: new Date('2026-09-21T10:05:00Z'),
          user: { rollNumber: 20, teamId: 'team-1', role: 'PLAYER' }
        },
        // Same score (80), higher correct answers (18) -> 2nd place
        {
          userId: 'user-d',
          score: 80,
          correctAnswers: 18,
          completedAt: new Date('2026-09-21T10:02:00Z'),
          user: { rollNumber: 30, teamId: 'team-1', role: 'PLAYER' }
        },
        // Same score (80), same correct answers (16), earlier time -> 3rd place
        {
          userId: 'user-e',
          score: 80,
          correctAnswers: 16,
          completedAt: new Date('2026-09-21T09:55:00Z'),
          user: { rollNumber: 50, teamId: 'team-1', role: 'PLAYER' }
        },
        // 6th candidate (should be excluded by limit 5)
        {
          userId: 'user-f',
          score: 40,
          correctAnswers: 8,
          completedAt: new Date('2026-09-21T10:00:00Z'),
          user: { rollNumber: 2, teamId: 'team-1', role: 'PLAYER' }
        }
      ];

      (prismaMock.quizAttempt.findMany as jest.Mock).mockResolvedValue(attempts);

      const top5 = await LeaderboardService.getEligibleQuizScorers('team-1', 5);

      expect(top5.length).toBe(5);
      // 1. user-a (score 100)
      expect(top5[0]).toBe('user-a');
      // 2. user-d (score 80, correctAnswers 18)
      expect(top5[1]).toBe('user-d');
      // 3. user-e (score 80, correctAnswers 16, completed earlier at 09:55)
      expect(top5[2]).toBe('user-e');
      // 4. user-b (score 80, correctAnswers 16, time 10:00, rollNumber 5)
      expect(top5[3]).toBe('user-b');
      // 5. user-c (score 80, correctAnswers 16, time 10:00, rollNumber 15)
      expect(top5[4]).toBe('user-c');
      // user-f (score 40) is excluded
      expect(top5).not.toContain('user-f');
    });
  });
});
