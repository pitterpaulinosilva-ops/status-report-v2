import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Filter, Calendar, Users, Building2 } from 'lucide-react';
import { ActionItem } from '@/data/actionData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AdvancedFiltersProps {
  data: ActionItem[];
  onFilterChange: (filteredData: ActionItem[]) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface FilterState {
  dateFrom: string;
  dateTo: string;
  selectedResponsibles: string[];
  selectedSectors: string[];
  selectedStatuses: string[];
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  data,
  onFilterChange,
  isOpen,
  onToggle
}) => {
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: '',
    dateTo: '',
    selectedResponsibles: [],
    selectedSectors: [],
    selectedStatuses: []
  });

  // Extrair valores únicos dos dados
  const uniqueResponsibles = [...new Set(data.map(item => item.responsible))].sort();
  const uniqueSectors = [...new Set(data.map(item => item.sector))].sort();
  const uniqueStatuses = [...new Set(data.map(item => item.status))].sort();

  const applyFilters = () => {
    let filtered = data;

    // Filtro por data
    if (filters.dateFrom || filters.dateTo) {
      filtered = filtered.filter(item => {
        const [day, month, year] = item.dueDate.split('/');
        const itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        
        let isValid = true;
        
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          isValid = isValid && itemDate >= fromDate;
        }
        
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          isValid = isValid && itemDate <= toDate;
        }
        
        return isValid;
      });
    }

    // Filtro por responsáveis
    if (filters.selectedResponsibles.length > 0) {
      filtered = filtered.filter(item => 
        filters.selectedResponsibles.includes(item.responsible)
      );
    }

    // Filtro por setores
    if (filters.selectedSectors.length > 0) {
      filtered = filtered.filter(item => 
        filters.selectedSectors.includes(item.sector)
      );
    }

    // Filtro por status
    if (filters.selectedStatuses.length > 0) {
      filtered = filtered.filter(item => 
        filters.selectedStatuses.includes(item.status)
      );
    }

    onFilterChange(filtered);
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      selectedResponsibles: [],
      selectedSectors: [],
      selectedStatuses: []
    });
    onFilterChange(data);
  };

  const removeResponsible = (responsible: string) => {
    setFilters(prev => ({
      ...prev,
      selectedResponsibles: prev.selectedResponsibles.filter(r => r !== responsible)
    }));
  };

  const removeSector = (sector: string) => {
    setFilters(prev => ({
      ...prev,
      selectedSectors: prev.selectedSectors.filter(s => s !== sector)
    }));
  };

  const removeStatus = (status: string) => {
    setFilters(prev => ({
      ...prev,
      selectedStatuses: prev.selectedStatuses.filter(s => s !== status)
    }));
  };

  const hasActiveFilters = 
    filters.dateFrom || 
    filters.dateTo || 
    filters.selectedResponsibles.length > 0 || 
    filters.selectedSectors.length > 0 || 
    filters.selectedStatuses.length > 0;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className={`relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20 hover:bg-white/90 dark:hover:bg-slate-700/90 transition-smooth ${
          hasActiveFilters ? 'ring-2 ring-blue-500 border-blue-500' : ''
        }`}
      >
        <Filter className="h-4 w-4 mr-2" />
        Filtros Avançados
        {hasActiveFilters && (
          <Badge 
            variant="secondary" 
            className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-blue-500 text-white"
          >
            !
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 mt-2 w-96 z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-white/20 dark:border-slate-700/20 shadow-xl animate-slide-up">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros Avançados
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Filtros de Data */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                Período
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="dateFrom" className="text-xs text-muted-foreground">De:</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo" className="text-xs text-muted-foreground">Até:</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Filtro de Responsáveis */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                Responsáveis
              </Label>
              <Select
                onValueChange={(value) => {
                  if (!filters.selectedResponsibles.includes(value)) {
                    setFilters(prev => ({
                      ...prev,
                      selectedResponsibles: [...prev.selectedResponsibles, value]
                    }));
                  }
                }}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Selecionar responsável" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueResponsibles.map(responsible => (
                    <SelectItem key={responsible} value={responsible}>
                      {responsible}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {filters.selectedResponsibles.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {filters.selectedResponsibles.map(responsible => (
                    <Badge key={responsible} variant="secondary" className="text-xs">
                      {responsible.length > 20 ? `${responsible.substring(0, 20)}...` : responsible}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 hover:bg-red-100"
                        onClick={() => removeResponsible(responsible)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Filtro de Setores */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="h-4 w-4" />
                Setores
              </Label>
              <Select
                onValueChange={(value) => {
                  if (!filters.selectedSectors.includes(value)) {
                    setFilters(prev => ({
                      ...prev,
                      selectedSectors: [...prev.selectedSectors, value]
                    }));
                  }
                }}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Selecionar setor" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueSectors.map(sector => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {filters.selectedSectors.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {filters.selectedSectors.map(sector => (
                    <Badge key={sector} variant="secondary" className="text-xs">
                      {sector}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 hover:bg-red-100"
                        onClick={() => removeSector(sector)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={applyFilters}
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Aplicar Filtros
              </Button>
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedFilters;