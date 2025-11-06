/**
 * Task Type Definitions
 * Defines the structure for hierarchical tasks within actions
 */

export type TaskStatus = 'Planejado' | 'Em Andamento' | 'Concluído';
export type TaskDelayStatus = 'Em Atraso' | 'No Prazo' | 'Concluído';

/**
 * Comment on a task
 */
export interface TaskComment {
  id: string;
  taskId: string;
  author: string;
  content: string;
  timestamp: string; // ISO 8601 format
}

/**
 * Task - Sub-item of an action
 * Represents a specific activity within a parent action
 */
export interface Task {
  id: string; // UUID v4
  parentActionId: number; // Reference to ActionItem.id
  title: string;
  description: string;
  responsible: string;
  sector: string;
  dueDate: string; // DD/MM/YYYY format
  status: TaskStatus;
  delayStatus: TaskDelayStatus; // Calculated based on dueDate and status
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
  order: number; // For sorting within parent action
  comments?: TaskComment[];
}

/**
 * Task statistics for an action
 */
export interface TaskStats {
  total: number;
  completed: number;
  overdue: number;
  onTime: number;
  progress: number; // 0-100
}

/**
 * Form data for creating/editing a task
 */
export interface TaskFormData {
  title: string;
  description: string;
  responsible: string;
  sector: string;
  dueDate: string;
  status: TaskStatus;
}

/**
 * Storage structure for tasks in localStorage
 */
export interface TaskStorageData {
  tasks: Task[];
  lastUpdated: number; // Timestamp
  version: string; // For migration support
}
