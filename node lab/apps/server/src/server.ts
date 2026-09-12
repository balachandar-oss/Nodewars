import express from 'express';
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

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // TODO: restrict in production
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

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

import { initializeSocket } from './socket';

initializeSocket(io);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`[SERVER] Node Lab Engine running on port ${PORT}`);
});
