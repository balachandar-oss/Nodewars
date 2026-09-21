/**
 * Game Socket Utilities
 * Provides helper functions for Socket.IO game communications
 * Handles initialization, broadcast logic, and team room management
 */

import { Server, Socket } from 'socket.io';
import prisma from './prisma';
import {
  PlayerMovedPayload,
  BugDiscoveredPayload,
  BountySolvedPayload,
  FragmentCollectedPayload,
  RoomUnlockedPayload,
  GameStartedPayload,
  GameEndedPayload
} from '../types/gameEvents';

/**
 * Initialize game socket connections
 * Sets up team room management and event handlers
 */
export function initGameSocketConnections(io: Server): void {
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user?.id;
    const teamId = socket.data.user?.teamId;
    const username = socket.data.user?.username;

    console.log(`[SOCKET] Game connection: ${socket.id} (User: ${userId}, Team: ${teamId})`);

    // Setup user-specific room for direct messaging
    if (userId) {
      socket.join(`user:${userId}`);
    }

    // Handle socket disconnect
    socket.on('disconnect', () => {
      console.log(`[SOCKET] Game disconnection: ${socket.id} (User: ${userId})`);
    });

    // Handle user-initiated requests for game state sync
    socket.on('request_sync', async (callback?: Function) => {
      try {
        const gameState = await getGameState();
        const teamStats = teamId ? await getTeamStats(teamId) : null;

        const syncData = {
          gameState,
          teamStats,
          userTeamId: teamId,
          userId
        };

        if (callback) {
          callback({ success: true, data: syncData });
        }
      } catch (error) {
        console.error(`[SOCKET] Error syncing game state: ${error}`);
        if (callback) {
          callback({ success: false, error: 'Failed to sync game state' });
        }
      }
    });

    // Handle heartbeat/ping
    socket.on('ping', (callback?: Function) => {
      if (callback) {
        callback({ pong: true, serverTime: new Date().toISOString() });
      }
    });
  });
}

/**
 * Get current game state from database
 */
export async function getGameState(): Promise<any> {
  try {
    const gameState = await prisma.gameState.findUnique({
      where: { id: 'singleton' }
    });

    if (!gameState) {
      return {
        id: 'singleton',
        phase: 'ENGINEERING',
        updatedAt: new Date().toISOString()
      };
    }

    return gameState;
  } catch (error) {
    console.error(`[GAME_SOCKET] Error getting game state: ${error}`);
    throw error;
  }
}

/**
 * Get team statistics and state
 */
export async function getTeamStats(teamId: string): Promise<any> {
  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
        huntScore: true,
        users: {
          select: {
            id: true,
            username: true,
            huntScore: true,
            level: true
          }
        },
        plantedBugs: {
          where: { architectTeamId: teamId },
          select: {
            id: true,
            status: true,
            vulnerabilityType: true
          }
        },
        targetedBugs: {
          where: { targetTeamId: teamId },
          select: {
            id: true,
            status: true,
            vulnerabilityType: true
          }
        },
        castleComponents: {
          select: {
            id: true,
            systemId: true,
            displayName: true,
            active: true
          }
        }
      }
    });

    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    return {
      teamId: team.id,
      teamName: team.name,
      totalScore: team.huntScore,
      playerCount: team.users.length,
      players: team.users,
      bugsPlanted: team.plantedBugs.length,
      bugsDiscovered: team.targetedBugs.filter(b => b.status === 'DISCOVERED').length,
      bugsClaimed: team.targetedBugs.filter(b => b.status === 'CLAIMED').length,
      castleComponents: team.castleComponents,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error(`[GAME_SOCKET] Error getting team stats: ${error}`);
    throw error;
  }
}

/**
 * Broadcast team update to all team members
 */
export async function broadcastTeamUpdate(
  io: Server,
  teamId: string
): Promise<void> {
  try {
    const teamStats = await getTeamStats(teamId);
    io.to(`team:${teamId}`).emit('team_update', teamStats);
    console.log(`[GAME_SOCKET] Team update broadcasted to ${teamId}`);
  } catch (error) {
    console.error(`[GAME_SOCKET] Error broadcasting team update: ${error}`);
  }
}

/**
 * Broadcast game state update to all players
 */
export async function broadcastGameStateUpdate(
  io: Server
): Promise<void> {
  try {
    const gameState = await getGameState();
    io.emit('game_state_update', gameState);
    console.log(`[GAME_SOCKET] Game state update broadcasted: ${gameState.phase}`);
  } catch (error) {
    console.error(`[GAME_SOCKET] Error broadcasting game state: ${error}`);
  }
}

/**
 * Broadcast leaderboard to all players
 */
export async function broadcastLeaderboard(
  io: Server
): Promise<void> {
  try {
    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        huntScore: true,
        users: {
          select: {
            id: true,
            username: true,
            huntScore: true
          }
        }
      },
      orderBy: {
        huntScore: 'desc'
      }
    });

    const leaderboard = {
      teams: teams.map(team => ({
        teamId: team.id,
        teamName: team.name,
        score: team.huntScore,
        playerCount: team.users.length,
        topPlayer: team.users.length > 0
          ? {
              username: team.users[0].username,
              score: team.users[0].huntScore
            }
          : null
      })),
      updatedAt: new Date().toISOString()
    };

    io.emit('leaderboard_update', leaderboard);
    console.log(`[GAME_SOCKET] Leaderboard broadcasted to all players`);
  } catch (error) {
    console.error(`[GAME_SOCKET] Error broadcasting leaderboard: ${error}`);
  }
}

/**
 * Get all connected players in a team
 */
export function getTeamConnections(io: Server, teamId: string): string[] {
  const room = io.sockets.adapter.rooms.get(`team:${teamId}`);
  return room ? Array.from(room) : [];
}

/**
 * Get all connected players globally
 */
export function getAllConnections(io: Server): string[] {
  return Array.from(io.sockets.sockets.keys());
}

/**
 * Disconnect a specific socket (useful for session management)
 */
export function disconnectSocket(io: Server, socketId: string, reason: string): void {
  const socket = io.sockets.sockets.get(socketId);
  if (socket) {
    socket.disconnect(true);
    console.log(`[GAME_SOCKET] Socket ${socketId} disconnected: ${reason}`);
  }
}

/**
 * Send a notification to a specific user
 */
export function notifyUser(
  io: Server,
  userId: string,
  title: string,
  message: string,
  data?: any
): void {
  io.to(`user:${userId}`).emit('notification', {
    id: `notif:${Date.now()}:${Math.random()}`,
    title,
    message,
    data,
    timestamp: new Date().toISOString()
  });

  console.log(`[GAME_SOCKET] Notification sent to user ${userId}: ${title}`);
}

/**
 * Send a team announcement
 */
export function announceTeam(
  io: Server,
  teamId: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'danger' = 'info'
): void {
  io.to(`team:${teamId}`).emit('team_announcement', {
    id: `announce:${Date.now()}:${Math.random()}`,
    teamId,
    title,
    message,
    type,
    timestamp: new Date().toISOString()
  });

  console.log(`[GAME_SOCKET] Team announcement to ${teamId}: ${title}`);
}

/**
 * Send a global announcement to all players
 */
export function announceGlobal(
  io: Server,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'danger' = 'info'
): void {
  io.emit('global_announcement', {
    id: `announce:${Date.now()}:${Math.random()}`,
    title,
    message,
    type,
    timestamp: new Date().toISOString()
  });

  console.log(`[GAME_SOCKET] Global announcement: ${title}`);
}

/**
 * Get socket connection count
 */
export function getConnectionStats(io: Server): {
  totalConnections: number;
  connectionsByTeam: Record<string, number>;
} {
  const stats = {
    totalConnections: io.sockets.sockets.size,
    connectionsByTeam: {} as Record<string, number>
  };

  io.sockets.sockets.forEach((socket) => {
    const teamId = socket.data.user?.teamId;
    if (teamId) {
      stats.connectionsByTeam[teamId] = (stats.connectionsByTeam[teamId] || 0) + 1;
    }
  });

  return stats;
}

/**
 * Emit a server event through the game event bus
 * Useful for server-side actions that should propagate to clients
 */
export function emitServerEvent(
  io: Server,
  eventType: string,
  payload: any,
  teamId?: string
): void {
  const event = {
    type: eventType,
    teamId,
    payload,
    timestamp: new Date().toISOString()
  };

  if (teamId) {
    io.to(`team:${teamId}`).emit('game_event', event);
  } else {
    io.emit('game_event', event);
  }

  console.log(`[GAME_SOCKET] Server event emitted: ${eventType}${teamId ? ` to team ${teamId}` : ' globally'}`);
}
