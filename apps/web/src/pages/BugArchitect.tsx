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
        setError('This feature is not available yet.');
      } else {
        setError('Failed to load your assignment.');
      }
    } catch (err) {
      console.error('Failed to fetch bug assignment', err);
      setError('Connection error. Please try again.');
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
    return <div className="p-12 text-center animate-pulse" style={{ color: 'var(--text-secondary)' }}>Loading your assignment...</div>;
  }

  if (error && !bug) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center p-12">
        <ShieldAlert size={64} style={{ color: 'var(--accent-rose)' }} className="mb-6" />
        <h2 className="text-2xl font-display font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Something went wrong</h2>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>{error}</p>
        <button onClick={() => navigate('/dashboard')} className="clay-button-secondary px-8 py-3">
          Return to dashboard
        </button>
      </div>
    );
  }

  if (!bug) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center p-12">
        <BugIcon size={64} style={{ color: 'var(--text-muted)' }} className="mb-6" />
        <h2 className="text-2xl font-display font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No bug assigned</h2>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Check back once the placement phase begins.</p>
        <button onClick={() => navigate('/dashboard')} className="clay-button-secondary px-8 py-3">
          Return to dashboard
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
      <div className="glass-panel shrink-0 p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="clay-inset w-12 h-12 rounded-2xl flex items-center justify-center">
            <BugIcon size={24} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
              Bug Architect
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="chip chip-purple">
                Bug placement window {huntStatus ? `· ${huntStatus.phase}` : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="clay-inset px-6 py-3 rounded-2xl flex items-center gap-3">
          <Clock size={18} style={{ color: 'var(--accent-gold)' }} />
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              {countdownLabel ? 'Time remaining' : 'Hunt status'}
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {countdownLabel ? countdownLabel : bug.status === 'PLANTED' ? 'Hunt starts soon' : 'Awaiting placement'}
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
