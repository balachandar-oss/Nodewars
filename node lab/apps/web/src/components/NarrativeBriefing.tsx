import React from 'react';
import { createPortal } from 'react-dom';
import type { MissionTeachingContent } from '@node-wars/shared';
import { ShieldAlert, LogIn } from 'lucide-react';

interface NarrativeBriefingProps {
  missionNumber: number;
  content: MissionTeachingContent;
  onEnterMission: () => void;
}

const NarrativeBriefing: React.FC<NarrativeBriefingProps> = ({ missionNumber, content, onEnterMission }) => {
  const { narrative } = content;
  
  if (!narrative) {
    // Fallback if no narrative exists
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in" data-testid="narrative-briefing">
      <div className="w-full max-w-2xl border border-neon-blue/40 bg-black shadow-[0_0_50px_rgba(0,0,0,0.9)] relative overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center gap-4 p-5 border-b border-neon-blue/20 bg-neon-blue/5 shrink-0">
          <div className="w-12 h-12 flex flex-col items-center justify-center border border-neon-blue/30 bg-neon-blue/10">
            <span className="font-title text-sm text-neon-blue opacity-50">M</span>
            <span className="font-title text-xl text-neon-blue font-bold leading-none">0{missionNumber}</span>
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-mono text-neon-blue tracking-widest mb-1 uppercase">
              {narrative.act}
            </div>
            <h2 className="text-xl font-mono text-white tracking-widest uppercase">{narrative.systemName}</h2>
            <h3 className="text-sm font-mono text-white/50 tracking-widest uppercase">{content.title}</h3>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 flex flex-col gap-8">
          
          <section className="animate-slide-in">
            <div className="flex items-center gap-2 text-neon-amber mb-2">
              <ShieldAlert size={16} />
              <h3 className="text-[10px] font-mono tracking-widest uppercase border-b border-white/10 pb-1 flex-1">Threat Status</h3>
            </div>
            <p className="text-sm font-mono text-white/90 leading-relaxed border-l-2 border-neon-amber/50 pl-3 py-1">
              {narrative.threatStatus}
            </p>
          </section>

          <section className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-[10px] font-mono text-neon-blue tracking-widest uppercase mb-2 border-b border-white/10 pb-1">Objective</h3>
            <p className="text-sm font-mono text-white/80 leading-relaxed bg-white/5 p-3 rounded-sm border-l-2 border-neon-blue">
              {narrative.objective}
            </p>
          </section>
          
          <section className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-[10px] font-mono text-neon-green tracking-widest uppercase mb-2 border-b border-white/10 pb-1">System Connection</h3>
            <p className="text-sm font-mono text-white/70 leading-relaxed italic">
              {narrative.systemConnection}
            </p>
          </section>

          <section className="animate-slide-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-[10px] font-mono text-cyber-light/60 tracking-widest uppercase mb-2 border-b border-white/10 pb-1">You Will Learn</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {content.learningObjectives.slice(0, 3).map((obj) => (
                <li key={obj.id} className="flex gap-2 items-start bg-white/5 p-2 border border-white/5">
                  <div className="text-neon-green font-mono text-[10px] mt-0.5">■</div>
                  <div className="text-xs font-mono text-white/60 leading-relaxed">{obj.description}</div>
                </li>
              ))}
            </ul>
          </section>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-black/80 flex items-center justify-end shrink-0">
          <button
            onClick={onEnterMission}
            className="px-6 py-3 flex items-center gap-2 font-mono text-xs text-black bg-neon-blue hover:bg-neon-blue/80 transition-colors shadow-[0_0_15px_rgba(0,255,255,0.3)] border border-neon-blue"
          >
            ENTER MISSION
            <LogIn size={14} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NarrativeBriefing;
