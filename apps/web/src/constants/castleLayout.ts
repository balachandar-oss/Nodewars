/**
 * Castle Layout Constants
 * Defines room structure, collision tiles, and spawn points for the castle game
 */

import { RoomId } from '../utils/gameConstants';

/**
 * Tile IDs used in the castle map
 * These correspond to the tileset indices generated in CastleMap.tsx
 */
export const TILE_IDS = {
  FLOOR: 0,
  WALL: 1,
  DOOR: 2,
  TREASURE: 3,
  WATER: 4,
  EMPTY: 5
} as const;

/**
 * Collision layer definitions
 * Specifies which tiles cause collisions with the player
 */
export const COLLISION_TILES = {
  WALLS: [TILE_IDS.WALL],
  OBSTACLES: [TILE_IDS.WATER],
  INTERACTIVE: [TILE_IDS.DOOR, TILE_IDS.TREASURE]
} as const;

/**
 * Walkable boundaries for each room
 * Defines the safe area where the player can walk in each room
 */
export const ROOM_BOUNDARIES: Record<RoomId, {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}> = {
  COMMAND_HALL: {
    minX: 25,
    maxX: 215,
    minY: 25,
    maxY: 215
  },
  SECURITY_GATE: {
    minX: 265,
    maxX: 455,
    minY: 25,
    maxY: 215
  },
  TOWER: {
    minX: 505,
    maxX: 695,
    minY: 25,
    maxY: 215
  },
  ARMORY: {
    minX: 745,
    maxX: 935,
    minY: 25,
    maxY: 215
  },
  VAULT: {
    minX: 25,
    maxX: 215,
    minY: 265,
    maxY: 455
  },
  LIBRARY: {
    minX: 265,
    maxX: 455,
    minY: 265,
    maxY: 455
  },
  LABORATORY: {
    minX: 505,
    maxX: 695,
    minY: 265,
    maxY: 455
  },
  FORGE: {
    minX: 745,
    maxX: 935,
    minY: 265,
    maxY: 455
  },
  THRONE_ROOM: {
    minX: 25,
    maxX: 215,
    minY: 505,
    maxY: 695
  },
  GARDEN: {
    minX: 265,
    maxX: 455,
    minY: 505,
    maxY: 695
  },
  DUNGEON: {
    minX: 505,
    maxX: 695,
    minY: 505,
    maxY: 695
  },
  OBSERVATORY: {
    minX: 745,
    maxX: 935,
    minY: 505,
    maxY: 695
  },
  CRYPT: {
    minX: 25,
    maxX: 215,
    minY: 745,
    maxY: 935
  },
  KITCHEN: {
    minX: 265,
    maxX: 455,
    minY: 745,
    maxY: 935
  },
  GREAT_HALL: {
    minX: 505,
    maxX: 695,
    minY: 745,
    maxY: 935
  },
  TREASURY: {
    minX: 745,
    maxX: 935,
    minY: 745,
    maxY: 935
  }
} as const;

/**
 * Structure spawn points within each room
 * Defines where interactive structures should appear
 */
export const STRUCTURE_SPAWN_POINTS: Record<RoomId, Array<{
  type: string;
  x: number;
  y: number;
  interactionRadius: number;
}>> = {
  COMMAND_HALL: [
    { type: 'TERMINAL', x: 120, y: 120, interactionRadius: 50 }
  ],
  SECURITY_GATE: [
    { type: 'SECURITY_GATE', x: 360, y: 120, interactionRadius: 50 }
  ],
  TOWER: [
    { type: 'OBSERVATION_DEVICE', x: 600, y: 120, interactionRadius: 50 }
  ],
  ARMORY: [
    { type: 'WEAPON_RACK', x: 840, y: 120, interactionRadius: 50 }
  ],
  VAULT: [
    { type: 'VAULT_DOOR', x: 120, y: 360, interactionRadius: 50 }
  ],
  LIBRARY: [
    { type: 'BOOKSHELF', x: 360, y: 360, interactionRadius: 50 }
  ],
  LABORATORY: [
    { type: 'WORKBENCH', x: 600, y: 360, interactionRadius: 50 }
  ],
  FORGE: [
    { type: 'FORGE_FIRE', x: 840, y: 360, interactionRadius: 50 }
  ],
  THRONE_ROOM: [
    { type: 'THRONE', x: 120, y: 600, interactionRadius: 50 }
  ],
  GARDEN: [
    { type: 'FOUNTAIN', x: 360, y: 600, interactionRadius: 50 }
  ],
  DUNGEON: [
    { type: 'CAGE', x: 600, y: 600, interactionRadius: 50 }
  ],
  OBSERVATORY: [
    { type: 'TELESCOPE', x: 840, y: 600, interactionRadius: 50 }
  ],
  CRYPT: [
    { type: 'SARCOPHAGUS', x: 120, y: 840, interactionRadius: 50 }
  ],
  KITCHEN: [
    { type: 'COOKING_STATION', x: 360, y: 840, interactionRadius: 50 }
  ],
  GREAT_HALL: [
    { type: 'BANQUET_TABLE', x: 600, y: 840, interactionRadius: 50 }
  ],
  TREASURY: [
    { type: 'TREASURE_CHEST', x: 840, y: 840, interactionRadius: 50 }
  ]
} as const;

/**
 * Door connections between rooms
 * Defines where doors lead to facilitate room navigation
 */
export const DOOR_CONNECTIONS: Array<{
  roomA: RoomId;
  roomB: RoomId;
  positionA: { x: number; y: number };
  positionB: { x: number; y: number };
}> = [
  // Horizontal connections (within rows)
  {
    roomA: 'COMMAND_HALL',
    roomB: 'SECURITY_GATE',
    positionA: { x: 215, y: 120 },
    positionB: { x: 265, y: 120 }
  },
  {
    roomA: 'SECURITY_GATE',
    roomB: 'TOWER',
    positionA: { x: 455, y: 120 },
    positionB: { x: 505, y: 120 }
  },
  {
    roomA: 'TOWER',
    roomB: 'ARMORY',
    positionA: { x: 695, y: 120 },
    positionB: { x: 745, y: 120 }
  },
  {
    roomA: 'VAULT',
    roomB: 'LIBRARY',
    positionA: { x: 215, y: 360 },
    positionB: { x: 265, y: 360 }
  },
  {
    roomA: 'LIBRARY',
    roomB: 'LABORATORY',
    positionA: { x: 455, y: 360 },
    positionB: { x: 505, y: 360 }
  },
  {
    roomA: 'LABORATORY',
    roomB: 'FORGE',
    positionA: { x: 695, y: 360 },
    positionB: { x: 745, y: 360 }
  },
  // Vertical connections (between rows)
  {
    roomA: 'COMMAND_HALL',
    roomB: 'VAULT',
    positionA: { x: 120, y: 215 },
    positionB: { x: 120, y: 265 }
  },
  {
    roomA: 'SECURITY_GATE',
    roomB: 'LIBRARY',
    positionA: { x: 360, y: 215 },
    positionB: { x: 360, y: 265 }
  },
  {
    roomA: 'TOWER',
    roomB: 'LABORATORY',
    positionA: { x: 600, y: 215 },
    positionB: { x: 600, y: 265 }
  },
  {
    roomA: 'ARMORY',
    roomB: 'FORGE',
    positionA: { x: 840, y: 215 },
    positionB: { x: 840, y: 265 }
  },
  {
    roomA: 'VAULT',
    roomB: 'THRONE_ROOM',
    positionA: { x: 120, y: 455 },
    positionB: { x: 120, y: 505 }
  },
  {
    roomA: 'LIBRARY',
    roomB: 'GARDEN',
    positionA: { x: 360, y: 455 },
    positionB: { x: 360, y: 505 }
  },
  {
    roomA: 'LABORATORY',
    roomB: 'DUNGEON',
    positionA: { x: 600, y: 455 },
    positionB: { x: 600, y: 505 }
  },
  {
    roomA: 'FORGE',
    roomB: 'OBSERVATORY',
    positionA: { x: 840, y: 455 },
    positionB: { x: 840, y: 505 }
  },
  {
    roomA: 'THRONE_ROOM',
    roomB: 'CRYPT',
    positionA: { x: 120, y: 695 },
    positionB: { x: 120, y: 745 }
  },
  {
    roomA: 'GARDEN',
    roomB: 'KITCHEN',
    positionA: { x: 360, y: 695 },
    positionB: { x: 360, y: 745 }
  },
  {
    roomA: 'DUNGEON',
    roomB: 'GREAT_HALL',
    positionA: { x: 600, y: 695 },
    positionB: { x: 600, y: 745 }
  },
  {
    roomA: 'OBSERVATORY',
    roomB: 'TREASURY',
    positionA: { x: 840, y: 695 },
    positionB: { x: 840, y: 745 }
  }
] as const;

/**
 * Room metadata for UI and navigation
 */
export const ROOM_METADATA: Record<RoomId, {
  displayName: string;
  description: string;
  theme: 'command' | 'security' | 'observation' | 'military' | 'storage' | 'knowledge' | 'scientific' | 'craft' | 'royal' | 'nature' | 'punishment' | 'science' | 'dining' | 'wealth';
}> = {
  COMMAND_HALL: {
    displayName: 'Command Hall',
    description: 'The central command center of the castle',
    theme: 'command'
  },
  SECURITY_GATE: {
    displayName: 'Security Gate',
    description: 'Main entrance with security checks',
    theme: 'security'
  },
  TOWER: {
    displayName: 'Tower',
    description: 'Tall observation tower with views',
    theme: 'observation'
  },
  ARMORY: {
    displayName: 'Armory',
    description: 'Weapons and armor storage',
    theme: 'military'
  },
  VAULT: {
    displayName: 'Vault',
    description: 'Secure storage facility',
    theme: 'storage'
  },
  LIBRARY: {
    displayName: 'Library',
    description: 'Ancient texts and knowledge',
    theme: 'knowledge'
  },
  LABORATORY: {
    displayName: 'Laboratory',
    description: 'Scientific research facility',
    theme: 'scientific'
  },
  FORGE: {
    displayName: 'Forge',
    description: 'Blacksmith and crafting area',
    theme: 'craft'
  },
  THRONE_ROOM: {
    displayName: 'Throne Room',
    description: 'Seat of power and authority',
    theme: 'royal'
  },
  GARDEN: {
    displayName: 'Garden',
    description: 'Peaceful garden sanctuary',
    theme: 'nature'
  },
  DUNGEON: {
    displayName: 'Dungeon',
    description: 'Imprisonment and holding cells',
    theme: 'punishment'
  },
  OBSERVATORY: {
    displayName: 'Observatory',
    description: 'Astronomical observation chamber',
    theme: 'science'
  },
  CRYPT: {
    displayName: 'Crypt',
    description: 'Underground burial chamber',
    theme: 'punishment'
  },
  KITCHEN: {
    displayName: 'Kitchen',
    description: 'Food preparation area',
    theme: 'dining'
  },
  GREAT_HALL: {
    displayName: 'Great Hall',
    description: 'Grand gathering space',
    theme: 'dining'
  },
  TREASURY: {
    displayName: 'Treasury',
    description: 'Repository of wealth and artifacts',
    theme: 'wealth'
  }
} as const;
