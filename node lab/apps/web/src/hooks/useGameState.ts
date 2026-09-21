import { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';

interface GameState {
  phase: string;
  playerView: {
    homeTeam: string;
    targetTeam: string;
  };
  huntAvailable: boolean;
  scoreSummary: Record<string, number>;
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const fetchState = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('http://localhost:3001/api/game/state', {
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
      const newSocket = io('http://localhost:3001', {
        auth: { token }
      });

      newSocket.on('game_event', (event) => {
        if (event.type === 'GAME_PHASE_CHANGED') {
          // Re-fetch state to get authoritative view (including team, scores)
          fetchState();
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, []);

  return { gameState, socket };
}
