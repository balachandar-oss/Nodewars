import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import gameRoutes from './game';

jest.mock('../utils/prisma', () => {
  return {
    __esModule: true,
    default: {
      user: {
        findUnique: jest.fn()
      },
      team: {
        findFirst: jest.fn(),
        findUnique: jest.fn()
      },
      gameState: {
        findUnique: jest.fn()
      }
    }
  };
});

jest.mock('../services/GameService', () => {
  return {
    GameService: {
      getPhase: jest.fn()
    }
  };
});

import prismaMock from '../utils/prisma';
import { GameService } from '../services/GameService';

const app = express();
app.use(express.json());
app.use('/game', gameRoutes);

describe('Game State API', () => {
  const token = jwt.sign({ id: 'user-1', role: 'PLAYER' }, process.env.JWT_SECRET || 'test-secret');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns valid game state for an authenticated user', async () => {
    (GameService.getPhase as jest.Mock).mockResolvedValue('HUNT');
    (prismaMock.gameState.findUnique as jest.Mock).mockResolvedValue({ id: 'singleton', phase: 'HUNT', placementEndsAt: null });
    
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-1',
      teamId: 'team-princes',
      team: { name: 'PRINCES' }
    });

    (prismaMock.team.findFirst as jest.Mock).mockResolvedValue({
      id: 'team-princesses',
      name: 'PRINCESSES'
    });

    (prismaMock.team.findUnique as jest.Mock)
      .mockImplementation(async (args) => {
        if (args.where.name === 'PRINCES') return { huntScore: 120 };
        if (args.where.name === 'PRINCESSES') return { huntScore: 90 };
        return null;
      });

    const res = await request(app).get('/game/state').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.phase).toBe('HUNT');
    expect(res.body.huntAvailable).toBe(true);
    expect(res.body.playerView.homeTeam).toBe('PRINCES');
    expect(res.body.playerView.targetTeam).toBe('PRINCESSES');
    expect(res.body.scoreSummary['PRINCES']).toBe(120);
    expect(res.body.scoreSummary['PRINCESSES']).toBe(90);
  });
});
