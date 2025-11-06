/**
 * Action Storage Service
 * Handles persistent storage of actions using encrypted localStorage
 */

import { ActionItem } from '@/data/actionData';
import { setSecureItem, getSecureItem, removeSecureItem } from '@/lib/encryption';

const ACTIONS_STORAGE_KEY = 'action-items-data';
const ACTIONS_DATA_VERSION = '1.0.0';

interface ActionStorageData {
  actions: ActionItem[];
  lastUpdated: number;
  version: string;
}

export class ActionStorage {
  /**
   * Get all actions from storage
   */
  static getActions(): ActionItem[] {
    try {
      const data = getSecureItem<ActionStorageData>(ACTIONS_STORAGE_KEY);
      
      if (!data || !Array.isArray(data.actions)) {
        return [];
      }
      
      return data.actions;
    } catch (error) {
      console.error('Error loading actions:', error);
      return [];
    }
  }
  
  /**
   * Get a single action by ID
   */
  static getActionById(actionId: number): ActionItem | undefined {
    const actions = this.getActions();
    return actions.find(action => action.id === actionId);
  }
  
  /**
   * Save an action (create or update)
   */
  static saveAction(action: ActionItem): void {
    try {
      const actions = this.getActions();
      const existingIndex = actions.findIndex(a => a.id === action.id);
      
      if (existingIndex >= 0) {
        actions[existingIndex] = action;
      } else {
        actions.push(action);
      }
      
      this.saveActions(actions);
    } catch (error) {
      console.error('Error saving action:', error);
      throw new Error('Erro ao salvar ação. Tente novamente.');
    }
  }
  
  /**
   * Delete an action
   */
  static deleteAction(actionId: number): void {
    try {
      const actions = this.getActions().filter(a => a.id !== actionId);
      this.saveActions(actions);
    } catch (error) {
      console.error('Error deleting action:', error);
      throw new Error('Erro ao excluir ação. Tente novamente.');
    }
  }
  
  /**
   * Initialize storage with default actions
   */
  static initializeActions(defaultActions: ActionItem[]): void {
    const existing = this.getActions();
    if (existing.length === 0) {
      this.saveActions(defaultActions);
    }
  }
  
  /**
   * Clear all actions
   */
  static clearAllActions(): void {
    try {
      removeSecureItem(ACTIONS_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing actions:', error);
      throw new Error('Erro ao limpar ações.');
    }
  }
  
  /**
   * Private: Save all actions to storage
   */
  private static saveActions(actions: ActionItem[]): void {
    const data: ActionStorageData = {
      actions,
      lastUpdated: Date.now(),
      version: ACTIONS_DATA_VERSION
    };
    
    setSecureItem(ACTIONS_STORAGE_KEY, data);
  }
  
  /**
   * Get next available ID
   */
  static getNextId(): number {
    const actions = this.getActions();
    if (actions.length === 0) return 26213;
    
    const maxId = Math.max(...actions.map(a => a.id));
    return maxId + 1;
  }
}
