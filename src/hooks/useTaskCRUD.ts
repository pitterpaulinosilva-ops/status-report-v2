/**
 * useTaskCRUD Hook
 * Custom hook for Create, Read, Update, Delete operations on tasks
 * Integrates with Supabase with localStorage fallback
 */

import { useState, useCallback } from 'react';
import { Task, TaskFormData, TaskDelayStatus } from '@/types/task';
import { TaskStorage } from '@/lib/taskStorage';
import { TaskValidator } from '@/lib/taskValidator';
import { TASK_ERROR_MESSAGES, MAX_TASKS_PER_ACTION } from '@/constants/taskConstants';
import { v4 as uuidv4 } from 'uuid';
import { calculateDelayStatus } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from './usePermissions';
import type { TaskInsert, TaskUpdate } from '@/types/supabase';

/**
 * Hook for CRUD operations on tasks
 * @returns Methods and state for task operations
 */
export const useTaskCRUD = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const { canCreateTask } = usePermissions();
  
  /**
   * Create a new task
   * @param taskData - Form data for the new task
   * @param parentActionId - ID of the parent action
   * @returns Created task or throws error
   */
  const createTask = useCallback(async (
    taskData: TaskFormData,
    parentActionId: number
  ): Promise<Task> => {
    setIsSubmitting(true);
    setError(null);
    setValidationErrors({});
    
    // Verificar permissão
    if (!canCreateTask()) {
      const error = new Error('Você não tem permissão para criar tarefas');
      setError(error.message);
      setIsSubmitting(false);
      throw error;
    }
    
    try {
      // Sanitize input
      const sanitizedData = TaskValidator.sanitizeTaskForm(taskData);
      
      // Validate form data
      const validation = TaskValidator.validateTaskForm(sanitizedData);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        throw new Error('Dados inválidos. Verifique os campos.');
      }
      
      // Se autenticado, criar no Supabase
      if (user) {
        // Check max tasks limit
        const { count } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('action_id', parentActionId);
        
        if (count && count >= MAX_TASKS_PER_ACTION) {
          throw new Error(TASK_ERROR_MESSAGES.MAX_TASKS_REACHED);
        }
        
        const taskId = uuidv4();
        const taskInsert: TaskInsert = {
          id: taskId,
          action_id: parentActionId,
          title: sanitizedData.title,
          description: sanitizedData.description,
          status: sanitizedData.status,
          order_index: count || 0,
          created_by: user.id,
        };
        
        const { data, error: insertError } = await supabase
          .from('tasks')
          .insert(taskInsert)
          .select()
          .single();
        
        if (insertError) throw insertError;
        
        const delayStatus: TaskDelayStatus = calculateDelayStatus(sanitizedData.dueDate, sanitizedData.status);
        
        const newTask: Task = {
          id: data.id,
          parentActionId: data.action_id || parentActionId,
          title: data.title,
          description: data.description || '',
          responsible: sanitizedData.responsible,
          sector: sanitizedData.sector,
          dueDate: sanitizedData.dueDate,
          status: sanitizedData.status,
          delayStatus,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          order: data.order_index,
          comments: []
        };
        
        return newTask;
      }
      
      // Fallback para localStorage se não autenticado
      const existingTasks = TaskStorage.getTasksByActionId(parentActionId);
      if (existingTasks.length >= MAX_TASKS_PER_ACTION) {
        throw new Error(TASK_ERROR_MESSAGES.MAX_TASKS_REACHED);
      }
      
      const delayStatus: TaskDelayStatus = calculateDelayStatus(sanitizedData.dueDate, sanitizedData.status);
      
      const newTask: Task = {
        id: uuidv4(),
        parentActionId,
        title: sanitizedData.title,
        description: sanitizedData.description,
        responsible: sanitizedData.responsible,
        sector: sanitizedData.sector,
        dueDate: sanitizedData.dueDate,
        status: sanitizedData.status,
        delayStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: existingTasks.length,
        comments: []
      };
      
      TaskStorage.saveTask(newTask);
      return newTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : TASK_ERROR_MESSAGES.STORAGE_ERROR;
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, canCreateTask]);
  
  /**
   * Update an existing task
   * @param taskId - UUID of the task to update
   * @param updates - Partial task data to update
   * @returns Updated task or throws error
   */
  const updateTask = useCallback(async (
    taskId: string,
    updates: Partial<TaskFormData>
  ): Promise<Task> => {
    setIsSubmitting(true);
    setError(null);
    setValidationErrors({});
    
    try {
      // Get existing task
      const existingTask = TaskStorage.getTaskById(taskId);
      if (!existingTask) {
        throw new Error(TASK_ERROR_MESSAGES.TASK_NOT_FOUND);
      }
      
      // Merge updates with existing data
      const updatedData: TaskFormData = {
        title: updates.title ?? existingTask.title,
        description: updates.description ?? existingTask.description,
        responsible: updates.responsible ?? existingTask.responsible,
        sector: updates.sector ?? existingTask.sector,
        dueDate: updates.dueDate ?? existingTask.dueDate,
        status: updates.status ?? existingTask.status
      };
      
      // Sanitize input
      const sanitizedData = TaskValidator.sanitizeTaskForm(updatedData);
      
      // Validate form data
      const validation = TaskValidator.validateTaskForm(sanitizedData);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        throw new Error('Dados inválidos. Verifique os campos.');
      }
      
      // Calculate delay status
      const delayStatus: TaskDelayStatus = calculateDelayStatus(sanitizedData.dueDate, sanitizedData.status);
      
      // Create updated task
      const updatedTask: Task = {
        ...existingTask,
        title: sanitizedData.title,
        description: sanitizedData.description,
        responsible: sanitizedData.responsible,
        sector: sanitizedData.sector,
        dueDate: sanitizedData.dueDate,
        status: sanitizedData.status,
        delayStatus,
        updatedAt: new Date().toISOString()
      };
      
      // Save to storage
      TaskStorage.saveTask(updatedTask);
      
      return updatedTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : TASK_ERROR_MESSAGES.STORAGE_ERROR;
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);
  
  /**
   * Delete a task
   * @param taskId - UUID of the task to delete
   * @param skipConfirmation - Skip confirmation dialog (default: false)
   * @returns true if deleted successfully
   */
  const deleteTask = useCallback(async (
    taskId: string,
    skipConfirmation: boolean = false
  ): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Check if task exists
      const existingTask = TaskStorage.getTaskById(taskId);
      if (!existingTask) {
        throw new Error(TASK_ERROR_MESSAGES.TASK_NOT_FOUND);
      }
      
      // Confirm deletion (unless skipped)
      if (!skipConfirmation) {
        const confirmed = window.confirm(TASK_ERROR_MESSAGES.DELETE_CONFIRM);
        if (!confirmed) {
          return false;
        }
      }
      
      // Delete from storage
      TaskStorage.deleteTask(taskId);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : TASK_ERROR_MESSAGES.STORAGE_ERROR;
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);
  
  /**
   * Duplicate a task
   * @param taskId - UUID of the task to duplicate
   * @returns Duplicated task or throws error
   */
  const duplicateTask = useCallback(async (taskId: string): Promise<Task> => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Get existing task
      const existingTask = TaskStorage.getTaskById(taskId);
      if (!existingTask) {
        throw new Error(TASK_ERROR_MESSAGES.TASK_NOT_FOUND);
      }
      
      // Check max tasks limit
      const existingTasks = TaskStorage.getTasksByActionId(existingTask.parentActionId);
      if (existingTasks.length >= MAX_TASKS_PER_ACTION) {
        throw new Error(TASK_ERROR_MESSAGES.MAX_TASKS_REACHED);
      }
      
      // Create duplicate
      const duplicatedTask: Task = {
        ...existingTask,
        id: uuidv4(),
        title: `${existingTask.title} (Cópia)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: existingTasks.length,
        comments: [] // Don't copy comments
      };
      
      // Save to storage
      TaskStorage.saveTask(duplicatedTask);
      
      return duplicatedTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : TASK_ERROR_MESSAGES.STORAGE_ERROR;
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);
  
  /**
   * Reorder tasks within an action
   * @param taskId - UUID of the task to move
   * @param newOrder - New order position
   * @returns true if reordered successfully
   */
  const reorderTask = useCallback(async (
    taskId: string,
    newOrder: number
  ): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Get existing task
      const existingTask = TaskStorage.getTaskById(taskId);
      if (!existingTask) {
        throw new Error(TASK_ERROR_MESSAGES.TASK_NOT_FOUND);
      }
      
      // Get all tasks for the action
      const actionTasks = TaskStorage.getTasksByActionId(existingTask.parentActionId);
      
      // Validate new order
      if (newOrder < 0 || newOrder >= actionTasks.length) {
        throw new Error('Posição inválida');
      }
      
      // Reorder tasks
      const oldOrder = existingTask.order;
      const reorderedTasks = actionTasks.map(task => {
        if (task.id === taskId) {
          return { ...task, order: newOrder, updatedAt: new Date().toISOString() };
        }
        
        // Adjust other tasks' order
        if (oldOrder < newOrder) {
          // Moving down
          if (task.order > oldOrder && task.order <= newOrder) {
            return { ...task, order: task.order - 1 };
          }
        } else {
          // Moving up
          if (task.order >= newOrder && task.order < oldOrder) {
            return { ...task, order: task.order + 1 };
          }
        }
        
        return task;
      });
      
      // Save all reordered tasks
      TaskStorage.saveBulkTasks(reorderedTasks);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : TASK_ERROR_MESSAGES.STORAGE_ERROR;
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);
  
  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
    setValidationErrors({});
  }, []);
  
  return {
    createTask,
    updateTask,
    deleteTask,
    duplicateTask,
    reorderTask,
    isSubmitting,
    error,
    validationErrors,
    clearError
  };
};
