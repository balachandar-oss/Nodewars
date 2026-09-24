import React, { useState } from 'react';
import { Check, X, AlertTriangle, Play, ChevronDown, ChevronRight, Code, ArrowRight } from 'lucide-react';
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
  onNext?: () => void;
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
  systemName,
  onNext
}) => {
  const [showRaw, setShowRaw] = useState(false);

  const passedChecks = checks.filter(c => c.passed);
  const failedChecks = checks.filter(c => !c.passed);

  const hasExecutionError = executionErrors.length > 0;

  let headerText = systemName ? `${systemName} check` : 'Check results';
  let statusBadge = null;

  if (isEvaluating) {
    statusBadge = <span className="chip chip-gold animate-pulse">Running</span>;
  } else if (!hasRun) {
    statusBadge = <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Waiting</span>;
  } else if (hasExecutionError) {
    statusBadge = <span className="chip chip-rose">Error</span>;
  } else if (success) {
    statusBadge = <span className="chip chip-sky">Complete</span>;
  } else {
    statusBadge = <span className="chip chip-rose">Complete</span>;
  }

  return (
    <div className="w-full h-full p-5 flex flex-col">
      <div className="text-xs font-semibold mb-4 pb-2 flex justify-between items-center" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
        <span>{headerText}</span>
        {statusBadge}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2 pb-6">

        {/* STATE 1: READY FOR TEST */}
        {!hasRun && !isEvaluating && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
             <div className="clay-inset w-14 h-14 rounded-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
               <Play size={20} className="ml-1" />
             </div>
             <div>
               <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Ready when you are</div>
               <div className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                 Complete the guided task in the editor, then run your code to check your work.
               </div>
             </div>
          </div>
        )}

        {/* STATE 2: RUNNING */}
        {isEvaluating && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
             <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-gold) transparent var(--accent-gold) var(--accent-gold)' }}></div>
             <div className="text-sm font-semibold animate-pulse" style={{ color: 'var(--accent-gold)' }}>
               Running your code...
             </div>
          </div>
        )}

        {/* STATE 3: EXECUTION ERROR */}
        {!isEvaluating && hasRun && hasExecutionError && (
          <div className="space-y-4 animate-slide-in">
             <div className="mb-4 pb-4 text-xs" style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--accent-rose)' }}>
               <div className="text-lg font-display font-bold mb-1">Something went wrong</div>
               <div>Your code couldn't be run</div>
             </div>

             <div className="rounded-2xl p-3" style={{ backgroundColor: 'rgba(224, 124, 155, 0.08)', borderLeft: '3px solid var(--accent-rose)' }}>
               <div className="text-[10px] mb-2 font-semibold flex items-center gap-2" style={{ color: 'var(--accent-rose)' }}>
                 <AlertTriangle size={12} /> Error details
               </div>
               {executionErrors.map((err, i) => (
                 <div key={i} className="text-xs whitespace-pre-wrap break-words" style={{ color: 'var(--accent-rose)' }}>{err}</div>
               ))}
             </div>

             <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
               <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Things to check</div>
               <ul className="space-y-2 text-xs" style={{ color: 'var(--text-primary)' }}>
                 <li className="flex items-start gap-2"><div className="mt-0.5" style={{ color: 'var(--accent-gold)' }}>-</div>Check syntax and missing brackets</li>
                 <li className="flex items-start gap-2"><div className="mt-0.5" style={{ color: 'var(--accent-gold)' }}>-</div>Check module imports</li>
                 <li className="flex items-start gap-2"><div className="mt-0.5" style={{ color: 'var(--accent-gold)' }}>-</div>Verify function names match requirements</li>
                 <li className="flex items-start gap-2"><div className="mt-0.5" style={{ color: 'var(--accent-gold)' }}>-</div>Verify server startup code</li>
               </ul>
             </div>
          </div>
        )}

        {/* STATE 4 & 5: EVALUATION SUCCESS OR FAILURE */}
        {!isEvaluating && hasRun && !hasExecutionError && checks.length > 0 && (
          <div className="animate-slide-in space-y-6">

            {/* Header */}
            <div className="pb-4 text-xs flex items-center justify-between gap-4" style={{ borderBottom: '1px solid var(--border-color)', color: success ? 'var(--accent-sky)' : 'var(--accent-rose)' }}>
              <div>
                <div className="text-lg font-display font-bold mb-1">
                  {success ? 'Nice work, all checks passed' : 'Not quite there yet'}
                </div>
                <div>{score} / {total} checks passed</div>
              </div>
              {success && onNext && (
                <button
                  onClick={onNext}
                  className="clay-button px-5 py-2.5 text-xs font-bold flex items-center gap-2 shrink-0"
                >
                  Next <ArrowRight size={14} />
                </button>
              )}
            </div>

            {/* FAILED CHECKS */}
            {failedChecks.length > 0 && (
              <div>
                <div className="text-xs font-semibold mb-3" style={{ color: 'var(--accent-rose)' }}>Needs attention</div>
                <div className="space-y-4">
                  {failedChecks.map(check => (
                    <div key={check.id} className="pl-3" style={{ borderLeft: '2px solid rgba(224, 124, 155, 0.4)' }}>
                      <div className="flex items-start gap-3 text-xs mb-2">
                        <X size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--accent-rose)' }} />
                        <div className="font-semibold" style={{ color: 'var(--accent-rose)' }}>{check.label}</div>
                      </div>
                      <div className="ml-6 rounded-xl p-2" style={{ backgroundColor: 'rgba(232, 184, 75, 0.08)' }}>
                        <div className="text-[9px] mb-1" style={{ color: 'var(--accent-gold)' }}>Feedback</div>
                        <div className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                          {check.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Global Failure Guidance */}
                {failureGuidance && (
                  <div className="mt-8 pt-6 space-y-6" style={{ borderTop: '1px solid var(--border-color)' }} data-testid="failure-guidance">
                    <div>
                      <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Why this matters</div>
                      <p className="text-xs leading-relaxed pl-3" style={{ borderLeft: '2px solid var(--accent-gold)', color: 'var(--text-primary)' }}>
                        {failureGuidance.whyItMatters}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Think about this</div>
                      <p className="text-xs leading-relaxed italic pl-3" style={{ borderLeft: '2px solid var(--accent-sky)', color: 'var(--accent-sky)' }}>
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
                    <div className="text-xs font-semibold mb-2" style={{ color: 'var(--accent-sky)' }}>Successful checks</div>
                    <div className="space-y-2 pl-3" style={{ borderLeft: '2px solid rgba(111, 184, 224, 0.3)' }}>
                      {passedChecks.map(check => (
                        <div key={check.id} className="flex items-start gap-3 text-xs">
                          <Check size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--accent-sky)' }} />
                          <div className="flex-1" style={{ color: 'var(--text-primary)' }}>{check.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Success Guidance */}
                {successGuidance && (
                  <div className="mt-6 pt-6 space-y-6" style={{ borderTop: '1px solid rgba(111, 184, 224, 0.2)' }}>
                    <div>
                      <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>What you built</div>
                      <p className="text-xs leading-relaxed pl-3" style={{ borderLeft: '2px solid var(--accent-sky)', color: 'var(--text-primary)' }}>
                        {successGuidance.whatYouDid}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Why it matters</div>
                      <p className="text-xs leading-relaxed pl-3" style={{ borderLeft: '2px solid var(--accent-sky)', color: 'var(--text-primary)' }}>
                        {successGuidance.whyItWorks}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PASSING CHECKS (shown when failed, below failed checks) */}
            {!success && passedChecks.length > 0 && (
              <div className="mt-6 pt-4 opacity-70 hover:opacity-100 transition-opacity" style={{ borderTop: '1px solid var(--border-color)' }}>
                <div className="text-xs font-semibold mb-2" style={{ color: 'var(--accent-sky)' }}>Passed checks</div>
                <div className="space-y-2 pl-3" style={{ borderLeft: '1px solid rgba(111, 184, 224, 0.3)' }}>
                  {passedChecks.map(check => (
                    <div key={check.id} className="flex items-start gap-3 text-[10px]">
                      <Check size={12} className="shrink-0 mt-0.5" style={{ color: 'var(--accent-sky)' }} />
                      <div className="flex-1" style={{ color: 'var(--text-primary)' }}>{check.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RAW TEST OUTPUT */}
            <div className="mt-8 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
               <button
                 onClick={() => setShowRaw(!showRaw)}
                 className="flex items-center gap-2 text-[10px] transition-colors"
                 style={{ color: 'var(--text-muted)' }}
               >
                 {showRaw ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                 View raw check output
               </button>
               {showRaw && (
                 <div className="mt-3 clay-inset p-3 rounded-xl">
                   <div className="flex items-center gap-2 text-[9px] mb-2" style={{ color: 'var(--text-muted)' }}>
                     <Code size={10} /> Raw checks
                   </div>
                   <pre className="text-[10px] font-mono whitespace-pre-wrap break-all custom-scrollbar overflow-x-auto" style={{ color: 'var(--text-secondary)' }}>
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
