
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActionItem } from '@/data/actionData';
import { calculateDelayStatus } from '@/lib/utils';
import ActionDetailsModal from '@/components/organisms/ActionDetailsModal';
import { User, Building2, Calendar } from 'lucide-react';
import React from 'react';

interface ActionCardProps {
  action: ActionItem;
}

const ActionCard = ({ action }: ActionCardProps) => {
  const currentDelayStatus = calculateDelayStatus(action.dueDate, action.status);

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
    <Card className="group relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover-lift hover:border-slate-300 dark:hover:border-slate-600 animate-fade-in">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <Badge className={`typography-caption font-semibold py-1.5 sm:py-2 px-2 sm:px-3 rounded-full ${getStatusClass(currentDelayStatus)} shadow-sm flex items-center transition-smooth`}>
            {getStatusIcon(currentDelayStatus)}
            <span className="truncate">{currentDelayStatus}</span>
          </Badge>
        </div>

        <h3 className="typography-heading-3 font-bold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4 leading-snug line-clamp-2">
          {action.action}
        </h3>

        <div className="space-y-2 sm:space-y-3 typography-body-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center min-w-0">
            <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <strong className="typography-body-sm font-semibold text-gray-700 dark:text-gray-200">Responsável:</strong>
              <span className="ml-2 truncate block sm:inline">{action.responsible}</span>
            </div>
          </div>
          <div className="flex items-center min-w-0">
            <Building2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <strong className="typography-body-sm font-semibold text-gray-700 dark:text-gray-200">Setor:</strong>
              <span className="ml-2 truncate block sm:inline">{action.sector}</span>
            </div>
          </div>
          <div className="flex items-center min-w-0">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <strong className="typography-body-sm font-semibold text-gray-700 dark:text-gray-200">Prazo:</strong>
              <span className="ml-2">{action.dueDate}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-dashed border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between gap-2">
            <span className={`typography-caption font-semibold py-1.5 sm:py-2 px-2 sm:px-3 rounded-full transition-smooth ${
              action.status === 'Concluído' 
                ? 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 dark:from-indigo-900/30 dark:to-indigo-800/30 dark:text-indigo-300' 
                : action.status === 'Planejado'
                ? 'bg-blue-100/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900/30 dark:to-yellow-800/30 dark:text-yellow-300'
            } shadow-sm`}>
              Status: {action.status}
            </span>
            <span className="typography-caption text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
              #{action.id}
            </span>
          </div>
        </div>

      </CardContent>

      <div className="bg-gray-50/80 dark:bg-slate-700/30 backdrop-blur-sm p-3 sm:p-4 border-t border-white/20 dark:border-slate-600/20 transition-smooth">
        <div className="flex justify-center">
          <ActionDetailsModal action={action} />
        </div>
      </div>
    </Card>
  );
};

export default ActionCard;
