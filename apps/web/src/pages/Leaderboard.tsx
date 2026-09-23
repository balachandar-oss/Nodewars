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
      <div className="glass-panel shrink-0 p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="clay-inset w-12 h-12 rounded-2xl flex items-center justify-center">
            <Trophy size={26} style={{ color: 'var(--accent-gold)' }} />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
            Leaderboard
          </h1>
        </div>
        <div className="chip chip-gold">
          Ranked by quiz + hunt score
        </div>
      </div>

      <div className="flex-1 glass-panel flex flex-col overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 text-xs font-semibold shrink-0" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-3">Player</div>
          <div className="col-span-3">Team</div>
          <div className="col-span-2 text-right">Score</div>
          <div className="col-span-3 text-center">Role</div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-sm animate-pulse" style={{ color: 'var(--accent-gold)' }}>
            Loading leaderboard...
          </div>
        ) : entries.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
            No data available yet
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {entries.map((entry, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-12 gap-4 p-4 rounded-2xl text-sm items-center transition-all ${
                  entry.isBugArchitect ? 'clay-panel' : 'clay-inset hover:opacity-90'
                }`}
              >
                <div className="col-span-1 text-center font-bold" style={{ color: 'var(--text-primary)' }}>
                  #{entry.rank}
                </div>
                <div className="col-span-3 font-semibold flex items-center gap-2" style={{ color: entry.isBugArchitect ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                  {entry.isBugArchitect && <ShieldAlert size={14} style={{ color: 'var(--accent-gold)' }} />}
                  {entry.username}
                </div>
                <div className="col-span-3" style={{ color: 'var(--accent-purple)' }}>
                  {entry.teamName}
                </div>
                <div className="col-span-2 text-right font-bold" style={{ color: 'var(--accent-mint)' }}>
                  {entry.score}
                </div>
                <div className="col-span-3 flex justify-center">
                  {entry.isBugArchitect ? (
                    <span className="chip chip-gold flex items-center gap-2">
                      <Cpu size={12} /> Bug Architect
                    </span>
                  ) : (
                    <span className="chip" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                      Standard
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
