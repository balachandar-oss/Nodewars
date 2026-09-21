import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crosshair, ShieldAlert, Cpu, AlertTriangle, ShieldCheck, Camera, X, Activity, Terminal as TerminalIcon, CheckCircle } from 'lucide-react';
import { useGameState } from '../hooks/useGameState';
import { Scanner } from '@yudiel/react-qr-scanner';

interface Target {
  system: string;
  status: string; // UNKNOWN, BUG_DETECTED, UNDER_INVESTIGATION, SECURED
  bugId?: string;
}

const Hunt = () => {
  const navigate = useNavigate();
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);
  const [bugDetails, setBugDetails] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [solveSelection, setSolveSelection] = useState('');
  
  const [physicalCode, setPhysicalCode] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const { gameState } = useGameState();

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      const res = await fetch('http://localhost:3001/api/hunt/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        setError('UNAUTHORIZED');
        return;
      }
      const data = await res.json();
      if (data.phase !== 'HUNT') {
        setError('HUNT PHASE NOT ACTIVE');
        return;
      }

      const tRes = await fetch('http://localhost:3001/api/hunt/targets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (tRes.ok) {
        setTargets(await tRes.json());
      }
    } catch (err) {
      setError('CONNECTION ERROR');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'discover' | 'claim' | 'solve', id: string) => {
    const token = localStorage.getItem('token');
    setActionLoading(true);
    
    try {
      let endpoint = '';
      if (action === 'discover') {
        endpoint = `http://localhost:3001/api/hunt/targets/${id}/discover`;
      } else if (action === 'solve') {
        endpoint = `http://localhost:3001/api/hunt/bugs/${id}/solve`;
      } else {
        endpoint = `http://localhost:3001/api/hunt/bugs/${id}/${action}`;
      }

      const opts: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };

      if (action === 'solve') {
        opts.body = JSON.stringify({ solution: solveSelection });
      }

      const res = await fetch(endpoint, opts);
      if (res.ok) {
        await fetchData();
        if (action === 'claim' || action === 'solve') {
          const detailRes = await fetch(`http://localhost:3001/api/hunt/bugs/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (detailRes.ok) setBugDetails(await detailRes.json());
        }
        if (action === 'solve') {
          setSelectedTarget(null);
          setBugDetails(null);
        }
      } else {
        const errData = await res.json();
        alert(errData.error || 'Action failed');
      }
    } catch (err) {
      alert('Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTargetClick = async (target: Target) => {
    setSelectedTarget(target);
    setBugDetails(null);
    setSolveSelection('');

    if (target.status === 'UNDER_INVESTIGATION' && target.bugId) {
      const token = localStorage.getItem('token');
      const detailRes = await fetch(`http://localhost:3001/api/hunt/bugs/${target.bugId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (detailRes.ok) setBugDetails(await detailRes.json());
    }
  };

  const handleScanRequest = async (codeToScan: string) => {
    if (!codeToScan) return;
    setScanLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('http://localhost:3001/api/castle/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ physicalCode: codeToScan })
      });
      
      const data = await res.json();
      if (res.ok) {
        const t = targets.find(sys => sys.system === data.component.systemId);
        if (t) {
          handleTargetClick(t);
        } else {
          setSelectedTarget({
            system: data.component.systemId,
            status: data.state
          });
        }
        setPhysicalCode('');
        setIsScanning(false);
      } else {
        alert(data.error || 'Scan failed');
      }
    } catch (err) {
      alert('Scan failed');
    } finally {
      setScanLoading(false);
    }
  };

  const handleScan = async () => {
    handleScanRequest(physicalCode);
  };

  const handleQRScan = (detectedCodes: { rawValue: string }[]) => {
    if (scanLoading) return;
    if (detectedCodes.length > 0) {
      const code = detectedCodes[0].rawValue;
      handleScanRequest(code);
    }
  };

  const handleQRError = (err: unknown) => {
    console.error(err);
    if (err instanceof Error) {
      if (err.name === 'NotAllowedError') {
        setScanError('CAMERA PERMISSION DENIED');
      } else if (err.name === 'NotFoundError') {
        setScanError('NO CAMERA FOUND');
      } else {
        setScanError('CAMERA ERROR');
      }
    } else {
      setScanError('CAMERA UNAVAILABLE');
    }
  };

  if (loading || !gameState) {
    return <div className="p-12 text-center font-mono text-neon-blue animate-pulse">ESTABLISHING HUNT UPLINK...</div>;
  }

  if (gameState.phase !== 'HUNT' && gameState.phase !== 'COMPLETE') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center p-12">
        <ShieldAlert size={64} className="text-white/20 mb-6" />
        <h1 className="text-4xl font-title text-white mb-2">TACTICAL SCANNER LOCKED</h1>
        <p className="text-white/50 font-mono tracking-widest text-sm mb-8 uppercase">AWAITING HUNT PHASE AUTHORIZATION. CURRENT: {gameState.phase}</p>
        <button onClick={() => navigate('/dashboard')} className="cyber-button px-8 py-3 bg-white/5">
          RETURN TO COMMAND
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center p-12">
        <ShieldAlert size={64} className="text-neon-red mb-6 animate-pulse" />
        <h2 className="text-2xl font-title text-neon-red mb-2">UPLINK DENIED</h2>
        <p className="font-mono text-white/50 tracking-widest text-sm mb-8">{error}</p>
        <button onClick={() => navigate('/dashboard')} className="cyber-button px-8 py-3 bg-neon-red/10 text-neon-red border-neon-red">
          TERMINATE LINK
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-60px)] -mt-6 p-6 flex flex-col gap-4 animate-slide-in relative z-10">
      
      {/* TACTICAL HEADER */}
      <div className="glass-panel shrink-0 p-6 flex justify-between items-center border-t-2 border-t-neon-blue">
        <div className="flex items-center gap-4">
          <Crosshair className="text-neon-blue" size={32} />
          <div>
            <h1 className="text-2xl font-title tracking-widest text-white uppercase leading-none">
              TACTICAL SCANNER
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 bg-neon-red animate-pulse"></span>
              <span className="text-[10px] font-mono text-neon-red tracking-widest uppercase">
                ENTER THE BREACH | TARGET: {gameState.playerView.targetTeam} INFRASTRUCTURE
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-8 bg-black/60 p-4 border border-white/5">
          <div className="text-right">
            <div className="text-[10px] text-white/50 font-mono tracking-widest mb-1">TEAM OMEGA</div>
            <div className="text-2xl font-bold font-mono text-white leading-none">{gameState.scoreSummary['TEAM OMEGA'] || 0}</div>
          </div>
          <div className="w-px bg-white/10"></div>
          <div className="text-left">
            <div className="text-[10px] text-white/50 font-mono tracking-widest mb-1">TEAM BETA</div>
            <div className="text-2xl font-bold font-mono text-white leading-none">{gameState.scoreSummary['TEAM BETA'] || 0}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        
        {/* LEFT/CENTER COL: TARGET INFRASTRUCTURE MAP & SCANNER */}
        <div className="lg:col-span-7 glass-panel flex flex-col relative overflow-hidden border-t-2 border-t-neon-purple">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] pointer-events-none opacity-30 z-0"></div>
          
          <div className="p-4 border-b border-white/5 bg-black/40 relative z-10 flex justify-between items-center">
            <h2 className="text-sm font-title tracking-widest text-white/70">OPPOSING ARCHITECTURE</h2>
            <button 
              onClick={() => setIsScanning(true)}
              className="cyber-button px-4 py-2 text-[10px] border-neon-blue text-neon-blue bg-neon-blue/10 flex items-center gap-2"
            >
              <Camera size={14} /> PHYSICAL SCAN
            </button>
          </div>

          {isScanning && (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 animate-fade-in">
              <div className="w-full max-w-md space-y-4">
                <div className="text-center font-mono text-neon-blue tracking-widest mb-4">
                  [ ESTABLISHING HARDWARE LINK ]
                </div>
                <div className="relative border-2 border-neon-blue bg-black overflow-hidden rounded aspect-square">
                  <Scanner
                    onScan={handleQRScan}
                    onError={handleQRError}
                    components={{ finder: false }}
                  />
                  
                  {/* Scanner overlay guides */}
                  <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none"></div>
                  <div className="absolute top-1/2 left-0 w-full h-px bg-neon-blue/50 animate-scan pointer-events-none shadow-[0_0_10px_var(--color-neon-blue)]"></div>

                  {scanLoading && (
                    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center font-mono text-neon-blue text-sm">
                      <Activity className="animate-spin mb-4" size={32} />
                      PROCESSING SIGNAL...
                    </div>
                  )}
                  {scanError && (
                    <div className="absolute inset-0 bg-black/90 flex items-center justify-center font-mono text-neon-red flex-col text-center p-4">
                      <AlertTriangle size={32} className="mb-2" />
                      {scanError}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={physicalCode}
                    onChange={e => setPhysicalCode(e.target.value)}
                    placeholder="MANUAL OVERRIDE CODE"
                    className="cyber-input flex-1 font-mono text-xs uppercase bg-black/60"
                  />
                  <button 
                    onClick={handleScan}
                    disabled={scanLoading || !physicalCode}
                    className="cyber-button px-4 py-2 text-xs border-white/40 text-white/70"
                  >
                    OVERRIDE
                  </button>
                </div>
                
                <button 
                  onClick={() => { setIsScanning(false); setScanError(''); }}
                  className="w-full cyber-button py-3 text-xs border-white/20 text-white/50 hover:text-white mt-4"
                >
                  <X size={14} className="inline mr-2 mb-0.5" /> CANCEL LINK
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar flex flex-col items-center">
            <div className="w-full max-w-lg space-y-4">
              {targets.map(t => {
                let stateClass = 'state-locked text-white/30';
                let Icon = Cpu;
                
                if (t.status === 'BUG_DETECTED') {
                  stateClass = 'state-building text-neon-amber bg-neon-amber/5';
                  Icon = AlertTriangle;
                } else if (t.status === 'UNDER_INVESTIGATION') {
                  stateClass = 'state-breached text-neon-red bg-neon-red/5';
                  Icon = ShieldAlert;
                } else if (t.status === 'SECURED') {
                  stateClass = 'state-resolved text-neon-green bg-neon-green/5';
                  Icon = ShieldCheck;
                } else if (t.status === 'UNKNOWN') {
                  stateClass = 'border-white/10 text-white hover:border-white/30 cursor-pointer bg-black/40';
                }

                const isSelected = selectedTarget?.system === t.system;

                return (
                  <div 
                    key={t.system}
                    onClick={() => handleTargetClick(t)}
                    className={`p-4 font-mono transition-all flex items-center justify-between border cursor-pointer ${stateClass} ${isSelected ? 'scale-105 shadow-[0_0_30px_rgba(255,255,255,0.1)] z-10 relative bg-white/5 border-white' : 'opacity-80 hover:opacity-100'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 border flex items-center justify-center ${
                        t.status === 'BUG_DETECTED' ? 'border-neon-amber text-neon-amber' :
                        t.status === 'UNDER_INVESTIGATION' ? 'border-neon-red text-neon-red bg-neon-red/20' :
                        t.status === 'SECURED' ? 'border-neon-green text-neon-green' :
                        'border-white/20 text-white/40'
                      }`}>
                        <Icon size={18} className={t.status === 'UNDER_INVESTIGATION' ? 'animate-pulse' : ''} />
                      </div>
                      <div>
                        <div className="font-bold text-sm tracking-widest">{t.system}</div>
                        <div className="text-[9px] tracking-widest mt-1 opacity-70">
                          {t.status.replace(/_/g, ' ')}
                        </div>
                      </div>
                    </div>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full animate-pulse-fast"></div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COL: ACTION CONSOLE */}
        <div className="lg:col-span-5 glass-panel flex flex-col bg-black/80 border-t-2 border-t-white relative">
          
          <div className="p-4 border-b border-white/5 bg-black/40 flex items-center gap-2">
            <TerminalIcon size={16} className="text-white/50" />
            <h2 className="text-sm font-title tracking-widest text-white/70">ACTION CONSOLE</h2>
          </div>

          <div className="flex-1 p-8 flex flex-col overflow-y-auto custom-scrollbar">
            {!selectedTarget ? (
              <div className="h-full flex flex-col items-center justify-center text-white/20 font-mono text-sm">
                <Crosshair size={48} className="mb-6 opacity-50" />
                AWAITING TARGET SELECTION
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in h-full flex flex-col">
                <div className="border-b border-white/10 pb-6 text-center">
                  <h3 className="text-2xl font-title text-white tracking-widest">{selectedTarget.system}</h3>
                  <div className="font-mono text-[10px] text-white/50 mt-2 tracking-widest">CURRENT STATUS: {selectedTarget.status.replace(/_/g, ' ')}</div>
                </div>

                {selectedTarget.status === 'UNKNOWN' && gameState.phase === 'HUNT' && (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <button 
                      onClick={() => handleAction('discover', selectedTarget.system)}
                      disabled={actionLoading}
                      className="cyber-button px-8 py-4 bg-white/5 hover:bg-white/10 w-full max-w-sm text-sm tracking-widest"
                    >
                      {actionLoading ? 'SCANNING SECTOR...' : 'INVESTIGATE SYSTEM'}
                    </button>
                    <p className="font-mono text-[10px] text-white/40 mt-6 text-center max-w-xs uppercase leading-relaxed">
                      Initiate an active scan of the system architecture to reveal hidden vulnerabilities.
                    </p>
                  </div>
                )}

                {selectedTarget.status === 'BUG_DETECTED' && selectedTarget.bugId && gameState.phase === 'HUNT' && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                    <div className="w-32 h-32 border-2 border-neon-amber rounded-full flex flex-col items-center justify-center bg-neon-amber/5 shadow-[0_0_50px_rgba(255,170,0,0.2)]">
                      <AlertTriangle size={48} className="text-neon-amber animate-pulse" />
                    </div>
                    <div>
                      <div className="font-title text-2xl text-neon-amber mb-2 tracking-widest">ANOMALY DETECTED</div>
                      <div className="font-mono text-xs text-white/60 max-w-xs mx-auto">An unauthorized modification has been located within the infrastructure.</div>
                    </div>
                    <button 
                      onClick={() => handleAction('claim', selectedTarget.bugId!)}
                      disabled={actionLoading}
                      className="cyber-button px-8 py-4 text-sm tracking-widest border-neon-amber text-neon-amber bg-neon-amber/10 w-full max-w-sm"
                    >
                      {actionLoading ? 'SECURING...' : 'CLAIM INCIDENT (+10 PTS)'}
                    </button>
                  </div>
                )}

                {selectedTarget.status === 'UNDER_INVESTIGATION' && bugDetails && gameState.phase === 'HUNT' && (
                  <div className="flex-1 flex flex-col space-y-6">
                    <div className="p-5 border border-neon-red bg-neon-red/10 font-mono relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10"><ShieldAlert size={64}/></div>
                      <div className="flex items-center gap-3 text-neon-red font-bold mb-4">
                        <span className="w-2 h-2 bg-neon-red animate-pulse"></span>
                        SECURITY INCIDENT
                      </div>
                      <div className="text-[10px] space-y-2 relative z-10 tracking-widest">
                        <div className="flex justify-between border-b border-neon-red/20 pb-1">
                          <span className="text-white/50">CATEGORY</span> 
                          <span className="text-white text-right">{bugDetails.category}</span>
                        </div>
                        <div className="flex justify-between border-b border-neon-red/20 pb-1">
                          <span className="text-white/50">DIFFICULTY</span> 
                          <span className="text-white text-right">{bugDetails.difficulty}</span>
                        </div>
                        <div className="flex justify-between border-b border-neon-red/20 pb-1">
                          <span className="text-white/50">VULNERABILITY</span> 
                          <span className="text-white text-right">{bugDetails.vulnerabilityType.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <label className="block font-mono text-[10px] text-white/50 mb-3 tracking-widest uppercase">SELECT REMEDIATION PROTOCOL</label>
                      <div className="grid grid-cols-1 gap-2">
                        {['Authentication', 'Authorization', 'Input Validation', 'Logging'].map(opt => (
                          <div 
                            key={opt}
                            onClick={() => setSolveSelection(opt)}
                            className={`p-4 border font-mono text-xs cursor-pointer transition-colors flex items-center justify-between ${
                              solveSelection === opt ? 'border-neon-blue bg-neon-blue/20 text-white shadow-[inset_0_0_10px_rgba(0,240,255,0.2)]' : 'border-white/10 hover:border-white/30 text-white/60 bg-black/40'
                            }`}
                          >
                            <span className="uppercase">{opt}</span>
                            {solveSelection === opt && <CheckCircle size={14} className="text-neon-blue" />}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                      <button 
                        onClick={() => handleAction('solve', selectedTarget.bugId!)}
                        disabled={!solveSelection || actionLoading}
                        className={`cyber-button w-full py-4 text-sm tracking-widest font-bold transition-all ${
                          !solveSelection
                            ? 'border-white/10 text-white/30 cursor-not-allowed bg-black/40'
                            : 'border-neon-green text-neon-green bg-neon-green/10 hover:bg-neon-green/20'
                        }`}
                      >
                        {actionLoading ? 'PROCESSING PROTOCOL...' : 'DEPLOY FIX (+50 PTS)'}
                      </button>
                    </div>
                  </div>
                )}

                {selectedTarget.status === 'SECURED' && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-32 h-32 border-2 border-neon-green rounded-full flex flex-col items-center justify-center bg-neon-green/5 shadow-[0_0_50px_rgba(57,255,20,0.2)]">
                      <ShieldCheck size={48} className="text-neon-green" />
                    </div>
                    <div>
                      <div className="font-title text-2xl text-neon-green mb-2 tracking-widest">SYSTEM SECURED</div>
                      <div className="font-mono text-xs text-white/50 uppercase tracking-widest">The vulnerability has been resolved.</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hunt;
