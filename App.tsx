
import React, { useState, useEffect } from 'react';
import MemberCard from './components/MemberCard';
import ChatBot from './components/ChatBot';
import Tracker from './components/Tracker';
import Login from './components/Login';
import { TEAM_DATA } from './constants';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('KMV_AUTH_SESSION_V4');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('KMV_AUTH_SESSION_V4');
      }
    }
    setIsAuthChecking(false);
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('KMV_AUTH_SESSION_V4', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    localStorage.removeItem('KMV_AUTH_SESSION_V4');
    setUser(null);
    alert("Logged out successfully");
  };

  if (isAuthChecking) return <div className="bg-black min-h-screen flex items-center justify-center mono text-blue-500 animate-pulse text-[10px] tracking-[0.5em]">SYSTEM_BOOT_PENDING...</div>;
  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen pb-32 selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#020202]">
        <div className="absolute top-[5%] left-[5%] w-[1200px] h-[1200px] bg-blue-900/[0.07] blur-[200px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] right-[-5%] w-[1000px] h-[1000px] bg-purple-900/[0.05] blur-[220px] rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-[-10%] left-[20%] w-[900px] h-[900px] bg-indigo-900/[0.04] blur-[180px] rounded-full" />
        
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.12]">
          <defs>
            <pattern id="gridMain" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
            </pattern>
            <pattern id="dotPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="rgba(255,255,255,0.05)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridMain)" />
          <rect width="100%" height="100%" fill="url(#dotPattern)" />
        </svg>
      </div>

      {/* Logout / User HUD Panel */}
      <div className="fixed top-8 right-8 z-[60] flex items-center gap-6 group">
        <div className="flex flex-col items-end opacity-40 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <span className="mono text-[10px] text-blue-400 font-black tracking-widest uppercase">NODE_{user.role}_ACCESS</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
          </div>
          <span className="mono text-[8px] text-zinc-500 uppercase tracking-widest font-bold mt-1">AGENT::{user.username.split('@')[0].toUpperCase()}</span>
        </div>
        <button 
          onClick={handleLogout}
          className="w-12 h-12 flex items-center justify-center glass border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/50 transition-all rounded-sm shadow-[0_0_20px_rgba(244,63,94,0.1)] active:scale-90"
          title="TERMINATE_SESSION"
        >
          <i className="fa-solid fa-power-off text-lg"></i>
        </button>
      </div>

      {/* Decorative Sidebar HUD */}
      <aside className="fixed top-1/2 left-8 -translate-y-1/2 hidden 2xl:flex flex-col gap-20 opacity-20 pointer-events-none text-[9px] mono uppercase tracking-[1em] [writing-mode:vertical-lr] z-50 font-black text-zinc-600">
        <span>OPERATIONAL_SECURITY_LAYER_07</span>
        <div className="h-40 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent mx-auto" />
        <span>NODE_UPLINK::{user.role}</span>
      </aside>

      <aside className="fixed top-1/2 right-8 -translate-y-1/2 hidden 2xl:flex flex-col gap-20 opacity-20 pointer-events-none text-[9px] mono uppercase tracking-[1em] [writing-mode:vertical-lr] rotate-180 z-50 font-black text-zinc-600">
        <span>COORDINATE_LOCK_ENGAGED</span>
        <div className="h-40 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent mx-auto" />
        <span>MISSION_CONTRO_V4.0</span>
      </aside>

      {/* Header Section */}
      <header className="relative pt-48 pb-24 px-6 lg:px-32 z-10">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-flex items-center gap-4 px-5 py-2 mb-10 border border-white/10 bg-white/[0.01] backdrop-blur-xl rounded-sm">
              <div className="relative">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping absolute" />
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              </div>
              <span className="text-[10px] mono font-black text-blue-400/70 uppercase tracking-[0.5em]">
                AGENT_READY // ACCESS_LEVEL::{user.role}
              </span>
            </div>
            
            <div className="relative inline-block mb-12 group">
              <div className="absolute -inset-x-8 -inset-y-6 border-2 border-blue-400/40 pointer-events-none rounded-sm">
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-blue-400" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-blue-400" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-blue-400" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-blue-400" />
              </div>

              <h1 className="text-8xl lg:text-[11rem] font-black uppercase tracking-tighter leading-none glow-text italic text-zinc-50 font-inter relative z-10">
                Casuall <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-400 to-zinc-700">Camping</span>
              </h1>
            </div>
            
            <p className="max-w-2xl text-zinc-500 text-2xl font-light leading-snug border-l-4 border-blue-600/30 pl-10 italic">
              Synchronizing high-performance workflows across the KMV Node Network. Authorized access granted for Node {user.role}.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Sections */}
      <main className="relative px-6 lg:px-32 z-10 space-y-56">
        
        {/* Team Grid */}
        <section>
          <div className="flex items-center gap-8 mb-20 border-b border-white/5 pb-8">
            <h2 className="text-5xl font-black uppercase tracking-tighter italic text-zinc-100 flex items-center gap-4">
              <span className="text-blue-500/50">#</span> Team_Matrix
            </h2>
            <div className="flex-grow h-px bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <div className="grid grid-cols-12 gap-10 max-w-[1800px] mx-auto">
            {TEAM_DATA.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}

            {/* System Telemetry Module */}
            <div className="col-span-12 lg:col-span-3 p-12 glass border-white/5 bg-zinc-900/10 backdrop-blur-3xl relative overflow-hidden group">
               <div className="card-corner corner-tl border-white/10 group-hover:border-blue-500/50" />
               <div className="card-corner corner-tr border-white/10 group-hover:border-blue-500/50" />
               <div className="card-corner corner-bl border-white/10 group-hover:border-blue-500/50" />
               <div className="card-corner corner-br border-white/10 group-hover:border-blue-500/50" />
               
               <span className="text-[9px] mono uppercase text-zinc-600 block mb-6 tracking-[0.4em] font-black">System_Topology</span>
               <h4 className="text-2xl font-black uppercase mb-12 tracking-[0.1em] text-zinc-200">Global_Pulse</h4>
               
               <div className="space-y-10">
                 {[
                   { label: 'Edge-Gateway', state: 'ONLINE', bar: 94, color: 'blue' },
                   { label: 'Neural-Sync', state: 'LINKED', bar: 52, color: 'blue' },
                   { label: 'Cipher-Vault', state: 'SECURED', bar: 88, color: 'blue' },
                 ].map((item, i) => (
                   <div key={i}>
                     <div className="flex justify-between text-[10px] mono uppercase mb-3 tracking-[0.2em] font-black">
                       <span className="text-zinc-500">{item.label}</span>
                       <span className="text-blue-500 animate-pulse">{item.state}</span>
                     </div>
                     <div className="h-[3px] bg-white/5 w-full relative">
                       <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${item.bar}%` }} />
                       <div className="absolute top-0 right-0 h-full w-[2px] bg-white/40" />
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </section>

        {/* Assignment Tracker Section - Visible to all, but restricted actions inside Tracker component */}
        <section id="assignment-tracker" className="max-w-[1800px] mx-auto pt-24 border-t border-white/5">
          <Tracker currentUserRole={user.role} />
        </section>
      </main>

      {/* HUD Floating Layer */}
      <ChatBot />

      {/* Cinematic Footer */}
      <footer className="mt-80 px-10 lg:px-32 pb-24 opacity-40 relative z-10 border-t border-white/5 pt-20">
        <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row justify-between items-end gap-16">
          <div className="flex flex-col gap-6">
            <span className="text-[14px] mono uppercase tracking-[0.5em] font-black text-zinc-400">OPERATIONAL_CONTROL_INTERFACE</span>
            <span className="text-xs font-light text-zinc-600 max-w-2xl leading-relaxed italic">
              Proprietary software for authorized KMV Node Agents. Operational integrity is non-negotiable. 
              Logs are recorded for periodic auditing by Central Intelligence Node.
            </span>
          </div>
          <div className="text-[10px] mono uppercase text-right space-y-3 font-black tracking-[0.3em]">
             <div className="text-zinc-500">SYSTEM_TIME::{new Date().toISOString().split('T')[1].slice(0, 8)}</div>
             <div className="text-blue-500/70 underline decoration-blue-500/20 underline-offset-8">UPLINK::STABLE // SESSION::{user.username.toUpperCase()}</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
