import { useEffect, useState } from 'react';
import { Trophy, ShieldAlert, Cpu } from 'lucide-react';
import { API_URL } from '../utils/api';

interface LeaderboardEntry {
  rank: number;
  username: string;
  teamName: string;
  score: number;
  percentage: number;
  isBugArchitect: boolean;
}

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_URL}/api/leaderboard`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        if (res.ok) {
          setEntries(await res.json());
        }
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto h-[calc(100vh-60px)] -mt-6 p-6 flex flex-col gap-4 animate-slide-in relative z-10">
      <div className="glass-panel shrink-0 p-6 border-t-2 border-t-neon-amber flex justify-between items-center bg-[#0a0510]">
        <div className="flex items-center gap-4">
          <Trophy size={32} className="text-neon-amber" />
          <h1 className="text-3xl font-title tracking-widest text-white uppercase leading-none">
            GLOBAL LEADERBOARD
          </h1>
        </div>
        <div className="font-mono text-[10px] text-white/50 border border-white/5 px-4 py-2 bg-black/60 tracking-widest uppercase">
          RANKING: SECURITY ASSESSMENT
        </div>
      </div>

      <div className="flex-1 glass-panel flex flex-col bg-black/60 border-t-2 border-t-white/10 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 font-mono text-[10px] text-white/40 tracking-widest bg-black/80 shrink-0">
          <div className="col-span-1 text-center">RANK</div>
          <div className="col-span-3">OPERATIVE ID</div>
          <div className="col-span-3">FACTION</div>
          <div className="col-span-2 text-right">SCORE</div>
          <div className="col-span-3 text-center">STATUS</div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center font-mono text-neon-amber text-xs tracking-widest animate-pulse">
            LOADING GLOBAL DATA...
          </div>
        ) : entries.length === 0 ? (
          <div className="flex-1 flex items-center justify-center font-mono text-white/30 text-xs tracking-widest">
            NO ASSESSMENT DATA AVAILABLE
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {entries.map((entry, idx) => (
              <div 
                key={idx} 
                className={`grid grid-cols-12 gap-4 p-3 font-mono text-xs items-center transition-all ${
                  entry.isBugArchitect ? 'bg-neon-amber/5 border border-neon-amber/30' : 'bg-black/40 border border-white/5 hover:bg-white/5'
                }`}
              >
                <div className="col-span-1 text-center font-bold text-white/80">
                  #{entry.rank}
                </div>
                <div className={`col-span-3 font-bold flex items-center gap-2 ${entry.isBugArchitect ? 'text-neon-amber' : 'text-white'}`}>
                  {entry.isBugArchitect && <ShieldAlert size={14} className="text-neon-amber" />}
                  {entry.username.toUpperCase()}
                </div>
                <div className="col-span-3 text-neon-purple tracking-widest">
                  {entry.teamName}
                </div>
                <div className="col-span-2 text-right text-neon-green font-bold">
                  {entry.score}
                </div>
                <div className="col-span-3 flex justify-center">
                  {entry.isBugArchitect ? (
                    <span className="bg-neon-amber/20 border border-neon-amber text-neon-amber px-3 py-1 text-[9px] tracking-widest font-bold flex items-center gap-2 shadow-[0_0_10px_rgba(255,170,0,0.1)]">
                      <Cpu size={12} /> BUG ARCHITECT
                    </span>
                  ) : (
                    <span className="text-white/30 border border-white/10 px-3 py-1 text-[9px] tracking-widest">
                      STANDARD CLEARANCE
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
