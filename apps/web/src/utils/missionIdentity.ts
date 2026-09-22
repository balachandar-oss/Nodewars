import {
  Cpu,
  Network,
  ShieldCheck,
  Database,
  GitMerge,
  Activity,
  Target,
  Radio
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface MissionIdentity {
  missionId: string;
  systemName: string;
  shortName: string;
  designation: string;
  systemRole: string;
  icon: LucideIcon;
}

export const missionIdentities: Record<string, MissionIdentity> = {
  'mission-01': {
    missionId: 'mission-01',
    systemName: 'NODE CORE',
    shortName: 'FIRST SERVER',
    designation: '01',
    systemRole: 'MODULES + RUNTIME FOUNDATION',
    icon: Cpu
  },
  'mission-02': {
    missionId: 'mission-02',
    systemName: 'API GATEWAY',
    shortName: 'SMART DOOR',
    designation: '02',
    systemRole: 'NPM PACKAGES',
    icon: Network
  },
  'mission-03': {
    missionId: 'mission-03',
    systemName: 'ACCESS CONTROL',
    shortName: 'SECURITY GATE',
    designation: '05',
    systemRole: 'AUTHENTICATION + AUTHORIZATION (BONUS)',
    icon: ShieldCheck
  },
  'mission-04': {
    missionId: 'mission-04',
    systemName: 'RESOURCE VAULT',
    shortName: 'DATA STORE',
    designation: '06',
    systemRole: 'PERSISTENT PROTECTED RESOURCES (BONUS)',
    icon: Database
  },
  'mission-05': {
    missionId: 'mission-05',
    systemName: 'ASYNC ENGINE',
    shortName: 'ASYNC OPERATIONS',
    designation: '07',
    systemRole: 'NON-BLOCKING OPERATIONS (BONUS)',
    icon: GitMerge
  },
  'mission-06': {
    missionId: 'mission-06',
    systemName: 'EVENT MONITOR',
    shortName: 'LIVE SECURITY MONITOR',
    designation: '03',
    systemRole: 'EVENTS (EventEmitter)',
    icon: Activity
  },
  'mission-08': {
    missionId: 'mission-08',
    systemName: 'SIGNAL TOWER',
    shortName: 'SIGNAL TOWER',
    designation: '04',
    systemRole: 'DEPLOYMENT + HOSTING',
    icon: Radio
  },
  'mission-07': {
    missionId: 'mission-07',
    systemName: 'SECURITY TEST RANGE',
    shortName: 'BREAK IT',
    designation: '08',
    systemRole: 'CONTROLLED ADVERSARIAL TESTING (BONUS)',
    icon: Target
  }
};

/**
 * Gets the presentation identity of a mission.
 * Provides a highly visible fallback during development if a mission identity is missing.
 * There are 8 mapped missions: 4 core (mission-01, mission-02, mission-06, mission-08)
 * and 4 bonus (mission-03, mission-04, mission-05, mission-07).
 */
export function getMissionIdentity(missionId: string): MissionIdentity {
  return missionIdentities[missionId] || {
    missionId,
    systemName: 'UNKNOWN SYSTEM',
    shortName: 'UNKNOWN',
    designation: '??',
    systemRole: 'UNKNOWN ROLE',
    icon: Cpu
  };
}
