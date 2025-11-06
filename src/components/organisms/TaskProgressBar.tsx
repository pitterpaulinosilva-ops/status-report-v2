/**
 * TaskProgressBar Component
 * Displays visual progress bar and statistics for tasks
 */

import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock3, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskProgressBarProps {
  total: number;
  completed: number;
  overdue: number;
  onTime: number;
  className?: string;
}

export const TaskProgressBar = ({ 
  total, 
  completed, 
  overdue, 
  onTime,
  className 
}: TaskProgressBarProps) => {
  const progress = total > 0 ? (completed / total) * 100 : 0;
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700 dark:text-slate-300">
          Progresso das Tarefas
        </span>
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {completed}/{total} ({progress.toFixed(0)}%)
        </span>
      </div>
      
      <Progress 
        value={progress} 
        className="h-2"
        aria-label={`Progresso: ${progress.toFixed(0)}%`}
      />
      
      <div className="flex items-center gap-3 sm:gap-4 text-xs flex-wrap">
        {completed > 0 && (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
            <span className="whitespace-nowrap">{completed} concluída{completed !== 1 ? 's' : ''}</span>
          </div>
        )}
        
        {onTime > 0 && (
          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
            <Clock3 className="w-3 h-3 flex-shrink-0" />
            <span className="whitespace-nowrap">{onTime} no prazo</span>
          </div>
        )}
        
        {overdue > 0 && (
          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
            <span className="whitespace-nowrap">{overdue} em atraso</span>
          </div>
        )}
        
        {total === 0 && (
          <span className="text-slate-500 dark:text-slate-400">
            Nenhuma tarefa cadastrada
          </span>
        )}
      </div>
    </div>
  );
};
