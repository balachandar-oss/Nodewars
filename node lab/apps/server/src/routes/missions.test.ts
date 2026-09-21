import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import missionRoutes from './missions';
import { PrismaClient } from '@prisma/client';

// Mock dependencies
jest.mock('../utils/prisma', () => {
  return {
    __esModule: true,
    default: {
      mission: {
        findUnique: jest.fn(),
        findFirst: jest.fn()
      },
      missionProgress: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn()
      },
      user: {
        findUnique: jest.fn(),
        update: jest.fn()
      },
      $transaction: jest.fn(async (cb) => {
        // execute callback directly in tests
        const tx = {
          missionProgress: {
            update: jest.fn(),
            upsert: jest.fn()
          },
          user: {
            findUnique: jest.fn().mockResolvedValue({ id: 'user-1', xp: 0, level: 1, missionsCompleted: 0 }),
            update: jest.fn()
          },
          mission: {
            findFirst: jest.fn().mockResolvedValue({ id: 'mission-02' })
          }
        };
        await cb(tx);
        return tx;
      })
    }
  };
});

import prismaMock from '../utils/prisma';

const app = express();
app.use(express.json());
app.use('/missions', missionRoutes);

describe('Mission API - Evaluation Engine', () => {
  const token = jwt.sign({ id: 'user-1', role: 'PLAYER' }, process.env.JWT_SECRET || 'test-secret');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).post('/missions/mission-01/run').send({ code: 'const http = require("http");' });
    expect(res.status).toBe(401);
  });

  it('rejects empty code', async () => {
    const res = await request(app)
      .post('/missions/mission-01/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: '' });
    expect(res.status).toBe(400);
  });

  it('rejects locked mission', async () => {
    (prismaMock.mission.findUnique as jest.Mock).mockResolvedValue({ id: 'mission-02' });
    (prismaMock.missionProgress.findUnique as jest.Mock).mockResolvedValue({ status: 'LOCKED' });

    const res = await request(app)
      .post('/missions/mission-02/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'code' });
    
    expect(res.status).toBe(403);
  });

  it('successfully evaluates Mission 01', async () => {
    (prismaMock.mission.findUnique as jest.Mock).mockResolvedValue({ id: 'mission-01', order: 1, xpReward: 100 });
    (prismaMock.missionProgress.findUnique as jest.Mock).mockResolvedValue({ status: 'ACTIVE' });

    const validCode = `
      const http = require('http');
      const server = http.createServer((req, res) => {
        res.end('OK');
      });
      server.listen(3000);
    `;

    const res = await request(app)
      .post('/missions/mission-01/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: validCode });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.score).toBe(5);
    
    // Check that transaction was called (implying progression update occurred)
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });

  it('fails an incomplete Mission 01 solution', async () => {
    (prismaMock.mission.findUnique as jest.Mock).mockResolvedValue({ id: 'mission-01', order: 1 });
    (prismaMock.missionProgress.findUnique as jest.Mock).mockResolvedValue({ status: 'ACTIVE' });

    const incompleteCode = `
      const http = require('http');
    `;

    const res = await request(app)
      .post('/missions/mission-01/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: incompleteCode });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    
    // Transaction should NOT have been called
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('successfully evaluates Mission 02 and unlocks Mission 03', async () => {
    (prismaMock.mission.findUnique as jest.Mock).mockResolvedValue({ id: 'mission-02', order: 2, xpReward: 150 });
    (prismaMock.missionProgress.findUnique as jest.Mock).mockResolvedValue({ status: 'ACTIVE' });
    (prismaMock.mission.findFirst as jest.Mock).mockResolvedValue({ id: 'mission-03' }); // Next mission

    const validCode = `
      const express = require('express');
      const app = express();
      app.get('/door/status', (req, res) => res.json({ status: 'locked' }));
      app.get('/door/open', (req, res) => res.json({ status: 'open' }));
      app.post('/door/access', (req, res) => res.json({ status: 'granted' }));
      app.listen(3001);
    `;

    const res = await request(app)
      .post('/missions/mission-02/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: validCode });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.score).toBe(6);
    
    // Transaction implies completion and XP award logic ran
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });

  it('fails an incomplete Mission 02 solution', async () => {
    (prismaMock.mission.findUnique as jest.Mock).mockResolvedValue({ id: 'mission-02', order: 2 });
    (prismaMock.missionProgress.findUnique as jest.Mock).mockResolvedValue({ status: 'ACTIVE' });

    const incompleteCode = `
      const express = require('express');
      const app = express();
      // Missing routes and json responses
    `;

    const res = await request(app)
      .post('/missions/mission-02/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: incompleteCode });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('successfully evaluates Mission 03 and unlocks Mission 04', async () => {
    (prismaMock.mission.findUnique as jest.Mock).mockResolvedValue({ id: 'mission-03', order: 3, xpReward: 200 });
    (prismaMock.missionProgress.findUnique as jest.Mock).mockResolvedValue({ status: 'ACTIVE' });
    (prismaMock.mission.findFirst as jest.Mock).mockResolvedValue({ id: 'mission-04' }); // Next mission

    const validCode = `
      const express = require('express');
      const app = express();
      app.use((req, res, next) => {
        req.user = { role: 'ADMIN' };
        next();
      });
      const securityGate = (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: 'unauthenticated' });
        if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'forbidden' });
        next();
      };
      app.get('/vault', securityGate, (req, res) => res.json({ secret: true }));
    `;

    const res = await request(app)
      .post('/missions/mission-03/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: validCode });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.score).toBe(6);
    
    // Transaction implies completion and XP award logic ran
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });

  it('fails an incomplete Mission 03 solution', async () => {
    (prismaMock.mission.findUnique as jest.Mock).mockResolvedValue({ id: 'mission-03', order: 3 });
    (prismaMock.missionProgress.findUnique as jest.Mock).mockResolvedValue({ status: 'ACTIVE' });

    // Missing authorization (403 / role check)
    const incompleteCode = `
      const express = require('express');
      const app = express();
      const securityGate = (req, res, next) => {
        if (!req.user) return res.status(401).send();
        next();
      };
      app.get('/vault', securityGate, (req, res) => res.json({}));
    `;

    const res = await request(app)
      .post('/missions/mission-03/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: incompleteCode });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('successfully evaluates Mission 04 and unlocks Mission 05', async () => {
    (prismaMock.mission.findUnique as jest.Mock).mockResolvedValue({ id: 'mission-04', order: 4, xpReward: 250 });
    (prismaMock.missionProgress.findUnique as jest.Mock).mockResolvedValue({ status: 'ACTIVE' });
    (prismaMock.mission.findFirst as jest.Mock).mockResolvedValue({ id: 'mission-05' });

    const validCode = `
      const db = new Database();
      const resources = ['gold', 'shield'];
      app.post('/vault', async (req, res) => {
        try {
          await db.create();
        } catch (e) {}
      });
      app.get('/vault', async () => { await db.find(); });
      app.put('/vault', async () => { await db.update(); });
      app.delete('/vault', async () => { await db.delete(); });
    `;

    const res = await request(app)
      .post('/missions/mission-04/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: validCode });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.score).toBe(8);
    
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });

  it('fails an incomplete Mission 04 solution', async () => {
    (prismaMock.mission.findUnique as jest.Mock).mockResolvedValue({ id: 'mission-04', order: 4 });
    (prismaMock.missionProgress.findUnique as jest.Mock).mockResolvedValue({ status: 'ACTIVE' });

    // Missing update and delete
    const incompleteCode = `
      const db = new Database();
      const gold = [];
      app.post('/vault', async () => { await db.create(); });
      app.get('/vault', async () => { await db.find(); });
    `;

    const res = await request(app)
      .post('/missions/mission-04/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: incompleteCode });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('successfully evaluates Mission 05 and unlocks Mission 06', async () => {
    (prismaMock.mission.findUnique as jest.Mock).mockResolvedValue({ id: 'mission-05', order: 5, xpReward: 200 });
    (prismaMock.missionProgress.findUnique as jest.Mock).mockResolvedValue({ status: 'ACTIVE' });
    (prismaMock.mission.findFirst as jest.Mock).mockResolvedValue({ id: 'mission-06' });

    const validCode = `
      async function startGrid() {
        try {
          const auth = await authenticatePower();
          const res = await loadResources();
          await activateSystems();
        } catch (err) {}
      }
    `;

    const res = await request(app)
      .post('/missions/mission-05/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: validCode });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.score).toBe(5);
    
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });

  it('fails an incomplete Mission 05 solution (missing awaits)', async () => {
    (prismaMock.mission.findUnique as jest.Mock).mockResolvedValue({ id: 'mission-05', order: 5 });
    (prismaMock.missionProgress.findUnique as jest.Mock).mockResolvedValue({ status: 'ACTIVE' });

    // Missing multiple awaits for sequential flow
    const incompleteCode = `
      async function startGrid() {
        try {
          await authenticatePower();
          // forgot other awaits
        } catch (err) {}
      }
    `;

    const res = await request(app)
      .post('/missions/mission-05/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: incompleteCode });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('successfully evaluates Mission 06 and unlocks Mission 07', async () => {
    (prismaMock.mission.findUnique as jest.Mock).mockResolvedValue({ id: 'mission-06', order: 6, xpReward: 300 });
    (prismaMock.missionProgress.findUnique as jest.Mock).mockResolvedValue({ status: 'ACTIVE' });
    (prismaMock.mission.findFirst as jest.Mock).mockResolvedValue({ id: 'mission-07' });

    const validCode = `
      const EventEmitter = require("events");
      const { Server } = require("socket.io");
      
      const gameEventBus = new EventEmitter();
      gameEventBus.on("PLAYER_ENTERED", () => {});
      gameEventBus.emit("PLAYER_ENTERED", { type: "PLAYER_ENTERED", teamId: "PRINCES" });
      
      function setupSocket(io) {
        io.on("connection", (socket) => {
           socket.join("team:PRINCES");
           io.to("team:PRINCES").emit("game_event", {});
        });
      }
    `;

    const res = await request(app)
      .post('/missions/mission-06/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: validCode });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.score).toBe(6);
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });

  it('fails an incomplete Mission 06 solution', async () => {
    (prismaMock.mission.findUnique as jest.Mock).mockResolvedValue({ id: 'mission-06', order: 6 });
    (prismaMock.missionProgress.findUnique as jest.Mock).mockResolvedValue({ status: 'ACTIVE' });

    const incompleteCode = `
      const EventEmitter = require("events");
      const { Server } = require("socket.io");
      // missing everything else
    `;

    const res = await request(app)
      .post('/missions/mission-06/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: incompleteCode });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  describe('POST /api/missions/:id/enter', () => {
    it('should trigger PLAYER_ENTERED event for active mission >= 6', async () => {
      (prismaMock.mission.findUnique as jest.Mock).mockResolvedValue({ id: 'mission-06', order: 6, title: 'LIVE SECURITY MONITOR' });
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1', username: 'test_user', teamId: 'team_princes' });
      (prismaMock.missionProgress.findUnique as jest.Mock).mockResolvedValue({ status: 'ACTIVE' });

      // Mock GameEventBus
      const { gameEventBus } = require('../services/GameEventBus');
      const emitSpy = jest.spyOn(gameEventBus, 'emitEvent').mockImplementation(() => {});

      const res = await request(app)
        .post('/missions/mission-06/enter')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(emitSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'PLAYER_ENTERED',
          playerId: 'test_user',
          teamId: 'team_princes',
        })
      );

      emitSpy.mockRestore();
    });
  });

  describe('Mission 07 Evaluator - False Positives and Valid Cases', () => {
    beforeEach(async () => {
      (prismaMock.mission.findUnique as jest.Mock).mockResolvedValue({ id: 'mission-07', order: 7, xpReward: 400 });
      (prismaMock.missionProgress.findUnique as jest.Mock).mockResolvedValue({ status: 'ACTIVE' });
    });

    it('rejects starter (vulnerable) code', async () => {
      const vulnerableCode = `
        const securityGate = (req, res, next) => {
          if (!req.user) return res.status(401).json({ error: "Unauthorized" });
          next();
        };
        app.get("/admin", securityGate, (req, res) => res.json({ secret: "FLAG" }));
      `;
      const res = await request(app).post('/missions/mission-07/run').set('Authorization', `Bearer ${token}`).send({ code: vulnerableCode });
      expect(res.body.success).toBe(false);
      const chk = res.body.checks.find((c: any) => c.id === 'authz-enforced');
      expect(chk.passed).toBe(false);
    });

    it('rejects if route is deleted', async () => {
      const code = `
        const securityGate = (req, res, next) => { next(); };
        // app.get deleted
      `;
      const res = await request(app).post('/missions/mission-07/run').set('Authorization', `Bearer ${token}`).send({ code });
      expect(res.body.success).toBe(false);
      const chk = res.body.checks.find((c: any) => c.id === 'route-protected');
      expect(chk.passed).toBe(false);
    });

    it('rejects if authentication is removed', async () => {
      const code = `
        const securityGate = (req, res, next) => {
          if (req.role !== 'ADMIN') return res.status(403).send();
          next();
        };
        app.get("/admin", securityGate, (req, res) => res.json({ secret: "FLAG" }));
      `;
      const res = await request(app).post('/missions/mission-07/run').set('Authorization', `Bearer ${token}`).send({ code });
      expect(res.body.success).toBe(false);
      const chk = res.body.checks.find((c: any) => c.id === 'authn-required');
      expect(chk.passed).toBe(false);
    });

    it('rejects if everyone is denied', async () => {
      const code = `
        const securityGate = (req, res, next) => {
          if (!req.user) return res.status(401).json({ error: "Unauthorized" });
          return res.status(403).json({ error: "Forbidden" });
        };
        app.get("/admin", securityGate, (req, res) => res.json({ secret: "FLAG" }));
      `;
      const res = await request(app).post('/missions/mission-07/run').set('Authorization', `Bearer ${token}`).send({ code });
      expect(res.body.success).toBe(false);
      const chk = res.body.checks.find((c: any) => c.id === 'admin-allowed');
      expect(chk.passed).toBe(false); // missing next()
    });

    it('rejects if keywords are only in comments or unrelated code', async () => {
      const code = `
        // Check if req.user.role === 'ADMIN' else 403
        const securityGate = (req, res, next) => {
          if (!req.user) return res.status(401).json({});
          next();
        };
        app.get("/admin", securityGate, (req, res) => res.json({}));
      `;
      const res = await request(app).post('/missions/mission-07/run').set('Authorization', `Bearer ${token}`).send({ code });
      expect(res.body.success).toBe(false);
      const chk = res.body.checks.find((c: any) => c.id === 'authz-enforced');
      expect(chk.passed).toBe(false); // Should be false because comments are stripped
    });

    it('passes a correct solution', async () => {
      const validCode = `
        const securityGate = (req, res, next) => {
          if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
          }
          if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: "Forbidden" });
          }
          next();
        };
        app.get("/admin", securityGate, (req, res) => {
          res.json({ secret: "FLAG" });
        });
      `;
      const res = await request(app).post('/missions/mission-07/run').set('Authorization', `Bearer ${token}`).send({ code: validCode });
      expect(res.body.success).toBe(true);
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });

  describe('Strict Locked Mission Enforcement', () => {
    it('PLAYER is blocked on locked missions', async () => {
      (prismaMock.mission.findUnique as jest.Mock).mockResolvedValue({ id: 'mission-02', order: 2, xpReward: 100 });
      (prismaMock.missionProgress.findUnique as jest.Mock).mockResolvedValue({ status: 'LOCKED' });

      const code = `const app = express(); app.listen(3000);`;
      
      const res = await request(app)
        .post('/missions/mission-02/run')
        .set('Authorization', `Bearer ${token}`)
        .send({ code });

      // Must be blocked with 403
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Mission is locked');
    });
  });
});
