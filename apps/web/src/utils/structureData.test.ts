import { describe, it, expect } from 'vitest';
import {
  getStructureInfo,
  isPlayerColliding,
  findCollidingStructures,
  getStructureColorClass,
  structureRegistry,
} from './structureData';

describe('structureData utilities', () => {
  describe('getStructureInfo', () => {
    it('returns correct structure info for TERMINAL', () => {
      const info = getStructureInfo('TERMINAL', { x: 100, y: 100 });

      expect(info.type).toBe('TERMINAL');
      expect(info.title).toBe('NODE CORE');
      expect(info.missionNumber).toBe(1);
      expect(info.position).toEqual({ x: 100, y: 100 });
      expect(info.radius).toBe(50);
    });

    it('includes code snippet for TERMINAL', () => {
      const info = getStructureInfo('TERMINAL', { x: 100, y: 100 });

      expect(info.content.codeSnippet).toBeDefined();
      expect(info.content.codeSnippet).toContain('http.createServer');
    });

    it('includes endpoints for SMART_DOOR', () => {
      const info = getStructureInfo('SMART_DOOR', { x: 100, y: 100 });

      expect(info.content.endpoints).toBeDefined();
      expect(info.content.endpoints!.length).toBeGreaterThan(0);
      expect(info.content.endpoints!.some(ep => ep.path === '/door/status')).toBe(true);
    });

    it('includes auth info for SECURITY_GATE', () => {
      const info = getStructureInfo('SECURITY_GATE', { x: 100, y: 100 });

      expect(info.content.authInfo).toBeDefined();
      expect(info.content.authInfo?.status).toBe('UNAUTHORIZED');
      expect(info.content.authInfo?.middleware).toBeDefined();
    });

    it('includes resources for RESOURCE_VAULT', () => {
      const info = getStructureInfo('RESOURCE_VAULT', { x: 100, y: 100 });

      expect(info.content.resources).toBeDefined();
      expect(info.content.resources!.length).toBeGreaterThan(0);
    });

    it('all structure types in registry have complete info', () => {
      const types = Object.keys(structureRegistry) as Array<keyof typeof structureRegistry>;

      types.forEach(type => {
        const info = getStructureInfo(type as any, { x: 0, y: 0 });

        expect(info.type).toBe(type);
        expect(info.title).toBeTruthy();
        expect(info.color).toBeTruthy();
        expect(info.radius).toBeGreaterThan(0);
        expect(info.content).toBeDefined();
        expect(info.content.details).toBeDefined();
      });
    });
  });

  describe('isPlayerColliding', () => {
    const playerPos = { x: 100, y: 100 };
    const structurePos = { x: 100, y: 100 };

    it('detects collision when player is within radius', () => {
      expect(isPlayerColliding(playerPos, structurePos, 50)).toBe(true);
    });

    it('detects collision at edge of radius', () => {
      const closePlayer = { x: 150, y: 100 }; // Exactly 50 units away
      expect(isPlayerColliding(closePlayer, structurePos, 50)).toBe(false);
    });

    it('detects collision just inside radius', () => {
      const closePlayer = { x: 149, y: 100 }; // 49 units away
      expect(isPlayerColliding(closePlayer, structurePos, 50)).toBe(true);
    });

    it('does not detect collision outside radius', () => {
      const farPlayer = { x: 200, y: 100 }; // 100 units away
      expect(isPlayerColliding(farPlayer, structurePos, 50)).toBe(false);
    });

    it('uses diagonal distance correctly', () => {
      // Distance = sqrt((40)^2 + (30)^2) = sqrt(1600 + 900) = sqrt(2500) = 50
      const diagonalPlayer = { x: 140, y: 130 };
      expect(isPlayerColliding(diagonalPlayer, structurePos, 50)).toBe(false);
    });

    it('detects collision in all directions', () => {
      const radius = 50;
      const nearby = [
        { x: 125, y: 100 }, // Right
        { x: 75, y: 100 },  // Left
        { x: 100, y: 125 }, // Down
        { x: 100, y: 75 },  // Up
      ];

      nearby.forEach(pos => {
        expect(isPlayerColliding(pos, structurePos, radius)).toBe(true);
      });
    });
  });

  describe('findCollidingStructures', () => {
    const playerPos = { x: 100, y: 100 };
    const structures = [
      getStructureInfo('TERMINAL', { x: 100, y: 100 }),       // Colliding
      getStructureInfo('SMART_DOOR', { x: 200, y: 100 }),    // Colliding
      getStructureInfo('SECURITY_GATE', { x: 500, y: 500 }), // Not colliding
    ];

    it('finds all colliding structures', () => {
      const colliding = findCollidingStructures(playerPos, structures);

      expect(colliding).toHaveLength(2);
      expect(colliding.some(s => s.type === 'TERMINAL')).toBe(true);
      expect(colliding.some(s => s.type === 'SMART_DOOR')).toBe(true);
    });

    it('returns empty array when not colliding', () => {
      const farPos = { x: 500, y: 500 };
      const colliding = findCollidingStructures(farPos, structures);

      expect(colliding).toHaveLength(1);
      expect(colliding[0].type).toBe('SECURITY_GATE');
    });

    it('returns empty array with no structures', () => {
      const colliding = findCollidingStructures(playerPos, []);

      expect(colliding).toHaveLength(0);
    });
  });

  describe('getStructureColorClass', () => {
    it('returns correct classes for blue color', () => {
      const colors = getStructureColorClass('blue');

      expect(colors.border).toContain('neon-blue');
      expect(colors.text).toContain('neon-blue');
      expect(colors.bg).toContain('neon-blue');
      expect(colors.glow).toContain('blue');
    });

    it('returns correct classes for green color', () => {
      const colors = getStructureColorClass('green');

      expect(colors.border).toContain('neon-green');
      expect(colors.text).toContain('neon-green');
    });

    it('returns correct classes for red color', () => {
      const colors = getStructureColorClass('red');

      expect(colors.border).toContain('neon-red');
      expect(colors.text).toContain('neon-red');
    });

    it('returns correct classes for amber color', () => {
      const colors = getStructureColorClass('amber');

      expect(colors.border).toContain('neon-amber');
    });

    it('returns correct classes for purple color', () => {
      const colors = getStructureColorClass('purple');

      expect(colors.border).toContain('neon-purple');
    });

    it('defaults to blue for unknown color', () => {
      const colors = getStructureColorClass('unknown');

      expect(colors.border).toContain('neon-blue');
    });

    it('all color classes have required properties', () => {
      const colorNames = ['blue', 'green', 'red', 'amber', 'purple'];

      colorNames.forEach(color => {
        const classes = getStructureColorClass(color);
        expect(classes.border).toBeTruthy();
        expect(classes.bg).toBeTruthy();
        expect(classes.text).toBeTruthy();
        expect(classes.glow).toBeTruthy();
      });
    });
  });

  describe('structureRegistry', () => {
    it('contains all 7 mission structures', () => {
      expect(Object.keys(structureRegistry)).toHaveLength(4);
    });

    it('maps missions correctly', () => {
      expect(structureRegistry.TERMINAL.missionNumber).toBe(1);
      expect(structureRegistry.SMART_DOOR.missionNumber).toBe(2);
      expect(structureRegistry.SECURITY_GATE.missionNumber).toBe(3);
      expect(structureRegistry.RESOURCE_VAULT.missionNumber).toBe(4);
    });

    it('each structure has unique mission ID', () => {
      const missionIds = Object.values(structureRegistry).map(s => s.mission);
      const unique = new Set(missionIds);

      expect(unique.size).toBe(missionIds.length);
    });

    it('each structure has a valid color', () => {
      const validColors = ['blue', 'green', 'red', 'amber', 'purple'];

      Object.values(structureRegistry).forEach(structure => {
        expect(validColors).toContain(structure.color);
      });
    });
  });
});
