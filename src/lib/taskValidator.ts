/**
 * Task Validator
 * Validates task data before storage
 */

import { Task, TaskFormData } from '@/types/task';
import { TASK_VALIDATION, TASK_ERROR_MESSAGES } from '@/constants/taskConstants';
import { parse, isValid, isPast, startOfDay } from 'date-fns';

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * TaskValidator - Utility class for validating task data
 */
export class TaskValidator {
  /**
   * Validate task form data
   * @param data - Form data to validate
   * @returns Validation result with errors
   */
  static validateTaskForm(data: TaskFormData): ValidationResult {
    const errors: Record<string, string> = {};
    
    // Validate title
    if (!data.title || data.title.trim().length === 0) {
      errors.title = TASK_ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (data.title.trim().length < TASK_VALIDATION.TITLE_MIN_LENGTH) {
      errors.title = TASK_ERROR_MESSAGES.TITLE_TOO_SHORT;
    } else if (data.title.length > TASK_VALIDATION.TITLE_MAX_LENGTH) {
      errors.title = TASK_ERROR_MESSAGES.TITLE_TOO_LONG;
    }
    
    // Validate description
    if (data.description && data.description.length > TASK_VALIDATION.DESCRIPTION_MAX_LENGTH) {
      errors.description = TASK_ERROR_MESSAGES.DESCRIPTION_TOO_LONG;
    }
    
    // Validate responsible
    if (!data.responsible || data.responsible.trim().length === 0) {
      errors.responsible = TASK_ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (data.responsible.trim().length < TASK_VALIDATION.RESPONSIBLE_MIN_LENGTH) {
      errors.responsible = `O responsável deve ter pelo menos ${TASK_VALIDATION.RESPONSIBLE_MIN_LENGTH} caracteres`;
    }
    
    // Validate sector
    if (!data.sector || data.sector.trim().length === 0) {
      errors.sector = TASK_ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (data.sector.trim().length < TASK_VALIDATION.SECTOR_MIN_LENGTH) {
      errors.sector = `O setor deve ter pelo menos ${TASK_VALIDATION.SECTOR_MIN_LENGTH} caracteres`;
    }
    
    // Validate due date
    const dateValidation = this.validateDate(data.dueDate);
    if (!dateValidation.isValid) {
      errors.dueDate = dateValidation.error || TASK_ERROR_MESSAGES.INVALID_DATE;
    }
    
    // Validate status
    if (!data.status) {
      errors.status = TASK_ERROR_MESSAGES.REQUIRED_FIELD;
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  /**
   * Validate complete task object
   * @param task - Task to validate
   * @returns Validation result
   */
  static validateTask(task: Task): ValidationResult {
    const errors: Record<string, string> = {};
    
    // Validate ID
    if (!task.id || task.id.trim().length === 0) {
      errors.id = 'ID da tarefa é obrigatório';
    }
    
    // Validate parent action ID
    if (!task.parentActionId || task.parentActionId <= 0) {
      errors.parentActionId = 'ID da ação pai é obrigatório';
    }
    
    // Validate form data
    const formValidation = this.validateTaskForm({
      title: task.title,
      description: task.description,
      responsible: task.responsible,
      sector: task.sector,
      dueDate: task.dueDate,
      status: task.status
    });
    
    Object.assign(errors, formValidation.errors);
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  /**
   * Validate date format and value
   * @param dateStr - Date string in DD/MM/YYYY format
   * @param allowPast - Whether to allow past dates (default: true)
   * @returns Validation result
   */
  static validateDate(dateStr: string, allowPast: boolean = true): { isValid: boolean; error?: string } {
    if (!dateStr || dateStr.trim().length === 0) {
      return { isValid: false, error: TASK_ERROR_MESSAGES.REQUIRED_FIELD };
    }
    
    // Check format DD/MM/YYYY
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!dateRegex.test(dateStr)) {
      return { isValid: false, error: TASK_ERROR_MESSAGES.INVALID_DATE };
    }
    
    // Parse and validate date
    try {
      const parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date());
      
      if (!isValid(parsedDate)) {
        return { isValid: false, error: 'Data inválida' };
      }
      
      // Check if date is in the past (if not allowed)
      if (!allowPast) {
        const today = startOfDay(new Date());
        const taskDate = startOfDay(parsedDate);
        
        if (isPast(taskDate) && taskDate.getTime() !== today.getTime()) {
          return { isValid: false, error: 'A data não pode ser no passado' };
        }
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: TASK_ERROR_MESSAGES.INVALID_DATE };
    }
  }
  
  /**
   * Sanitize string input
   * @param input - String to sanitize
   * @param maxLength - Maximum length
   * @returns Sanitized string
   */
  static sanitizeString(input: string, maxLength?: number): string {
    let sanitized = input.trim();
    
    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>]/g, '');
    
    // Limit length if specified
    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }
    
    return sanitized;
  }
  
  /**
   * Sanitize task form data
   * @param data - Form data to sanitize
   * @returns Sanitized form data
   */
  static sanitizeTaskForm(data: TaskFormData): TaskFormData {
    return {
      title: this.sanitizeString(data.title, TASK_VALIDATION.TITLE_MAX_LENGTH),
      description: this.sanitizeString(data.description, TASK_VALIDATION.DESCRIPTION_MAX_LENGTH),
      responsible: this.sanitizeString(data.responsible),
      sector: this.sanitizeString(data.sector),
      dueDate: data.dueDate.trim(),
      status: data.status
    };
  }
  
  /**
   * Check if a task is overdue
   * @param dueDate - Due date string (DD/MM/YYYY)
   * @param status - Current status
   * @returns true if overdue
   */
  static isTaskOverdue(dueDate: string, status: string): boolean {
    if (status === 'Concluído') {
      return false;
    }
    
    try {
      const parsedDate = parse(dueDate, 'dd/MM/yyyy', new Date());
      const today = startOfDay(new Date());
      const taskDate = startOfDay(parsedDate);
      
      return isPast(taskDate) && taskDate.getTime() !== today.getTime();
    } catch {
      return false;
    }
  }
}
