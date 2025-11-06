/**
 * useActionCRUD Hook
 * Custom hook for Create, Read, Update, Delete operations on actions
 * Integrates with Supabase with localStorage fallback
 */

import { useState, useCallback } from 'react';
import { ActionItem } from '@/data/actionData';
import { ActionStorage } from '@/lib/actionStorage';
import { calculateDelayStatus } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from './usePermissions';
import type { ActionInsert, ActionUpdate } from '@/types/supabase';

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
  const { user } = useAuth();
  const { canCreateAction } = usePermissions();
  
  const createAction = useCallback(async (formData: ActionFormData): Promise<ActionItem> => {
    setIsSubmitting(true);
    setError(null);
    
    // Verificar permissão
    if (!canCreateAction()) {
      const error = new Error('Você não tem permissão para criar ações');
      setError(error.message);
      setIsSubmitting(false);
      throw error;
    }
    
    try {
      // Se autenticado, criar no Supabase
      if (user) {
        const delayStatus = calculateDelayStatus(formData.dueDate, formData.status);
        
        const actionInsert: ActionInsert = {
          action: formData.action,
          responsible: formData.responsible,
          sector: formData.sector,
          due_date: formData.dueDate,
          status: formData.status,
          delay_status: delayStatus,
          created_by: user.id,
        };
        
        const { data, error: insertError } = await supabase
          .from('actions')
          .insert(actionInsert)
          .select()
          .single();
        
        if (insertError) throw insertError;
        
        const newAction: ActionItem = {
          id: data.id,
          action: data.action,
          followUp: formData.followUp,
          responsible: data.responsible,
          sector: data.sector,
          dueDate: data.due_date,
          status: data.status,
          delayStatus: data.delay_status || delayStatus,
        };
        
        return newAction;
      }
      
      // Fallback para localStorage se não autenticado
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
  }, [user, canCreateAction]);
  
  const updateAction = useCallback(async (
    actionId: number,
    updates: Partial<ActionFormData>
  ): Promise<ActionItem> => {
    setIsSubmitting(true);
    setError(null);
    
    // Verificar permissão (apenas admins podem editar)
    const { canEditAction } = usePermissions();
    if (!canEditAction()) {
      const error = new Error('Você não tem permissão para editar ações');
      setError(error.message);
      setIsSubmitting(false);
      throw error;
    }
    
    try {
      // Se autenticado, atualizar no Supabase
      if (user) {
        const actionUpdate: ActionUpdate = {};
        
        if (updates.action !== undefined) actionUpdate.action = updates.action;
        if (updates.responsible !== undefined) actionUpdate.responsible = updates.responsible;
        if (updates.sector !== undefined) actionUpdate.sector = updates.sector;
        if (updates.dueDate !== undefined) actionUpdate.due_date = updates.dueDate;
        if (updates.status !== undefined) actionUpdate.status = updates.status;
        
        // Calcular delay status se dueDate ou status mudaram
        if (updates.dueDate !== undefined || updates.status !== undefined) {
          // Buscar ação atual para pegar valores não atualizados
          const { data: currentAction } = await supabase
            .from('actions')
            .select('due_date, status')
            .eq('id', actionId)
            .single();
          
          const dueDate = updates.dueDate ?? currentAction?.due_date ?? '';
          const status = updates.status ?? currentAction?.status ?? '';
          actionUpdate.delay_status = calculateDelayStatus(dueDate, status);
        }
        
        actionUpdate.updated_at = new Date().toISOString();
        
        const { data, error: updateError } = await supabase
          .from('actions')
          .update(actionUpdate)
          .eq('id', actionId)
          .select()
          .single();
        
        if (updateError) throw updateError;
        
        const updatedAction: ActionItem = {
          id: data.id,
          action: data.action,
          followUp: updates.followUp ?? '', // followUp não está no DB ainda
          responsible: data.responsible,
          sector: data.sector,
          dueDate: data.due_date,
          status: data.status,
          delayStatus: data.delay_status || calculateDelayStatus(data.due_date, data.status),
        };
        
        return updatedAction;
      }
      
      // Fallback para localStorage se não autenticado
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
  }, [user]);
  
  const deleteAction = useCallback(async (
    actionId: number,
    skipConfirmation: boolean = false
  ): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    
    // Verificar permissão (apenas admins podem deletar)
    const { canDeleteAction } = usePermissions();
    if (!canDeleteAction()) {
      const error = new Error('Você não tem permissão para excluir ações');
      setError(error.message);
      setIsSubmitting(false);
      throw error;
    }
    
    try {
      if (!skipConfirmation) {
        const confirmed = window.confirm(
          'Tem certeza que deseja excluir esta ação? Esta ação não pode ser desfeita.'
        );
        if (!confirmed) {
          setIsSubmitting(false);
          return false;
        }
      }
      
      // Se autenticado, deletar do Supabase
      if (user) {
        const { error: deleteError } = await supabase
          .from('actions')
          .delete()
          .eq('id', actionId);
        
        if (deleteError) throw deleteError;
        return true;
      }
      
      // Fallback para localStorage se não autenticado
      const existingAction = ActionStorage.getActionById(actionId);
      if (!existingAction) {
        throw new Error('Ação não encontrada');
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
  }, [user]);
  
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
