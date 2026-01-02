
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Assignment, AssignmentStatus, AssignmentUpdate, AuthRole } from '../types';
import AssignmentForm from './AssignmentForm';
import AssignmentCard from './AssignmentCard';
import { dbService } from '../services/dbService';

interface TrackerProps {
  currentUserRole: AuthRole;
}

const STORAGE_KEY = 'MISSION_LEDGER_V4_PERSISTENT';

const Tracker: React.FC<TrackerProps> = ({ currentUserRole }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'name'>('date');
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbStatus, setDbStatus] = useState<'CONNECTING' | 'CONNECTED' | 'OFFLINE'>('CONNECTING');

  const loadData = useCallback(async (showIndicator = true) => {
    if (showIndicator) setIsSyncing(true);
    
    // Step 1: Immediate local load for speed
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setAssignments(parsed);
      } catch (e) {
        console.error("Local data parse error", e);
      }
    }

    // Step 2: Fetch from Neon DB to sync state
    if (dbService.isConfigured()) {
      const dbData = await dbService.getAssignments();
      if (dbData && dbData.length > 0) {
        setAssignments(dbData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dbData));
        setDbStatus('CONNECTED');
      } else if (dbData.length === 0 && dbStatus === 'CONNECTED') {
        // Table exists but is empty
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
    
    // Background polling for multi-user real-time feel
    const interval = setInterval(() => loadData(false), 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleAddOrUpdate = useCallback(async (assignment: Assignment) => {
    setIsSyncing(true);
    
    // Optimistic UI + LocalStorage Update
    setAssignments(prev => {
      const exists = prev.find(a => a.taskId === assignment.taskId);
      const next = exists 
        ? prev.map(a => a.taskId === assignment.taskId ? assignment : a)
        : [assignment, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    // Cloud Sync
    const success = await dbService.saveAssignment(assignment);
    if (!success) {
      console.warn("Cloud Sync failed, using local persistence.");
      setDbStatus('OFFLINE');
    } else {
      setDbStatus('CONNECTED');
    }

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
    if (window.confirm(`DANGER: PURGE RECORD ${taskId}? This action is irreversible.`)) {
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
  }), [assignments]);

  return (
    <div className="space-y-8 md:space-y-12 animate-hud">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/5 pb-8 relative z-20">
        <div className="w-full lg:w-auto">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2 italic glow-text text-white">Assignment_Ledger</h2>
          <div className="text-zinc-600 mono text-[8px] md:text-xs uppercase tracking-widest opacity-60 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>ACTIVE_OPS: {stats.pending}</span>
            <div className="w-1 h-1 rounded-full bg-zinc-800 hidden md:block" />
            <span className="flex items-center gap-1.5">
              {isSyncing ? (
                <><i className="fa-solid fa-rotate animate-spin text-blue-400"></i> <span className="text-blue-400">NODE_SYNC</span></>
              ) : (
                <>
                  {dbStatus === 'CONNECTED' ? (
                    <><i className="fa-solid fa-cloud text-emerald-500/50"></i> CORE_LINK_STABLE</>
                  ) : dbStatus === 'CONNECTING' ? (
                    <><i className="fa-solid fa-satellite-dish animate-pulse text-amber-500"></i> HANDSHAKE...</>
                  ) : (
                    <><i className="fa-solid fa-cloud-slash text-rose-500"></i> OFFLINE_MODE</>
                  )}
                </>
              )}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap md:flex-nowrap gap-3 items-center justify-start md:justify-end w-full lg:w-auto">
          <div className="relative group w-full md:w-auto">
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
              onClick={() => { setEditingAssignment(null); setIsFormOpen(true); }}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-sm font-black uppercase text-[10px] md:text-xs tracking-[0.2em] transition-all active:scale-95 border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)] bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] cursor-pointer relative z-30 flex-grow md:flex-grow-0"
            >
              <i className="fa-solid fa-plus"></i>
              ADD_ENTRY
            </button>
          )}

          <button onClick={exportToCSV} className="w-10 h-10 flex items-center justify-center border border-white/10 rounded-sm hover:bg-white/5 transition-colors text-zinc-400 hover:text-white shrink-0">
            <i className="fa-solid fa-file-export"></i>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center border-y border-white/5 py-6 md:py-8 relative z-10">
        <span className="mono text-[8px] md:text-[10px] uppercase text-zinc-600 tracking-widest font-bold opacity-60">FILTER_SECTOR:</span>
        <div className="flex flex-wrap gap-2 md:gap-3">
          {['All', 'InProgress', 'Pending', 'Completed', 'Blocked'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`text-[8px] md:text-[9px] mono uppercase tracking-[0.1em] md:tracking-[0.2em] px-3 md:px-4 py-1.5 rounded-sm border transition-all font-black ${filter === f ? 'bg-blue-500/20 border-blue-400 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-white/5 text-zinc-700 hover:text-zinc-200 hover:border-white/10'}`}>
              {f === 'InProgress' ? 'IN_PROGRESS' : f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {filteredAssignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 relative z-10">
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
        <div className="py-24 md:py-40 text-center flex flex-col items-center justify-center opacity-40 relative z-10">
          <i className="fa-solid fa-satellite text-zinc-800 text-6xl md:text-8xl relative animate-pulse mb-6 md:mb-8"></i>
          <p className="text-zinc-600 mono text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.5em] font-black px-4">
            {isSyncing ? 'SYNCHRONIZING_CORE_DATA...' : 'NO ACTIVE MISSION_DATA DETECTED.'}
          </p>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />
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
