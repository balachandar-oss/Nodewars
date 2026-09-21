import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/sharedAuth';
import prisma from '../utils/prisma';
import { gameEventBus, GameEvent } from '../services/GameEventBus';
import { registerGameEventHandlers } from './gameEvents';
import { initGameSocketConnections } from '../utils/gameSocket';

/**
 * Initialize Socket.IO with authentication and game event handlers
 * Sets up:
 * 1. Token-based authentication middleware
 * 2. Team room management (team:teamId)
 * 3. User-specific rooms (user:userId)
 * 4. Game event handlers and broadcasting
 * 5. GameEventBus to Socket.IO bridge
 */
export const initializeSocket = (io: Server) => {
  // ===== AUTHENTICATION MIDDLEWARE =====
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      // 1. Verify JWT token
      const decoded = verifyToken(token);

      // 2. Fetch user with team information
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          teamId: true,
          role: true,
          username: true
        }
      });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // 3. Attach verified user data to socket
      socket.data.user = {
        id: user.id,
        teamId: user.teamId,
        role: user.role,
        username: user.username
      };

      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // ===== CONNECTION HANDLER =====
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user?.id;
    const teamId = socket.data.user?.teamId;
    const username = socket.data.user?.username;

    console.log(`[SOCKET] Client connected: ${socket.id} (User: ${userId}@${username}, Team: ${teamId || 'NONE'})`);

    // Join team room if user has a team
    if (teamId) {
      const teamRoom = `team:${teamId}`;
      socket.join(teamRoom);
      console.log(`[SOCKET] User ${userId} joined team room: ${teamRoom}`);
    }

    // Join user-specific room for direct messaging
    if (userId) {
      const userRoom = `user:${userId}`;
      socket.join(userRoom);
      console.log(`[SOCKET] User ${userId} joined personal room: ${userRoom}`);
    }

    // Register game event handlers for this connection
    registerGameEventHandlers(io, socket);

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`[SOCKET] Client disconnected: ${socket.id} (User: ${userId})`);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`[SOCKET] Error on socket ${socket.id}: ${error}`);
    });
  });

  // ===== GAME EVENT BUS BRIDGE =====
  // Bridge GameEventBus to Socket.IO for server-side events
  gameEventBus.on('ANY_EVENT', (event: GameEvent) => {
    if (event.teamId) {
      // Team-scoped event: broadcast only to team members
      io.to(`team:${event.teamId}`).emit('game_event', event);
      console.log(`[SOCKET] Event ${event.type} broadcasted to team ${event.teamId}`);
    } else {
      // Global event: broadcast to all connected players
      io.emit('game_event', event);
      console.log(`[SOCKET] Event ${event.type} broadcasted globally`);
    }
  });

  // ===== INITIALIZE GAME SOCKET FEATURES =====
  // Set up additional socket features (sync, heartbeat, etc.)
  initGameSocketConnections(io);

  console.log(`[SOCKET] Socket.IO initialized with game event handlers`);
};
