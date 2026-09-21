import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { initializeSocket } from './index';
import { gameEventBus } from '../services/GameEventBus';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/sharedAuth';
import prisma from '../utils/prisma';

describe('Socket.IO Integration', () => {
  let io: Server;
  let serverSocket: any;
  let clientSocket: ClientSocket;
  let httpServer: any;
  let port: number;

  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer);
    initializeSocket(io);
    httpServer.listen(() => {
      port = (httpServer.address() as any).port;
      done();
    });
  });

  afterAll((done) => {
    io.close();
    httpServer.close();
    done();
  });

  afterEach((done) => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
    done();
  });

  const generateToken = (id: string, role: string) => {
    return jwt.sign({ id, role }, JWT_SECRET);
  };

  test('should reject unauthenticated socket connection', (done) => {
    clientSocket = Client(`http://localhost:${port}`);
    clientSocket.on('connect_error', (err) => {
      expect(err.message).toBe('Authentication error: Token missing');
      done();
    });
  });

  test('should accept authenticated socket connection and join correct team room', (done) => {
    // 1. Setup mock user in DB
    prisma.user.findUnique = jest.fn().mockResolvedValue({
      id: 'user_1',
      teamId: 'TEAM_OMEGA',
      role: 'PLAYER'
    });

    const token = generateToken('user_1', 'PLAYER');
    
    clientSocket = Client(`http://localhost:${port}`, {
      auth: { token }
    });

    clientSocket.on('connect', () => {
      // 2. Wait a small amount for the server to process the room join
      setTimeout(() => {
        // 3. Emit an event on the bus specifically for this team
        gameEventBus.emit('ANY_EVENT', {
          type: 'TEST_EVENT',
          teamId: 'TEAM_OMEGA',
          timestamp: new Date().toISOString()
        });
      }, 100);
    });

    clientSocket.on('game_event', (event) => {
      expect(event.type).toBe('TEST_EVENT');
      expect(event.teamId).toBe('TEAM_OMEGA');
      done();
    });
  });

  test('should not receive events for other teams', (done) => {
    prisma.user.findUnique = jest.fn().mockResolvedValue({
      id: 'user_2',
      teamId: 'TEAM_BETA', // Different team
      role: 'PLAYER'
    });

    const token = generateToken('user_2', 'PLAYER');
    
    clientSocket = Client(`http://localhost:${port}`, {
      auth: { token }
    });

    clientSocket.on('connect', () => {
      setTimeout(() => {
        // Emit event for TEAM_OMEGA
        gameEventBus.emit('ANY_EVENT', {
          type: 'TEST_EVENT',
          teamId: 'TEAM_OMEGA',
          timestamp: new Date().toISOString()
        });

        // Emit global event to actually trigger the 'done' so we know we didn't miss it
        setTimeout(() => {
           gameEventBus.emit('ANY_EVENT', {
              type: 'GLOBAL_EVENT',
              timestamp: new Date().toISOString()
           });
        }, 50);
      }, 50);
    });

    clientSocket.on('game_event', (event) => {
      if (event.type === 'TEST_EVENT') {
        done.fail('Received event for wrong team room');
      } else if (event.type === 'GLOBAL_EVENT') {
        // We received the global event, meaning the test event was correctly filtered out
        done();
      }
    });
  });
});
