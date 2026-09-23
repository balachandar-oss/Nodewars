import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Square, RotateCcw, Eye, EyeOff, Users, Bug, Lock, MapPin, Activity, AlertCircle, Crown } from 'lucide-react';
import { useAdminGameState } from '../hooks/useAdminGameState';
import { API_URL } from '../utils/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { gameState, loading, error } = useAdminGameState();
  const [showScores, setShowScores] = useState(false);
  const [gameCountdown, setGameCountdown] = useState<number | null>(null);
  const [events, setEvents] = useState<Array<{ id: string; type: string; message: string; timestamp: string }>>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isAdvancingPhase, setIsAdvancingPhase] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  // Simulate countdown timer
  useEffect(() => {
    if (gameState?.phase === 'ENGINEERING' && gameState?.countdownSeconds) {
      setGameCountdown(gameState.countdownSeconds);
      const timer = setInterval(() => {
        setGameCountdown(prev => prev && prev > 0 ? prev - 1 : null);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState?.phase, gameState?.countdownSeconds]);

  const handleStartGame = async () => {
    setIsStarting(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/api/admin/game/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ countdownSeconds: 180 }) // 3 minutes default
      });

      if (res.ok) {
        addEvent('GAME_START', 'Game countdown initiated (3 minutes)');
        setGameCountdown(180);
      } else {
        addEvent('ERROR', 'Failed to start game');
      }
    } catch (err) {
      addEvent('ERROR', 'Network error when starting game');
    } finally {
      setIsStarting(false);
    }
  };

  const handleStartPlacement = async () => {
    setIsAdvancingPhase(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/api/admin/game/start-placement`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        addEvent('PHASE_CHANGE', 'Bug placement phase started - architects may now plant bugs');
      } else {
        const data = await res.json().catch(() => ({}));
        addEvent('ERROR', data.error || 'Failed to start bug placement');
      }
    } catch (err) {
      addEvent('ERROR', 'Network error when starting bug placement');
    } finally {
      setIsAdvancingPhase(false);
    }
  };

  const handleStartHunt = async () => {
    setIsAdvancingPhase(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/api/admin/game/start-hunt`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        addEvent('PHASE_CHANGE', 'Hunt phase started - players may now hunt for bugs');
      } else {
        const data = await res.json().catch(() => ({}));
        addEvent('ERROR', data.error || 'Failed to start hunt');
      }
    } catch (err) {
      addEvent('ERROR', 'Network error when starting hunt');
    } finally {
      setIsAdvancingPhase(false);
    }
  };

  const handleEndGame = async () => {
    if (!confirm('Are you sure you want to end the game?')) return;

    setIsEnding(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/api/admin/game/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        addEvent('GAME_END', 'Game ended by administrator');
      } else {
        addEvent('ERROR', 'Failed to end game');
      }
    } catch (err) {
      addEvent('ERROR', 'Network error when ending game');
    } finally {
      setIsEnding(false);
    }
  };

  const handleRestartGame = async () => {
    if (!confirm('This resets all scores, bug statuses, and Royal Room progress, and returns to the lab phase. Continue?')) return;

    setIsRestarting(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/api/admin/game/restart`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setShowScores(false);
        setGameCountdown(null);
        addEvent('GAME_RESTART', 'Game restarted - scores, bugs, and Royal Room progress reset');
      } else {
        const data = await res.json().catch(() => ({}));
        addEvent('ERROR', data.error || 'Failed to restart game');
      }
    } catch (err) {
      addEvent('ERROR', 'Network error when restarting game');
    } finally {
      setIsRestarting(false);
    }
  };

  const handleRevealScores = async () => {
    setIsRevealing(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/api/admin/game/reveal-scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        setShowScores(true);
        addEvent('SCORES_REVEALED', 'Scores revealed. Top 5 players per team become Bug Architects');
      } else {
        addEvent('ERROR', 'Failed to reveal scores');
      }
    } catch (err) {
      addEvent('ERROR', 'Network error when revealing scores');
    } finally {
      setIsRevealing(false);
    }
  };

  const addEvent = (type: string, message: string) => {
    const newEvent = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setEvents(prev => [newEvent, ...prev.slice(0, 49)]);
  };

  const getPhaseLabel = (phase?: string): string => {
    switch (phase) {
      case 'ENGINEERING': return 'Lab in progress';
      case 'BUG_PLACEMENT': return 'Bug placement';
      case 'HUNT': return 'Hunt active';
      case 'COMPLETE': return 'Game complete';
      case 'ENDED': return 'Game ended';
      default: return 'Unknown';
    }
  };

  const getPhaseChipClass = (phase?: string): string => {
    switch (phase) {
      case 'ENGINEERING': return 'chip-gold';
      case 'BUG_PLACEMENT': return 'chip-purple';
      case 'HUNT': return 'chip-mint';
      case 'COMPLETE': return 'chip-rose';
      case 'ENDED': return 'chip-rose';
      default: return 'chip-purple';
    }
  };

  const topPlayers = gameState?.players
    .sort((a, b) => b.score - a.score)
    .slice(0, 10) || [];

  const bugArchitects = gameState?.players
    .filter(p => p.isBugArchitect)
    .sort((a, b) => b.score - a.score) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ color: 'var(--text-secondary)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--accent-purple) transparent var(--accent-purple) var(--accent-purple)' }}></div>
          <p className="font-semibold">Loading game state...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ color: '#c14d72' }}>
        <div className="text-center">
          <AlertCircle size={32} className="mx-auto mb-4" />
          <p className="font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="clay-panel p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Game status</div>
            <div className="flex items-center gap-3">
              <span className={`chip ${getPhaseChipClass(gameState?.phase)} text-sm`}>
                {getPhaseLabel(gameState?.phase)}
              </span>
              {gameCountdown && (
                <span className="chip chip-gold text-sm">
                  {Math.floor(gameCountdown / 60)}:{(gameCountdown % 60).toString().padStart(2, '0')}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            {(!gameState?.phase || gameState?.phase === 'ENGINEERING') && (
              <button
                onClick={handleStartGame}
                disabled={isStarting}
                className="clay-button px-4 py-2 text-sm flex items-center gap-2"
              >
                <Play size={14} />
                {gameState?.countdownSeconds ? 'Restart timer' : 'Start game'}
              </button>
            )}
            {gameState?.phase === 'ENGINEERING' && (
              <button
                onClick={handleStartPlacement}
                disabled={isAdvancingPhase}
                className="clay-button px-4 py-2 text-sm flex items-center gap-2"
              >
                <Play size={14} />
                Start bug placement
              </button>
            )}
            {gameState?.phase === 'BUG_PLACEMENT' && (
              <button
                onClick={handleStartHunt}
                disabled={isAdvancingPhase}
                className="clay-button px-4 py-2 text-sm flex items-center gap-2"
              >
                <Play size={14} />
                Start hunt
              </button>
            )}
            {(gameState?.phase === 'ENGINEERING' || gameState?.phase === 'BUG_PLACEMENT' || gameState?.phase === 'HUNT') && (
              <button
                onClick={handleEndGame}
                disabled={isEnding}
                className="clay-button-secondary px-4 py-2 text-sm flex items-center gap-2"
                style={{ color: '#c14d72' }}
              >
                <Square size={14} />
                End game
              </button>
            )}
            {(gameState?.phase === 'ENDED' || gameState?.phase === 'COMPLETE') && (
              <button
                onClick={handleRestartGame}
                disabled={isRestarting}
                className="clay-button-secondary px-4 py-2 text-sm flex items-center gap-2"
                style={{ color: '#a87f1e' }}
              >
                <RotateCcw size={14} />
                Restart game
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Player Stats & Management */}
        <div className="lg:col-span-1 space-y-6">
          {/* Teams Summary */}
          <div className="clay-panel p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} style={{ color: 'var(--accent-sky)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Team overview</span>
            </div>
            <div className="space-y-3">
              {(() => {
                const teams = gameState?.teams || [];
                const maxScore = teams.length ? Math.max(...teams.map(t => t.huntScore)) : -1;
                const isTie = teams.length > 1 && teams.filter(t => t.huntScore === maxScore).length === teams.length;
                return teams.map(team => {
                  const isLeader = gameState?.phase === 'HUNT' || gameState?.phase === 'ENDED' || gameState?.phase === 'COMPLETE'
                    ? team.huntScore === maxScore && maxScore > 0 && !isTie
                    : false;
                  return (
                    <div
                      key={team.id}
                      className={`flex justify-between items-center text-sm p-3 rounded-2xl ${isLeader ? 'clay-inset' : ''}`}
                      style={isLeader ? { boxShadow: 'inset 4px 4px 10px rgba(232, 184, 75, 0.25), inset -4px -4px 10px rgba(255, 255, 255, 0.7)' } : undefined}
                    >
                      <span className="flex items-center gap-2 font-semibold" style={{ color: isLeader ? '#a87f1e' : 'var(--text-primary)' }}>
                        {isLeader && <Crown size={14} style={{ color: 'var(--accent-gold)' }} />} {team.name}
                      </span>
                      <div className="flex gap-2 items-center">
                        <span className="chip chip-purple">{team.totalPlayers} players</span>
                        <span className="chip chip-mint">Score {team.huntScore}</span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Bug Stats */}
          <div className="clay-panel p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bug size={16} style={{ color: 'var(--accent-mint)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Bug tracking</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: 'var(--text-primary)' }}>Planted</span>
                <span className="font-bold" style={{ color: 'var(--accent-purple)' }}>{gameState?.bugStats.planted || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: 'var(--text-primary)' }}>Discovered</span>
                <span className="font-bold" style={{ color: 'var(--accent-gold)' }}>{gameState?.bugStats.discovered || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: 'var(--text-primary)' }}>Solved</span>
                <span className="font-bold" style={{ color: 'var(--accent-mint)' }}>{gameState?.bugStats.solved || 0}</span>
              </div>
            </div>
          </div>

          {/* Royal Room */}
          <div className="clay-panel p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={16} style={{ color: 'var(--accent-rose)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Royal room</span>
            </div>
            <div className="text-3xl font-display font-bold" style={{ color: 'var(--accent-rose)' }}>
              {gameState?.royalRoomAttempts || 0}
            </div>
            <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Unlock attempts</div>
          </div>
        </div>

        {/* Center: Score Management & Leaderboard */}
        <div className="lg:col-span-1 space-y-6">
          {/* Score Management */}
          <div className="clay-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {showScores ? <Eye size={16} style={{ color: 'var(--accent-mint)' }} /> : <EyeOff size={16} style={{ color: 'var(--accent-gold)' }} />}
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Score status</span>
              </div>
              <span className={`chip ${showScores ? 'chip-mint' : 'chip-gold'}`}>
                {showScores ? 'Revealed' : 'Hidden'}
              </span>
            </div>
            <button
              onClick={handleRevealScores}
              disabled={isRevealing || showScores}
              className={showScores ? 'w-full clay-button-secondary py-3 text-sm flex items-center justify-center gap-2' : 'w-full clay-button py-3 text-sm flex items-center justify-center gap-2'}
            >
              <Eye size={14} />
              {showScores ? 'Scores revealed' : 'Reveal scores'}
            </button>
            {showScores && (
              <div className="text-xs mt-3 pt-3" style={{ color: 'var(--accent-mint)', borderTop: '1px solid var(--border-color)' }}>
                Top 5 per team assigned as Bug Architects
              </div>
            )}
          </div>

          {/* Top Players */}
          <div className="clay-panel p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} style={{ color: 'var(--accent-purple)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Top 10 players</span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {topPlayers.map((player, idx) => (
                <div key={player.id} className="flex items-center justify-between text-sm p-2 rounded-xl clay-inset">
                  <div className="flex items-center gap-2">
                    <span className="font-bold w-6" style={{ color: 'var(--accent-gold)' }}>#{idx + 1}</span>
                    <div>
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{player.username}</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{player.teamName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {player.isBugArchitect && (
                      <div className="chip chip-gold mb-1">Architect</div>
                    )}
                    <div className="font-bold" style={{ color: 'var(--accent-mint)' }}>{player.score}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Events & Bug Architects */}
        <div className="lg:col-span-1 space-y-6">
          {/* Bug Architects */}
          {showScores && (
            <div className="clay-panel p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bug size={16} style={{ color: 'var(--accent-gold)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Bug architects</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {bugArchitects.map((player) => (
                  <div key={player.id} className="text-sm p-2 rounded-xl clay-inset">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold" style={{ color: 'var(--accent-gold)' }}>{player.username}</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{player.teamName}</div>
                      </div>
                      <div className="font-bold" style={{ color: 'var(--accent-mint)' }}>{player.score}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Events */}
          <div className="clay-panel p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} style={{ color: 'var(--accent-sky)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Live events</span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar text-xs">
              {events.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)' }}>No events yet</div>
              ) : (
                events.map(event => (
                  <div key={event.id} className="flex gap-2 p-1" style={{ color: event.type === 'ERROR' ? '#c14d72' : event.type === 'SCORES_REVEALED' ? 'var(--accent-mint)' : 'var(--accent-purple)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{event.timestamp}</span>
                    <span>{event.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Player Grid with Positions */}
      {gameState?.players && gameState.players.length > 0 && (
        <div className="clay-panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={16} style={{ color: 'var(--accent-sky)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Player positions</span>
          </div>
          <div className="relative w-full h-64 rounded-2xl clay-inset">
            {/* Grid background */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-0">
              {Array(16).fill(0).map((_, i) => (
                <div key={i} style={{ borderColor: 'rgba(124, 111, 224, 0.12)', borderWidth: '1px' }}></div>
              ))}
            </div>

            {/* Player dots */}
            {gameState.players.map(player => (
              <div
                key={player.id}
                className="absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                style={{
                  left: `${(player.position?.x || Math.random()) * 100}%`,
                  top: `${(player.position?.y || Math.random()) * 100}%`,
                  backgroundColor: player.teamName === 'PRINCE' ? 'var(--accent-sky)' : 'var(--accent-purple)',
                }}
                title={`${player.username} (${player.teamName})`}
              >
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity glass-panel" style={{ color: 'var(--text-primary)' }}>
                  {player.username}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
