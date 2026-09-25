import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, Clock, Code, BookOpen } from 'lucide-react';
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
  questions: Array<{ question: Question; submittedAnswer?: string | null }>;
}

interface SessionState {
  phase: 'QUIZ_WAITING' | 'QUIZ_ACTIVE' | 'QUIZ_ENDED';
  startTime: string | null;
  endTime: string | null;
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
        // The backend only persists answers on final submit, so mid-quiz
        // progress (before submitting) is restored from localStorage instead -
        // otherwise a reload during the quiz would silently discard everything
        // the student had already picked.
        const restored: Record<string, string> = {};
        data.questions.forEach((q: any) => {
          if (q.submittedAnswer) restored[q.question.id] = q.submittedAnswer;
        });
        try {
          const saved = localStorage.getItem(`quiz-answers-${data.attemptId}`);
          if (saved) Object.assign(restored, JSON.parse(saved));
        } catch {
          // ignore corrupt local data
        }
        if (Object.keys(restored).length > 0) setAnswers(restored);
      }
    } catch {
      setError('Connection error');
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
      // best-effort - the 20 minute deadline is server-authoritative regardless
    }
    try {
      localStorage.removeItem(`quiz-answers-${attempt.attemptId}`);
    } catch {
      // ignore
    }
  };

  // Persist in-progress answers locally so a reload mid-quiz doesn't lose them
  useEffect(() => {
    if (!attempt || submittedRef.current || Object.keys(answers).length === 0) return;
    try {
      localStorage.setItem(`quiz-answers-${attempt.attemptId}`, JSON.stringify(answers));
    } catch {
      // ignore - non-critical
    }
  }, [answers, attempt]);

  // Anti-cheat: if a student leaves this tab/window while actively taking
  // the quiz (e.g. to search something in another tab), their quiz ends
  // immediately via auto-submit, exactly like running out of time.
  useEffect(() => {
    if (!attempt || submittedRef.current) return;

    const handleLeave = () => {
      if (document.hidden && !submittedRef.current) {
        handleSubmit();
      }
    };

    document.addEventListener('visibilitychange', handleLeave);
    window.addEventListener('blur', handleLeave);
    return () => {
      document.removeEventListener('visibilitychange', handleLeave);
      window.removeEventListener('blur', handleLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  // Poll session state only while waiting for the quiz to start
  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      // Once submitted (or actively taking the quiz), there's nothing left for
      // this student to see - no score or leaderboard is ever shown to
      // students, so there's no reason to keep polling after that point.
      if (submittedRef.current || attempt) return;

      const state = await fetchSessionState();
      if (cancelled || !state) return;

      if (state.phase === 'QUIZ_WAITING') {
        fetch(`${API_URL}/api/quiz-session/heartbeat`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {});
      }
      if (state.phase === 'QUIZ_ACTIVE' && !attempt && !submittedRef.current) {
        await startAttempt();
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

  // SUBMITTED - students never see their own score or any leaderboard. Only
  // the admin dashboard shows scores and the team winner.
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <ShieldCheck size={64} style={{ color: 'var(--accent-mint)' }} className="mb-4" />
        <h2 className="text-2xl font-display font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Quiz submitted</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Thanks for playing - results will be announced by your instructor.</p>
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
        <p style={{ color: 'var(--text-secondary)' }}>Results will be announced by your instructor.</p>
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
