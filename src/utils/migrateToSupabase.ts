/**
 * Migration Utility
 * Migrates data from localStorage to Supabase
 */

import { supabase } from '@/lib/supabase';
import { ActionStorage } from '@/lib/actionStorage';
import { TaskStorage } from '@/lib/taskStorage';
import type { ActionInsert, TaskInsert } from '@/types/supabase';

export interface MigrationResult {
  success: boolean;
  actionsCount: number;
  tasksCount: number;
  errors: string[];
  message: string;
}

export interface MigrationProgress {
  stage: 'detecting' | 'migrating_actions' | 'migrating_tasks' | 'cleaning' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
}

/**
 * Detect if there's data in localStorage that needs migration
 */
export const detectLocalStorageData = (): { hasActions: boolean; hasTask: boolean; actionsCount: number; tasksCount: number } => {
  try {
    const actions = ActionStorage.getActions();
    const tasks = TaskStorage.getTasks();
    
    return {
      hasActions: actions.length > 0,
      hasTask: tasks.length > 0,
      actionsCount: actions.length,
      tasksCount: tasks.length
    };
  } catch (error) {
    console.error('Error detecting localStorage data:', error);
    return {
      hasActions: false,
      hasTask: false,
      actionsCount: 0,
      tasksCount: 0
    };
  }
};

/**
 * Migrate actions from localStorage to Supabase
 */
const migrateActions = async (
  userId: string,
  onProgress?: (progress: MigrationProgress) => void
): Promise<{ success: boolean; count: number; errors: string[] }> => {
  const errors: string[] = [];
  let successCount = 0;
  
  try {
    const actions = ActionStorage.getActions();
    
    if (actions.length === 0) {
      return { success: true, count: 0, errors: [] };
    }
    
    onProgress?.({
      stage: 'migrating_actions',
      progress: 0,
      message: `Migrando ${actions.length} ações...`
    });
    
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      
      try {
        const actionInsert: ActionInsert = {
          action: action.action,
          responsible: action.responsible,
          sector: action.sector,
          due_date: action.dueDate,
          status: action.status,
          delay_status: action.delayStatus,
          created_by: userId,
        };
        
        const { error } = await supabase
          .from('actions')
          .insert(actionInsert)
          .select()
          .single();
        
        if (error) {
          // Log more details about the error
          console.error('Migration error for action:', action.id, error);
          errors.push(`Erro ao migrar ação ${action.id}: ${error.message}`);
        } else {
          successCount++;
        }
      } catch (err) {
        errors.push(`Erro ao migrar ação ${action.id}: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      }
      
      const progress = Math.round(((i + 1) / actions.length) * 50); // 0-50% para actions
      onProgress?.({
        stage: 'migrating_actions',
        progress,
        message: `Migrando ações: ${i + 1}/${actions.length}`
      });
    }
    
    return { success: errors.length === 0, count: successCount, errors };
  } catch (error) {
    return {
      success: false,
      count: successCount,
      errors: [`Erro geral ao migrar ações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
    };
  }
};

/**
 * Migrate tasks from localStorage to Supabase
 */
const migrateTasks = async (
  userId: string,
  onProgress?: (progress: MigrationProgress) => void
): Promise<{ success: boolean; count: number; errors: string[] }> => {
  const errors: string[] = [];
  let successCount = 0;
  
  try {
    const tasks = TaskStorage.getTasks();
    
    if (tasks.length === 0) {
      return { success: true, count: 0, errors: [] };
    }
    
    onProgress?.({
      stage: 'migrating_tasks',
      progress: 50,
      message: `Migrando ${tasks.length} tarefas...`
    });
    
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      
      try {
        const taskInsert: TaskInsert = {
          id: task.id,
          action_id: task.parentActionId,
          title: task.title,
          description: task.description,
          status: task.status,
          order_index: task.order,
          parent_id: null, // Pode ser adicionado suporte a hierarquia depois
          created_by: userId,
        };
        
        const { error } = await supabase
          .from('tasks')
          .insert(taskInsert);
        
        if (error) {
          errors.push(`Erro ao migrar tarefa ${task.id}: ${error.message}`);
        } else {
          successCount++;
        }
      } catch (err) {
        errors.push(`Erro ao migrar tarefa ${task.id}: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      }
      
      const progress = 50 + Math.round(((i + 1) / tasks.length) * 40); // 50-90% para tasks
      onProgress?.({
        stage: 'migrating_tasks',
        progress,
        message: `Migrando tarefas: ${i + 1}/${tasks.length}`
      });
    }
    
    return { success: errors.length === 0, count: successCount, errors };
  } catch (error) {
    return {
      success: false,
      count: successCount,
      errors: [`Erro geral ao migrar tarefas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
    };
  }
};

/**
 * Clean localStorage after successful migration
 */
const cleanLocalStorage = (onProgress?: (progress: MigrationProgress) => void): void => {
  try {
    onProgress?.({
      stage: 'cleaning',
      progress: 90,
      message: 'Limpando dados locais...'
    });
    
    // Limpar actions
    localStorage.removeItem('actions');
    localStorage.removeItem('actions_encrypted');
    
    // Limpar tasks
    localStorage.removeItem('tasks');
    localStorage.removeItem('tasks_encrypted');
    
    // Limpar comentários (opcional - pode querer manter)
    // Não vamos limpar comentários por enquanto
    
    onProgress?.({
      stage: 'cleaning',
      progress: 95,
      message: 'Dados locais limpos'
    });
  } catch (error) {
    console.error('Error cleaning localStorage:', error);
  }
};

/**
 * Main migration function
 * Migrates all data from localStorage to Supabase
 */
export const migrateToSupabase = async (
  userId: string,
  onProgress?: (progress: MigrationProgress) => void
): Promise<MigrationResult> => {
  const allErrors: string[] = [];
  
  try {
    // Detect data
    onProgress?.({
      stage: 'detecting',
      progress: 0,
      message: 'Detectando dados para migração...'
    });
    
    const detection = detectLocalStorageData();
    
    if (!detection.hasActions && !detection.hasTask) {
      return {
        success: true,
        actionsCount: 0,
        tasksCount: 0,
        errors: [],
        message: 'Nenhum dado para migrar'
      };
    }
    
    // Migrate actions
    const actionsResult = await migrateActions(userId, onProgress);
    allErrors.push(...actionsResult.errors);
    
    // Migrate tasks
    const tasksResult = await migrateTasks(userId, onProgress);
    allErrors.push(...tasksResult.errors);
    
    // Clean localStorage if migration was successful
    if (allErrors.length === 0) {
      cleanLocalStorage(onProgress);
      
      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: 'Migração concluída com sucesso!'
      });
      
      return {
        success: true,
        actionsCount: actionsResult.count,
        tasksCount: tasksResult.count,
        errors: [],
        message: `Migração concluída: ${actionsResult.count} ações e ${tasksResult.count} tarefas migradas`
      };
    } else {
      onProgress?.({
        stage: 'error',
        progress: 100,
        message: 'Migração concluída com erros'
      });
      
      return {
        success: false,
        actionsCount: actionsResult.count,
        tasksCount: tasksResult.count,
        errors: allErrors,
        message: `Migração parcial: ${actionsResult.count} ações e ${tasksResult.count} tarefas migradas, ${allErrors.length} erros`
      };
    }
  } catch (error) {
    onProgress?.({
      stage: 'error',
      progress: 100,
      message: 'Erro durante a migração'
    });
    
    return {
      success: false,
      actionsCount: 0,
      tasksCount: 0,
      errors: [`Erro fatal: ${error instanceof Error ? error.message : 'Erro desconhecido'}`],
      message: 'Falha na migração'
    };
  }
};

/**
 * Validate migration
 * Checks if data was migrated correctly
 */
export const validateMigration = async (userId: string): Promise<{ valid: boolean; message: string }> => {
  try {
    // Check actions
    const { count: actionsCount, error: actionsError } = await supabase
      .from('actions')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId);
    
    if (actionsError) {
      return { valid: false, message: `Erro ao validar ações: ${actionsError.message}` };
    }
    
    // Check tasks
    const { count: tasksCount, error: tasksError } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId);
    
    if (tasksError) {
      return { valid: false, message: `Erro ao validar tarefas: ${tasksError.message}` };
    }
    
    return {
      valid: true,
      message: `Validação bem-sucedida: ${actionsCount || 0} ações e ${tasksCount || 0} tarefas no Supabase`
    };
  } catch (error) {
    return {
      valid: false,
      message: `Erro ao validar migração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
};
