import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authRoutes from './auth';
import { SEMINAR_ACCOUNTS } from '../utils/seminarAccounts';

jest.mock('../utils/prisma', () => {
  return {
    __esModule: true,
    default: {
      user: {
        findUnique: jest.fn()
      }
    }
  };
});

import prismaMock from '../utils/prisma';

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Authentication & Seminar Accounts Suite', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Seminar Accounts Integrity Specifications (Phase 8A)', () => {
    it('1. Exactly 49 accounts exist in the specification', () => {
      expect(SEMINAR_ACCOUNTS.length).toBe(49);
    });

    it('2. Exactly 0 admin accounts exist in SEMINAR_ACCOUNTS (now dynamically seeded)', () => {
      const admins = SEMINAR_ACCOUNTS.filter(a => a.role === 'ADMIN');
      expect(admins.length).toBe(0);
    });

    it('3. Exactly 49 student accounts exist with role PLAYER and ch.sc.u4cys250XX format', () => {
      const students = SEMINAR_ACCOUNTS.filter(a => a.role === 'PLAYER');
      expect(students.length).toBe(49);
      students.forEach(s => {
        const paddedRoll = s.rollNumber.toString().padStart(2, '0');
        expect(s.username).toBe(`ch.sc.u4cys250${paddedRoll}`);
      });
    });

    it('4. Exactly 32 Boys / Princes with PrinceXX naming and PRINCE classification', () => {
      const princes = SEMINAR_ACCOUNTS.filter(a => a.classification === 'PRINCE');
      expect(princes.length).toBe(32);
      princes.forEach(p => {
        const paddedRoll = p.rollNumber.toString().padStart(2, '0');
        expect(p.name).toBe(`Prince${paddedRoll}`);
        expect(p.role).toBe('PLAYER');
      });
    });

    it('5. Exactly 17 Girls / Princesses with PrincessXX naming and PRINCESS classification', () => {
      const princesses = SEMINAR_ACCOUNTS.filter(a => a.classification === 'PRINCESS');
      expect(princesses.length).toBe(17);
      princesses.forEach(p => {
        const paddedRoll = p.rollNumber.toString().padStart(2, '0');
        expect(p.name).toBe(`Princess${paddedRoll}`);
        expect(p.role).toBe('PLAYER');
      });
    });

    it('6. Roll number 1 does NOT exist', () => {
      const roll1 = SEMINAR_ACCOUNTS.find(a => a.rollNumber === 1);
      expect(roll1).toBeUndefined();
      const user01 = SEMINAR_ACCOUNTS.find(a => a.username.includes('25001'));
      expect(user01).toBeUndefined();
    });

    it('7. Roll number 40 does NOT exist', () => {
      const roll40 = SEMINAR_ACCOUNTS.find(a => a.rollNumber === 40);
      expect(roll40).toBeUndefined();
      const user40 = SEMINAR_ACCOUNTS.find(a => a.username.includes('25040'));
      expect(user40).toBeUndefined();
    });

    it('8. No duplicate login IDs / usernames exist', () => {
      const usernames = SEMINAR_ACCOUNTS.map(a => a.username);
      const uniqueUsernames = new Set(usernames);
      expect(uniqueUsernames.size).toBe(49);
    });

    it('10. Exactly 32 students belong to team PRINCES and have PRINCE classification', () => {
      const princes = SEMINAR_ACCOUNTS.filter(a => a.team === 'PRINCES');
      expect(princes.length).toBe(32);
      princes.forEach(p => {
        expect(p.classification).toBe('PRINCE');
        expect(p.role).toBe('PLAYER');
      });
    });

    it('11. Exactly 17 students belong to team PRINCESSES and have PRINCESS classification', () => {
      const princesses = SEMINAR_ACCOUNTS.filter(a => a.team === 'PRINCESSES');
      expect(princesses.length).toBe(17);
      princesses.forEach(p => {
        expect(p.classification).toBe('PRINCESS');
        expect(p.role).toBe('PLAYER');
      });
    });

    it('12. No admin accounts in SEMINAR_ACCOUNTS to have team = null', () => {
      const admins = SEMINAR_ACCOUNTS.filter(a => a.role === 'ADMIN');
      expect(admins.length).toBe(0);
    });

    it('13. Zero accounts belong to TEAM_OMEGA or TEAM_BETA', () => {
      const omegaAccounts = SEMINAR_ACCOUNTS.filter((a: any) => a.team === 'TEAM_OMEGA' || a.team === 'TEAM OMEGA');
      const betaAccounts = SEMINAR_ACCOUNTS.filter((a: any) => a.team === 'TEAM_BETA' || a.team === 'TEAM BETA');
      expect(omegaAccounts.length).toBe(0);
      expect(betaAccounts.length).toBe(0);
    });
  });

  describe('Login Endpoint Enforcement', () => {
    it('1. New student login ID succeeds with valid credentials and returns PLAYER role', async () => {
      const studentAcc = SEMINAR_ACCOUNTS.find(a => a.username === 'ch.sc.u4cys25002')!;
      const hash = await bcrypt.hash(studentAcc.initialPassword, 10);

      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'student-2-uuid',
        username: 'ch.sc.u4cys25002',
        name: 'Prince02',
        classification: 'PRINCE',
        passwordHash: hash,
        role: 'PLAYER'
      });

      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'ch.sc.u4cys25002', password: studentAcc.initialPassword });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.username).toBe('ch.sc.u4cys25002');
      expect(res.body.user.role).toBe('PLAYER');

      const decoded = jwt.verify(res.body.token, JWT_SECRET) as any;
      expect(decoded.id).toBe('student-2-uuid');
      expect(decoded.role).toBe('PLAYER');
    });

    it('2. Old student login ID (e.g. student02) fails authentication with 401', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'student02', password: 'nw-k9X2#mP8q' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('3. Admin login succeeds with valid credentials and returns ADMIN role', async () => {
      const hash = await bcrypt.hash('admin-password', 10);

      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'admin-4-uuid',
        username: 'bala',
        name: 'Bala',
        passwordHash: hash,
        role: 'ADMIN'
      });

      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'bala', password: 'admin-password' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.username).toBe('bala');
      expect(res.body.user.role).toBe('ADMIN');

      const decoded = jwt.verify(res.body.token, JWT_SECRET) as any;
      expect(decoded.role).toBe('ADMIN');
    });

    it('4. Invalid password fails with 401 Unauthorized', async () => {
      const studentAcc = SEMINAR_ACCOUNTS.find(a => a.username === 'ch.sc.u4cys25002')!;
      const hash = await bcrypt.hash(studentAcc.initialPassword, 10);

      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'student-2-uuid',
        username: 'ch.sc.u4cys25002',
        passwordHash: hash,
        role: 'PLAYER'
      });

      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'ch.sc.u4cys25002', password: 'WrongPassword123!' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('5. Unknown login fails with 401 Unauthorized', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'nonexistent_user', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('6. Missing username or password returns 400 Bad Request', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'ch.sc.u4cys25002' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/required/);
    });

    it('7. demo-login endpoint no longer exists (404)', async () => {
      const res = await request(app)
        .post('/auth/demo-login')
        .send({});

      expect(res.status).toBe(404);
    });
  });
});
