/**
 * TaskItem Component
 * Displays a single task in a compact card format
 */

import { Task } from '@/types/task';
import { Badge } from '@/components/ui/badge';
import { UserCircle2, CalendarCheck2, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TASK_STATUS_COLORS } from '@/constants/taskConstants';

interface TaskItemProps {
  task: Task;
  onClick: () => void;
  className?: string;
}

export const TaskItem = ({ task, onClick, className }: TaskItemProps) => {
  const statusColors = TASK_STATUS_COLORS[task.delayStatus];
  
  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Tarefa: ${task.title}`}
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-all",
        "hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100 flex-1 line-clamp-2">
          {task.title}
        </h5>
        <Badge 
          className={cn(
            "text-xs flex-shrink-0",
            statusColors.bg,
            statusColors.text
          )}
        >
          {task.delayStatus}
        </Badge>
      </div>
      
      {task.description && (
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
          {task.description}
        </p>
      )}
      
      <div className="flex items-center gap-3 sm:gap-4 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
        <div className="flex items-center gap-1">
          <UserCircle2 className="w-3 h-3 flex-shrink-0" />
          <span className="truncate max-w-[120px]">{task.responsible}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Building2 className="w-3 h-3 flex-shrink-0" />
          <span className="truncate max-w-[100px]">{task.sector}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <CalendarCheck2 className="w-3 h-3 flex-shrink-0" />
          <span className="whitespace-nowrap">{task.dueDate}</span>
        </div>
      </div>
    </div>
  );
};
