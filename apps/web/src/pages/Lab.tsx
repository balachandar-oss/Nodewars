import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, CheckCircle, RotateCcw, Terminal as TerminalIcon, BookOpen } from 'lucide-react';
import Terminal from '../components/Terminal';
import HintPanel from '../components/HintPanel';
import TestResults from '../components/TestResults';
import TeachingLayer from '../components/TeachingLayer';
import PostMissionDebrief from '../components/PostMissionDebrief';
import NarrativeBriefing from '../components/NarrativeBriefing';
import BountyInteract from '../components/BountyInteract';
import BountyPanel from '../components/BountyPanel';
import { teachingRegistry } from '@node-wars/shared';
import { getMissionIdentity } from '../utils/missionIdentity';
import { getSystemVisualState } from '../utils/systemState';
import { API_URL } from '../utils/api';

const INSTRUCTOR_SOLUTIONS: Record<string, string> = {
  'mission-04': `const http = require("http");

// Read the port from the environment, falling back to 3000 for local testing
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.end("Castle server is live 24/7");
});

server.listen(PORT, () => console.log(\`Listening on \${PORT}\`));
`
};

const Lab = () => {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const [mission, setMission] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [code, setCode] = useState<string>('');
  const [logs, setLogs] = useState<Array<{ type: 'info' | 'success' | 'error' | 'sim', message: string }>>([]);

  const [evaluation, setEvaluation] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  // NEW LAB STATE MACHINE
  const [phase, setPhase] = useState<'BRIEFING' | 'LEARN' | 'INTERACT' | 'CODE' | 'COMPLETE'>('BRIEFING');

  const [allMissions, setAllMissions] = useState<Array<{ id: string; order: number }>>([]);

  const { user } = useOutletContext<{ user: any }>();
  const isDemoRole = user?.role === 'DEMO' || user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR';
  const isInstructorRole = user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR';

  useEffect(() => {
    const fetchMission = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      if (!missionId) return navigate('/dashboard');

      try {
        const [missionRes, progressRes, listRes] = await Promise.all([
          fetch(`${API_URL}/api/missions/${missionId}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/missions/${missionId}/progress`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/missions`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (listRes.ok) {
          const list = await listRes.json();
          setAllMissions(list.sort((a: any, b: any) => a.order - b.order));
        }

        if (missionRes.ok && progressRes.ok) {
          const missionData = await missionRes.json();
          const progressData = await progressRes.json();

          if (progressData.status === 'LOCKED') {
            if (!isDemoRole) {
              navigate('/dashboard');
              return;
            }
          }

          setMission(missionData);
          setProgress(progressData);
          const solvedCode = isInstructorRole ? INSTRUCTOR_SOLUTIONS[missionId] : undefined;
          // Restore any in-progress (not yet passing) code from a previous
          // session on this mission, so a reload doesn't wipe unsaved work.
          let savedCode: string | null = null;
          if (!solvedCode) {
            try {
              savedCode = localStorage.getItem(`node-lab-code-${missionId}`);
            } catch {
              // ignore
            }
          }
          setCode(solvedCode || savedCode || missionData.starterCode);
          setLogs([{ type: 'info', message: 'Mission loaded. Your environment is ready.' }]);
          setEvaluation(null);

          // State Machine Initialization
          const hasViewedNarrative = sessionStorage.getItem(`node-lab-narrative-viewed-${missionId}`);
          const hasViewedLesson = sessionStorage.getItem(`node-lab-lesson-viewed-${missionId}`);
          
          const hasContent = !!teachingRegistry[missionId];

          if (progressData.status === 'COMPLETE') {
             // If already complete, skip directly to CODE for review
             setPhase('CODE');
          } else if (!hasContent) {
             // No teaching content for this mission ID (e.g. stale/unseeded data) - never
             // get stuck on a briefing/lesson screen that can't render.
             setPhase('INTERACT');
          } else if (!hasViewedNarrative) {
             setPhase('BRIEFING');
          } else if (!hasViewedLesson) {
             setPhase('LEARN');
          } else {
             setPhase('INTERACT');
          }

        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Failed to load mission', err);
      }
    };

    fetchMission();
  }, [missionId, navigate, isDemoRole, isInstructorRole]);

  // Persist in-progress code locally so a reload doesn't lose unsaved work
  useEffect(() => {
    // Only save if the currently loaded mission matches the URL param
    if (!missionId || !code || mission?.id !== missionId) return;
    try {
      localStorage.setItem(`node-lab-code-${missionId}`, code);
    } catch {
      // ignore - non-critical
    }
  }, [missionId, code, mission?.id]);

  const handleEnterMission = () => {
    if (missionId) sessionStorage.setItem(`node-lab-narrative-viewed-${missionId}`, 'true');
    setPhase('LEARN');
  };

  const handleBeginChallenge = () => {
    if (missionId) sessionStorage.setItem(`node-lab-lesson-viewed-${missionId}`, 'true');
    setPhase('INTERACT');
  };

  const handleOpenCode = () => {
    setPhase('CODE');
  };

  const handleRun = async () => {
    if (isEvaluating || !code.trim()) return;

    setIsEvaluating(true);
    setLogs(prev => [...prev, { type: 'info', message: 'Checking your code...' }]);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/missions/${missionId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code })
      });

      const data = await res.json();

      if (!res.ok) {
        setLogs(prev => [...prev, { type: 'error', message: data.error || 'Evaluation failed' }]);
        setIsEvaluating(false);
        return;
      }

      setEvaluation(data);

      const newLogs = data.terminalOutput.map((msg: string) => ({
        type: data.success ? 'success' : 'sim',
        message: msg
      }));
      setLogs(prev => [...prev, ...newLogs]);

      if (data.success && progress.status !== 'COMPLETE') {
        setProgress((prev: any) => ({ ...prev, status: 'COMPLETE' }));
        setLogs(prev => [
          ...prev,
          { type: 'success', message: `Mission ${mission.order} complete. +${mission.xpReward} XP awarded.` }
        ]);
        window.dispatchEvent(new Event('user-progress-updated'));
        try {
          localStorage.removeItem(`node-lab-code-${missionId}`);
        } catch {
          // ignore
        }

        // Move to complete phase after a short delay for celebration
        setTimeout(() => setPhase('COMPLETE'), 2000);
      }

    } catch (err) {
      console.error('Execution error', err);
      setLogs(prev => [...prev, { type: 'error', message: 'Could not reach the execution engine.' }]);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    if (mission) {
      const solvedCode = isInstructorRole ? INSTRUCTOR_SOLUTIONS[missionId || ''] : undefined;
      setCode(solvedCode || mission.starterCode);
      setLogs([{ type: 'info', message: 'Code reset to the original starting point.' }]);
      setEvaluation(null);
    }
  };

  const handleContinue = () => {
    if (!mission || allMissions.length === 0) {
      navigate('/dashboard');
      return;
    }
    const next = allMissions.find(m => m.order === mission.order + 1);
    if (next) {
      // Reset immediately so the loading skeleton shows right away instead of
      // leaving the previous mission's debrief on screen while the next
      // mission's data is still being fetched.
      setMission(null);
      navigate(`/lab/${next.id}`);
    } else {
      navigate('/showcase');
    }
  };

  if (!mission) {
    return (
      <div className="flex flex-col h-[calc(100vh-60px)] -mt-6 -mb-6 p-6 max-w-[1920px] mx-auto animate-fade-in">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
          <div className="lg:col-span-3 flex flex-col gap-3">
            <div className="skeleton h-24"></div>
            <div className="skeleton flex-1"></div>
          </div>
          <div className="lg:col-span-6 flex flex-col gap-3">
            <div className="skeleton h-12"></div>
            <div className="skeleton flex-1"></div>
          </div>
          <div className="lg:col-span-3 flex flex-col gap-3">
            <div className="skeleton h-40"></div>
            <div className="skeleton flex-1"></div>
          </div>
        </div>
      </div>
    );
  }

  const objectives = JSON.parse(mission.objectives || '[]');
  const hints = JSON.parse(mission.hints || '[]');
  const content = missionId ? teachingRegistry[missionId] : undefined;
  const identity = getMissionIdentity(mission.id);
  const visualState = getSystemVisualState(progress?.status || 'LOCKED', true);

  const getStatusText = () => {
    if (visualState === 'COMPLETED') return `${identity.systemName} online`;
    switch (identity.missionId) {
      case 'mission-01': return 'Boot sequence';
      case 'mission-02': return 'Package layer';
      case 'mission-03': return 'Event circuit';
      case 'mission-04': return 'Deployment sequence';
      default: return 'Active';
    }
  };

  const isFinalMission = mission.id === 'mission-04';
  const accentColor = isFinalMission ? 'var(--accent-gold)' : 'var(--accent-purple)';

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] -mt-6 -mb-6 p-6 max-w-[1920px] mx-auto z-10 relative animate-slide-in">

      {/* PHASE 1: BRIEFING */}
      {phase === 'BRIEFING' && content && (
        <NarrativeBriefing
          missionNumber={mission.order}
          content={content}
          onEnterMission={handleEnterMission}
        />
      )}

      {/* PHASE 2: LEARN */}
      {phase === 'LEARN' && content && (
        <TeachingLayer
          missionNumber={mission.order}
          content={content}
          onBeginChallenge={handleBeginChallenge}
        />
      )}
      
      {/* PHASE 5: COMPLETE / DEBRIEF */}
      {phase === 'COMPLETE' && content && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] bg-[var(--bg-primary)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--border-color)] flex flex-col">
            <PostMissionDebrief
              content={content}
              onReviewLesson={() => setPhase('LEARN')}
              onContinue={handleContinue}
              isFinalMission={allMissions.length > 0 && mission.order >= allMissions[allMissions.length - 1].order}
              nextMissionId={allMissions.find(m => m.order === mission.order + 1)?.id || ''}
              code={code}
            />
          </div>
        </div>,
        document.body
      )}

      {/* WORKSTATION GRID (Visible during INTERACT and CODE phases) */}
      {(phase === 'INTERACT' || phase === 'CODE' || phase === 'COMPLETE') && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-0 glass-panel overflow-hidden">

          {/* LEFT COLUMN: MISSION CONTROL (Only in INTERACT) */}
          {phase === 'INTERACT' && (
            <div className="lg:col-span-3 flex flex-col relative overflow-hidden min-h-0" style={{ borderRight: '1px solid var(--border-color)' }}>
            <div className="p-4" style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: isFinalMission ? 'rgba(232, 184, 75, 0.06)' : 'rgba(124, 111, 224, 0.06)' }}>
              <div className="flex items-center gap-2 mb-2">
                <identity.icon size={16} style={{ color: accentColor }} />
                <h1 className="text-lg font-display font-bold" style={{ color: accentColor }}>
                  {identity.systemName}
                </h1>
              </div>

              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    System {mission.order} / 4 &middot; {identity.shortName}
                  </span>
                  <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {identity.systemRole}
                  </span>
                </div>
                {content?.narrative && (
                  <button
                    onClick={() => setPhase('BRIEFING')}
                    className="chip text-[9px] transition-colors"
                    style={isFinalMission ? { backgroundColor: 'rgba(232, 184, 75, 0.12)', color: 'var(--accent-gold)' } : { backgroundColor: 'rgba(124, 111, 224, 0.12)', color: 'var(--accent-purple)' }}
                  >
                    Briefing
                  </button>
                )}
              </div>

              <div className="clay-inset p-2 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>Status</div>
                  <div className="text-xs font-semibold" style={{
                    color: visualState === 'COMPLETED' ? 'var(--accent-sky)' : isFinalMission ? 'var(--accent-gold)' : 'var(--accent-mint)'
                  }}>
                    {getStatusText()}
                  </div>
                </div>
                {isInstructorRole && (
                  <div className="text-[10px] bg-[var(--bg-secondary)] px-2 py-1 rounded text-[var(--accent-sky)]">INSTRUCTOR</div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar scroll-fade-bottom flex flex-col min-h-0 p-4 gap-6">
              <div data-testid="bounty-task">
                <div className="text-xs font-semibold mb-3 pb-1" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Mission Objective</div>
                <p className="text-xs leading-relaxed mb-6 clay-inset p-3 rounded-xl" style={{ color: 'var(--text-primary)', borderLeft: `2px solid ${accentColor}` }}>
                  {content?.guidedTask?.task || mission.description}
                </p>

                {content?.guidedTask && (
                  <>
                    <div className="text-xs font-semibold mb-3 pb-1" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Requirements</div>
                    <ul className="space-y-2 mb-6" data-testid="task-requirements">
                      {content.guidedTask.requirements.map((req: string, i: number) => (
                        <li key={i} className="flex gap-3 text-xs items-start">
                          <div className="mt-0.5" style={{ color: accentColor }}>&bull;</div>
                          <span className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{req}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="text-xs font-semibold mb-3 pb-1" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Success condition</div>
                    <p className="text-xs leading-relaxed italic" style={{ color: 'var(--text-muted)' }} data-testid="task-success">
                      {content.guidedTask.successCondition}
                    </p>
                  </>
                )}
                {!content?.guidedTask && (
                  <ul className="space-y-2">
                    {objectives.map((obj: string, i: number) => {
                      const isChecked = evaluation?.success === true;
                      return (
                        <li key={i} className="flex gap-3 text-xs items-center">
                          <div className="w-4 h-4 rounded-md flex items-center justify-center shrink-0" style={{ border: `1px solid ${isChecked ? 'var(--accent-mint)' : 'var(--border-color)'}`, color: isChecked ? 'var(--accent-mint)' : 'transparent' }}>
                            <CheckCircle size={10} />
                          </div>
                          <span className="leading-tight" style={{ color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)' }}>{obj}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="mt-auto flex flex-col gap-4 pt-6">
                 <HintPanel hints={hints} progressiveHints={content?.progressiveHints} hasFailed={!!evaluation && !evaluation.success} />
                 <button
                   onClick={() => setPhase('LEARN')}
                   className="clay-button-secondary flex items-center justify-center gap-2 w-full py-2.5 text-xs"
                 >
                   <BookOpen size={12} /> Review lesson
                 </button>
              </div>
              </div>
            </div>
          )}

          {/* CENTER & RIGHT CONTENT AREA */}
          {phase === 'INTERACT' ? (
            <div className="lg:col-span-9 flex items-center justify-center relative min-h-0">
               <BountyInteract missionId={mission.id} onOpenCode={handleOpenCode} />
            </div>
          ) : (
            <>
              {/* LEFT COLUMN (CODE PHASE): BOUNTY + HINTS + CASTLE */}
              <div className="lg:col-span-4 flex flex-col relative min-h-0 overflow-y-auto custom-scrollbar" style={{ borderRight: '1px solid var(--border-color)' }}>
                 <div className="shrink-0">
                   <BountyPanel missionId={mission.id} isCompleted={progress?.status === 'COMPLETE'} />
                 </div>

                 <div className="shrink-0 p-4 flex flex-col gap-4">
                   <HintPanel hints={hints} progressiveHints={content?.progressiveHints} hasFailed={!!evaluation && !evaluation.success} />
                   <button
                     onClick={() => setPhase('LEARN')}
                     className="clay-button-secondary flex items-center justify-center gap-2 w-full py-2.5 text-xs"
                   >
                     <BookOpen size={12} /> Review lesson
                   </button>
                 </div>
              </div>

              {/* RIGHT COLUMN (CODE PHASE): MONACO + TERMINAL + TEST RESULTS */}
              <div className="lg:col-span-8 flex flex-col relative min-h-0">
                <div className="flex items-center justify-between p-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <div className="flex items-center gap-3">
                    <TerminalIcon size={14} style={{ color: accentColor }} />
                    <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Code editor
                    </div>
                    <div className="text-[10px] opacity-70 hidden md:block" style={{ color: accentColor }}>
                      {mission.title.replace(/ /g, '_')}.js
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1.5 text-[11px] transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <RotateCcw size={10} /> Reset
                    </button>
                    <button
                      onClick={() => setPhase('INTERACT')}
                      className="flex items-center gap-1.5 text-[11px] transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                    >
                       Back to Briefing
                    </button>
                    {progress?.status === 'COMPLETE' && (
                      <button
                        onClick={() => setPhase('COMPLETE')}
                        className="flex items-center gap-1.5 text-[11px] transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                      >
                         View debrief
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-[2] relative p-2 min-h-0" style={{ backgroundColor: '#1e1c2e' }}>
                  <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val || '')}
                    onMount={(editor) => {
                      // Students must type their own code - block paste (keyboard,
                      // right-click menu, or drag-drop all land here) by immediately
                      // undoing any change Monaco flags as a paste.
                      editor.onDidPaste(() => {
                        editor.trigger('source', 'undo', null);
                        setLogs(prev => [...prev, { type: 'error', message: 'Pasting is disabled here - please type your code.' }]);
                      });
                    }}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: 'Fira Code, monospace',
                      padding: { top: 16 },
                      scrollBeyondLastLine: false,
                      overviewRulerLanes: 0,
                      hideCursorInOverviewRuler: true,
                      scrollbar: { vertical: 'hidden' },
                      // Enter must always insert a newline, never silently accept
                      // an open autocomplete suggestion instead - that was
                      // collapsing students' multi-line code onto one line
                      // whenever they pressed Enter with a suggestion popup open.
                      acceptSuggestionOnEnter: 'off',
                      wordWrap: 'on',
                    }}
                  />
                </div>

                {/* Main Action Bar */}
                <div className="p-3 flex justify-between items-center relative shrink-0 z-20" style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="text-[11px] flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-mint)' }}></span>
                    Ready to run
                  </div>

                  <button
                    onClick={handleRun}
                    disabled={isEvaluating}
                    className="clay-button px-8 py-2 font-bold flex items-center justify-center gap-3 text-xs w-full md:w-auto"
                  >
                    {isEvaluating ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Running...</span>
                      </>
                    ) : evaluation?.success ? (
                      <>
                        <CheckCircle size={14} />
                        <span>System secured</span>
                      </>
                    ) : (
                      <>
                        <Play size={14} className="fill-current" />
                        <span>Run my code</span>
                      </>
                    )}
                  </button>
                </div>

                {/* BOTTOM SPLIT: TERMINAL | TEST RESULTS */}
                <div className="flex-1 min-h-[250px] shrink-0 flex flex-row">
                  <div className="flex-1 relative" style={{ borderRight: '1px solid var(--border-color)' }}>
                    <div className="absolute inset-0">
                      <Terminal logs={logs} isEvaluating={isEvaluating} />
                    </div>
                  </div>
                  <div className="flex-1 relative bg-[var(--bg-primary)]">
                     <div className="absolute inset-0 overflow-y-auto p-4 custom-scrollbar">
                       <div className="text-xs font-semibold mb-4 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                         Security diagnostics
                       </div>
                       <TestResults
                         checks={evaluation?.checks || []}
                         score={evaluation?.score || 0}
                         total={evaluation?.checks?.length || 0}
                         success={evaluation?.success}
                         failureGuidance={content?.failureGuidance}
                         successGuidance={content?.successGuidance}
                         isEvaluating={isEvaluating}
                         executionErrors={evaluation?.errors ?? []}
                         hasRun={!!evaluation}
                         systemName={identity.systemName}
                         onNext={() => setPhase('COMPLETE')}
                       />
                     </div>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
};

export default Lab;
