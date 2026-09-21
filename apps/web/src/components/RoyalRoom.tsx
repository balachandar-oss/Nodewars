import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Zap, Trophy, AlertTriangle, CheckCircle, X, Sparkles } from 'lucide-react';
import { useGameState } from '../hooks/useGameState';
import FlagAssembly from './FlagAssembly';
import { API_URL } from '../utils/api';

interface RoyalRoomProps {
  onVictory?: () => void;
}

interface ValidationResponse {
  correct: boolean;
  message: string;
  pointsAwarded?: number;
  pointsDeducted?: number;
}

// Confetti particle component for victory animation
const Confetti: React.FC = () => {
  const confetti = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 1,
    char: ['✨', '★', '◆', '●', '✦'][Math.floor(Math.random() * 5)]
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {confetti.map(particle => (
        <div
          key={particle.id}
          className="absolute animate-confetti text-2xl font-bold"
          style={{
            left: `${particle.left}%`,
            top: '-20px',
            animation: `fall ${particle.duration}s linear ${particle.delay}s forwards`,
            color: ['#39ff14', '#00f0ff', '#ffaa00', '#ff3c38'][Math.floor(Math.random() * 4)]
          }}
        >
          {particle.char}
        </div>
      ))}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes confetti-pulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.2) rotate(180deg); }
        }
      `}</style>
    </div>
  );
};

const RoyalRoom: React.FC<RoyalRoomProps> = ({ onVictory }) => {
  const { gameState } = useGameState();
  // The royal figure being unlocked is the OPPOSING team's monarch:
  // PRINCE-team players unlock the PRINCESS's "Queen"; PRINCESS-team players unlock the PRINCE's "King".
  const homeTeam = gameState?.playerView?.homeTeam;
  const royalTitle = homeTeam === 'PRINCESS' ? 'KING' : homeTeam === 'PRINCE' ? 'QUEEN' : 'ROYAL FIGURE';
  const [flagInput, setFlagInput] = useState('');
  const [isLocked, setIsLocked] = useState(true);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastValidation, setLastValidation] = useState<ValidationResponse | null>(null);
  const [showVictory, setShowVictory] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [flagAssemblyStatus, setFlagAssemblyStatus] = useState<'LOCKED' | 'READY' | 'UNLOCKED'>('LOCKED');

  // Auto-unlock when flag assembly is complete
  useEffect(() => {
    if (flagAssemblyStatus === 'UNLOCKED') {
      setIsLocked(false);
    }
  }, [flagAssemblyStatus]);

  // Fetch current score from game state
  useEffect(() => {
    if (gameState) {
      const myTeam = gameState.playerView.homeTeam;
      const score = gameState.scoreSummary[myTeam] || 0;
      setPlayerScore(score);
    }
  }, [gameState]);

  const handleAttempt = async () => {
    if (!flagInput.trim() || isLocked) return;

    setIsSubmitting(true);
    setLastValidation(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/flags/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ flag: flagInput.toUpperCase().trim() })
      });

      const data: ValidationResponse = await response.json();
      setLastValidation(data);

      if (data.correct) {
        // Victory sequence
        setShowVictory(true);
        setPlayerScore(prev => prev + (data.pointsAwarded || 300));
        onVictory?.();
      } else {
        // Wrong flag - deduct points
        setAttemptCount(prev => prev + 1);
        setPlayerScore(prev => Math.max(0, prev - (data.pointsDeducted || 20)));
        setFlagInput('');
      }
    } catch (err) {
      setLastValidation({
        correct: false,
        message: 'Connection error. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLocked && flagInput.trim()) {
      handleAttempt();
    }
  };

  if (showVictory) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
        <Confetti />

        <div className="glass-panel p-12 border-2 border-neon-green max-w-2xl text-center space-y-8 animate-pulse-slow">
          {/* Victory Animation with Sparkles */}
          <div className="space-y-4 relative">
            <div className="text-6xl mb-4 animate-bounce">
              ✨✨✨
            </div>
            <h1 className="text-5xl font-title tracking-widest text-neon-green glow-text-green mb-2 animate-pulse">
              {royalTitle} UNLOCKED
            </h1>
            <div className="font-mono text-sm text-neon-green tracking-widest font-bold">
              [ FLAG VALIDATION SUCCESSFUL ]
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <Sparkles className="text-neon-green animate-spin" size={32} />
              <Sparkles className="text-neon-blue animate-spin" size={32} style={{animationDirection: 'reverse'}} />
              <Sparkles className="text-neon-amber animate-spin" size={32} />
            </div>
          </div>

          {/* Score Section with Animation */}
          <div className="border-2 border-neon-green/50 bg-gradient-to-br from-neon-green/15 to-neon-blue/15 p-8 space-y-4 shadow-[0_0_30px_rgba(57,255,20,0.3)]">
            <div className="font-mono text-[10px] text-white/50 tracking-widest">
              OPERATION SUMMARY
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-neon-green glow-text-green mb-2 animate-pulse">+300</div>
                <div className="font-mono text-[9px] text-white/40 tracking-widest">ROYAL BONUS</div>
              </div>
              <div className="w-px bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
              <div className="text-center">
                <div className="text-4xl font-bold text-neon-blue mb-2 glow-text-blue animate-pulse">{playerScore}</div>
                <div className="font-mono text-[9px] text-white/40 tracking-widest">TOTAL SCORE</div>
              </div>
            </div>
          </div>

          {/* Achievement Banner */}
          <div className="bg-gradient-to-r from-neon-green/20 to-neon-amber/20 border-2 border-neon-amber/50 p-6 space-y-3 shadow-[0_0_20px_rgba(255,170,0,0.2)]">
            <div className="flex items-center justify-center gap-2 text-neon-amber mb-2">
              <Trophy size={28} className="animate-bounce" />
              <span className="font-title text-xl tracking-widest">ACHIEVEMENT UNLOCKED</span>
              <Trophy size={28} className="animate-bounce" style={{animationDelay: '0.2s'}} />
            </div>
            <div className="font-mono text-xs text-white/70 uppercase leading-relaxed">
              You have successfully unlocked the {royalTitle} and recovered the final flag.
              Your team's tactical excellence is recognized across all operational records.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={() => window.location.href = '/leaderboard'}
              className="cyber-button px-8 py-4 w-full border-2 border-neon-green text-neon-green bg-neon-green/20 hover:bg-neon-green/30 text-lg tracking-widest font-bold shadow-[0_0_20px_rgba(57,255,20,0.2)] transition-all"
            >
              VIEW FINAL LEADERBOARD
            </button>
            <div className="font-mono text-[10px] text-white/40 text-center tracking-widest">
              OPERATION COMPLETE | MISSION STATUS: SUCCESS
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Flag Assembly Component */}
      <FlagAssembly onStatusChange={setFlagAssemblyStatus} />

      {/* Royal Room Door */}
      <div className={`glass-panel border-t-2 transition-all duration-500 ${
        isLocked ? 'border-t-neon-red' : 'border-t-neon-green'
      }`}>
        <div className="p-8 space-y-8">
          {/* Door Visual */}
          <div className="flex justify-center">
            <div className={`relative w-48 h-64 border-4 transition-all duration-500 ${
              isLocked
                ? 'border-neon-red/60 bg-gradient-to-br from-neon-red/5 to-black shadow-[0_0_40px_rgba(255,0,60,0.3)]'
                : 'border-neon-green/60 bg-gradient-to-br from-neon-green/5 to-black shadow-[0_0_40px_rgba(57,255,20,0.3)]'
            }`}>
              {/* Door Frame */}
              <div className="absolute inset-2 border border-white/10"></div>

              {/* Lock/Unlock Icon */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                {isLocked ? (
                  <>
                    <Lock size={64} className="text-neon-red/70 animate-pulse" />
                    <div className="font-mono text-[10px] text-neon-red/50 tracking-widest text-center">
                      {royalTitle}<br/>LOCKED
                    </div>
                  </>
                ) : (
                  <>
                    <Unlock size={64} className="text-neon-green animate-bounce" />
                    <div className="font-mono text-[10px] text-neon-green tracking-widest text-center">
                      UNLOCK THE<br/>{royalTitle}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status Message */}
          {isLocked && (
            <div className="text-center">
              <div className="font-mono text-xs text-neon-red/70 tracking-widest">
                [ {royalTitle} SEALED ] - Collect all flag fragments to unlock the {royalTitle}
              </div>
            </div>
          )}

          {/* Flag Input Section */}
          {!isLocked && (
            <div className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block font-mono text-[10px] text-white/50 mb-2 tracking-widest">
                  ENTER EXACT FLAG
                </label>
                <input
                  type="password"
                  value={flagInput}
                  onChange={e => setFlagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSubmitting}
                  placeholder="••••••••••••••"
                  className="cyber-input w-full font-mono text-sm uppercase bg-black/60 border-neon-green/40 focus:border-neon-green text-center"
                />
              </div>

              {/* Attempt Counter */}
              <div className="text-center">
                <div className="font-mono text-[9px] text-white/40 tracking-widest">
                  ATTEMPTS: {attemptCount} | SCORE: {playerScore}
                </div>
              </div>

              {/* Validation Feedback */}
              {lastValidation && !lastValidation.correct && (
                <div className="bg-neon-red/10 border border-neon-red/40 p-3 flex gap-3 items-start">
                  <AlertTriangle size={18} className="text-neon-red flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-mono text-xs text-neon-red font-bold">VALIDATION FAILED</div>
                    <div className="font-mono text-[9px] text-neon-red/70 mt-1">
                      {lastValidation.message}
                    </div>
                    <div className="font-mono text-[9px] text-neon-red/50 mt-2">
                      -20 POINTS DEDUCTED
                    </div>
                  </div>
                </div>
              )}

              {/* Attempt Button */}
              <button
                onClick={handleAttempt}
                disabled={isSubmitting || !flagInput.trim()}
                className={`cyber-button w-full py-4 text-sm tracking-widest font-bold transition-all flex items-center justify-center gap-2 ${
                  isSubmitting || !flagInput.trim()
                    ? 'border-white/20 text-white/30 cursor-not-allowed'
                    : 'border-neon-green text-neon-green bg-neon-green/10 hover:bg-neon-green/20'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Zap size={16} className="animate-spin" />
                    PROCESSING...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    ATTEMPT UNLOCK
                  </>
                )}
              </button>
            </div>
          )}

          {/* Help Text */}
          {!isLocked && (
            <div className="bg-white/5 border border-white/10 p-4 text-center">
              <div className="font-mono text-[9px] text-white/40 tracking-widest leading-relaxed">
                HINT: The flag is assembled from fragments discovered during previous operations.<br/>
                Each failed attempt costs 20 points. Success awards 300 bonus points.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoyalRoom;
