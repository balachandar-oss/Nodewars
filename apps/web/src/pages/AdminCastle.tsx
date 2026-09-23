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

  if (loading) return <div className="p-8" style={{ color: 'var(--text-secondary)' }}>Loading castle components...</div>;
  if (error) return <div className="p-8" style={{ color: '#c14d72' }}>{error}</div>;

  const grouped = components.reduce((acc, comp) => {
    if (!acc[comp.team.name]) acc[comp.team.name] = [];
    acc[comp.team.name].push(comp);
    return acc;
  }, {} as Record<string, CastleComponent[]>);

  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-60px)] -mt-6 p-6 flex flex-col gap-4 animate-slide-in relative z-10">
      <div className="glass-panel shrink-0 p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>Castle QR deployment</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Physical infrastructure mapping tags</p>
        </div>
        <button onClick={() => window.print()} className="clay-button px-6 py-3 text-sm hidden sm:block">
          Print all labels
        </button>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; color: black !important; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; background: white !important; }
          .qr-card { page-break-inside: avoid; border: 1px solid #ccc !important; background: white !important; }
          .print-hide { display: none !important; }
        }
      `}</style>

      <div id="print-area" className="flex-1 glass-panel overflow-y-auto custom-scrollbar p-8 space-y-12">
        {Object.entries(grouped).map(([teamName, comps]) => (
          <div key={teamName} className="space-y-6">
            <h2 className="text-xl font-display font-bold pb-4" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--accent-sky)' }} className="mr-3">•</span>
              {teamName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {comps.map(comp => (
                <div key={comp.id} className="qr-card clay-panel p-6 flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
                  <div className="bg-white p-3 rounded-xl">
                    <QRCodeSVG
                      value={comp.physicalCode}
                      size={160}
                      level="Q"
                      includeMargin={false}
                    />
                  </div>
                  <div className="text-center space-y-1 w-full relative z-10">
                    <div className="font-bold text-sm break-words" style={{ color: 'var(--text-primary)' }}>{comp.displayName}</div>
                    <div className="text-xs" style={{ color: 'var(--accent-sky)' }}>Node Lab &bull; {teamName}</div>
                    <div className="text-xs pt-3 mt-3" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)' }}>{comp.physicalCode}</div>
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
