import React, { useState } from 'react';
import { Lightbulb, Lock, CheckCircle, Code } from 'lucide-react';
import type { TeachingHint } from '@node-wars/shared';

interface HintPanelProps {
  // Legacy string array for missions that don't have new hint data
  hints?: string[];
  // New structured progressive hints
  progressiveHints?: TeachingHint[];
  // True if the student has failed at least once
  hasFailed?: boolean;
}

const HintPanel: React.FC<HintPanelProps> = ({ hints = [], progressiveHints = [], hasFailed = false }) => {
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
      <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--accent-gold)' }}>
        <Lightbulb size={16} />
        <h3 className="text-xs font-semibold uppercase tracking-wide">Hints</h3>
      </div>

      {!hasFailed ? (
        <div className="p-4 clay-inset rounded-2xl flex items-center justify-center text-center">
          <div className="text-xs flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <Lock size={12} />
            Try running your code once to unlock hints
          </div>
        </div>
      ) : (
        <div className="space-y-3">
        {activeHints.map((hint, i) => {
          const isUnlocked = i < unlockedHints;
          const isNextToUnlock = i === unlockedHints;
          const isLocked = i > unlockedHints;

          if (isUnlocked) {
            return (
              <div key={i} className="p-4 rounded-2xl" style={{ backgroundColor: 'rgba(232, 184, 75, 0.08)', border: '1px solid rgba(232, 184, 75, 0.3)' }} data-testid={`hint-revealed-${i}`}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--accent-gold)' }}>
                    <CheckCircle size={12} /> Hint {i + 1}
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {hint.label.charAt(0) + hint.label.slice(1).toLowerCase()}
                  </div>
                </div>
                <div className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-primary)' }}>
                  {hint.text}
                </div>
                {hint.codeSnippet && (
                   <div className="clay-inset p-3 relative mt-3 rounded-xl">
                     <div className="text-[10px] mb-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                       <Code size={10} /> Snippet
                     </div>
                     <code className="text-xs font-mono whitespace-pre-wrap break-all block" style={{ color: 'var(--accent-purple)' }}>
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
                <div className="text-[10px] flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  <Lock size={10} /> Hint {i + 1} of {activeHints.length}
                </div>
                <button
                  onClick={() => setUnlockedHints(i + 1)}
                  data-testid="btn-show-hint"
                  className="clay-button-secondary w-full py-2.5 text-xs flex items-center justify-center gap-2"
                  style={{ color: 'var(--accent-gold)' }}
                >
                  <Lightbulb size={12} /> Show hint
                </button>
              </div>
            );
          }

          if (isLocked) {
             return (
               <div key={i} className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }} data-testid={`hint-locked-${i}`}>
                  <Lock size={10} /> Hint {i + 1} locked
               </div>
             );
          }

          return null;
        })}
      </div>
      )}
    </div>
  );
};

export default HintPanel;
