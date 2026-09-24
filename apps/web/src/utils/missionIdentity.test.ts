import { describe, it, expect } from 'vitest';
import { missionIdentities, getMissionIdentity } from './missionIdentity';
import { teachingRegistry } from '@node-wars/shared';

describe('Mission Identity', () => {
  it('contains exactly 4 mission identities', () => {
    const keys = Object.keys(missionIdentities);
    expect(keys.length).toBe(4);
  });

  it('does not contain mission-05', () => {
    expect(missionIdentities['mission-05']).toBeUndefined();
  });

  it('maps missions 01-04 correctly', () => {
    expect(getMissionIdentity('mission-01').systemName).toBe('NODE CORE');
    expect(getMissionIdentity('mission-02').systemName).toBe('NPM SUPPLY');
    expect(getMissionIdentity('mission-03').systemName).toBe('EVENT SYSTEM');
    expect(getMissionIdentity('mission-04').systemName).toBe('SIGNAL TOWER');
  });

  it('ensures NarrativeContent.systemName aligns with MissionIdentity.systemName', () => {
    for (let i = 1; i <= 4; i++) {
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
