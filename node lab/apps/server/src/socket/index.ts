import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/sharedAuth';
import prisma from '../utils/prisma';
import { gameEventBus, GameEvent } from '../services/GameEventBus';

export const initializeSocket = (io: Server) => {
  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      // 1. Verify token
      const decoded = verifyToken(token);
      
      // 2. Fetch user to get teamId
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, teamId: true, role: true }
      });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach data to socket
      socket.data.user = {
        id: user.id,
        teamId: user.teamId,
        role: user.role
      };

      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const { id, teamId } = socket.data.user;
    
    console.log(`[SOCKET] Client connected: ${socket.id} (User: ${id})`);

    // Join team room if user has a team
    if (teamId) {
      const roomName = `team:${teamId}`;
      socket.join(roomName);
      console.log(`[SOCKET] User ${id} joined room ${roomName}`);
    }

    socket.on('disconnect', () => {
      console.log(`[SOCKET] Client disconnected: ${socket.id}`);
    });
  });

  // Bridge GameEventBus to Socket.IO
  gameEventBus.on('ANY_EVENT', (event: GameEvent) => {
    if (event.teamId) {
      // Broadcast to specific team
      io.to(`team:${event.teamId}`).emit('game_event', event);
    } else {
      // Broadcast to all if no team specified
      io.emit('game_event', event);
    }
  });
};
