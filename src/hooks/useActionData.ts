/**
 * useActionData Hook
 * Custom hook for loading and managing action data from Supabase
 * Includes realtime subscriptions for live updates
 */

import { useState, useEffect, useCallback } from 'react';
import { ActionItem, actionData as defaultActions } from '@/data/actionData';
import { ActionStorage } from '@/lib/actionStorage';
import { calculateDelayStatus } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Action } from '@/types/supabase';

export const useActionData = () => {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Converter Action do Supabase para ActionItem
  const convertToActionItem = (action: Action): ActionItem => ({
    id: action.id,
    action: action.action,
    responsible: action.responsible,
    sector: action.sector,
    dueDate: action.due_date,
    status: action.status,
    delayStatus: action.delay_status || calculateDelayStatus(action.due_date, action.status),
    followUp: '', // Pode ser adicionado ao schema depois se necessário
  });
  
  const loadActions = useCallback(async () => {
    if (!user) {
      // Se não estiver autenticado, usar localStorage como fallback
      setIsLoading(true);
      try {
        let loadedActions = ActionStorage.getActions();
        
        if (loadedActions.length === 0) {
          ActionStorage.initializeActions(defaultActions);
          loadedActions = defaultActions;
        }
        
        const actionsWithStatus = loadedActions.map(action => ({
          ...action,
          delayStatus: calculateDelayStatus(action.dueDate, action.status)
        }));
        
        setActions(actionsWithStatus);
      } catch (err) {
        console.error('Error loading actions from localStorage:', err);
        setError('Erro ao carregar ações');
        setActions(defaultActions);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Carregar do Supabase se autenticado
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('actions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      if (data && data.length > 0) {
        const actionsWithStatus = data.map(convertToActionItem);
        setActions(actionsWithStatus);
      } else {
        // Se não houver ações no Supabase, usar localStorage como fallback
        let loadedActions = ActionStorage.getActions();
        
        if (loadedActions.length === 0) {
          ActionStorage.initializeActions(defaultActions);
          loadedActions = defaultActions;
        }
        
        const actionsWithStatus = loadedActions.map(action => ({
          ...action,
          delayStatus: calculateDelayStatus(action.dueDate, action.status)
        }));
        
        setActions(actionsWithStatus);
      }
    } catch (err) {
      console.error('Error loading actions from Supabase:', err);
      setError('Erro ao carregar ações do servidor');
      
      // Fallback para localStorage em caso de erro
      try {
        let loadedActions = ActionStorage.getActions();
        if (loadedActions.length === 0) {
          ActionStorage.initializeActions(defaultActions);
          loadedActions = defaultActions;
        }
        const actionsWithStatus = loadedActions.map(action => ({
          ...action,
          delayStatus: calculateDelayStatus(action.dueDate, action.status)
        }));
        setActions(actionsWithStatus);
      } catch {
        setActions(defaultActions);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    loadActions();
    
    // Setup realtime subscription se autenticado
    if (!user) return;
    
    const channel = supabase
      .channel('actions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'actions'
        },
        (payload) => {
          console.log('Action change received:', payload);
          loadActions(); // Recarregar ações quando houver mudanças
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadActions, user]);
  
  const refresh = useCallback(() => {
    loadActions();
  }, [loadActions]);
  
  return {
    actions,
    isLoading,
    error,
    refresh
  };
};
