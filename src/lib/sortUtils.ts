/**
 * Sort Utilities
 * Helper functions for sorting actions considering tasks
 */

import { ActionItem } from '@/data/actionData';
import { FilteredActionWithTasks } from '@/lib/filterUtils';

export type SortField = 'action' | 'responsible' | 'sector' | 'dueDate' | 'status' | 'id';
export type SortDirection = 'asc' | 'desc';

/**
 * Parse date from DD/MM/YYYY format
 */
const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('/');
  return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
};

/**
 * Get earliest date from action and its tasks
 */
const getEarliestDate = (action: FilteredActionWithTasks): Date => {
  const actionDate = parseDate(action.dueDate);
  
  if (!action.tasks || action.tasks.length === 0) {
    return actionDate;
  }

  const taskDates = action.tasks.map(task => parseDate(task.dueDate));
  const allDates = [actionDate, ...taskDates];
  
  return new Date(Math.min(...allDates.map(d => d.getTime())));
};

/**
 * Sort actions considering tasks
 * When sorting by date, considers task dates as well
 */
export const sortActionsWithTasks = (
  data: FilteredActionWithTasks[],
  field: SortField,
  direction: SortDirection
): FilteredActionWithTasks[] => {
  return [...data].sort((a, b) => {
    let aValue: string | number | Date;
    let bValue: string | number | Date;

    switch (field) {
      case 'id':
        aValue = a.id;
        bValue = b.id;
        break;
        
      case 'action':
        aValue = a.action.toLowerCase();
        bValue = b.action.toLowerCase();
        break;
        
      case 'responsible':
        aValue = a.responsible.toLowerCase();
        bValue = b.responsible.toLowerCase();
        break;
        
      case 'sector':
        aValue = a.sector.toLowerCase();
        bValue = b.sector.toLowerCase();
        break;
        
      case 'dueDate': {
        // Consider earliest task date for sorting
        aValue = getEarliestDate(a);
        bValue = getEarliestDate(b);
        break;
      }
      
      case 'status': {
        // Define priority order for status
        const statusOrder: Record<string, number> = {
          'Em Andamento': 1,
          'Planejado': 2,
          'Concluído': 3
        };
        
        // Consider action status and task statuses
        let aStatus = statusOrder[a.status] ?? 999;
        let bStatus = statusOrder[b.status] ?? 999;
        
        // If action has tasks with higher priority status, use that
        if (a.tasks && a.tasks.length > 0) {
          const minTaskStatus = Math.min(...a.tasks.map(t => statusOrder[t.status] ?? 999));
          aStatus = Math.min(aStatus, minTaskStatus);
        }
        
        if (b.tasks && b.tasks.length > 0) {
          const minTaskStatus = Math.min(...b.tasks.map(t => statusOrder[t.status] ?? 999));
          bStatus = Math.min(bStatus, minTaskStatus);
        }
        
        aValue = aStatus;
        bValue = bStatus;
        break;
      }
      
      default:
        aValue = a.id;
        bValue = b.id;
    }

    if (aValue < bValue) {
      return direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

/**
 * Legacy sort function for backward compatibility
 */
export const sortActionData = (
  data: ActionItem[],
  field: SortField,
  direction: SortDirection
): ActionItem[] => {
  return sortActionsWithTasks(data as FilteredActionWithTasks[], field, direction) as ActionItem[];
};
