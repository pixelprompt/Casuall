
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
