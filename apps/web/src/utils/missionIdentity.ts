import { 
  Cpu, 
  Network, 
  ShieldCheck, 
  Database, 
  GitMerge, 
  Activity, 
  Target
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
    systemRole: 'RUNTIME / SERVER FOUNDATION',
    icon: Cpu
  },
  'mission-02': {
    missionId: 'mission-02',
    systemName: 'API GATEWAY',
    shortName: 'SMART DOOR',
    designation: '02',
    systemRole: 'ROUTING AND REQUEST HANDLING',
    icon: Network
  },
  'mission-03': {
    missionId: 'mission-03',
    systemName: 'ACCESS CONTROL',
    shortName: 'SECURITY GATE',
    designation: '03',
    systemRole: 'AUTHENTICATION + AUTHORIZATION',
    icon: ShieldCheck
  },
  'mission-04': {
    missionId: 'mission-04',
    systemName: 'RESOURCE VAULT',
    shortName: 'DATA STORE',
    designation: '04',
    systemRole: 'PERSISTENT PROTECTED RESOURCES',
    icon: Database
  },
  'mission-05': {
    missionId: 'mission-05',
    systemName: 'ASYNC ENGINE',
    shortName: 'ASYNC OPERATIONS',
    designation: '05',
    systemRole: 'NON-BLOCKING OPERATIONS',
    icon: GitMerge
  },
  'mission-06': {
    missionId: 'mission-06',
    systemName: 'EVENT MONITOR',
    shortName: 'LIVE SECURITY MONITOR',
    designation: '06',
    systemRole: 'REAL-TIME EVENT OBSERVATION',
    icon: Activity
  },
  'mission-07': {
    missionId: 'mission-07',
    systemName: 'SECURITY TEST RANGE',
    shortName: 'BREAK IT',
    designation: '07',
    systemRole: 'CONTROLLED ADVERSARIAL TESTING',
    icon: Target
  }
};

/**
 * Gets the presentation identity of a mission.
 * Provides a highly visible fallback during development if a mission identity is missing,
 * though tests enforce exactly 7 mapped missions.
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
