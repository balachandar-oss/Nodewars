import React, { useEffect, useRef } from 'react';
import { Activity, ShieldAlert } from 'lucide-react';
import type { GameEvent } from '../hooks/useGameSocket';

interface LiveSecurityMonitorProps {
  isConnected: boolean;
  events: GameEvent[];
}

const LiveSecurityMonitor: React.FC<LiveSecurityMonitorProps> = ({ isConnected, events }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events]);

  return (
    <div className="panel flex flex-col h-full bg-black/80 border-2 border-neon-blue/30 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-neon-blue/5 pointer-events-none"></div>

      <div className="p-3 border-b border-neon-blue/30 flex justify-between items-center bg-black/60 z-10">
        <div className="flex items-center gap-2 text-neon-blue glow-text-blue font-title tracking-widest text-sm">
          <ShieldAlert size={16} />
          LIVE SECURITY MONITOR
        </div>
        
        <div className={`flex items-center gap-2 text-[10px] font-mono tracking-widest px-2 py-1 border ${isConnected ? 'text-neon-green border-neon-green/30 bg-neon-green/10' : 'text-neon-red border-neon-red/30 bg-neon-red/10'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-neon-green animate-pulse' : 'bg-neon-red'}`}></div>
          {isConnected ? 'SOCKET CONNECTED' : 'SOCKET DISCONNECTED'}
        </div>
      </div>

      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar font-mono text-xs z-10">
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-cyber-light/30 opacity-50">
            <Activity size={32} className="mb-2" />
            <p>AWAITING SECURITY EVENTS...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((evt, idx) => {
              const time = new Date(evt.timestamp).toLocaleTimeString([], { hour12: false });
              
              let typeColor = 'text-neon-blue';
              if (evt.type === 'BUG_FOUND' || evt.type === 'SECURITY_BREACH') typeColor = 'text-neon-red';
              else if (evt.type.includes('OPENED') || evt.type.includes('UNLOCKED') || evt.type === 'PLAYER_ENTERED') typeColor = 'text-neon-green';

              return (
                <div key={idx} className="flex flex-col border border-white/5 bg-white/5 p-2 rounded">
                  <div className="flex gap-2 items-center">
                    <span className="text-cyber-light/50 text-[10px]">[{time}]</span>
                    <span className={`${typeColor} font-bold tracking-widest`}>{evt.type}</span>
                  </div>
                  {(evt.playerId || evt.teamId) && (
                    <div className="text-[10px] text-cyber-light/70 mt-1 flex gap-3">
                      {evt.playerId && <span>USER: <span className="text-white">{evt.playerId}</span></span>}
                      {evt.teamId && <span>TEAM: <span className="text-white">{evt.teamId}</span></span>}
                    </div>
                  )}
                  {evt.metadata && evt.metadata.missionTitle && (
                    <div className="text-[10px] text-neon-amber mt-1">
                      LOCATION: {evt.metadata.missionTitle}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSecurityMonitor;
