import { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, CheckCircle, RotateCcw, Terminal as TerminalIcon, LayoutDashboard } from 'lucide-react';
import Terminal from '../components/Terminal';
import CastlePreview from '../components/CastlePreview';
import HintPanel from '../components/HintPanel';
import TestResults from '../components/TestResults';
import { useGameSocket } from '../hooks/useGameSocket';
import LiveSecurityMonitor from '../components/LiveSecurityMonitor';

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

  const { user } = useOutletContext<{ user: any }>();
  const isDemoRole = user?.role === 'DEMO';
  const showMonitor = mission && mission.order >= 6 && progress && (progress.status !== 'LOCKED' || isDemoRole);
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
            if (!isDemoRole) {
              navigate('/dashboard');
              return;
            }
          }

          setMission(missionData);
          setProgress(progressData);
          setCode(missionData.starterCode);
          setLogs([{ type: 'info', message: 'Mission loaded. Engineering environment ready.' }]);
          setEvaluation(null);
          
          if ((progressData.status !== 'LOCKED' || isDemoRole) && missionData.order >= 6) {
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
      setCode(mission.starterCode);
      setLogs([{ type: 'info', message: 'Code environment reset to original state.' }]);
      setEvaluation(null);
    }
  };

  if (!mission) {
    return <div className="text-white font-mono p-8 animate-pulse text-xs tracking-widest">ESTABLISHING WORKSTATION LINK...</div>;
  }

  const objectives = JSON.parse(mission.objectives || '[]');
  const hints = JSON.parse(mission.hints || '[]');

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] -mt-6 p-6 max-w-[1920px] mx-auto z-10 relative animate-slide-in">
      
      {/* FULL WORKSTATION GRID */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-0 border border-white/10 glass-panel shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* LEFT COLUMN: MISSION CONTROL */}
        <div className="lg:col-span-3 flex flex-col border-r border-white/10 relative overflow-hidden bg-black/60">
          <div className="p-4 border-b border-neon-blue/30 bg-neon-blue/5">
            <h1 className="text-2xl font-title text-white tracking-widest uppercase mb-1">
              MISSION 0{mission.order}
            </h1>
            <h2 className="text-sm font-mono text-neon-blue tracking-widest mb-3 uppercase">
              {mission.title}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 border border-white/5 bg-black/40">
                <div className="text-[9px] font-mono text-white/50 mb-1">XP REWARD</div>
                <div className="text-xs font-mono text-neon-green">+{mission.xpReward} XP</div>
              </div>
              <div className="p-2 border border-white/5 bg-black/40">
                <div className="text-[9px] font-mono text-white/50 mb-1">STATUS</div>
                <div className={`text-xs font-mono ${progress?.status === 'COMPLETE' ? 'text-neon-blue' : 'text-neon-amber animate-pulse'}`}>
                  {progress?.status === 'COMPLETE' ? 'ONLINE' : 'BUILDING'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-6">
            <div>
              <div className="text-cyber-light/40 font-mono text-[10px] tracking-widest mb-3 border-b border-white/10 pb-1">DIRECTIVE</div>
              <p className="text-xs font-mono text-white/80 leading-relaxed uppercase">{mission.description}</p>
            </div>

            <div>
              <div className="text-cyber-light/40 font-mono text-[10px] tracking-widest mb-3 border-b border-white/10 pb-1">TACTICAL TASKS</div>
              <ul className="space-y-2">
                {objectives.map((obj: string, i: number) => {
                  const isChecked = evaluation?.success === true; // Simplified checking for now
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

            <div className="mt-auto">
               <HintPanel hints={hints} />
            </div>
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
               />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Lab;
