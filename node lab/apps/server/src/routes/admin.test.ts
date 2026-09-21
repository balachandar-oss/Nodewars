import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import adminRoutes from './admin';

jest.mock('../utils/prisma', () => {
  return {
    __esModule: true,
    default: {
      team: {
        findUnique: jest.fn()
      },
      castleComponent: {
        upsert: jest.fn(),
        findMany: jest.fn()
      }
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

import prismaMock from '../utils/prisma';
import { GameService } from '../services/GameService';

const app = express();
app.use(express.json());
app.use('/admin', adminRoutes);

describe('Admin API', () => {
  const playerToken = jwt.sign({ id: 'user-1', role: 'PLAYER' }, process.env.JWT_SECRET || 'super-secret-node-wars-key-change-in-prod');
  const adminToken = jwt.sign({ id: 'admin-1', role: 'ADMIN' }, process.env.JWT_SECRET || 'super-secret-node-wars-key-change-in-prod');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Phase transition', () => {
    it('rejects normal player from changing phase', async () => {
      const res = await request(app).post('/admin/game/start-hunt').set('Authorization', `Bearer ${playerToken}`);
      expect(res.status).toBe(403);
    });

    it('allows admin to change phase', async () => {
      (GameService.transitionTo as jest.Mock).mockResolvedValue('HUNT');
      const res = await request(app).post('/admin/game/start-hunt').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.phase).toBe('HUNT');
    });
  });

  describe('Castle Seeding', () => {
    it('rejects normal player from seeding castle', async () => {
      const res = await request(app).post('/admin/seed-castle').set('Authorization', `Bearer ${playerToken}`);
      expect(res.status).toBe(403);
    });

    it('allows admin to seed castle components', async () => {
      (prismaMock.team.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'team-1', name: 'TEAM OMEGA' })
        .mockResolvedValueOnce({ id: 'team-2', name: 'TEAM BETA' });
      (prismaMock.castleComponent.upsert as jest.Mock).mockResolvedValue({});

      const res = await request(app).post('/admin/seed-castle').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.omegaCount).toBe(7);
      expect(res.body.betaCount).toBe(7);
    });
  });

  describe('Castle Components API', () => {
    it('rejects normal player', async () => {
      const res = await request(app).get('/admin/castle-components').set('Authorization', `Bearer ${playerToken}`);
      expect(res.status).toBe(403);
    });

    it('returns castle components for admin', async () => {
      (prismaMock.castleComponent.findMany as jest.Mock).mockResolvedValue([
        { id: '1', systemId: 'SERVER', team: { name: 'TEAM OMEGA' } }
      ]);
      const res = await request(app).get('/admin/castle-components').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body[0].systemId).toBe('SERVER');
    });
  });
});
