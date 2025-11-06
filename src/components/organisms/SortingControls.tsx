import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { ActionItem } from '@/data/actionData';

export type SortField = 'action' | 'responsible' | 'sector' | 'dueDate' | 'status' | 'id';
export type SortDirection = 'asc' | 'desc';

interface SortingControlsProps {
  onSortChange: (field: SortField, direction: SortDirection) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
}

const SortingControls: React.FC<SortingControlsProps> = ({
  sortField = 'dueDate',
  sortDirection = 'asc',
  onSortChange
}) => {
  const sortOptions = [
    { value: 'id', label: 'Código' },
    { value: 'action', label: 'Ação' },
    { value: 'responsible', label: 'Responsável' },
    { value: 'sector', label: 'Setor' },
    { value: 'dueDate', label: 'Data de Vencimento' },
    { value: 'status', label: 'Status' }
  ];

  const handleSortFieldChange = (field: string) => {
    onSortChange(field as SortField, sortDirection);
  };

  const toggleSortDirection = () => {
    onSortChange(sortField, sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const getSortIcon = () => {
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4" />;
    } else {
      return <ArrowDown className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-slate-700/20 animate-slide-up">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
        Ordenar por:
      </span>
      
      <Select value={sortField} onValueChange={handleSortFieldChange}>
        <SelectTrigger className="w-[180px] bg-white/70 dark:bg-slate-700/70 border-gray-200 dark:border-slate-600 transition-smooth focus:scale-[1.02]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
          {sortOptions.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="hover:bg-gray-100 dark:hover:bg-slate-700 transition-fast"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={toggleSortDirection}
        className="bg-white/70 dark:bg-slate-700/70 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-smooth hover-lift"
        title={`Ordenação ${sortDirection === 'asc' ? 'Crescente' : 'Decrescente'}`}
      >
        {getSortIcon()}
        <span className="ml-1 text-xs">
          {sortDirection === 'asc' ? 'A-Z' : 'Z-A'}
        </span>
      </Button>
    </div>
  );
};

export default SortingControls;

// Função utilitária para ordenar dados
export const sortActionData = (
  data: ActionItem[],
  field: SortField,
  direction: SortDirection
): ActionItem[] => {
  return [...data].sort((a, b) => {
    let aValue: string | number | Date;
    let bValue: string | number | Date;

    switch (field) {
      case 'id':
        aValue = a.id;
        bValue = b.id;
        break;
      case 'action':
        aValue = a.action.toLowerCase();
        bValue = b.action.toLowerCase();
        break;
      case 'responsible':
        aValue = a.responsible.toLowerCase();
        bValue = b.responsible.toLowerCase();
        break;
      case 'sector':
        aValue = a.sector.toLowerCase();
        bValue = b.sector.toLowerCase();
        break;
      case 'dueDate': {
        // Converter data do formato DD/MM/YYYY para Date para comparação
        const parseDate = (dateStr: string) => {
          const [day, month, year] = dateStr.split('/');
          return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
        };
        const aDate = parseDate(a.dueDate);
        const bDate = parseDate(b.dueDate);
        aValue = aDate;
        bValue = bDate;
        break;
      }
      case 'status': {
        // Definir ordem de prioridade para status
        const statusOrder: Record<string, number> = {
          'Em Andamento': 1,
          'Planejado': 2,
          'Concluído': 3
        };
        const aStatus = statusOrder[a.status] ?? 999;
        const bStatus = statusOrder[b.status] ?? 999;
        aValue = aStatus;
        bValue = bStatus;
        break;
      }
      default:
        aValue = a.id;
        bValue = b.id;
    }

    if (aValue < bValue) {
      return direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
};