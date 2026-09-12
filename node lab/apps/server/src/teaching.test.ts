import { teachingRegistry } from '../../../packages/shared/src/teaching';

describe('Teaching Layer Foundation', () => {
  const expectedMissionIds = [
    'mission-01',
    'mission-02',
    'mission-03',
    'mission-04',
    'mission-05',
    'mission-06',
    'mission-07',
  ];

  it('A. All 7 mission IDs have teaching content', () => {
    expectedMissionIds.forEach((id) => {
      expect(teachingRegistry[id]).toBeDefined();
    });
  });

  it('B. Every mission has briefing, learning objectives, and at least one concept', () => {
    expectedMissionIds.forEach((id) => {
      const content = teachingRegistry[id];
      expect(content.briefing).toBeTruthy();
      expect(typeof content.briefing).toBe('string');
      expect(content.briefing.length).toBeGreaterThan(0);
      
      expect(Array.isArray(content.learningObjectives)).toBe(true);
      expect(content.learningObjectives.length).toBeGreaterThan(0);
      
      expect(Array.isArray(content.concepts)).toBe(true);
      expect(content.concepts.length).toBeGreaterThan(0);
    });
  });

  it('C. No mission teaching content is attached to invalid mission IDs', () => {
    const registryKeys = Object.keys(teachingRegistry);
    registryKeys.forEach((key) => {
      expect(expectedMissionIds.includes(key)).toBe(true);
    });
  });

  it('D. Teaching content does not alter mission progression state', () => {
    // We demonstrate that the registry is simply static metadata
    // and does not contain any mutable state fields like "status" or "completed".
    expectedMissionIds.forEach((id) => {
      const content = teachingRegistry[id] as any;
      expect(content.status).toBeUndefined();
      expect(content.completed).toBeUndefined();
      expect(content.progress).toBeUndefined();
    });
  });
});
