
import React, { useState, useEffect, useMemo } from 'react';
import { Assignment, AssignmentStatus, TeamMember } from '../types';
import { TEAM_DATA } from '../constants';

interface AssignmentFormProps {
  onSubmit: (assignment: Assignment) => void;
  editingAssignment?: Assignment | null;
  onCancel: () => void;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ onSubmit, editingAssignment, onCancel }) => {
  const [selectedPerson, setSelectedPerson] = useState<string>('');
  const [selectedTaskLabel, setSelectedTaskLabel] = useState<string>('');
  const [assignedDate, setAssignedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Derive available tasks from selected person
  const availableTasks = useMemo(() => {
    const person = TEAM_DATA.find(p => p.name === selectedPerson);
    return person ? person.tasks : [];
  }, [selectedPerson]);

  // Derive category
  const selectedCategory = useMemo(() => {
    const person = TEAM_DATA.find(p => p.name === selectedPerson);
    return person ? person.category : 'N/A';
  }, [selectedPerson]);

  useEffect(() => {
    if (editingAssignment) {
      setSelectedPerson(editingAssignment.assignedTo);
      setSelectedTaskLabel(editingAssignment.taskTitle);
      setAssignedDate(editingAssignment.assignedDate.includes('T') ? editingAssignment.assignedDate.split('T')[0] : editingAssignment.assignedDate);
      setDueDate(editingAssignment.dueDate);
      setNotes(editingAssignment.notes || '');
    }
  }, [editingAssignment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedPerson || !selectedTaskLabel || !dueDate || !assignedDate) {
      setError("Incomplete data. Identify Agent & Operation.");
      return;
    }

    const finalData: Assignment = {
      taskId: editingAssignment?.taskId || `TASK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      assignedDate: assignedDate,
      taskTitle: selectedTaskLabel,
      assignedTo: selectedPerson,
      category: selectedCategory,
      dueDate: dueDate,
      status: editingAssignment?.status || 'Pending',
      lastUpdated: new Date().toISOString(),
      difficulties: editingAssignment?.difficulties || [],
      notes: notes,
      updatedBy: 'SYSTEM_ADMIN',
      updates: editingAssignment?.updates || [],
    };

    onSubmit(finalData);
    
    // Clear form
    if (!editingAssignment) {
      setSelectedPerson('');
      setSelectedTaskLabel('');
      setNotes('');
      setAssignedDate(new Date().toISOString().split('T')[0]);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="glass p-6 md:p-8 border-blue-500/20 relative overflow-hidden group shadow-2xl">
      <div className="card-corner corner-tl opacity-60 border-blue-400" />
      <div className="card-corner corner-tr opacity-60 border-blue-400" />
      
      {/* Decorative center text - Hidden on mobile for clarity */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none text-[8px] mono uppercase tracking-[1em] [writing-mode:vertical-lr] font-bold text-white h-full py-10 hidden md:block">
        MISSION_CONTROL_V4.0.0
      </div>

      <div className="flex items-center gap-3 mb-6 md:mb-8 border-b border-white/10 pb-4">
        <i className="fa-solid fa-microchip text-blue-400 animate-pulse"></i>
        <h3 className="text-lg md:text-xl font-black uppercase tracking-widest italic text-white">
          {editingAssignment ? 'Update_Record' : 'Smart_Assignment'}
        </h3>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[9px] mono uppercase tracking-widest flex items-center gap-2">
          <i className="fa-solid fa-triangle-exclamation"></i>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-4 md:space-y-6">
          {/* Person Selection */}
          <div>
            <label className="block text-[8px] md:text-[10px] mono uppercase text-zinc-500 mb-2 tracking-[0.2em]">Select_Target_Agent</label>
            <select 
              className="w-full bg-zinc-900 border border-white/20 rounded-sm px-4 py-3 text-sm focus:border-blue-500/80 outline-none transition-all text-white"
              value={selectedPerson}
              onChange={e => {
                setSelectedPerson(e.target.value);
                setSelectedTaskLabel('');
              }}
            >
              <option value="" disabled>-- IDENTIFY AGENT --</option>
              {TEAM_DATA.map(p => (
                <option key={p.id} value={p.name}>{p.name} ({p.category})</option>
              ))}
            </select>
          </div>

          {/* Assignment Date */}
          <div>
            <label className="block text-[8px] md:text-[10px] mono uppercase text-zinc-500 mb-2 tracking-[0.2em]">Assignment_Date</label>
            <input 
              type="date"
              className="w-full bg-zinc-900 border border-white/20 rounded-sm px-4 py-3 text-sm focus:border-blue-500/80 outline-none transition-all text-white [color-scheme:dark]"
              value={assignedDate}
              onChange={e => setAssignedDate(e.target.value)}
            />
          </div>

          {/* Cascading Task Selection */}
          <div>
            <label className="block text-[8px] md:text-[10px] mono uppercase text-zinc-500 mb-2 tracking-[0.2em]">Identify_Operation</label>
            <select 
              className="w-full bg-zinc-900 border border-white/20 rounded-sm px-4 py-3 text-sm focus:border-blue-500/80 outline-none transition-all text-white disabled:opacity-30 disabled:cursor-not-allowed"
              value={selectedTaskLabel}
              disabled={!selectedPerson}
              onChange={e => setSelectedTaskLabel(e.target.value)}
            >
              <option value="" disabled>-- {selectedPerson ? 'SELECT OPERATION' : 'WAITING FOR AGENT'} --</option>
              {availableTasks.length > 0 ? (
                availableTasks.map((t, idx) => (
                  <option key={idx} value={t.label}>{t.label}</option>
                ))
              ) : (
                selectedPerson && <option disabled>NO TASKS ASSIGNED</option>
              )}
            </select>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          {/* Deadline Picker */}
          <div>
            <label className="block text-[8px] md:text-[10px] mono uppercase text-zinc-500 mb-2 tracking-[0.2em]">Mission_Deadline</label>
            <input 
              type="date"
              min={today}
              className="w-full bg-zinc-900 border border-white/20 rounded-sm px-4 py-3 text-sm focus:border-blue-500/80 outline-none transition-all text-white [color-scheme:dark]"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>

          {/* Category Display */}
          <div>
            <label className="block text-[8px] md:text-[10px] mono uppercase text-zinc-500 mb-2 tracking-[0.2em]">Sector_Classification</label>
            <div className="w-full bg-zinc-900/50 border border-white/5 rounded-sm px-4 py-3 text-sm text-blue-400/80 mono italic">
              {selectedCategory}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 md:mt-8">
        <label className="block text-[8px] md:text-[10px] mono uppercase text-zinc-500 mb-2 tracking-[0.2em]">Operational_Notes</label>
        <textarea 
          className="w-full bg-zinc-900 border border-white/20 rounded-sm px-4 py-3 text-sm focus:border-blue-500/80 outline-none transition-all h-24 md:h-32 resize-none text-white placeholder-zinc-700"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Telemetry, initial briefing, and objective details..."
        />
      </div>

      <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-4">
        <button 
          type="submit"
          className="flex-grow bg-blue-600 hover:bg-blue-500 text-white py-4 px-8 font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] transition-all rounded-sm shadow-[0_0_30px_rgba(59,130,246,0.2)] active:scale-95 border border-blue-400/50"
        >
          {editingAssignment ? 'SYNCHRONIZE' : 'INITIALIZE'}
        </button>
        <button 
          type="button"
          onClick={onCancel}
          className="px-8 md:px-10 border border-white/10 bg-white/5 hover:bg-white/10 uppercase mono text-[9px] tracking-[0.2em] md:tracking-[0.3em] transition-all text-zinc-400 hover:text-white py-4"
        >
          ABORT
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm;
