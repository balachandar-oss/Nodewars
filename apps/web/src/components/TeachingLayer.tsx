import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { MissionTeachingContent } from '@node-wars/shared';
import { ChevronRight, ChevronLeft, Target, BookOpen, Brain, Code, ArrowRight, Lightbulb, X } from 'lucide-react';
import { getMissionIdentity } from '../utils/missionIdentity';

interface TeachingLayerProps {
  missionNumber: number;
  content: MissionTeachingContent;
  onBeginChallenge: () => void;
}

const TeachingLayer: React.FC<TeachingLayerProps> = ({ missionNumber, content, onBeginChallenge }) => {
  const [step, setStep] = useState(0);

  const totalConcepts = content.concepts.length;
  const isBriefing = step === 0;
  const conceptIndex = step - 1;
  const isLastConcept = conceptIndex === totalConcepts - 1;
  const currentConcept = isBriefing ? null : content.concepts[conceptIndex];
  const identity = getMissionIdentity(`mission-0${missionNumber}`);

  const handleNext = () => {
    if (step <= totalConcepts) {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(s => s - 1);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md p-4 animate-fade-in" data-testid="teaching-overlay">
      <div className="w-full max-w-4xl clay-panel relative overflow-hidden flex flex-col max-h-[90vh]">

        <button
          onClick={onBeginChallenge}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center clay-inset transition-transform hover:scale-110"
          style={{ color: 'var(--text-muted)' }}
          title="Skip lesson"
          aria-label="Skip lesson"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 p-5 shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="clay-inset w-12 h-12 rounded-2xl flex items-center justify-center">
            <span className="font-display text-xl font-bold" style={{ color: 'var(--accent-purple)' }}>0{missionNumber}</span>
          </div>
          <div className="flex-1">
            <div className="text-xs mb-1 flex items-center gap-2" style={{ color: 'var(--accent-purple)' }}>
              {(() => {
                const Icon = identity.icon;
                return <Icon size={12} />;
              })()}
              {identity.systemName} &middot; {missionNumber}/7
              <span className="opacity-50 mx-1">|</span>
              {isBriefing ? 'Mission briefing' : `Concept ${step} of ${totalConcepts}`}
            </div>
            <h2 className="text-xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
              {content.title}
            </h2>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 flex flex-col gap-8">

          {isBriefing ? (
            <div className="space-y-8 animate-slide-in" data-testid="mission-briefing">
              <section>
                <div className="flex items-center gap-2 mb-3 pb-2" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)' }}>
                  <Target size={16} />
                  <h3 className="text-sm font-semibold">What's happening</h3>
                </div>
                <p className="text-sm leading-relaxed pl-4 py-1" style={{ borderLeft: '2px solid rgba(232, 184, 75, 0.4)', color: 'var(--text-primary)' }}>
                  {content.briefing}
                </p>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4 pb-2" style={{ color: 'var(--accent-mint)', borderBottom: '1px solid var(--border-color)' }}>
                  <BookOpen size={16} />
                  <h3 className="text-sm font-semibold">What you'll learn</h3>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3" data-testid="learning-objectives">
                  {content.learningObjectives.map((obj, i) => (
                    <li key={obj.id} className="flex gap-3 items-start clay-inset p-3 rounded-xl">
                      <div className="text-xs mt-0.5" style={{ color: 'var(--accent-mint)' }}>{i + 1}.</div>
                      <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{obj.description}</div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          ) : currentConcept ? (
            <div className="space-y-6 animate-slide-in" data-testid="concept-card">
              <div className="clay-inset p-6 flex flex-col gap-6 rounded-2xl">

                {/* 1. Title & Explanation */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <Brain size={18} style={{ color: 'var(--accent-purple)' }} />
                    {currentConcept.title}
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {currentConcept.explanation}
                  </p>
                </div>

                {/* 2. Visual Flow (if exists) */}
                {currentConcept.visualFlow && currentConcept.visualFlow.length > 0 && (
                  <div className="py-4" style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }} data-testid="visual-flow">
                    <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Conceptual flow</div>
                    <div className="flex flex-wrap items-center gap-3">
                      {currentConcept.visualFlow.map((node, i) => (
                        <React.Fragment key={i}>
                          <div className="chip chip-sky">
                            {node}
                          </div>
                          {i < currentConcept.visualFlow!.length - 1 && (
                            <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Tiny Example (if exists) */}
                {currentConcept.exampleCode && (
                  <div className="clay-panel p-4 relative mt-2 rounded-xl" data-testid="tiny-example">
                    <div className="text-[10px] mb-2 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                      <Code size={10} /> Tiny example
                    </div>
                    <code className="text-xs font-mono whitespace-pre-wrap break-all block" style={{ color: 'var(--accent-purple)' }}>
                      {currentConcept.exampleCode}
                    </code>
                  </div>
                )}

                {/* 4. Code Walkthrough (if exists) */}
                {currentConcept.walkthrough && currentConcept.walkthrough.length > 0 && (
                  <div className="mt-2" data-testid="code-walkthrough">
                    <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Code walkthrough</div>
                    <ul className="space-y-3">
                      {currentConcept.walkthrough.map((step, idx) => (
                        <li key={idx} className="flex flex-col md:flex-row gap-2 md:gap-4 items-start clay-panel p-3 rounded-xl">
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] clay-inset px-1.5 py-0.5 rounded-md" style={{ color: 'var(--text-muted)' }}>Step {idx + 1}</span>
                            <code className="text-xs font-mono px-2 py-1 rounded-md" style={{ color: 'var(--accent-gold)', backgroundColor: 'rgba(232, 184, 75, 0.1)' }}>
                              {step.codeFragment}
                            </code>
                          </div>
                          <p className="text-xs leading-relaxed mt-1 md:mt-0 pt-0.5" style={{ color: 'var(--text-secondary)' }}>
                            {step.explanation}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 5. Key Takeaway (if exists) */}
                {currentConcept.keyTakeaway && (
                  <div className="mt-4 p-4 flex items-start gap-3 rounded-xl" style={{ backgroundColor: 'rgba(111, 216, 168, 0.1)', border: '1px solid rgba(111, 216, 168, 0.3)' }} data-testid="key-takeaway">
                    <Lightbulb size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--accent-mint)' }} />
                    <div>
                      <div className="text-xs font-semibold mb-1" style={{ color: 'var(--accent-mint)' }}>Key takeaway</div>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {currentConcept.keyTakeaway}
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 flex items-center justify-between shrink-0" style={{ borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={handleBack}
            disabled={step === 0}
            className={`px-4 py-2 flex items-center gap-2 text-xs transition-colors rounded-xl ${
              step === 0
                ? 'opacity-30 cursor-not-allowed'
                : 'clay-button-secondary'
            }`}
            style={{ color: 'var(--text-primary)' }}
          >
            <ChevronLeft size={14} /> Back
          </button>

          <div className="flex gap-1" data-testid="concept-indicator">
            <div className="h-1.5 w-6 rounded-full transition-colors" style={{ backgroundColor: isBriefing ? 'var(--accent-purple)' : 'var(--border-color)' }} />
            {content.concepts.map((_, idx) => (
              <div key={idx} className="h-1.5 w-6 rounded-full transition-colors" style={{ backgroundColor: step === idx + 1 ? 'var(--accent-purple)' : 'var(--border-color)' }} />
            ))}
          </div>

          {isBriefing || !isLastConcept ? (
            <button
              onClick={handleNext}
              className="clay-button px-4 py-2 flex items-center gap-2 text-xs"
            >
              {isBriefing ? 'Start lesson' : 'Next'} <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={onBeginChallenge}
              data-testid="btn-begin-challenge"
              className="clay-button px-6 py-2 flex items-center gap-2 text-xs font-bold"
            >
              Begin challenge <Target size={14} />
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TeachingLayer;
