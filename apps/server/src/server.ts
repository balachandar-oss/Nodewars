import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import missionRoutes from './routes/missions';
import quizRoutes from './routes/quiz';
import leaderboardRoutes from './routes/leaderboard';
import bugsRoutes from './routes/bugs';
import huntRoutes from './routes/hunt';
import adminRoutes from './routes/admin';
import castleRoutes from './routes/castle';
import gameRoutes from './routes/game';
import gamesRoutes from './routes/games';
import scoresRoutes from './routes/scores';
import bountyRoutes from './routes/bounty';
import flagsRoutes from './routes/flags';

// ===== EXPRESS & SERVER SETUP =====
const app = express();
const httpServer = createServer(app);

// ===== CORS CONFIGURATION =====
export const getAllowedOrigins = (): string[] => {
  const isProd = process.env.NODE_ENV === 'production';
  const rawOrigins: string[] = [];

  if (process.env.FRONTEND_URL) rawOrigins.push(process.env.FRONTEND_URL);
  if (process.env.CORS_ORIGIN) rawOrigins.push(process.env.CORS_ORIGIN);
  if (process.env.SOCKET_CORS_ORIGIN) rawOrigins.push(process.env.SOCKET_CORS_ORIGIN);

  const cleanOrigins = new Set<string>();
  for (const raw of rawOrigins) {
    for (const part of raw.split(',')) {
      const trimmed = part.trim().replace(/\/+$/, '');
      if (trimmed) cleanOrigins.add(trimmed);
    }
  }

  if (!isProd) {
    cleanOrigins.add('http://localhost:5173');
    cleanOrigins.add('http://localhost:3000');
    cleanOrigins.add('http://localhost:3001');
    cleanOrigins.add('http://127.0.0.1:5173');
    cleanOrigins.add('http://127.0.0.1:3000');
    cleanOrigins.add('http://127.0.0.1:3001');
  }

  return Array.from(cleanOrigins);
};

const corsOriginDelegate = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  if (!origin) return callback(null, true);

  const normalized = origin.trim().replace(/\/+$/, '');
  const allowed = getAllowedOrigins();

  if (process.env.NODE_ENV !== 'production' && allowed.length === 0) {
    return callback(null, true);
  }

  const isAllowed = allowed.includes(normalized);
  return callback(null, isAllowed);
};

// ===== SOCKET.IO SETUP =====
const io = new Server(httpServer, {
  cors: {
    origin: corsOriginDelegate,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingInterval: 25000,
  pingTimeout: 20000,
  maxHttpBufferSize: 1e6 // 1MB max message size
});

// ===== MIDDLEWARE =====
app.use(cors({
  origin: corsOriginDelegate,
  credentials: true
}));
app.use(express.json());

// Make io instance available to routes via req.app.get('io')
app.set('io', io);

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

// ===== ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/bugs', bugsRoutes);
app.use('/api/hunt', huntRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/castle', castleRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api/flags', flagsRoutes);
app.use('/api', bountyRoutes);

// ===== TEST ENDPOINTS (Development) =====
app.post('/api/test/create-game', async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not Found' });
  }

  try {
    const prisma = (await import('./utils/prisma')).default;
    const { gameSeeds } = await import('./seeds/gameSeeds');

    const { name, teamAName, teamBName } = req.body;

    if (!name || !teamAName || !teamBName) {
      return res.status(400).json({
        error: 'Game name, teamAName, and teamBName are required'
      });
    }

    // Create or get teams
    let teamA = await prisma.team.findUnique({ where: { name: teamAName } });
    if (!teamA) {
      teamA = await prisma.team.create({ data: { name: teamAName, huntScore: 0 } });
    }

    let teamB = await prisma.team.findUnique({ where: { name: teamBName } });
    if (!teamB) {
      teamB = await prisma.team.create({ data: { name: teamBName, huntScore: 0 } });
    }

    // Create game
    const game = await prisma.game.create({
      data: {
        status: 'WAITING',
        teamAId: teamA.id,
        teamBId: teamB.id
      }
    });

    // Get or create admin user from teamA
    let adminUser = await prisma.user.findFirst({
      where: { teamId: teamA.id, role: 'ADMIN' }
    });

    if (!adminUser) {
      adminUser = await prisma.user.findFirst({ where: { teamId: teamA.id } });
      if (!adminUser) {
        return res.status(400).json({ error: 'No users in team A' });
      }
    }

    // Seed 20 bugs for the game
    const createdBugs: any[] = [];
    const structureTypes = ['ROOM', 'TOWER', 'CORRIDOR', 'VAULT', 'CHAMBER'];

    for (let i = 0; i < gameSeeds.length; i++) {
      const bugSeed = gameSeeds[i];
      try {
        // Create the bug question
        const bugQuestion = await (prisma as any).bugQuestion.create({
          data: {
            text: bugSeed.question,
            options: JSON.stringify(bugSeed.options),
            correctAnswer: bugSeed.correctAnswer,
            explanation: `This is a ${bugSeed.difficulty} difficulty security question about ${bugSeed.vulnerabilityType}`
          }
        });

        // Create flag fragment
        const fragment = await (prisma as any).flagFragment.create({
          data: {
            position: ((i) % 4) + 1,
            value: `${bugSeed.vulnerabilityType}_FRAG_${i + 1}`,
            gameId: game.id,
            teamId: teamB.id
          }
        });

        const structureType = structureTypes[i % structureTypes.length];

        // Create the bug
        const newBug = await prisma.bug.create({
          data: {
            architectUserId: adminUser.id,
            architectTeamId: teamA.id,
            targetTeamId: teamB.id,
            gameId: game.id,
            vulnerabilityType: bugSeed.vulnerabilityType,
            targetSystem: bugSeed.targetSystem,
            structureType,
            difficulty: bugSeed.difficulty,
            questionId: bugQuestion.id,
            fragmentId: fragment.id,
            configuration: JSON.stringify({
              difficulty: bugSeed.difficulty,
              ...bugSeed.configuration
            }),
            status: 'DRAFT'
          }
        });

        createdBugs.push({
          id: newBug.id,
          vulnerabilityType: newBug.vulnerabilityType,
          difficulty: newBug.difficulty
        });
      } catch (error) {
        console.error(`Failed to create bug ${bugSeed.id}:`, error);
      }
    }

    // Create BugArchitect record for admin user
    await (prisma as any).bugArchitect.upsert({
      where: {
        gameId_userId: { gameId: game.id, userId: adminUser.id }
      },
      update: { bugsPlanted: 0 },
      create: {
        gameId: game.id,
        userId: adminUser.id,
        teamId: teamA.id,
        bugsPlanted: 0
      }
    });

    res.json({
      message: 'Test game created with seeded bugs',
      gameId: game.id,
      teamA: { id: teamA.id, name: teamA.name },
      teamB: { id: teamB.id, name: teamB.name },
      bugsCreated: createdBugs.length,
      bugs: createdBugs
    });
  } catch (error) {
    console.error('Failed to create test game', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check endpoints (includes Socket.IO stats)
const handleHealth = (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'Node Lab Engine',
    socketConnections: io.engine.clientsCount,
    timestamp: new Date().toISOString()
  });
};

app.get('/health', handleHealth);
app.get('/api/health', handleHealth);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ===== SOCKET.IO INITIALIZATION =====
import { initializeSocket } from './socket';
import { setIO } from './utils/ioInstance';

try {
  initializeSocket(io);
  setIO(io); // Register io instance globally for routes
  console.log(`[SOCKET] Socket.IO initialized successfully`);
} catch (error) {
  console.error(`[SOCKET] Failed to initialize Socket.IO: ${error}`);
}

// ===== SERVER STARTUP =====
const PORT = Number(process.env.PORT) || 3001;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] Node Lab Engine running on port ${PORT} (bound to 0.0.0.0)`);
  console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[SERVER] Allowed CORS origins:`, getAllowedOrigins());
});

// ===== ERROR HANDLING =====
process.on('unhandledRejection', (reason, promise) => {
  console.error(`[ERROR] Unhandled Rejection at: ${promise}. Reason: ${reason}`);
});

process.on('uncaughtException', (error) => {
  console.error(`[ERROR] Uncaught Exception: ${error}`);
  process.exit(1);
});

export { app, httpServer, io };
