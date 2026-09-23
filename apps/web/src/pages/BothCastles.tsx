import { useNavigate } from 'react-router-dom';
import { Shield, ShieldAlert, Swords } from 'lucide-react';

const BothCastles = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 animate-fade-in flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center">
      <div className="flex items-center gap-8 mb-10">
        <div className="clay-panel w-32 h-32 rounded-2xl flex flex-col items-center justify-center relative p-2 text-center" style={{ border: '2px solid var(--accent-purple)' }}>
          <div className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--accent-purple)' }}>PRINCES</div>
          <Shield size={32} style={{ color: 'var(--accent-purple)' }} className="mb-2" />
          <div className="text-[12px] font-bold uppercase" style={{ color: 'var(--text-primary)' }}>KING</div>
          <div className="text-[9px] font-bold uppercase mt-1" style={{ color: 'var(--accent-mint)' }}>STATUS: PROTECTED</div>
        </div>
        
        <Swords size={32} style={{ color: 'var(--text-muted)' }} className="animate-pulse" />
        
        <div className="clay-panel w-32 h-32 rounded-2xl flex flex-col items-center justify-center relative p-2 text-center" style={{ border: '2px solid var(--accent-gold)' }}>
          <div className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--accent-gold)' }}>PRINCESSES</div>
          <ShieldAlert size={32} style={{ color: 'var(--accent-gold)' }} className="mb-2" />
          <div className="text-[12px] font-bold uppercase" style={{ color: 'var(--text-primary)' }}>QUEEN</div>
          <div className="text-[9px] font-bold uppercase mt-1" style={{ color: 'var(--accent-mint)' }}>STATUS: PROTECTED</div>
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-display font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        BOTH CASTLES REMAIN
      </h1>
      
      <p className="text-sm md:text-base max-w-xl mx-auto leading-relaxed mb-10" style={{ color: 'var(--text-secondary)' }}>
        Both castles still stand. Both Royals remain in play. The quiz has determined the Bug Architects.
        <br/><br/>
        The opponent's Bug Architects have planted hidden vulnerabilities deep within your infrastructure. The hunt is the next phase.
      </p>

      <button
        onClick={() => navigate('/hunt')}
        className="clay-button px-12 py-4 font-bold text-sm"
      >
        Begin the Bug Hunt
      </button>
    </div>
  );
};

export default BothCastles;
