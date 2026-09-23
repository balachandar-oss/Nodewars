import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Crown, Lock } from 'lucide-react';
import { API_URL } from '../utils/api';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        setError(data.error || 'That didn\'t work, please try again');
      }
    } catch (err) {
      setError('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 md:p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">

        <div className="hidden md:flex md:col-span-3 flex-col justify-center items-center opacity-70 pointer-events-none">
          <div className="clay-inset w-28 h-28 rounded-full flex items-center justify-center mb-6">
            <Lock size={48} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <div className="text-center space-y-2">
            <div className="text-sm font-display font-bold" style={{ color: 'var(--text-primary)' }}>Admin Access</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Manage the workshop and game</div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-6 flex flex-col justify-center">
          <div className="glass-panel p-10 relative w-full animate-slide-in">
            <div className="text-center mb-8 pb-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div className="clay-inset w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown size={28} style={{ color: 'var(--accent-purple)' }} />
              </div>
              <h1 className="text-3xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
                Admin sign in
              </h1>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                Enter your admin credentials to continue
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl text-sm flex items-start gap-3 animate-slide-in" style={{ backgroundColor: 'rgba(224, 124, 155, 0.1)', color: '#c14d72' }}>
                <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Admin username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="clay-inset w-full px-4 py-3 text-sm focus:outline-none transition-all"
                  style={{ color: 'var(--text-primary)' }}
                  placeholder="Enter your username"
                  disabled={loading}
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
                  className="clay-inset w-full px-4 py-3 text-sm focus:outline-none transition-all"
                  style={{ color: 'var(--text-primary)' }}
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="clay-button w-full py-4 mt-6 flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'white transparent white white' }}></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 text-center" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={() => navigate('/login')}
                className="text-sm transition-colors flex justify-center items-center gap-1 mx-auto cursor-pointer"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-purple)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                ← Back to login
              </button>
            </div>
          </div>
        </div>

        <div className="hidden md:flex md:col-span-3 flex-col justify-center">
          <div className="clay-panel p-6">
            <h3 className="text-sm font-display font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              What admins can do
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-primary)' }}>Game control</span>
                <span className="chip chip-mint">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-primary)' }}>Live monitoring</span>
                <span className="chip chip-mint">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-primary)' }}>Player management</span>
                <span className="chip chip-sky">Available</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-primary)' }}>Score management</span>
                <span className="chip chip-rose">Restricted</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
