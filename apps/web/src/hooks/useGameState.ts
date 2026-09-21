import { useState, useEffect, useCallback, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

// Temporarily inlined types to debug import issue
export type RoomId = 'command_hall' | 'security_gate' | 'tower' | 'armory' | 'vault' | 'library' | 'laboratory' | 'forge' | 'throne_room' | 'garden' | 'dungeon' | 'observatory' | 'crypt' | 'kitchen' | 'great_hall' | 'treasury';

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

interface GameState {
  phase: string;
  playerView: {
    homeTeam: string;
    targetTeam: string;
  };
  huntAvailable: boolean;
  scoreSummary: Record<string, number>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition | null>(null);
  const [teamPositions, setTeamPositions] = useState<TeamPositionState>({});
  const positionUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchState = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/game/state`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setGameState(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch game state', err);
      }
    };

    fetchState();

    const token = localStorage.getItem('token');
    if (token) {
      const newSocket = io(API_URL, {
        auth: { token }
      });

      newSocket.on('game_event', (event) => {
        if (event.type === 'GAME_PHASE_CHANGED') {
          // Re-fetch state to get authoritative view (including team, scores)
          fetchState();
        }
      });

      // Listen for player position updates from server
      newSocket.on('player_position_update', (data: PlayerState) => {
        setTeamPositions(prev => ({
          ...prev,
          [data.playerId]: data
        }));
      });

      // Listen for team position sync (e.g., when entering castle)
      newSocket.on('team_positions_sync', (data: TeamPositionState) => {
        setTeamPositions(data);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, []);

  /**
   * Update player position locally and emit to server
   */
  const updatePlayerPosition = useCallback((
    x: number,
    y: number,
    roomId: RoomId,
    direction?: 'up' | 'down' | 'left' | 'right' | 'idle',
    isMoving: boolean = false
  ) => {
    const newPosition: PlayerPosition = { x, y, roomId };
    setPlayerPosition(newPosition);

    // Clear any pending update
    if (positionUpdateTimeoutRef.current) {
      clearTimeout(positionUpdateTimeoutRef.current);
    }

    // Debounce position updates to server (throttle to ~100ms)
    positionUpdateTimeoutRef.current = setTimeout(() => {
      if (socket && socket.connected) {
        socket.emit('player_move', {
          position: newPosition,
          direction,
          isMoving,
          timestamp: Date.now()
        });
      }
    }, 100);
  }, [socket]);

  /**
   * Get current player position
   */
  const getCurrentPosition = useCallback((): PlayerPosition | null => {
    return playerPosition;
  }, [playerPosition]);

  /**
   * Get team member positions
   */
  const getTeamPositions = useCallback((): TeamPositionState => {
    return teamPositions;
  }, [teamPositions]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (positionUpdateTimeoutRef.current) {
        clearTimeout(positionUpdateTimeoutRef.current);
      }
    };
  }, []);

  return {
    gameState,
    socket,
    playerPosition,
    teamPositions,
    updatePlayerPosition,
    getCurrentPosition,
    getTeamPositions
  };
}
