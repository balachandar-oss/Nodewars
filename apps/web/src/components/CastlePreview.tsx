import React from 'react';
import { Server as ServerIcon, Package, Zap, Radio } from 'lucide-react';

interface CastlePreviewProps {
  componentName: string;
  missionOrder: number;
  isUnlocked?: boolean;
}

const CastlePreview: React.FC<CastlePreviewProps> = ({ componentName, missionOrder, isUnlocked }) => {
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
        <span style={{ color: 'var(--text-secondary)' }}>Castle schematic</span>
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
          <line x1="50%" y1="80%" x2="50%" y2="60%" strokeWidth="2" style={getLineStyle(2)} />
          <line x1="50%" y1="60%" x2="50%" y2="40%" strokeWidth="2" style={getLineStyle(3)} />
          <line x1="50%" y1="40%" x2="50%" y2="20%" strokeWidth="2" style={getLineStyle(4)} />
        </svg>

        {/* CSS GRID OVERLAY FOR NODES */}
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-between py-6">

          {/* NODE 4: SIGNAL TOWER */}
          <div className="flex justify-center items-center h-10 w-full absolute" style={{ top: 'calc(20% - 20px)' }}>
            <div className="w-10 h-10 border-2 rounded-xl flex items-center justify-center transition-all" style={getNodeStyle(4)}>
              <Radio size={18} />
            </div>
          </div>

          {/* NODE 3: EVENT SYSTEM */}
          <div className="flex justify-center items-center h-10 w-full absolute" style={{ top: 'calc(40% - 20px)' }}>
            <div className="w-10 h-10 border-2 rounded-xl flex items-center justify-center transition-all" style={getNodeStyle(3)}>
              <Zap size={18} />
            </div>
          </div>

          {/* NODE 2: NPM SUPPLY */}
          <div className="flex justify-center items-center h-10 w-full absolute" style={{ top: 'calc(60% - 20px)' }}>
            <div className="w-10 h-10 border-2 rounded-xl flex items-center justify-center transition-all" style={getNodeStyle(2)}>
              <Package size={18} />
            </div>
          </div>

          {/* NODE 1: NODE CORE */}
          <div className="flex justify-center items-center h-12 w-full absolute" style={{ top: 'calc(80% - 24px)' }}>
            <div className="w-12 h-12 border-2 rounded-2xl flex items-center justify-center transition-all transform rotate-45" style={getNodeStyle(1)}>
              <div className="-rotate-45">
                <ServerIcon size={20} />
              </div>
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
