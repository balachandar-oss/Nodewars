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
    shortName: 'NODE CORE',
    designation: '01',
    systemRole: 'Node.js + Modules',
    icon: Cpu
  },
  'mission-02': {
    missionId: 'mission-02',
    systemName: 'NPM SUPPLY',
    shortName: 'NPM SUPPLY',
    designation: '02',
    systemRole: 'NPM + Packages',
    icon: Network
  },
  'mission-03': {
    missionId: 'mission-03',
    systemName: 'EVENT SYSTEM',
    shortName: 'EVENT SYSTEM',
    designation: '03',
    systemRole: 'Events + EventEmitter',
    icon: Activity
  },
  'mission-04': {
    missionId: 'mission-04',
    systemName: 'SIGNAL TOWER',
    shortName: 'SIGNAL TOWER',
    designation: '04',
    systemRole: 'Deployment + Hosting',
    icon: Radio
  }
};

/**
 * Gets the presentation identity of a mission.
 * Provides a highly visible fallback during development if a mission identity is missing.
 * There are exactly 4 mapped missions.
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
