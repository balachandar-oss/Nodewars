import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, ShieldAlert, Cpu } from 'lucide-react';

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
      const res = await fetch('http://localhost:3001/api/auth/login', {
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

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3001/api/auth/demo-login', {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Demo login failed');
      }
    } catch (err) {
      setError('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-cyber-darker p-4 md:p-8">
      <div className="scanline"></div>
      
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-neon-blue)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT: DECORATIVE CIRCUIT/NETWORK */}
        <div className="hidden md:flex md:col-span-3 flex-col justify-center items-center opacity-40 pointer-events-none relative">
          <div className="relative">
            <Cpu size={120} className="text-neon-blue mb-8 glow-text-blue" />
            <svg className="absolute top-0 left-0 w-full h-full" overflow="visible">
               <circle cx="50%" cy="50%" r="65" fill="none" stroke="var(--color-neon-blue)" strokeWidth="1" strokeDasharray="4 8" className="animate-spin-slow opacity-50" />
               <circle cx="50%" cy="50%" r="75" fill="none" stroke="var(--color-neon-blue)" strokeWidth="0.5" opacity="0.2" />
            </svg>
          </div>
          <div className="font-mono text-[10px] text-neon-blue tracking-widest text-center space-y-1">
            <div className="text-neon-amber animate-pulse">■ SIMULATION NODE</div>
            <div>[ DECORATIVE DISPLAY ]</div>
            <div className="mt-4 pt-4 border-t border-neon-blue/30 w-full">
              NODE LAB NETWORK
            </div>
          </div>
        </div>
        
        {/* CENTER: AUTHENTICATION TERMINAL */}
        <div className="col-span-1 md:col-span-6 flex flex-col justify-center">
          <div className="glass-panel p-10 relative w-full animate-slide-in border-t-2 border-t-neon-blue border-b-2 border-b-white/5">
            <div className="text-center mb-10 border-b border-white/5 pb-6">
              <Terminal className="text-neon-blue mx-auto mb-4" size={32} />
              <h1 className="text-4xl font-title font-bold text-white tracking-widest uppercase">
                NODE LAB
              </h1>
              <h2 className="text-xs font-mono text-neon-blue tracking-widest mt-2 uppercase opacity-80">
                ENGINEERING LAB // SECURE ACCESS
              </h2>
              <div className="mt-8 font-mono text-[10px] text-white/50 tracking-widest">
                {'>'} AWAITING ENGINEER IDENTIFICATION...
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 border border-neon-red bg-neon-red/10 text-neon-red font-mono text-xs flex items-start gap-3 glow-red animate-slide-in">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <div>
                  <div className="mb-1">{'>'} AUTHENTICATION FAILED</div>
                  <div>{'>'} {error.toUpperCase()}</div>
                  <div className="mt-2 text-neon-red/70">{'>'} ACCESS DENIED</div>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-[10px] font-mono text-cyber-light/50 mb-2 tracking-widest uppercase">
                  PLAYER ID
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-blue/50 font-mono text-xs">{'>'}</div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black/40 border-b border-white/10 pl-10 pr-3 py-4 text-white font-mono text-sm focus:outline-none focus:border-neon-blue focus:bg-neon-blue/5 transition-all"
                    placeholder="ENTER PLAYER ID"
                    disabled={loading}
                    autoComplete="off"
                    spellCheck="false"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-mono text-cyber-light/50 mb-2 tracking-widest uppercase mt-6">
                  ACCESS KEY
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-blue/50 font-mono text-xs">{'>'}</div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border-b border-white/10 pl-10 pr-3 py-4 text-white font-mono text-sm focus:outline-none focus:border-neon-blue focus:bg-neon-blue/5 transition-all"
                    placeholder="ENTER ACCESS KEY"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="cyber-button w-full py-4 mt-8 flex justify-center items-center gap-2 border-neon-blue text-neon-blue hover:bg-neon-blue/10 bg-transparent"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
                    <span>[ AUTHENTICATING... ]</span>
                  </>
                ) : (
                  <span>[ {'>'}{'>'}{'>'} INITIATE ACCESS ]</span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-center">
              <button
                onClick={handleDemoLogin}
                disabled={loading}
                className="text-xs font-mono text-cyber-light/50 hover:text-neon-purple hover:glow-text-purple transition-colors flex flex-col items-center gap-1 group cursor-pointer"
              >
                <span>[ ◈ DEMO ACCESS ]</span>
                <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">TRAINING ENVIRONMENT</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: SYSTEM DIAGNOSTICS */}
        <div className="hidden md:flex md:col-span-3 flex-col justify-center">
          <div className="p-6 bg-black/20 border-l border-white/5 font-mono text-xs">
            <h3 className="text-white/50 tracking-widest mb-6 pb-2 border-b border-white/5 uppercase flex flex-col gap-1">
              <span>SYSTEM DIAGNOSTICS</span>
              <span className="text-[9px] text-neon-amber/50">[ DECORATIVE DISPLAY ]</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2 text-cyber-light">
                  <span className="text-neon-green">[✓]</span> NODE SERVER
                </div>
                <span className="text-neon-green glow-text-green text-[10px] tracking-widest">ONLINE</span>
              </div>
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2 text-cyber-light">
                  <span className="text-neon-green">[✓]</span> DATABASE
                </div>
                <span className="text-neon-green glow-text-green text-[10px] tracking-widest">ONLINE</span>
              </div>
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2 text-cyber-light">
                  <span className="text-neon-amber">[~]</span> SOCKET NETWORK
                </div>
                <span className="text-neon-amber glow-text-amber text-[10px] tracking-widest animate-pulse">STANDBY</span>
              </div>
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2 text-cyber-light">
                  <span className="text-neon-green">[✓]</span> LAB ENVIRONMENT
                </div>
                <span className="text-neon-green glow-text-green text-[10px] tracking-widest">READY</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Login;
