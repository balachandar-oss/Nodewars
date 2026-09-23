import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, ShieldAlert, CheckCircle } from 'lucide-react';
import { API_URL } from '../utils/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
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
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 md:p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">

        {/* LEFT: DECORATIVE ELEMENT */}
        <div className="hidden md:flex md:col-span-3 flex-col justify-center items-center opacity-80 pointer-events-none relative">
          <div className="clay-inset w-32 h-32 rounded-full flex items-center justify-center mb-6">
            <Crown size={64} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <div className="text-center space-y-1">
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Node Wars</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Learn, build, and hunt bugs</div>
          </div>
        </div>

        {/* CENTER: LOGIN FORM */}
        <div className="col-span-1 md:col-span-6 flex flex-col justify-center">
          <div className="clay-panel p-10 relative w-full animate-slide-in">
            <div className="text-center mb-10 pb-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div className="clay-inset w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown size={28} style={{ color: 'var(--accent-purple)' }} />
              </div>
              <h1 className="text-4xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
                Node Wars
              </h1>
              <h2 className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                Sign in to continue your mission
              </h2>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl flex items-start gap-3 animate-slide-in" style={{ backgroundColor: 'rgba(224, 124, 155, 0.1)', color: 'var(--accent-rose)' }}>
                <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                <div className="text-sm">
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Player ID
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full clay-inset px-4 py-3.5 text-sm focus:outline-none transition-all"
                  style={{ color: 'var(--text-primary)' }}
                  placeholder="Enter your player ID"
                  disabled={loading}
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full clay-inset px-4 py-3.5 text-sm focus:outline-none transition-all"
                  style={{ color: 'var(--text-primary)' }}
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="clay-button w-full py-4 mt-8 flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Log in</span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 flex justify-center" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={() => navigate('/admin/login')}
                disabled={loading}
                className="text-xs transition-colors flex flex-col items-center gap-1 group cursor-pointer"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span>Admin access</span>
                <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">Command center</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: STATUS PANEL */}
        <div className="hidden md:flex md:col-span-3 flex-col justify-center">
          <div className="glass-panel p-6">
            <h3 className="text-xs font-semibold mb-6 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
              System status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                  <CheckCircle size={14} style={{ color: 'var(--accent-mint)' }} /> Node server
                </div>
                <span className="chip chip-mint">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                  <CheckCircle size={14} style={{ color: 'var(--accent-mint)' }} /> Database
                </div>
                <span className="chip chip-mint">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                  <CheckCircle size={14} style={{ color: 'var(--accent-gold)' }} /> Live events
                </div>
                <span className="chip chip-gold">Standby</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                  <CheckCircle size={14} style={{ color: 'var(--accent-mint)' }} /> Lab environment
                </div>
                <span className="chip chip-mint">Ready</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
