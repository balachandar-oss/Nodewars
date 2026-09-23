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
      <div className="max-w-4xl mx-auto p-6 md:p-10 animate-fade-in">
        <div className="skeleton h-20 w-20 rounded-full mx-auto mb-4"></div>
        <div className="skeleton h-10 w-2/3 mx-auto mb-2"></div>
        <div className="skeleton h-4 w-1/2 mx-auto mb-10"></div>
        <div className="space-y-4">
          <div className="skeleton h-16"></div>
          <div className="skeleton h-16"></div>
          <div className="skeleton h-16"></div>
          <div className="skeleton h-16"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 animate-slide-in">
      <div className="text-center mb-10">
        <div className="clay-inset w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy size={36} style={{ color: 'var(--accent-gold)' }} />
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
          What you just built
        </h1>
        <p className="text-sm mt-3 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Four small systems. Each one is a real piece of how this exact castle you're standing in actually runs.
        </p>
        <div className="mt-4 inline-block">
          <span className="chip chip-sky">{completedCount} / {items.length} systems online</span>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => {
          const isOpen = expanded === item.missionId;
          return (
            <div
              key={item.missionId}
              className={`glass-panel overflow-hidden transition-all ${!item.completed ? 'opacity-50' : ''}`}
            >
              <button
                onClick={() => item.completed && setExpanded(isOpen ? null : item.missionId)}
                disabled={!item.completed}
                className="w-full flex items-center justify-between p-4 md:p-5 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="text-[10px] w-6" style={{ color: 'var(--text-muted)' }}>{String(idx + 1).padStart(2, '0')}</div>
                  {item.completed ? (
                    <CheckCircle size={18} className="shrink-0" style={{ color: 'var(--accent-sky)' }} />
                  ) : (
                    <Circle size={18} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
                  )}
                  <div>
                    <div className="text-sm md:text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {item.title}
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {item.completed ? item.unlockComponent || 'Online' : 'Not completed'}
                    </div>
                  </div>
                </div>
                {item.completed && (
                  <ArrowRight size={16} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} style={{ color: 'var(--text-muted)' }} />
                )}
              </button>

              {isOpen && item.code && (
                <div className="p-4 md:p-5" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <div className="text-[10px] mb-2" style={{ color: 'var(--accent-mint)' }}>
                    Your working solution
                  </div>
                  <pre className="text-[11px] md:text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto custom-scrollbar clay-inset p-3 rounded-xl" style={{ color: 'var(--text-secondary)' }}>
                    {item.code}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <p className="text-xs mb-6 max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
          Every one of these is a small version of something already running the real game you're about to play.
          Now it's time to see who understood it best.
        </p>
        <button
          onClick={() => navigate('/quiz')}
          className="clay-button px-10 py-4 text-sm font-bold"
        >
          Continue to the quiz
        </button>
      </div>
    </div>
  );
};

export default Showcase;
