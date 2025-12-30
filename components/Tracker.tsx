
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Assignment, AssignmentStatus, AssignmentUpdate, AuthRole } from '../types';
import AssignmentForm from './AssignmentForm';
import AssignmentCard from './AssignmentCard';

interface TrackerProps {
  currentUserRole: AuthRole;
}

const Tracker: React.FC<TrackerProps> = ({ currentUserRole }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'name'>('date');
  const [isInitialized, setIsInitialized] = useState(false);

  // Persistence - Load
  useEffect(() => {
    const saved = localStorage.getItem('MISSION_LEDGER_V2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setAssignments(parsed);
        }
      } catch (e) {
        console.error("Failed to parse mission ledger", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Persistence - Save (only after initial load)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('MISSION_LEDGER_V2', JSON.stringify(assignments));
    }
  }, [assignments, isInitialized]);

  const handleAddOrUpdate = useCallback((assignment: Assignment) => {
    console.log("Saving assignment:", assignment);
    setAssignments(prev => {
      const exists = prev.find(a => a.taskId === assignment.taskId);
      if (exists) {
        return prev.map(a => a.taskId === assignment.taskId ? assignment : a);
      }
      return [assignment, ...prev];
    });
    setIsFormOpen(false);
    setEditingAssignment(null);
  }, []);

  const handleStatusUpdate = (taskId: string, newStatus: AssignmentStatus, comment: string) => {
    setAssignments(prev => prev.map(a => {
      if (a.taskId === taskId) {
        const newUpdate: AssignmentUpdate = {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toISOString(),
          text: comment,
          status: newStatus,
          author: 'SYSTEM_ADMIN'
        };
        
        return {
          ...a,
          status: newStatus,
          lastUpdated: new Date().toISOString(),
          updates: [...a.updates, newUpdate]
        };
      }
      return a;
    }));
  };

  const handleDelete = (taskId: string) => {
    if (currentUserRole !== 'ADMIN') return;
    if (window.confirm(`DANGER: PURGE RECORD ${taskId}? This action is irreversible.`)) {
      setAssignments(prev => prev.filter(a => a.taskId !== taskId));
    }
  };

  const exportToCSV = () => {
    if (assignments.length === 0) return;
    const headers = "ID,Task,Assignee,Category,Deadline,Status,Created,LastUpdated";
    const rows = assignments.map(a => 
      `${a.taskId},"${a.taskTitle}","${a.assignedTo}","${a.category}",${a.dueDate},${a.status},${a.assignedDate},${a.lastUpdated}`
    ).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LEDGER_EXPORT_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredAssignments = useMemo(() => {
    return assignments
      .filter(a => {
        const matchesStatus = filter === 'All' || a.status === filter;
        const matchesSearch = a.taskTitle.toLowerCase().includes(search.toLowerCase()) || 
                             a.assignedTo.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'date') return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        if (sortBy === 'name') return a.assignedTo.localeCompare(b.assignedTo);
        return 0;
      });
  }, [assignments, filter, search, sortBy]);

  const stats = useMemo(() => ({
    total: assignments.length,
    completed: assignments.filter(a => a.status === 'Completed').length,
    pending: assignments.filter(a => a.status === 'Pending' || a.status === 'InProgress').length,
    blocked: assignments.filter(a => a.status === 'Blocked').length,
  }), [assignments]);

  const openAddForm = () => {
    console.log("Opening Add Entry Form...");
    setEditingAssignment(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-12 animate-hud">
      {/* HUD Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-end lg:items-center gap-6 border-b border-white/5 pb-8 relative z-20">
        <div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2 italic glow-text">Assignment_Ledger</h2>
          <p className="text-zinc-600 mono text-[10px] md:text-xs uppercase tracking-widest opacity-60">
            SYNCHRONIZED DAILY LOG // ACTIVE_OPS: {stats.pending} // EFFICIENCY: {stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center justify-end w-full lg:w-auto">
          <div className="relative group">
            <input 
              type="text"
              className="bg-zinc-900/40 border border-white/10 px-4 py-2.5 pl-10 rounded-sm text-sm mono text-zinc-300 focus:border-blue-500/50 outline-none w-full md:w-64 transition-all"
              placeholder="Query Ledger..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors"></i>
          </div>

          {currentUserRole === 'ADMIN' && (
            <button 
              onClick={openAddForm}
              className="flex items-center gap-2 px-6 py-2.5 rounded-sm font-black uppercase text-xs tracking-[0.2em] transition-all active:scale-95 border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)] bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] cursor-pointer relative z-30"
            >
              <i className="fa-solid fa-plus"></i>
              ADD_ENTRY
            </button>
          )}

          <button 
            onClick={exportToCSV}
            className="w-10 h-10 flex items-center justify-center border border-white/10 rounded-sm hover:bg-white/5 transition-colors text-zinc-400 hover:text-white"
            title="Export CSV"
          >
            <i className="fa-solid fa-file-export"></i>
          </button>
        </div>
      </div>

      {/* Grid Filters */}
      <div className="flex flex-wrap gap-6 items-center border-y border-white/5 py-8 relative z-10">
        <div className="flex gap-4 items-center">
          <span className="mono text-[10px] uppercase text-zinc-600 tracking-widest font-bold opacity-60">FILTER_SECTOR:</span>
          <div className="flex gap-3">
            {['All', 'InProgress', 'Pending', 'Completed', 'Blocked'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[9px] mono uppercase tracking-[0.2em] px-4 py-1.5 rounded-sm border transition-all font-black ${filter === f ? 'bg-blue-500/20 border-blue-400 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-white/5 text-zinc-700 hover:text-zinc-200 hover:border-white/10'}`}
              >
                {f === 'InProgress' ? 'IN_PROGRESS' : f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-4 items-center ml-auto">
          <span className="mono text-[10px] uppercase text-zinc-600 tracking-widest font-bold opacity-60">SEQUENCE_BY:</span>
          <button 
            onClick={() => {
              const order: Array<'date' | 'status' | 'name'> = ['date', 'status', 'name'];
              const next = order[(order.indexOf(sortBy) + 1) % order.length];
              setSortBy(next);
            }}
            className="text-[9px] mono uppercase text-blue-400 hover:text-blue-300 transition-colors font-black border-b border-blue-500/30 pb-0.5 tracking-widest"
          >
            {sortBy === 'date' ? 'LAST_SYNC_TIME' : sortBy === 'status' ? 'PROTOCOL_STATUS' : 'AGENT_ID'}
          </button>
        </div>
      </div>

      {/* Assignments Grid */}
      {filteredAssignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10">
          {filteredAssignments.map(a => (
            <AssignmentCard 
              key={a.taskId} 
              assignment={a} 
              onEdit={(a) => {
                setEditingAssignment(a);
                setIsFormOpen(true);
              }}
              onUpdateStatus={handleStatusUpdate}
              onDelete={handleDelete}
              currentUserRole={currentUserRole}
            />
          ))}
        </div>
      ) : (
        <div className="py-40 text-center flex flex-col items-center justify-center opacity-40 relative z-10">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-500/5 blur-[80px] rounded-full scale-[2.5]" />
             <i className="fa-solid fa-satellite text-zinc-800 text-8xl relative animate-pulse"></i>
          </div>
          <p className="text-zinc-600 mono text-[10px] uppercase tracking-[0.5em] max-w-lg leading-relaxed text-center font-bold">
            NO ACTIVE ASSIGNMENTS IN SECTOR. <br />
            SYSTEM STANDBY FOR MISSION DATA.
          </p>
        </div>
      )}

      {/* Assignment Form Modal Overlay - Moved to bottom for clear stacking */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
            onClick={() => {
              setIsFormOpen(false);
              setEditingAssignment(null);
            }}
          />
          
          {/* Content */}
          <div className="w-full max-w-4xl relative z-[210] animate-in fade-in zoom-in-95 duration-300">
            <AssignmentForm 
              onSubmit={handleAddOrUpdate}
              editingAssignment={editingAssignment}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingAssignment(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Tracker;
