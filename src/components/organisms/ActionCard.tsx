
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActionItem } from '@/data/actionData';
import { calculateDelayStatus } from '@/lib/utils';
import ActionDetailsModal from '@/components/organisms/ActionDetailsModal';
import { UserCircle2, Building2, CalendarCheck2, ChevronDown, ChevronUp, ListChecks } from 'lucide-react';
import { useState } from 'react';
import { useTaskData } from '@/hooks/useTaskData';
import { TaskProgressBar } from './TaskProgressBar';
import { TaskList } from './TaskList';
import { TaskModal } from './TaskModal';
import { Task } from '@/types/task';

interface ActionCardProps {
  action: ActionItem;
  onEdit?: (action: ActionItem) => void;
  shouldExpandTasks?: boolean;
}

const ActionCard = ({ action, onEdit, shouldExpandTasks = false }: ActionCardProps) => {
  const currentDelayStatus = calculateDelayStatus(action.dueDate, action.status);
  
  // Task management state
  const [isTasksExpanded, setIsTasksExpanded] = useState(shouldExpandTasks);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const { tasks, stats, refresh } = useTaskData(action.id);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Em Atraso':
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900/30 dark:to-red-800/30 dark:text-red-300';
      case 'No Prazo':
        return 'bg-gradient-to-r from-sky-100 to-sky-200 text-sky-800 dark:from-sky-900/30 dark:to-sky-800/30 dark:text-sky-300';
      case 'Concluído':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/30 dark:to-green-800/30 dark:text-green-300';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-800/30 dark:to-gray-700/30 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Em Atraso':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'No Prazo':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'Concluído':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zM12 12a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 5.168A1 1 0 008 6v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900/50 border-2 border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:border-sesi-blue/60 dark:hover:border-sesi-blue/60 animate-fade-in backdrop-blur-sm">
      {/* Decorative gradient overlay - SESI/SENAI colors */}
      <div className="absolute top-0 left-0 right-0 h-1 gradient-sesi opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardContent className="p-5 sm:p-6">
        {/* Header with Status and ID */}
        <div className="flex items-start justify-between mb-4 gap-3">
          <Badge className={`typography-caption font-bold py-2 px-4 rounded-xl ${getStatusClass(currentDelayStatus)} shadow-lg flex items-center gap-1.5 transition-all duration-300 hover:scale-105 border border-white/20`}>
            {getStatusIcon(currentDelayStatus)}
            <span className="truncate">{currentDelayStatus}</span>
          </Badge>
          <div className="flex flex-col items-end gap-1">
            <span className="typography-caption font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-600">
              #{action.id}
            </span>
            {stats.total > 0 && (
              <span className="typography-caption text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                <ListChecks className="w-3 h-3" />
                {stats.total}
              </span>
            )}
          </div>
        </div>

        {/* Title with gradient underline - SESI/SENAI colors */}
        <div className="mb-4 relative">
          <h3 className="typography-heading-3 font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 mb-2 leading-snug line-clamp-2 group-hover:gradient-sesi-text transition-all duration-300">
            {action.action}
          </h3>
          <div className="h-0.5 w-12 gradient-sesi rounded-full group-hover:w-full transition-all duration-500"></div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 gap-2.5 mb-4">
          {/* Responsável - SESI Blue */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#164194]/5 to-[#164194]/10 dark:from-[#164194]/20 dark:to-[#164194]/10 border border-[#164194]/20 dark:border-[#164194]/30 group/info hover:shadow-md transition-all duration-300">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#164194]/10 dark:bg-[#164194]/20 flex items-center justify-center group-hover/info:scale-110 transition-transform">
              <UserCircle2 className="h-5 w-5 text-[#164194] dark:text-[#4a7bc8]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#164194]/70 dark:text-[#4a7bc8]/70 mb-0.5">Responsável</p>
              <p className="text-sm font-semibold text-[#164194] dark:text-[#4a7bc8] truncate">{action.responsible}</p>
            </div>
          </div>

          {/* Setor - SESI Green */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#52AE32]/5 to-[#52AE32]/10 dark:from-[#52AE32]/20 dark:to-[#52AE32]/10 border border-[#52AE32]/20 dark:border-[#52AE32]/30 group/info hover:shadow-md transition-all duration-300">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#52AE32]/10 dark:bg-[#52AE32]/20 flex items-center justify-center group-hover/info:scale-110 transition-transform">
              <Building2 className="h-5 w-5 text-[#52AE32] dark:text-[#7bc95e]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#52AE32]/70 dark:text-[#7bc95e]/70 mb-0.5">Setor</p>
              <p className="text-sm font-semibold text-[#52AE32] dark:text-[#7bc95e] truncate">{action.sector}</p>
            </div>
          </div>

          {/* Prazo e Status - SENAI Orange */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#E84910]/5 to-[#E84910]/10 dark:from-[#E84910]/20 dark:to-[#E84910]/10 border border-[#E84910]/20 dark:border-[#E84910]/30 group/info hover:shadow-md transition-all duration-300">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#E84910]/10 dark:bg-[#E84910]/20 flex items-center justify-center group-hover/info:scale-110 transition-transform">
              <CalendarCheck2 className="h-5 w-5 text-[#E84910] dark:text-[#ff7a4d]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#E84910]/70 dark:text-[#ff7a4d]/70 mb-0.5">Prazo</p>
              <p className="text-sm font-semibold text-[#E84910] dark:text-[#ff7a4d]">{action.dueDate}</p>
            </div>
            <Badge className={`typography-caption font-bold py-1.5 px-3 rounded-lg shadow-sm ${
              action.status === 'Concluído' 
                ? 'bg-[#52AE32] text-white border-[#52AE32]' 
                : action.status === 'Planejado'
                ? 'bg-[#164194] text-white border-[#164194]'
                : 'bg-[#E84910] text-white border-[#E84910]'
            } border`}>
              {action.status}
            </Badge>
          </div>
        </div>

        {/* Task Section - SESI Blue */}
        {stats.total > 0 && (
          <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-200 dark:border-slate-700">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsTasksExpanded(!isTasksExpanded);
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#164194]/5 to-[#164194]/10 dark:from-[#164194]/20 dark:to-[#164194]/10 border border-[#164194]/20 dark:border-[#164194]/30 hover:shadow-md transition-all duration-300 group/tasks"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#164194]/10 dark:bg-[#164194]/20 flex items-center justify-center group-hover/tasks:scale-110 transition-transform">
                  <ListChecks className="w-4 h-4 text-[#164194] dark:text-[#4a7bc8]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-[#164194] dark:text-[#4a7bc8]">
                    {stats.total} {stats.total === 1 ? 'Tarefa' : 'Tarefas'}
                  </p>
                  <p className="text-xs text-[#164194]/70 dark:text-[#4a7bc8]/70">
                    {stats.completed} concluídas
                  </p>
                </div>
                {stats.overdue > 0 && (
                  <Badge className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">
                    {stats.overdue} atrasadas
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#164194] dark:text-[#4a7bc8]">
                  {isTasksExpanded ? 'Ocultar' : 'Ver'}
                </span>
                {isTasksExpanded ? (
                  <ChevronUp className="w-5 h-5 text-[#164194] dark:text-[#4a7bc8] transition-transform" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#164194] dark:text-[#4a7bc8] transition-transform" />
                )}
              </div>
            </button>
            
            {isTasksExpanded && (
              <div className="mt-3 space-y-3">
                <TaskProgressBar
                  total={stats.total}
                  completed={stats.completed}
                  overdue={stats.overdue}
                  onTime={stats.onTime}
                />
              </div>
            )}
            
            <TaskList
              tasks={tasks}
              onTaskClick={(task) => {
                setSelectedTask(task);
                setIsTaskModalOpen(true);
              }}
              onAddTask={() => {
                setSelectedTask(undefined);
                setIsTaskModalOpen(true);
              }}
              isExpanded={isTasksExpanded}
            />
          </div>
        )}

      </CardContent>

      {/* Footer with SESI/SENAI gradient */}
      <div className="relative bg-gradient-to-r from-slate-50/90 via-[#164194]/5 to-[#52AE32]/5 dark:from-slate-800/90 dark:via-[#164194]/10 dark:to-[#52AE32]/10 backdrop-blur-sm p-4 border-t-2 border-slate-200/60 dark:border-slate-700/60 transition-all duration-300">
        <div className="flex justify-center">
          <ActionDetailsModal 
            action={action} 
            onEdit={onEdit ? () => onEdit(action) : undefined}
          />
        </div>
      </div>
      
      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(undefined);
        }}
        onSuccess={() => {
          refresh();
        }}
        parentActionId={action.id}
        task={selectedTask}
      />
    </Card>
  );
};

export default ActionCard;
