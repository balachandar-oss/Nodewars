import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface GameEvent {
  type: string;
  playerId?: string;
  teamId?: string;
  timestamp: string;
  metadata?: any;
}

export function useGameSocket(shouldConnect: boolean = true) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<GameEvent[]>([]);

  useEffect(() => {
    if (!shouldConnect) return;
    
    const token = localStorage.getItem('token');
    
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    newSocket.on('game_event', (event: GameEvent) => {
      setEvents(prev => [...prev.slice(-49), event]); // Keep last 50 events
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [shouldConnect]);

  return { socket, isConnected, events };
}
