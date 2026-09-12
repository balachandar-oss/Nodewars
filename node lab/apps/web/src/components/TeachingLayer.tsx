import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { MissionTeachingContent } from '@node-wars/shared';
import { ChevronRight, ChevronLeft, Target, BookOpen, Brain, TerminalSquare, ArrowRight, Lightbulb } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" data-testid="teaching-overlay">
      <div className="w-full max-w-4xl glass-panel border border-neon-blue/30 bg-[#0a0a0f]/90 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center gap-4 p-5 border-b border-white/10 bg-black/60 shrink-0">
          <div className="w-12 h-12 flex items-center justify-center border border-neon-blue/30 bg-neon-blue/10">
            <span className="font-title text-xl text-neon-blue font-bold">0{missionNumber}</span>
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-mono text-neon-blue tracking-widest mb-1 uppercase">
              {isBriefing ? 'MISSION BRIEFING' : `CONCEPT ${step} OF ${totalConcepts}`}
            </div>
            <h2 className="text-xl font-mono text-white tracking-widest uppercase">{content.title}</h2>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 flex flex-col gap-8">
          
          {isBriefing ? (
            <div className="space-y-8 animate-slide-in" data-testid="mission-briefing">
              <section>
                <div className="flex items-center gap-2 text-neon-amber mb-3 border-b border-white/10 pb-2">
                  <Target size={16} />
                  <h3 className="text-sm font-mono tracking-widest uppercase">Threat Assessment</h3>
                </div>
                <p className="text-sm font-mono text-white/80 leading-relaxed border-l-2 border-neon-amber/50 pl-4 py-1">
                  {content.briefing}
                </p>
              </section>

              <section>
                <div className="flex items-center gap-2 text-neon-green mb-4 border-b border-white/10 pb-2">
                  <BookOpen size={16} />
                  <h3 className="text-sm font-mono tracking-widest uppercase">What You Will Learn</h3>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3" data-testid="learning-objectives">
                  {content.learningObjectives.map((obj, i) => (
                    <li key={obj.id} className="flex gap-3 items-start bg-white/5 p-3 border border-white/5">
                      <div className="text-neon-green font-mono text-xs mt-0.5">[{i + 1}]</div>
                      <div className="text-xs font-mono text-white/70 leading-relaxed">{obj.description}</div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          ) : currentConcept ? (
            <div className="space-y-6 animate-slide-in" data-testid="concept-card">
              <div className="bg-black/40 border border-white/10 p-6 flex flex-col gap-6">
                
                {/* 1. Title & Explanation */}
                <div>
                  <h4 className="text-lg font-mono text-white tracking-widest uppercase mb-3 text-neon-green flex items-center gap-2">
                    <Brain size={18} className="text-neon-blue" />
                    {currentConcept.title}
                  </h4>
                  <p className="text-sm font-mono text-white/80 leading-relaxed">
                    {currentConcept.explanation}
                  </p>
                </div>

                {/* 2. Visual Flow (if exists) */}
                {currentConcept.visualFlow && currentConcept.visualFlow.length > 0 && (
                  <div className="py-4 border-t border-b border-white/5" data-testid="visual-flow">
                    <div className="text-[10px] font-mono text-white/40 mb-3 tracking-widest uppercase">Conceptual Flow</div>
                    <div className="flex flex-wrap items-center gap-3">
                      {currentConcept.visualFlow.map((node, i) => (
                        <React.Fragment key={i}>
                          <div className="bg-neon-blue/10 border border-neon-blue/30 px-3 py-2 text-xs font-mono text-neon-blue rounded-sm uppercase tracking-wider shadow-[0_0_10px_rgba(0,255,255,0.1)]">
                            {node}
                          </div>
                          {i < currentConcept.visualFlow!.length - 1 && (
                            <ArrowRight size={14} className="text-white/30" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 3. Tiny Example (if exists) */}
                {currentConcept.exampleCode && (
                  <div className="bg-[#050505] border border-white/10 p-4 relative mt-2 rounded-sm" data-testid="tiny-example">
                    <div className="absolute -top-3 left-3 bg-[#0a0a0f] px-2 text-[10px] font-mono text-white/40 flex items-center gap-2 border border-white/10 uppercase">
                      <TerminalSquare size={10} /> TINY EXAMPLE
                    </div>
                    <code className="text-xs font-mono text-neon-blue whitespace-pre-wrap break-all block pt-2">
                      {currentConcept.exampleCode}
                    </code>
                  </div>
                )}

                {/* 4. Code Walkthrough (if exists) */}
                {currentConcept.walkthrough && currentConcept.walkthrough.length > 0 && (
                  <div className="mt-2" data-testid="code-walkthrough">
                    <div className="text-[10px] font-mono text-white/40 mb-3 tracking-widest uppercase">Code Walkthrough</div>
                    <ul className="space-y-3">
                      {currentConcept.walkthrough.map((step, idx) => (
                        <li key={idx} className="flex flex-col md:flex-row gap-2 md:gap-4 items-start bg-white/5 p-3 rounded-sm border border-white/5">
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-mono text-white/40 bg-black/50 px-1.5 py-0.5 border border-white/10 rounded-sm">STEP {idx + 1}</span>
                            <code className="text-xs font-mono text-neon-amber bg-black/40 px-2 py-1 border border-neon-amber/20 rounded-sm">
                              {step.codeFragment}
                            </code>
                          </div>
                          <p className="text-xs font-mono text-white/70 leading-relaxed mt-1 md:mt-0 pt-0.5">
                            {step.explanation}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 5. Key Takeaway (if exists) */}
                {currentConcept.keyTakeaway && (
                  <div className="mt-4 border border-neon-green/30 bg-neon-green/5 p-4 flex items-start gap-3 rounded-sm" data-testid="key-takeaway">
                    <Lightbulb size={16} className="text-neon-green shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-mono text-neon-green tracking-widest uppercase mb-1">Key Takeaway</div>
                      <p className="text-sm font-mono text-white/90">
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
        <div className="p-4 border-t border-white/10 bg-black/80 flex items-center justify-between shrink-0">
          <button 
            onClick={handleBack}
            disabled={step === 0}
            className={`px-4 py-2 flex items-center gap-2 font-mono text-xs transition-colors border border-white/10 ${
              step === 0 
                ? 'opacity-30 cursor-not-allowed text-white/50 bg-transparent' 
                : 'text-white hover:bg-white/5 hover:border-white/30 cursor-pointer'
            }`}
          >
            <ChevronLeft size={14} /> BACK
          </button>
          
          <div className="flex gap-1" data-testid="concept-indicator">
            <div className={`h-1 w-6 transition-colors ${isBriefing ? 'bg-neon-blue' : 'bg-white/20'}`} />
            {content.concepts.map((_, idx) => (
              <div key={idx} className={`h-1 w-6 transition-colors ${step === idx + 1 ? 'bg-neon-blue' : 'bg-white/20'}`} />
            ))}
          </div>

          {isBriefing || !isLastConcept ? (
            <button 
              onClick={handleNext}
              className="px-4 py-2 flex items-center gap-2 font-mono text-xs text-black bg-neon-blue hover:bg-neon-blue/80 transition-colors shadow-[0_0_15px_rgba(0,255,255,0.3)] border border-neon-blue"
            >
              {isBriefing ? 'BEGIN LESSON' : 'NEXT'} <ChevronRight size={14} />
            </button>
          ) : (
            <button 
              onClick={onBeginChallenge}
              data-testid="btn-begin-challenge"
              className="px-6 py-2 flex items-center gap-2 font-mono text-xs text-black bg-neon-green hover:bg-neon-green/80 transition-colors shadow-[0_0_15px_rgba(0,255,0,0.3)] border border-neon-green font-bold tracking-wider"
            >
              BEGIN CHALLENGE <Target size={14} />
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TeachingLayer;
