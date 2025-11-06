/**
 * Task Storage Service
 * Handles persistent storage of tasks using encrypted localStorage
 */

import { Task, TaskStorageData } from '@/types/task';
import { setSecureItem, getSecureItem, removeSecureItem } from '@/lib/encryption';
import { TASKS_STORAGE_KEY, TASK_DATA_VERSION, TASK_ERROR_MESSAGES } from '@/constants/taskConstants';

/**
 * TaskStorage - Service for managing task data in localStorage
 */
export class TaskStorage {
  /**
   * Get all tasks from storage
   * @returns Array of all tasks
   */
  static getTasks(): Task[] {
    try {
      const data = getSecureItem<TaskStorageData>(TASKS_STORAGE_KEY);
      
      if (!data || !Array.isArray(data.tasks)) {
        return [];
      }
      
      // Validate data version for future migrations
      if (data.version !== TASK_DATA_VERSION) {
        console.warn('Task data version mismatch. Migration may be needed.');
      }
      
      return data.tasks;
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  }
  
  /**
   * Get tasks for a specific action
   * @param actionId - ID of the parent action
   * @returns Array of tasks belonging to the action
   */
  static getTasksByActionId(actionId: number): Task[] {
    const tasks = this.getTasks();
    return tasks.filter(task => task.parentActionId === actionId);
  }
  
  /**
   * Get a single task by ID
   * @param taskId - UUID of the task
   * @returns Task or undefined if not found
   */
  static getTaskById(taskId: string): Task | undefined {
    const tasks = this.getTasks();
    return tasks.find(task => task.id === taskId);
  }
  
  /**
   * Save a task (create or update)
   * @param task - Task to save
   * @throws Error if save fails
   */
  static saveTask(task: Task): void {
    try {
      const tasks = this.getTasks();
      const existingIndex = tasks.findIndex(t => t.id === task.id);
      
      const now = new Date().toISOString();
      
      if (existingIndex >= 0) {
        // Update existing task
        tasks[existingIndex] = {
          ...task,
          updatedAt: now
        };
      } else {
        // Create new task
        tasks.push({
          ...task,
          createdAt: task.createdAt || now,
          updatedAt: now
        });
      }
      
      this.saveTasks(tasks);
    } catch (error) {
      console.error('Error saving task:', error);
      throw new Error(TASK_ERROR_MESSAGES.STORAGE_ERROR);
    }
  }
  
  /**
   * Save multiple tasks at once
   * @param tasksToSave - Array of tasks to save
   * @throws Error if save fails
   */
  static saveBulkTasks(tasksToSave: Task[]): void {
    try {
      const existingTasks = this.getTasks();
      const now = new Date().toISOString();
      
      // Create a map of existing tasks for quick lookup
      const taskMap = new Map(existingTasks.map(t => [t.id, t]));
      
      // Update or add new tasks
      tasksToSave.forEach(task => {
        taskMap.set(task.id, {
          ...task,
          createdAt: task.createdAt || now,
          updatedAt: now
        });
      });
      
      this.saveTasks(Array.from(taskMap.values()));
    } catch (error) {
      console.error('Error saving bulk tasks:', error);
      throw new Error(TASK_ERROR_MESSAGES.STORAGE_ERROR);
    }
  }
  
  /**
   * Delete a task
   * @param taskId - UUID of the task to delete
   * @throws Error if delete fails
   */
  static deleteTask(taskId: string): void {
    try {
      const tasks = this.getTasks().filter(t => t.id !== taskId);
      this.saveTasks(tasks);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error(TASK_ERROR_MESSAGES.STORAGE_ERROR);
    }
  }
  
  /**
   * Delete all tasks for a specific action
   * @param actionId - ID of the parent action
   * @throws Error if delete fails
   */
  static deleteTasksByActionId(actionId: number): void {
    try {
      const tasks = this.getTasks().filter(t => t.parentActionId !== actionId);
      this.saveTasks(tasks);
    } catch (error) {
      console.error('Error deleting tasks by action:', error);
      throw new Error(TASK_ERROR_MESSAGES.STORAGE_ERROR);
    }
  }
  
  /**
   * Clear all tasks (use with caution)
   */
  static clearAllTasks(): void {
    try {
      removeSecureItem(TASKS_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing tasks:', error);
      throw new Error(TASK_ERROR_MESSAGES.STORAGE_ERROR);
    }
  }
  
  /**
   * Get storage statistics
   * @returns Object with storage stats
   */
  static getStorageStats() {
    const tasks = this.getTasks();
    const actionIds = new Set(tasks.map(t => t.parentActionId));
    
    return {
      totalTasks: tasks.length,
      totalActions: actionIds.size,
      averageTasksPerAction: actionIds.size > 0 ? tasks.length / actionIds.size : 0,
      lastUpdated: this.getLastUpdated()
    };
  }
  
  /**
   * Get last updated timestamp
   * @returns Timestamp or null if no data
   */
  static getLastUpdated(): number | null {
    try {
      const data = getSecureItem<TaskStorageData>(TASKS_STORAGE_KEY);
      return data?.lastUpdated || null;
    } catch {
      return null;
    }
  }
  
  /**
   * Private: Save all tasks to storage
   * @param tasks - Array of tasks to save
   */
  private static saveTasks(tasks: Task[]): void {
    const data: TaskStorageData = {
      tasks,
      lastUpdated: Date.now(),
      version: TASK_DATA_VERSION
    };
    
    setSecureItem(TASKS_STORAGE_KEY, data);
  }
  
  /**
   * Validate task data integrity
   * @param task - Task to validate
   * @returns true if valid, false otherwise
   */
  static validateTask(task: Task): boolean {
    return !!(
      task.id &&
      task.parentActionId &&
      task.title &&
      task.responsible &&
      task.sector &&
      task.dueDate &&
      task.status
    );
  }
  
  /**
   * Export tasks as JSON (for backup)
   * @returns JSON string of all tasks
   */
  static exportTasks(): string {
    const data = getSecureItem<TaskStorageData>(TASKS_STORAGE_KEY);
    return JSON.stringify(data, null, 2);
  }
  
  /**
   * Import tasks from JSON (for restore)
   * @param jsonData - JSON string of tasks
   * @throws Error if import fails
   */
  static importTasks(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData) as TaskStorageData;
      
      if (!data.tasks || !Array.isArray(data.tasks)) {
        throw new Error('Invalid task data format');
      }
      
      setSecureItem(TASKS_STORAGE_KEY, data);
    } catch (error) {
      console.error('Error importing tasks:', error);
      throw new Error('Erro ao importar tarefas. Verifique o formato dos dados.');
    }
  }
}
