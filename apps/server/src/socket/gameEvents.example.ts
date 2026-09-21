/**
 * Socket.IO Game Events - Usage Examples
 *
 * This file demonstrates how to use the game event system in the application.
 *
 * The system is organized as:
 * 1. Server-side event emitters (gameEvents.ts)
 * 2. Socket.IO initialization and authentication (index.ts)
 * 3. Utility helpers for broadcasting (utils/gameSocket.ts)
 * 4. Type definitions (types/gameEvents.ts)
 */

import { Server } from 'socket.io';
import {
  emitPlayerMoved,
  emitBugDiscovered,
  emitBountySolved,
  emitFragmentCollected,
  emitRoomUnlocked,
  emitGameStarted,
  emitGameEnded,
  broadcastTeamEvent
} from './gameEvents';
import {
  broadcastTeamUpdate,
  broadcastGameStateUpdate,
  broadcastLeaderboard,
  notifyUser,
  announceTeam,
  announceGlobal
} from '../utils/gameSocket';

/**
 * EXAMPLE 1: Emitting a player movement event
 * Called when a player moves in the game world
 */
export async function examplePlayerMovement(io: Server): Promise<void> {
  await emitPlayerMoved(io, {
    userId: 'user_123',
    position: { x: 100, y: 200 },
    teamId: 'team_omega_id',
    timestamp: new Date().toISOString()
  });
}

/**
 * EXAMPLE 2: Emitting a bug discovery event
 * Called when a player discovers a bug on the opposing team
 */
export async function exampleBugDiscovery(io: Server): Promise<void> {
  await emitBugDiscovered(io, {
    bugId: 'bug_456',
    discoveredBy: {
      userId: 'user_123',
      teamId: 'team_omega_id',
      username: 'PlayerName'
    },
    vulnerabilityType: 'SQL_INJECTION',
    targetSystem: 'DATABASE',
    timestamp: new Date().toISOString()
  });
}

/**
 * EXAMPLE 3: Emitting a bounty solved event
 * Called when a player claims and resolves a bug bounty
 */
export async function exampleBountySolved(io: Server): Promise<void> {
  await emitBountySolved(io, {
    bugId: 'bug_456',
    answeredBy: {
      userId: 'user_123',
      teamId: 'team_omega_id',
      username: 'PlayerName'
    },
    points: 50,
    fragment: {
      fragmentValue: 'security_key_part_1',
      description: 'A critical security key fragment for the castle'
    },
    timestamp: new Date().toISOString()
  });
}

/**
 * EXAMPLE 4: Emitting a fragment collected event
 * Called when a team collects a fragment (usually from solving a bounty)
 */
export async function exampleFragmentCollected(io: Server): Promise<void> {
  await emitFragmentCollected(io, {
    teamId: 'team_omega_id',
    fragmentValue: 'security_key_part_1',
    fragmentCount: 1,
    timestamp: new Date().toISOString()
  });
}

/**
 * EXAMPLE 5: Emitting a room unlocked event
 * Called when a team unlocks a new room in their castle
 */
export async function exampleRoomUnlocked(io: Server): Promise<void> {
  await emitRoomUnlocked(io, {
    teamId: 'team_omega_id',
    roomName: 'Security Gate',
    systemId: 'SECURITY_GATE',
    description: 'The main security gate to the castle has been unlocked',
    timestamp: new Date().toISOString()
  });
}

/**
 * EXAMPLE 6: Emitting a game started event
 * Called when the game transitions to HUNT phase
 */
export async function exampleGameStarted(io: Server): Promise<void> {
  await emitGameStarted(io, {
    gameId: 'game_session_1',
    phase: 'HUNT',
    teams: [
      { teamId: 'team_omega_id', teamName: 'TEAM OMEGA', playerCount: 5 },
      { teamId: 'team_beta_id', teamName: 'TEAM BETA', playerCount: 4 }
    ],
    timestamp: new Date().toISOString()
  });
}

/**
 * EXAMPLE 7: Emitting a game ended event
 * Called when the game completes
 */
export async function exampleGameEnded(io: Server): Promise<void> {
  await emitGameEnded(io, {
    gameId: 'game_session_1',
    phase: 'COMPLETE',
    winner: {
      teamId: 'team_omega_id',
      teamName: 'TEAM OMEGA',
      score: 500
    },
    finalScores: [
      {
        teamId: 'team_omega_id',
        teamName: 'TEAM OMEGA',
        score: 500,
        bugsPlanted: 10,
        bugsDiscovered: 8,
        bugsClaimed: 7,
        fragmentsCollected: 3
      },
      {
        teamId: 'team_beta_id',
        teamName: 'TEAM BETA',
        score: 350,
        bugsPlanted: 8,
        bugsDiscovered: 7,
        bugsClaimed: 5,
        fragmentsCollected: 2
      }
    ],
    timestamp: new Date().toISOString()
  });
}

/**
 * EXAMPLE 8: Broadcasting a team update
 * Updates all team members with current team stats
 */
export async function exampleBroadcastTeamUpdate(io: Server): Promise<void> {
  await broadcastTeamUpdate(io, 'team_omega_id');
}

/**
 * EXAMPLE 9: Broadcasting game state update
 * Updates all players with current game state (phase)
 */
export async function exampleBroadcastGameState(io: Server): Promise<void> {
  await broadcastGameStateUpdate(io);
}

/**
 * EXAMPLE 10: Broadcasting leaderboard
 * Updates all players with current leaderboard rankings
 */
export async function exampleBroadcastLeaderboard(io: Server): Promise<void> {
  await broadcastLeaderboard(io);
}

/**
 * EXAMPLE 11: Notifying a specific user
 * Sends a notification to one user only
 */
export function exampleNotifyUser(io: Server): void {
  notifyUser(
    io,
    'user_123',
    'Bug Discovered!',
    'Your team discovered a critical vulnerability on the opposing team',
    { bugId: 'bug_456', points: 10 }
  );
}

/**
 * EXAMPLE 12: Team announcement
 * Broadcasts an announcement to all team members
 */
export function exampleTeamAnnouncement(io: Server): void {
  announceTeam(
    io,
    'team_omega_id',
    'Strategy Update',
    'Focus on discovering bugs in the DATABASE system',
    'info'
  );
}

/**
 * EXAMPLE 13: Global announcement
 * Broadcasts an announcement to all players
 */
export function exampleGlobalAnnouncement(io: Server): void {
  announceGlobal(
    io,
    'HUNT Phase Starting!',
    'The bug hunt has begun. Good luck to both teams!',
    'success'
  );
}

/**
 * INTEGRATION GUIDE: How to use these events in routes
 *
 * In a route file (e.g., routes/hunt.ts):
 *
 * import { emitBugDiscovered, emitBountySolved } from '../socket/gameEvents';
 *
 * router.post('/bugs/:id/discover', authenticate, async (req, res) => {
 *   try {
 *     // ... validation and database updates ...
 *
 *     // After successfully updating the database:
 *     await emitBugDiscovered(req.app.get('io'), {
 *       bugId: bug.id,
 *       discoveredBy: {
 *         userId: req.user.id,
 *         teamId: req.user.teamId,
 *         username: req.user.username
 *       },
 *       vulnerabilityType: bug.vulnerabilityType,
 *       targetSystem: bug.targetSystem
 *     });
 *
 *     res.json({ message: 'Bug discovered!', points: 10 });
 *   } catch (error) {
 *     res.status(500).json({ error: 'Server error' });
 *   }
 * });
 *
 * IMPORTANT: The Socket.IO instance must be passed to routes via:
 * 1. app.set('io', io) in server.ts
 * 2. const io = req.app.get('io') in routes
 *
 * OR use a module-level singleton:
 * import { getIO } from '../socket/index';
 * const io = getIO();
 */

/**
 * CLIENT-SIDE INTEGRATION
 *
 * On the client side (e.g., in React):
 *
 * import io from 'socket.io-client';
 *
 * const socket = io('http://localhost:3001', {
 *   auth: { token: userJWT }
 * });
 *
 * // Listen for game events
 * socket.on('game_event', (event) => {
 *   switch(event.type) {
 *     case 'PLAYER_MOVED':
 *       // Update player position on map
 *       updatePlayerPosition(event.payload.userId, event.payload.position);
 *       break;
 *     case 'BUG_DISCOVERED':
 *       // Show discovery animation
 *       showBugDiscoveryNotification(event.payload);
 *       break;
 *     case 'BOUNTY_SOLVED':
 *       // Award points and update UI
 *       awardPoints(event.payload.points);
 *       break;
 *     case 'FRAGMENT_COLLECTED':
 *       // Update fragment collection
 *       updateFragmentCount(event.payload.fragmentCount);
 *       break;
 *     case 'GAME_ENDED':
 *       // Show end game screen with leaderboard
 *       showGameEndScreen(event.payload.finalScores);
 *       break;
 *   }
 * });
 *
 * // Listen for team updates
 * socket.on('team_update', (stats) => {
 *   setTeamStats(stats);
 * });
 *
 * // Listen for game state changes
 * socket.on('game_state_update', (state) => {
 *   setGamePhase(state.phase);
 * });
 *
 * // Listen for notifications
 * socket.on('notification', (notification) => {
 *   showNotification(notification.title, notification.message);
 * });
 *
 * // Emit a client event request
 * socket.emit('request_player_moved',
 *   { position: { x: 100, y: 200 } },
 *   (response) => {
 *     if (response.success) {
 *       console.log('Movement registered');
 *     }
 *   }
 * );
 */
