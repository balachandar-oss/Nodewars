import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Trophy, Server as ServerIcon, Package, Zap, Radio, ArrowRight } from 'lucide-react';

const Showcase = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Animate through 0 -> 1 -> 2 -> 3 -> 4 -> 5
    if (stage < 5) {
      const timer = setTimeout(() => {
        setStage(s => s + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const stages = [
    {
      title: 'MODULES',
      desc: 'Gate is created',
      icon: ServerIcon,
      color: 'var(--accent-purple)',
      bg: 'rgba(124, 111, 224, 0.15)'
    },
    {
      title: 'NPM',
      desc: 'Capability loads',
      icon: Package,
      color: 'var(--accent-mint)',
      bg: 'rgba(111, 216, 168, 0.15)'
    },
    {
      title: 'EVENTS',
      desc: 'Lever triggers Gate',
      icon: Zap,
      color: 'var(--accent-sky)',
      bg: 'rgba(111, 184, 224, 0.15)'
    },
    {
      title: 'DEPLOYMENT',
      desc: 'Signal Tower connects',
      icon: Radio,
      color: 'var(--accent-gold)',
      bg: 'rgba(232, 184, 75, 0.15)'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] animate-slide-in">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-primary)' }}>
          The System Awakens
        </h1>
        <p className="text-sm max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          You built one connected Node.js system. Watch it come online.
        </p>
      </div>

      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 mb-16">
        {stages.map((s, i) => {
          const isActive = stage > i;
          const Icon = s.icon;
          return (
            <div key={i} className="flex flex-col md:flex-row items-center gap-4">
              <div 
                className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-700 transform ${isActive ? 'scale-100 opacity-100' : 'scale-90 opacity-30 grayscale'}`}
                style={{ 
                  backgroundColor: isActive ? s.bg : 'var(--bg-secondary)', 
                  borderColor: isActive ? s.color : 'var(--border-color)',
                  width: '180px'
                }}
              >
                <Icon size={40} style={{ color: isActive ? s.color : 'var(--text-muted)' }} className={`mb-4 ${isActive && stage === i + 1 ? 'animate-bounce' : ''}`} />
                <div className="font-bold text-sm tracking-wider uppercase mb-1" style={{ color: isActive ? s.color : 'var(--text-muted)' }}>
                  0{i + 1} — {s.title}
                </div>
                <div className="text-[10px] text-center" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {s.desc}
                </div>
              </div>
              {i < stages.length - 1 && (
                <div className={`transition-all duration-700 ${stage > i + 1 ? 'opacity-100' : 'opacity-20'}`}>
                  <ArrowRight size={24} style={{ color: 'var(--text-secondary)' }} className="rotate-90 md:rotate-0" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {stage === 5 && (
        <div className="flex flex-col items-center animate-slide-up">
          <div className="clay-inset px-10 py-6 rounded-2xl flex flex-col items-center border border-[var(--accent-mint)] mb-8" style={{ backgroundColor: 'rgba(111, 216, 168, 0.05)' }}>
            <div className="flex items-center gap-4 text-3xl font-display font-bold" style={{ color: 'var(--accent-mint)' }}>
              <CheckCircle size={32} />
              CASTLE SYSTEM: OPERATIONAL
            </div>
          </div>
          
          <button
            onClick={() => navigate('/quiz')}
            className="clay-button px-12 py-4 text-sm font-bold uppercase tracking-wider hover:scale-105 transition-transform"
          >
            Enter the Royal Trial
          </button>
        </div>
      )}
    </div>
  );
};

export default Showcase;
