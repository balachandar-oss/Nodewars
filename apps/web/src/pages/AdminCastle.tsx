import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { API_URL } from '../utils/api';

interface CastleComponent {
  id: string;
  teamId: string;
  systemId: string;
  physicalCode: string;
  displayName: string;
  team: {
    name: string;
  };
}

const AdminCastle = () => {
  const [components, setComponents] = useState<CastleComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComponents = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/admin/castle-components`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          setError('Failed to load components. Admin access required.');
          return;
        }
        setComponents(await res.json());
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();
  }, []);

  if (loading) return <div className="p-8 text-white font-mono">Loading Castle Components...</div>;
  if (error) return <div className="p-8 text-red-500 font-mono">{error}</div>;

  const grouped = components.reduce((acc, comp) => {
    if (!acc[comp.team.name]) acc[comp.team.name] = [];
    acc[comp.team.name].push(comp);
    return acc;
  }, {} as Record<string, CastleComponent[]>);

  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-60px)] -mt-6 p-6 flex flex-col gap-4 animate-slide-in relative z-10">
      <div className="glass-panel shrink-0 p-6 border-t-2 border-t-neon-blue flex justify-between items-center bg-[#0a0510]">
        <div>
          <h1 className="text-3xl font-title text-white tracking-widest uppercase">CASTLE QR DEPLOYMENT</h1>
          <p className="text-neon-blue font-mono text-[10px] mt-2 tracking-widest uppercase">Physical infrastructure mapping tags.</p>
        </div>
        <button onClick={() => window.print()} className="cyber-button px-8 py-3 bg-white/5 border-white/20 text-xs tracking-widest hidden sm:block">
          PRINT ALL LABELS
        </button>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; color: black !important; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; background: white !important; }
          .qr-card { page-break-inside: avoid; border: 1px solid #ccc !important; background: white !important; }
          .cyber-button { display: none !important; }
        }
      `}</style>

      <div id="print-area" className="flex-1 glass-panel bg-black/60 overflow-y-auto custom-scrollbar p-8 space-y-12">
        {Object.entries(grouped).map(([teamName, comps]) => (
          <div key={teamName} className="space-y-6">
            <h2 className="text-2xl font-title text-white border-b border-white/10 pb-4 tracking-widest uppercase">
              <span className="text-neon-blue mr-4">///</span>
              {teamName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {comps.map(comp => (
                <div key={comp.id} className="qr-card p-6 border border-white/10 flex flex-col items-center justify-center space-y-6 bg-black/40 hover:bg-white/5 transition-colors relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-neon-blue/50"></div>
                  <div className="bg-white p-3 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                    <QRCodeSVG 
                      value={comp.physicalCode} 
                      size={160}
                      level="Q"
                      includeMargin={false}
                    />
                  </div>
                  <div className="text-center font-mono space-y-1 w-full relative z-10">
                    <div className="font-bold text-sm tracking-widest text-white uppercase break-words">{comp.displayName}</div>
                    <div className="text-[10px] text-neon-blue uppercase tracking-widest">NODE LAB • {teamName}</div>
                    <div className="text-[9px] text-white/30 pt-3 border-t border-white/5 mt-3">{comp.physicalCode}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCastle;
