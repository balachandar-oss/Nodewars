import React, { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, Clock, Trophy } from 'lucide-react';
import { API_URL } from '../utils/api';

interface BountyPopupProps {
  bugId: string;
  question: string;
  options: string[];
  onClose: () => void;
  onCorrect?: (fragment: string, points: number) => void;
  onIncorrect?: (penalty: number) => void;
  timeLimit?: number; // in seconds
}

type FeedbackState = null | 'correct' | 'incorrect' | 'timeout';

const BountyPopup: React.FC<BountyPopupProps> = ({
  bugId,
  question,
  options,
  onClose,
  onCorrect,
  onIncorrect,
  timeLimit = 60
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [fragment, setFragment] = useState('');
  const [pointsEarned, setPointsEarned] = useState(0);

  // Timer effect
  useEffect(() => {
    if (feedback || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setFeedback('timeout');
          setIsSubmitting(false);
          onIncorrect?.(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [feedback, timeRemaining, onIncorrect]);

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) return;

    const token = localStorage.getItem('token');
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/bounties/${bugId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          answer: selectedAnswer,
          timeRemaining
        })
      });

      const data = await res.json();

      if (res.ok && data.isCorrect) {
        setFeedback('correct');
        setFragment(data.fragment || '');
        setPointsEarned(data.points || 10);
        onCorrect?.(data.fragment || '', data.points || 10);
      } else {
        setFeedback('incorrect');
        onIncorrect?.(5); // 5 point penalty
      }
    } catch (err) {
      console.error('Failed to submit answer', err);
      setFeedback('incorrect');
      onIncorrect?.(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setSelectedAnswer(null);
    setFeedback(null);
    setTimeRemaining(timeLimit);
  };

  // Timer color based on remaining time
  const getTimerColor = () => {
    if (timeRemaining <= 10) return 'text-neon-red animate-pulse';
    if (timeRemaining <= 30) return 'text-neon-amber';
    return 'text-neon-green';
  };

  const canSubmit = selectedAnswer && !isSubmitting && !feedback && timeRemaining > 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-panel w-full max-w-2xl border-2 border-neon-blue bg-[#0a0510] relative overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b-2 border-neon-blue bg-black/60 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-title tracking-widest text-neon-blue uppercase mb-2">
              BOUNTY CHALLENGE
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-mono text-neon-blue/70 tracking-widest">
              <Trophy size={12} />
              ANSWER TO CLAIM FRAGMENT
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-white/50 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Timer */}
        {!feedback && (
          <div className="px-6 pt-4 pb-2 flex items-center justify-between">
            <div className={`flex items-center gap-2 font-mono text-sm font-bold ${getTimerColor()}`}>
              <Clock size={16} />
              {timeRemaining}s
            </div>
            {timeRemaining <= 10 && (
              <div className="text-[10px] font-mono text-neon-amber tracking-widest animate-pulse">
                TIME RUNNING OUT
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Question */}
          <div>
            <div className="mb-4">
              <div className="text-[10px] font-mono text-white/40 tracking-widest mb-2 uppercase">
                Question
              </div>
              <p className="text-base leading-relaxed text-white font-mono">
                {question}
              </p>
            </div>
          </div>

          {/* Options */}
          {!feedback && (
            <div className="space-y-3">
              <div className="text-[10px] font-mono text-white/40 tracking-widest mb-3 uppercase">
                Select your answer
              </div>

              {options.map((option, idx) => {
                const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D
                const isSelected = selectedAnswer === optionLetter;

                return (
                  <div
                    key={idx}
                    onClick={() => !isSubmitting && setSelectedAnswer(optionLetter)}
                    className={`p-4 border cursor-pointer transition-all font-mono text-sm ${
                      isSelected
                        ? 'border-neon-blue bg-neon-blue/10 shadow-[inset_0_0_15px_rgba(0,255,255,0.15)]'
                        : 'border-white/10 hover:border-white/30 bg-black/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`font-bold w-6 flex-shrink-0 ${isSelected ? 'text-neon-blue' : 'text-white/50'}`}>
                        {optionLetter}.
                      </span>
                      <span className={isSelected ? 'text-white' : 'text-white/70'}>
                        {option}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Correct Feedback */}
          {feedback === 'correct' && (
            <div className="p-6 border-2 border-neon-green bg-neon-green/10 space-y-4">
              <div className="flex items-center gap-3 text-neon-green">
                <CheckCircle size={32} />
                <div>
                  <div className="text-xl font-title tracking-widest uppercase font-bold">
                    CORRECT!
                  </div>
                  <div className="text-sm font-mono">
                    +{pointsEarned} POINTS
                  </div>
                </div>
              </div>

              {fragment && (
                <div className="p-4 bg-black/40 border border-neon-green/30 rounded-sm">
                  <div className="text-[10px] font-mono text-neon-green/70 tracking-widest mb-2">
                    FLAG FRAGMENT UNLOCKED
                  </div>
                  <div className="font-mono text-white text-lg tracking-wider break-all">
                    {fragment}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Incorrect Feedback */}
          {feedback === 'incorrect' && (
            <div className="p-6 border-2 border-neon-red bg-neon-red/10 space-y-4">
              <div className="flex items-center gap-3 text-neon-red">
                <XCircle size={32} />
                <div>
                  <div className="text-xl font-title tracking-widest uppercase font-bold">
                    INCORRECT
                  </div>
                  <div className="text-sm font-mono">
                    -5 POINTS
                  </div>
                </div>
              </div>

              <p className="text-white/70 font-mono text-sm leading-relaxed">
                The answer you selected is incorrect. Review the question and try again!
              </p>
            </div>
          )}

          {/* Timeout Feedback */}
          {feedback === 'timeout' && (
            <div className="p-6 border-2 border-neon-amber bg-neon-amber/10 space-y-4">
              <div className="flex items-center gap-3 text-neon-amber">
                <Clock size={32} />
                <div>
                  <div className="text-xl font-title tracking-widest uppercase font-bold">
                    TIME'S UP
                  </div>
                  <div className="text-sm font-mono">
                    BOUNTY EXPIRED
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-black/40 flex gap-3">
          {!feedback ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-3 border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition-colors font-mono text-xs tracking-widest uppercase font-bold rounded-sm"
              >
                CLOSE
              </button>

              <button
                onClick={handleSubmitAnswer}
                disabled={!canSubmit}
                className={`flex-1 py-3 font-bold transition-all text-xs tracking-widest uppercase rounded-sm ${
                  canSubmit
                    ? 'border-neon-blue bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 shadow-[0_0_15px_rgba(0,255,255,0.2)]'
                    : 'opacity-50 border-white/10 text-white/30 cursor-not-allowed bg-black'
                }`}
              >
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT ANSWER'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-3 border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition-colors font-mono text-xs tracking-widest uppercase font-bold rounded-sm"
              >
                CLOSE
              </button>

              {feedback === 'incorrect' && (
                <button
                  onClick={handleRetry}
                  className="flex-1 py-3 border border-neon-amber bg-neon-amber/10 text-neon-amber hover:bg-neon-amber/20 font-mono text-xs tracking-widest uppercase font-bold rounded-sm transition-colors shadow-[0_0_15px_rgba(255,170,0,0.2)]"
                >
                  RETRY
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BountyPopup;
