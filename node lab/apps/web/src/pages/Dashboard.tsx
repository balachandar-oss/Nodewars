import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Shield, Target, Server as ServerIcon, DoorOpen, HardDrive, Zap, Bug, Activity, CheckCircle, Lock } from 'lucide-react';

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
          fetch('http://localhost:3001/api/missions', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:3001/api/game/state', { headers: { Authorization: `Bearer ${token}` } })
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

  const nextLevelXp = user.level * 200;
  const xpProgress = (user.xp / nextLevelXp) * 100;
  const completedCount = missions.filter(m => m.status === 'COMPLETE').length;

  // Helpers for Castle Blueprint
  const getMissionStatus = (order: number) => {
    const m = missions.find(m => m.order === order);
    if (!m) return 'LOCKED';
    if (m.status === 'COMPLETE') return 'COMPLETE';
    if (user.role === 'DEMO' || m.status === 'ACTIVE') return 'ACTIVE';
    return 'LOCKED';
  };
  
  const getPathClass = (status: string) => {
    if (status === 'COMPLETE') return 'path-complete';
    if (status === 'ACTIVE') return 'path-active';
    return 'path-locked';
  };

  const positions = {
    1: { left: '50%', top: '50%' }, // CORE
    2: { left: '50%', top: '15%' }, // SMART DOOR
    3: { left: '25%', top: '32.5%' }, // SECURITY GATE
    4: { left: '75%', top: '32.5%' }, // RESOURCE VAULT
    5: { left: '25%', top: '67.5%' }, // ASYNC CORE
    6: { left: '75%', top: '67.5%' }, // SECURITY MONITOR
    7: { left: '50%', top: '85%' }, // ADMIN VAULT
  };

  return (
    <div className="w-full h-full flex flex-col relative z-10 animate-slide-in">
      
      {/* COMMAND HEADER (Compact HUD) */}
      <div className="panel p-2 px-6 border-l-4 border-l-neon-blue bg-black/90 flex flex-wrap justify-between items-center text-xs font-mono mb-4 tracking-widest shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <span className="text-white font-bold whitespace-nowrap">NODE LAB // COMMAND CENTER</span>
          <span className="text-cyber-light/30">|</span>
          <span className="text-neon-amber whitespace-nowrap">PHASE: {gameState?.phase || 'INITIALIZING'}</span>
          <span className="text-cyber-light/30">|</span>
          <span className="text-neon-green flex items-center gap-2 whitespace-nowrap">
            <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse glow-green"></div> 
            SOCKET ONLINE
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-neon-purple uppercase whitespace-nowrap">TEAM {user.team?.name || 'UNASSIGNED'}</span>
          <span className="text-cyber-light/30">|</span>
          <span className="text-white whitespace-nowrap">LVL {user.level.toString().padStart(2, '0')}</span>
          <span className="text-cyber-light/30">|</span>
          <span className="flex items-center gap-3 text-neon-amber whitespace-nowrap">
            XP {user.xp.toString().padStart(3, '0')} / {nextLevelXp.toString().padStart(3, '0')}
            <div className="w-24 h-1.5 bg-black border border-white/20 relative overflow-hidden">
              <div className="h-full bg-neon-amber transition-all glow-amber" style={{width: `${Math.min(xpProgress, 100)}%`}}></div>
            </div>
          </span>
          <span className="text-cyber-light/30">|</span>
          <span className="text-neon-blue whitespace-nowrap">SYSTEMS {completedCount.toString().padStart(2, '0')} / 07</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* TACTICAL MISSION RAIL (Left - 20%) */}
        <div className="w-full lg:w-1/5 lg:min-w-[280px] panel p-4 border-t-2 border-t-neon-blue flex flex-col bg-black/80">
          <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
            <Activity className="text-neon-blue glow-text-blue" size={16} />
            <h3 className="font-title text-sm tracking-widest text-white glow-text-blue uppercase">MISSION CONTROL</h3>
          </div>
          
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
            {missions.length === 0 && <div className="text-cyber-light font-mono text-xs">Initializing network...</div>}
            {missions.map((mission) => {
              const isLocked = mission.status === 'LOCKED';
              const isComplete = mission.status === 'COMPLETE';
              const isDemo = user.role === 'DEMO';
              const isAccessible = !isLocked || isDemo;
              
              let stateColor = 'text-cyber-light/30';
              let borderColor = 'border-white/5';
              let bgClass = 'bg-black/40';
              let dotClass = 'bg-cyber-light/10';

              if (isComplete) {
                stateColor = 'text-neon-blue';
                borderColor = 'border-neon-blue/40';
                bgClass = 'bg-neon-blue/5 hover:bg-neon-blue/10';
                dotClass = 'bg-neon-blue glow-blue';
              } else if (isAccessible) {
                stateColor = 'text-neon-green glow-text-green';
                borderColor = 'border-neon-green/60';
                bgClass = 'bg-neon-green/10 hover:bg-neon-green/20';
                dotClass = 'bg-neon-green animate-pulse glow-green';
              }

              return (
                <div 
                  key={mission.id}
                  onClick={() => isAccessible && navigate(`/lab/${mission.id}`)}
                  className={`p-3 border transition-all flex items-center justify-between ${borderColor} ${bgClass} ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-[10px] text-cyber-light/40 w-4 text-center">
                      {mission.order.toString().padStart(2, '0')}
                    </div>
                    <div className={`font-mono text-xs tracking-widest ${stateColor}`}>
                      {mission.title.toUpperCase()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isAccessible && <div className="text-[9px] font-mono text-cyber-light/50">{mission.xpReward}XP</div>}
                    {isComplete ? (
                      <CheckCircle size={12} className="text-neon-blue" />
                    ) : !isAccessible ? (
                      <Lock size={12} className="text-cyber-light/30" />
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${dotClass}`}></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Live Event Feed (Moved to Left Rail to prevent map overlap) */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-[10px] font-mono text-neon-green mb-2 tracking-widest border-b border-neon-green/30 pb-1">
              NODE LAB // LIVE
            </div>
            <div className="space-y-1 font-mono text-[10px] tracking-wider bg-black/40 p-2 border border-white/5 rounded-sm">
              <div className="flex gap-2 text-cyber-light/80 animate-slide-in">
                <span className="text-neon-blue flex-shrink-0">[{new Date(Date.now() - 120000).toLocaleTimeString()}]</span> 
                <span className="truncate">SYSTEM INITIALIZED</span>
              </div>
              <div className="flex gap-2 text-cyber-light/80 animate-slide-in" style={{animationDelay: '0.1s'}}>
                <span className="text-neon-amber flex-shrink-0">[{new Date(Date.now() - 60000).toLocaleTimeString()}]</span> 
                <span className="truncate">OPERATIVE {user.username} CONNECTED</span>
              </div>
              <div className="flex gap-2 text-cyber-light/80 animate-slide-in" style={{animationDelay: '0.2s'}}>
                <span className="text-neon-green flex-shrink-0">[{new Date().toLocaleTimeString()}]</span> 
                <span className="truncate">TOPOLOGY SYNCED</span>
              </div>
            </div>
          </div>
        </div>

        {/* DIGITAL FORTRESS CASTLE MAP (Right - 80%) */}
        <div className="flex-1 panel p-0 relative overflow-hidden flex flex-col border-t-2 border-t-neon-purple bg-black/95">
          
          {/* Labeling overlay */}
          <div className="absolute top-6 left-6 z-20 pointer-events-none">
            <h2 className="text-xl font-title text-white tracking-widest uppercase glow-text-purple opacity-90">
              NODE LAB // FORTRESS NETWORK
            </h2>
            <div className="text-[10px] font-mono text-cyber-light/50 mt-1">SCHEMATIC VERSION 1.0.4 // LIVE</div>
          </div>
          
          {/* CASTLE CANVAS */}
          <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden p-4">
            <div className="w-full h-full relative max-w-[1200px] max-h-[900px]">
              
              {/* Grid Background Pattern */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] pointer-events-none opacity-40"></div>

              {/* SVG Blueprint Layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <style>
                    {`
                      .path-locked { stroke: rgba(255,255,255,0.08); stroke-width: 2; fill: none; stroke-dasharray: 4 4; }
                      .path-active { stroke: #39ff14; stroke-width: 3; fill: none; stroke-dasharray: 12; animation: flow 1s linear infinite; filter: drop-shadow(0 0 6px #39ff14); }
                      .path-complete { stroke: #00f3ff; stroke-width: 3; fill: none; filter: drop-shadow(0 0 6px #00f3ff); }
                      @keyframes flow { to { stroke-dashoffset: -24; } }
                    `}
                  </style>
                  
                  {/* Decorative Corner Patterns */}
                  <pattern id="corner-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="10" x2="20" y2="10" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <line x1="10" y1="0" x2="10" y2="20" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  </pattern>
                </defs>
                
                {/* Outer Fortress Wall */}
                <rect x="50" y="50" width="900" height="900" className="stroke-white/10 fill-black/20" strokeWidth="1" />
                <rect x="70" y="70" width="860" height="860" className="stroke-white/20 fill-none" strokeWidth="2" strokeDasharray="10 5" />
                
                {/* Inner Fortress Wall */}
                <rect x="180" y="240" width="640" height="520" className="stroke-neon-purple/20 fill-black/40" strokeWidth="1" />
                
                {/* Corner Accents */}
                <path d="M 50 100 L 50 50 L 100 50" fill="none" stroke="rgba(0, 243, 255, 0.5)" strokeWidth="3" />
                <path d="M 900 50 L 950 50 L 950 100" fill="none" stroke="rgba(0, 243, 255, 0.5)" strokeWidth="3" />
                <path d="M 50 900 L 50 950 L 100 950" fill="none" stroke="rgba(0, 243, 255, 0.5)" strokeWidth="3" />
                <path d="M 950 900 L 950 950 L 900 950" fill="none" stroke="rgba(0, 243, 255, 0.5)" strokeWidth="3" />

                {/* Decorative Text */}
                <text x="70" y="65" fill="rgba(255,255,255,0.2)" fontSize="10" fontFamily="monospace">SEC-ZONE-ALPHA</text>
                <text x="830" y="65" fill="rgba(255,255,255,0.2)" fontSize="10" fontFamily="monospace">SYS-COORD-99X</text>
                <text x="70" y="920" fill="rgba(255,255,255,0.2)" fontSize="10" fontFamily="monospace">INFRA-LAYER-BETA</text>

                {/* Data Conduits (Paths) */}
                {/* Core (500,500) to Gate (250,325) */}
                <path d="M 500 500 L 250 325" className={getPathClass(getMissionStatus(3))} />
                {/* Core (500,500) to Vault (750,325) */}
                <path d="M 500 500 L 750 325" className={getPathClass(getMissionStatus(4))} />
                {/* Core (500,500) to Async (250,675) */}
                <path d="M 500 500 L 250 675" className={getPathClass(getMissionStatus(5))} />
                {/* Core (500,500) to Monitor (750,675) */}
                <path d="M 500 500 L 750 675" className={getPathClass(getMissionStatus(6))} />
                
                {/* Gate (250,325) to Door (500,150) */}
                <path d="M 250 325 L 500 150" className={getPathClass(getMissionStatus(2))} />
                {/* Vault (750,325) to Door (500,150) */}
                <path d="M 750 325 L 500 150" className={getPathClass(getMissionStatus(2))} />
                
                {/* Async (250,675) to Admin (500,850) */}
                <path d="M 250 675 L 500 850" className={getPathClass(getMissionStatus(7))} />
                {/* Monitor (750,675) to Admin (500,850) */}
                <path d="M 750 675 L 500 850" className={getPathClass(getMissionStatus(7))} />
                
                {/* Cross Links for architectural density (always dim) */}
                <path d="M 250 325 L 250 675" className="stroke-white/5 fill-none" strokeWidth="1" strokeDasharray="2 4" />
                <path d="M 750 325 L 750 675" className="stroke-white/5 fill-none" strokeWidth="1" strokeDasharray="2 4" />
                
              </svg>
              
              {/* HTML/CSS Nodes Overlay */}
              {missions.map((mission) => {
                const Icon = getMissionIcon(mission.order);
                const isLocked = mission.status === 'LOCKED';
                const isComplete = mission.status === 'COMPLETE';
                const isCore = mission.order === 1;
                const isDemo = user.role === 'DEMO';
                const isAccessible = !isLocked || isDemo;
                
                let stateColor = 'text-cyber-light/30';
                let borderColor = 'border-white/10';
                let glowClass = '';
                let bgClass = 'bg-black';

                if (isComplete) {
                  stateColor = 'text-neon-blue';
                  borderColor = 'border-neon-blue';
                  glowClass = 'glow-blue';
                  bgClass = 'bg-neon-blue/10';
                } else if (isAccessible) {
                  stateColor = 'text-neon-green glow-text-green';
                  borderColor = 'border-neon-green';
                  glowClass = 'glow-green';
                  bgClass = 'bg-neon-green/10';
                }

                // Positions mapped from our dictionary, with fallback
                const pos = positions[mission.order as keyof typeof positions] || { left: '50%', top: '50%' };
                
                // Adjust size for Core
                const sizeClass = isCore ? 'w-24 h-24 lg:w-32 lg:h-32' : 'w-16 h-16 lg:w-20 lg:h-20';
                const iconSize = isCore ? 40 : 24;

                return (
                  <div 
                    key={mission.id}
                    className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 group z-20"
                    style={{ left: pos.left, top: pos.top }}
                  >
                    {/* Node Tooltip Label (Hover) */}
                    <div className="absolute bottom-full mb-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 text-center bg-black/90 border border-white/20 p-2 backdrop-blur-md shadow-[0_0_10px_rgba(0,0,0,0.8)] z-30">
                      <div className={`text-xs font-title tracking-widest uppercase ${stateColor}`}>{mission.title}</div>
                      <div className="text-[9px] font-mono text-cyber-light/60 mt-1 uppercase">{mission.status} // {mission.xpReward}XP</div>
                    </div>
                    
                    {/* Core Rings (only if core) */}
                    {isCore && (
                      <>
                        <div className={`absolute inset-[-20px] border border-dashed rounded-full animate-spin-slow ${borderColor} opacity-50`}></div>
                        <div className={`absolute inset-[-40px] border border-dotted rounded-full animate-reverse-spin ${borderColor} opacity-30`}></div>
                      </>
                    )}

                    {/* The Node Shape */}
                    <div 
                      onClick={() => isAccessible && navigate(`/lab/${mission.id}`)}
                      className={`${sizeClass} border-2 flex items-center justify-center transition-all duration-300 ${borderColor} ${bgClass} ${glowClass} ${isAccessible ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-60'} ${isCore ? 'rounded-lg rotate-45' : 'rounded-sm'}`}
                    >
                      {/* Counter-rotate icon if core is rotated */}
                      <div className={isCore ? '-rotate-45' : ''}>
                        <Icon size={iconSize} className={`${stateColor} ${isAccessible && !isComplete ? 'animate-pulse' : ''}`} />
                      </div>
                    </div>
                    
                    {/* Static Label below node */}
                    <div className={`mt-3 font-mono text-[10px] tracking-widest text-center uppercase px-2 py-0.5 border border-white/5 bg-black/80 ${stateColor}`}>
                      {isCore ? 'SERVER CORE' : mission.title}
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
