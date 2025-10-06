
import { useMemo } from 'react';
import { actionData, ActionItem } from '@/data/actionData';
import { calculateDelayStatus } from '@/lib/utils';

export const useProcessedActionData = (): ActionItem[] => {
  return useMemo(() => {
    return actionData.map(action => {
      // Sempre recalcular o delayStatus baseado na data atual e status
      const calculatedDelayStatus = calculateDelayStatus(action.dueDate, action.status);
      
      return {
        ...action,
        delayStatus: calculatedDelayStatus
      };
    });
  }, []);
};
