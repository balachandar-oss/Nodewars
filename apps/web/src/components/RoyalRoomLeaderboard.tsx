import React, { useEffect, useState } from 'react';
import { Trophy, Crown, CheckCircle, Lock, Cpu } from 'lucide-react';
import { API_URL } from '../utils/api';

interface LeaderboardEntry {
  rank: number;
  username: string;
  teamName: string;
  teamScore: number;
  bugsSolved: number;
  royalRoomCompleted: boolean;
  isBugArchitect: boolean;
}

interface TeamStats {
  name: string;
  score: number;
  bugsSolved: number;
  royalRoomCompleted: boolean;
  playerCount: number;
}

interface RoyalRoomLeaderboardProps {
  onClose?: () => void;
}

const RoyalRoomLeaderboard: React.FC<RoyalRoomLeaderboardProps> = ({ onClose }) => {
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);
  const [playerLeaderboard, setPlayerLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [topArchitects, setTopArchitects] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_URL}/api/games/leaderboard`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        if (res.ok) {
          const data = await res.json();
          setPlayerLeaderboard(data.players || []);
          setTeamStats(data.teams || []);
          setTopArchitects((data.players || [])
            .filter((p: LeaderboardEntry) => p.isBugArchitect)
            .slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  const getWinner = () => {
    if (teamStats.length < 2) return null;
    const sorted = [...teamStats].sort((a, b) => b.score - a.score);
    return sorted[0];
  };

  const winner = getWinner();

  if (loading) {
    return (
      <div className="glass-panel p-12 text-center font-mono text-neon-blue animate-pulse">
        COMPILING FINAL LEADERBOARD...
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Winner Announcement */}
      {winner && (
        <div className="glass-panel p-8 border-t-2 border-t-neon-amber bg-gradient-to-r from-neon-amber/10 to-transparent">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Crown size={48} className="text-neon-amber animate-bounce" />
            <div>
              <h1 className="text-3xl font-title tracking-widest text-neon-amber glow-text-amber">
                OPERATION VICTORY
              </h1>
              <div className="font-mono text-sm text-white/60 tracking-widest mt-2">
                {winner.name} ACHIEVED SUPREME DOMINANCE
              </div>
            </div>
            <Crown size={48} className="text-neon-amber animate-bounce" />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 max-w-2xl mx-auto">
            <div className="text-center border border-neon-amber/30 bg-neon-amber/5 p-4">
              <div className="text-3xl font-bold text-neon-amber mb-1">{winner.score}</div>
              <div className="font-mono text-[10px] text-white/50 tracking-widest">TOTAL POINTS</div>
            </div>
            <div className="text-center border border-neon-amber/30 bg-neon-amber/5 p-4">
              <div className="text-3xl font-bold text-neon-amber mb-1">{winner.bugsSolved}</div>
              <div className="font-mono text-[10px] text-white/50 tracking-widest">BUGS SOLVED</div>
            </div>
            <div className="text-center border border-neon-amber/30 bg-neon-amber/5 p-4">
              <div className={`text-3xl font-bold mb-1 ${winner.royalRoomCompleted ? 'text-neon-green' : 'text-neon-red'}`}>
                {winner.royalRoomCompleted ? '✓' : '✗'}
              </div>
              <div className="font-mono text-[10px] text-white/50 tracking-widest">ROYAL ROOM</div>
            </div>
          </div>
        </div>
      )}

      {/* Team vs Team Stats */}
      <div className="glass-panel border-t-2 border-t-neon-blue">
        <div className="p-4 border-b border-white/5 bg-black/40">
          <h2 className="text-lg font-title tracking-widest text-white/70 flex items-center gap-2">
            <Trophy size={20} /> TEAM STANDINGS
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6">
          {teamStats.sort((a, b) => b.score - a.score).map((team, idx) => (
            <div
              key={team.name}
              className={`border-2 p-6 space-y-4 transition-all ${
                idx === 0
                  ? 'border-neon-amber bg-neon-amber/5 shadow-[0_0_20px_rgba(255,170,0,0.2)]'
                  : 'border-neon-purple bg-neon-purple/5'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-xl font-title tracking-widest ${
                    idx === 0 ? 'text-neon-amber' : 'text-neon-purple'
                  }`}>
                    {team.name}
                  </h3>
                  {idx === 0 && <div className="font-mono text-[9px] text-neon-amber/70 tracking-widest">[ CHAMPION ]</div>}
                </div>
                {idx === 0 && <Crown size={32} className="text-neon-amber" />}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="font-mono text-[10px] text-white/50">TEAM SCORE</span>
                  <span className={`font-mono text-lg font-bold ${
                    idx === 0 ? 'text-neon-amber' : 'text-neon-purple'
                  }`}>
                    {team.score}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="font-mono text-[10px] text-white/50">BUGS ELIMINATED</span>
                  <span className="text-white font-bold">{team.bugsSolved}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="font-mono text-[10px] text-white/50">ROYAL ROOM</span>
                  <div className="flex items-center gap-2">
                    {team.royalRoomCompleted ? (
                      <>
                        <CheckCircle size={16} className="text-neon-green" />
                        <span className="font-mono text-[10px] text-neon-green">BREACHED</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} className="text-neon-red" />
                        <span className="font-mono text-[10px] text-neon-red">SEALED</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] text-white/50">OPERATIVES</span>
                  <span className="font-mono text-[10px] text-white">{team.playerCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Bug Architects */}
      {topArchitects.length > 0 && (
        <div className="glass-panel border-t-2 border-t-neon-green">
          <div className="p-4 border-b border-white/5 bg-black/40">
            <h2 className="text-lg font-title tracking-widest text-white/70 flex items-center gap-2">
              <Cpu size={20} className="text-neon-amber" /> TOP BUG ARCHITECTS
            </h2>
          </div>

          <div className="overflow-y-auto max-h-80 custom-scrollbar">
            {topArchitects.map((architect, idx) => (
              <div
                key={architect.username}
                className={`grid grid-cols-6 gap-4 p-4 items-center border-b border-white/5 hover:bg-white/5 transition-colors ${
                  idx === 0 ? 'bg-neon-amber/10' : ''
                }`}
              >
                <div className="font-mono font-bold">
                  {idx === 0 && <Crown size={16} className="text-neon-amber inline mr-2" />}
                  #{idx + 1}
                </div>
                <div className="col-span-2">
                  <div className={`font-mono font-bold ${
                    idx === 0 ? 'text-neon-amber' : 'text-white'
                  }`}>
                    {architect.username.toUpperCase()}
                  </div>
                  <div className="font-mono text-[9px] text-white/40">{architect.teamName}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-neon-green">{architect.teamScore}</div>
                  <div className="font-mono text-[9px] text-white/40">PTS</div>
                </div>
                <div className="text-center">
                  {architect.royalRoomCompleted ? (
                    <CheckCircle size={16} className="text-neon-green mx-auto" />
                  ) : (
                    <Lock size={16} className="text-neon-red mx-auto" />
                  )}
                </div>
                <div className="text-right">
                  <div className="font-mono text-[10px] text-neon-amber font-bold">
                    {architect.bugsSolved} SOLVED
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Player Rankings */}
      <div className="glass-panel border-t-2 border-t-white/10">
        <div className="p-4 border-b border-white/5 bg-black/40">
          <h2 className="text-lg font-title tracking-widest text-white/70">ALL OPERATIVES</h2>
        </div>

        <div className="overflow-x-auto">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 font-mono text-[10px] text-white/40 tracking-widest bg-black/80 sticky top-0">
            <div className="col-span-1 text-center">RANK</div>
            <div className="col-span-3">OPERATIVE</div>
            <div className="col-span-2">TEAM</div>
            <div className="col-span-1 text-right">SCORE</div>
            <div className="col-span-1 text-center">BUGS</div>
            <div className="col-span-2 text-center">ROYAL ROOM</div>
            <div className="col-span-2 text-center">STATUS</div>
          </div>

          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {playerLeaderboard.map((player) => (
              <div
                key={player.username}
                className={`grid grid-cols-12 gap-4 p-3 items-center border-b border-white/5 hover:bg-white/5 transition-colors ${
                  player.isBugArchitect ? 'bg-neon-amber/10 border-l-2 border-l-neon-amber' : ''
                }`}
              >
                <div className="col-span-1 text-center font-mono text-white/70">
                  #{player.rank}
                </div>
                <div className="col-span-3 font-mono font-bold">
                  {player.isBugArchitect && <Cpu size={12} className="inline text-neon-amber mr-2" />}
                  <span className={player.isBugArchitect ? 'text-neon-amber' : 'text-white'}>
                    {player.username.toUpperCase()}
                  </span>
                </div>
                <div className="col-span-2 font-mono text-[10px] text-neon-purple">
                  {player.teamName}
                </div>
                <div className="col-span-1 text-right font-mono font-bold text-neon-green">
                  {player.teamScore}
                </div>
                <div className="col-span-1 text-center font-mono text-[10px]">
                  {player.bugsSolved}
                </div>
                <div className="col-span-2 text-center">
                  {player.royalRoomCompleted ? (
                    <CheckCircle size={14} className="text-neon-green mx-auto" />
                  ) : (
                    <Lock size={14} className="text-neon-red/50 mx-auto" />
                  )}
                </div>
                <div className="col-span-2 text-center">
                  {player.isBugArchitect ? (
                    <span className="bg-neon-amber/20 border border-neon-amber text-neon-amber px-2 py-1 text-[9px] tracking-widest font-bold">
                      ARCHITECT
                    </span>
                  ) : (
                    <span className="text-white/30 text-[9px]">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Close Button */}
      {onClose && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onClose}
            className="cyber-button px-8 py-3 border-white/20 text-white/70"
          >
            CLOSE LEADERBOARD
          </button>
        </div>
      )}
    </div>
  );
};

export default RoyalRoomLeaderboard;
