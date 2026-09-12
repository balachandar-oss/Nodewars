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
  const token = jwt.sign({ id: 'user-1', role: 'PLAYER' }, process.env.JWT_SECRET || 'super-secret-node-wars-key-change-in-prod');

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
        team: { name: 'TEAM_OMEGA' }
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
});
