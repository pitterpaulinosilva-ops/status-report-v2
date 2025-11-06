/**
 * useTaskData Hook
 * Custom hook for loading and managing task data from Supabase
 * Includes realtime subscriptions for live updates
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, TaskStats, TaskStatus } from '@/types/task';
import { TaskStorage } from '@/lib/taskStorage';
import { calculateDelayStatus } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Task as SupabaseTask } from '@/types/supabase';

// Converter Task do Supabase para Task local
const convertToTask = (supabaseTask: SupabaseTask): Task => ({
  id: supabaseTask.id,
  parentActionId: supabaseTask.action_id || 0,
  title: supabaseTask.title,
  description: supabaseTask.description || '',
  responsible: 'N/A', // Será adicionado ao schema depois
  sector: 'N/A', // Será adicionado ao schema depois
  dueDate: new Date().toLocaleDateString('pt-BR'), // Será adicionado ao schema depois
  status: (supabaseTask.status as TaskStatus) || 'Planejado',
  delayStatus: 'No Prazo', // Será calculado depois
  createdAt: supabaseTask.created_at,
  updatedAt: supabaseTask.updated_at,
  order: supabaseTask.order_index,
});

/**
 * Hook for managing task data for a specific action or all actions
 * @param actionId - Optional action ID to filter tasks
 * @returns Task data, statistics, and loading state
 */
export const useTaskData = (actionId?: number) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  /**
   * Load tasks from storage or Supabase
   */
  const loadTasks = useCallback(async () => {
    if (!user) {
      // Fallback para localStorage se não autenticado
      setIsLoading(true);
      setError(null);
      
      try {
        const allTasks = TaskStorage.getTasks();
        const filteredTasks = actionId 
          ? allTasks.filter(t => t.parentActionId === actionId)
          : allTasks;
        
        const tasksWithStatus: Task[] = filteredTasks.map(task => ({
          ...task,
          delayStatus: calculateDelayStatus(task.dueDate, task.status)
        }));
        
        tasksWithStatus.sort((a, b) => {
          if (a.order !== b.order) {
            return a.order - b.order;
          }
          const dateA = new Date(a.dueDate.split('/').reverse().join('-'));
          const dateB = new Date(b.dueDate.split('/').reverse().join('-'));
          return dateA.getTime() - dateB.getTime();
        });
        
        setTasks(tasksWithStatus);
      } catch (err) {
        console.error('Error loading tasks from localStorage:', err);
        setError('Erro ao carregar tarefas');
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Carregar do Supabase se autenticado
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (actionId) {
        query = query.eq('action_id', actionId);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      if (data && data.length > 0) {
        const tasksWithStatus = data.map(supabaseTask => {
          const task = convertToTask(supabaseTask);
          return {
            ...task,
            delayStatus: calculateDelayStatus(task.dueDate, task.status)
          };
        });
        setTasks(tasksWithStatus);
      } else {
        // Fallback para localStorage se não houver tasks no Supabase
        const allTasks = TaskStorage.getTasks();
        const filteredTasks = actionId 
          ? allTasks.filter(t => t.parentActionId === actionId)
          : allTasks;
        
        const tasksWithStatus: Task[] = filteredTasks.map(task => ({
          ...task,
          delayStatus: calculateDelayStatus(task.dueDate, task.status)
        }));
        
        setTasks(tasksWithStatus);
      }
    } catch (err) {
      console.error('Error loading tasks from Supabase:', err);
      setError('Erro ao carregar tarefas do servidor');
      
      // Fallback para localStorage em caso de erro
      try {
        const allTasks = TaskStorage.getTasks();
        const filteredTasks = actionId 
          ? allTasks.filter(t => t.parentActionId === actionId)
          : allTasks;
        
        const tasksWithStatus: Task[] = filteredTasks.map(task => ({
          ...task,
          delayStatus: calculateDelayStatus(task.dueDate, task.status)
        }));
        
        setTasks(tasksWithStatus);
      } catch {
        setTasks([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [actionId, user]);
  
  /**
   * Load tasks on mount and setup realtime subscription
   */
  useEffect(() => {
    loadTasks();
    
    // Setup realtime subscription se autenticado
    if (!user) return;
    
    const channel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: actionId ? `action_id=eq.${actionId}` : undefined
        },
        (payload) => {
          console.log('Task change received:', payload);
          loadTasks();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadTasks, user, actionId]);
  
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
