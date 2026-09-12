export interface User {
  id: string;
  username: string;
  role: 'PLAYER' | 'ADMIN';
  teamId?: string;
  level: number;
  xp: number;
  missionsCompleted: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  order: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'CRITICAL';
  xpReward: number;
  concepts: string[];
  instructions: string;
  starterCode: string;
  unlockComponent: string;
}

export interface MissionProgress {
  userId: string;
  missionId: string;
  status: 'LOCKED' | 'ACTIVE' | 'COMPLETE';
  completedAt?: Date;
}

export * from './teaching';
export { teachingRegistry } from './teaching';
