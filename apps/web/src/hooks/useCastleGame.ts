/**
 * useCastleGame Hook
 * Manages Phaser game lifecycle, player position tracking, and Socket.IO communication
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';
import { RoomId, PlayerPosition, PlayerState } from '../utils/gameConstants';
import { STRUCTURE_SPAWN_POINTS, ROOM_BOUNDARIES } from '../constants/castleLayout';
import { useGameSocket } from './useGameSocket';

export interface CastleGameConfig {
  playerId: string;
  playerName?: string;
  onPositionUpdate?: (position: PlayerPosition) => void;
  onPlayerStateUpdate?: (state: PlayerState) => void;
  onStructureCollision?: (structureId: string, roomId: RoomId) => void;
  onRoomChange?: (roomId: RoomId) => void;
}

export interface UseCastleGameReturn {
  isInitialized: boolean;
  currentRoom: RoomId;
  playerPosition: PlayerPosition | null;
  error: string | null;
  scene: Phaser.Scene | null;
}

/**
 * Hook to manage the castle game
 * Handles Phaser scene lifecycle, player position tracking, and Socket.IO events
 */
export function useCastleGame(config: CastleGameConfig): UseCastleGameReturn {
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<Phaser.Scene | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<RoomId>('COMMAND_HALL');
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const positionUpdateRef = useRef<{
    lastUpdate: number;
    lastPosition: { x: number; y: number };
  }>({
    lastUpdate: 0,
    lastPosition: { x: 0, y: 0 }
  });

  const { socket } = useGameSocket();

  /**
   * Check if player has collided with any structures in the current room
   */
  const checkStructureCollisions = useCallback((
    x: number,
    y: number,
    roomId: RoomId
  ) => {
    const structures = STRUCTURE_SPAWN_POINTS[roomId];
    if (!structures) return;

    structures.forEach(structure => {
      const distance = Math.sqrt(
        Math.pow(x - structure.x, 2) + Math.pow(y - structure.y, 2)
      );

      if (distance <= structure.interactionRadius) {
        config.onStructureCollision?.(structure.type, roomId);
      }
    });
  }, [config]);

  /**
   * Get the room ID at a given position
   */
  const getRoomAtPosition = (x: number, y: number): RoomId => {
    const rooms = Object.entries(ROOM_BOUNDARIES) as Array<[RoomId, typeof ROOM_BOUNDARIES[RoomId]]>;

    for (const [roomId, bounds] of rooms) {
      if (x >= bounds.minX && x <= bounds.maxX && y >= bounds.minY && y <= bounds.maxY) {
        return roomId;
      }
    }

    return 'COMMAND_HALL'; // Default fallback
  };

  /**
   * Clamp player position to room boundaries
   */
  const clampToRoomBounds = (x: number, y: number, roomId: RoomId): { x: number; y: number } => {
    const bounds = ROOM_BOUNDARIES[roomId];
    const playerSize = 16; // Half of 32px sprite

    return {
      x: Math.max(bounds.minX + playerSize, Math.min(x, bounds.maxX - playerSize)),
      y: Math.max(bounds.minY + playerSize, Math.min(y, bounds.maxY - playerSize))
    };
  };

  /**
   * Emit position update via Socket.IO with throttling
   */
  const emitPositionUpdate = useCallback((
    x: number,
    y: number,
    roomId: RoomId,
    direction: 'up' | 'down' | 'left' | 'right' | 'idle' = 'idle',
    isMoving: boolean = false
  ) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - positionUpdateRef.current.lastUpdate;
    const distanceMoved = Math.sqrt(
      Math.pow(x - positionUpdateRef.current.lastPosition.x, 2) +
      Math.pow(y - positionUpdateRef.current.lastPosition.y, 2)
    );

    // Throttle updates: emit at most every 100ms or when movement > 10px
    if (timeSinceLastUpdate > 100 || distanceMoved > 10) {
      const playerState: PlayerState = {
        id: `${config.playerId}-${now}`,
        playerId: config.playerId,
        position: { x, y, roomId },
        direction,
        isMoving,
        timestamp: now
      };

      config.onPlayerStateUpdate?.(playerState);

      if (socket?.connected) {
        socket.emit('player:move', playerState);
      }

      positionUpdateRef.current.lastUpdate = now;
      positionUpdateRef.current.lastPosition = { x, y };
    }
  }, [config, socket]);

  /**
   * Initialize the game (this is called from CastleMap component)
   */
  const initializeGame = useCallback((container: HTMLDivElement) => {
    try {
      // Create Phaser game instance
      const gameConfig: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: container,
        width: 1024,
        height: 768,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0, x: 0 },
            debug: false
          }
        },
        render: {
          pixelArt: true,
          antialias: false
        }
      };

      gameRef.current = new Phaser.Game(gameConfig);
      setIsInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error initializing game';
      setError(errorMessage);
      console.error('Failed to initialize castle game:', err);
    }
  }, []);

  /**
   * Handle player position changes during game loop
   */
  const handleGameUpdate = useCallback((
    x: number,
    y: number,
    direction: 'up' | 'down' | 'left' | 'right' | 'idle' = 'idle',
    isMoving: boolean = false
  ) => {
    const roomId = getRoomAtPosition(x, y);

    // Update room if changed
    if (roomId !== currentRoom) {
      setCurrentRoom(roomId);
      config.onRoomChange?.(roomId);
    }

    // Clamp position to room bounds
    const clampedPos = clampToRoomBounds(x, y, roomId);

    // Update local state
    const newPosition: PlayerPosition = {
      x: clampedPos.x,
      y: clampedPos.y,
      roomId
    };

    setPlayerPosition(newPosition);
    config.onPositionUpdate?.(newPosition);

    // Check for structure collisions
    checkStructureCollisions(clampedPos.x, clampedPos.y, roomId);

    // Emit Socket.IO update (throttled)
    emitPositionUpdate(clampedPos.x, clampedPos.y, roomId, direction, isMoving);
  }, [currentRoom, config, checkStructureCollisions, emitPositionUpdate, getRoomAtPosition, clampToRoomBounds]);

  /**
   * Clean up on unmount
   */
  useEffect(() => {
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return {
    isInitialized,
    currentRoom,
    playerPosition,
    error,
    scene: sceneRef.current
  };
}

/**
 * Type for tracking active structure interactions
 */
export interface StructureInteractionState {
  structureId: string;
  roomId: RoomId;
  playerDistance: number;
  isInteracting: boolean;
  interactionStartTime: number;
}

/**
 * Hook to track nearby structures for interaction
 */
export function useStructureProximity(
  playerPosition: PlayerPosition | null,
  roomId: RoomId
) {
  const [nearbyStructures, setNearbyStructures] = useState<StructureInteractionState[]>([]);

  useEffect(() => {
    if (!playerPosition) {
      setNearbyStructures([]);
      return;
    }

    const structures = STRUCTURE_SPAWN_POINTS[roomId];
    if (!structures) {
      setNearbyStructures([]);
      return;
    }

    const nearby = structures
      .map((structure, idx) => {
        const distance = Math.sqrt(
          Math.pow(playerPosition.x - structure.x, 2) +
          Math.pow(playerPosition.y - structure.y, 2)
        );

        return {
          structureId: `${roomId}-${idx}`,
          roomId,
          playerDistance: distance,
          isInteracting: distance <= structure.interactionRadius,
          interactionStartTime: Date.now()
        };
      })
      .filter(s => s.playerDistance <= 100); // Only include structures within 100px

    setNearbyStructures(nearby);
  }, [playerPosition, roomId]);

  return nearbyStructures;
}
