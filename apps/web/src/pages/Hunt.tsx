import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crosshair, ShieldAlert, Cpu, AlertTriangle, ShieldCheck, Camera, X, Activity, ListChecks, CheckCircle } from 'lucide-react';
import { useGameState } from '../hooks/useGameState';
import { Scanner } from '@yudiel/react-qr-scanner';
import { API_URL } from '../utils/api';

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
      const res = await fetch(`${API_URL}/api/hunt/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        setError('You are not authorized to view this page.');
        return;
      }
      const data = await res.json();
      if (data.phase !== 'HUNT') {
        setError('The hunt phase is not active right now.');
        return;
      }

      const tRes = await fetch(`${API_URL}/api/hunt/targets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (tRes.ok) {
        setTargets(await tRes.json());
      }
    } catch (err) {
      setError('Connection error. Please try again.');
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
        endpoint = `${API_URL}/api/hunt/targets/${id}/discover`;
      } else if (action === 'solve') {
        endpoint = `${API_URL}/api/hunt/bugs/${id}/solve`;
      } else {
        endpoint = `${API_URL}/api/hunt/bugs/${id}/${action}`;
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
          const detailRes = await fetch(`${API_URL}/api/hunt/bugs/${id}`, {
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
      const detailRes = await fetch(`${API_URL}/api/hunt/bugs/${target.bugId}`, {
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
      const res = await fetch(`${API_URL}/api/castle/scan`, {
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
        setScanError('Camera permission denied');
      } else if (err.name === 'NotFoundError') {
        setScanError('No camera found');
      } else {
        setScanError('Camera error');
      }
    } else {
      setScanError('Camera unavailable');
    }
  };

  if (loading || !gameState) {
    return <div className="p-12 text-center animate-pulse" style={{ color: 'var(--text-secondary)' }}>Loading the hunt...</div>;
  }

  if (gameState.phase !== 'HUNT' && gameState.phase !== 'COMPLETE') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center p-12">
        <ShieldAlert size={64} style={{ color: 'var(--text-muted)' }} className="mb-6" />
        <h1 className="text-4xl font-display font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Hunt hasn't started yet</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Check back once the hunt phase begins. Current phase: {gameState.phase}</p>
        <button onClick={() => navigate('/dashboard')} className="clay-button-secondary px-8 py-3">
          Return to dashboard
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center p-12">
        <ShieldAlert size={64} style={{ color: 'var(--accent-rose)' }} className="mb-6" />
        <h2 className="text-2xl font-display font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Something went wrong</h2>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>{error}</p>
        <button onClick={() => navigate('/dashboard')} className="clay-button-secondary px-8 py-3">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-60px)] -mt-6 p-6 flex flex-col gap-4 animate-slide-in relative z-10">

      {/* HEADER */}
      <div className="glass-panel shrink-0 p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="clay-inset w-12 h-12 rounded-2xl flex items-center justify-center">
            <Crosshair style={{ color: 'var(--accent-purple)' }} size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
              Bug Hunt
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="chip chip-rose">
                Target: {gameState.playerView.targetTeam} infrastructure
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-6 clay-inset px-6 py-3 rounded-2xl">
          <div className="text-right">
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Prince</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{gameState.scoreSummary['PRINCE'] || 0}</div>
          </div>
          <div className="w-px" style={{ backgroundColor: 'var(--border-color)' }}></div>
          <div className="text-left">
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Princess</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{gameState.scoreSummary['PRINCESS'] || 0}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">

        {/* LEFT/CENTER COL: TARGETS */}
        <div className="lg:col-span-7 glass-panel flex flex-col relative overflow-hidden">
          <div className="p-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Opposing infrastructure</h2>
            <button
              onClick={() => setIsScanning(true)}
              className="clay-button-secondary px-4 py-2 text-xs flex items-center gap-2"
            >
              <Camera size={14} /> Scan a code
            </button>
          </div>

          {isScanning && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 animate-slide-in" style={{ backgroundColor: 'rgba(45, 42, 74, 0.75)', backdropFilter: 'blur(8px)' }}>
              <div className="w-full max-w-md space-y-4">
                <div className="text-center text-white mb-4 font-semibold">
                  Connecting to scanner...
                </div>
                <div className="relative overflow-hidden rounded-3xl clay-panel aspect-square">
                  <Scanner
                    onScan={handleQRScan}
                    onError={handleQRError}
                    components={{ finder: false }}
                  />

                  {scanLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-sm font-semibold" style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: 'var(--accent-purple)' }}>
                      <Activity className="animate-spin mb-4" size={32} />
                      Processing...
                    </div>
                  )}
                  {scanError && (
                    <div className="absolute inset-0 flex items-center justify-center flex-col text-center p-4" style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: 'var(--accent-rose)' }}>
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
                    placeholder="Enter code manually"
                    className="clay-inset flex-1 text-sm px-4 py-3 rounded-2xl outline-none"
                    style={{ color: 'var(--text-primary)' }}
                  />
                  <button
                    onClick={handleScan}
                    disabled={scanLoading || !physicalCode}
                    className="clay-button-secondary px-4 py-2 text-sm"
                  >
                    Submit
                  </button>
                </div>

                <button
                  onClick={() => { setIsScanning(false); setScanError(''); }}
                  className="w-full clay-button-secondary py-3 text-sm mt-4"
                >
                  <X size={14} className="inline mr-2 mb-0.5" /> Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar flex flex-col items-center">
            <div className="w-full max-w-lg space-y-4">
              {targets.map(t => {
                let Icon = Cpu;
                let iconColor = 'var(--text-muted)';
                let panelStyle = 'clay-inset';

                if (t.status === 'BUG_DETECTED') {
                  iconColor = 'var(--accent-gold)';
                  Icon = AlertTriangle;
                } else if (t.status === 'UNDER_INVESTIGATION') {
                  iconColor = 'var(--accent-rose)';
                  Icon = ShieldAlert;
                } else if (t.status === 'SECURED') {
                  iconColor = 'var(--accent-mint)';
                  Icon = ShieldCheck;
                }

                const isSelected = selectedTarget?.system === t.system;

                return (
                  <div
                    key={t.system}
                    onClick={() => handleTargetClick(t)}
                    className={`p-4 rounded-2xl transition-all flex items-center justify-between cursor-pointer ${isSelected ? 'clay-panel' : panelStyle + ' hover:opacity-90'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center clay-inset">
                        <Icon size={18} style={{ color: iconColor }} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{t.system}</div>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                          {t.status.replace(/_/g, ' ').toLowerCase()}
                        </div>
                      </div>
                    </div>
                    {isSelected && <div className="w-2 h-2 rounded-full animate-pulse-fast" style={{ backgroundColor: 'var(--accent-purple)' }}></div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COL: ACTIONS */}
        <div className="lg:col-span-5 glass-panel flex flex-col relative">

          <div className="p-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <ListChecks size={16} style={{ color: 'var(--text-secondary)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Actions</h2>
          </div>

          <div className="flex-1 p-8 flex flex-col overflow-y-auto custom-scrollbar">
            {!selectedTarget ? (
              <div className="h-full flex flex-col items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
                <Crosshair size={48} className="mb-6 opacity-50" />
                Select a target to get started
              </div>
            ) : (
              <div className="space-y-8 animate-slide-in h-full flex flex-col">
                <div className="pb-6 text-center" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <h3 className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>{selectedTarget.system}</h3>
                  <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Status: {selectedTarget.status.replace(/_/g, ' ').toLowerCase()}</div>
                </div>

                {selectedTarget.status === 'UNKNOWN' && gameState.phase === 'HUNT' && (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <button
                      onClick={() => handleAction('discover', selectedTarget.system)}
                      disabled={actionLoading}
                      className="clay-button px-8 py-4 w-full max-w-sm text-sm"
                    >
                      {actionLoading ? 'Scanning...' : 'Investigate system'}
                    </button>
                    <p className="text-xs mt-6 text-center max-w-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      Scan this system to reveal any hidden vulnerabilities.
                    </p>
                  </div>
                )}

                {selectedTarget.status === 'BUG_DETECTED' && selectedTarget.bugId && gameState.phase === 'HUNT' && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                    <div className="w-32 h-32 rounded-full flex flex-col items-center justify-center clay-inset">
                      <AlertTriangle size={48} style={{ color: 'var(--accent-gold)' }} />
                    </div>
                    <div>
                      <div className="text-2xl font-display font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>Bug found</div>
                      <div className="text-sm max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>An unauthorized change was found in this system.</div>
                    </div>
                    <button
                      onClick={() => handleAction('claim', selectedTarget.bugId!)}
                      disabled={actionLoading}
                      className="clay-button px-8 py-4 text-sm w-full max-w-sm"
                    >
                      {actionLoading ? 'Claiming...' : 'Claim bug (+10 pts)'}
                    </button>
                  </div>
                )}

                {selectedTarget.status === 'UNDER_INVESTIGATION' && bugDetails && gameState.phase === 'HUNT' && (
                  <div className="flex-1 flex flex-col space-y-6">
                    <div className="p-5 rounded-2xl clay-inset">
                      <div className="flex items-center gap-3 font-bold mb-4" style={{ color: 'var(--accent-rose)' }}>
                        <span className="w-2 h-2 rounded-full animate-pulse-fast" style={{ backgroundColor: 'var(--accent-rose)' }}></span>
                        Security incident
                      </div>
                      <div className="text-xs space-y-2">
                        <div className="flex justify-between pb-1" style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Category</span>
                          <span style={{ color: 'var(--text-primary)' }}>{bugDetails.category}</span>
                        </div>
                        <div className="flex justify-between pb-1" style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Difficulty</span>
                          <span style={{ color: 'var(--text-primary)' }}>{bugDetails.difficulty}</span>
                        </div>
                        <div className="flex justify-between pb-1" style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Vulnerability</span>
                          <span style={{ color: 'var(--text-primary)' }}>{bugDetails.vulnerabilityType.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <label className="block text-xs mb-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Select a fix</label>
                      <div className="grid grid-cols-1 gap-2">
                        {['Authentication', 'Authorization', 'Input Validation', 'Logging'].map(opt => (
                          <div
                            key={opt}
                            onClick={() => setSolveSelection(opt)}
                            className={`p-4 rounded-2xl text-xs cursor-pointer transition-colors flex items-center justify-between ${
                              solveSelection === opt ? 'clay-panel' : 'clay-inset hover:opacity-90'
                            }`}
                            style={{ color: solveSelection === opt ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                          >
                            <span>{opt}</span>
                            {solveSelection === opt && <CheckCircle size={14} style={{ color: 'var(--accent-purple)' }} />}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <button
                        onClick={() => handleAction('solve', selectedTarget.bugId!)}
                        disabled={!solveSelection || actionLoading}
                        className="clay-button w-full py-4 text-sm font-bold disabled:opacity-40"
                      >
                        {actionLoading ? 'Submitting fix...' : 'Deploy fix (+50 pts)'}
                      </button>
                    </div>
                  </div>
                )}

                {selectedTarget.status === 'SECURED' && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-32 h-32 rounded-full flex flex-col items-center justify-center clay-inset">
                      <ShieldCheck size={48} style={{ color: 'var(--accent-mint)' }} />
                    </div>
                    <div>
                      <div className="text-2xl font-display font-bold mb-2" style={{ color: 'var(--accent-mint)' }}>System secured</div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>The vulnerability has been resolved.</div>
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
