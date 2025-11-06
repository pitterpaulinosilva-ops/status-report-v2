/**
 * useActionData Hook
 * Custom hook for loading and managing action data
 */

import { useState, useEffect, useCallback } from 'react';
import { ActionItem, actionData as defaultActions } from '@/data/actionData';
import { ActionStorage } from '@/lib/actionStorage';
import { calculateDelayStatus } from '@/lib/utils';

export const useActionData = () => {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadActions = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      let loadedActions = ActionStorage.getActions();
      
      // Se não houver ações no storage, inicializar com dados padrão
      if (loadedActions.length === 0) {
        ActionStorage.initializeActions(defaultActions);
        loadedActions = defaultActions;
      }
      
      // Calcular delay status para cada ação
      const actionsWithStatus = loadedActions.map(action => ({
        ...action,
        delayStatus: calculateDelayStatus(action.dueDate, action.status)
      }));
      
      setActions(actionsWithStatus);
    } catch (err) {
      console.error('Error loading actions:', err);
      setError('Erro ao carregar ações');
      setActions(defaultActions);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadActions();
  }, [loadActions]);
  
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
