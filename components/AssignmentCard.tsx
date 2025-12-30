
import React, { useState } from 'react';
import { Assignment, AssignmentStatus, AuthRole } from '../types';

interface AssignmentCardProps {
  assignment: Assignment;
  onEdit: (a: Assignment) => void;
  onUpdateStatus: (id: string, newStatus: AssignmentStatus, comment: string) => void;
  onDelete: (id: string) => void;
  currentUserRole: AuthRole;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, onEdit, onUpdateStatus, onDelete, currentUserRole }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [updateText, setUpdateText] = useState('');
  const [newStatus, setNewStatus] = useState<AssignmentStatus>(assignment.status);

  const statusStyles = {
    Completed: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    Pending: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    Blocked: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
    InProgress: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
  };

  const statusIcons = {
    Completed: 'fa-check-circle',
    Pending: 'fa-clock',
    Blocked: 'fa-ban',
    InProgress: 'fa-spinner animate-spin-slow',
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateText.trim()) return;
    onUpdateStatus(assignment.taskId, newStatus, updateText);
    setUpdateText('');
  };

  return (
    <div className={`group relative border transition-all duration-500 glass hover:bg-zinc-900/90 ${assignment.status === 'Completed' ? 'border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'border-white/5'} ${isExpanded ? 'ring-1 ring-blue-500/30' : ''}`}>
      {/* HUD Corner Brackets */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />
      
      {/* Mini Card View */}
      <div 
        className="p-8 cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-start mb-6">
          <span className="mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold opacity-60">{assignment.taskId}</span>
          <div className={`px-2.5 py-1 rounded-sm flex items-center gap-2 text-[8px] mono font-black uppercase ${statusStyles[assignment.status]}`}>
            <i className={`fa-solid ${statusIcons[assignment.status]}`}></i>
            {assignment.status}
          </div>
        </div>

        <h4 className="text-2xl font-black uppercase mb-8 text-zinc-200 group-hover:text-blue-400 transition-colors leading-tight tracking-tight max-w-[90%]">
          {assignment.taskTitle}
        </h4>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <i className="fa-solid fa-user text-[14px] text-blue-400/50"></i>
          </div>
          <div>
            <span className="block text-[8px] mono text-zinc-500 uppercase tracking-widest mb-1">TARGET_AGENT</span>
            <span className="text-base font-bold text-zinc-300 tracking-tight">{assignment.assignedTo}</span>
          </div>
        </div>

        <div className="flex justify-between items-end text-[9px] mono text-zinc-500 uppercase font-bold pt-6 border-t border-white/5">
          <div className="space-y-2">
            <div className="flex flex-col">
              <span className="opacity-40 text-[7px] mb-0.5">ASSIGNED_DATE:</span>
              <span className="text-blue-400/80">{formatDate(assignment.assignedDate)}</span>
            </div>
            <div className="flex flex-col">
              <span className="opacity-40 text-[7px] mb-0.5">DEADLINE:</span>
              <span className="text-zinc-400">{formatDate(assignment.dueDate)}</span>
            </div>
          </div>
          <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'} text-blue-500/50 text-[10px]`}></i>
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="px-8 pb-8 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="py-6 space-y-4">
            <h5 className="text-[10px] mono uppercase text-blue-400 font-bold tracking-widest border-l-2 border-blue-500/50 pl-3">Transmit_Daily_Update</h5>
            
            <form onSubmit={handleStatusSubmit} className="space-y-3">
              <div className="flex gap-2">
                {(['Pending', 'InProgress', 'Completed', 'Blocked'] as AssignmentStatus[]).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNewStatus(s)}
                    className={`flex-grow py-2 text-[8px] mono uppercase font-black border transition-all rounded-sm ${newStatus === s ? statusStyles[s] : 'border-white/5 text-zinc-600 hover:text-white'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <textarea
                className="w-full bg-black/40 border border-white/10 rounded-sm px-3 py-2 text-xs text-white focus:border-blue-500/50 outline-none resize-none h-20 placeholder-zinc-700"
                placeholder="Log progress or incidents..."
                value={updateText}
                onChange={e => setUpdateText(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!updateText.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 py-2.5 text-[9px] mono font-black uppercase text-white tracking-widest transition-all disabled:opacity-30 border border-blue-400/50"
              >
                COMMIT_LOG_ENTRY
              </button>
            </form>
          </div>

          <div className="space-y-4 mt-4">
            <h5 className="text-[10px] mono uppercase text-zinc-500 font-bold tracking-widest border-l-2 border-zinc-700 pl-3">Log_History</h5>
            <div className="max-h-60 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {assignment.updates.length > 0 ? (
                assignment.updates.slice().reverse().map((upd) => (
                  <div key={upd.id} className="p-3 bg-white/5 border border-white/5 rounded-sm">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className={`text-[8px] mono font-black uppercase px-1.5 py-0.5 rounded-sm ${statusStyles[upd.status]}`}>
                        {upd.status}
                      </span>
                      <span className="text-[8px] mono text-zinc-600">{new Date(upd.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed italic">"{upd.text}"</p>
                  </div>
                ))
              ) : (
                <div className="text-[9px] mono text-zinc-700 italic text-center py-4">No historical logs available.</div>
              )}
            </div>
          </div>

          <div className="mt-8 flex gap-4 pt-4 border-t border-white/5">
            {currentUserRole === 'ADMIN' && (
              <>
                <button 
                  onClick={() => onEdit(assignment)}
                  className="flex-grow py-2.5 border border-blue-500/20 hover:bg-blue-500/10 text-blue-400 text-[9px] mono font-black uppercase tracking-widest transition-all"
                >
                  Update_Record
                </button>
                <button 
                  onClick={() => onDelete(assignment.taskId)}
                  className="px-6 py-2.5 border border-rose-500/20 hover:bg-rose-500/10 text-rose-400 text-[9px] mono font-black uppercase tracking-widest transition-all"
                >
                  Purge
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentCard;
