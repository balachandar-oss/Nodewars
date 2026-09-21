import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Square, Eye, EyeOff, Users, Bug, Lock, MapPin, Activity, AlertCircle } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAdminGameState } from '../hooks/useAdminGameState';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { gameState, loading, error } = useAdminGameState();
  const [showScores, setShowScores] = useState(false);
  const [gameCountdown, setGameCountdown] = useState<number | null>(null);
  const [events, setEvents] = useState<Array<{ id: string; type: string; message: string; timestamp: string }>>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  // Simulate countdown timer
  useEffect(() => {
    if (gameState?.phase === 'WAITING' && gameState?.countdownSeconds) {
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
      const res = await fetch('http://localhost:3001/api/admin/game/start', {
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

  const handleEndGame = async () => {
    if (!confirm('Are you sure you want to end the game?')) return;

    setIsEnding(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:3001/api/admin/game/end', {
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

  const handleRevealScores = async () => {
    setIsRevealing(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:3001/api/admin/game/reveal-scores', {
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
      case 'WAITING': return 'WAITING FOR START';
      case 'ACTIVE': return 'GAME ACTIVE';
      case 'ENDED': return 'GAME ENDED';
      default: return 'UNKNOWN';
    }
  };

  const getPhaseColor = (phase?: string): string => {
    switch (phase) {
      case 'WAITING': return 'var(--accent-amber)';
      case 'ACTIVE': return 'var(--accent-green)';
      case 'ENDED': return 'var(--accent-red)';
      default: return 'var(--text-secondary)';
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
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: `var(--accent-blue) transparent var(--accent-blue) var(--accent-blue)` }}></div>
          <p className="font-mono uppercase tracking-widest">LOADING GAME STATE...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ color: 'var(--accent-red)' }}>
        <div className="text-center">
          <AlertCircle size={32} className="mx-auto mb-4" />
          <p className="font-mono uppercase tracking-widest">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="panel p-6" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-blue)' }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs font-mono tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>GAME STATUS</div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: getPhaseColor(gameState?.phase) }}></div>
              <span className="text-lg font-mono font-bold" style={{ color: getPhaseColor(gameState?.phase) }}>
                {getPhaseLabel(gameState?.phase)}
              </span>
              {gameCountdown && (
                <span className="text-xs font-mono px-3 py-1 rounded" style={{ backgroundColor: `var(--accent-amber)${theme === 'dark' ? '1a' : '15'}`, color: 'var(--accent-amber)' }}>
                  {Math.floor(gameCountdown / 60)}:{(gameCountdown % 60).toString().padStart(2, '0')}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            {gameState?.phase === 'WAITING' && (
              <button
                onClick={handleStartGame}
                disabled={isStarting}
                className="cyber-button px-4 py-2 text-xs flex items-center gap-2"
                style={{ borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }}
              >
                <Play size={14} />
                START GAME
              </button>
            )}
            {(gameState?.phase === 'ACTIVE' || gameState?.phase === 'WAITING') && (
              <button
                onClick={handleEndGame}
                disabled={isEnding}
                className="cyber-button px-4 py-2 text-xs flex items-center gap-2"
                style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}
              >
                <Square size={14} />
                END GAME
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Player Stats & Management */}
        <div className="lg:col-span-1 space-y-6">
          {/* Teams Summary */}
          <div className="panel p-6" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-blue)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} style={{ color: 'var(--accent-blue)' }} />
              <span className="text-xs font-mono tracking-widest" style={{ color: 'var(--text-secondary)' }}>TEAM OVERVIEW</span>
            </div>
            <div className="space-y-3">
              {gameState?.teams.map(team => (
                <div key={team.id} className="flex justify-between items-center text-xs">
                  <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{team.name}</span>
                  <div className="flex gap-2">
                    <span style={{ color: 'var(--accent-amber)' }}>[{team.totalPlayers} PLAYERS]</span>
                    <span style={{ color: 'var(--accent-green)' }}>SCORE: {team.huntScore}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bug Stats */}
          <div className="panel p-6" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-green)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Bug size={16} style={{ color: 'var(--accent-green)' }} />
              <span className="text-xs font-mono tracking-widest" style={{ color: 'var(--text-secondary)' }}>BUG TRACKING</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono" style={{ color: 'var(--text-primary)' }}>PLANTED</span>
                <span className="font-bold" style={{ color: 'var(--accent-purple)' }}>{gameState?.bugStats.planted || 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono" style={{ color: 'var(--text-primary)' }}>DISCOVERED</span>
                <span className="font-bold" style={{ color: 'var(--accent-amber)' }}>{gameState?.bugStats.discovered || 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono" style={{ color: 'var(--text-primary)' }}>SOLVED</span>
                <span className="font-bold" style={{ color: 'var(--accent-green)' }}>{gameState?.bugStats.solved || 0}</span>
              </div>
            </div>
          </div>

          {/* Royal Room */}
          <div className="panel p-6" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-red)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Lock size={16} style={{ color: 'var(--accent-red)' }} />
              <span className="text-xs font-mono tracking-widest" style={{ color: 'var(--text-secondary)' }}>ROYAL ROOM</span>
            </div>
            <div className="text-2xl font-mono font-bold" style={{ color: 'var(--accent-red)' }}>
              {gameState?.royalRoomAttempts || 0}
            </div>
            <div className="text-xs font-mono mt-2" style={{ color: 'var(--text-secondary)' }}>UNLOCK ATTEMPTS</div>
          </div>
        </div>

        {/* Center: Score Management & Leaderboard */}
        <div className="lg:col-span-1 space-y-6">
          {/* Score Management */}
          <div className="panel p-6" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: showScores ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {showScores ? <Eye size={16} style={{ color: 'var(--accent-green)' }} /> : <EyeOff size={16} style={{ color: 'var(--accent-amber)' }} />}
                <span className="text-xs font-mono tracking-widest" style={{ color: 'var(--text-secondary)' }}>SCORE STATUS</span>
              </div>
              <span className="text-xs font-mono px-2 py-1 rounded" style={{ backgroundColor: showScores ? `var(--accent-green)${theme === 'dark' ? '1a' : '15'}` : `var(--accent-amber)${theme === 'dark' ? '1a' : '15'}`, color: showScores ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
                {showScores ? 'REVEALED' : 'HIDDEN'}
              </span>
            </div>
            <button
              onClick={handleRevealScores}
              disabled={isRevealing || showScores}
              className="w-full cyber-button py-3 text-xs flex items-center justify-center gap-2 font-mono"
              style={{ borderColor: showScores ? 'var(--accent-green)' : 'var(--accent-amber)', color: showScores ? 'var(--accent-green)' : 'var(--accent-amber)' }}
            >
              <Eye size={14} />
              {showScores ? 'SCORES REVEALED' : 'REVEAL SCORES'}
            </button>
            {showScores && (
              <div className="text-xs font-mono mt-3 pt-3" style={{ color: 'var(--accent-green)', borderTopColor: 'var(--accent-green)', borderTopWidth: '1px' }}>
                Top 5 per team assigned as Bug Architects
              </div>
            )}
          </div>

          {/* Top Players */}
          <div className="panel p-6" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-purple)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} style={{ color: 'var(--accent-purple)' }} />
              <span className="text-xs font-mono tracking-widest" style={{ color: 'var(--text-secondary)' }}>TOP 10 PLAYERS</span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {topPlayers.map((player, idx) => (
                <div key={player.id} className="flex items-center justify-between text-xs p-2 rounded" style={{ backgroundColor: `var(--accent-blue)${theme === 'dark' ? '0a' : '08'}` }}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold w-6" style={{ color: 'var(--accent-amber)' }}>#{idx + 1}</span>
                    <div>
                      <div className="font-mono" style={{ color: 'var(--text-primary)' }}>{player.username}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{player.teamName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {player.isBugArchitect && (
                      <div className="text-[10px] px-1 rounded mb-1" style={{ backgroundColor: 'var(--accent-amber)', color: 'black' }}>
                        ARCHITECT
                      </div>
                    )}
                    <div className="font-mono font-bold" style={{ color: 'var(--accent-green)' }}>{player.score}</div>
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
            <div className="panel p-6" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-amber)' }}>
              <div className="flex items-center gap-2 mb-4">
                <Bug size={16} style={{ color: 'var(--accent-amber)' }} />
                <span className="text-xs font-mono tracking-widest" style={{ color: 'var(--text-secondary)' }}>BUG ARCHITECTS</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {bugArchitects.map((player, idx) => (
                  <div key={player.id} className="text-xs p-2 rounded" style={{ backgroundColor: `var(--accent-amber)${theme === 'dark' ? '1a' : '15'}` }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-mono font-bold" style={{ color: 'var(--accent-amber)' }}>{player.username}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{player.teamName}</div>
                      </div>
                      <div className="font-mono font-bold" style={{ color: 'var(--accent-green)' }}>{player.score}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Events */}
          <div className="panel p-6" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-blue)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} style={{ color: 'var(--accent-blue)' }} />
              <span className="text-xs font-mono tracking-widest" style={{ color: 'var(--text-secondary)' }}>LIVE EVENTS</span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-[10px]">
              {events.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)' }}>[ NO EVENTS YET ]</div>
              ) : (
                events.map(event => (
                  <div key={event.id} className="flex gap-2 p-1" style={{ color: event.type === 'ERROR' ? 'var(--accent-red)' : event.type === 'SCORES_REVEALED' ? 'var(--accent-green)' : 'var(--accent-purple)' }}>
                    <span className="text-[9px]">{event.timestamp}</span>
                    <span>{'>'}</span>
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
        <div className="panel p-6" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-blue)' }}>
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={16} style={{ color: 'var(--accent-blue)' }} />
            <span className="text-xs font-mono tracking-widest" style={{ color: 'var(--text-secondary)' }}>PLAYER POSITIONS</span>
          </div>
          <div className="relative w-full h-64 rounded border" style={{ borderColor: 'var(--accent-blue)', backgroundColor: `var(--accent-blue)${theme === 'dark' ? '08' : '05'}` }}>
            {/* Grid background */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-0" style={{ borderColor: `var(--accent-blue)${theme === 'dark' ? '20' : '15'}` }}>
              {Array(16).fill(0).map((_, i) => (
                <div key={i} style={{ borderColor: `var(--accent-blue)${theme === 'dark' ? '20' : '15'}`, borderWidth: '1px' }}></div>
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
                  backgroundColor: player.teamName === 'TEAM OMEGA' ? 'var(--accent-blue)' : 'var(--accent-purple)',
                }}
                title={`${player.username} (${player.teamName})`}
              >
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--accent-blue)', borderWidth: '1px' }}>
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
