import { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, CheckCircle, RotateCcw, Terminal as TerminalIcon, LayoutDashboard, BookOpen } from 'lucide-react';
import Terminal from '../components/Terminal';
import CastlePreview from '../components/CastlePreview';
import HintPanel from '../components/HintPanel';
import TestResults from '../components/TestResults';
import { useGameSocket } from '../hooks/useGameSocket';
import LiveSecurityMonitor from '../components/LiveSecurityMonitor';
import TeachingLayer from '../components/TeachingLayer';
import PostMissionDebrief from '../components/PostMissionDebrief';
import NarrativeBriefing from '../components/NarrativeBriefing';
import { teachingRegistry } from '@node-wars/shared';
import { getMissionIdentity } from '../utils/missionIdentity';
import { getSystemVisualState } from '../utils/systemState';
import { API_URL } from '../utils/api';

// Mission 07 ships with an intentionally buggy starter (missing authorization check)
// so students can find and fix it. Instructors get the fixed version pre-loaded
// so they can demo the working, secured code on the projector.
const INSTRUCTOR_SOLUTIONS: Record<string, string> = {
  'mission-07': `const express = require("express");
const app = express();

const NODE_ENV = process.env.NODE_ENV || "development";

// Simulated user (in reality, parsed from a JWT)
app.use((req, res, next) => {
  try {
    req.user = { username: "node_hacker", role: "PLAYER" };
    next();
  } catch (err) {
    res.status(500).json({ error: "Auth setup error" });
  }
});

const securityGate = (req, res, next) => {
  try {
    // 1. AUTHENTICATION: "Who are you?"
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 2. AUTHORIZATION: "Are you allowed?" (this is what was missing)
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Insufficient permissions (ADMIN required)" });
    }

    // 3. ALLOW ACCESS
    next();
  } catch (err) {
    if (NODE_ENV === "production") {
      res.status(500).json({ error: "Server error" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

// PROTECTED ROUTE - only ADMIN can reach this now
app.get("/admin", securityGate, (req, res) => {
  try {
    res.status(200).json({ secret: "FLAG", user: req.user });
  } catch (err) {
    res.status(500).json({ error: "Failed to access admin resource" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(3004, () => console.log("Server running on port 3004"));
`,
  // Mission 08 ships with two TODOs (hardcoded PORT, and a "start" script that
  // just says "TODO") for students to fill in. Instructors get the completed
  // version pre-loaded so they can demo a deployment-ready app.
  'mission-08': `const http = require("http");

// Read the port from the environment, falling back to 3000 for local testing
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.end("Castle server is live 24/7");
});

server.listen(PORT, () => console.log(\`Listening on \${PORT}\`));

// ---- package.json (this is what the hosting platform runs) ----
// {
//   "name": "castle-server",
//   "scripts": {
//     "start": "node server.js"
//   }
// }
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
  const [showLesson, setShowLesson] = useState(false);
  const [showNarrativeBriefing, setShowNarrativeBriefing] = useState(false);

  const [allMissions, setAllMissions] = useState<Array<{ id: string; order: number }>>([]);

  const { user } = useOutletContext<{ user: any }>();
  const isDemoRole = user?.role === 'DEMO' || user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR';
  const isInstructorRole = user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR';
  // The Events mission is the one wired to the live Socket.IO monitor -
  // matched by id, not by an order number, since order no longer maps
  // 1:1 to a fixed mission-06/07 style numbering.
  const showMonitor = mission?.id === 'mission-06' && progress && (progress.status !== 'LOCKED' || isDemoRole);
  const { isConnected, events } = useGameSocket(!!showMonitor);

  useEffect(() => {
    const fetchMission = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      if (!missionId) {
        return navigate('/dashboard');
      }

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
          setCode(solvedCode || missionData.starterCode);
          setLogs([{ type: 'info', message: 'Mission loaded. Your environment is ready.' }]);
          setEvaluation(null);

          const hasViewedNarrative = sessionStorage.getItem(`node-lab-narrative-viewed-${missionId}`);
          const hasViewedLesson = sessionStorage.getItem(`node-lab-lesson-viewed-${missionId}`);

          if (!hasViewedNarrative && missionData.order <= 7) {
            setShowNarrativeBriefing(true);
            setShowLesson(false);
          } else if (!hasViewedLesson) {
            setShowNarrativeBriefing(false);
            setShowLesson(true);
          } else {
            setShowNarrativeBriefing(false);
            setShowLesson(false);
          }

          if ((progressData.status !== 'LOCKED' || isDemoRole) && missionData.id === 'mission-06') {
             fetch(`${API_URL}/api/missions/${missionId}/enter`, {
               method: 'POST',
               headers: { 'Authorization': `Bearer ${token}` }
             }).catch(console.error);
          }
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Failed to load mission', err);
      }
    };

    fetchMission();
  }, [missionId, navigate]);

  const handleEnterMission = () => {
    if (missionId) {
      sessionStorage.setItem(`node-lab-narrative-viewed-${missionId}`, 'true');
    }
    setShowNarrativeBriefing(false);
    if (!sessionStorage.getItem(`node-lab-lesson-viewed-${missionId}`)) {
      setShowLesson(true);
    }
  };

  const handleRun = async () => {
    if (isEvaluating || !code.trim()) return;

    setIsEvaluating(true);
    setLogs(prev => [
      ...prev,
      { type: 'info', message: '> node index.js' },
      { type: 'info', message: 'Starting up...' }
    ]);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/missions/${missionId}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
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
      navigate(`/lab/${next.id}`);
    } else {
      // Last mission complete - show the recap before the quiz.
      navigate('/showcase');
    }
  };

  if (!mission) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-sm animate-pulse" style={{ color: 'var(--accent-purple)' }}>
        Loading your mission...
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
      case 'mission-06': return 'Event monitoring';
      case 'mission-08': return 'Deployment check';
      case 'mission-03': return 'Access control (bonus)';
      case 'mission-04': return 'Resource storage (bonus)';
      case 'mission-05': return 'Async processing (bonus)';
      case 'mission-07': return 'Controlled breach test (bonus)';
      default: return 'Active';
    }
  };

  const isMission7 = mission.id === 'mission-08'; // finale styling now on the Deployment mission
  const accentColor = isMission7 ? 'var(--accent-gold)' : 'var(--accent-purple)';

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] -mt-6 p-6 max-w-[1920px] mx-auto z-10 relative animate-slide-in">

      {showNarrativeBriefing && content && (
        <NarrativeBriefing
          missionNumber={mission.order}
          content={content}
          onEnterMission={handleEnterMission}
        />
      )}

      {showLesson && content && !showNarrativeBriefing && (
        <TeachingLayer
          missionNumber={mission.order}
          content={content}
          onBeginChallenge={() => {
            if (missionId) {
              sessionStorage.setItem(`node-lab-lesson-viewed-${missionId}`, 'true');
            }
            setShowLesson(false);
          }}
        />
      )}

      {/* FULL WORKSTATION GRID */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-0 glass-panel overflow-hidden">

        {/* LEFT COLUMN: MISSION CONTROL */}
        <div className="lg:col-span-3 flex flex-col relative overflow-hidden" style={{ borderRight: '1px solid var(--border-color)' }}>
          <div className="p-4" style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: isMission7 ? 'rgba(232, 184, 75, 0.06)' : 'rgba(124, 111, 224, 0.06)' }}>
            <div className="flex items-center gap-2 mb-2">
              <identity.icon size={16} style={{ color: accentColor }} />
              <h1 className="text-lg font-display font-bold" style={{ color: accentColor }}>
                {identity.systemName}
              </h1>
            </div>

            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col">
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Mission {identity.designation} &middot; {identity.shortName}
                </span>
                <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {identity.systemRole}
                </span>
              </div>
              {content?.narrative && (
                <button
                  onClick={() => setShowNarrativeBriefing(true)}
                  className="chip text-[9px] transition-colors"
                  style={isMission7 ? { backgroundColor: 'rgba(232, 184, 75, 0.12)', color: 'var(--accent-gold)' } : { backgroundColor: 'rgba(124, 111, 224, 0.12)', color: 'var(--accent-purple)' }}
                >
                  Briefing
                </button>
              )}
            </div>

            <div className="clay-inset p-2 rounded-xl">
              <div className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>Status</div>
              <div className="text-xs font-semibold" style={{
                color: visualState === 'COMPLETED' ? 'var(--accent-sky)' : isMission7 ? 'var(--accent-gold)' : 'var(--accent-mint)'
              }}>
                {getStatusText()}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
            {evaluation?.success && content ? (
              <PostMissionDebrief
                content={content}
                onReviewLesson={() => setShowLesson(true)}
                onContinue={handleContinue}
                isFinalMission={allMissions.length > 0 && mission.order >= allMissions[allMissions.length - 1].order}
                nextMissionId={allMissions.find(m => m.order === mission.order + 1)?.id || ''}
              />
            ) : (
              <div className="p-4 flex flex-col gap-6 h-full">
                {content?.guidedTask ? (
                  <div data-testid="guided-task">
                    <div className="text-xs font-semibold mb-3 pb-1" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Guided task</div>
                    <p className="text-xs leading-relaxed mb-6 clay-inset p-3 rounded-xl" style={{ color: 'var(--text-primary)', borderLeft: '2px solid var(--accent-purple)' }}>
                      {content.guidedTask.task}
                    </p>

                    <div className="text-xs font-semibold mb-3 pb-1" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Requirements</div>
                    <ul className="space-y-2 mb-6" data-testid="task-requirements">
                      {content.guidedTask.requirements.map((req: string, i: number) => (
                        <li key={i} className="flex gap-3 text-xs items-start">
                          <div className="mt-0.5" style={{ color: 'var(--accent-purple)' }}>&bull;</div>
                          <span className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{req}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="text-xs font-semibold mb-3 pb-1" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Success condition</div>
                    <p className="text-xs leading-relaxed italic" style={{ color: 'var(--text-muted)' }} data-testid="task-success">
                      {content.guidedTask.successCondition}
                    </p>
                  </div>
                ) : (
                  // Fallback for missing guided task
                  <div data-testid="fallback-task">
                    <div>
                      <div className="text-xs font-semibold mb-3 pb-1" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Directive</div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{mission.description}</p>
                    </div>

                    <div className="mt-6">
                      <div className="text-xs font-semibold mb-3 pb-1" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Tasks</div>
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
                    </div>
                  </div>
                )}

                <div className="mt-auto flex flex-col gap-4 pt-6">
                   <HintPanel hints={hints} progressiveHints={content?.progressiveHints} hasFailed={!!evaluation && !evaluation.success} />
                   <button
                     onClick={() => setShowLesson(true)}
                     className="clay-button-secondary flex items-center justify-center gap-2 w-full py-2.5 text-xs"
                   >
                     <BookOpen size={12} />
                     Review lesson
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER COLUMN: CODE WORKBENCH */}
        <div className="lg:col-span-6 flex flex-col relative" style={{ borderRight: '1px solid var(--border-color)' }}>

          <div className="flex items-center justify-between p-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <TerminalIcon size={14} style={{ color: 'var(--accent-purple)' }} />
              <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                Code editor
              </div>
              <div className="text-[10px] opacity-70 hidden md:block" style={{ color: 'var(--accent-purple)' }}>
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
            </div>
          </div>

          <div className="flex-1 relative p-2" style={{ backgroundColor: '#1e1c2e' }}>
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'Fira Code, monospace',
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                overviewRulerLanes: 0,
                hideCursorInOverviewRuler: true,
                scrollbar: { vertical: 'hidden' },
              }}
            />
          </div>

          {/* Main Action Bar */}
          <div className="p-4 flex justify-between items-center relative shrink-0 z-20" style={{ borderTop: '1px solid var(--border-color)' }}>
            <div className="text-[11px] flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-mint)' }}></span>
              Ready to run
            </div>

            <button
              onClick={handleRun}
              disabled={isEvaluating}
              className="clay-button px-8 py-3 font-bold flex items-center justify-center gap-3 text-xs w-full md:w-auto"
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

          {/* TERMINAL ATTACHED DIRECTLY BELOW */}
          <div className="h-48 shrink-0" style={{ borderTop: '1px solid var(--border-color)' }}>
            <div className="h-full w-full">
              <Terminal logs={logs} isEvaluating={isEvaluating} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CASTLE DIAGNOSTICS */}
        <div className="lg:col-span-3 flex flex-col relative">

          {/* Castle Console */}
          <div className="flex-[1.2] min-h-0 shrink-0 p-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
             <div className="text-xs font-semibold mb-4" style={{ color: 'var(--text-muted)' }}>
               Infrastructure
             </div>
             <div className="h-full w-full relative">
               <CastlePreview
                 componentName={mission.unlockComponent}
                 missionOrder={mission.order}
                 isUnlocked={progress?.status === 'COMPLETE'}
               />
             </div>
          </div>

          {showMonitor && (
            <div className="h-32 min-h-0 shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <LiveSecurityMonitor isConnected={isConnected} events={events} />
            </div>
          )}

          {/* Test Results Console */}
          <div className="flex-1 min-h-0 p-4">
             <div className="text-xs font-semibold mb-4" style={{ color: 'var(--text-muted)' }}>
               Security diagnostics
             </div>
             <div className="h-full w-full">
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
               />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Lab;
