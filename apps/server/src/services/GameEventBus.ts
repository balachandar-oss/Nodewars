import { EventEmitter } from 'events';

export interface GameEvent {
  type: string;
  playerId?: string;
  teamId?: string;
  timestamp: string;
  metadata?: any;
}

class GameEventBus extends EventEmitter {
  constructor() {
    super();
  }

  emitEvent(event: GameEvent) {
    if (!event.timestamp) {
      event.timestamp = new Date().toISOString();
    }
    this.emit(event.type, event);
    // Also emit a catch-all event for the socket bridge
    this.emit('ANY_EVENT', event);
  }
}

export const gameEventBus = new GameEventBus();
