/**
 * useActionCRUD Hook
 * Custom hook for Create, Read, Update, Delete operations on actions
 */

import { useState, useCallback } from 'react';
import { ActionItem } from '@/data/actionData';
import { ActionStorage } from '@/lib/actionStorage';
import { calculateDelayStatus } from '@/lib/utils';

export interface ActionFormData {
  action: string;
  followUp: string;
  responsible: string;
  sector: string;
  dueDate: string;
  status: string;
}

export const useActionCRUD = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const createAction = useCallback(async (formData: ActionFormData): Promise<ActionItem> => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const newId = ActionStorage.getNextId();
      const delayStatus = calculateDelayStatus(formData.dueDate, formData.status);
      
      const newAction: ActionItem = {
        id: newId,
        action: formData.action,
        followUp: formData.followUp,
        responsible: formData.responsible,
        sector: formData.sector,
        dueDate: formData.dueDate,
        status: formData.status,
        delayStatus
      };
      
      ActionStorage.saveAction(newAction);
      return newAction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar ação';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);
  
  const updateAction = useCallback(async (
    actionId: number,
    updates: Partial<ActionFormData>
  ): Promise<ActionItem> => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const existingAction = ActionStorage.getActionById(actionId);
      if (!existingAction) {
        throw new Error('Ação não encontrada');
      }
      
      const updatedAction: ActionItem = {
        ...existingAction,
        action: updates.action ?? existingAction.action,
        followUp: updates.followUp ?? existingAction.followUp,
        responsible: updates.responsible ?? existingAction.responsible,
        sector: updates.sector ?? existingAction.sector,
        dueDate: updates.dueDate ?? existingAction.dueDate,
        status: updates.status ?? existingAction.status,
        delayStatus: calculateDelayStatus(
          updates.dueDate ?? existingAction.dueDate,
          updates.status ?? existingAction.status
        )
      };
      
      ActionStorage.saveAction(updatedAction);
      return updatedAction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar ação';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);
  
  const deleteAction = useCallback(async (
    actionId: number,
    skipConfirmation: boolean = false
  ): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const existingAction = ActionStorage.getActionById(actionId);
      if (!existingAction) {
        throw new Error('Ação não encontrada');
      }
      
      if (!skipConfirmation) {
        const confirmed = window.confirm(
          'Tem certeza que deseja excluir esta ação? Esta ação não pode ser desfeita.'
        );
        if (!confirmed) {
          return false;
        }
      }
      
      ActionStorage.deleteAction(actionId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir ação';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    createAction,
    updateAction,
    deleteAction,
    isSubmitting,
    error,
    clearError
  };
};
