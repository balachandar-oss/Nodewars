import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

  const showMonitor = mission && mission.order >= 6 && progress && progress.status !== 'LOCKED';
  const { isConnected, events } = useGameSocket(!!showMonitor);

  useEffect(() => {
    const fetchMission = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      if (!missionId) {
        return navigate('/dashboard');
      }

      try {
        const [missionRes, progressRes] = await Promise.all([
          fetch(`http://localhost:3001/api/missions/${missionId}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://localhost:3001/api/missions/${missionId}/progress`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (missionRes.ok && progressRes.ok) {
          const missionData = await missionRes.json();
          const progressData = await progressRes.json();
          
          if (progressData.status === 'LOCKED') {
            navigate('/dashboard');
            return;
          }

          // Define solutions for instructors
          const INSTRUCTOR_SOLUTIONS: Record<string, string> = {
            'mission-01': 'const http = require("http");\n\nconst server = http.createServer((req, res) => {\n  res.writeHead(200);\n  res.end("OK");\n});\n\nserver.listen(3000);\n',
            'mission-02': 'const express = require("express");\nconst app = express();\n\napp.use(express.json());\n\napp.get("/door/status", (req, res) => {\n  res.json({ status: "locked" });\n});\n\napp.get("/door/open", (req, res) => {\n  res.json({ status: "open" });\n});\n\napp.post("/door/access", (req, res) => {\n  res.json({ access: "granted" });\n});\n\napp.listen(3001, () => console.log("Smart Door running"));\n',
            'mission-03': 'const express = require("express");\nconst app = express();\n\napp.use((req, res, next) => {\n  req.user = { username: "node_hacker", role: "ADMIN" };\n  next();\n});\n\nconst securityGate = (req, res, next) => {\n  if (!req.user) {\n    return res.status(401).json({ error: "Unauthorized" });\n  }\n  if (req.user.role !== "ADMIN") {\n    return res.status(403).json({ error: "Forbidden" });\n  }\n  next();\n};\n\napp.get("/vault", securityGate, (req, res) => {\n  res.json({ message: "Welcome to the Resource Vault, Admin." });\n});\n\napp.listen(3002);\n',
            'mission-04': 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nconst db = {\n  gold: [],\n  async create(item) { this.gold.push(item); return item; },\n  async find() { return this.gold; },\n  async update(id, data) { return { id, ...data }; },\n  async delete(id) { return true; }\n};\n\napp.post("/vault/gold", async (req, res) => {\n  try {\n    const item = await db.create(req.body);\n    res.json(item);\n  } catch (err) {\n    res.status(500).json({ error: "DB Error" });\n  }\n});\n\napp.get("/vault/gold", async (req, res) => {\n  const items = await db.find();\n  res.json(items);\n});\n\napp.put("/vault/gold/:id", async (req, res) => {\n  const item = await db.update(req.params.id, req.body);\n  res.json(item);\n});\n\napp.delete("/vault/gold/:id", async (req, res) => {\n  await db.delete(req.params.id);\n  res.json({ success: true });\n});\n\napp.listen(3003);\n',
            'mission-05': '// Simulated Asynchronous Systems (Returns Promises)\nfunction authenticatePower() {\n  return new Promise(resolve => setTimeout(() => resolve("AUTH_OK"), 300));\n}\n\nfunction loadResources() {\n  return new Promise(resolve => setTimeout(() => resolve("RES_OK"), 300));\n}\n\nfunction activateSystems() {\n  return new Promise(resolve => setTimeout(() => resolve("SYS_OK"), 300));\n}\n\nasync function startGrid() {\n  try {\n    await authenticatePower();\n    await loadResources();\n    await activateSystems();\n    console.log("Power Grid Online!");\n  } catch (error) {\n    console.error("Startup failed", error);\n  }\n}\n\nstartGrid();\n',
            'mission-06': 'const EventEmitter = require("events");\nconst { Server } = require("socket.io");\n\nconst gameEventBus = new EventEmitter();\n\nconst io = new Server();\n\ngameEventBus.on("PLAYER_ENTERED", (eventData) => {\n  console.log("Player entered:", eventData);\n  if (eventData.teamId) {\n    io.to("team:" + eventData.teamId).emit("game_event", eventData);\n  }\n});\n\nfunction setupSocket(io) {\n  io.on("connection", (socket) => {\n    const teamId = "PRINCES";\n    socket.join("team:" + teamId);\n  });\n}\n\nsetupSocket(io);\n\ngameEventBus.emit("PLAYER_ENTERED", {\n  type: "PLAYER_ENTERED",\n  playerId: "demo_player",\n  teamId: "PRINCES",\n  timestamp: new Date().toISOString()\n});\n',
            'mission-07': 'const express = require("express");\nconst app = express();\n\napp.use((req, res, next) => {\n  req.user = { username: "node_hacker", role: "PLAYER" }; \n  next();\n});\n\nconst securityGate = (req, res, next) => {\n  if (!req.user) {\n    return res.status(401).json({ error: "Unauthorized" });\n  }\n  \n  if (req.user.role !== "ADMIN") {\n    return res.status(403).json({ error: "Forbidden" });\n  }\n  \n  next();\n};\n\napp.get("/admin", securityGate, (req, res) => {\n  res.json({ secret: "FLAG" });\n});\n\napp.listen(3004);\n'
          };

          setMission(missionData);
          setProgress(progressData);
          if (progressData.status === 'INSTRUCTOR_PREVIEW') {
            setCode(INSTRUCTOR_SOLUTIONS[missionData.id] || missionData.starterCode);
          } else {
            setCode(missionData.starterCode);
          }
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
          
          if (progressData.status !== 'LOCKED' && missionData.order >= 6) {
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
      const res = await fetch(`http://localhost:3001/api/missions/${missionId}/run`, {
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

      if (data.success && progress.status !== 'COMPLETE' && progress.status !== 'INSTRUCTOR_PREVIEW') {
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
      if (progress?.status === 'INSTRUCTOR_PREVIEW') {
        const INSTRUCTOR_SOLUTIONS: Record<string, string> = {
          'mission-01': 'const http = require("http");\n\nconst server = http.createServer((req, res) => {\n  res.writeHead(200);\n  res.end("OK");\n});\n\nserver.listen(3000);\n',
          'mission-02': 'const express = require("express");\nconst app = express();\n\napp.use(express.json());\n\napp.get("/door/status", (req, res) => {\n  res.json({ status: "locked" });\n});\n\napp.get("/door/open", (req, res) => {\n  res.json({ status: "open" });\n});\n\napp.post("/door/access", (req, res) => {\n  res.json({ access: "granted" });\n});\n\napp.listen(3001, () => console.log("Smart Door running"));\n',
          'mission-03': 'const express = require("express");\nconst app = express();\n\napp.use((req, res, next) => {\n  req.user = { username: "node_hacker", role: "ADMIN" };\n  next();\n});\n\nconst securityGate = (req, res, next) => {\n  if (!req.user) {\n    return res.status(401).json({ error: "Unauthorized" });\n  }\n  if (req.user.role !== "ADMIN") {\n    return res.status(403).json({ error: "Forbidden" });\n  }\n  next();\n};\n\napp.get("/vault", securityGate, (req, res) => {\n  res.json({ message: "Welcome to the Resource Vault, Admin." });\n});\n\napp.listen(3002);\n',
          'mission-04': 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nconst db = {\n  gold: [],\n  async create(item) { this.gold.push(item); return item; },\n  async find() { return this.gold; },\n  async update(id, data) { return { id, ...data }; },\n  async delete(id) { return true; }\n};\n\napp.post("/vault/gold", async (req, res) => {\n  try {\n    const item = await db.create(req.body);\n    res.json(item);\n  } catch (err) {\n    res.status(500).json({ error: "DB Error" });\n  }\n});\n\napp.get("/vault/gold", async (req, res) => {\n  const items = await db.find();\n  res.json(items);\n});\n\napp.put("/vault/gold/:id", async (req, res) => {\n  const item = await db.update(req.params.id, req.body);\n  res.json(item);\n});\n\napp.delete("/vault/gold/:id", async (req, res) => {\n  await db.delete(req.params.id);\n  res.json({ success: true });\n});\n\napp.listen(3003);\n',
          'mission-05': '// Simulated Asynchronous Systems (Returns Promises)\nfunction authenticatePower() {\n  return new Promise(resolve => setTimeout(() => resolve("AUTH_OK"), 300));\n}\n\nfunction loadResources() {\n  return new Promise(resolve => setTimeout(() => resolve("RES_OK"), 300));\n}\n\nfunction activateSystems() {\n  return new Promise(resolve => setTimeout(() => resolve("SYS_OK"), 300));\n}\n\nasync function startGrid() {\n  try {\n    await authenticatePower();\n    await loadResources();\n    await activateSystems();\n    console.log("Power Grid Online!");\n  } catch (error) {\n    console.error("Startup failed", error);\n  }\n}\n\nstartGrid();\n',
          'mission-06': 'const EventEmitter = require("events");\nconst { Server } = require("socket.io");\n\nconst gameEventBus = new EventEmitter();\n\nconst io = new Server();\n\ngameEventBus.on("PLAYER_ENTERED", (eventData) => {\n  console.log("Player entered:", eventData);\n  if (eventData.teamId) {\n    io.to("team:" + eventData.teamId).emit("game_event", eventData);\n  }\n});\n\nfunction setupSocket(io) {\n  io.on("connection", (socket) => {\n    const teamId = "PRINCES";\n    socket.join("team:" + teamId);\n  });\n}\n\nsetupSocket(io);\n\ngameEventBus.emit("PLAYER_ENTERED", {\n  type: "PLAYER_ENTERED",\n  playerId: "demo_player",\n  teamId: "PRINCES",\n  timestamp: new Date().toISOString()\n});\n',
          'mission-07': 'const express = require("express");\nconst app = express();\n\napp.use((req, res, next) => {\n  req.user = { username: "node_hacker", role: "PLAYER" }; \n  next();\n});\n\nconst securityGate = (req, res, next) => {\n  if (!req.user) {\n    return res.status(401).json({ error: "Unauthorized" });\n  }\n  \n  if (req.user.role !== "ADMIN") {\n    return res.status(403).json({ error: "Forbidden" });\n  }\n  \n  next();\n};\n\napp.get("/admin", securityGate, (req, res) => {\n  res.json({ secret: "FLAG" });\n});\n\napp.listen(3004);\n'
        };
        setCode(INSTRUCTOR_SOLUTIONS[mission.id] || mission.starterCode);
      } else {
        setCode(mission.starterCode);
      }
      setLogs([{ type: 'info', message: 'Code environment reset to original state.' }]);
      setEvaluation(null);
    }
  };

  const handleContinue = () => {
    if (mission && mission.order < 7) {
      navigate(`/lab/mission-0${mission.order + 1}`);
    } else {
      navigate('/dashboard');
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
      case 'mission-02': return 'ROUTING LAYER';
      case 'mission-03': return 'ACCESS CONTROL LAYER';
      case 'mission-04': return 'RESOURCE STORAGE';
      case 'mission-05': return 'ASYNC PROCESSING';
      case 'mission-06': return 'EVENT MONITORING';
      case 'mission-07': return 'CONTROLLED BREACH TEST';
      default: return 'ACTIVE';
    }
  };

  const isMission7 = mission.order === 7;
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
                isFinalMission={mission.order >= 7}
                nextMissionId={`mission-0${mission.order + 1}`}
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
