/**
 * Filter Utilities
 * Helper functions for filtering and searching actions and tasks
 */

import { ActionItem } from '@/data/actionData';
import { Task } from '@/types/task';
import { TaskStorage } from '@/lib/taskStorage';
import { calculateDelayStatus } from '@/lib/utils';

export interface FilteredActionWithTasks extends ActionItem {
  tasks?: Task[];
  matchedTasks?: Task[];
  hasMatchingTasks?: boolean;
  shouldExpandTasks?: boolean;
}

/**
 * Search in actions and tasks
 * Returns actions with matched tasks highlighted
 */
export const searchActionsAndTasks = (
  actions: ActionItem[],
  searchTerm: string
): FilteredActionWithTasks[] => {
  if (!searchTerm || searchTerm.trim() === '') {
    return actions;
  }

  const lowerSearchTerm = searchTerm.toLowerCase().trim();
  const allTasks = TaskStorage.getTasks();
  
  const results: FilteredActionWithTasks[] = [];
  
  actions.forEach(action => {
    // Check if action matches search
    const actionMatches = 
      action.action.toLowerCase().includes(lowerSearchTerm) ||
      action.responsible.toLowerCase().includes(lowerSearchTerm) ||
      action.sector.toLowerCase().includes(lowerSearchTerm) ||
      action.followUp.toLowerCase().includes(lowerSearchTerm);

    // Get tasks for this action
    const actionTasks = allTasks.filter(task => task.parentActionId === action.id);
    
    // Check which tasks match search
    const matchedTasks = actionTasks.filter(task =>
      task.title.toLowerCase().includes(lowerSearchTerm) ||
      task.description.toLowerCase().includes(lowerSearchTerm) ||
      task.responsible.toLowerCase().includes(lowerSearchTerm) ||
      task.sector.toLowerCase().includes(lowerSearchTerm)
    );

    const hasMatchingTasks = matchedTasks.length > 0;
    
    // Include action if it matches OR has matching tasks
    if (actionMatches || hasMatchingTasks) {
      results.push({
        ...action,
        tasks: actionTasks,
        matchedTasks,
        hasMatchingTasks,
        shouldExpandTasks: hasMatchingTasks && !actionMatches // Expand if only tasks match
      });
    }
  });

  return results;
};

/**
 * Filter actions and tasks by status
 */
export const filterByStatus = (
  actions: FilteredActionWithTasks[],
  statusFilter: string
): FilteredActionWithTasks[] => {
  if (statusFilter === 'all') {
    return actions;
  }

  const allTasks = TaskStorage.getTasks();
  const results: FilteredActionWithTasks[] = [];

  actions.forEach(action => {
    const actionStatus = calculateDelayStatus(action.dueDate, action.status);
    const actionMatches = actionStatus === statusFilter;

    // Get tasks for this action
    const actionTasks = allTasks.filter(task => task.parentActionId === action.id);
    
    // Filter tasks by status
    const matchedTasks = actionTasks.filter(task => {
      const taskStatus = calculateDelayStatus(task.dueDate, task.status);
      return taskStatus === statusFilter;
    });

    const hasMatchingTasks = matchedTasks.length > 0;

    // Include action if it matches OR has matching tasks
    if (actionMatches || hasMatchingTasks) {
      results.push({
        ...action,
        tasks: actionTasks,
        matchedTasks,
        hasMatchingTasks,
        shouldExpandTasks: hasMatchingTasks && !actionMatches
      });
    }
  });

  return results;
};

/**
 * Filter actions and tasks by responsible
 */
export const filterByResponsible = (
  actions: FilteredActionWithTasks[],
  responsible: string
): FilteredActionWithTasks[] => {
  if (!responsible || responsible === 'all') {
    return actions;
  }

  const allTasks = TaskStorage.getTasks();
  const results: FilteredActionWithTasks[] = [];

  actions.forEach(action => {
    const actionMatches = action.responsible === responsible;

    // Get tasks for this action
    const actionTasks = allTasks.filter(task => task.parentActionId === action.id);
    
    // Filter tasks by responsible
    const matchedTasks = actionTasks.filter(task => task.responsible === responsible);

    const hasMatchingTasks = matchedTasks.length > 0;

    // Include action if it matches OR has matching tasks
    if (actionMatches || hasMatchingTasks) {
      results.push({
        ...action,
        tasks: actionTasks,
        matchedTasks,
        hasMatchingTasks,
        shouldExpandTasks: hasMatchingTasks && !actionMatches
      });
    }
  });

  return results;
};

/**
 * Combined filter function
 * Applies search, status, and responsible filters
 */
export const applyFilters = (
  actions: ActionItem[],
  searchTerm: string,
  statusFilter: string,
  responsibleFilter?: string
): FilteredActionWithTasks[] => {
  // Step 1: Apply search filter
  let filtered = searchActionsAndTasks(actions, searchTerm);

  // Step 2: Apply status filter
  filtered = filterByStatus(filtered, statusFilter);

  // Step 3: Apply responsible filter if provided
  if (responsibleFilter && responsibleFilter !== 'all') {
    filtered = filterByResponsible(filtered, responsibleFilter);
  }

  return filtered;
};

/**
 * Get all unique responsibles from actions and tasks
 */
export const getAllResponsibles = (actions: ActionItem[]): string[] => {
  const allTasks = TaskStorage.getTasks();
  const responsibles = new Set<string>();

  // Add action responsibles
  actions.forEach(action => {
    if (action.responsible) {
      responsibles.add(action.responsible);
    }
  });

  // Add task responsibles
  allTasks.forEach(task => {
    if (task.responsible) {
      responsibles.add(task.responsible);
    }
  });

  return Array.from(responsibles).sort();
};

/**
 * Calculate status counts including tasks
 */
export const calculateStatusCounts = (actions: ActionItem[]) => {
  const allTasks = TaskStorage.getTasks();
  
  const counts = {
    all: actions.length,
    'Em Atraso': 0,
    'No Prazo': 0,
    'Concluído': 0,
    totalTasks: allTasks.length,
    tasksEmAtraso: 0,
    tasksNoPrazo: 0,
    tasksConcluido: 0
  };

  // Count actions
  actions.forEach(action => {
    const status = calculateDelayStatus(action.dueDate, action.status);
    if (status === 'Em Atraso') counts['Em Atraso']++;
    else if (status === 'No Prazo') counts['No Prazo']++;
    else if (status === 'Concluído') counts['Concluído']++;
  });

  // Count tasks
  allTasks.forEach(task => {
    const status = calculateDelayStatus(task.dueDate, task.status);
    if (status === 'Em Atraso') counts.tasksEmAtraso++;
    else if (status === 'No Prazo') counts.tasksNoPrazo++;
    else if (status === 'Concluído') counts.tasksConcluido++;
  });

  return counts;
};
