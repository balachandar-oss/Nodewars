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
  
  const getNodeColor = (order: number) => {
    if (missionOrder > order || (missionOrder === order && isUnlocked)) {
      return 'text-neon-blue border-neon-blue glow-blue bg-neon-blue/10'; // COMPLETE
    } else if (missionOrder === order) {
      return 'text-neon-green border-neon-green glow-green animate-pulse bg-neon-green/10'; // ACTIVE
    }
    return 'text-cyber-light/20 border-white/10 bg-black/50'; // LOCKED
  };

  const getLineColor = (to: number) => {
    // If both nodes are unlocked or the current active node is the 'to' node, glow the line conditionally
    if (missionOrder > to || (missionOrder === to && isUnlocked)) {
      return 'stroke-neon-blue filter drop-shadow(0 0 4px var(--color-neon-blue))';
    } else if (missionOrder === to) {
      return 'stroke-neon-green stroke-dashed animate-dash';
    }
    return 'stroke-white/10';
  };

  return (
    <div className={`w-full h-full p-4 flex flex-col relative overflow-hidden bg-black/40 ${isUnlocked ? 'border-neon-blue' : ''}`}>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] pointer-events-none opacity-50"></div>
      
      <div className="text-[10px] tracking-widest font-mono mb-2 z-10 flex items-center justify-between border-b border-white/10 pb-2">
        <span className="text-cyber-light/50">NODE LAB // CASTLE CORE</span>
        <span className={isUnlocked ? 'text-neon-blue' : 'text-neon-amber'}>
          SCHEMATIC {isUnlocked ? 'ONLINE' : 'UPDATING'}
        </span>
      </div>

      <div className="relative flex-1 w-full flex items-center justify-center z-10 mt-2">
        
        {/* SVG CONNECTIONS */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: '200px' }}>
          <defs>
            <style>
              {`
                .stroke-dashed { stroke-dasharray: 4; }
                @keyframes dash { to { stroke-dashoffset: -8; } }
                .animate-dash { animation: dash 1s linear infinite; }
              `}
            </style>
          </defs>
          
          {/* Main vertical trunk */}
          <line x1="50%" y1="15%" x2="50%" y2="85%" strokeWidth="2" className={getLineColor(4)} />
          
          {/* Branches */}
          <line x1="50%" y1="25%" x2="25%" y2="25%" strokeWidth="2" className={getLineColor(2)} />
          <line x1="50%" y1="45%" x2="75%" y2="45%" strokeWidth="2" className={getLineColor(3)} />
          <line x1="50%" y1="65%" x2="25%" y2="65%" strokeWidth="2" className={getLineColor(5)} />
          <line x1="50%" y1="85%" x2="75%" y2="85%" strokeWidth="2" className={getLineColor(6)} />
        </svg>

        {/* CSS GRID OVERLAY FOR NODES */}
        <div className="w-full h-full grid grid-cols-4 grid-rows-5 gap-2 relative">
          
          {/* NODE 1: SERVER (Top Center) */}
          <div className="col-start-2 col-span-2 row-start-1 flex justify-center items-center">
            <div className={`w-10 h-10 border flex items-center justify-center transition-all ${getNodeColor(1)}`}>
              <ServerIcon size={18} />
            </div>
          </div>
          
          {/* NODE 2: DOOR (Left Branch) */}
          <div className="col-start-1 row-start-2 flex justify-center items-center">
            <div className={`w-10 h-10 border flex items-center justify-center transition-all ${getNodeColor(2)}`}>
              <DoorOpen size={18} />
            </div>
          </div>
          
          {/* NODE 3: SHIELD (Right Branch) */}
          <div className="col-start-4 row-start-3 flex justify-center items-center">
            <div className={`w-10 h-10 border flex items-center justify-center transition-all ${getNodeColor(3)}`}>
              <Shield size={18} />
            </div>
          </div>
          
          {/* NODE 4: VAULT (Center Trunk) */}
          <div className="col-start-2 col-span-2 row-start-3 flex justify-center items-center">
            <div className={`w-12 h-12 border-2 flex items-center justify-center transition-all ${getNodeColor(4)}`}>
              <HardDrive size={20} />
            </div>
          </div>

          {/* NODE 5: ASYNC (Left Branch) */}
          <div className="col-start-1 row-start-4 flex justify-center items-center">
            <div className={`w-10 h-10 border flex items-center justify-center transition-all ${getNodeColor(5)}`}>
              <Zap size={18} />
            </div>
          </div>

          {/* NODE 6: RADAR (Right Branch) */}
          <div className="col-start-4 row-start-5 flex justify-center items-center">
            <div className={`w-10 h-10 border flex items-center justify-center transition-all ${getNodeColor(6)}`}>
              <Radio size={18} />
            </div>
          </div>

          {/* NODE 7: CORE PATCH (Bottom Center) */}
          <div className="col-start-2 col-span-2 row-start-5 flex justify-center items-center">
            <div className={`w-10 h-10 border flex items-center justify-center transition-all ${getNodeColor(7)}`}>
              <Bug size={18} />
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Current Component Label */}
      <div className="mt-4 flex flex-col items-center bg-black border border-white/10 p-2 z-10">
        <div className={`font-title text-sm tracking-widest text-center uppercase ${isUnlocked ? 'text-white' : 'text-cyber-light/50'}`}>
          {componentName || 'UNKNOWN COMPONENT'}
        </div>
        <div className={`text-[10px] font-mono tracking-widest ${isUnlocked ? 'text-neon-blue glow-text-blue' : 'text-neon-amber animate-pulse-fast'}`}>
          {isUnlocked ? 'INTEGRATED' : 'INTEGRATION PENDING'}
        </div>
      </div>
    </div>
  );
};

export default CastlePreview;
