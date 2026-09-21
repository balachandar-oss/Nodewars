/**
 * Socket.IO Instance Manager
 * Provides module-level access to the Socket.IO instance
 * Use this in routes to emit real-time events
 */

import { Server } from 'socket.io';

let ioInstance: Server | null = null;

/**
 * Set the global Socket.IO instance
 * Called once during server initialization
 */
export function setIO(io: Server): void {
  ioInstance = io;
  console.log('[IO_INSTANCE] Socket.IO instance registered globally');
}

/**
 * Get the global Socket.IO instance
 * Use this in routes to emit events:
 *
 * const io = getIO();
 * await emitBugDiscovered(io, payload);
 */
export function getIO(): Server {
  if (!ioInstance) {
    throw new Error('Socket.IO instance not initialized. Call setIO() in server.ts');
  }
  return ioInstance;
}

/**
 * Check if Socket.IO is initialized
 */
export function isIOInitialized(): boolean {
  return ioInstance !== null;
}
