import { describe, it, expect } from 'vitest';
import { teachingRegistry } from './teaching';

describe('Teaching Registry Narrative Validation', () => {
  it('should have exactly 7 missions with narrative content', () => {
    const keys = Object.keys(teachingRegistry);
    const missionKeys = keys.filter(k => k.startsWith('mission-0'));
    
    expect(missionKeys.length).toBe(7);
    
    // Ensure no mission-08
    expect(missionKeys.includes('mission-08')).toBe(false);

    // Verify all missions have narrative content
    missionKeys.forEach(key => {
      const mission = teachingRegistry[key];
      expect(mission.narrative).toBeDefined();
      
      const narrative = mission.narrative!;
      expect(narrative.act).toBeDefined();
      expect(narrative.systemName).toBeDefined();
      expect(narrative.threatStatus).toBeDefined();
      expect(narrative.objective).toBeDefined();
      expect(narrative.systemConnection).toBeDefined();
      expect(narrative.successMessage).toBeDefined();
      expect(narrative.systemStatus).toBeDefined();
      expect(narrative.nextThreat).toBeDefined();
      expect(narrative.nextObjective).toBeDefined();
    });
  });

  it('should have correct act progression', () => {
    expect(teachingRegistry['mission-01'].narrative!.act).toBe('ACT I — AWAKEN');
    expect(teachingRegistry['mission-02'].narrative!.act).toBe('ACT I — AWAKEN');
    expect(teachingRegistry['mission-03'].narrative!.act).toBe('ACT II — SECURE');
    expect(teachingRegistry['mission-04'].narrative!.act).toBe('ACT II — SECURE');
    expect(teachingRegistry['mission-05'].narrative!.act).toBe('ACT III — STABILIZE');
    expect(teachingRegistry['mission-06'].narrative!.act).toBe('ACT IV — WATCH');
    expect(teachingRegistry['mission-07'].narrative!.act).toBe('ACT V — BREACH');
  });

  it('should have correct mission titles unchanged', () => {
    expect(teachingRegistry['mission-01'].title).toBe('First Server');
    expect(teachingRegistry['mission-02'].title).toBe('Smart Door');
    expect(teachingRegistry['mission-03'].title).toBe('Security Gate');
    expect(teachingRegistry['mission-04'].title).toBe('Resource Vault');
    expect(teachingRegistry['mission-05'].title).toBe('Async Operations');
    expect(teachingRegistry['mission-06'].title).toBe('Live Security Monitor');
    expect(teachingRegistry['mission-07'].title).toBe('Break It');
  });
});
