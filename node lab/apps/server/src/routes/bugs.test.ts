import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import bugsRoutes from './bugs';
import { PrismaClient } from '@prisma/client';
import { LeaderboardService } from '../services/LeaderboardService';

jest.mock('../utils/prisma', () => {
  return {
    __esModule: true,
    default: {
      bug: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn()
      },
      user: {
        findUnique: jest.fn()
      },
      team: {
        findFirst: jest.fn()
      }
    }
  };
});

jest.mock('../services/LeaderboardService', () => {
  return {
    LeaderboardService: {
      isBugArchitect: jest.fn()
    }
  };
});

import prismaMock from '../utils/prisma';

const app = express();
app.use(express.json());
app.use('/bugs', bugsRoutes);

describe('Bugs API', () => {
  const token = jwt.sign({ id: 'user-1', role: 'PLAYER' }, process.env.JWT_SECRET || 'super-secret-node-wars-key-change-in-prod');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /catalog', () => {
    it('allows authenticated users to view catalog', async () => {
      const res = await request(app).get('/bugs/catalog').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.vulnerabilities).toBeDefined();
    });

    it('rejects unauthenticated users', async () => {
      const res = await request(app).get('/bugs/catalog');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /mine', () => {
    it('returns bugs for the authenticated user', async () => {
      (prismaMock.bug.findMany as jest.Mock).mockResolvedValue([{ id: 'bug-1' }]);
      const res = await request(app).get('/bugs/mine').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(prismaMock.bug.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { architectUserId: 'user-1' }
      }));
    });
  });

  describe('POST /', () => {
    it('rejects unauthenticated requests', async () => {
      const res = await request(app).post('/bugs').send({});
      expect(res.status).toBe(401);
    });

    it('rejects if user is not a Bug Architect', async () => {
      (LeaderboardService.isBugArchitect as jest.Mock).mockResolvedValue(false);
      const res = await request(app).post('/bugs').set('Authorization', `Bearer ${token}`).send({
        vulnerabilityType: 'AUTHORIZATION_BYPASS',
        targetSystem: 'SERVER',
        configuration: {}
      });
      expect(res.status).toBe(403);
    });

    it('rejects invalid vulnerability types', async () => {
      (LeaderboardService.isBugArchitect as jest.Mock).mockResolvedValue(true);
      const res = await request(app).post('/bugs').set('Authorization', `Bearer ${token}`).send({
        vulnerabilityType: 'INVALID_BUG',
        targetSystem: 'SERVER',
        configuration: {}
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Invalid vulnerability type/);
    });

    it('rejects invalid target systems', async () => {
      (LeaderboardService.isBugArchitect as jest.Mock).mockResolvedValue(true);
      const res = await request(app).post('/bugs').set('Authorization', `Bearer ${token}`).send({
        vulnerabilityType: 'AUTHORIZATION_BYPASS',
        targetSystem: 'INVALID_TARGET',
        configuration: {}
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Invalid target system/);
    });

    it('rejects if bug limit (3) is reached', async () => {
      (LeaderboardService.isBugArchitect as jest.Mock).mockResolvedValue(true);
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1', teamId: 'team-omega' });
      (prismaMock.team.findFirst as jest.Mock).mockResolvedValue({ id: 'team-beta', name: 'TEAM BETA' });
      (prismaMock.bug.count as jest.Mock).mockResolvedValue(3);

      const res = await request(app).post('/bugs').set('Authorization', `Bearer ${token}`).send({
        vulnerabilityType: 'AUTHORIZATION_BYPASS',
        targetSystem: 'SERVER',
        configuration: {}
      });
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Bug limit reached/);
    });

    it('creates a bug for an eligible architect under the limit', async () => {
      (LeaderboardService.isBugArchitect as jest.Mock).mockResolvedValue(true);
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1', teamId: 'team-omega' });
      (prismaMock.team.findFirst as jest.Mock).mockResolvedValue({ id: 'team-beta', name: 'TEAM BETA' });
      (prismaMock.bug.count as jest.Mock).mockResolvedValue(0);
      (prismaMock.bug.create as jest.Mock).mockResolvedValue({
        id: 'new-bug-1',
        vulnerabilityType: 'AUTHORIZATION_BYPASS',
        targetSystem: 'SERVER',
        status: 'PLANTED',
        createdAt: new Date()
      });

      const res = await request(app).post('/bugs').set('Authorization', `Bearer ${token}`).send({
        vulnerabilityType: 'AUTHORIZATION_BYPASS',
        targetSystem: 'SERVER',
        configuration: { payload: 'example' },
        status: 'DISCOVERED', // This should be ignored by the server
        targetTeamId: 'team-omega' // This should be ignored by the server
      });

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('new-bug-1');
      expect(res.body.targetTeamName).toBe('TEAM BETA'); // Opposing team derived server-side
      
      // Ensure server overrides client payload for protected fields
      expect(prismaMock.bug.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          architectUserId: 'user-1',
          architectTeamId: 'team-omega',
          targetTeamId: 'team-beta', // Derivation worked
          status: 'PLANTED' // Status overridden
        })
      });
    });
  });
});
