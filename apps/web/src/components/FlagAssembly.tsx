import React, { useState, useMemo } from 'react';
import { Lock, Unlock, CheckCircle } from 'lucide-react';

interface FlagAssemblyProps {
  randomizeOrder?: boolean;
  onStatusChange?: (status: 'LOCKED' | 'READY' | 'UNLOCKED') => void;
}

interface Fragment {
  id: string;
  text: string;
  position: number;
}

const FlagAssembly: React.FC<FlagAssemblyProps> = ({ randomizeOrder = false, onStatusChange }) => {
  const fragments: Fragment[] = [
    { id: 'mid', text: 'MID_', position: 1 },
    { id: 'dlat', text: 'DL@', position: 2 },
    { id: 'ew', text: 'EW#', position: 3 },
    { id: 'ar', text: 'AR!', position: 4 }
  ];

  // All fragments are collected (this would be fetched from server in full game)
  // In a real scenario, this would come from the game state
  const collectedCount = 4;
  const totalFragments = 4;
  const isReady = collectedCount === totalFragments;

  // The complete assembled flag
  const completeFlag = 'MID_DL@EW#AR!';

  // Generate display order (either as-is or randomized)
  const displayFragments = useMemo(() => {
    if (!randomizeOrder) return fragments;

    const shuffled = [...fragments].sort(() => Math.random() - 0.5);
    return shuffled.map((frag, idx) => ({ ...frag, position: idx }));
  }, [randomizeOrder]);

  // Determine status
  const getStatus = (): 'LOCKED' | 'READY' | 'UNLOCKED' => {
    if (collectedCount === 0) return 'LOCKED';
    if (collectedCount < totalFragments) return 'READY';
    return 'UNLOCKED';
  };

  const status = getStatus();

  React.useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  return (
    <div className="glass-panel p-6 border-t-2 border-t-neon-green space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-lg font-title tracking-widest text-neon-green mb-2">
            FLAG ASSEMBLY MATRIX
          </h3>
          <div className="font-mono text-[10px] text-white/50 tracking-widest">
            FRAGMENT COLLECTION: {collectedCount}/{totalFragments} COMPLETE
          </div>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 border ${
          status === 'LOCKED' ? 'border-neon-red/50 text-neon-red/70' :
          status === 'READY' ? 'border-neon-amber/50 text-neon-amber/70' :
          'border-neon-green text-neon-green'
        }`}>
          {status === 'LOCKED' && <Lock size={16} />}
          {status === 'READY' && <Unlock size={16} />}
          {status === 'UNLOCKED' && <CheckCircle size={16} />}
          <span className="font-mono text-xs tracking-widest uppercase">{status}</span>
        </div>
      </div>

      {/* Fragments Display */}
      <div className="space-y-3">
        <div className="font-mono text-[9px] text-white/40 tracking-widest mb-4">
          ORDERED SEQUENCE:
        </div>

        <div className="grid grid-cols-4 gap-2">
          {displayFragments.map((fragment, idx) => (
            <div
              key={fragment.id}
              className={`p-4 border font-mono text-sm font-bold text-center transition-all ${
                collectedCount > 0
                  ? 'border-neon-green/60 bg-neon-green/10 text-neon-green shadow-[0_0_10px_rgba(57,255,20,0.2)]'
                  : 'border-white/10 bg-black/40 text-white/40'
              }`}
            >
              <div className="text-[10px] text-white/40 mb-1 tracking-widest">
                [{idx + 1}]
              </div>
              <div className="text-xs tracking-wider">
                {fragment.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Flag Display */}
      <div className="border border-neon-green/30 bg-neon-green/5 p-4 rounded">
        <div className="font-mono text-[9px] text-white/40 tracking-widest mb-2">
          ASSEMBLED FLAG:
        </div>
        <div className={`text-center font-mono font-bold tracking-widest ${
          isReady ? 'text-neon-green text-lg glow-text-green' : 'text-white/30 text-sm'
        }`}>
          {displayFragments.map(f => f.text).join('')}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full h-1 bg-black/60 border border-white/10 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              status === 'UNLOCKED' ? 'bg-neon-green w-full shadow-[0_0_10px_var(--color-neon-green)]' :
              status === 'READY' ? 'bg-neon-amber w-3/4' :
              'bg-neon-red w-1/4'
            }`}
          />
        </div>
        <div className="text-[9px] text-white/40 font-mono tracking-widest text-right">
          {((collectedCount / totalFragments) * 100).toFixed(0)}% ASSEMBLY COMPLETE
        </div>
      </div>
    </div>
  );
};

export default FlagAssembly;
