import React, { useState } from 'react';
import { Lightbulb, Lock, CheckCircle, TerminalSquare } from 'lucide-react';
import type { TeachingHint } from '@node-wars/shared';

interface HintPanelProps {
  // Legacy string array for missions that don't have new hint data
  hints?: string[];
  // New structured progressive hints
  progressiveHints?: TeachingHint[];
}

const HintPanel: React.FC<HintPanelProps> = ({ hints = [], progressiveHints = [] }) => {
  const [unlockedHints, setUnlockedHints] = useState<number>(0);

  // Use progressive hints if available, otherwise fallback to legacy strings mapping
  const activeHints: TeachingHint[] = progressiveHints.length > 0 
    ? progressiveHints 
    : hints.map((h, i) => ({
        label: i === 0 ? 'CONCEPT' : 'DIRECTION',
        text: h
      } as TeachingHint));

  if (activeHints.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1 text-neon-amber">
        <Lightbulb size={16} />
        <h3 className="text-xs font-mono glow-text-amber tracking-widest uppercase">ENGINEERING HINTS</h3>
      </div>
      
      <div className="space-y-3">
        {activeHints.map((hint, i) => {
          const isUnlocked = i < unlockedHints;
          const isNextToUnlock = i === unlockedHints;
          const isLocked = i > unlockedHints;
          
          if (isUnlocked) {
            return (
              <div key={i} className="p-4 bg-neon-amber/5 border border-neon-amber/30 rounded-sm" data-testid={`hint-revealed-${i}`}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 text-neon-amber font-mono text-[10px] font-bold tracking-widest">
                    <CheckCircle size={12} /> HINT {i + 1}
                  </div>
                  <div className="text-[10px] font-mono text-neon-amber/60 tracking-wider">
                    {hint.label}
                  </div>
                </div>
                <div className="text-xs font-mono text-white/80 leading-relaxed mb-2">
                  {hint.text}
                </div>
                {hint.codeSnippet && (
                   <div className="bg-[#050505] border border-white/10 p-3 relative mt-3 rounded-sm">
                     <div className="absolute -top-2 left-2 bg-[#0a0a0f] px-1 text-[8px] font-mono text-white/40 flex items-center gap-1 border border-white/10 uppercase">
                       <TerminalSquare size={8} /> SNIPPET
                     </div>
                     <code className="text-xs font-mono text-neon-blue whitespace-pre-wrap break-all block pt-1">
                       {hint.codeSnippet}
                     </code>
                   </div>
                )}
              </div>
            );
          }

          if (isNextToUnlock) {
            return (
              <div key={i} className="flex flex-col gap-2" data-testid={`hint-unlock-${i}`}>
                <div className="text-[10px] font-mono text-white/30 tracking-widest flex items-center gap-2">
                  <Lock size={10} /> HINT {i + 1} OF {activeHints.length} LOCKED
                </div>
                <button 
                  onClick={() => setUnlockedHints(i + 1)}
                  data-testid="btn-show-hint"
                  className="w-full py-2 border border-neon-amber/50 bg-neon-amber/10 text-neon-amber hover:bg-neon-amber/20 transition-colors text-xs font-mono tracking-widest rounded-sm uppercase flex items-center justify-center gap-2"
                >
                  <Lightbulb size={12} /> SHOW HINT
                </button>
              </div>
            );
          }

          if (isLocked) {
             return (
               <div key={i} className="flex items-center gap-2 text-white/20 font-mono text-[10px] tracking-widest" data-testid={`hint-locked-${i}`}>
                  <Lock size={10} /> HINT {i + 1} LOCKED
               </div>
             );
          }
          
          return null;
        })}
      </div>
    </div>
  );
};

export default HintPanel;
