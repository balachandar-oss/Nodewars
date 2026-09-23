import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, Cpu } from 'lucide-react';
import { API_URL } from '../utils/api';

interface Question {
  id: string;
  question: string;
  options: string;
}

interface Attempt {
  attemptId: string;
  isCompleted: boolean;
  questions: Array<{ question: Question }>;
  score?: number;
  percentage?: number;
  correctAnswers?: number;
}

const Quiz = () => {
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const startQuiz = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
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
          // Already completed
          const res2 = await fetch(`${API_URL}/api/quiz/results`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res2.ok) setResult(await res2.json());
        } else {
          setAttempt(data);
        }
      } catch (err) {
        setError('Connection error');
      }
    };
    startQuiz();
  }, [navigate]);

  const handleSubmit = async () => {
    if (!attempt) return;
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    const formattedAnswers = Object.keys(answers).map(qId => ({
      questionId: qId,
      answer: answers[qId]
    }));

    try {
      const res = await fetch(`${API_URL}/api/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          attemptId: attempt.attemptId,
          answers: formattedAnswers
        })
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (result) {
    return (
      <div className="max-w-4xl mx-auto mt-12 animate-slide-in">
        <div className="clay-panel p-12 flex flex-col items-center text-center">
          <ShieldCheck size={80} style={{ color: 'var(--accent-purple)' }} className="mb-6" />
          <h1 className="text-4xl font-display font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Quiz complete!
          </h1>
          <div className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Here's how you did</div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-lg mb-8">
            <div className="clay-inset p-6">
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Final score</div>
              <div className="text-4xl font-bold" style={{ color: 'var(--accent-gold)' }}>{result.score}</div>
            </div>
            <div className="clay-inset p-6">
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Correct answers</div>
              <div className="text-4xl font-bold" style={{ color: 'var(--accent-mint)' }}>{result.correctAnswers} <span className="text-lg" style={{ color: 'var(--text-muted)' }}>/ {result.totalQuestions}</span></div>
            </div>
          </div>

          <div className="text-2xl mb-10 px-12 py-4 clay-inset" style={{ color: 'var(--text-primary)' }}>
            Grade: <span className="font-bold" style={{ color: 'var(--accent-purple)' }}>{Math.round(result.percentage)}%</span>
          </div>

          <div className="flex gap-4 w-full max-w-lg">
            <button onClick={() => navigate('/dashboard')} className="clay-button-secondary flex-1 py-4 text-sm">
              Dashboard
            </button>
            <button onClick={() => navigate('/leaderboard')} className="clay-button flex-1 py-4 text-sm">
              View leaderboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="max-w-2xl mx-auto p-6 md:p-10 animate-fade-in">
        <div className="skeleton h-8 w-1/3 mb-6"></div>
        <div className="skeleton h-40 mb-6"></div>
        <div className="space-y-3">
          <div className="skeleton h-12"></div>
          <div className="skeleton h-12"></div>
          <div className="skeleton h-12"></div>
          <div className="skeleton h-12"></div>
        </div>
      </div>
    );
  }

  const currentQ = attempt.questions[currentIndex].question;
  let options = [];
  try {
    options = JSON.parse(currentQ.options);
  } catch (e) {}

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col relative z-10 animate-slide-in mt-6">
      <div className="glass-panel shrink-0 p-6 flex justify-between items-center">
        <h2 className="text-xl font-display font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
          <Cpu style={{ color: 'var(--accent-purple)' }} size={24} />
          <div>
            <div>Security Quiz</div>
            <div className="text-xs font-sans font-normal mt-1" style={{ color: 'var(--text-secondary)' }}>Final knowledge check</div>
          </div>
        </h2>
        <div className="chip chip-gold">
          Question {currentIndex + 1} of {attempt.questions.length}
        </div>
      </div>

      <div className="flex-1 glass-panel mt-4 p-10 flex flex-col overflow-y-auto custom-scrollbar">
        <h3 className="text-xl md:text-2xl mb-10 leading-relaxed max-w-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {currentQ.question}
        </h3>

        <div className="space-y-4 flex-1">
          {options.map((opt: string, idx: number) => {
            const isSelected = answers[currentQ.id] === opt;
            return (
              <div
                key={idx}
                onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt }))}
                className={`p-5 rounded-2xl text-sm cursor-pointer transition-all flex items-center gap-4 ${
                  isSelected ? 'clay-panel' : 'clay-inset hover:opacity-80'
                }`}
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
            <button
              onClick={() => setCurrentIndex(c => c + 1)}
              className="clay-button px-10 py-3 text-sm"
            >
              Next question
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(answers).length < attempt.questions.length}
              className="clay-button px-10 py-3 text-sm font-bold disabled:opacity-40"
            >
              {isSubmitting ? 'Submitting...' : 'Submit quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
