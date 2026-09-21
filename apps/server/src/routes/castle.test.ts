import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import castleRoutes from './castle';
import { GameService } from '../services/GameService';

jest.mock('../utils/prisma', () => {
  return {
    __esModule: true,
    default: {
      user: {
        findUnique: jest.fn()
      },
      castleComponent: {
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

jest.mock('../services/GameEventBus', () => {
  return {
    gameEventBus: {
      emit: jest.fn()
    }
  };
});

import prismaMock from '../utils/prisma';

const app = express();
app.use(express.json());
app.use('/castle', castleRoutes);

describe('Castle Scan API', () => {
  const token = jwt.sign({ id: 'user-1', role: 'PLAYER' }, process.env.JWT_SECRET || 'super-secret-node-wars-key-change-in-prod');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects unauthenticated scan', async () => {
    const res = await request(app).post('/castle/scan').send({ physicalCode: 'abc' });
    expect(res.status).toBe(401);
  });

  it('rejects scan outside HUNT phase', async () => {
    (GameService.getPhase as jest.Mock).mockResolvedValue('ENGINEERING');
    const res = await request(app).post('/castle/scan').set('Authorization', `Bearer ${token}`).send({ physicalCode: 'abc' });
    expect(res.status).toBe(403);
  });

  it('rejects unknown physicalCode', async () => {
    (GameService.getPhase as jest.Mock).mockResolvedValue('HUNT');
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1', teamId: 'team-omega' });
    (prismaMock.castleComponent.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post('/castle/scan').set('Authorization', `Bearer ${token}`).send({ physicalCode: 'invalid' });
    expect(res.status).toBe(404);
  });

  it('rejects scanning own team component', async () => {
    (GameService.getPhase as jest.Mock).mockResolvedValue('HUNT');
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1', teamId: 'team-omega' });
    (prismaMock.castleComponent.findUnique as jest.Mock).mockResolvedValue({
      id: 'comp-1',
      teamId: 'team-omega',
      systemId: 'SERVER',
      team: { name: 'TEAM OMEGA' }
    });

    const res = await request(app).post('/castle/scan').set('Authorization', `Bearer ${token}`).send({ physicalCode: 'valid' });
    expect(res.status).toBe(403);
    expect(res.body.error).toContain('HOME CASTLE COMPONENT');
  });

  it('successfully scans opposing team component', async () => {
    (GameService.getPhase as jest.Mock).mockResolvedValue('HUNT');
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1', teamId: 'team-omega' });
    (prismaMock.castleComponent.findUnique as jest.Mock).mockResolvedValue({
      id: 'comp-1',
      teamId: 'team-beta',
      systemId: 'SECURITY_GATE',
      displayName: 'Security Gate',
      team: { name: 'TEAM BETA' }
    });

    const res = await request(app).post('/castle/scan').set('Authorization', `Bearer ${token}`).send({ physicalCode: 'valid' });
    expect(res.status).toBe(200);
    expect(res.body.component.systemId).toBe('SECURITY_GATE');
    expect(res.body.team).toBe('TEAM BETA');
    expect(res.body.state).toBe('UNKNOWN');
    expect(res.body.bugId).toBeUndefined(); // Ensure no leak
  });
});
