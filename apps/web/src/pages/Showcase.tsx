import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, ArrowRight, Trophy } from 'lucide-react';
import { API_URL } from '../utils/api';

interface ShowcaseItem {
  missionId: string;
  title: string;
  unlockComponent: string | null;
  order: number;
  completed: boolean;
  code: string | null;
}

const Showcase = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetchShowcase = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/missions/showcase`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setItems(data);
          const firstDone = data.find((i: ShowcaseItem) => i.completed);
          if (firstDone) setExpanded(firstDone.missionId);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchShowcase();
  }, [navigate]);

  const completedCount = items.filter(i => i.completed).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-neon-blue font-mono text-xs tracking-widest animate-pulse">
        ASSEMBLING RECAP...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 animate-slide-in">
      <div className="text-center mb-10">
        <Trophy size={40} className="mx-auto mb-4 text-neon-amber glow-text-amber" />
        <h1 className="text-3xl md:text-4xl font-title tracking-widest uppercase text-white glow-text-blue">
          What You Just Built
        </h1>
        <p className="text-white/50 font-mono text-xs md:text-sm mt-3 tracking-wide max-w-xl mx-auto">
          Four small systems. Each one is a real piece of how this exact castle you're standing in actually runs.
        </p>
        <div className="mt-4 inline-block px-4 py-1.5 border border-neon-blue/30 bg-neon-blue/5 rounded-full">
          <span className="text-neon-blue font-mono text-xs tracking-widest">{completedCount} / {items.length} SYSTEMS ONLINE</span>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => {
          const isOpen = expanded === item.missionId;
          return (
            <div
              key={item.missionId}
              className={`glass-panel border transition-all overflow-hidden ${
                item.completed ? 'border-neon-blue/30' : 'border-white/10 opacity-50'
              }`}
            >
              <button
                onClick={() => item.completed && setExpanded(isOpen ? null : item.missionId)}
                disabled={!item.completed}
                className="w-full flex items-center justify-between p-4 md:p-5 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="font-mono text-[10px] text-white/30 w-6">{String(idx + 1).padStart(2, '0')}</div>
                  {item.completed ? (
                    <CheckCircle size={18} className="text-neon-blue shrink-0" />
                  ) : (
                    <Circle size={18} className="text-white/20 shrink-0" />
                  )}
                  <div>
                    <div className="font-title text-sm md:text-base tracking-widest uppercase text-white">
                      {item.title}
                    </div>
                    <div className="text-[10px] font-mono text-white/40 tracking-widest uppercase mt-0.5">
                      {item.completed ? item.unlockComponent || 'ONLINE' : 'NOT COMPLETED'}
                    </div>
                  </div>
                </div>
                {item.completed && (
                  <ArrowRight size={16} className={`text-white/40 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                )}
              </button>

              {isOpen && item.code && (
                <div className="border-t border-white/10 bg-black/60 p-4 md:p-5">
                  <div className="text-[9px] font-mono text-neon-green/70 tracking-widest mb-2 uppercase">
                    Your working solution
                  </div>
                  <pre className="text-[11px] md:text-xs font-mono text-white/80 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto custom-scrollbar">
                    {item.code}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <p className="text-white/40 font-mono text-xs tracking-wide mb-6 max-w-lg mx-auto">
          Every one of these is a small version of something already running the real game you're about to play.
          Now it's time to see who understood it best.
        </p>
        <button
          onClick={() => navigate('/quiz')}
          className="cyber-button px-10 py-4 text-sm font-bold tracking-widest uppercase bg-neon-amber/10 border-neon-amber text-neon-amber hover:bg-neon-amber/20 transition-colors"
        >
          Continue to the Quiz
        </button>
      </div>
    </div>
  );
};

export default Showcase;
