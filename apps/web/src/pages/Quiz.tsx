import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, Clock, Code, BookOpen, Crown } from 'lucide-react';
import { API_URL } from '../utils/api';

interface Question {
  id: string;
  question: string;
  options: string;
  type: 'CODE' | 'THEORY';
}

interface Attempt {
  attemptId: string;
  isCompleted: boolean;
  questions: Array<{ question: Question }>;
}

interface SessionState {
  phase: 'QUIZ_WAITING' | 'QUIZ_ACTIVE' | 'QUIZ_ENDED';
  startTime: string | null;
  endTime: string | null;
}

interface TeamResult {
  total: number;
  top10: Array<{ username: string; score: number; percentage: number; teamRank: number }>;
}

interface TeamResults {
  winner: 'PRINCE' | 'PRINCESS' | 'TIE';
  teams: { PRINCE: TeamResult; PRINCESS: TeamResult };
}

const POLL_MS = 5000;

const Quiz = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionState | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<TeamResults | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittedRef = useRef(false);

  const token = localStorage.getItem('token');

  const fetchSessionState = async (): Promise<SessionState | null> => {
    if (!token) { navigate('/login'); return null; }
    try {
      const res = await fetch(`${API_URL}/api/quiz-session/state`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return null;
      const data = await res.json();
      setSession(data);
      return data;
    } catch {
      return null;
    }
  };

  const startAttempt = async () => {
    try {
      const res = await fetch(`${API_URL}/api/quiz/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to start quiz');
        return;
      }
      if (data.isCompleted) {
        submittedRef.current = true;
        setSubmitted(true);
      } else {
        setAttempt(data);
      }
    } catch {
      setError('Connection error');
    }
  };

  const fetchResults = async () => {
    try {
      const res = await fetch(`${API_URL}/api/quiz/team-results`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setResults(await res.json());
    } catch {
      // ignore, will retry on next poll
    }
  };

  const handleSubmit = async () => {
    if (!attempt || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);

    const formattedAnswers = Object.keys(answers).map(qId => ({ questionId: qId, answer: answers[qId] }));

    try {
      await fetch(`${API_URL}/api/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ attemptId: attempt.attemptId, answers: formattedAnswers })
      });
    } catch {
      // best-effort - the 10 minute deadline is server-authoritative regardless
    }
  };

  // Poll session state until active, then poll for results after submit/end
  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      // Once the attempt is loaded and the student hasn't submitted, they're actively
      // taking the quiz - the local countdown (driven off the server endTime already
      // fetched) is authoritative, so there's no need to keep polling every few
      // seconds for the whole 10-minute window. Resume polling once submitted, to
      // detect QUIZ_ENDED and fetch results.
      if (attempt && !submittedRef.current) return;

      const state = await fetchSessionState();
      if (cancelled || !state) return;

      if (state.phase === 'QUIZ_ACTIVE' && !attempt && !submittedRef.current) {
        await startAttempt();
      }
      if (state.phase === 'QUIZ_ENDED') {
        await fetchResults();
      }
    };

    tick();
    pollRef.current = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Also poll for results right after the student submits, in case others are still finishing
  useEffect(() => {
    if (submitted) fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  // Local countdown driven off the server's endTime
  useEffect(() => {
    if (!session?.endTime || session.phase !== 'QUIZ_ACTIVE') {
      setSecondsLeft(null);
      return;
    }
    const end = new Date(session.endTime).getTime();
    const update = () => {
      const remaining = Math.max(0, Math.round((end - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0 && !submittedRef.current) {
        handleSubmit();
      }
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.endTime, session?.phase]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <ShieldAlert size={64} style={{ color: 'var(--accent-rose)' }} className="mb-4" />
        <h2 className="text-2xl font-display font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Something went wrong</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        <button onClick={() => navigate('/dashboard')} className="mt-8 clay-button px-6 py-3">
          Go back
        </button>
      </div>
    );
  }

  // RESULTS SCREEN - once the session has ended (or this student has submitted and the session ended while waiting)
  if (results) {
    const winner = results.winner;
    const winnerLabel = winner === 'TIE' ? "IT'S A TIE" : `${winner} TEAM WINS`;
    return (
      <div className="max-w-5xl mx-auto mt-8 animate-slide-in pb-10">
        <div className="clay-panel p-10 flex flex-col items-center text-center mb-8">
          <Crown size={64} style={{ color: 'var(--accent-gold)' }} className="mb-4" />
          <h1 className="text-3xl font-display font-bold mb-2 uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>
            {winnerLabel}
          </h1>
          <div className="flex gap-8 mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <div>PRINCE total: <span className="font-bold" style={{ color: 'var(--accent-purple)' }}>{results.teams.PRINCE.total}</span></div>
            <div>PRINCESS total: <span className="font-bold" style={{ color: 'var(--accent-purple)' }}>{results.teams.PRINCESS.total}</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(['PRINCE', 'PRINCESS'] as const).map(team => (
            <div key={team} className="clay-panel p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--accent-gold)' }}>{team} — Top 10</h3>
              <div className="space-y-2">
                {results.teams[team].top10.map(p => (
                  <div key={p.username} className="flex justify-between items-center clay-inset px-3 py-2 rounded-lg text-xs">
                    <span style={{ color: 'var(--text-primary)' }}>#{p.teamRank} {p.username}</span>
                    <span style={{ color: 'var(--accent-mint)' }}>{p.score} pts</span>
                  </div>
                ))}
                {results.teams[team].top10.length === 0 && (
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>No completed attempts yet.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // SUBMITTED - waiting for everyone else / for the admin to end the quiz
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <ShieldCheck size={64} style={{ color: 'var(--accent-mint)' }} className="mb-4" />
        <h2 className="text-2xl font-display font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Quiz submitted</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Waiting for the quiz to end for everyone before showing results...</p>
      </div>
    );
  }

  // WAITING ROOM
  if (!session || session.phase === 'QUIZ_WAITING') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="clay-inset w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <Clock size={32} style={{ color: 'var(--accent-gold)' }} className="animate-pulse" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Waiting room</h2>
        <p style={{ color: 'var(--text-secondary)' }}>The quiz will begin the moment your instructor starts it.</p>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Stay on this page - it checks automatically.</p>
      </div>
    );
  }

  if (session.phase === 'QUIZ_ENDED') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <ShieldAlert size={64} style={{ color: 'var(--accent-rose)' }} className="mb-4" />
        <h2 className="text-2xl font-display font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Quiz has ended</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Loading results...</p>
      </div>
    );
  }

  // ACTIVE, but attempt not loaded yet
  if (!attempt) {
    return (
      <div className="max-w-2xl mx-auto p-6 md:p-10 animate-fade-in">
        <div className="skeleton h-8 w-1/3 mb-6"></div>
        <div className="skeleton h-40 mb-6"></div>
        <div className="space-y-3">
          <div className="skeleton h-12"></div>
          <div className="skeleton h-12"></div>
        </div>
      </div>
    );
  }

  const currentQ = attempt.questions[currentIndex].question;
  let options: string[] = [];
  try {
    options = JSON.parse(currentQ.options);
  } catch {
    // leave empty
  }

  const mm = secondsLeft !== null ? Math.floor(secondsLeft / 60).toString().padStart(2, '0') : '--';
  const ss = secondsLeft !== null ? (secondsLeft % 60).toString().padStart(2, '0') : '--';
  const isUrgent = secondsLeft !== null && secondsLeft <= 60;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col relative z-10 animate-slide-in mt-6">
      <div className="glass-panel shrink-0 p-6 flex justify-between items-center" style={{ borderBottom: '2px solid var(--accent-gold)' }}>
        <h2 className="text-xl font-display font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
          <ShieldAlert style={{ color: 'var(--accent-gold)' }} size={24} />
          <div>
            <div className="uppercase tracking-widest text-lg">Rapid Quiz</div>
            <div className="text-xs font-sans font-normal mt-1 uppercase" style={{ color: 'var(--text-secondary)' }}>Question {currentIndex + 1} of {attempt.questions.length}</div>
          </div>
        </h2>
        <div className="flex items-center gap-3">
          <div className="chip" style={{ color: isUrgent ? 'var(--accent-rose)' : 'var(--accent-gold)' }}>
            <Clock size={12} className="inline mr-1" /> {mm}:{ss}
          </div>
          <div className="chip chip-gold flex items-center gap-1">
            {currentQ.type === 'CODE' ? <Code size={12} /> : <BookOpen size={12} />} {currentQ.type}
          </div>
        </div>
      </div>

      <div className="flex-1 glass-panel mt-4 p-10 flex flex-col overflow-y-auto custom-scrollbar">
        <h3 className="text-xl md:text-2xl mb-10 leading-relaxed max-w-3xl font-semibold whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
          {currentQ.question}
        </h3>

        <div className="space-y-4 flex-1">
          {options.map((opt, idx) => {
            const isSelected = answers[currentQ.id] === opt;
            return (
              <div
                key={idx}
                onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt }))}
                className={`p-5 rounded-2xl text-sm cursor-pointer transition-all flex items-center gap-4 ${isSelected ? 'clay-panel' : 'clay-inset hover:opacity-80'}`}
                style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{
                    border: `2px solid ${isSelected ? 'var(--accent-purple)' : 'var(--border-color)'}`,
                    backgroundColor: isSelected ? 'var(--accent-purple)' : 'transparent'
                  }}
                ></div>
                <span className="leading-relaxed">{opt}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-10 pt-6 flex justify-between items-center shrink-0" style={{ borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setCurrentIndex(c => Math.max(0, c - 1))}
            disabled={currentIndex === 0}
            className="clay-button-secondary px-8 py-3 disabled:opacity-30 text-sm"
          >
            Previous
          </button>

          {currentIndex < attempt.questions.length - 1 ? (
            <button onClick={() => setCurrentIndex(c => c + 1)} className="clay-button px-10 py-3 text-sm">
              Next question
            </button>
          ) : (
            <button onClick={handleSubmit} className="clay-button px-10 py-3 text-sm font-bold">
              Submit quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
