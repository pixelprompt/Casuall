
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Assignment, AssignmentStatus, AssignmentUpdate, AuthRole } from '../types';
import AssignmentForm from './AssignmentForm';
import AssignmentCard from './AssignmentCard';
import { dbService } from '../services/dbService';
import { TEAM_DATA } from '../constants';

interface TrackerProps {
  currentUserRole: AuthRole;
}

const STORAGE_KEY = 'MISSION_LEDGER_V4_PERSISTENT';

const Tracker: React.FC<TrackerProps> = ({ currentUserRole }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [personFilter, setPersonFilter] = useState<string>('All Agents');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'name'>('date');
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbStatus, setDbStatus] = useState<'CONNECTING' | 'CONNECTED' | 'OFFLINE'>('CONNECTING');

  const loadData = useCallback(async (showIndicator = true) => {
    if (showIndicator) setIsSyncing(true);
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setAssignments(parsed);
      } catch (e) {
        console.error("Local data parse error", e);
      }
    }

    if (dbService.isConfigured()) {
      const dbData = await dbService.getAssignments();
      if (dbData) {
        setAssignments(dbData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dbData));
        setDbStatus('CONNECTED');
      } else {
        setDbStatus('OFFLINE');
      }
    } else {
      setDbStatus('OFFLINE');
    }
    
    if (showIndicator) setIsSyncing(false);
  }, [dbStatus]);

  useEffect(() => {
    const initialize = async () => {
      const ok = await dbService.initTable();
      if (ok) {
        setDbStatus('CONNECTED');
        await loadData();
      } else {
        setDbStatus('OFFLINE');
      }
    };
    initialize();
    
    const interval = setInterval(() => loadData(false), 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleAddOrUpdate = useCallback(async (assignment: Assignment) => {
    setIsSyncing(true);
    setAssignments(prev => {
      const exists = prev.find(a => a.taskId === assignment.taskId);
      const next = exists 
        ? prev.map(a => a.taskId === assignment.taskId ? assignment : a)
        : [assignment, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    const success = await dbService.saveAssignment(assignment);
    if (!success) setDbStatus('OFFLINE');
    else setDbStatus('CONNECTED');

    setIsSyncing(false);
    setIsFormOpen(false);
    setEditingAssignment(null);
  }, []);

  const handleStatusUpdate = async (taskId: string, newStatus: AssignmentStatus, comment: string) => {
    setIsSyncing(true);
    let updatedAssignment: Assignment | null = null;

    setAssignments(prev => {
      const next = prev.map(a => {
        if (a.taskId === taskId) {
          const newUpdate: AssignmentUpdate = {
            id: `LOG-${Date.now()}`,
            timestamp: new Date().toISOString(),
            text: comment,
            status: newStatus,
            author: currentUserRole === 'ADMIN' ? 'SYSTEM_ADMIN' : 'AGENT_NODE'
          };
          
          updatedAssignment = {
            ...a,
            status: newStatus,
            lastUpdated: new Date().toISOString(),
            updates: [...a.updates, newUpdate]
          };
          return updatedAssignment;
        }
        return a;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    if (updatedAssignment) {
      const success = await dbService.saveAssignment(updatedAssignment);
      if (!success) setDbStatus('OFFLINE');
    }
    setIsSyncing(false);
  };

  const handleDelete = async (taskId: string) => {
    if (currentUserRole !== 'ADMIN') return;
    if (window.confirm(`DANGER: PURGE RECORD ${taskId}?`)) {
      setIsSyncing(true);
      setAssignments(prev => {
        const filtered = prev.filter(a => a.taskId !== taskId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return filtered;
      });
      await dbService.deleteAssignment(taskId);
      setIsSyncing(false);
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
    link.download = `LEDGER_${new Date().getTime()}.csv`;
    link.click();
  };

  const filteredAssignments = useMemo(() => {
    return assignments
      .filter(a => {
        const matchesStatus = filter === 'All' || a.status === filter;
        const matchesPerson = personFilter === 'All Agents' || a.assignedTo === personFilter;
        const matchesSearch = a.taskTitle.toLowerCase().includes(search.toLowerCase()) || 
                             a.assignedTo.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesPerson && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'date') return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        if (sortBy === 'name') return a.assignedTo.localeCompare(b.assignedTo);
        return 0;
      });
  }, [assignments, filter, personFilter, search, sortBy]);

  const stats = useMemo(() => ({
    total: assignments.length,
    completed: assignments.filter(a => a.status === 'Completed').length,
    pending: assignments.filter(a => a.status === 'Pending' || a.status === 'InProgress').length,
  }), [assignments]);

  return (
    <div className="space-y-6 md:space-y-12 animate-hud">
      {/* Header Section */}
      <div className="flex flex-col gap-6 border-b border-white/5 pb-8 relative z-20">
        <div className="w-full">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2 italic glow-text text-white leading-none">
            Assignment_Ledger
          </h2>
          <div className="text-zinc-600 mono text-[10px] uppercase tracking-widest opacity-60 flex flex-wrap items-center gap-x-4 gap-y-2 font-bold">
            <span>ACTIVE_OPS: {stats.pending}</span>
            <span className="flex items-center gap-1.5">
              {isSyncing ? (
                <><i className="fa-solid fa-rotate animate-spin text-blue-400"></i> SYNCING</>
              ) : (
                <>
                  {dbStatus === 'CONNECTED' ? (
                    <><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> ONLINE</>
                  ) : (
                    <><div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> OFFLINE</>
                  )}
                </>
              )}
            </span>
          </div>
        </div>
        
        {/* Search and Action Row */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="relative group flex-grow">
            <input 
              type="text"
              className="bg-zinc-900/40 border border-white/10 px-4 py-3 pl-10 rounded-sm text-sm mono text-zinc-300 focus:border-blue-500/50 outline-none w-full transition-all"
              placeholder="Query Ledger..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500"></i>
          </div>

          <div className="flex gap-2">
            {currentUserRole === 'ADMIN' && (
              <button 
                onClick={() => { setEditingAssignment(null); setIsFormOpen(true); }}
                className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-6 py-3 rounded-sm font-black uppercase text-xs tracking-widest border border-blue-500/50 bg-blue-600 text-white hover:bg-blue-500 active:scale-95 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              >
                <i className="fa-solid fa-plus"></i>
                NEW_TASK
              </button>
            )}
            <button onClick={exportToCSV} className="w-12 h-12 flex items-center justify-center border border-white/10 rounded-sm hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
              <i className="fa-solid fa-file-export"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Section - Mobile Responsive Scrolling */}
      <div className="space-y-6 md:space-y-8 py-2 md:py-4">
        {/* Status Filter Row */}
        <div className="flex flex-col gap-3">
          <span className="mono text-[10px] uppercase text-zinc-500 tracking-widest font-black opacity-80">FILTER_SECTOR:</span>
          <div className="flex overflow-x-auto pb-4 md:pb-0 gap-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {['All', 'InProgress', 'Pending', 'Completed', 'Blocked'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)} 
                className={`flex-shrink-0 text-[10px] mono uppercase tracking-wider px-5 py-2 rounded-sm border transition-all font-black ${filter === f ? 'bg-blue-500/20 border-blue-400 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-white/5 text-zinc-700 hover:text-zinc-200 hover:border-white/10'}`}
              >
                {f === 'InProgress' ? 'IN_PROGRESS' : f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Agent Filter Row */}
        <div className="flex flex-col gap-3">
          <span className="mono text-[10px] uppercase text-zinc-500 tracking-widest font-black opacity-80">FILTER_AGENT:</span>
          <div className="flex overflow-x-auto pb-4 md:pb-0 gap-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {['All Agents', ...TEAM_DATA.map(m => m.name)].map(name => (
              <button 
                key={name} 
                onClick={() => setPersonFilter(name)} 
                className={`flex-shrink-0 text-[10px] mono uppercase tracking-wider px-5 py-2 rounded-sm border transition-all font-black ${personFilter === name ? 'bg-indigo-500/20 border-indigo-400 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'border-white/5 text-zinc-700 hover:text-zinc-200 hover:border-white/10'}`}
              >
                {name === 'All Agents' ? 'ALL_AGENTS' : name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredAssignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
          {filteredAssignments.map(a => (
            <AssignmentCard 
              key={a.taskId} 
              assignment={a} 
              onEdit={(a) => { setEditingAssignment(a); setIsFormOpen(true); }}
              onUpdateStatus={handleStatusUpdate}
              onDelete={handleDelete}
              currentUserRole={currentUserRole}
            />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center flex flex-col items-center justify-center opacity-40 relative z-10">
          <i className="fa-solid fa-satellite text-zinc-800 text-6xl animate-pulse mb-6"></i>
          <p className="text-zinc-600 mono text-[10px] uppercase tracking-[0.5em] font-black">
            NO ACTIVE MISSION_DATA DETECTED.
          </p>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 overflow-y-auto">
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />
          <div className="w-full max-w-4xl relative z-[210] animate-in fade-in zoom-in-95 duration-300">
            <AssignmentForm 
              onSubmit={handleAddOrUpdate}
              editingAssignment={editingAssignment}
              onCancel={() => { setIsFormOpen(false); setEditingAssignment(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Tracker;
