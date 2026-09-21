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
        <ShieldAlert size={64} className="text-neon-red mb-4" />
        <h2 className="text-2xl font-title text-neon-red mb-2">ACCESS DENIED</h2>
        <p className="font-mono text-cyber-light">{error}</p>
        <button onClick={() => navigate('/dashboard')} className="mt-8 cyber-button px-6 py-2">
          RETURN TO COMMAND CENTER
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-4xl mx-auto mt-12 animate-slide-in">
        <div className="glass-panel p-12 flex flex-col items-center text-center border-t-2 border-t-neon-blue">
          <ShieldCheck size={80} className="text-neon-blue mb-6" />
          <h1 className="text-4xl font-title text-white tracking-widest uppercase mb-2">
            SECURITY ASSESSMENT COMPLETE
          </h1>
          <div className="font-mono text-xs text-neon-blue tracking-widest uppercase mb-8">EVALUATION FINALIZED</div>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-lg mb-8">
            <div className="bg-black/40 border border-white/5 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-neon-amber"></div>
              <div className="text-[10px] font-mono text-white/50 tracking-widest uppercase mb-2">FINAL SCORE</div>
              <div className="text-4xl font-mono font-bold text-neon-amber">{result.score}</div>
            </div>
            <div className="bg-black/40 border border-white/5 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-neon-green"></div>
              <div className="text-[10px] font-mono text-white/50 tracking-widest uppercase mb-2">SUCCESS RATE</div>
              <div className="text-4xl font-mono font-bold text-neon-green">{result.correctAnswers} <span className="text-lg text-white/30">/ {result.totalQuestions}</span></div>
            </div>
          </div>
          
          <div className="text-2xl font-mono text-white mb-10 border border-white/10 px-12 py-4 bg-black/60 shadow-[inset_0_0_20px_rgba(0,240,255,0.1)]">
            FINAL GRADE: <span className="text-neon-blue font-bold">{Math.round(result.percentage)}%</span>
          </div>

          <div className="flex gap-4 w-full max-w-lg">
            <button onClick={() => navigate('/dashboard')} className="cyber-button flex-1 py-4 text-xs border-white/20 text-white/70 hover:bg-white/5">
              COMMAND CENTER
            </button>
            <button onClick={() => navigate('/leaderboard')} className="cyber-button flex-1 py-4 text-xs border-neon-purple text-neon-purple bg-neon-purple/10 hover:bg-neon-purple/20">
              VIEW LEADERBOARD
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return <div className="text-center font-mono text-neon-blue p-12">INITIALIZING SECURE PROTOCOL...</div>;
  }

  const currentQ = attempt.questions[currentIndex].question;
  let options = [];
  try {
    options = JSON.parse(currentQ.options);
  } catch (e) {}

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col relative z-10 animate-slide-in mt-6">
      <div className="glass-panel shrink-0 p-6 border-t-2 border-t-neon-blue flex justify-between items-center bg-[#0a0510]">
        <h2 className="text-xl font-title text-white tracking-widest flex items-center gap-3">
          <Cpu className="text-neon-blue" size={24} /> 
          <div>
            <div>SECURITY ASSESSMENT</div>
            <div className="text-[10px] font-mono text-neon-blue tracking-widest opacity-70 mt-1">FINAL SYSTEM CHECK</div>
          </div>
        </h2>
        <div className="font-mono text-neon-amber text-sm px-4 py-2 bg-neon-amber/5 border border-neon-amber/20 tracking-widest">
          QUESTION {(currentIndex + 1).toString().padStart(2, '0')} / {attempt.questions.length}
        </div>
      </div>

      <div className="flex-1 glass-panel mt-4 p-10 flex flex-col bg-black/60 overflow-y-auto">
        <h3 className="text-xl md:text-2xl font-mono text-white mb-10 leading-relaxed max-w-3xl">
          {currentQ.question}
        </h3>
        
        <div className="space-y-4 flex-1">
          {options.map((opt: string, idx: number) => {
            const isSelected = answers[currentQ.id] === opt;
            return (
              <div 
                key={idx}
                onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt }))}
                className={`p-5 border font-mono text-sm cursor-pointer transition-all flex items-center gap-4 ${
                  isSelected 
                    ? 'border-neon-blue bg-neon-blue/10 text-white shadow-[inset_0_0_15px_rgba(0,240,255,0.15)]' 
                    : 'border-white/5 text-white/50 hover:bg-white/5 hover:border-white/20 bg-black/40'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border shrink-0 ${isSelected ? 'border-neon-blue bg-neon-blue' : 'border-white/20'}`}></div>
                <span className="leading-relaxed">{opt}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex justify-between items-center shrink-0">
          <button 
            onClick={() => setCurrentIndex(c => Math.max(0, c - 1))}
            disabled={currentIndex === 0}
            className="cyber-button px-8 py-3 disabled:opacity-30 text-white/50 border-white/10 hover:text-white/80 text-xs tracking-widest"
          >
            PREVIOUS
          </button>
          
          {currentIndex < attempt.questions.length - 1 ? (
            <button 
              onClick={() => setCurrentIndex(c => c + 1)}
              className="cyber-button px-10 py-3 text-neon-blue border-neon-blue/50 bg-neon-blue/5 hover:bg-neon-blue/20 text-xs tracking-widest"
            >
              NEXT QUESTION
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(answers).length < attempt.questions.length}
              className={`cyber-button px-10 py-3 font-bold transition-all text-xs tracking-widest ${
                Object.keys(answers).length < attempt.questions.length
                  ? 'opacity-50 border-white/10 text-white/30 cursor-not-allowed bg-black/40'
                  : 'bg-neon-green/10 border-neon-green text-neon-green hover:bg-neon-green/30 shadow-[0_0_15px_rgba(57,255,20,0.2)]'
              }`}
            >
              {isSubmitting ? 'PROCESSING...' : 'SUBMIT ASSESSMENT'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
