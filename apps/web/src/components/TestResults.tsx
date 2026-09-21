import React, { useState } from 'react';
import { Check, X, AlertTriangle, Play, ChevronDown, ChevronRight, TerminalSquare } from 'lucide-react';
import type { FailureGuidance, SuccessGuidance } from '@node-wars/shared';

interface CheckResult {
  id: string;
  label: string;
  passed: boolean;
  message: string;
}

interface TestResultsProps {
  checks: CheckResult[];
  score: number;
  total: number;
  success?: boolean;
  failureGuidance?: FailureGuidance;
  successGuidance?: SuccessGuidance;
  isEvaluating?: boolean;
  hasRun?: boolean;
  executionErrors?: string[];
  systemName?: string;
}

const TestResults: React.FC<TestResultsProps> = ({ 
  checks, 
  score, 
  total, 
  success, 
  failureGuidance, 
  successGuidance, 
  isEvaluating,
  hasRun,
  executionErrors = [],
  systemName
}) => {
  const [showRaw, setShowRaw] = useState(false);
  
  const passedChecks = checks.filter(c => c.passed);
  const failedChecks = checks.filter(c => !c.passed);
  
  const hasExecutionError = executionErrors.length > 0;

  let headerText = systemName ? `${systemName} / CHALLENGE VALIDATION` : 'DIAGNOSTIC OUTPUT';
  let statusBadge = null;

  if (isEvaluating) {
    statusBadge = <span className="text-neon-amber animate-pulse">RUNNING CHALLENGE...</span>;
  } else if (!hasRun) {
    statusBadge = <span className="text-white/40">AWAITING EXECUTION</span>;
  } else if (hasExecutionError) {
    statusBadge = <span className="text-neon-red">EXECUTION FAILURE</span>;
  } else if (success) {
    statusBadge = <span className="text-neon-blue">EVALUATION COMPLETE</span>;
  } else {
    statusBadge = <span className="text-neon-red">EVALUATION COMPLETE</span>;
  }

  return (
    <div className="w-full h-full p-5 flex flex-col bg-black/40">
      <div className="text-cyber-light/50 font-mono text-[10px] tracking-widest mb-4 border-b border-white/10 pb-2 flex justify-between items-center">
        <span>{headerText}</span>
        {statusBadge}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2 pb-6">
        
        {/* STATE 1: READY FOR TEST */}
        {!hasRun && !isEvaluating && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
             <div className="w-12 h-12 border-2 border-dashed border-white/10 rounded-full flex items-center justify-center text-white/20">
               <Play size={20} className="ml-1" />
             </div>
             <div>
               <div className="text-white/60 font-mono text-sm tracking-widest uppercase mb-2">Ready For Test</div>
               <div className="text-cyber-light/30 text-xs font-mono leading-relaxed">
                 Complete the guided task in the editor, then run the challenge to validate your work.
               </div>
             </div>
          </div>
        )}

        {/* STATE 2: RUNNING */}
        {isEvaluating && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
             <div className="w-12 h-12 border-2 border-neon-amber border-t-transparent rounded-full animate-spin"></div>
             <div className="text-neon-amber font-mono text-sm tracking-widest uppercase animate-pulse">
               Executing Sequence...
             </div>
          </div>
        )}

        {/* STATE 3: EXECUTION ERROR */}
        {!isEvaluating && hasRun && hasExecutionError && (
          <div className="space-y-4 animate-slide-in">
             <div className="mb-4 pb-4 border-b border-white/5 font-mono text-xs tracking-widest text-neon-red glow-text-red">
               <div className="text-lg font-title mb-1 uppercase">CODE EXECUTION ERROR</div>
               <div>THE SUBMITTED CODE COULD NOT BE EVALUATED</div>
             </div>
             
             <div className="bg-neon-red/10 border-l-2 border-neon-red p-3">
               <div className="text-neon-red font-mono text-[10px] tracking-widest mb-2 font-bold uppercase flex items-center gap-2">
                 <AlertTriangle size={12} /> RAW ERROR
               </div>
               {executionErrors.map((err, i) => (
                 <div key={i} className="text-neon-red/80 font-mono text-xs whitespace-pre-wrap break-words">{err}</div>
               ))}
             </div>

             <div className="mt-6 pt-4 border-t border-white/10">
               <div className="text-cyber-light/50 font-mono text-[10px] tracking-widest mb-3 uppercase">DEBUGGING DIRECTION</div>
               <ul className="space-y-2 text-xs font-mono text-white/80 list-none pl-0">
                 <li className="flex items-start gap-2"><div className="text-neon-amber mt-0.5">-</div>Check syntax and missing brackets</li>
                 <li className="flex items-start gap-2"><div className="text-neon-amber mt-0.5">-</div>Check module imports</li>
                 <li className="flex items-start gap-2"><div className="text-neon-amber mt-0.5">-</div>Verify function names match requirements</li>
                 <li className="flex items-start gap-2"><div className="text-neon-amber mt-0.5">-</div>Verify server startup code</li>
               </ul>
             </div>
          </div>
        )}

        {/* STATE 4 & 5: EVALUATION SUCCESS OR FAILURE */}
        {!isEvaluating && hasRun && !hasExecutionError && checks.length > 0 && (
          <div className="animate-slide-in space-y-6">
            
            {/* Header */}
            <div className={`pb-4 border-b border-white/5 font-mono text-xs tracking-widest ${success ? 'text-neon-blue glow-text-blue' : 'text-neon-red glow-text-red'}`}>
              <div className="text-lg font-title mb-1 uppercase">
                {success ? 'MISSION OBJECTIVE COMPLETE' : 'FAILED'}
              </div>
              <div>{score} / {total} CHECKS PASSED</div>
            </div>

            {/* FAILED CHECKS */}
            {failedChecks.length > 0 && (
              <div>
                <div className="text-neon-red font-mono text-[10px] tracking-widest mb-3 font-bold uppercase">FAILED CHECKS</div>
                <div className="space-y-4">
                  {failedChecks.map(check => (
                    <div key={check.id} className="border-l-2 border-neon-red/50 pl-3">
                      <div className="flex items-start gap-3 text-xs font-mono mb-2">
                        <X size={14} className="text-neon-red shrink-0 mt-0.5" />
                        <div className="uppercase tracking-widest text-neon-red font-bold">{check.label}</div>
                      </div>
                      <div className="ml-6 bg-neon-amber/5 border border-neon-amber/20 p-2 rounded-sm">
                        <div className="text-[9px] font-mono text-neon-amber/60 mb-1 uppercase">EVALUATOR FEEDBACK</div>
                        <div className="text-xs font-mono text-neon-amber/90 leading-relaxed">
                          {check.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Global Failure Guidance */}
                {failureGuidance && (
                  <div className="mt-8 pt-6 border-t border-white/10 space-y-6" data-testid="failure-guidance">
                    <div>
                      <div className="text-cyber-light/50 font-mono text-[10px] tracking-widest mb-2 uppercase">WHY THIS MATTERS</div>
                      <p className="text-xs font-mono text-white/90 leading-relaxed border-l-2 border-neon-amber pl-3">
                        {failureGuidance.whyItMatters}
                      </p>
                    </div>
                    <div>
                      <div className="text-cyber-light/50 font-mono text-[10px] tracking-widest mb-2 uppercase">THINK ABOUT THIS</div>
                      <p className="text-xs font-mono text-neon-blue leading-relaxed italic border-l-2 border-neon-blue pl-3">
                        "{failureGuidance.thinkAbout}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUCCESS FEEDBACK */}
            {success && (
              <div className="space-y-6">
                {/* Passed Checks Summary */}
                {passedChecks.length > 0 && (
                  <div>
                    <div className="text-neon-blue font-mono text-[10px] tracking-widest mb-2 font-bold uppercase">SUCCESSFUL CHECKS</div>
                    <div className="space-y-2 border-l-2 border-neon-blue/30 pl-3">
                      {passedChecks.map(check => (
                        <div key={check.id} className="flex items-start gap-3 text-xs font-mono">
                          <Check size={14} className="text-neon-blue shrink-0 mt-0.5" />
                          <div className="flex-1 uppercase tracking-widest text-cyber-light">{check.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Success Guidance */}
                {successGuidance && (
                  <div className="mt-6 pt-6 border-t border-neon-blue/20 space-y-6">
                    <div>
                      <div className="text-cyber-light/50 font-mono text-[10px] tracking-widest mb-2 uppercase">WHAT YOU BUILT</div>
                      <p className="text-xs font-mono text-white/90 leading-relaxed border-l-2 border-neon-blue pl-3">
                        {successGuidance.whatYouDid}
                      </p>
                    </div>
                    <div>
                      <div className="text-cyber-light/50 font-mono text-[10px] tracking-widest mb-2 uppercase">WHY IT MATTERS</div>
                      <p className="text-xs font-mono text-white/90 leading-relaxed border-l-2 border-neon-blue pl-3">
                        {successGuidance.whyItWorks}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PASSING CHECKS (only show when failed, to not clutter, but keeping them visible at bottom is nice, or we can just show them normally. Actually, if success=true, we already showed them above. If success=false, let's show them below failed checks.) */}
            {!success && passedChecks.length > 0 && (
              <div className="mt-6 pt-4 border-t border-white/5 opacity-60 hover:opacity-100 transition-opacity">
                <div className="text-neon-blue font-mono text-[10px] tracking-widest mb-2 font-bold uppercase">PASSED CHECKS</div>
                <div className="space-y-2 border-l border-neon-blue/30 pl-3">
                  {passedChecks.map(check => (
                    <div key={check.id} className="flex items-start gap-3 text-[10px] font-mono">
                      <Check size={12} className="text-neon-blue shrink-0 mt-0.5" />
                      <div className="flex-1 uppercase tracking-widest text-cyber-light">{check.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* RAW TEST OUTPUT */}
            <div className="mt-8 pt-4 border-t border-white/10">
               <button 
                 onClick={() => setShowRaw(!showRaw)}
                 className="flex items-center gap-2 text-[10px] font-mono text-white/40 hover:text-white transition-colors uppercase tracking-widest"
               >
                 {showRaw ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                 [ VIEW RAW TEST OUTPUT ]
               </button>
               {showRaw && (
                 <div className="mt-3 bg-[#050505] border border-white/10 p-3 rounded-sm">
                   <div className="flex items-center gap-2 text-white/30 text-[9px] font-mono uppercase mb-2">
                     <TerminalSquare size={10} /> RAW CHECKS DUMP
                   </div>
                   <pre className="text-[10px] font-mono text-white/60 whitespace-pre-wrap break-all custom-scrollbar overflow-x-auto">
                     {JSON.stringify(checks, null, 2)}
                   </pre>
                 </div>
               )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default TestResults;
