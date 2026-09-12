import React, { useState } from 'react';
import { Lightbulb } from 'lucide-react';

interface HintPanelProps {
  hints: string[];
}

const HintPanel: React.FC<HintPanelProps> = ({ hints }) => {
  const [unlockedHints, setUnlockedHints] = useState<number>(0);

  return (
    <div className="panel p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-4 text-neon-amber">
        <Lightbulb size={16} />
        <h3 className="text-xs font-mono glow-text-amber">ENGINEERING HINTS</h3>
      </div>
      
      <div className="space-y-3">
        {hints.map((hint, i) => (
          <div key={i} className="text-xs font-mono">
            {i < unlockedHints ? (
              <div className="p-3 bg-neon-amber/10 border border-neon-amber/30 text-cyber-light rounded">
                <span className="text-neon-amber block mb-1">HINT 0{i+1}:</span>
                {hint}
              </div>
            ) : (
              <button 
                onClick={() => setUnlockedHints(i + 1)}
                className="w-full p-3 border border-dashed border-white/20 text-white/50 hover:bg-white/5 hover:text-white transition-colors text-left rounded"
              >
                Unlock Hint 0{i+1}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HintPanel;
