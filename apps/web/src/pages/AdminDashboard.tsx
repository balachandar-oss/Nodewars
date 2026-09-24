import React, { useEffect, useState, useRef } from 'react';
import { Play, Square, RotateCcw, Clock, Crown, AlertCircle, Users } from 'lucide-react';
import { API_URL } from '../utils/api';

interface SessionState {
  phase: 'QUIZ_WAITING' | 'QUIZ_ACTIVE' | 'QUIZ_ENDED';
  startTime: string | null;
  endTime: string | null;
}

interface WaitingRoom {
  count: number;
  students: Array<{ username: string; team: string }>;
}

interface TeamResult {
  total: number;
  top10: Array<{ username: string; score: number; percentage: number; teamRank: number }>;
}

interface TeamResults {
  winner: 'PRINCE' | 'PRINCESS' | 'TIE';
  teams: { PRINCE: TeamResult; PRINCESS: TeamResult };
}

const AdminDashboard = () => {
  const [session, setSession] = useState<SessionState | null>(null);
  const [results, setResults] = useState<TeamResults | null>(null);
  const [waitingRoom, setWaitingRoom] = useState<WaitingRoom | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const token = localStorage.getItem('token');

  const fetchState = async () => {
    try {
      const res = await fetch(`${API_URL}/api/quiz-session/state`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setSession(await res.json());
    } catch {
      // ignore, retry on next poll
    }
  };

  const fetchResults = async () => {
    try {
      const res = await fetch(`${API_URL}/api/quiz/team-results`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setResults(await res.json());
    } catch {
      // ignore, retry on next poll
    }
  };

  const fetchWaitingRoom = async () => {
    try {
      const res = await fetch(`${API_URL}/api/quiz-session/waiting-room`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setWaitingRoom(await res.json());
    } catch {
      // ignore, retry on next poll
    }
  };

  useEffect(() => {
    const tick = async () => {
      await fetchState();
      await fetchResults();
      await fetchWaitingRoom();
    };
    tick();
    pollRef.current = setInterval(tick, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!session?.endTime || session.phase !== 'QUIZ_ACTIVE') {
      setSecondsLeft(null);
      return;
    }
    const end = new Date(session.endTime).getTime();
    const update = () => setSecondsLeft(Math.max(0, Math.round((end - Date.now()) / 1000)));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [session?.endTime, session?.phase]);

  const call = async (path: string, confirmMsg?: string) => {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setIsBusy(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/quiz-session/${path}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSession(await res.json());
        setResults(null);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Failed to ${path} quiz`);
      }
    } catch {
      setError('Network error');
    } finally {
      setIsBusy(false);
    }
  };

  const startAgain = async () => {
    if (!confirm('Clear all quiz attempts and start the quiz over from the waiting room?')) return;
    setIsBusy(true);
    setError('');
    try {
      await fetch(`${API_URL}/api/quiz-session/reset`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const res = await fetch(`${API_URL}/api/quiz-session/start`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setSession(await res.json());
        setResults(null);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to start quiz again');
      }
    } catch {
      setError('Network error');
    } finally {
      setIsBusy(false);
    }
  };

  const phase = session?.phase || 'QUIZ_WAITING';
  const phaseLabel = phase === 'QUIZ_WAITING' ? 'Waiting room' : phase === 'QUIZ_ACTIVE' ? 'Quiz active' : 'Quiz ended';
  const phaseChip = phase === 'QUIZ_WAITING' ? 'chip-gold' : phase === 'QUIZ_ACTIVE' ? 'chip-mint' : 'chip-rose';

  const mm = secondsLeft !== null ? Math.floor(secondsLeft / 60).toString().padStart(2, '0') : '--';
  const ss = secondsLeft !== null ? (secondsLeft % 60).toString().padStart(2, '0') : '--';

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="clay-panel p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Quiz status</div>
            <div className="flex items-center gap-3">
              <span className={`chip ${phaseChip} text-sm`}>{phaseLabel}</span>
              {phase === 'QUIZ_ACTIVE' && (
                <span className="chip chip-gold text-sm flex items-center gap-1">
                  <Clock size={12} /> {mm}:{ss}
                </span>
              )}
            </div>
            {error && (
              <div className="text-xs mt-2 flex items-center gap-1" style={{ color: '#c14d72' }}>
                <AlertCircle size={12} /> {error}
              </div>
            )}
          </div>

          <div className="flex gap-3 flex-wrap">
            {phase === 'QUIZ_WAITING' && (
              <button onClick={() => call('start', 'Start the quiz now? This begins the 10-minute timer for everyone waiting.')} disabled={isBusy} className="clay-button px-4 py-2 text-sm flex items-center gap-2">
                <Play size={14} /> Start quiz (10 min)
              </button>
            )}
            {phase === 'QUIZ_ACTIVE' && (
              <button onClick={() => call('end', 'End the quiz now for everyone?')} disabled={isBusy} className="clay-button-secondary px-4 py-2 text-sm flex items-center gap-2" style={{ color: '#c14d72' }}>
                <Square size={14} /> End quiz now
              </button>
            )}
            {phase === 'QUIZ_ENDED' && (
              <button onClick={startAgain} disabled={isBusy} className="clay-button px-4 py-2 text-sm flex items-center gap-2">
                <RotateCcw size={14} /> Start again
              </button>
            )}
            {phase !== 'QUIZ_WAITING' && (
              <button onClick={() => call('reset', 'This clears all quiz attempts and returns to the waiting room. Continue?')} disabled={isBusy} className="clay-button-secondary px-4 py-2 text-sm flex items-center gap-2" style={{ color: '#a87f1e' }}>
                <RotateCcw size={14} /> Reset quiz
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Waiting Room */}
      {phase === 'QUIZ_WAITING' && (
        <div className="clay-panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} style={{ color: 'var(--accent-mint)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Waiting room &mdash; {waitingRoom?.count ?? 0} student{waitingRoom?.count === 1 ? '' : 's'} present
            </span>
          </div>
          {waitingRoom && waitingRoom.count > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto custom-scrollbar">
              {waitingRoom.students.map(s => (
                <div key={s.username} className="text-xs p-2 rounded-xl clay-inset flex flex-col">
                  <span style={{ color: 'var(--text-primary)' }}>{s.username}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{s.team}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>No students have opened the quiz page yet.</div>
          )}
        </div>
      )}

      {/* Team Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(['PRINCE', 'PRINCESS'] as const).map(team => (
          <div key={team} className="clay-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{team} team</span>
              {results?.winner === team && <Crown size={16} style={{ color: 'var(--accent-gold)' }} />}
            </div>
            <div className="text-3xl font-display font-bold" style={{ color: 'var(--accent-purple)' }}>
              {results?.teams[team].total ?? 0}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>total points</div>
          </div>
        ))}
      </div>

      {/* Top 10 per team */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(['PRINCE', 'PRINCESS'] as const).map(team => (
          <div key={team} className="clay-panel p-6">
            <div className="text-xs font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>{team} — Top 10</div>
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {(results?.teams[team].top10 || []).map(p => (
                <div key={p.username} className="flex items-center justify-between text-sm p-2 rounded-xl clay-inset">
                  <span style={{ color: 'var(--text-primary)' }}>#{p.teamRank} {p.username}</span>
                  <span className="font-bold" style={{ color: 'var(--accent-mint)' }}>{p.score}</span>
                </div>
              ))}
              {(!results || results.teams[team].top10.length === 0) && (
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>No completed attempts yet</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
