import React from 'react';
import { Server as ServerIcon, DoorOpen, Shield, HardDrive, Zap, Radio, Bug } from 'lucide-react';

interface CastlePreviewProps {
  componentName: string;
  missionOrder: number;
  isUnlocked?: boolean;
}

const CastlePreview: React.FC<CastlePreviewProps> = ({ componentName, missionOrder, isUnlocked }) => {
  // We represent the 7 systems as nodes in a schematic.
  // 1: Server, 2: Door, 3: Shield, 4: Vault, 5: Async, 6: Radar, 7: Core

  const getNodeStyle = (order: number): React.CSSProperties => {
    if (missionOrder > order || (missionOrder === order && isUnlocked)) {
      return { color: 'var(--accent-sky)', borderColor: 'var(--accent-sky)', backgroundColor: 'rgba(111, 184, 224, 0.12)' }; // COMPLETE
    } else if (missionOrder === order) {
      return { color: 'var(--accent-mint)', borderColor: 'var(--accent-mint)', backgroundColor: 'rgba(111, 216, 168, 0.12)' }; // ACTIVE
    }
    return { color: 'var(--text-muted)', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }; // LOCKED
  };

  const getLineStyle = (to: number): React.CSSProperties => {
    if (missionOrder > to || (missionOrder === to && isUnlocked)) {
      return { stroke: 'var(--accent-sky)' };
    } else if (missionOrder === to) {
      return { stroke: 'var(--accent-mint)', strokeDasharray: '4' };
    }
    return { stroke: 'rgba(124,111,224,0.12)' };
  };

  return (
    <div className="w-full h-full p-4 flex flex-col relative overflow-hidden clay-inset rounded-2xl">
      <div className="text-xs mb-2 z-10 flex items-center justify-between pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Castle core</span>
        <span className={`chip ${isUnlocked ? 'chip-sky' : 'chip-gold'}`}>
          {isUnlocked ? 'Online' : 'Updating'}
        </span>
      </div>

      <div className="relative flex-1 w-full flex items-center justify-center z-10 mt-2">

        {/* SVG CONNECTIONS */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: '200px' }}>
          <defs>
            <style>
              {`@keyframes dash { to { stroke-dashoffset: -8; } }`}
            </style>
          </defs>

          {/* Main vertical trunk */}
          <line x1="50%" y1="10%" x2="50%" y2="90%" strokeWidth="2" style={getLineStyle(4)} />

          {/* Branches */}
          <line x1="50%" y1="30%" x2="12.5%" y2="30%" strokeWidth="2" style={getLineStyle(2)} />
          <line x1="50%" y1="50%" x2="87.5%" y2="50%" strokeWidth="2" style={getLineStyle(3)} />
          <line x1="50%" y1="70%" x2="12.5%" y2="70%" strokeWidth="2" style={getLineStyle(5)} />
          <line x1="50%" y1="90%" x2="87.5%" y2="90%" strokeWidth="2" style={getLineStyle(6)} />
        </svg>

        {/* CSS GRID OVERLAY FOR NODES */}
        <div className="w-full h-full grid grid-cols-4 grid-rows-5 gap-2 relative">

          {/* NODE 1: SERVER (Top Center) */}
          <div className="col-start-2 col-span-2 row-start-1 flex justify-center items-center">
            <div className="w-10 h-10 border-2 rounded-xl flex items-center justify-center transition-all" style={getNodeStyle(1)}>
              <ServerIcon size={18} />
            </div>
          </div>

          {/* NODE 2: DOOR (Left Branch) */}
          <div className="col-start-1 row-start-2 flex justify-center items-center">
            <div className="w-10 h-10 border-2 rounded-xl flex items-center justify-center transition-all" style={getNodeStyle(2)}>
              <DoorOpen size={18} />
            </div>
          </div>

          {/* NODE 3: SHIELD (Right Branch) */}
          <div className="col-start-4 row-start-3 flex justify-center items-center">
            <div className="w-10 h-10 border-2 rounded-xl flex items-center justify-center transition-all" style={getNodeStyle(3)}>
              <Shield size={18} />
            </div>
          </div>

          {/* NODE 4: VAULT (Center Trunk) */}
          <div className="col-start-2 col-span-2 row-start-3 flex justify-center items-center">
            <div className="w-12 h-12 border-2 rounded-2xl flex items-center justify-center transition-all" style={getNodeStyle(4)}>
              <HardDrive size={20} />
            </div>
          </div>

          {/* NODE 5: ASYNC (Left Branch) */}
          <div className="col-start-1 row-start-4 flex justify-center items-center">
            <div className="w-10 h-10 border-2 rounded-xl flex items-center justify-center transition-all" style={getNodeStyle(5)}>
              <Zap size={18} />
            </div>
          </div>

          {/* NODE 6: RADAR (Right Branch) */}
          <div className="col-start-4 row-start-5 flex justify-center items-center">
            <div className="w-10 h-10 border-2 rounded-xl flex items-center justify-center transition-all" style={getNodeStyle(6)}>
              <Radio size={18} />
            </div>
          </div>

          {/* NODE 7: CORE PATCH (Bottom Center) */}
          <div className="col-start-2 col-span-2 row-start-5 flex justify-center items-center">
            <div className="w-10 h-10 border-2 rounded-xl flex items-center justify-center transition-all" style={getNodeStyle(7)}>
              <Bug size={18} />
            </div>
          </div>

        </div>
      </div>

      {/* Current Component Label */}
      <div className="mt-4 flex flex-col items-center glass-panel p-2 z-10">
        <div className="font-display text-sm font-bold text-center" style={{ color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {componentName || 'Unknown component'}
        </div>
        <div className="text-[10px]" style={{ color: isUnlocked ? 'var(--accent-sky)' : 'var(--accent-gold)' }}>
          {isUnlocked ? 'Integrated' : 'Integration pending'}
        </div>
      </div>
    </div>
  );
};

export default CastlePreview;
