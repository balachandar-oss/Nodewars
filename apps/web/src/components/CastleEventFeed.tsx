import React, { useEffect, useRef } from 'react';
import { Activity, ShieldAlert } from 'lucide-react';
import type { GameEvent } from '../hooks/useGameSocket';

interface CastleEventFeedProps {
  isConnected: boolean;
  events: GameEvent[];
}

const CastleEventFeed: React.FC<CastleEventFeedProps> = ({ isConnected, events }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events]);

  return (
    <div className="glass-panel flex flex-col h-full relative overflow-hidden">
      <div className="p-3 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-2 font-display font-bold text-sm" style={{ color: 'var(--accent-purple)' }}>
          <ShieldAlert size={16} />
          Castle Event Feed
        </div>

        <span className={`chip ${isConnected ? 'chip-mint' : 'chip-rose'} flex items-center gap-2`}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isConnected ? 'var(--accent-mint)' : 'var(--accent-rose)' }}></div>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar text-xs">
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-60" style={{ color: 'var(--text-muted)' }}>
            <Activity size={32} className="mb-2" />
            <p>Waiting for security events...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((evt, idx) => {
              const time = new Date(evt.timestamp).toLocaleTimeString([], { hour12: false });

              let typeColor = 'var(--accent-sky)';
              if (evt.type === 'BUG_FOUND' || evt.type === 'SECURITY_BREACH') typeColor = 'var(--accent-rose)';
              else if (evt.type.includes('OPENED') || evt.type.includes('UNLOCKED') || evt.type === 'PLAYER_ENTERED') typeColor = 'var(--accent-mint)';

              return (
                <div key={idx} className="flex flex-col clay-inset p-2 rounded-xl">
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{time}</span>
                    <span className="font-semibold" style={{ color: typeColor }}>{evt.type}</span>
                  </div>
                  {(evt.playerId || evt.teamId) && (
                    <div className="text-[10px] mt-1 flex gap-3" style={{ color: 'var(--text-secondary)' }}>
                      {evt.playerId && <span>User: <span style={{ color: 'var(--text-primary)' }}>{evt.playerId}</span></span>}
                      {evt.teamId && <span>Team: <span style={{ color: 'var(--text-primary)' }}>{evt.teamId}</span></span>}
                    </div>
                  )}
                  {evt.metadata && evt.metadata.missionTitle && (
                    <div className="text-[10px] mt-1" style={{ color: 'var(--accent-gold)' }}>
                      Location: {evt.metadata.missionTitle}
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

export default CastleEventFeed;
