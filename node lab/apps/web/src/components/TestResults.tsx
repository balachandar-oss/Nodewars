import React from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';

interface CheckResult {
  id: string;
  label: string;
  passed: boolean;
  message: string;
}

import type { FailureGuidance } from '@node-wars/shared';

interface TestResultsProps {
  checks: CheckResult[];
  score: number;
  total: number;
  success?: boolean;
  failureGuidance?: FailureGuidance;
}

const TestResults: React.FC<TestResultsProps> = ({ checks, score, total, success, failureGuidance }) => {
  const passedChecks = checks.filter(c => c.passed);
  const failedChecks = checks.filter(c => !c.passed);
  return (
    <div className="w-full h-full p-5 flex flex-col bg-black/40">
      <div className="text-cyber-light/50 font-mono text-[10px] tracking-widest mb-4 border-b border-white/10 pb-2 flex justify-between items-center">
        <span>DIAGNOSTIC OUTPUT</span>
        {checks.length === 0 ? (
          <span className="text-neon-amber animate-pulse">AWAITING EXECUTION</span>
        ) : (
          <span className={success ? 'text-neon-blue' : 'text-neon-red'}>
            EVALUATION COMPLETE
          </span>
        )}
      </div>

      {checks.length > 0 && (
        <div className={`mb-4 pb-4 border-b border-white/5 font-mono text-xs tracking-widest ${success ? 'text-neon-blue glow-text-blue' : 'text-neon-red glow-text-red'}`}>
          <div className="text-lg font-title mb-1 uppercase">
            MISSION {success ? 'COMPLETE' : 'FAILED'}
          </div>
          <div>{score} / {total} CHECKS PASSED</div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
        {passedChecks.length > 0 && (
          <div>
            <div className="text-neon-blue font-mono text-[10px] tracking-widest mb-2 font-bold uppercase">PASSED</div>
            <div className="space-y-2 border-l border-neon-blue/30 pl-3">
              {passedChecks.map(check => (
                <div key={check.id} className="flex items-start gap-3 text-xs font-mono">
                  <Check size={14} className="text-neon-blue shrink-0 mt-0.5" />
                  <div className="flex-1 uppercase tracking-widest text-cyber-light">{check.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {failedChecks.length > 0 && (
          <div>
            <div className="text-neon-red font-mono text-[10px] tracking-widest mb-2 font-bold uppercase">FAILED</div>
            <div className="space-y-3 border-l border-neon-red/30 pl-3">
              {failedChecks.map(check => (
                <div key={check.id} className="flex items-start gap-3 text-xs font-mono">
                  <X size={14} className="text-neon-red shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="uppercase tracking-widest text-neon-red font-bold">{check.label}</div>
                    <div className="text-neon-amber/80 mt-1.5 p-2 bg-neon-amber/5 border-l-2 border-neon-amber flex items-start gap-2 text-[10px] leading-relaxed">
                      <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                      {check.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {success === false && failedChecks.length > 0 && failureGuidance && (
          <div className="mt-6 pt-4 border-t border-white/10 space-y-4" data-testid="failure-guidance">
            <div>
               <div className="text-cyber-light/50 font-mono text-[10px] tracking-widest mb-1 uppercase">WHY IT MATTERS</div>
               <p className="text-xs font-mono text-white/80 leading-relaxed bg-white/5 p-2 rounded-sm border-l-2 border-neon-amber">
                 {failureGuidance.whyItMatters}
               </p>
            </div>
            <div>
               <div className="text-cyber-light/50 font-mono text-[10px] tracking-widest mb-1 uppercase">THINK ABOUT</div>
               <p className="text-xs font-mono text-neon-blue leading-relaxed italic p-2">
                 "{failureGuidance.thinkAbout}"
               </p>
            </div>
          </div>
        )}

        {checks.length === 0 && (
          <div className="text-cyber-light/30 text-xs font-mono h-full flex items-center justify-center border border-dashed border-white/10 p-8 text-center">
            Run the mission to evaluate your implementation.
          </div>
        )}
      </div>
    </div>
  );
};

export default TestResults;
