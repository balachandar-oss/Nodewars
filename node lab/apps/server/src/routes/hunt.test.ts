import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import huntRoutes from './hunt';
import { PrismaClient } from '@prisma/client';
import { GameService } from '../services/GameService';

jest.mock('../utils/prisma', () => {
  return {
    __esModule: true,
    default: {
      user: {
        findUnique: jest.fn(),
        update: jest.fn()
      },
      team: {
        findFirst: jest.fn(),
        update: jest.fn()
      },
      bug: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        updateMany: jest.fn()
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

jest.mock('../services/GameEventBus', () => {
  return {
    gameEventBus: {
      emit: jest.fn()
    }
  };
});

import prismaMock from '../utils/prisma';
import { gameEventBus } from '../services/GameEventBus';

const app = express();
app.use(express.json());
app.use('/hunt', huntRoutes);

describe('Hunt API', () => {
  const token = jwt.sign({ id: 'user-1', role: 'PLAYER' }, process.env.JWT_SECRET || 'test-secret');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Phase Enforcement', () => {
    it('rejects /targets if not HUNT phase', async () => {
      (GameService.getPhase as jest.Mock).mockResolvedValue('ENGINEERING');
      const res = await request(app).get('/hunt/targets').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('rejects discovery if not HUNT phase', async () => {
      (GameService.getPhase as jest.Mock).mockResolvedValue('ENGINEERING');
      const res = await request(app).post('/hunt/targets/SERVER/discover').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });
  });

  describe('Discovery Flow', () => {
    beforeEach(() => {
      (GameService.getPhase as jest.Mock).mockResolvedValue('HUNT');
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1', teamId: 'team-princes' });
      (prismaMock.team.findFirst as jest.Mock).mockResolvedValue({ id: 'team-princesses', name: 'PRINCESSES' });
    });

    it('successfully discovers an undiscovered bug', async () => {
      (prismaMock.bug.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (prismaMock.bug.findFirst as jest.Mock).mockResolvedValue({ id: 'bug-1', targetSystem: 'SERVER', targetTeamId: 'team-princesses', status: 'DISCOVERED' });
      (prismaMock.user.update as jest.Mock).mockResolvedValue({});

      const res = await request(app).post('/hunt/targets/SERVER/discover').set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.pointsAwarded).toBe(10);
      expect(prismaMock.bug.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { targetSystem: 'SERVER', targetTeamId: 'team-princesses', status: 'PLANTED' }
      }));
      expect(prismaMock.user.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { huntScore: { increment: 10 } }
      }));
      expect(gameEventBus.emit).toHaveBeenCalledWith('ANY_EVENT', expect.objectContaining({ type: 'BUG_DISCOVERED' }));
    });

    it('rejects double discovery atomically', async () => {
      // updateMany returns count: 0 if no rows matched (e.g. status was not PLANTED)
      (prismaMock.bug.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
      (prismaMock.bug.findFirst as jest.Mock).mockResolvedValue({ id: 'bug-1', targetSystem: 'SERVER', targetTeamId: 'team-princesses', status: 'DISCOVERED' });

      const res = await request(app).post('/hunt/targets/SERVER/discover').set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/already discovered/);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
  });

  describe('Claim Flow', () => {
    beforeEach(() => {
      (GameService.getPhase as jest.Mock).mockResolvedValue('HUNT');
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1', teamId: 'team-princes' });
      (prismaMock.team.findFirst as jest.Mock).mockResolvedValue({ id: 'team-princesses', name: 'PRINCESSES' });
    });

    it('successfully claims a discovered bug', async () => {
      (prismaMock.bug.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      
      const res = await request(app).post('/hunt/bugs/bug-1/claim').set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(prismaMock.bug.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'bug-1', targetTeamId: 'team-princesses', status: 'DISCOVERED' }
      }));
      expect(prismaMock.user.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { huntScore: { increment: 10 } }
      }));
    });

    it('rejects double claiming atomically', async () => {
      (prismaMock.bug.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
      (prismaMock.bug.findUnique as jest.Mock).mockResolvedValue({ id: 'bug-1', targetTeamId: 'team-princesses', status: 'CLAIMED' });

      const res = await request(app).post('/hunt/bugs/bug-1/claim').set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(400);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
  });

  describe('Solve Flow', () => {
    beforeEach(() => {
      (GameService.getPhase as jest.Mock).mockResolvedValue('HUNT');
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1', teamId: 'team-princes' });
    });

    it('successfully resolves a claimed bug with correct solution', async () => {
      (prismaMock.bug.findUnique as jest.Mock).mockResolvedValue({
        id: 'bug-1',
        claimedByUserId: 'user-1',
        status: 'CLAIMED',
        configuration: JSON.stringify({ correctAnswer: 'Authentication', fragmentValue: 50 })
      });
      (prismaMock.bug.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      
      const res = await request(app)
        .post('/hunt/bugs/bug-1/solve')
        .set('Authorization', `Bearer ${token}`)
        .send({ solution: 'Authentication' });
      
      expect(res.status).toBe(200);
      expect(res.body.pointsAwarded).toBe(50);
      expect(prismaMock.bug.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'bug-1', claimedByUserId: 'user-1', status: 'CLAIMED' }
      }));
      expect(prismaMock.user.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { huntScore: { increment: 50 } }
      }));
      expect(prismaMock.team.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { huntScore: { increment: 50 } }
      }));
    });

    it('rejects incorrect solution without mutating state', async () => {
      (prismaMock.bug.findUnique as jest.Mock).mockResolvedValue({
        id: 'bug-1',
        claimedByUserId: 'user-1',
        status: 'CLAIMED',
        configuration: JSON.stringify({ correctAnswer: 'Authentication', fragmentValue: 50 })
      });
      
      const res = await request(app)
        .post('/hunt/bugs/bug-1/solve')
        .set('Authorization', `Bearer ${token}`)
        .send({ solution: 'WrongAnswer' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Incorrect remediation concept/);
      expect(prismaMock.bug.updateMany).not.toHaveBeenCalled();
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('rejects resolving a bug claimed by someone else', async () => {
      (prismaMock.bug.findUnique as jest.Mock).mockResolvedValue({
        id: 'bug-1',
        claimedByUserId: 'user-2',
        status: 'CLAIMED'
      });

      const res = await request(app).post('/hunt/bugs/bug-1/solve').set('Authorization', `Bearer ${token}`).send({ solution: 'Authentication' });
      
      expect(res.status).toBe(403);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
    
    it('is idempotent: repeated correct solve returns success but awards 0 points', async () => {
      (prismaMock.bug.findUnique as jest.Mock).mockResolvedValue({
        id: 'bug-1',
        claimedByUserId: 'user-1',
        status: 'RESOLVED',
        configuration: JSON.stringify({ correctAnswer: 'Authentication' })
      });
      
      const res = await request(app)
        .post('/hunt/bugs/bug-1/solve')
        .set('Authorization', `Bearer ${token}`)
        .send({ solution: 'Authentication' });
        
      expect(res.status).toBe(200);
      expect(res.body.pointsAwarded).toBe(0);
      expect(prismaMock.bug.updateMany).not.toHaveBeenCalled();
    });
  });
});
