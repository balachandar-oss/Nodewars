import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Crown, User as UserIcon, LayoutDashboard } from 'lucide-react';
import { API_URL } from '../utils/api';

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<{ username: string; role: string; level: number; xp: number; team?: { name: string } } | null>(null);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/user/me`, {
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
      {/* Header */}
      <header className="glass-panel rounded-none border-x-0 border-t-0 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 text-left"
          title="Go to dashboard"
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center clay-inset shrink-0">
            <Crown size={18} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-display font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
              Node Wars
            </h1>
            <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Learn, build, and hunt bugs</span>
          </div>
        </button>

        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user.username}</span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Level {user.level} &middot; {user.xp} XP</span>
            </div>

            <div className="sm:hidden w-8 h-8 rounded-full flex items-center justify-center clay-inset">
              <UserIcon size={14} style={{ color: 'var(--accent-purple)' }} />
            </div>

            {location.pathname !== '/dashboard' && (
              <button
                onClick={() => navigate('/dashboard')}
                className="clay-button-secondary px-4 py-2 text-xs flex items-center gap-2"
                title="Go to dashboard"
              >
                <LayoutDashboard size={14} />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="clay-button-secondary px-4 py-2 text-xs flex items-center gap-2"
              title="Log out"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Log out</span>
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
