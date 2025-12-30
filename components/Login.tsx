
import React, { useState, useEffect } from 'react';
import { AuthRole, User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [bootSequence, setBootSequence] = useState(0);

  // Decorative boot sequence effect
  useEffect(() => {
    if (isLoggingIn) {
      const interval = setInterval(() => {
        setBootSequence(prev => (prev < 100 ? prev + Math.floor(Math.random() * 15) : 100));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isLoggingIn]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    // Simulate system handshake
    setTimeout(() => {
      if (username === 'casuallworkupdate@123' && password === 'Casuall@123') {
        onLogin({ username, role: 'ADMIN' });
      } else if (username === 'casuall@14' && password === 'casuall@14') {
        onLogin({ username, role: 'USER' });
      } else {
        setError('CRITICAL_ERROR: ACCESS_DENIED_INVALID_TOKEN');
        setIsLoggingIn(false);
        setBootSequence(0);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden">
      {/* Background Tech Decor - Radial Glows from screenshot */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-[70%] -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/20 blur-[150px] rounded-full opacity-40" />
        <div className="absolute top-1/2 left-1/2 translate-x-[20%] -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/10 blur-[150px] rounded-full opacity-30" />
        
        <svg width="100%" height="100%" className="opacity-5">
          <pattern id="gridLogin" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#gridLogin)" />
        </svg>
      </div>

      <div className="relative w-full max-w-md p-12 glass border-white/5 animate-hud">
        {/* Main Outer Corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500/40" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500/40" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500/40" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500/40" />

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 px-3 py-1 border border-blue-500/30 bg-blue-500/5 rounded-sm mb-8">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            <span className="mono text-[8px] uppercase tracking-[0.4em] text-blue-400 font-black">SECURE_PROTOCOL_V4</span>
          </div>

          {/* Title with Box Frame as seen in screenshot */}
          <div className="relative inline-block mb-8 px-8 py-4">
             <div className="absolute inset-0 border border-blue-400/60 pointer-events-none" />
             <h1 className="text-4xl font-black uppercase tracking-tighter italic glow-text text-white leading-none">
               Casuall_Camping
             </h1>
          </div>
          
          <p className="text-[9px] mono text-zinc-500 uppercase tracking-[0.3em] font-bold">Identification Required for Node Uplink</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="block text-[8px] mono uppercase text-zinc-600 tracking-[0.3em] font-black">AGENT_IDENTIFIER</label>
            <div className="relative">
              <input
                type="text"
                required
                disabled={isLoggingIn}
                className="w-full bg-black/40 border border-white/10 rounded-sm px-5 py-4 text-sm focus:border-blue-500/50 outline-none transition-all text-white placeholder-zinc-800 mono tracking-wider"
                placeholder="USER_ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <i className="fa-solid fa-user absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700 text-xs"></i>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[8px] mono uppercase text-zinc-600 tracking-[0.3em] font-black">ACCESS_TOKEN</label>
            <div className="relative">
              <input
                type="password"
                required
                disabled={isLoggingIn}
                className="w-full bg-black/40 border border-white/10 rounded-sm px-5 py-4 text-sm focus:border-blue-500/50 outline-none transition-all text-white placeholder-zinc-800 mono tracking-wider"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <i className="fa-solid fa-key absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700 text-xs"></i>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/5 border border-rose-500/20 text-rose-400 text-[9px] mono uppercase text-center tracking-widest animate-pulse font-bold">
              <i className="fa-solid fa-triangle-exclamation mr-3"></i>
              {error}
            </div>
          )}

          {isLoggingIn && (
            <div className="space-y-2">
              <div className="flex justify-between text-[8px] mono text-blue-400/60 uppercase tracking-widest font-black">
                <span>Synchronizing_Neural_Link</span>
                <span>{Math.min(bootSequence, 100)}%</span>
              </div>
              <div className="h-[2px] w-full bg-white/5 overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-300 shadow-[0_0_10px_#3b82f6]" style={{ width: `${bootSequence}%` }} />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-[#1e3a8a]/60 hover:bg-[#1e40af] disabled:bg-zinc-900 disabled:text-zinc-700 disabled:border-white/5 text-white py-5 font-black uppercase tracking-[0.4em] text-[10px] transition-all rounded-sm shadow-[0_0_40px_rgba(59,130,246,0.1)] border border-blue-500/30 flex items-center justify-center gap-4 group"
          >
            {isLoggingIn ? (
              <i className="fa-solid fa-circle-notch animate-spin text-lg"></i>
            ) : (
              <>
                INITIALIZE_UPLINK
                <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center pt-8 border-t border-white/5">
          <span className="text-[8px] mono text-zinc-700 uppercase tracking-[0.3em] leading-relaxed block font-bold">
            RESTRICTED TERMINAL // KMV CORP <br />
            UNAUTHORIZED ACCESS IS FELONY
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
