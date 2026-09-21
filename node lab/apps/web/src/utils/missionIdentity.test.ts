import { describe, it, expect } from 'vitest';
import { missionIdentities, getMissionIdentity } from './missionIdentity';
import { teachingRegistry } from '@node-wars/shared';

describe('Mission Identity', () => {
  it('contains exactly 7 mission identities', () => {
    const keys = Object.keys(missionIdentities);
    expect(keys.length).toBe(7);
  });

  it('does not contain mission-08', () => {
    expect(missionIdentities['mission-08']).toBeUndefined();
  });

  it('maps missions 01-07 correctly', () => {
    expect(getMissionIdentity('mission-01').systemName).toBe('NODE CORE');
    expect(getMissionIdentity('mission-02').systemName).toBe('API GATEWAY');
    expect(getMissionIdentity('mission-03').systemName).toBe('ACCESS CONTROL');
    expect(getMissionIdentity('mission-04').systemName).toBe('RESOURCE VAULT');
    expect(getMissionIdentity('mission-05').systemName).toBe('ASYNC ENGINE');
    expect(getMissionIdentity('mission-06').systemName).toBe('EVENT MONITOR');
    expect(getMissionIdentity('mission-07').systemName).toBe('SECURITY TEST RANGE');
  });

  it('ensures NarrativeContent.systemName aligns with MissionIdentity.systemName', () => {
    for (let i = 1; i <= 7; i++) {
      const missionId = `mission-0${i}`;
      const identity = getMissionIdentity(missionId);
      const narrativeSystemName = teachingRegistry[missionId]?.narrative?.systemName;
      
      // They should align if narrativeSystemName exists.
      if (narrativeSystemName) {
        expect(narrativeSystemName.toUpperCase()).toBe(identity.systemName);
      }
    }
  });

  it('provides a pure mapping without side effects', () => {
    const identity1 = getMissionIdentity('mission-01');
    const identity2 = getMissionIdentity('mission-01');
    expect(identity1).toBe(identity2); // Same object reference
    expect(identity1.icon).toBeDefined();
  });
});
