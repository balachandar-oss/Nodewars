import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Bug as BugIcon, Clock } from 'lucide-react';
import BugArchitectPanel, { type BugAssignment } from '../components/BugArchitectPanel';
import { API_URL } from '../utils/api';

interface HuntStatus {
  phase: string;
  placementEndsAt?: string;
}

const BugArchitect = () => {
  const navigate = useNavigate();
  const [bug, setBug] = useState<BugAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [huntStatus, setHuntStatus] = useState<HuntStatus | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [now, setNow] = useState(Date.now());

  const fetchAssignment = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/bugs/my-assignment`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 403) {
        navigate('/dashboard');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setBug(data);
        setError('');
      } else if (res.status === 404) {
        setError('BUG ARCHITECT ROUTE NOT YET AVAILABLE');
      } else {
        setError('FAILED TO LOAD ASSIGNMENT');
      }
    } catch (err) {
      console.error('Failed to fetch bug assignment', err);
      setError('CONNECTION ERROR');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchHuntStatus = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/hunt/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHuntStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch hunt status', err);
    }
  }, []);

  useEffect(() => {
    fetchAssignment();
    fetchHuntStatus();

    pollRef.current = setInterval(() => {
      fetchHuntStatus();
      setNow(Date.now());
    }, 4000);

    const tickRef = setInterval(() => setNow(Date.now()), 1000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      clearInterval(tickRef);
    };
  }, [fetchAssignment, fetchHuntStatus]);

  const handlePlanted = (updated: BugAssignment) => {
    setBug(updated);
  };

  if (loading) {
    return <div className="p-12 text-center font-mono text-neon-purple animate-pulse">AUTHORIZING ARCHITECT PROTOCOL...</div>;
  }

  if (error && !bug) {
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

  if (!bug) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center p-12">
        <BugIcon size={64} className="text-white/20 mb-6" />
        <h2 className="text-2xl font-title text-white/50 mb-2">NO BUG ASSIGNED</h2>
        <p className="font-mono text-white/40 tracking-widest text-sm mb-8">CHECK BACK WHEN THE PLACEMENT PHASE BEGINS.</p>
        <button onClick={() => navigate('/dashboard')} className="cyber-button px-8 py-3 bg-white/5">
          RETURN TO COMMAND CENTER
        </button>
      </div>
    );
  }

  let countdownLabel: string | null = null;
  if (huntStatus?.placementEndsAt) {
    const endsAt = new Date(huntStatus.placementEndsAt).getTime();
    const remainingMs = endsAt - now;
    if (remainingMs > 0) {
      const totalSeconds = Math.floor(remainingMs / 1000);
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      countdownLabel = `${mins}:${secs.toString().padStart(2, '0')}`;
    } else {
      countdownLabel = '0:00';
    }
  }

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
                DEFENDER → ATTACKER | BUG PLACEMENT WINDOW {huntStatus ? `| PHASE: ${huntStatus.phase}` : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right bg-black/60 p-4 border border-white/5 flex items-center gap-3">
          <Clock size={18} className="text-neon-amber" />
          <div>
            <div className="text-[10px] text-white/50 font-mono tracking-widest mb-1 uppercase">
              {countdownLabel ? 'TIME REMAINING' : 'HUNT STATUS'}
            </div>
            <div className="text-2xl font-bold font-mono text-white leading-none">
              {countdownLabel ? countdownLabel : bug.status === 'PLANTED' ? 'HUNT STARTS SOON' : 'AWAITING PLACEMENT'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <BugArchitectPanel bug={bug} onPlanted={handlePlanted} />
      </div>
    </div>
  );
};

export default BugArchitect;
