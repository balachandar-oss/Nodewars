import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Shield, Target, Server as ServerIcon, DoorOpen, HardDrive, Zap, Bug, Activity, CheckCircle, Lock } from 'lucide-react';
import { teachingRegistry } from '@node-wars/shared';
import { getSystemVisualState, type SystemVisualState } from '../utils/systemState';
import { getMissionIdentity } from '../utils/missionIdentity';
import { API_URL } from '../utils/api';

interface UserData {
  username: string;
  role: string;
  level: number;
  xp: number;
  missionsCompleted: number;
  team?: { name: string };
  progress: Array<{ missionId: string, status: string }>;
}

interface Mission {
  id: string;
  title: string;
  order: number;
  status: string;
  xpReward: number;
  description?: string;
  unlockComponent?: string;
}

const getMissionIcon = (order: number) => {
  switch(order) {
    case 1: return ServerIcon;
    case 2: return DoorOpen;
    case 3: return Shield;
    case 4: return HardDrive;
    case 5: return Zap;
    case 6: return Activity;
    case 7: return Bug;
    default: return Target;
  }
};

const Dashboard = () => {
  const { user } = useOutletContext<{ user: UserData }>();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [gameState, setGameState] = useState<{ phase: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const [missionsRes, stateRes] = await Promise.all([
          fetch(`${API_URL}/api/missions`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/game/state`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (stateRes.ok) {
          const stateData = await stateRes.json();
          setGameState({ phase: stateData.phase });
        }

        if (missionsRes.ok) {
          const data = await missionsRes.json();
          const mapped = data.map((m: any) => {
            const prog = user.progress?.find(p => p.missionId === m.id);
            const status = prog?.status || (m.order === 1 ? 'ACTIVE' : 'LOCKED');

            return {
              ...m,
              status
            };
          });
          setMissions(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (!user) return null;

  if (missions.length === 0) {
    return (
      <div className="w-full h-full flex flex-col relative z-10 animate-fade-in">
        <div className="skeleton h-16 mb-4"></div>
        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
          <div className="w-full lg:w-1/5 lg:min-w-[280px] flex flex-col gap-2">
            <div className="skeleton h-10"></div>
            <div className="skeleton h-16"></div>
            <div className="skeleton h-16"></div>
            <div className="skeleton h-16"></div>
            <div className="skeleton h-16"></div>
          </div>
          <div className="flex-1 skeleton"></div>
        </div>
      </div>
    );
  }

  const totalPossibleXp = missions.reduce((sum, m) => sum + (m.xpReward || 0), 0) || user.level * 200;
  const nextLevelXp = totalPossibleXp;
  const xpProgress = (user.xp / nextLevelXp) * 100;
  const completedCount = missions.filter(m => m.status === 'COMPLETE').length;
  const isMaxLevel = missions.length > 0 && completedCount >= missions.length;
  const capstoneComplete = user.progress?.find(p => p.missionId === 'capstone')?.status === 'COMPLETE';
  // Organizer/demo roles skip actually completing missions, so give them
  // direct access to the capstone and quiz for testing regardless of progress.
  const isPrivilegedRole = user.role === 'DEMO' || user.role === 'ADMIN' || user.role === 'INSTRUCTOR';

  // Helpers for Castle Blueprint
  const getMissionVisualState = (order: number): SystemVisualState => {
    const m = missions.find(m => m.order === order);
    if (!m) return 'LOCKED';
    const isAccessible = !('LOCKED' === m.status) || user.role === 'DEMO' || user.role === 'ADMIN' || user.role === 'INSTRUCTOR';
    return getSystemVisualState(m.status, isAccessible);
  };

  const getPathClass = (sourceOrder: number, targetOrder: number) => {
    const targetState = getMissionVisualState(targetOrder);

    // If the target is accessible in the star topology, the path is active.
    if (targetState !== 'LOCKED') return 'path-active';

    return 'path-locked';
  };

  const positions = {
    1: { left: '50%', top: '80%' },
    2: { left: '50%', top: '59%' },
    3: { left: '50%', top: '38%' },
    4: { left: '50%', top: '17%' },
  };

  return (
    <div className="w-full h-full flex flex-col relative z-10 animate-slide-in">

      {/* SUMMARY HEADER */}
      <div className="glass-panel p-3 px-6 flex flex-wrap justify-between items-center gap-3 mb-4 sticky top-0 z-50">
        <div className="flex items-center gap-6 flex-wrap">
          <span className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Command center</span>
          <span className="chip chip-gold">{gameState?.phase || 'Loading'}</span>
          <span className="chip chip-mint flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-mint)' }}></div>
            Live
          </span>
        </div>
        <div className="flex items-center gap-6 flex-wrap">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Team {user.team?.name || 'Unassigned'}</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {isMaxLevel ? 'MAX LEVEL' : `Level ${user.level}`}
          </span>
          <span className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            XP {user.xp} / {nextLevelXp}
            <div className="w-24 h-2 rounded-full clay-inset overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(xpProgress, 100)}%`, backgroundColor: 'var(--accent-gold)' }}></div>
            </div>
          </span>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Systems {completedCount} / 4</span>
          {(completedCount >= 4 || isPrivilegedRole) && (
            <button onClick={() => navigate('/lab/capstone')} className={capstoneComplete ? 'clay-button-secondary px-5 py-2 text-xs font-bold' : 'clay-button px-5 py-2 text-xs font-bold'}>
              {capstoneComplete ? 'Review Build' : 'Build Game'}
            </button>
          )}
          {(capstoneComplete || isPrivilegedRole) && (
            <button onClick={() => navigate('/quiz')} className="clay-button px-5 py-2 text-xs font-bold">
              Enter Quiz
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">

        {/* MISSION LIST (Left) */}
        <div className="w-full lg:w-1/5 lg:min-w-[280px] clay-panel p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <Activity size={16} style={{ color: 'var(--accent-purple)' }} />
            <h3 className="font-display text-base font-bold" style={{ color: 'var(--text-primary)' }}>Missions</h3>
          </div>

          <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
            {missions.length === 0 && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading missions...</div>}
            {(() => {
              let currentAct = '';
              return missions.map((mission) => {
                const content = teachingRegistry[mission.id];
                const narrative = content?.narrative;
                const displayAct = narrative?.act;

                const showActHeader = displayAct && displayAct !== currentAct;
                if (displayAct) currentAct = displayAct;
                const visualState = getMissionVisualState(mission.order);
                const identity = getMissionIdentity(mission.id);
                const isComplete = visualState === 'COMPLETED';
                const isCurrent = visualState === 'CURRENT';
                const isAccessible = visualState !== 'LOCKED';

                let chipClass = 'chip-purple';
                let dotColor = 'var(--text-muted)';

                if (isComplete) {
                  chipClass = 'chip-sky';
                  dotColor = 'var(--accent-sky)';
                } else if (isCurrent) {
                  chipClass = 'chip-mint';
                  dotColor = 'var(--accent-mint)';
                } else if (isAccessible) {
                  chipClass = 'chip-mint';
                  dotColor = 'var(--accent-mint)';
                }

                return (
                  <React.Fragment key={mission.id}>
                    {showActHeader && (
                      <div className="mt-2 mb-1 text-[10px] font-semibold uppercase tracking-wide pb-1" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                        {displayAct}
                      </div>
                    )}
                    <div
                      onClick={() => isAccessible && navigate(`/lab/${mission.id}`)}
                      className={`p-3 rounded-2xl transition-all flex items-center justify-between ${isAccessible ? 'cursor-pointer hover:bg-[var(--bg-tertiary)]' : 'cursor-not-allowed opacity-50'}`}
                      style={{ backgroundColor: isCurrent ? 'rgba(111, 216, 168, 0.1)' : 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-[10px] w-4 text-center" style={{ color: 'var(--text-muted)' }}>
                          {mission.order.toString().padStart(2, '0')}
                        </div>
                        <div className="flex flex-col gap-0.5 text-xs">
                          <span className="text-[10px] opacity-70" style={{ color: 'var(--text-secondary)' }}>{mission.title}</span>
                          <span className="flex items-center gap-2 font-semibold" style={{ color: 'var(--text-primary)' }}>
                            <identity.icon size={12} className="opacity-70" />
                            {identity.systemName}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isAccessible && <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{mission.xpReward}XP</div>}
                        {isComplete ? (
                          <CheckCircle size={14} style={{ color: 'var(--accent-sky)' }} />
                        ) : !isAccessible ? (
                          <Lock size={14} style={{ color: 'var(--text-muted)' }} />
                        ) : (
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }}></div>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              });
            })()}
          </div>

          {/* Live Event Feed */}
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
            <div className="text-xs font-semibold mb-2" style={{ color: 'var(--accent-mint)' }}>
              Live activity
            </div>
            <div className="space-y-1 clay-inset p-2 rounded-2xl text-[10px]">
              <div className="flex gap-2 animate-slide-in" style={{ color: 'var(--text-secondary)' }}>
                <span className="shrink-0" style={{ color: 'var(--accent-purple)' }}>{new Date(Date.now() - 120000).toLocaleTimeString()}</span>
                <span className="truncate">System started</span>
              </div>
              <div className="flex gap-2 animate-slide-in" style={{ animationDelay: '0.1s', color: 'var(--text-secondary)' }}>
                <span className="shrink-0" style={{ color: 'var(--accent-gold)' }}>{new Date(Date.now() - 60000).toLocaleTimeString()}</span>
                <span className="truncate">{user.username} connected</span>
              </div>
              <div className="flex gap-2 animate-slide-in" style={{ animationDelay: '0.2s', color: 'var(--text-secondary)' }}>
                <span className="shrink-0" style={{ color: 'var(--accent-mint)' }}>{new Date().toLocaleTimeString()}</span>
                <span className="truncate">Map synced</span>
              </div>
            </div>
          </div>
        </div>

        {/* CASTLE MAP (Right) */}
        <div className="flex-1 clay-panel p-0 relative overflow-hidden flex flex-col">

          {/* Labeling overlay */}
          <div className="absolute top-6 left-6 z-20 pointer-events-none">
            <h2 className="text-xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
              Fortress network
            </h2>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Your castle's systems, at a glance</div>
          </div>

          {/* CASTLE CANVAS */}
          <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden p-4">
            <div className="w-full h-full relative max-w-[1200px] max-h-[900px]">

              {/* SVG Blueprint Layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 1000" preserveAspectRatio="none">
                <defs>
                  <style>
                    {`
                      .path-locked { stroke: rgba(124, 111, 224, 0.12); stroke-width: 2; fill: none; stroke-dasharray: 4 4; }
                      .path-active { stroke: #6fd8a8; stroke-width: 3; fill: none; stroke-dasharray: 12; animation: flow 1.2s linear infinite; }
                      @keyframes flow { to { stroke-dashoffset: -24; } }
                    `}
                  </style>
                  {/* Decorative background grids */}
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(124,111,224,0.05)" strokeWidth="1" />
                  </pattern>
                </defs>

                <rect width="1000" height="1000" fill="url(#grid)" />

                {/* Elegant structural spine */}
                <line x1="500" y1="50" x2="500" y2="850" stroke="rgba(124,111,224,0.15)" strokeWidth="40" strokeLinecap="round" />
                <line x1="500" y1="50" x2="500" y2="850" stroke="rgba(124,111,224,0.05)" strokeWidth="80" strokeLinecap="round" />

                {/* Data Conduits (Paths) */}
                <path d="M 500 800 L 500 600" className={getPathClass(1, 2)} />
                <path d="M 500 600 L 500 400" className={getPathClass(2, 3)} />
                <path d="M 500 400 L 500 200" className={getPathClass(3, 4)} />

                {/* Final Connection to Royal Crown */}
                <path d="M 500 200 L 500 50" className={getPathClass(4, 5)} />

                {/* Crown Node Placeholder */}
                <circle cx="500" cy="50" r="30" fill="rgba(255, 215, 0, 0.1)" stroke="rgba(255, 215, 0, 0.5)" strokeWidth="2" strokeDasharray="4" />
                <text x="500" y="55" fill="rgba(255, 215, 0, 0.7)" fontSize="14" textAnchor="middle" fontFamily="monospace" fontWeight="bold">ROYAL</text>

              </svg>

              {/* HTML/CSS Nodes Overlay */}
              {missions.map((mission) => {
                const visualState = getMissionVisualState(mission.order);
                const identity = getMissionIdentity(mission.id);
                const Icon = identity.icon;
                const isLocked = visualState === 'LOCKED';
                const isComplete = visualState === 'COMPLETED';
                const isCurrent = visualState === 'CURRENT';
                const isAccessible = visualState !== 'LOCKED';
                const isCore = mission.order === 1;

                let nodeColor = 'var(--text-muted)';
                let nodeBorder = 'var(--border-color)';
                let nodeBg = 'var(--bg-secondary)';

                if (isComplete) {
                  nodeColor = 'var(--accent-sky)';
                  nodeBorder = 'var(--accent-sky)';
                  nodeBg = 'rgba(111, 184, 224, 0.12)';
                } else if (isCurrent) {
                  nodeColor = 'var(--accent-mint)';
                  nodeBorder = 'var(--accent-mint)';
                  nodeBg = 'rgba(111, 216, 168, 0.15)';
                } else if (isAccessible) {
                  nodeColor = 'var(--accent-mint)';
                  nodeBorder = 'var(--accent-mint)';
                  nodeBg = 'rgba(111, 216, 168, 0.1)';
                }

                // Positions mapped from our dictionary, with fallback
                const pos = positions[mission.order as keyof typeof positions] || { left: '50%', top: '50%' };

                // Adjust size for Core
                const sizeClass = isCore ? 'w-24 h-24 lg:w-32 lg:h-32' : 'w-16 h-16 lg:w-20 lg:h-20';
                const iconSize = isCore ? 40 : 24;

                let statusLabel = isComplete ? 'Online' : isCurrent ? 'Current' : isAccessible ? 'Ready' : 'Locked';
                let displaySystemName = identity.systemName;

                return (
                  <div
                    key={mission.id}
                    className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 group z-20"
                    style={{ left: pos.left, top: pos.top }}
                  >
                    {/* Node Tooltip Label (Hover) */}
                    <div className="absolute bottom-full mb-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 text-center glass-panel p-2 z-30">
                      <div className="text-xs font-semibold" style={{ color: nodeColor }}>{displaySystemName}</div>
                      <div className="text-[10px] mt-1 flex items-center justify-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                        {isLocked && <Lock size={10} />}
                        {isComplete && <CheckCircle size={10} />}
                        {statusLabel} &middot; {mission.xpReward}XP
                      </div>
                    </div>

                    {/* Core Rings (only if core) */}
                    {isCore && (
                      <>
                        <div className="absolute inset-[-12px] rounded-full animate-spin-slow opacity-40" style={{ border: `1px dashed ${nodeBorder}` }}></div>
                        <div className="absolute inset-[-24px] rounded-full animate-reverse-spin opacity-25" style={{ border: `1px dotted ${nodeBorder}` }}></div>
                      </>
                    )}

                    {/* The Node Shape */}
                    <button
                      aria-label={`Mission ${mission.order}: ${displaySystemName}. Status: ${statusLabel}`}
                      onClick={() => isAccessible && navigate(`/lab/${mission.id}`)}
                      className={`${sizeClass} flex items-center justify-center transition-all duration-300 ${isAccessible ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-60'} ${isCore ? 'rounded-2xl rotate-45' : 'rounded-xl'}`}
                      style={{ border: `2px solid ${nodeBorder}`, backgroundColor: nodeBg, boxShadow: isAccessible ? `0 0 16px ${nodeBorder}40` : 'none' }}
                    >
                      {/* Counter-rotate icon if core is rotated */}
                      <div className={isCore ? '-rotate-45' : ''}>
                        <Icon size={iconSize} style={{ color: nodeColor }} className={isAccessible && !isComplete ? 'animate-pulse' : ''} />
                      </div>
                    </button>

                    {/* Static Label below node */}
                    <div className="mt-2 flex flex-col items-center text-center px-2 py-0.5 rounded-full glass-panel whitespace-nowrap" style={{ color: nodeColor }}>
                      <span className="opacity-80 text-[8px] leading-tight">{mission.order.toString().padStart(2, '0')} &middot; {statusLabel}</span>
                      <span className="text-[9px] font-semibold leading-tight">{displaySystemName}</span>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
