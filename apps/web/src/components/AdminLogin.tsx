import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Cpu, Sun, Moon, Lock } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { API_URL } from '../utils/api';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        if (data.user.role !== 'ADMIN') {
          setError('This account does not have admin privileges');
          return;
        }
        localStorage.setItem('token', data.token);
        navigate('/admin/dashboard');
      } else {
        setError(data.error || 'Admin login failed');
      }
    } catch (err) {
      setError('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 md:p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="scanline"></div>

      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 cyber-button px-3 py-2 text-xs flex items-center gap-2 rounded-md z-50"
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

      <div className="absolute inset-0 pointer-events-none opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--accent-blue)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">

        <div className="hidden md:flex md:col-span-3 flex-col justify-center items-center opacity-40 pointer-events-none relative">
          <div className="relative">
            <Lock size={120} className="mb-8 glow-text-red" style={{ color: 'var(--accent-red)' }} />
            <svg className="absolute top-0 left-0 w-full h-full" overflow="visible">
               <circle cx="50%" cy="50%" r="65" fill="none" stroke="var(--accent-red)" strokeWidth="1" strokeDasharray="4 8" className="animate-spin-slow opacity-50" />
               <circle cx="50%" cy="50%" r="75" fill="none" stroke="var(--accent-red)" strokeWidth="0.5" opacity="0.2" />
            </svg>
          </div>
          <div className="font-mono text-[10px] tracking-widest text-center space-y-1" style={{ color: 'var(--accent-red)' }}>
            <div className="animate-pulse" style={{ color: 'var(--accent-red)' }}>■ ADMIN CONTROL</div>
            <div>[ RESTRICTED ACCESS ]</div>
            <div className="mt-4 pt-4 w-full" style={{ borderTopColor: `var(--accent-red)${theme === 'dark' ? '4d' : '30'}` }}>
              COMMAND CENTER
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-6 flex flex-col justify-center">
          <div className="glass-panel p-10 relative w-full animate-slide-in" style={{ borderTopWidth: '2px', borderTopColor: 'var(--accent-red)', borderBottomWidth: '2px', borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(200,200,210,0.2)' }}>
            <div className="text-center mb-10 pb-6" style={{ borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(200,200,210,0.2)' }}>
              <Lock className="mx-auto mb-4" size={32} style={{ color: 'var(--accent-red)' }} />
              <h1 className="text-4xl font-title font-bold tracking-widest uppercase" style={{ color: 'var(--text-primary)' }}>
                ADMIN PANEL
              </h1>
              <h2 className="text-xs font-mono tracking-widest mt-2 uppercase opacity-80" style={{ color: 'var(--accent-red)' }}>
                COMMAND CENTER // ADMINISTRATIVE ACCESS
              </h2>
              <div className="mt-8 font-mono text-[10px] tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                {'>'} AUTHORIZATION REQUIRED...
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 font-mono text-xs flex items-start gap-3 glow-red animate-slide-in" style={{ borderColor: 'var(--accent-red)', backgroundColor: `var(--accent-red)${theme === 'dark' ? '1a' : '08'}`, color: 'var(--accent-red)' }}>
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <div>
                  <div className="mb-1">{'>'} AUTHENTICATION FAILED</div>
                  <div>{'>'} {error.toUpperCase()}</div>
                  <div className="mt-2" style={{ color: `var(--accent-red)${theme === 'dark' ? 'b3' : '80'}` }}>{'>'} ACCESS DENIED</div>
                </div>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div>
                <label className="block text-[10px] font-mono mb-2 tracking-widest uppercase" style={{ color: 'var(--text-secondary)' }}>
                  ADMIN USERNAME
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xs" style={{ color: `var(--accent-red)${theme === 'dark' ? '80' : '80'}` }}>{'>'}</div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border-b pl-10 pr-3 py-4 font-mono text-sm focus:outline-none transition-all"
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)',
                      borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(200,200,210,0.2)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder="ENTER ADMIN USERNAME"
                    disabled={loading}
                    onFocus={(e) => {
                      e.currentTarget.style.borderBottomColor = 'var(--accent-red)';
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255,0,0,0.05)' : 'rgba(204,0,0,0.05)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderBottomColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(200,200,210,0.2)';
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)';
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono mb-2 tracking-widest uppercase" style={{ color: 'var(--text-secondary)' }}>
                  PASSWORD
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xs" style={{ color: `var(--accent-red)${theme === 'dark' ? '80' : '80'}` }}>{'>'}</div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-b pl-10 pr-3 py-4 font-mono text-sm focus:outline-none transition-all"
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)',
                      borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(200,200,210,0.2)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder="ENTER MASTER PASSWORD"
                    disabled={loading}
                    onFocus={(e) => {
                      e.currentTarget.style.borderBottomColor = 'var(--accent-red)';
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255,0,0,0.05)' : 'rgba(204,0,0,0.05)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderBottomColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(200,200,210,0.2)';
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)';
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="cyber-button w-full py-4 mt-8 flex justify-center items-center gap-2 bg-transparent"
                style={{
                  borderColor: 'var(--accent-red)',
                  color: 'var(--accent-red)'
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `var(--accent-red) transparent var(--accent-red) var(--accent-red)` }}></div>
                    <span>[ VERIFYING... ]</span>
                  </>
                ) : (
                  <span>[ {'>'}{'>'}{'>'} GRANT ADMIN ACCESS ]</span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 text-center" style={{ borderTopColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(200,200,210,0.2)' }}>
              <button
                onClick={() => navigate('/login')}
                className="text-xs font-mono transition-colors flex justify-center items-center gap-1 group cursor-pointer"
                style={{
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--accent-blue)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <span>← RETURN TO LOGIN</span>
              </button>
            </div>
          </div>
        </div>

        <div className="hidden md:flex md:col-span-3 flex-col justify-center">
          <div className="p-6 font-mono text-xs" style={{ backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)', borderLeftColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(200,200,210,0.2)' }}>
            <h3 className="tracking-widest mb-6 pb-2 uppercase flex flex-col gap-1" style={{ color: 'var(--text-secondary)', borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(200,200,210,0.2)' }}>
              <span>ADMIN PRIVILEGES</span>
              <span className="text-[9px]" style={{ color: `var(--accent-red)${theme === 'dark' ? '80' : '80'}` }}>[ HIGH SECURITY ]</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <span style={{ color: 'var(--accent-red)' }}>[!]</span> GAME CONTROL
                </div>
                <span className="text-[10px] tracking-widest" style={{ color: 'var(--accent-red)' }}>ENABLED</span>
              </div>
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <span style={{ color: 'var(--accent-red)' }}>[!]</span> LIVE MONITORING
                </div>
                <span className="text-[10px] tracking-widest" style={{ color: 'var(--accent-red)' }}>ACTIVE</span>
              </div>
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <span style={{ color: 'var(--accent-red)' }}>[!]</span> PLAYER MANAGEMENT
                </div>
                <span className="text-[10px] tracking-widest" style={{ color: 'var(--accent-red)' }}>AVAILABLE</span>
              </div>
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <span style={{ color: 'var(--accent-red)' }}>[!]</span> SCORE MANAGEMENT
                </div>
                <span className="text-[10px] tracking-widest" style={{ color: 'var(--accent-red)' }}>RESTRICTED</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
