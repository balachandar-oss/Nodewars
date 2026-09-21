/**
 * Game Constants for Castle Map
 */

export const GAME_CONFIG = {
  // Canvas dimensions
  CANVAS_WIDTH: 1024,
  CANVAS_HEIGHT: 768,

  // Tile configuration
  TILE_SIZE: 48,
  TILEMAP_WIDTH: 21,   // 21 tiles × 48px = 1008px
  TILEMAP_HEIGHT: 16,  // 16 tiles × 48px = 768px

  // Map structure (4x4 room layout)
  ROOM_SIZE: 5,         // Each room is 5x5 tiles (240x240px)
  ROOMS_GRID: 4,        // 4x4 room grid

  // Player configuration
  PLAYER_SPEED: 150,    // pixels per second
  PLAYER_SPRITE_SIZE: 32,

  // Movement keys
  MOVEMENT_KEYS: {
    UP: ['W', 'ArrowUp'],
    DOWN: ['S', 'ArrowDown'],
    LEFT: ['A', 'ArrowLeft'],
    RIGHT: ['D', 'ArrowRight']
  }
} as const;

// Room definitions (4x4 layout)
export const ROOMS = {
  COMMAND_HALL: {
    id: 'command_hall',
    name: 'Command Hall',
    row: 0,
    col: 0,
    startX: 0,
    startY: 0,
    width: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE,
    height: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE
  },
  SECURITY_GATE: {
    id: 'security_gate',
    name: 'Security Gate',
    row: 0,
    col: 1,
    startX: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE,
    startY: 0,
    width: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE,
    height: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE
  },
  TOWER: {
    id: 'tower',
    name: 'Tower',
    row: 0,
    col: 2,
    startX: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE * 2,
    startY: 0,
    width: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE,
    height: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE
  },
  ARMORY: {
    id: 'armory',
    name: 'Armory',
    row: 0,
    col: 3,
    startX: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE * 3,
    startY: 0,
    width: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE,
    height: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE
  },
  VAULT: {
    id: 'vault',
    name: 'Vault',
    row: 1,
    col: 0,
    startX: 0,
    startY: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE,
    width: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE,
    height: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE
  },
  LIBRARY: {
    id: 'library',
    name: 'Library',
    row: 1,
    col: 1,
    startX: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE,
    startY: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE,
    width: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE,
    height: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE
  },
  LABORATORY: {
    id: 'laboratory',
    name: 'Laboratory',
    row: 1,
    col: 2,
    startX: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE * 2,
    startY: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE,
    width: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE,
    height: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE
  },
  FORGE: {
    id: 'forge',
    name: 'Forge',
    row: 1,
    col: 3,
    startX: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE * 3,
    startY: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE,
    width: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE,
    height: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE
  },
  THRONE_ROOM: {
    id: 'throne_room',
    name: 'Throne Room',
    row: 2,
    col: 0,
    startX: 0,
    startY: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE * 2,
    width: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE,
    height: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE
  },
  GARDEN: {
    id: 'garden',
    name: 'Garden',
    row: 2,
    col: 1,
    startX: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE,
    startY: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE * 2,
    width: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE,
    height: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE
  },
  DUNGEON: {
    id: 'dungeon',
    name: 'Dungeon',
    row: 2,
    col: 2,
    startX: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE * 2,
    startY: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE * 2,
    width: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE,
    height: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE
  },
  OBSERVATORY: {
    id: 'observatory',
    name: 'Observatory',
    row: 2,
    col: 3,
    startX: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE * 3,
    startY: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE * 2,
    width: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE,
    height: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE
  },
  CRYPT: {
    id: 'crypt',
    name: 'Crypt',
    row: 3,
    col: 0,
    startX: 0,
    startY: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE * 3,
    width: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE,
    height: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE
  },
  KITCHEN: {
    id: 'kitchen',
    name: 'Kitchen',
    row: 3,
    col: 1,
    startX: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE,
    startY: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE * 3,
    width: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE,
    height: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE
  },
  GREAT_HALL: {
    id: 'great_hall',
    name: 'Great Hall',
    row: 3,
    col: 2,
    startX: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE * 2,
    startY: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE * 3,
    width: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE,
    height: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE
  },
  TREASURY: {
    id: 'treasury',
    name: 'Treasury',
    row: 3,
    col: 3,
    startX: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE * 3,
    startY: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE * 3,
    width: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE,
    height: GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE
  }
} as const;

export type RoomId = keyof typeof ROOMS;

// Collision layers
export const COLLISION_LAYERS = {
  WALLS: 'walls',
  OBSTACLES: 'obstacles',
  PROPS: 'props'
} as const;

// Player position interface
export interface PlayerPosition {
  x: number;
  y: number;
  roomId: RoomId;
}

export interface PlayerState {
  id: string;
  playerId: string;
  position: PlayerPosition;
  direction?: 'up' | 'down' | 'left' | 'right' | 'idle';
  isMoving: boolean;
  timestamp: number;
}

export interface TeamPositionState {
  [playerId: string]: PlayerState;
}
