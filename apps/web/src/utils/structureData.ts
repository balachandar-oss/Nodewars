import type { LucideIcon } from 'lucide-react';
import {
  Cpu,
  Network,
  ShieldCheck,
  Database,
  GitMerge,
  Activity,
  Target
} from 'lucide-react';

export type StructureType = 'TERMINAL' | 'SMART_DOOR' | 'SECURITY_GATE' | 'RESOURCE_VAULT' | 'ASYNC_ENGINE' | 'LIVE_MONITOR' | 'CORE_PATCH';

export interface StructureInfo {
  id: string;
  type: StructureType;
  mission: string;
  missionNumber: number;
  title: string;
  description: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'amber' | 'purple';
  position: { x: number; y: number };
  radius: number;
  content: StructureContent;
}

export interface StructureContent {
  title: string;
  subtitle: string;
  details: DetailItem[];
  codeSnippet?: string;
  endpoints?: EndpointInfo[];
  eventStream?: EventStreamItem[];
  resources?: ResourceItem[];
  authInfo?: AuthInfo;
}

export interface DetailItem {
  label: string;
  value: string | number | boolean;
}

export interface EndpointInfo {
  method: string;
  path: string;
  description: string;
  status?: string;
}

export interface EventStreamItem {
  event: string;
  timestamp: string;
  payload?: Record<string, any>;
}

export interface ResourceItem {
  id: string;
  type: string;
  created: string;
  status: string;
}

export interface AuthInfo {
  status: 'AUTHENTICATED' | 'UNAUTHORIZED' | 'FORBIDDEN';
  role?: string;
  permissions?: string[];
  middleware?: string[];
}

// Structure data mapping
export const structureRegistry: Record<StructureType, Omit<StructureInfo, 'position'>> = {
  TERMINAL: {
    id: 'structure-terminal-mission-01',
    type: 'TERMINAL',
    mission: 'mission-01',
    missionNumber: 1,
    title: 'NODE CORE',
    description: 'The foundation HTTP server handling all incoming requests',
    icon: Cpu,
    color: 'blue',
    radius: 50,
    content: {
      title: 'TERMINAL (Mission 01)',
      subtitle: 'NODE CORE RUNTIME',
      details: [
        { label: 'Status', value: 'RUNNING' },
        { label: 'Port', value: 3000 },
        { label: 'Protocol', value: 'HTTP/1.1' },
        { label: 'Uptime', value: '24h 13m' },
      ],
      codeSnippet: `const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server running on port 3000');
});
server.listen(3000);`,
    },
  },
  SMART_DOOR: {
    id: 'structure-door-mission-02',
    type: 'SMART_DOOR',
    mission: 'mission-02',
    missionNumber: 2,
    title: 'API GATEWAY',
    description: 'Routes requests to the appropriate backend services',
    icon: Network,
    color: 'green',
    radius: 50,
    content: {
      title: 'SMART DOOR (Mission 02)',
      subtitle: 'API GATEWAY & ROUTING LAYER',
      details: [
        { label: 'Status', value: 'LOCKED' },
        { label: 'Routes Active', value: 4 },
        { label: 'Request Throughput', value: '1.2k/s' },
      ],
      endpoints: [
        { method: 'GET', path: '/door/status', description: 'Get current door state' },
        { method: 'POST', path: '/door/access', description: 'Request door access' },
        { method: 'POST', path: '/door/open', description: 'Unlock door (AUTH required)' },
        { method: 'GET', path: '/door/logs', description: 'Access audit logs' },
      ],
    },
  },
  SECURITY_GATE: {
    id: 'structure-gate-mission-03',
    type: 'SECURITY_GATE',
    mission: 'mission-03',
    missionNumber: 3,
    title: 'ACCESS CONTROL',
    description: 'Authentication and authorization middleware',
    icon: ShieldCheck,
    color: 'red',
    radius: 50,
    content: {
      title: 'SECURITY GATE (Mission 03)',
      subtitle: 'ACCESS CONTROL LAYER',
      details: [
        { label: 'Auth Status', value: '401 UNAUTHORIZED' },
        { label: 'Middleware Checks', value: 5 },
        { label: 'Roles Configured', value: 3 },
      ],
      authInfo: {
        status: 'UNAUTHORIZED',
        role: 'GUEST',
        permissions: [],
        middleware: [
          'validateToken()',
          'checkRole()',
          'validatePermissions()',
          'logAccess()',
          'rateLimit()',
        ],
      },
    },
  },
  RESOURCE_VAULT: {
    id: 'structure-vault-mission-04',
    type: 'RESOURCE_VAULT',
    mission: 'mission-04',
    missionNumber: 4,
    title: 'RESOURCE VAULT',
    description: 'Persistent data storage with CRUD operations',
    icon: Database,
    color: 'blue',
    radius: 50,
    content: {
      title: 'RESOURCE VAULT (Mission 04)',
      subtitle: 'DATABASE & RESOURCE STORAGE',
      details: [
        { label: 'Database', value: 'PostgreSQL' },
        { label: 'Connection Status', value: 'ACTIVE' },
        { label: 'Stored Resources', value: 247 },
        { label: 'Last Backup', value: '2 hours ago' },
      ],
      resources: [
        { id: 'res-001', type: 'USER_DATA', created: '2024-09-21', status: 'ACTIVE' },
        { id: 'res-002', type: 'SESSION_TOKEN', created: '2024-09-21', status: 'ACTIVE' },
        { id: 'res-003', type: 'AUDIT_LOG', created: '2024-09-21', status: 'ACTIVE' },
      ],
    },
  },
  ASYNC_ENGINE: {
    id: 'structure-async-mission-05',
    type: 'ASYNC_ENGINE',
    mission: 'mission-05',
    missionNumber: 5,
    title: 'ASYNC ENGINE',
    description: 'Non-blocking async operations and event queue',
    icon: GitMerge,
    color: 'amber',
    radius: 50,
    content: {
      title: 'ASYNC ENGINE (Mission 05)',
      subtitle: 'ASYNC PROCESSING & QUEUING',
      details: [
        { label: 'Queue Status', value: 'PROCESSING' },
        { label: 'Pending Jobs', value: 12 },
        { label: 'Completed', value: 1543 },
        { label: 'Failed', value: 2 },
      ],
    },
  },
  LIVE_MONITOR: {
    id: 'structure-monitor-mission-06',
    type: 'LIVE_MONITOR',
    mission: 'mission-06',
    missionNumber: 6,
    title: 'EVENT MONITOR',
    description: 'Real-time event streaming and monitoring',
    icon: Activity,
    color: 'purple',
    radius: 50,
    content: {
      title: 'LIVE MONITOR (Mission 06)',
      subtitle: 'REAL-TIME EVENT STREAM',
      details: [
        { label: 'Stream Status', value: 'ACTIVE' },
        { label: 'Events/sec', value: 42 },
        { label: 'Connected Clients', value: 8 },
      ],
      eventStream: [
        { event: 'PLAYER_ENTERED', timestamp: '2024-09-21T14:32:15Z', payload: { player: 'user-123', zone: 'core' } },
        { event: 'DOOR_OPENED', timestamp: '2024-09-21T14:31:42Z', payload: { door_id: 'door-02', auth: true } },
        { event: 'RESOURCE_CREATED', timestamp: '2024-09-21T14:31:15Z', payload: { type: 'token', id: 'tok-456' } },
        { event: 'BUG_FOUND', timestamp: '2024-09-21T14:30:08Z', payload: { category: 'auth', severity: 'high' } },
        { event: 'SYSTEM_PING', timestamp: '2024-09-21T14:29:55Z', payload: { latency_ms: 42 } },
      ],
    },
  },
  CORE_PATCH: {
    id: 'structure-core-mission-07',
    type: 'CORE_PATCH',
    mission: 'mission-07',
    missionNumber: 7,
    title: 'SECURITY TEST RANGE',
    description: 'Controlled adversarial testing environment',
    icon: Target,
    color: 'amber',
    radius: 50,
    content: {
      title: 'CORE PATCH (Mission 07)',
      subtitle: 'CONTROLLED BREACH TEST',
      details: [
        { label: 'Test Status', value: 'ACTIVE' },
        { label: 'Attack Vectors', value: 7 },
        { label: 'Vulnerabilities Found', value: 3 },
        { label: 'Security Score', value: '72%' },
      ],
    },
  },
};

/**
 * Get structure info by type
 */
export function getStructureInfo(type: StructureType, position: { x: number; y: number }): StructureInfo {
  const base = structureRegistry[type];
  return {
    ...base,
    position,
  };
}

/**
 * Check if a position is within collision radius of a structure
 */
export function isPlayerColliding(
  playerPos: { x: number; y: number },
  structurePos: { x: number; y: number },
  collisionRadius: number
): boolean {
  const dx = playerPos.x - structurePos.x;
  const dy = playerPos.y - structurePos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < collisionRadius;
}

/**
 * Find all structures player is currently colliding with
 */
export function findCollidingStructures(
  playerPos: { x: number; y: number },
  structures: StructureInfo[]
): StructureInfo[] {
  return structures.filter(struct =>
    isPlayerColliding(playerPos, struct.position, struct.radius)
  );
}

/**
 * Get color class for structure UI
 */
export function getStructureColorClass(color: string): {
  border: string;
  bg: string;
  text: string;
  glow: string;
} {
  const colorMap: Record<string, { border: string; bg: string; text: string; glow: string }> = {
    blue: {
      border: 'border-neon-blue',
      bg: 'bg-neon-blue/10',
      text: 'text-neon-blue',
      glow: 'glow-blue',
    },
    green: {
      border: 'border-neon-green',
      bg: 'bg-neon-green/10',
      text: 'text-neon-green',
      glow: 'glow-green',
    },
    red: {
      border: 'border-neon-red',
      bg: 'bg-neon-red/10',
      text: 'text-neon-red',
      glow: 'glow-red',
    },
    amber: {
      border: 'border-neon-amber',
      bg: 'bg-neon-amber/10',
      text: 'text-neon-amber',
      glow: 'glow-amber',
    },
    purple: {
      border: 'border-neon-purple',
      bg: 'bg-neon-purple/10',
      text: 'text-neon-purple',
      glow: 'glow-purple',
    },
  };

  return colorMap[color] || colorMap.blue;
}
