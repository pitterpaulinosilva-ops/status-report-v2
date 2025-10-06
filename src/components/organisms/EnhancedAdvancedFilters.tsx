import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, FilterIcon, X, Search, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AdvancedFiltersProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  sectorFilter: string;
  onSectorFilterChange: (sector: string) => void;
  responsibleFilter: string;
  onResponsibleFilterChange: (responsible: string) => void;
  dateRange: { start: Date | null; end: Date | null };
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void;
  uniqueValues: {
    sectors: string[];
    responsibles: string[];
    statuses: string[];
  };
  onClearFilters: () => void;
  stats: {
    total: number;
    completed: number;
    overdue: number;
    onTime: number;
    completionRate: number;
  };
}

const EnhancedAdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  sectorFilter,
  onSectorFilterChange,
  responsibleFilter,
  onResponsibleFilterChange,
  dateRange,
  onDateRangeChange,
  uniqueValues,
  onClearFilters,
  stats
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const activeFiltersCount = [
    searchTerm,
    statusFilter !== 'all' ? statusFilter : null,
    sectorFilter !== 'all' ? sectorFilter : null,
    responsibleFilter !== 'all' ? responsibleFilter : null,
    dateRange.start || dateRange.end ? 'dateRange' : null
  ].filter(Boolean).length;

  const handleClearAllFilters = () => {
    onClearFilters();
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Quick Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar ações, responsáveis, setores..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-10 pr-4"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchTermChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={isOpen ? "secondary" : "outline"}
            onClick={() => setIsOpen(!isOpen)}
            className="relative"
          >
            <FilterIcon className="w-4 h-4 mr-2" />
            Filtros Avançados
            {activeFiltersCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAllFilters}
              className="text-red-600 hover:text-red-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Concluídas</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Em Atraso</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
          <div className="text-2xl font-bold text-yellow-600">{stats.onTime}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">No Prazo</div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {isOpen && (
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center">
                <FilterIcon className="w-5 h-5 mr-2" />
                Filtros Avançados
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {uniqueValues.statuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sector Filter */}
              <div className="space-y-2">
                <Label htmlFor="sector-filter">Setor</Label>
                <Select value={sectorFilter} onValueChange={onSectorFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os setores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {uniqueValues.sectors.map(sector => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Responsible Filter */}
              <div className="space-y-2">
                <Label htmlFor="responsible-filter">Responsável</Label>
                <Select value={responsibleFilter} onValueChange={onResponsibleFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os responsáveis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {uniqueValues.responsibles.map(responsible => (
                      <SelectItem key={responsible} value={responsible}>
                        {responsible.length > 30 ? responsible.substring(0, 30) + '...' : responsible}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label>Período de Vencimento</Label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label className="text-sm text-gray-600">Data Inicial</Label>
                  <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.start && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.start ? format(dateRange.start, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.start}
                        onSelect={(date) => {
                          onDateRangeChange({ ...dateRange, start: date || null });
                          setStartDateOpen(false);
                        }}
                        locale={ptBR}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex-1">
                  <Label className="text-sm text-gray-600">Data Final</Label>
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.end && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.end ? format(dateRange.end, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.end}
                        onSelect={(date) => {
                          onDateRangeChange({ ...dateRange, end: date || null });
                          setEndDateOpen(false);
                        }}
                        locale={ptBR}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              {(dateRange.start || dateRange.end) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDateRangeChange({ start: null, end: null })}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-3 h-3 mr-1" />
                  Limpar período
                </Button>
              )}
            </div>

            {/* Active Filters Summary */}
            {activeFiltersCount > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Filtros Ativos ({activeFiltersCount})
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllFilters}
                    className="text-red-600 hover:text-red-700"
                  >
                    Limpar Todos
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedAdvancedFilters;