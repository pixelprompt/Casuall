
import React from 'react';
import { TeamMember } from '../types';

interface MemberCardProps {
  member: TeamMember;
}

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const colorMap: Record<string, string> = {
    blue: 'border-blue-500/20 hover:border-blue-400 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]',
    purple: 'border-purple-500/20 hover:border-purple-400 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]',
    rose: 'border-rose-500/20 hover:border-rose-400 group-hover:shadow-[0_0_30px_rgba(244,63,94,0.1)]',
    emerald: 'border-emerald-500/20 hover:border-emerald-400 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]',
    amber: 'border-amber-500/20 hover:border-amber-400 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]',
    cyan: 'border-cyan-500/20 hover:border-cyan-400 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]',
    indigo: 'border-indigo-500/20 hover:border-indigo-400 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]',
  };

  const accentColor: Record<string, string> = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    rose: 'text-rose-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    cyan: 'text-cyan-400',
    indigo: 'text-indigo-400',
  };

  const accentBg: Record<string, string> = {
    blue: 'bg-blue-400',
    purple: 'bg-purple-400',
    rose: 'bg-rose-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    cyan: 'bg-cyan-400',
    indigo: 'bg-indigo-400',
  };

  const sizeClass = {
    small: 'col-span-12 md:col-span-6 lg:col-span-3',
    medium: 'col-span-12 md:col-span-6 lg:col-span-4',
    large: 'col-span-12 lg:col-span-6',
    tall: 'col-span-12 md:col-span-6 lg:col-span-3 row-span-1 md:row-span-2',
  };

  return (
    <div className={`group relative flex flex-col border border-white/5 transition-all duration-700 bg-zinc-900/20 hover:bg-zinc-900/40 backdrop-blur-md overflow-hidden ${colorMap[member.color]} ${sizeClass[member.size]}`}>
      {/* Corner Brackets */}
      <div className={`card-corner corner-tl group-hover:border-white/40 transition-colors`} />
      <div className={`card-corner corner-tr group-hover:border-white/40 transition-colors`} />
      <div className={`card-corner corner-bl group-hover:border-white/40 transition-colors`} />
      <div className={`card-corner corner-br group-hover:border-white/40 transition-colors`} />

      {/* Background Graphic Decor - Scaled for Mobile */}
      <div className="absolute -top-6 -right-6 md:-top-10 md:-right-10 opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-opacity duration-700">
        <i className={`fa-solid ${member.icon} text-[120px] md:text-[180px]`}></i>
      </div>
      
      <div className="p-6 md:p-8 h-full flex flex-col relative z-10">
        {/* Header HUD Style */}
        <div className="flex items-start justify-between mb-6 md:mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className={`px-2 py-0.5 rounded-sm text-[8px] md:text-[9px] uppercase tracking-[0.2em] mono font-bold border border-white/10 ${accentColor[member.color]} bg-white/5`}>
                SYS_NODE_{member.id.toUpperCase().slice(0, 3)}
              </span>
              <div className="w-8 md:w-12 h-[1px] bg-white/10"></div>
            </div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none group-hover:tracking-normal transition-all duration-700">
              {member.name}
            </h3>
            <span className="text-[9px] md:text-[10px] text-zinc-500 uppercase tracking-widest block mt-1 mono">
              {member.category}
            </span>
          </div>
          <div className={`w-10 h-10 md:w-14 md:h-14 flex items-center justify-center border border-white/5 bg-black/40 group-hover:border-white/20 transition-all`}>
            <i className={`fa-solid ${member.icon} ${accentColor[member.color]} text-xl md:text-2xl`}></i>
          </div>
        </div>

        {/* Task List with HUD Visuals */}
        <div className="flex-grow space-y-3 md:space-y-4">
          {member.tasks.map((task, idx) => (
            <div key={idx} className="group/item relative">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] md:text-xs uppercase tracking-wider text-zinc-400 group-hover/item:text-white transition-colors">
                  {task.label}
                </span>
                {task.count && (
                  <span className={`text-[9px] md:text-[10px] mono font-bold ${accentColor[member.color]}`}>
                    VAL::{task.count.toString().padStart(2, '0')}
                  </span>
                )}
              </div>
              <div className="h-[2px] w-full bg-white/5 relative overflow-hidden">
                <div 
                  className={`h-full absolute left-0 top-0 transition-all duration-1000 ease-out group-hover:opacity-100 opacity-60 ${accentBg[member.color]}`} 
                  style={{ width: `${Math.random() * 40 + 60}%` }} 
                />
              </div>
            </div>
          ))}
        </div>

        {/* Technical Footer */}
        <div className="mt-8 md:mt-10 flex items-center justify-between text-[8px] md:text-[9px] mono uppercase text-zinc-600">
          <div className="flex items-center gap-2 md:gap-4">
            <span className="hidden sm:inline">Lat: { (Math.random() * 90).toFixed(4) }N</span>
            <span className="sm:hidden">L:{(Math.random() * 90).toFixed(2)}N</span>
            <span className="hidden sm:inline">Lng: { (Math.random() * 180).toFixed(4) }E</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className={`w-1 h-1 rounded-full ${accentBg[member.color]} animate-pulse`}></span>
            <span>Link_Stable</span>
          </div>
        </div>
      </div>

      {/* Outer Outline (The Wireframe Look) */}
      <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 scale-[1.02] pointer-events-none transition-all duration-500" />
    </div>
  );
};

export default MemberCard;
