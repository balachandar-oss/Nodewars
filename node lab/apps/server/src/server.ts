import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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
import { GameService } from './services/GameService';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    message: { error: 'Too many requests' }
  });
  
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per windowMs for auth
    message: { error: 'Too many authentication attempts' }
  });

  app.use('/api', globalLimiter);
  app.use('/api/auth', authLimiter);
}

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ONLINE', service: 'Node Lab Engine' });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

import { initializeSocket } from './socket';

initializeSocket(io);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`[SERVER] Node Lab Engine running on port ${PORT}`);
  GameService.initTimerOnBoot().catch(console.error);
});
