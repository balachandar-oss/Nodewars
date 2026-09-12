import { GameService } from './GameService';
import { gameEventBus } from './GameEventBus';

jest.mock('../utils/prisma', () => {
  return {
    __esModule: true,
    default: {
      gameState: {
        findUnique: jest.fn(),
        updateMany: jest.fn()
      },
      team: {
        findUnique: jest.fn()
      },
      bug: {
        count: jest.fn()
      }
    }
  };
});

jest.mock('./GameEventBus', () => {
  return {
    gameEventBus: {
      emit: jest.fn()
    }
  };
});

import prismaMock from '../utils/prisma';

describe('GameService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('transitionTo', () => {
    it('rejects invalid transitions', async () => {
      (prismaMock.gameState.findUnique as jest.Mock).mockResolvedValue({ phase: 'ENGINEERING' });
      await expect(GameService.transitionTo('HUNT')).rejects.toThrow(/Invalid transition/);
    });

    it('rejects concurrent/failed atomic updates', async () => {
      (prismaMock.gameState.findUnique as jest.Mock).mockResolvedValue({ phase: 'ENGINEERING' });
      (prismaMock.gameState.updateMany as jest.Mock).mockResolvedValue({ count: 0 }); // simulate conflict

      await expect(GameService.transitionTo('BUG_PLACEMENT')).rejects.toThrow(/Concurrent transition conflict/);
      expect(gameEventBus.emit).not.toHaveBeenCalled();
    });

    it('successfully transitions to BUG_PLACEMENT', async () => {
      (prismaMock.gameState.findUnique as jest.Mock).mockResolvedValue({ phase: 'ENGINEERING' });
      (prismaMock.gameState.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const newPhase = await GameService.transitionTo('BUG_PLACEMENT');
      expect(newPhase).toBe('BUG_PLACEMENT');
      expect(gameEventBus.emit).toHaveBeenCalledWith('ANY_EVENT', expect.objectContaining({ type: 'GAME_PHASE_CHANGED' }));
    });

    describe('HUNT start validation', () => {
      it('rejects HUNT start if teams are missing', async () => {
        (prismaMock.gameState.findUnique as jest.Mock).mockResolvedValue({ phase: 'BUG_PLACEMENT' });
        (prismaMock.team.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(GameService.transitionTo('HUNT')).rejects.toThrow(/Teams not configured/);
      });

      it('rejects HUNT start if one team has 0 bugs', async () => {
        (prismaMock.gameState.findUnique as jest.Mock).mockResolvedValue({ phase: 'BUG_PLACEMENT' });
        (prismaMock.team.findUnique as jest.Mock).mockResolvedValue({ id: 'team-1', name: 'TEAM' });
        
        // Return 1 for first count, 0 for second
        (prismaMock.bug.count as jest.Mock).mockResolvedValueOnce(1).mockResolvedValueOnce(0);

        await expect(GameService.transitionTo('HUNT')).rejects.toThrow(/HUNT start validation failed/);
      });

      it('allows HUNT start if both teams have bugs', async () => {
        (prismaMock.gameState.findUnique as jest.Mock).mockResolvedValue({ phase: 'BUG_PLACEMENT' });
        (prismaMock.team.findUnique as jest.Mock).mockResolvedValue({ id: 'team-1', name: 'TEAM' });
        
        (prismaMock.bug.count as jest.Mock).mockResolvedValue(1); // 1 bug each
        (prismaMock.gameState.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

        const newPhase = await GameService.transitionTo('HUNT');
        expect(newPhase).toBe('HUNT');
      });
    });
  });
});
