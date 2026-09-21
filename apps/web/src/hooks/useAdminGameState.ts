import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../utils/api';

export interface AdminGameState {
  gameId: string;
  phase: string;
  startTime?: string;
  endTime?: string;
  countdownSeconds?: number;
  players: Array<{
    id: string;
    username: string;
    teamId: string;
    teamName: string;
    score: number;
    isBugArchitect: boolean;
    position?: { x: number; y: number };
  }>;
  teams: Array<{
    id: string;
    name: string;
    huntScore: number;
    totalPlayers: number;
  }>;
  bugStats: {
    planted: number;
    discovered: number;
    solved: number;
  };
  royalRoomAttempts: number;
  scoresRevealed: boolean;
}

export function useAdminGameState(gameId?: string, pollInterval: number = 2000) {
  const [gameState, setGameState] = useState<AdminGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGameState = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token');
      setLoading(false);
      return;
    }

    try {
      const url = gameId
        ? `${API_URL}/api/admin/games/${gameId}/state`
        : `${API_URL}/api/admin/game/state`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        if (res.status === 403) {
          setError('Admin privileges required');
        } else {
          setError(`Failed to fetch game state: ${res.statusText}`);
        }
        return;
      }

      const data = await res.json();
      setGameState(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchGameState();
    const interval = setInterval(fetchGameState, pollInterval);
    return () => clearInterval(interval);
  }, [fetchGameState, pollInterval]);

  return { gameState, loading, error, refetch: fetchGameState };
}
