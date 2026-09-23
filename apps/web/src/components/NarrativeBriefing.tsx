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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fade-in" data-testid="narrative-briefing">
      <div className="w-full max-w-2xl clay-panel relative overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-4 p-5 shrink-0" style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(124, 111, 224, 0.05)' }}>
          <div className="clay-inset w-12 h-12 rounded-2xl flex flex-col items-center justify-center">
            <span className="font-display text-xs opacity-60" style={{ color: 'var(--accent-purple)' }}>M</span>
            <span className="font-display text-xl font-bold leading-none" style={{ color: 'var(--accent-purple)' }}>0{missionNumber}</span>
          </div>
          <div className="flex-1">
            <div className="text-xs mb-1" style={{ color: 'var(--accent-purple)' }}>
              {narrative.act}
            </div>
            <h2 className="text-xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>{narrative.systemName}</h2>
            <h3 className="text-sm" style={{ color: 'var(--text-muted)' }}>{content.title}</h3>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 flex flex-col gap-8">

          <section className="animate-slide-in">
            <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--accent-gold)' }}>
              <ShieldAlert size={16} />
              <h3 className="text-xs font-semibold pb-1 flex-1" style={{ borderBottom: '1px solid var(--border-color)' }}>Current status</h3>
            </div>
            <p className="text-sm leading-relaxed pl-3 py-1" style={{ borderLeft: '2px solid rgba(232, 184, 75, 0.4)', color: 'var(--text-primary)' }}>
              {narrative.threatStatus}
            </p>
          </section>

          <section className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-xs font-semibold mb-2 pb-1" style={{ color: 'var(--accent-purple)', borderBottom: '1px solid var(--border-color)' }}>Objective</h3>
            <p className="text-sm leading-relaxed clay-inset p-3 rounded-xl" style={{ color: 'var(--text-primary)' }}>
              {narrative.objective}
            </p>
          </section>

          <section className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-xs font-semibold mb-2 pb-1" style={{ color: 'var(--accent-mint)', borderBottom: '1px solid var(--border-color)' }}>How it connects</h3>
            <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>
              {narrative.systemConnection}
            </p>
          </section>

          <section className="animate-slide-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-xs font-semibold mb-2 pb-1" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>You will learn</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {content.learningObjectives.slice(0, 3).map((obj) => (
                <li key={obj.id} className="flex gap-2 items-start clay-inset p-2 rounded-lg">
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--accent-mint)' }}>&bull;</div>
                  <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{obj.description}</div>
                </li>
              ))}
            </ul>
          </section>

        </div>

        {/* Footer Actions */}
        <div className="p-4 flex items-center justify-end shrink-0" style={{ borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={onEnterMission}
            className="clay-button px-6 py-3 flex items-center gap-2 text-xs"
          >
            Enter mission
            <LogIn size={14} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NarrativeBriefing;
