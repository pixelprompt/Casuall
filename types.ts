
export interface Task {
  label: string;
  count?: number | string;
}

export interface TeamMember {
  id: string;
  name: string;
  category: string;
  icon: string;
  tasks: Task[];
  color: string;
  size: 'small' | 'medium' | 'large' | 'tall';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type AuthRole = 'ADMIN' | 'USER';

export interface User {
  username: string;
  role: AuthRole;
}

export type AssignmentStatus = 'Pending' | 'Completed' | 'Blocked' | 'InProgress';

export interface AssignmentUpdate {
  id: string;
  timestamp: string;
  text: string;
  status: AssignmentStatus;
  author: string;
}

export interface Assignment {
  taskId: string;
  assignedDate: string;
  taskTitle: string;
  assignedTo: string;
  dueDate: string;
  status: AssignmentStatus;
  completionDate?: string | null;
  reasonIfIncomplete?: string;
  difficulties: string[];
  notes?: string;
  updatedBy: string;
  lastUpdated: string;
  category: string;
  updates: AssignmentUpdate[];
}
