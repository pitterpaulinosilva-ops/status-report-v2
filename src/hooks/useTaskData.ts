/**
 * useTaskData Hook
 * Custom hook for loading and managing task data
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, TaskStats } from '@/types/task';
import { TaskStorage } from '@/lib/taskStorage';
import { calculateDelayStatus } from '@/lib/utils';

/**
 * Hook for managing task data for a specific action or all actions
 * @param actionId - Optional action ID to filter tasks
 * @returns Task data, statistics, and loading state
 */
export const useTaskData = (actionId?: number) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Load tasks from storage
   */
  const loadTasks = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      const allTasks = TaskStorage.getTasks();
      const filteredTasks = actionId 
        ? allTasks.filter(t => t.parentActionId === actionId)
        : allTasks;
      
      // Calculate delay status for each task
      const tasksWithStatus: Task[] = filteredTasks.map(task => ({
        ...task,
        delayStatus: calculateDelayStatus(task.dueDate, task.status)
      }));
      
      // Sort by order and then by due date
      tasksWithStatus.sort((a, b) => {
        if (a.order !== b.order) {
          return a.order - b.order;
        }
        // Parse dates for comparison
        const dateA = new Date(a.dueDate.split('/').reverse().join('-'));
        const dateB = new Date(b.dueDate.split('/').reverse().join('-'));
        return dateA.getTime() - dateB.getTime();
      });
      
      setTasks(tasksWithStatus);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Erro ao carregar tarefas');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [actionId]);
  
  /**
   * Load tasks on mount and when actionId changes
   */
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);
  
  /**
   * Calculate task statistics
   */
  const stats: TaskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Concluído').length;
    const overdue = tasks.filter(t => t.delayStatus === 'Em Atraso').length;
    const onTime = tasks.filter(t => t.delayStatus === 'No Prazo').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, overdue, onTime, progress };
  }, [tasks]);
  
  /**
   * Refresh tasks from storage
   */
  const refresh = useCallback(() => {
    loadTasks();
  }, [loadTasks]);
  
  /**
   * Get tasks by status
   */
  const getTasksByStatus = useCallback((status: string) => {
    return tasks.filter(t => t.status === status);
  }, [tasks]);
  
  /**
   * Get tasks by delay status
   */
  const getTasksByDelayStatus = useCallback((delayStatus: string) => {
    return tasks.filter(t => t.delayStatus === delayStatus);
  }, [tasks]);
  
  /**
   * Check if action has overdue tasks
   */
  const hasOverdueTasks = useMemo(() => {
    return stats.overdue > 0;
  }, [stats.overdue]);
  
  /**
   * Check if all tasks are completed
   */
  const allTasksCompleted = useMemo(() => {
    return stats.total > 0 && stats.completed === stats.total;
  }, [stats.total, stats.completed]);
  
  return {
    tasks,
    stats,
    isLoading,
    error,
    refresh,
    getTasksByStatus,
    getTasksByDelayStatus,
    hasOverdueTasks,
    allTasksCompleted
  };
};

/**
 * Hook for getting tasks across all actions with aggregated statistics
 * @returns All tasks and global statistics
 */
export const useAllTasksData = () => {
  const { tasks, stats, isLoading, error, refresh } = useTaskData();
  
  /**
   * Get tasks grouped by action
   */
  const tasksByAction = useMemo(() => {
    const grouped = new Map<number, Task[]>();
    
    tasks.forEach(task => {
      const actionTasks = grouped.get(task.parentActionId) || [];
      actionTasks.push(task);
      grouped.set(task.parentActionId, actionTasks);
    });
    
    return grouped;
  }, [tasks]);
  
  /**
   * Get actions with task counts
   */
  const actionStats = useMemo(() => {
    const statsMap = new Map<number, TaskStats>();
    
    tasksByAction.forEach((actionTasks, actionId) => {
      const total = actionTasks.length;
      const completed = actionTasks.filter(t => t.status === 'Concluído').length;
      const overdue = actionTasks.filter(t => t.delayStatus === 'Em Atraso').length;
      const onTime = actionTasks.filter(t => t.delayStatus === 'No Prazo').length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      statsMap.set(actionId, { total, completed, overdue, onTime, progress });
    });
    
    return statsMap;
  }, [tasksByAction]);
  
  return {
    tasks,
    stats,
    isLoading,
    error,
    refresh,
    tasksByAction,
    actionStats
  };
};
