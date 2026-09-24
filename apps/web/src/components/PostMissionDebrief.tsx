import React, { useState } from 'react';
import { BookOpen, CheckCircle, ArrowRight, XCircle, ShieldCheck } from 'lucide-react';
import type { MissionTeachingContent } from '@node-wars/shared';
import { getMissionIdentity } from '../utils/missionIdentity';

interface PostMissionDebriefProps {
  content: MissionTeachingContent;
  onReviewLesson: () => void;
  onContinue: () => void;
  isFinalMission: boolean;
  nextMissionId?: string;
}

const PostMissionDebrief: React.FC<PostMissionDebriefProps> = ({
  content,
  onReviewLesson,
  onContinue,
  isFinalMission,
  nextMissionId
}) => {
  // Store selected answer index for each question index
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleAnswerSelect = (qIndex: number, optionIndex: number) => {
    if (answers[qIndex] !== undefined) return; // Prevent changing answer
    setAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-4" data-testid="post-mission-debrief">
      <div className="font-display text-2xl font-bold mb-6 pb-4 flex items-center justify-between" style={{ color: 'var(--accent-sky)', borderBottom: '1px solid var(--border-color)' }}>
        <span>BOUNTY COMPLETE</span>
        <div className="flex items-center gap-2 text-sm">
          <ShieldCheck size={18} /> CASTLE ELEMENT RESTORED
        </div>
      </div>

      {content.narrative && (
        <div className="mb-6 rounded-2xl p-4" style={{ backgroundColor: 'rgba(111, 216, 168, 0.08)', border: '1px solid rgba(111, 216, 168, 0.3)' }}>
          <div className="flex items-center gap-2 text-sm font-semibold mb-4 pb-2" style={{ color: 'var(--accent-mint)', borderBottom: '1px solid rgba(111, 216, 168, 0.2)' }}>
            {content.narrative.successMessage}
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs mb-1" style={{ color: 'var(--accent-mint)' }}>Status</div>
              <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{content.narrative.systemStatus}</p>
            </div>
            {content.narrative.nextThreat && (
              <div className="pt-3" style={{ borderTop: '1px solid rgba(111, 216, 168, 0.15)' }}>
                <div className="text-xs mb-1" style={{ color: 'var(--accent-gold)' }}>What's next</div>
                <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{content.narrative.nextThreat}</p>
              </div>
            )}
            {content.narrative.nextObjective && (
              <div className="pt-3" style={{ borderTop: '1px solid rgba(232, 184, 75, 0.15)' }}>
                <div className="text-xs mb-1" style={{ color: 'var(--accent-sky)' }}>Next objective</div>
                <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{content.narrative.nextObjective}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {content.successGuidance && (
        <div className="mb-6 space-y-4">
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>What you built</div>
            <p className="text-xs leading-relaxed clay-inset p-3 rounded-xl" style={{ color: 'var(--text-primary)' }}>
              {content.successGuidance.whatYouDid}
            </p>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Why it matters</div>
            <p className="text-xs leading-relaxed italic px-2" style={{ color: 'var(--text-secondary)' }}>
              {content.successGuidance.whyItWorks}
            </p>
          </div>
        </div>
      )}

      {content.reflection && !content.narrative && (
        <div className="mb-6 space-y-4 clay-inset p-4 rounded-2xl">
          <div>
            <div className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>You learned</div>
            <ul className="space-y-2">
              {content.reflection.whatYouLearned.map((item, i) => (
                <li key={i} className="flex gap-3 text-xs items-start">
                  <div className="mt-0.5" style={{ color: 'var(--accent-mint)' }}>&bull;</div>
                  <span className="leading-relaxed" style={{ color: 'var(--text-primary)' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Why this matters</div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--accent-sky)' }}>
              {content.reflection.whyItMatters}
            </p>
          </div>
          <div className="mt-4 clay-panel p-3 rounded-xl" style={{ borderLeft: '3px solid var(--accent-gold)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--accent-gold)' }}>Reflect</div>
            <p className="text-xs leading-relaxed italic" style={{ color: 'var(--text-primary)' }}>
              "{content.reflection.prompt}"
            </p>
          </div>
        </div>
      )}

      {content.conceptCheck && content.conceptCheck.length > 0 && (
        <div className="mb-8">
          <div className="text-xs mb-4 pb-1" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>Concept check</div>
          <div className="space-y-6">
            {content.conceptCheck.map((q, qIndex) => {
              const selectedAnswer = answers[qIndex];
              const isAnswered = selectedAnswer !== undefined;
              const isCorrect = selectedAnswer === q.correctAnswerIndex;

              return (
                <div key={qIndex} className="clay-inset p-4 rounded-2xl">
                  <p className="text-xs mb-4" style={{ color: 'var(--text-primary)' }}>{q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, optIndex) => {
                      let style: React.CSSProperties = { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' };
                      let clickable = !isAnswered;
                      if (isAnswered) {
                        if (optIndex === q.correctAnswerIndex) {
                          style = { color: 'var(--accent-mint)', backgroundColor: 'rgba(111, 216, 168, 0.1)', border: '1px solid var(--accent-mint)' };
                        } else if (optIndex === selectedAnswer) {
                          style = { color: 'var(--accent-rose)', backgroundColor: 'rgba(224, 124, 155, 0.1)', border: '1px solid var(--accent-rose)' };
                        } else {
                          style = { color: 'var(--text-muted)', backgroundColor: 'transparent', border: '1px solid var(--border-color)' };
                        }
                      }

                      return (
                        <button
                          key={optIndex}
                          disabled={isAnswered}
                          onClick={() => handleAnswerSelect(qIndex, optIndex)}
                          className={`w-full text-left p-3 text-xs rounded-xl transition-all duration-200 ${clickable ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'}`}
                          style={style}
                        >
                          <div className="flex items-start gap-3">
                            <span style={{ color: 'var(--text-muted)' }}>{String.fromCharCode(65 + optIndex)}.</span>
                            <span>{opt}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div className="mt-4 p-3 rounded-xl flex flex-col gap-2" style={{ backgroundColor: isCorrect ? 'rgba(111, 216, 168, 0.08)' : 'rgba(224, 124, 155, 0.08)', borderLeft: `2px solid ${isCorrect ? 'var(--accent-mint)' : 'var(--accent-rose)'}` }}>
                      <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: isCorrect ? 'var(--accent-mint)' : 'var(--accent-rose)' }}>
                        {isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {isCorrect ? 'Correct' : 'Not quite'}
                      </div>
                      <p className="text-xs leading-relaxed italic" style={{ color: 'var(--text-primary)' }}>
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 pt-4 flex flex-col sm:flex-row gap-4 shrink-0" style={{ borderTop: '1px solid var(--border-color)' }}>
        <button
          onClick={onReviewLesson}
          className="clay-button-secondary flex-1 py-3 text-xs flex items-center justify-center gap-2"
        >
          <BookOpen size={14} /> Review lesson
        </button>
        <button
          onClick={onContinue}
          className="clay-button flex-1 py-3 text-xs flex items-center justify-center gap-2"
        >
          {isFinalMission
            ? 'Continue to Showcase'
            : `Next: ${nextMissionId ? getMissionIdentity(nextMissionId).systemName : 'Continue'}`} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default PostMissionDebrief;
