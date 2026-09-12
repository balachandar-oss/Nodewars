import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Terminal, User as UserIcon } from 'lucide-react';

const AppLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ username: string; role: string; level: number; xp: number; team?: { name: string } } | null>(null);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.error('Failed to fetch user', err);
    }
  };

  useEffect(() => {
    fetchUser();
    
    // Listen for progression updates from anywhere in the app
    window.addEventListener('user-progress-updated', fetchUser);
    return () => window.removeEventListener('user-progress-updated', fetchUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="scanline"></div>
      
      {/* HUD Header */}
      <header className="panel border-b border-neon-blue/30 rounded-none px-6 py-3 flex justify-between items-center sticky top-0 z-50 bg-black/80">
        <div className="flex items-center gap-4">
          <Terminal className="text-neon-blue glow-text-blue" size={20} />
          <div className="flex flex-col">
            <h1 className="text-xl font-title font-bold tracking-widest text-white glow-text-blue uppercase">
              [ NODE LAB ]
            </h1>
            <span className="text-[10px] font-mono text-neon-blue tracking-widest">ENGINEERING LAB</span>
          </div>
          
          <div className="hidden md:flex items-center gap-2 ml-8 px-3 py-1 bg-neon-green/10 border border-neon-green/30 rounded">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse-fast glow-green"></div>
            <span className="text-xs font-mono text-neon-green tracking-widest glow-text-green">SYSTEM STATUS: ONLINE</span>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 text-xs font-mono text-neon-amber glow-text-amber">
                <span>[ LVL {user.level.toString().padStart(2, '0')} ]</span>
                <span className="text-cyber-light/50\">|</span>
                <span>[ {user.xp} XP ]</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyber-light mt-1">
                <UserIcon size={12} className="text-neon-purple" />
                <span className="uppercase tracking-widest">{user.username}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="cyber-button px-4 py-2 text-xs text-neon-red border-neon-red/50 hover:bg-neon-red/10 flex items-center gap-2"
              title="Terminate Session"
            >
              <LogOut size={14} />
              <span>DISCONNECT</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 relative z-10">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
};

export default AppLayout;
