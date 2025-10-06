import { useMemo } from 'react';
import { ActionItem } from '@/data/actionData';
import { parse, isWithinInterval } from 'date-fns';

interface UseAdvancedFiltersProps {
  data: ActionItem[];
  searchTerm: string;
  statusFilter: string;
  sectorFilter: string;
  responsibleFilter: string;
  dateRange: { start: Date | null; end: Date | null };
  sortField: string;
  sortDirection: 'asc' | 'desc';
}

export const useAdvancedFilters = ({
  data,
  searchTerm,
  statusFilter,
  sectorFilter,
  responsibleFilter,
  dateRange,
  sortField,
  sortDirection
}: UseAdvancedFiltersProps) => {
  
  const filteredAndSortedData = useMemo(() => {
    const filtered = data.filter(item => {
      // Search filter
      const searchMatch = !searchTerm || (
        item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.responsible.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.followUp.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Status filter
      const statusMatch = statusFilter === 'all' || item.delayStatus === statusFilter;
      
      // Sector filter
      const sectorMatch = sectorFilter === 'all' || item.sector === sectorFilter;
      
      // Responsible filter
      const responsibleMatch = responsibleFilter === 'all' || item.responsible === responsibleFilter;
      
      // Date range filter
      let dateMatch = true;
      if (dateRange.start && dateRange.end) {
        try {
          const itemDate = parse(item.dueDate, 'dd/MM/yyyy', new Date());
          dateMatch = isWithinInterval(itemDate, {
            start: dateRange.start,
            end: dateRange.end
          });
        } catch {
          dateMatch = true;
        }
      }
      
      return searchMatch && statusMatch && sectorMatch && responsibleMatch && dateMatch;
    });
    
    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'dueDate':
          try {
            aValue = parse(a.dueDate, 'dd/MM/yyyy', new Date()).getTime();
            bValue = parse(b.dueDate, 'dd/MM/yyyy', new Date()).getTime();
          } catch {
            aValue = 0;
            bValue = 0;
          }
          break;
        case 'responsible':
          aValue = a.responsible.toLowerCase();
          bValue = b.responsible.toLowerCase();
          break;
        case 'sector':
          aValue = a.sector.toLowerCase();
          bValue = b.sector.toLowerCase();
          break;
        case 'status':
          aValue = a.delayStatus.toLowerCase();
          bValue = b.delayStatus.toLowerCase();
          break;
        default:
          aValue = a.action.toLowerCase();
          bValue = b.action.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [data, searchTerm, statusFilter, sectorFilter, responsibleFilter, dateRange, sortField, sortDirection]);
  
  const stats = useMemo(() => {
    const total = filteredAndSortedData.length;
    const completed = filteredAndSortedData.filter(item => item.delayStatus === 'Concluído').length;
    const overdue = filteredAndSortedData.filter(item => item.delayStatus === 'Em Atraso').length;
    const onTime = filteredAndSortedData.filter(item => item.delayStatus === 'No Prazo').length;
    
    return {
      total,
      completed,
      overdue,
      onTime,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    };
  }, [filteredAndSortedData]);
  
  const uniqueValues = useMemo(() => {
    const sectors = [...new Set(data.map(item => item.sector))].sort();
    const responsibles = [...new Set(data.map(item => item.responsible))].sort();
    const statuses = [...new Set(data.map(item => item.delayStatus))].sort();
    
    return { sectors, responsibles, statuses };
  }, [data]);
  
  return {
    filteredData: filteredAndSortedData,
    stats,
    uniqueValues
  };
};