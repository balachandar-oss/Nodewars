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
      <div className="text-neon-blue font-title text-xl mb-4 tracking-widest uppercase glow-text-blue border-b border-neon-blue/30 pb-2">
        MISSION COMPLETE // DEBRIEF
      </div>

      {content.narrative && (
        <div className="mb-6 bg-neon-green/5 border border-neon-green/30 p-4">
          <div className="flex items-center gap-2 text-neon-green font-mono text-sm tracking-widest uppercase mb-4 pb-2 border-b border-neon-green/20">
            <ShieldCheck size={18} />
            {content.narrative.successMessage}
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-neon-green/70 font-mono text-[10px] tracking-widest mb-1 uppercase">SYSTEM STATUS</div>
              <p className="text-xs font-mono text-white/90">{content.narrative.systemStatus}</p>
            </div>
            {content.narrative.nextThreat && (
              <div className="pt-3 border-t border-neon-green/10">
                <div className="text-neon-amber/70 font-mono text-[10px] tracking-widest mb-1 uppercase">NEW THREAT</div>
                <p className="text-xs font-mono text-white/90">{content.narrative.nextThreat}</p>
              </div>
            )}
            {content.narrative.nextObjective && (
              <div className="pt-3 border-t border-neon-amber/10">
                <div className="text-neon-blue/70 font-mono text-[10px] tracking-widest mb-1 uppercase">NEXT OBJECTIVE</div>
                <p className="text-xs font-mono text-white/90">{content.narrative.nextObjective}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {content.successGuidance && (
        <div className="mb-6 space-y-4">
          <div>
            <div className="text-cyber-light/50 font-mono text-[10px] tracking-widest mb-1 uppercase">WHAT YOU BUILT</div>
            <p className="text-xs font-mono text-white/90 leading-relaxed bg-white/5 p-3 rounded-sm border-l-2 border-neon-blue">
              {content.successGuidance.whatYouDid}
            </p>
          </div>
          <div>
            <div className="text-cyber-light/50 font-mono text-[10px] tracking-widest mb-1 uppercase">WHY IT MATTERS</div>
            <p className="text-xs font-mono text-white/80 leading-relaxed italic px-2">
              {content.successGuidance.whyItWorks}
            </p>
          </div>
        </div>
      )}

      {content.reflection && !content.narrative && (
        <div className="mb-6 space-y-4 bg-black/40 p-4 border border-white/5">
          <div>
            <div className="text-cyber-light/50 font-mono text-[10px] tracking-widest mb-2 uppercase">WHAT YOU JUST LEARNED</div>
            <ul className="space-y-2">
              {content.reflection.whatYouLearned.map((item, i) => (
                <li key={i} className="flex gap-3 text-xs font-mono items-start">
                  <div className="text-neon-green mt-0.5">■</div>
                  <span className="leading-relaxed text-white/90">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-cyber-light/50 font-mono text-[10px] tracking-widest mb-1 uppercase">WHY THIS MATTERS</div>
            <p className="text-xs font-mono text-neon-blue/80 leading-relaxed">
              {content.reflection.whyItMatters}
            </p>
          </div>
          <div className="mt-4 bg-white/5 p-3 border-l-2 border-neon-amber">
            <div className="text-neon-amber font-mono text-[10px] tracking-widest mb-1 uppercase">REFLECT</div>
            <p className="text-xs font-mono text-white/90 leading-relaxed italic">
              "{content.reflection.prompt}"
            </p>
          </div>
        </div>
      )}

      {content.conceptCheck && content.conceptCheck.length > 0 && (
        <div className="mb-8">
          <div className="text-cyber-light/50 font-mono text-[10px] tracking-widest mb-4 border-b border-white/10 pb-1 uppercase">CONCEPT CHECK</div>
          <div className="space-y-6">
            {content.conceptCheck.map((q, qIndex) => {
              const selectedAnswer = answers[qIndex];
              const isAnswered = selectedAnswer !== undefined;
              const isCorrect = selectedAnswer === q.correctAnswerIndex;

              return (
                <div key={qIndex} className="bg-black/40 p-4 border border-white/5">
                  <p className="text-xs font-mono text-white/90 mb-4">{q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, optIndex) => {
                      let btnClass = "w-full text-left p-3 text-xs font-mono border transition-all duration-200 ";
                      if (!isAnswered) {
                        btnClass += "border-white/10 bg-white/5 hover:border-neon-blue/50 hover:bg-neon-blue/10 text-white/70 hover:text-white cursor-pointer";
                      } else {
                        if (optIndex === q.correctAnswerIndex) {
                          btnClass += "border-neon-green bg-neon-green/10 text-neon-green";
                        } else if (optIndex === selectedAnswer) {
                          btnClass += "border-neon-red bg-neon-red/10 text-neon-red";
                        } else {
                          btnClass += "border-white/5 bg-transparent text-white/30 cursor-not-allowed";
                        }
                      }

                      return (
                        <button
                          key={optIndex}
                          disabled={isAnswered}
                          onClick={() => handleAnswerSelect(qIndex, optIndex)}
                          className={btnClass}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-cyber-light/50">[{String.fromCharCode(65 + optIndex)}]</span>
                            <span>{opt}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div className={`mt-4 p-3 border-l-2 flex flex-col gap-2 ${isCorrect ? 'bg-neon-green/5 border-neon-green' : 'bg-neon-red/5 border-neon-red'}`}>
                      <div className={`flex items-center gap-2 text-xs font-bold font-mono tracking-widest ${isCorrect ? 'text-neon-green' : 'text-neon-red'}`}>
                        {isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {isCorrect ? 'CORRECT' : 'NOT QUITE'}
                      </div>
                      <p className="text-xs font-mono text-white/80 leading-relaxed italic">
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
      <div className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-4 shrink-0">
        <button 
          onClick={onReviewLesson}
          className="flex-1 py-3 border border-neon-blue/30 bg-neon-blue/5 text-neon-blue font-mono text-xs tracking-widest hover:bg-neon-blue/20 transition-colors uppercase flex items-center justify-center gap-2"
        >
          <BookOpen size={14} /> REVIEW LESSON
        </button>
        <button 
          onClick={onContinue}
          className="flex-1 py-3 border border-neon-green/30 bg-neon-green/10 text-neon-green font-mono text-xs tracking-widest hover:bg-neon-green/20 transition-colors uppercase flex items-center justify-center gap-2"
        >
          {isFinalMission 
            ? 'NEXT: QUIZ / BUG ARCHITECT / BUG HUNT' 
            : `NEXT SYSTEM: ${nextMissionId ? getMissionIdentity(nextMissionId).systemName : 'CONTINUE'}`} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default PostMissionDebrief;
