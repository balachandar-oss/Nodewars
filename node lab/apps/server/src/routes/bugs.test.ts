import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import bugsRoutes from './bugs';
import { PrismaClient } from '@prisma/client';
import { LeaderboardService } from '../services/LeaderboardService';
import { GameService } from '../services/GameService';

jest.mock('../utils/prisma', () => {
  return {
    __esModule: true,
    default: {
      bug: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
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

jest.mock('../services/GameService', () => {
  return {
    GameService: {
      getPhase: jest.fn()
    }
  };
});

import prismaMock from '../utils/prisma';

const app = express();
app.use(express.json());
app.use('/bugs', bugsRoutes);

describe('Bugs API', () => {
  const token = jwt.sign({ id: 'user-1', role: 'PLAYER' }, process.env.JWT_SECRET || 'test-secret');

  beforeEach(() => {
    jest.clearAllMocks();
    (GameService.getPhase as jest.Mock).mockResolvedValue('BUG_PLACEMENT');
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
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1', teamId: 'team-princes' });
      (prismaMock.team.findFirst as jest.Mock).mockResolvedValue({ id: 'team-princesses', name: 'PRINCESSES' });
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
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1', teamId: 'team-princes' });
      (prismaMock.team.findFirst as jest.Mock).mockResolvedValue({ id: 'team-princesses', name: 'PRINCESSES' });
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
        targetTeamId: 'team-princes' // This should be ignored by the server
      });

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('new-bug-1');
      expect(res.body.targetTeamName).toBe('PRINCESSES'); // Opposing team derived server-side
      
      // Ensure server overrides client payload for protected fields
      expect(prismaMock.bug.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          architectUserId: 'user-1',
          architectTeamId: 'team-princes',
          targetTeamId: 'team-princesses', // Derivation worked
          status: 'PLANTED' // Status overridden
        })
      });
    });
  });

  describe('GET /my-assignment', () => {
    const architectToken = jwt.sign({ id: 'arch-1', role: 'BUG_ARCHITECT' }, process.env.JWT_SECRET || 'test-secret');
    const playerToken = jwt.sign({ id: 'player-1', role: 'PLAYER' }, process.env.JWT_SECRET || 'test-secret');

    it('rejects non-architect from calling my-assignment', async () => {
      const res = await request(app).get('/bugs/my-assignment').set('Authorization', `Bearer ${playerToken}`);
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Bug Architect privileges required/);
    });

    it('returns 404 if architect has no assigned bug', async () => {
      (prismaMock.bug.findFirst as jest.Mock).mockResolvedValue(null);
      const res = await request(app).get('/bugs/my-assignment').set('Authorization', `Bearer ${architectToken}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/No bug assignment found/);
    });

    it('returns only the caller assigned bug and safe planting info', async () => {
      (prismaMock.bug.findFirst as jest.Mock).mockResolvedValue({
        id: 'bug-p2p-seed-1',
        architectUserId: 'arch-1',
        isSeminarPool: true,
        vulnerabilityType: 'MISSING_AUTHENTICATION',
        targetSystem: 'SMART DOOR',
        difficulty: 'EASY',
        configuration: JSON.stringify({
          question: 'What status code?',
          options: ['200', '401']
        }),
        status: 'DRAFT',
        location: null,
        structureType: 'SMART_DOOR'
      });

      const res = await request(app).get('/bugs/my-assignment').set('Authorization', `Bearer ${architectToken}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('bug-p2p-seed-1');
      expect(res.body.vulnerabilityType).toBe('MISSING_AUTHENTICATION');
      expect(res.body.targetSystem).toBe('SMART DOOR');
      expect(res.body.difficulty).toBe('EASY');
      expect(res.body.question).toBe('What status code?');
      expect(res.body.status).toBe('DRAFT');
      // Ensure it queried specifically for caller's seminar bug
      expect(prismaMock.bug.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          architectUserId: 'arch-1',
          isSeminarPool: true
        }
      }));
    });
  });

  describe('POST /:bugId/plant', () => {
    const architectToken = jwt.sign({ id: 'arch-1', role: 'BUG_ARCHITECT' }, process.env.JWT_SECRET || 'test-secret');
    const playerToken = jwt.sign({ id: 'player-1', role: 'PLAYER' }, process.env.JWT_SECRET || 'test-secret');

    it('rejects non-architect from planting', async () => {
      const res = await request(app).post('/bugs/bug-1/plant').set('Authorization', `Bearer ${playerToken}`).send({
        location: 'WALL_A',
        structureType: 'DOOR'
      });
      expect(res.status).toBe(403);
    });

    it('rejects if current phase is not BUG_PLACEMENT', async () => {
      (GameService.getPhase as jest.Mock).mockResolvedValue('ENGINEERING');
      const res = await request(app).post('/bugs/bug-1/plant').set('Authorization', `Bearer ${architectToken}`).send({
        location: 'WALL_A',
        structureType: 'DOOR'
      });
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/only allowed during the BUG_PLACEMENT phase/);
    });

    it('validates required fields', async () => {
      const res = await request(app).post('/bugs/bug-1/plant').set('Authorization', `Bearer ${architectToken}`).send({
        location: ''
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/location is required/);
    });

    it('rejects planting a non-existent bug', async () => {
      (prismaMock.bug.findUnique as jest.Mock).mockResolvedValue(null);
      const res = await request(app).post('/bugs/non-existent/plant').set('Authorization', `Bearer ${architectToken}`).send({
        location: 'DOOR_NORTH',
        structureType: 'SMART_DOOR'
      });
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/Bug not found/);
    });

    it('rejects architect from planting another architect bug', async () => {
      (prismaMock.bug.findUnique as jest.Mock).mockResolvedValue({
        id: 'bug-2',
        architectUserId: 'different-architect',
        status: 'DRAFT'
      });

      const res = await request(app).post('/bugs/bug-2/plant').set('Authorization', `Bearer ${architectToken}`).send({
        location: 'DOOR_NORTH',
        structureType: 'SMART_DOOR'
      });
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/This bug is not assigned to you/);
    });

    it('rejects planting the same bug twice', async () => {
      (prismaMock.bug.findUnique as jest.Mock).mockResolvedValue({
        id: 'bug-1',
        architectUserId: 'arch-1',
        status: 'PLANTED'
      });

      const res = await request(app).post('/bugs/bug-1/plant').set('Authorization', `Bearer ${architectToken}`).send({
        location: 'DOOR_NORTH',
        structureType: 'SMART_DOOR'
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Bug is already planted/);
    });

    it('successfully plants own assigned bug and ignores client tampering', async () => {
      (prismaMock.bug.findUnique as jest.Mock).mockResolvedValue({
        id: 'bug-1',
        architectUserId: 'arch-1',
        architectTeamId: 'team-princes',
        targetTeamId: 'team-princesses',
        status: 'DRAFT'
      });

      (prismaMock.bug.update as jest.Mock).mockResolvedValue({
        id: 'bug-1',
        status: 'PLANTED',
        location: 'DOOR_NORTH',
        structureType: 'SMART_DOOR'
      });

      const res = await request(app).post('/bugs/bug-1/plant').set('Authorization', `Bearer ${architectToken}`).send({
        location: 'DOOR_NORTH',
        structureType: 'SMART_DOOR',
        architectUserId: 'hacker-user', // Client tampering attempt
        targetTeamId: 'team-princes', // Client tampering attempt
        status: 'RESOLVED' // Client tampering attempt
      });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('PLANTED');
      expect(res.body.location).toBe('DOOR_NORTH');

      // Server only updates location, structureType, and sets status to PLANTED
      expect(prismaMock.bug.update).toHaveBeenCalledWith({
        where: { id: 'bug-1' },
        data: {
          status: 'PLANTED',
          location: 'DOOR_NORTH',
          structureType: 'SMART_DOOR'
        }
      });
    });
  });
});
