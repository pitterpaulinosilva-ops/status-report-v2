/**
 * TaskList Component
 * Displays a list of tasks with add button
 */

import { Task } from '@/types/task';
import { TaskItem } from './TaskItem';
import { Button } from '@/components/ui/button';
import { Plus, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
  isExpanded: boolean;
  className?: string;
}

export const TaskList = ({ 
  tasks, 
  onTaskClick, 
  onAddTask, 
  isExpanded,
  className 
}: TaskListProps) => {
  if (!isExpanded) return null;
  
  return (
    <div className={cn("mt-4 space-y-2 border-t border-slate-200 dark:border-slate-700 pt-4 animate-in slide-in-from-top-2 duration-200", className)}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <ListChecks className="w-4 h-4" />
          <span>Tarefas ({tasks.length})</span>
        </h4>
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onAddTask();
          }}
          className="h-7 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
        >
          <Plus className="w-3 h-3 mr-1" />
          Adicionar
        </Button>
      </div>
      
      {tasks.length === 0 ? (
        <div className="text-center py-8 px-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
          <ListChecks className="w-8 h-8 mx-auto mb-2 text-slate-400 dark:text-slate-500" />
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
            Nenhuma tarefa cadastrada
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Clique em "Adicionar" para criar a primeira tarefa
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className="animate-in fade-in slide-in-from-left-2 duration-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TaskItem
                task={task}
                onClick={() => onTaskClick(task)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
