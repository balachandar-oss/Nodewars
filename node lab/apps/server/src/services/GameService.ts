import prisma from '../utils/prisma';
import { gameEventBus } from './GameEventBus';

export class GameService {
  static async getPhase(): Promise<string> {
    const state = await prisma.gameState.findUnique({
      where: { id: 'singleton' }
    });
    
    if (!state) {
      const newState = await prisma.gameState.create({
        data: { id: 'singleton', phase: 'ENGINEERING' }
      });
      return newState.phase;
    }
    
    return state.phase;
  }

  static async transitionTo(newPhase: string): Promise<string> {
    const currentState = await prisma.gameState.findUnique({
      where: { id: 'singleton' }
    });

    const currentPhase = currentState ? currentState.phase : 'ENGINEERING';

    const validTransitions: Record<string, string> = {
      'ENGINEERING': 'BUG_PLACEMENT',
      'BUG_PLACEMENT': 'HUNT',
      'HUNT': 'COMPLETE'
    };

    if (validTransitions[currentPhase] !== newPhase) {
      throw new Error(`Invalid transition from ${currentPhase} to ${newPhase}`);
    }

    if (newPhase === 'HUNT') {
      // Validate both teams have at least one bug planted
      const omega = await prisma.team.findUnique({ where: { name: 'TEAM OMEGA' } });
      const beta = await prisma.team.findUnique({ where: { name: 'TEAM BETA' } });

      if (!omega || !beta) throw new Error('Teams not configured properly.');

      const omegaBugs = await prisma.bug.count({
        where: { targetTeamId: beta.id, status: 'PLANTED' } // OMEGA plants on BETA
      });

      const betaBugs = await prisma.bug.count({
        where: { targetTeamId: omega.id, status: 'PLANTED' } // BETA plants on OMEGA
      });

      if (omegaBugs === 0 || betaBugs === 0) {
        throw new Error('HUNT start validation failed: Both teams must have at least one valid PLANTED bug.');
      }
    }

    // Atomic update
    const result = await prisma.gameState.updateMany({
      where: { id: 'singleton', phase: currentPhase },
      data: { phase: newPhase }
    });

    if (result.count === 0) {
      throw new Error('Concurrent transition conflict or invalid phase state.');
    }

    // Emit event safely after atomic DB commit
    gameEventBus.emit('ANY_EVENT', {
      type: 'GAME_PHASE_CHANGED',
      payload: { phase: newPhase }
    });

    return newPhase;
  }
}
