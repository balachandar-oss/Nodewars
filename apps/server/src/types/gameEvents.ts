/**
 * Game Event Types and Interfaces
 * Defines all events that can be emitted and received in real-time gameplay
 */

// Player movement payload
export interface PlayerMovedPayload {
  userId: string;
  position: {
    x: number;
    y: number;
  };
  teamId: string;
  timestamp?: string;
}

// Bug discovery payload
export interface BugDiscoveredPayload {
  bugId: string;
  discoveredBy: {
    userId: string;
    teamId: string;
    username: string;
  };
  vulnerabilityType: string;
  targetSystem: string;
  timestamp?: string;
}

// Bug solved/claimed payload
export interface BountySolvedPayload {
  bugId: string;
  answeredBy: {
    userId: string;
    teamId: string;
    username: string;
  };
  points: number;
  fragment: {
    fragmentId?: string;
    fragmentValue: string;
    description: string;
  };
  timestamp?: string;
}

// Fragment collected payload
export interface FragmentCollectedPayload {
  teamId: string;
  fragmentValue: string;
  fragmentId?: string;
  fragmentCount: number; // Total fragments collected by team
  timestamp?: string;
}

// Room/Castle component unlocked payload
export interface RoomUnlockedPayload {
  teamId: string;
  roomName: string;
  systemId: string;
  description: string;
  timestamp?: string;
}

// Game started payload
export interface GameStartedPayload {
  gameId: string;
  phase: string;
  teams: Array<{
    teamId: string;
    teamName: string;
    playerCount: number;
  }>;
  timestamp?: string;
}

// Game ended payload
export interface GameEndedPayload {
  gameId: string;
  phase: string;
  winner?: {
    teamId: string;
    teamName: string;
    score: number;
  };
  finalScores: Array<{
    teamId: string;
    teamName: string;
    score: number;
    bugsPlanted: number;
    bugsDiscovered: number;
    bugsClaimed: number;
    fragmentsCollected: number;
  }>;
  timestamp?: string;
}

// Generic game event wrapper
export interface GameEvent {
  type: 'PLAYER_MOVED' | 'BUG_DISCOVERED' | 'BOUNTY_SOLVED' | 'FRAGMENT_COLLECTED' |
         'ROOM_UNLOCKED' | 'GAME_STARTED' | 'GAME_ENDED' | 'GAME_PHASE_CHANGED' |
         'PLAYER_JOINED' | 'PLAYER_LEFT' | 'ERROR';
  playerId?: string;
  teamId?: string;
  payload: any;
  timestamp: string;
}

// Event response types for acknowledgments
export interface EventAck {
  success: boolean;
  message?: string;
  data?: any;
}

// Socket data attached to each connection
export interface SocketData {
  user: {
    id: string;
    teamId: string | null;
    role: string;
    username?: string;
  };
}

// Broadcast options
export interface BroadcastOptions {
  toTeam?: string;        // Broadcast to specific team
  toUser?: string;        // Broadcast to specific user only
  toAll?: boolean;        // Broadcast to all connected users
  excludeUser?: string;   // Exclude a specific user from broadcast
}
