import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Terminal, User as UserIcon, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const AppLayout = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
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
      <header className="panel border-b rounded-none px-6 py-3 flex justify-between items-center sticky top-0 z-50" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-blue)', borderBottomColor: `var(--accent-blue)${theme === 'dark' ? '4d' : '30'}` }}>
        <div className="flex items-center gap-4">
          <Terminal className="glow-text-blue" size={20} style={{ color: 'var(--accent-blue)' }} />
          <div className="flex flex-col">
            <h1 className="text-xl font-title font-bold tracking-widest glow-text-blue uppercase" style={{ color: 'var(--text-primary)' }}>
              [ NODE LAB ]
            </h1>
            <span className="text-[10px] font-mono tracking-widest" style={{ color: 'var(--accent-blue)' }}>ENGINEERING LAB</span>
          </div>

          <div className="hidden md:flex items-center gap-2 ml-8 px-3 py-1 rounded" style={{ backgroundColor: `var(--accent-green)${theme === 'dark' ? '1a' : '15'}`, border: `1px solid var(--accent-green)${theme === 'dark' ? '4d' : '40'}` }}>
            <div className="w-2 h-2 rounded-full animate-pulse-fast glow-green" style={{ backgroundColor: 'var(--accent-green)' }}></div>
            <span className="text-xs font-mono tracking-widest glow-text-green" style={{ color: 'var(--accent-green)' }}>SYSTEM STATUS: ONLINE</span>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 text-xs font-mono glow-text-amber" style={{ color: 'var(--accent-amber)' }}>
                <span>[ LVL {user.level.toString().padStart(2, '0')} ]</span>
                <span className="opacity-50">|</span>
                <span>[ {user.xp} XP ]</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono mt-1" style={{ color: 'var(--text-secondary)' }}>
                <UserIcon size={12} style={{ color: 'var(--accent-purple)' }} />
                <span className="uppercase tracking-widest">{user.username}</span>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="cyber-button px-3 py-2 text-xs flex items-center gap-2 rounded-md"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label={`Toggle theme - currently ${theme}`}
            >
              {theme === 'dark' ? (
                <Sun size={14} />
              ) : (
                <Moon size={14} />
              )}
              <span className="hidden sm:inline uppercase">{theme === 'dark' ? 'LIGHT' : 'DARK'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="cyber-button px-4 py-2 text-xs flex items-center gap-2"
              style={{
                borderColor: 'var(--accent-red)',
                color: 'var(--accent-red)'
              }}
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
