import prisma from '../utils/prisma';
import { gameEventBus } from './GameEventBus';

export class GameService {
  private static placementTimer: NodeJS.Timeout | null = null;

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

  static async transitionTo(newPhase: string, durationMs?: number): Promise<string> {
    const currentState = await prisma.gameState.findUnique({
      where: { id: 'singleton' }
    });

    const currentPhase = currentState ? currentState.phase : 'ENGINEERING';

    if (newPhase === 'BUG_PLACEMENT') {
      if (!currentState || !currentState.scoresRevealed) {
        throw new Error('BUG_PLACEMENT transition failed: Scores have not been revealed yet.');
      }
    }

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
      const princes = await prisma.team.findUnique({ where: { name: 'PRINCES' } });
      const princesses = await prisma.team.findUnique({ where: { name: 'PRINCESSES' } });

      if (!princes || !princesses) throw new Error('Teams not configured properly.');

      const princesBugs = await prisma.bug.count({
        where: { targetTeamId: princesses.id, status: 'PLANTED' } // PRINCES plants on PRINCESSES
      });

      const princessesBugs = await prisma.bug.count({
        where: { targetTeamId: princes.id, status: 'PLANTED' } // PRINCESSES plants on PRINCES
      });

      if (princesBugs === 0 || princessesBugs === 0) {
        throw new Error('HUNT start validation failed: Both teams must have at least one valid PLANTED bug.');
      }
    }

    // Clear any existing timer when transitioning
    if (this.placementTimer) {
      clearTimeout(this.placementTimer);
      this.placementTimer = null;
    }

    const updateData: any = { phase: newPhase };
    
    if (newPhase === 'BUG_PLACEMENT' && durationMs) {
      updateData.placementEndsAt = new Date(Date.now() + durationMs);
    } else if (newPhase === 'ENGINEERING') {
      updateData.placementEndsAt = null;
    }

    // Atomic update
    const result = await prisma.gameState.updateMany({
      where: { id: 'singleton', phase: currentPhase },
      data: updateData
    });

    if (result.count === 0) {
      throw new Error('Concurrent transition conflict or invalid phase state.');
    }

    if (newPhase === 'BUG_PLACEMENT' && durationMs) {
      this.placementTimer = setTimeout(() => {
        GameService.transitionTo('HUNT').catch(e => {
          console.error('[GameService] Auto-transition to HUNT failed:', e.message);
        });
      }, durationMs);
    }

    // Wait
    // Emit event safely after atomic DB commit
    gameEventBus.emit('ANY_EVENT', {
      type: 'GAME_PHASE_CHANGED',
      payload: { phase: newPhase }
    });

    return newPhase;
  }

  static async initTimerOnBoot() {
    const state = await prisma.gameState.findUnique({
      where: { id: 'singleton' }
    });

    if (state?.phase === 'BUG_PLACEMENT' && state.placementEndsAt) {
      const remaining = state.placementEndsAt.getTime() - Date.now();
      if (remaining <= 0) {
        // Expired while offline
        console.log('[GameService] BUG_PLACEMENT timer expired while offline. Transitioning to HUNT.');
        this.transitionTo('HUNT').catch(e => console.error('[GameService] Boot transition failed:', e.message));
      } else {
        console.log(`[GameService] Resuming BUG_PLACEMENT timer. ${Math.round(remaining / 1000)}s remaining.`);
        this.placementTimer = setTimeout(() => {
          this.transitionTo('HUNT').catch(e => {
            console.error('[GameService] Auto-transition to HUNT failed:', e.message);
          });
        }, remaining);
      }
    }
  }
}
