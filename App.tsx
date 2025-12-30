
import React from 'react';
import MemberCard from './components/MemberCard';
import ChatBot from './components/ChatBot';
import { TEAM_DATA } from './constants';

const App: React.FC = () => {
  return (
    <div className="min-h-screen pb-20 selection:bg-blue-500 selection:text-white">
      {/* Background Tech Mesh */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0 overflow-hidden">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Hero Section */}
      <header className="relative pt-24 pb-16 px-6 lg:px-20 z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-blue-500/30 bg-blue-500/5 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
          <span className="text-[10px] mono font-bold text-blue-400 uppercase tracking-widest">System Online // Version 4.0.1</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter mb-4 glow-text">
          Project <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600">Mission Control</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-zinc-500 text-lg md:text-xl font-light leading-relaxed">
          High-performance visualization for cross-departmental operations, 
          resource allocation, and project milestones tracking.
        </p>
      </header>

      {/* Dashboard Grid */}
      <main className="relative px-6 lg:px-20 z-10">
        <div className="grid grid-cols-12 gap-4 lg:gap-6 max-w-[1600px] mx-auto auto-rows-min">
          {TEAM_DATA.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}

          {/* Special Status Modules */}
          <div className="col-span-12 md:col-span-6 lg:col-span-3 h-auto p-6 glass border-zinc-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-widest mono text-zinc-500 block mb-1">System Health</span>
              <h3 className="text-xl font-bold mb-4 uppercase">Infrastructure</h3>
              <div className="space-y-4">
                {[
                  { label: 'Cloud Services', val: '99.9%', color: 'bg-green-500' },
                  { label: 'Security Protocols', val: 'Shielded', color: 'bg-blue-500' },
                  { label: 'Database Sync', val: 'Active', color: 'bg-emerald-500' },
                ].map((s, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">{s.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="mono">{s.val}</span>
                      <div className={`w-2 h-2 rounded-full ${s.color}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-white/5">
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-3/4 animate-pulse"></div>
              </div>
              <span className="text-[9px] mono opacity-50 block mt-2">BUFFER_ALLOCATION_OPTIMIZED</span>
            </div>
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-3 h-auto p-6 border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[80px] group-hover:bg-blue-500/10 transition-colors" />
            <span className="text-[10px] uppercase tracking-widest mono text-zinc-500 block mb-1">Next Phase</span>
            <h3 className="text-xl font-bold uppercase mb-2">Launch Protocol</h3>
            <p className="text-sm text-zinc-500 mb-6">Preparing final environment for global deployment of Agency v4 Assets.</p>
            <div className="flex gap-2">
              <button className="flex-grow bg-white text-black py-2 text-xs font-bold uppercase tracking-tighter hover:bg-zinc-200 transition-colors">
                Execute
              </button>
              <button className="w-10 flex items-center justify-center border border-white/10 hover:border-white/30 transition-colors">
                <i className="fa-solid fa-bolt text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Elements */}
      <ChatBot />

      {/* Footer Decoration */}
      <footer className="mt-32 px-20 pb-12 opacity-30 text-center">
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent mb-8" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] mono uppercase tracking-widest">
          <span>&copy; 2024 KMV Corp - Unified Workflow Interface</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-blue-400 transition-colors">Documentation</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Security</a>
          </div>
          <span>Sync Status: Nominal</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
