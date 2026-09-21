/**
 * Game Events Module
 * Handles all real-time game event emissions via Socket.IO
 * All events are server-authoritative and validated on the server
 */

import { Server, Socket } from 'socket.io';
import { gameEventBus } from '../services/GameEventBus';
import prisma from '../utils/prisma';
import {
  PlayerMovedPayload,
  BugDiscoveredPayload,
  BountySolvedPayload,
  FragmentCollectedPayload,
  RoomUnlockedPayload,
  GameStartedPayload,
  GameEndedPayload,
  BroadcastOptions
} from '../types/gameEvents';

/**
 * Emit player movement event
 * Server-validates that player belongs to team and position is valid
 */
export async function emitPlayerMoved(
  io: Server,
  payload: PlayerMovedPayload
): Promise<void> {
  try {
    // Validate user exists and belongs to correct team
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, teamId: true }
    });

    if (!user || user.teamId !== payload.teamId) {
      console.error(`[GAME_EVENT] Invalid player moved event: User ${payload.userId} not in team ${payload.teamId}`);
      return;
    }

    // Validate position coordinates are reasonable
    if (typeof payload.position.x !== 'number' || typeof payload.position.y !== 'number') {
      console.error(`[GAME_EVENT] Invalid position coordinates: ${JSON.stringify(payload.position)}`);
      return;
    }

    const event = {
      type: 'PLAYER_MOVED',
      teamId: payload.teamId,
      payload,
      timestamp: payload.timestamp || new Date().toISOString()
    };

    // Emit to team room only
    io.to(`team:${payload.teamId}`).emit('game_event', event);
    console.log(`[GAME_EVENT] Player ${payload.userId} moved in team ${payload.teamId}`);
  } catch (error) {
    console.error(`[GAME_EVENT] Error emitting player moved: ${error}`);
  }
}

/**
 * Emit bug discovered event
 * Server-validates that the bug exists and belongs to discovering team
 */
export async function emitBugDiscovered(
  io: Server,
  payload: BugDiscoveredPayload
): Promise<void> {
  try {
    // Validate bug exists and belongs to discovering team
    const bug = await prisma.bug.findUnique({
      where: { id: payload.bugId },
      select: {
        id: true,
        status: true,
        targetTeamId: true,
        vulnerabilityType: true,
        targetSystem: true
      }
    });

    if (!bug) {
      console.error(`[GAME_EVENT] Bug not found: ${payload.bugId}`);
      return;
    }

    if (bug.status !== 'PLANTED') {
      console.error(`[GAME_EVENT] Bug ${payload.bugId} is not in PLANTED status: ${bug.status}`);
      return;
    }

    if (bug.targetTeamId !== payload.discoveredBy.teamId) {
      console.error(`[GAME_EVENT] Discovering team mismatch for bug ${payload.bugId}`);
      return;
    }

    // Update bug status to DISCOVERED in database
    await prisma.bug.update({
      where: { id: payload.bugId },
      data: { status: 'DISCOVERED', discoveredAt: new Date() }
    });

    const event = {
      type: 'BUG_DISCOVERED',
      teamId: payload.discoveredBy.teamId,
      payload,
      timestamp: payload.timestamp || new Date().toISOString()
    };

    // Broadcast to discovering team only
    io.to(`team:${payload.discoveredBy.teamId}`).emit('game_event', event);
    console.log(`[GAME_EVENT] Bug ${payload.bugId} discovered by team ${payload.discoveredBy.teamId}`);
  } catch (error) {
    console.error(`[GAME_EVENT] Error emitting bug discovered: ${error}`);
  }
}

/**
 * Emit bounty solved event (bug claimed and resolved)
 * Server-validates that the user can claim the bug and awards points
 */
export async function emitBountySolved(
  io: Server,
  payload: BountySolvedPayload
): Promise<void> {
  try {
    // Validate bug exists and is in discoverable/claimable state
    const bug = await prisma.bug.findUnique({
      where: { id: payload.bugId },
      select: {
        id: true,
        status: true,
        targetTeamId: true,
        architectTeamId: true
      }
    });

    if (!bug) {
      console.error(`[GAME_EVENT] Bug not found for bounty: ${payload.bugId}`);
      return;
    }

    if (bug.status !== 'DISCOVERED' && bug.status !== 'PLANTED') {
      console.error(`[GAME_EVENT] Bug ${payload.bugId} cannot be claimed in status: ${bug.status}`);
      return;
    }

    if (bug.targetTeamId !== payload.answeredBy.teamId) {
      console.error(`[GAME_EVENT] Claiming team mismatch for bug ${payload.bugId}`);
      return;
    }

    // Update bug status and claim information in database
    await prisma.bug.update({
      where: { id: payload.bugId },
      data: {
        status: 'CLAIMED',
        claimedByUserId: payload.answeredBy.userId,
        claimedByTeamId: payload.answeredBy.teamId,
        claimedAt: new Date(),
        resolvedAt: new Date()
      }
    });

    // Update team score
    await prisma.team.update({
      where: { id: payload.answeredBy.teamId },
      data: { huntScore: { increment: payload.points } }
    });

    // Update user score
    await prisma.user.update({
      where: { id: payload.answeredBy.userId },
      data: { huntScore: { increment: payload.points } }
    });

    const event = {
      type: 'BOUNTY_SOLVED',
      teamId: payload.answeredBy.teamId,
      payload,
      timestamp: payload.timestamp || new Date().toISOString()
    };

    // Broadcast to claiming team
    io.to(`team:${payload.answeredBy.teamId}`).emit('game_event', event);
    console.log(`[GAME_EVENT] Bug ${payload.bugId} claimed by team ${payload.answeredBy.teamId}, +${payload.points} points`);
  } catch (error) {
    console.error(`[GAME_EVENT] Error emitting bounty solved: ${error}`);
  }
}

/**
 * Emit fragment collected event
 * Server-tracks fragment collection for game progression
 */
export async function emitFragmentCollected(
  io: Server,
  payload: FragmentCollectedPayload
): Promise<void> {
  try {
    // Validate team exists
    const team = await prisma.team.findUnique({
      where: { id: payload.teamId },
      select: { id: true, name: true }
    });

    if (!team) {
      console.error(`[GAME_EVENT] Team not found: ${payload.teamId}`);
      return;
    }

    const event = {
      type: 'FRAGMENT_COLLECTED',
      teamId: payload.teamId,
      payload: {
        ...payload,
        fragmentCount: payload.fragmentCount || 1
      },
      timestamp: payload.timestamp || new Date().toISOString()
    };

    // Broadcast to team
    io.to(`team:${payload.teamId}`).emit('game_event', event);

    // Also emit to all (global game progress)
    io.emit('game_event', event);

    console.log(`[GAME_EVENT] Fragment collected by team ${payload.teamId}: ${payload.fragmentValue}`);
  } catch (error) {
    console.error(`[GAME_EVENT] Error emitting fragment collected: ${error}`);
  }
}

/**
 * Emit room unlocked event (castle component activated)
 * Server-validates that the team has earned access to the room
 */
export async function emitRoomUnlocked(
  io: Server,
  payload: RoomUnlockedPayload
): Promise<void> {
  try {
    // Validate castle component exists for team
    const component = await prisma.castleComponent.findUnique({
      where: { physicalCode: `NW:T:${payload.teamId}:S:${payload.systemId}` },
      select: { id: true, active: true, teamId: true }
    });

    if (!component) {
      console.error(`[GAME_EVENT] Castle component not found: ${payload.systemId} for team ${payload.teamId}`);
      return;
    }

    if (!component.active) {
      console.error(`[GAME_EVENT] Castle component not active: ${payload.systemId}`);
      return;
    }

    const event = {
      type: 'ROOM_UNLOCKED',
      teamId: payload.teamId,
      payload,
      timestamp: payload.timestamp || new Date().toISOString()
    };

    // Broadcast to team only
    io.to(`team:${payload.teamId}`).emit('game_event', event);
    console.log(`[GAME_EVENT] Room unlocked for team ${payload.teamId}: ${payload.roomName}`);
  } catch (error) {
    console.error(`[GAME_EVENT] Error emitting room unlocked: ${error}`);
  }
}

/**
 * Emit game started event
 * Server-authoritative: called when game transitions to HUNT phase
 */
export async function emitGameStarted(
  io: Server,
  payload: GameStartedPayload
): Promise<void> {
  try {
    const event = {
      type: 'GAME_STARTED',
      payload,
      timestamp: payload.timestamp || new Date().toISOString()
    };

    // Broadcast to all connected players
    io.emit('game_event', event);
    console.log(`[GAME_EVENT] Game started with phase: ${payload.phase}`);
  } catch (error) {
    console.error(`[GAME_EVENT] Error emitting game started: ${error}`);
  }
}

/**
 * Emit game ended event
 * Server-authoritative: called when game completes
 */
export async function emitGameEnded(
  io: Server,
  payload: GameEndedPayload
): Promise<void> {
  try {
    const event = {
      type: 'GAME_ENDED',
      payload,
      timestamp: payload.timestamp || new Date().toISOString()
    };

    // Broadcast to all connected players
    io.emit('game_event', event);
    console.log(`[GAME_EVENT] Game ended. Winner: ${payload.winner?.teamName || 'N/A'}`);
  } catch (error) {
    console.error(`[GAME_EVENT] Error emitting game ended: ${error}`);
  }
}

/**
 * Generic broadcast function for team-scoped events
 */
export async function broadcastTeamEvent(
  io: Server,
  teamId: string,
  eventType: string,
  payload: any,
  options?: BroadcastOptions
): Promise<void> {
  try {
    const event = {
      type: eventType,
      teamId,
      payload,
      timestamp: new Date().toISOString()
    };

    if (options?.toUser) {
      // Single user
      io.to(`user:${options.toUser}`).emit('game_event', event);
    } else if (options?.toAll) {
      // All players
      io.emit('game_event', event);
    } else {
      // Team only (default)
      io.to(`team:${teamId}`).emit('game_event', event);
    }

    console.log(`[GAME_EVENT] Broadcast event: ${eventType} to team ${teamId}`);
  } catch (error) {
    console.error(`[GAME_EVENT] Error broadcasting team event: ${error}`);
  }
}

/**
 * Handle incoming socket events from clients
 * Validates and processes client requests, then emits server-validated events
 */
export function registerGameEventHandlers(io: Server, socket: any): void {
  const userId = socket.data.user?.id;
  const teamId = socket.data.user?.teamId;

  if (!userId || !teamId) {
    console.warn(`[GAME_EVENT] Socket ${socket.id} missing user/team data`);
    return;
  }

  // Listen for client movement requests and validate server-side
  socket.on('request_player_moved', async (data: any, callback?: Function) => {
    try {
      await emitPlayerMoved(io, {
        userId,
        position: data.position,
        teamId,
        timestamp: new Date().toISOString()
      });

      if (callback) {
        callback({ success: true });
      }
    } catch (error) {
      console.error(`[GAME_EVENT] Error handling player_moved request: ${error}`);
      if (callback) {
        callback({ success: false, error: 'Failed to process movement' });
      }
    }
  });

  // Listen for bug discovery reports
  socket.on('request_bug_discovered', async (data: any, callback?: Function) => {
    try {
      await emitBugDiscovered(io, {
        bugId: data.bugId,
        discoveredBy: {
          userId,
          teamId,
          username: socket.data.user.username || 'Unknown'
        },
        vulnerabilityType: data.vulnerabilityType,
        targetSystem: data.targetSystem,
        timestamp: new Date().toISOString()
      });

      if (callback) {
        callback({ success: true });
      }
    } catch (error) {
      console.error(`[GAME_EVENT] Error handling bug_discovered request: ${error}`);
      if (callback) {
        callback({ success: false, error: 'Failed to report bug discovery' });
      }
    }
  });

  // Listen for bug claim/bounty solve requests
  socket.on('request_bounty_solved', async (data: any, callback?: Function) => {
    try {
      await emitBountySolved(io, {
        bugId: data.bugId,
        answeredBy: {
          userId,
          teamId,
          username: socket.data.user.username || 'Unknown'
        },
        points: data.points,
        fragment: data.fragment,
        timestamp: new Date().toISOString()
      });

      if (callback) {
        callback({ success: true });
      }
    } catch (error) {
      console.error(`[GAME_EVENT] Error handling bounty_solved request: ${error}`);
      if (callback) {
        callback({ success: false, error: 'Failed to claim bounty' });
      }
    }
  });
}
