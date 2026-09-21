/**
 * Socket.IO Helper Functions
 * Simplified wrappers for common Socket.IO operations in routes
 *
 * Usage in routes:
 *   import { emitGameEvent, notifyTeam } from '../utils/socketHelpers';
 *
 *   await emitGameEvent('BUG_DISCOVERED', { ... });
 *   await notifyTeam(teamId, 'Achievement', 'message');
 */

import { getIO } from './ioInstance';
import { gameEventBus } from '../services/GameEventBus';
import {
  emitPlayerMoved,
  emitBugDiscovered,
  emitBountySolved,
  emitFragmentCollected,
  emitRoomUnlocked,
  emitGameStarted,
  emitGameEnded
} from '../socket/gameEvents';
import {
  broadcastTeamUpdate,
  broadcastGameStateUpdate,
  broadcastLeaderboard,
  notifyUser,
  announceTeam,
  announceGlobal,
  emitServerEvent
} from './gameSocket';

/**
 * Emit a game event through the Socket.IO system
 * Handles all event types with proper validation
 */
export async function emitGameEvent(
  eventType: string,
  payload: any,
  teamId?: string
): Promise<void> {
  try {
    const io = getIO();

    switch (eventType) {
      case 'PLAYER_MOVED':
        await emitPlayerMoved(io, payload);
        break;
      case 'BUG_DISCOVERED':
        await emitBugDiscovered(io, payload);
        break;
      case 'BOUNTY_SOLVED':
        await emitBountySolved(io, payload);
        break;
      case 'FRAGMENT_COLLECTED':
        await emitFragmentCollected(io, payload);
        break;
      case 'ROOM_UNLOCKED':
        await emitRoomUnlocked(io, payload);
        break;
      case 'GAME_STARTED':
        await emitGameStarted(io, payload);
        break;
      case 'GAME_ENDED':
        await emitGameEnded(io, payload);
        break;
      default:
        // Generic event
        emitServerEvent(io, eventType, payload, teamId);
    }
  } catch (error) {
    console.error(`[SOCKET_HELPER] Error emitting event ${eventType}: ${error}`);
  }
}

/**
 * Notify a specific player
 */
export async function notifyPlayer(
  userId: string,
  title: string,
  message: string,
  data?: any
): Promise<void> {
  try {
    const io = getIO();
    notifyUser(io, userId, title, message, data);
  } catch (error) {
    console.error(`[SOCKET_HELPER] Error notifying player ${userId}: ${error}`);
  }
}

/**
 * Send announcement to a team
 */
export async function notifyTeam(
  teamId: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'danger' = 'info'
): Promise<void> {
  try {
    const io = getIO();
    announceTeam(io, teamId, title, message, type);
  } catch (error) {
    console.error(`[SOCKET_HELPER] Error notifying team ${teamId}: ${error}`);
  }
}

/**
 * Send announcement to all players
 */
export async function notifyAllPlayers(
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'danger' = 'info'
): Promise<void> {
  try {
    const io = getIO();
    announceGlobal(io, title, message, type);
  } catch (error) {
    console.error(`[SOCKET_HELPER] Error notifying all players: ${error}`);
  }
}

/**
 * Update team stats for all team members
 */
export async function updateTeamStats(teamId: string): Promise<void> {
  try {
    const io = getIO();
    await broadcastTeamUpdate(io, teamId);
  } catch (error) {
    console.error(`[SOCKET_HELPER] Error updating team ${teamId} stats: ${error}`);
  }
}

/**
 * Update game state for all players
 */
export async function updateGameState(): Promise<void> {
  try {
    const io = getIO();
    await broadcastGameStateUpdate(io);
  } catch (error) {
    console.error(`[SOCKET_HELPER] Error updating game state: ${error}`);
  }
}

/**
 * Update leaderboard for all players
 */
export async function updateLeaderboard(): Promise<void> {
  try {
    const io = getIO();
    await broadcastLeaderboard(io);
  } catch (error) {
    console.error(`[SOCKET_HELPER] Error updating leaderboard: ${error}`);
  }
}

/**
 * Convenience wrapper to emit event through GameEventBus
 * Use this when you want to trigger events from non-route code
 */
export function emitViaBus(
  eventType: string,
  teamId?: string,
  metadata?: any
): void {
  gameEventBus.emitEvent({
    type: eventType,
    teamId,
    timestamp: new Date().toISOString(),
    metadata
  });
}

/**
 * Quick notification + team update pattern
 * Commonly used when player completes an action
 */
export async function playerAchievement(
  userId: string,
  teamId: string,
  title: string,
  message: string,
  points?: number
): Promise<void> {
  try {
    // Notify the player
    await notifyPlayer(userId, title, message, { points });

    // Announce to team
    await notifyTeam(teamId, title, message, 'success');

    // Update team stats
    await updateTeamStats(teamId);

    // Update global leaderboard
    await updateLeaderboard();
  } catch (error) {
    console.error(`[SOCKET_HELPER] Error in playerAchievement: ${error}`);
  }
}

/**
 * Error broadcasting
 * Use this to inform players of errors
 */
export async function broadcastError(
  message: string,
  teamId?: string
): Promise<void> {
  try {
    const io = getIO();

    if (teamId) {
      announceTeam(io, teamId, 'Error', message, 'danger');
    } else {
      announceGlobal(io, 'Error', message, 'danger');
    }
  } catch (error) {
    console.error(`[SOCKET_HELPER] Error broadcasting error: ${error}`);
  }
}
