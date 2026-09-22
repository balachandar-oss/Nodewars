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
          setLogs([{ type: 'info', message: 'Mission loaded. Engineering environment ready.' }]);
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
      { type: 'info', message: 'Initializing simulator...' }
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
          { type: 'success', message: `[SYSTEM] MISSION 0${mission.order} COMPLETE. +${mission.xpReward} XP AWARDED.` }
        ]);
        
        window.dispatchEvent(new Event('user-progress-updated'));
      }

    } catch (err) {
      console.error('Execution error', err);
      setLogs(prev => [...prev, { type: 'error', message: 'Failed to contact execution engine.' }]);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    if (mission) {
      const solvedCode = isInstructorRole ? INSTRUCTOR_SOLUTIONS[missionId || ''] : undefined;
      setCode(solvedCode || mission.starterCode);
      setLogs([{ type: 'info', message: 'Code environment reset to original state.' }]);
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
    return <div className="text-white font-mono p-8 animate-pulse text-xs tracking-widest">ESTABLISHING WORKSTATION LINK...</div>;
  }

  const objectives = JSON.parse(mission.objectives || '[]');
  const hints = JSON.parse(mission.hints || '[]');
  const content = missionId ? teachingRegistry[missionId] : undefined;
  const identity = getMissionIdentity(mission.id);
  const visualState = getSystemVisualState(progress?.status || 'LOCKED', true);
  
  const getStatusText = () => {
    if (visualState === 'COMPLETED') return `${identity.systemName} ONLINE`;
    switch (identity.missionId) {
      case 'mission-01': return 'BOOT SEQUENCE';
      case 'mission-02': return 'NPM PACKAGE LAYER';
      case 'mission-06': return 'EVENT MONITORING';
      case 'mission-08': return 'DEPLOYMENT CHECK';
      case 'mission-03': return 'ACCESS CONTROL LAYER (BONUS)';
      case 'mission-04': return 'RESOURCE STORAGE (BONUS)';
      case 'mission-05': return 'ASYNC PROCESSING (BONUS)';
      case 'mission-07': return 'CONTROLLED BREACH TEST (BONUS)';
      default: return 'ACTIVE';
    }
  };

  const isMission7 = mission.id === 'mission-08'; // finale styling now on the Deployment mission
  const accentColor = isMission7 ? 'text-neon-amber' : 'text-neon-blue';
  const borderColor = isMission7 ? 'border-neon-amber/30' : 'border-neon-blue/30';
  const bgColor = isMission7 ? 'bg-neon-amber/5' : 'bg-neon-blue/5';
  
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-0 border border-white/10 glass-panel shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* LEFT COLUMN: MISSION CONTROL */}
        <div className="lg:col-span-3 flex flex-col border-r border-white/10 relative overflow-hidden bg-black/60">
          <div className={`p-4 border-b ${borderColor} ${bgColor}`}>
            <div className="flex items-center gap-2 mb-2">
              <identity.icon size={16} className={accentColor} />
              <h1 className={`text-lg font-title tracking-widest uppercase ${accentColor}`}>
                {identity.systemName}
              </h1>
            </div>
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-white/70 tracking-widest uppercase">
                  MISSION {identity.designation} · {identity.shortName}
                </span>
                <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase mt-0.5">
                  {identity.systemRole}
                </span>
              </div>
              {content?.narrative && (
                <button 
                  onClick={() => setShowNarrativeBriefing(true)}
                  className={`text-[9px] font-mono border px-2 py-0.5 mt-0.5 transition-colors ${
                    isMission7 
                      ? 'border-neon-amber/30 text-neon-amber hover:bg-neon-amber/20' 
                      : 'border-neon-blue/30 text-neon-blue hover:bg-neon-blue/20'
                  }`}
                >
                  BRIEFING
                </button>
              )}
            </div>
            
            <div className="p-2 border border-white/5 bg-black/40">
              <div className="text-[9px] font-mono text-white/50 mb-1 tracking-widest">SYSTEM STATUS</div>
              <div className={`text-xs font-mono tracking-widest uppercase ${
                visualState === 'COMPLETED' ? 'text-neon-blue' : isMission7 ? 'text-neon-amber animate-pulse' : 'text-neon-green animate-pulse'
              }`}>
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
                    <div className="text-cyber-light/40 font-mono text-[10px] tracking-widest mb-3 border-b border-white/10 pb-1 uppercase">GUIDED TASK</div>
                    <p className="text-xs font-mono text-white/90 leading-relaxed mb-6 bg-white/5 p-3 rounded-sm border-l-2 border-neon-blue">
                      {content.guidedTask.task}
                    </p>

                    <div className="text-cyber-light/40 font-mono text-[10px] tracking-widest mb-3 border-b border-white/10 pb-1 uppercase">REQUIREMENTS</div>
                    <ul className="space-y-2 mb-6" data-testid="task-requirements">
                      {content.guidedTask.requirements.map((req: string, i: number) => (
                        <li key={i} className="flex gap-3 text-xs font-mono items-start">
                          <div className="text-neon-blue mt-0.5">■</div>
                          <span className="leading-relaxed text-white/80">{req}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="text-cyber-light/40 font-mono text-[10px] tracking-widest mb-3 border-b border-white/10 pb-1 uppercase">SUCCESS CONDITION</div>
                    <p className="text-xs font-mono text-white/60 leading-relaxed italic" data-testid="task-success">
                      {content.guidedTask.successCondition}
                    </p>
                  </div>
                ) : (
                  // Fallback for missing guided task
                  <div data-testid="fallback-task">
                    <div>
                      <div className="text-cyber-light/40 font-mono text-[10px] tracking-widest mb-3 border-b border-white/10 pb-1">DIRECTIVE</div>
                      <p className="text-xs font-mono text-white/80 leading-relaxed uppercase">{mission.description}</p>
                    </div>

                    <div className="mt-6">
                      <div className="text-cyber-light/40 font-mono text-[10px] tracking-widest mb-3 border-b border-white/10 pb-1">TACTICAL TASKS</div>
                      <ul className="space-y-2">
                        {objectives.map((obj: string, i: number) => {
                          const isChecked = evaluation?.success === true;
                          return (
                            <li key={i} className="flex gap-3 text-[10px] font-mono items-center">
                              <div className={`w-3 h-3 border flex items-center justify-center shrink-0 ${isChecked ? 'border-neon-green text-neon-green' : 'border-white/30 text-transparent'}`}>
                                <CheckCircle size={8} />
                              </div>
                              <span className={`leading-tight uppercase ${isChecked ? 'text-white/40' : 'text-white'}`}>{obj}</span>
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
                     className="flex items-center justify-center gap-2 w-full py-2 border border-neon-blue/30 bg-neon-blue/5 text-neon-blue font-mono text-[10px] tracking-widest hover:bg-neon-blue/20 transition-colors uppercase"
                   >
                     <BookOpen size={12} />
                     REVIEW LESSON
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER COLUMN: CODE WORKBENCH */}
        <div className="lg:col-span-6 flex flex-col border-r border-white/10 bg-black/80 relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <LayoutDashboard size={120} />
          </div>
          
          <div className="flex items-center justify-between p-3 border-b border-white/10 bg-black/40">
            <div className="flex items-center gap-3">
              <TerminalIcon size={14} className="text-neon-blue" />
              <div className="font-mono text-xs text-white tracking-widest uppercase">
                NODE LAB // CODE WORKBENCH
              </div>
              <div className="font-mono text-[10px] text-neon-blue tracking-widest opacity-60 hidden md:block">
                {'>'} /SYSTEM/{mission.title.replace(/ /g, '_')}.js
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <button 
                onClick={handleReset} 
                className="flex items-center gap-1.5 text-[10px] font-mono text-white/40 hover:text-white transition-colors" 
              >
                <RotateCcw size={10} /> WIPE
              </button>
            </div>
          </div>
          
          <div className="flex-1 relative bg-[#0a0a0f] p-2">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'Share Tech Mono, monospace',
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                overviewRulerLanes: 0,
                hideCursorInOverviewRuler: true,
                scrollbar: { vertical: 'hidden' },
              }}
            />
          </div>
          
          {/* Main Action Bar */}
          <div className="p-4 border-t border-white/10 bg-black flex justify-between items-center relative shrink-0 z-20">
            <div className="text-[10px] font-mono text-white/40 flex items-center gap-2">
              <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></span>
              SYSTEM READY FOR EXECUTION
            </div>
            
            <button 
              onClick={handleRun} 
              disabled={isEvaluating}
              className={`cyber-button px-8 py-3 font-bold flex items-center justify-center gap-3 text-xs w-full md:w-auto transition-all ${
                isEvaluating 
                  ? 'bg-neon-amber/10 border-neon-amber text-neon-amber' 
                  : evaluation?.success 
                    ? 'bg-neon-blue/10 border-neon-blue text-neon-blue' 
                    : 'bg-neon-green/10 border-neon-green text-neon-green hover:bg-neon-green/20'
              }`}
            >
              {isEvaluating ? (
                <>
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>EXECUTING...</span>
                </>
              ) : evaluation?.success ? (
                <>
                  <CheckCircle size={14} />
                  <span>SYSTEM SECURED</span>
                </>
              ) : (
                <>
                  <Play size={14} className="fill-current" />
                  <span>EXECUTE MISSION</span>
                </>
              )}
            </button>
          </div>
          
          {/* TERMINAL ATTACHED DIRECTLY BELOW */}
          <div className="h-48 border-t border-white/10 shrink-0">
            {/* Override panel class inside Terminal if needed by passing a prop or just letting it render as glass-panel */}
            <div className="h-full w-full bg-black/60">
              <Terminal logs={logs} isEvaluating={isEvaluating} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CASTLE DIAGNOSTICS */}
        <div className="lg:col-span-3 flex flex-col bg-black/60 relative">
          
          {/* Castle Console */}
          <div className="flex-[1.2] min-h-0 shrink-0 border-b border-white/10 bg-black/40 p-4">
             <div className="text-[10px] font-mono text-cyber-light/40 tracking-widest mb-4">
               NODE LAB // INFRASTRUCTURE
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
            <div className="h-32 min-h-0 shrink-0 border-b border-white/10 bg-black/40">
              <LiveSecurityMonitor isConnected={isConnected} events={events} />
            </div>
          )}

          {/* Test Results Console */}
          <div className="flex-1 min-h-0 bg-black/20 p-4">
             <div className="text-[10px] font-mono text-cyber-light/40 tracking-widest mb-4">
               SECURITY DIAGNOSTICS
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
