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
    if (timeRemaining <= 10) return 'var(--accent-rose)';
    if (timeRemaining <= 30) return 'var(--accent-gold)';
    return 'var(--accent-mint)';
  };

  const canSubmit = selectedAnswer && !isSubmitting && !feedback && timeRemaining > 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(45, 42, 74, 0.55)', backdropFilter: 'blur(6px)' }}>
      <div className="clay-panel w-full max-w-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-6 flex items-start justify-between" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <h2 className="text-2xl font-display font-bold mb-2" style={{ color: 'var(--accent-purple)' }}>
              Bounty challenge
            </h2>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <Trophy size={12} />
              Answer to claim a fragment
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="clay-inset p-2 rounded-xl transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Timer */}
        {!feedback && (
          <div className="px-6 pt-4 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold" style={{ color: getTimerColor() }}>
              <Clock size={16} />
              {timeRemaining}s
            </div>
            {timeRemaining <= 10 && (
              <div className="text-xs animate-pulse-fast" style={{ color: 'var(--accent-gold)' }}>
                Time running out
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Question */}
          <div>
            <div className="mb-4">
              <div className="text-xs mb-2 font-semibold" style={{ color: 'var(--text-muted)' }}>
                Question
              </div>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {question}
              </p>
            </div>
          </div>

          {/* Options */}
          {!feedback && (
            <div className="space-y-3">
              <div className="text-xs mb-3 font-semibold" style={{ color: 'var(--text-muted)' }}>
                Select your answer
              </div>

              {options.map((option, idx) => {
                const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D
                const isSelected = selectedAnswer === optionLetter;

                return (
                  <div
                    key={idx}
                    onClick={() => !isSubmitting && setSelectedAnswer(optionLetter)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all text-sm ${
                      isSelected ? 'clay-panel' : 'clay-inset hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-bold w-6 flex-shrink-0" style={{ color: isSelected ? 'var(--accent-purple)' : 'var(--text-muted)' }}>
                        {optionLetter}.
                      </span>
                      <span style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
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
            <div className="p-6 rounded-2xl clay-inset space-y-4">
              <div className="flex items-center gap-3" style={{ color: 'var(--accent-mint)' }}>
                <CheckCircle size={32} />
                <div>
                  <div className="text-xl font-display font-bold">
                    Correct!
                  </div>
                  <div className="text-sm">
                    +{pointsEarned} points
                  </div>
                </div>
              </div>

              {fragment && (
                <div className="p-4 clay-panel rounded-2xl">
                  <div className="text-xs mb-2 font-semibold" style={{ color: 'var(--accent-mint)' }}>
                    Fragment unlocked
                  </div>
                  <div className="text-lg tracking-wide break-all" style={{ color: 'var(--text-primary)' }}>
                    {fragment}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Incorrect Feedback */}
          {feedback === 'incorrect' && (
            <div className="p-6 rounded-2xl clay-inset space-y-4">
              <div className="flex items-center gap-3" style={{ color: 'var(--accent-rose)' }}>
                <XCircle size={32} />
                <div>
                  <div className="text-xl font-display font-bold">
                    Incorrect
                  </div>
                  <div className="text-sm">
                    -5 points
                  </div>
                </div>
              </div>

              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                The answer you selected is incorrect. Review the question and try again!
              </p>
            </div>
          )}

          {/* Timeout Feedback */}
          {feedback === 'timeout' && (
            <div className="p-6 rounded-2xl clay-inset space-y-4">
              <div className="flex items-center gap-3" style={{ color: 'var(--accent-gold)' }}>
                <Clock size={32} />
                <div>
                  <div className="text-xl font-display font-bold">
                    Time's up
                  </div>
                  <div className="text-sm">
                    Bounty expired
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 flex gap-3" style={{ borderTop: '1px solid var(--border-color)' }}>
          {!feedback ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-3 clay-button-secondary text-xs font-bold"
              >
                Close
              </button>

              <button
                onClick={handleSubmitAnswer}
                disabled={!canSubmit}
                className="flex-1 py-3 clay-button font-bold text-xs disabled:opacity-40"
              >
                {isSubmitting ? 'Submitting...' : 'Submit answer'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-3 clay-button-secondary text-xs font-bold"
              >
                Close
              </button>

              {feedback === 'incorrect' && (
                <button
                  onClick={handleRetry}
                  className="flex-1 py-3 clay-button text-xs font-bold"
                >
                  Retry
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
