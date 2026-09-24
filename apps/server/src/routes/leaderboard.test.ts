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

  it('ranks players by team and marks Top 5 per team as Bug Architect', async () => {
    // Generate 6 PRINCES and 6 PRINCESSES
    const mockAttempts = [];
    for (let i = 0; i < 6; i++) {
      mockAttempts.push({
        score: 100 - (i * 10),
        percentage: 100 - (i * 10),
        user: { username: `prince_${i}`, team: { name: 'PRINCES' } },
        completedAt: new Date(1000)
      });
      mockAttempts.push({
        score: 100 - (i * 10),
        percentage: 100 - (i * 10),
        user: { username: `princess_${i}`, team: { name: 'PRINCESSES' } },
        completedAt: new Date(1000)
      });
    }

    (prismaMock.quizAttempt.findMany as jest.Mock).mockResolvedValue(mockAttempts);

    const res = await request(app).get('/leaderboard').set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(12);

    const princes = res.body.filter((r: any) => r.teamName === 'PRINCES');
    const princesses = res.body.filter((r: any) => r.teamName === 'PRINCESSES');

    expect(princes[0].isBugArchitect).toBe(true);
    expect(princes[4].isBugArchitect).toBe(true);
    expect(princes[5].isBugArchitect).toBe(false);

    expect(princesses[0].isBugArchitect).toBe(true);
    expect(princesses[4].isBugArchitect).toBe(true);
    expect(princesses[5].isBugArchitect).toBe(false);
  });
});
