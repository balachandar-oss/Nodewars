import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Bug as BugIcon, Target, Activity, Cpu, Lock } from 'lucide-react';

interface BugCatalog {
  vulnerabilities: Array<{
    id: string;
    title: string;
    concept: string;
    difficulty: string;
    description: string;
  }>;
  targetSystems: string[];
}

interface Bug {
  id: string;
  vulnerabilityType: string;
  targetSystem: string;
  status: string;
  createdAt: string;
}

const BugArchitect = () => {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<BugCatalog | null>(null);
  const [myBugs, setMyBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedVuln, setSelectedVuln] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState<any>(null);
  
  const [gameState, setGameState] = useState<{ phase: string, placementEndsAt: string | null } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      try {
        const catRes = await fetch('http://localhost:3001/api/bugs/catalog', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (catRes.ok) {
          setCatalog(await catRes.json());
        }
        
        const myRes = await fetch('http://localhost:3001/api/bugs/mine', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (myRes.ok) {
          setMyBugs(await myRes.json());
        } else if (myRes.status === 403) {
          setError('BUG ARCHITECT PRIVILEGES REQUIRED');
        }

        const stateRes = await fetch('http://localhost:3001/api/game/state', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (stateRes.ok) {
          const stateData = await stateRes.json();
          setGameState({ phase: stateData.phase, placementEndsAt: stateData.placementEndsAt });
        }
      } catch (err) {
        console.error('Failed to load Bug Architect console', err);
        setError('CONNECTION ERROR');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (gameState?.phase === 'BUG_PLACEMENT' && gameState.placementEndsAt) {
      const endsAt = new Date(gameState.placementEndsAt).getTime();
      
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((endsAt - now) / 1000));
        setTimeLeft(remaining);
        
        if (remaining <= 0 && timerRef.current) {
          clearInterval(timerRef.current);
          setGameState(prev => prev ? { ...prev, phase: 'HUNT' } : null);
        }
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
      
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } else {
      setTimeLeft(null);
    }
  }, [gameState?.phase, gameState?.placementEndsAt]);

  const handleDeploy = async () => {
    const token = localStorage.getItem('token');
    setIsDeploying(true);
    setDeploySuccess(null);
    setError('');

    try {
      const res = await fetch('http://localhost:3001/api/bugs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          vulnerabilityType: selectedVuln,
          targetSystem: selectedTarget,
          configuration: { simulated: true } 
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setDeploySuccess(data);
        setMyBugs([data, ...myBugs]);
        setSelectedVuln('');
        setSelectedTarget('');
      } else {
        setError(data.error || 'Deployment failed');
      }
    } catch (err) {
      setError('Deployment failed');
    } finally {
      setIsDeploying(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center font-mono text-neon-purple animate-pulse">AUTHORIZING ARCHITECT PROTOCOL...</div>;
  }

  if (error && !catalog) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center p-12">
        <ShieldAlert size={64} className="text-neon-red mb-6 animate-pulse" />
        <h2 className="text-2xl font-title text-neon-red mb-2">ACCESS DENIED</h2>
        <p className="font-mono text-white/50 tracking-widest text-sm mb-8">{error}</p>
        <button onClick={() => navigate('/dashboard')} className="cyber-button px-8 py-3 bg-neon-red/10 text-neon-red border-neon-red">
          RETURN TO COMMAND CENTER
        </button>
      </div>
    );
  }

  const bugsRemaining = Math.max(0, 3 - myBugs.length);

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-60px)] -mt-6 p-6 flex flex-col gap-4 animate-slide-in relative z-10">
      
      {/* HEADER */}
      <div className="glass-panel shrink-0 p-6 flex justify-between items-center border-t-2 border-t-neon-purple bg-[#0a0510]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border-2 border-neon-purple flex items-center justify-center bg-neon-purple/10 text-neon-purple">
            <BugIcon size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-title tracking-widest text-white uppercase leading-none">
              OFFENSIVE SECURITY CONSOLE
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 bg-neon-purple animate-pulse"></span>
              <span className="text-[10px] font-mono text-neon-purple tracking-widest uppercase">
                DEFENDER → ATTACKER | EXPLOIT DEPLOYMENT SYSTEM ACTIVE
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-6">
          {gameState?.phase === 'BUG_PLACEMENT' && timeLeft !== null && (
            <div className="text-right bg-neon-amber/20 p-4 border border-neon-amber/50">
              <div className="text-[10px] text-neon-amber font-mono tracking-widest mb-1 uppercase">PLACEMENT WINDOW</div>
              <div className="text-2xl font-bold font-mono text-neon-amber leading-none flex items-center justify-end gap-2">
                <Activity size={20} className="animate-pulse" />
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
          )}
          <div className="text-right bg-black/60 p-4 border border-white/5">
            <div className="text-[10px] text-white/50 font-mono tracking-widest mb-1 uppercase">DEPLOYMENT CAPACITY</div>
            <div className="text-2xl font-bold font-mono text-white leading-none">
              {bugsRemaining} <span className="text-white/30 text-lg">/ 3</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        
        {/* LEFT COL: CONFIGURATION */}
        <div className="lg:col-span-8 glass-panel flex flex-col relative overflow-hidden border-t-2 border-t-white/20 bg-[#0a0510]">
          
          <div className="p-4 border-b border-white/5 bg-black/40 relative z-10 flex items-center justify-between shrink-0">
            <h2 className="text-sm font-title tracking-widest text-white/70">THREAT CONFIGURATION</h2>
            <Target size={16} className="text-white/30" />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-10">
            
            {gameState?.phase !== 'BUG_PLACEMENT' && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center border border-white/10">
                <Lock size={48} className="text-white/20 mb-4" />
                <h3 className="text-xl font-title text-white tracking-widest uppercase mb-2">SYSTEM LOCKED</h3>
                <p className="font-mono text-xs text-white/50 tracking-widest">
                  THREAT DEPLOYMENT IS ONLY AVAILABLE DURING THE BUG PLACEMENT PHASE.
                </p>
                <div className="mt-4 px-4 py-1 bg-white/10 text-[10px] font-mono text-white/70 uppercase tracking-widest border border-white/20">
                  CURRENT PHASE: {gameState?.phase || 'UNKNOWN'}
                </div>
              </div>
            )}
            
            {error && (
              <div className="mb-8 p-4 border border-neon-red text-neon-red bg-neon-red/5 font-mono text-xs flex items-center gap-3">
                <ShieldAlert size={16} className="shrink-0" />
                {error}
              </div>
            )}
            
            {deploySuccess && (
              <div className="mb-8 p-6 border border-neon-red text-neon-red bg-neon-red/5 font-mono space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><BugIcon size={64}/></div>
                <div className="flex items-center gap-2 font-bold mb-4 border-b border-neon-red/20 pb-2">
                  <span className="w-2 h-2 bg-neon-red animate-pulse"></span>
                  THREAT DEPLOYED SUCCESSFULLY
                </div>
                <div className="text-xs space-y-2 relative z-10">
                  <div className="flex justify-between">
                    <span className="text-neon-red/50">TARGET SYSTEM</span> 
                    <span className="text-white text-right">{deploySuccess.targetSystem}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neon-red/50">TARGET TEAM</span> 
                    <span className="text-white text-right">{deploySuccess.targetTeamName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neon-red/50">INCIDENT ID</span> 
                    <span className="text-white/50 text-right">{deploySuccess.id}</span>
                  </div>
                </div>
              </div>
            )}

            {bugsRemaining > 0 ? (
              <div className="space-y-10">
                {/* Vuln Select */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 rounded-full border border-neon-purple text-neon-purple flex items-center justify-center font-mono text-xs">1</div>
                    <label className="font-mono text-xs text-white/70 tracking-widest">SELECT VULNERABILITY PAYLOAD</label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-9">
                    {catalog?.vulnerabilities.map(v => {
                      const isSelected = selectedVuln === v.id;
                      return (
                        <div 
                          key={v.id}
                          onClick={() => setSelectedVuln(v.id)}
                          className={`p-4 border font-mono cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-neon-purple bg-neon-purple/10 shadow-[inset_0_0_15px_rgba(176,38,255,0.15)] scale-[1.02]' 
                              : 'border-white/5 hover:border-white/20 bg-black/40'
                          }`}
                        >
                          <div className={`font-bold text-sm mb-2 uppercase ${isSelected ? 'text-white' : 'text-white/70'}`}>
                            {v.title}
                          </div>
                          <div className="text-[10px] text-white/40 mb-3 leading-relaxed">{v.concept}</div>
                          <div className="flex justify-between items-center text-[9px] uppercase border-t border-white/5 pt-2">
                            <span className="text-white/30">DIFFICULTY</span>
                            <span className={v.difficulty === 'HARD' ? 'text-neon-amber' : 'text-neon-green'}>
                              {v.difficulty}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Target Select */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 rounded-full border border-neon-purple text-neon-purple flex items-center justify-center font-mono text-xs">2</div>
                    <label className="font-mono text-xs text-white/70 tracking-widest">ASSIGN TARGET INFRASTRUCTURE</label>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pl-9">
                    {catalog?.targetSystems.map(sys => {
                      const isSelected = selectedTarget === sys;
                      return (
                        <div 
                          key={sys}
                          onClick={() => setSelectedTarget(sys)}
                          className={`p-3 border font-mono text-[10px] text-center uppercase cursor-pointer transition-all flex flex-col items-center gap-2 ${
                            isSelected 
                              ? 'border-neon-amber bg-neon-amber/10 text-neon-amber shadow-[inset_0_0_10px_rgba(255,170,0,0.2)]' 
                              : 'border-white/5 text-white/50 hover:border-white/20 bg-black/40'
                          }`}
                        >
                          <Cpu size={16} className={isSelected ? 'opacity-100' : 'opacity-30'} />
                          {sys}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center font-mono">
                <Activity size={48} className="text-white/20 mb-6" />
                <div className="text-white/50 mb-2 tracking-widest">MAXIMUM CAPACITY REACHED</div>
                <div className="text-white font-title text-2xl tracking-widest">NO DEPLOYMENTS REMAINING</div>
              </div>
            )}
          </div>
          
          {/* Action Bar */}
          <div className="p-4 border-t border-white/5 bg-black/80 shrink-0 flex justify-end">
            <button 
              onClick={handleDeploy}
              disabled={!selectedVuln || !selectedTarget || isDeploying || bugsRemaining === 0 || gameState?.phase !== 'BUG_PLACEMENT'}
              className={`cyber-button px-10 py-4 font-bold transition-all text-xs tracking-widest ${
                !selectedVuln || !selectedTarget || bugsRemaining === 0 || gameState?.phase !== 'BUG_PLACEMENT'
                  ? 'opacity-50 border-white/10 text-white/30 cursor-not-allowed bg-black'
                  : 'border-neon-red bg-neon-red/10 text-neon-red hover:bg-neon-red/20 shadow-[0_0_15px_rgba(255,0,60,0.2)]'
              }`}
            >
              {isDeploying ? 'DEPLOYING THREAT...' : 'INITIATE THREAT DEPLOYMENT'}
            </button>
          </div>
        </div>

        {/* RIGHT COL: ACTIVE DEPLOYMENTS */}
        <div className="lg:col-span-4 glass-panel flex flex-col relative border-t-2 border-t-neon-red">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] pointer-events-none opacity-30 z-0"></div>
          
          <div className="p-4 border-b border-white/5 bg-black/60 relative z-10 flex items-center justify-between shrink-0">
            <h2 className="text-sm font-title tracking-widest text-white/70">ACTIVE DEPLOYMENTS</h2>
            <Activity size={16} className="text-white/30" />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative z-10 bg-black/20 space-y-4">
            {myBugs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center font-mono text-[10px] text-white/30 border border-white/5 border-dashed p-8 text-center uppercase tracking-widest">
                NO ACTIVE THREATS
              </div>
            ) : (
              myBugs.map(b => (
                <div key={b.id} className="p-4 border border-white/10 bg-black/60 font-mono text-xs relative overflow-hidden">
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-neon-red"></div>
                  
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-[9px] text-white/40 mb-1 tracking-widest">ID: {b.id.substring(0,8)}</div>
                      <div className="text-white font-bold uppercase">{b.vulnerabilityType.replace(/_/g, ' ')}</div>
                    </div>
                    <div className="px-2 py-1 bg-white/5 border border-white/10 text-[9px] text-white/50 tracking-widest uppercase">
                      {b.status}
                    </div>
                  </div>
                  
                  <div className="text-[10px] text-white/60 flex items-center gap-2 border-t border-white/5 pt-2">
                    <Target size={12} className="text-neon-amber" />
                    TARGET: <span className="text-white">{b.targetSystem}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BugArchitect;
