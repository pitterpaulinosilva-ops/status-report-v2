/**
 * Task Constants
 * Centralized constants for task management
 */

import { TaskStatus, TaskDelayStatus } from '@/types/task';

/**
 * Available task statuses
 */
export const TASK_STATUSES: TaskStatus[] = ['Planejado', 'Em Andamento', 'Concluído'];

/**
 * Available delay statuses (calculated)
 */
export const TASK_DELAY_STATUSES: TaskDelayStatus[] = ['Em Atraso', 'No Prazo', 'Concluído'];

/**
 * Storage key for tasks in localStorage
 */
export const TASKS_STORAGE_KEY = 'action-tasks-data';

/**
 * Current version of task data structure
 */
export const TASK_DATA_VERSION = '1.0.0';

/**
 * Maximum number of tasks per action (for performance)
 */
export const MAX_TASKS_PER_ACTION = 50;

/**
 * Validation constraints
 */
export const TASK_VALIDATION = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 1000,
  RESPONSIBLE_MIN_LENGTH: 3,
  SECTOR_MIN_LENGTH: 3,
} as const;

/**
 * Error messages
 */
export const TASK_ERROR_MESSAGES = {
  TASK_NOT_FOUND: 'Tarefa não encontrada',
  INVALID_DATE: 'Data inválida. Use o formato DD/MM/YYYY',
  REQUIRED_FIELD: 'Este campo é obrigatório',
  TITLE_TOO_SHORT: `O título deve ter pelo menos ${TASK_VALIDATION.TITLE_MIN_LENGTH} caracteres`,
  TITLE_TOO_LONG: `O título deve ter no máximo ${TASK_VALIDATION.TITLE_MAX_LENGTH} caracteres`,
  DESCRIPTION_TOO_LONG: `A descrição deve ter no máximo ${TASK_VALIDATION.DESCRIPTION_MAX_LENGTH} caracteres`,
  STORAGE_ERROR: 'Erro ao salvar dados. Tente novamente.',
  LOAD_ERROR: 'Erro ao carregar tarefas',
  DELETE_CONFIRM: 'Tem certeza que deseja excluir esta tarefa?',
  MAX_TASKS_REACHED: `Número máximo de tarefas atingido (${MAX_TASKS_PER_ACTION})`,
} as const;

/**
 * Status colors for UI
 */
export const TASK_STATUS_COLORS = {
  'Em Atraso': {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
  },
  'No Prazo': {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  'Concluído': {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800',
  },
} as const;
