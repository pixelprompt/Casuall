
import React from 'react';
import { TeamMember } from '../types';

interface MemberCardProps {
  member: TeamMember;
}

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const colorMap: Record<string, string> = {
    blue: 'border-blue-500/30 hover:border-blue-400 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]',
    purple: 'border-purple-500/30 hover:border-purple-400 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]',
    rose: 'border-rose-500/30 hover:border-rose-400 group-hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]',
    emerald: 'border-emerald-500/30 hover:border-emerald-400 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    amber: 'border-amber-500/30 hover:border-amber-400 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]',
    cyan: 'border-cyan-500/30 hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]',
    indigo: 'border-indigo-500/30 hover:border-indigo-400 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]',
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

  const bgAccent: Record<string, string> = {
    blue: 'bg-blue-500/10',
    purple: 'bg-purple-500/10',
    rose: 'bg-rose-500/10',
    emerald: 'bg-emerald-500/10',
    amber: 'bg-amber-500/10',
    cyan: 'bg-cyan-500/10',
    indigo: 'bg-indigo-500/10',
  };

  const sizeClass = {
    small: 'col-span-12 md:col-span-6 lg:col-span-3 h-auto',
    medium: 'col-span-12 md:col-span-6 lg:col-span-4 h-auto',
    large: 'col-span-12 md:col-span-12 lg:col-span-6 h-auto',
    tall: 'col-span-12 md:col-span-6 lg:col-span-3 row-span-2 h-auto',
  };

  return (
    <div className={`group relative flex flex-col border transition-all duration-500 bg-zinc-900/50 hover:bg-zinc-900/80 backdrop-blur-sm overflow-hidden ${colorMap[member.color]} ${sizeClass[member.size]}`}>
      {/* Background patterns */}
      <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
        <i className={`fa-solid ${member.icon} text-6xl`}></i>
      </div>
      
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className={`text-[10px] uppercase tracking-[0.3em] mono font-bold mb-1 block ${accentColor[member.color]}`}>
              {member.category}
            </span>
            <h3 className="text-2xl font-bold tracking-tight uppercase">{member.name}</h3>
          </div>
          <div className={`w-12 h-12 flex items-center justify-center rounded border border-white/10 ${bgAccent[member.color]}`}>
            <i className={`fa-solid ${member.icon} ${accentColor[member.color]} text-xl`}></i>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-grow space-y-3">
          {member.tasks.map((task, idx) => (
            <div key={idx} className="flex items-start gap-3 group/item">
              <div className={`mt-1.5 w-1 h-1 rounded-full ${bgAccent[member.color].replace('/10', '/60')}`} />
              <div className="flex justify-between w-full border-b border-white/5 pb-1 group-hover/item:border-white/20 transition-colors">
                <span className="text-sm text-zinc-400 group-hover/item:text-zinc-200 transition-colors">
                  {task.label}
                </span>
                {task.count && (
                  <span className={`text-[10px] mono font-bold px-1.5 py-0.5 rounded border border-white/10 ${accentColor[member.color]}`}>
                    {task.count}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-between opacity-50 text-[10px] mono uppercase">
          <span>Module_ID: {member.id.toUpperCase()}_04</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Status: Operational
          </span>
        </div>
      </div>

      {/* Hover decoration corner */}
      <div className={`absolute bottom-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}>
        <div className={`absolute bottom-0 right-0 w-2 h-0.5 ${bgAccent[member.color].replace('/10', '')}`}></div>
        <div className={`absolute bottom-0 right-0 h-2 w-0.5 ${bgAccent[member.color].replace('/10', '')}`}></div>
      </div>
    </div>
  );
};

export default MemberCard;
