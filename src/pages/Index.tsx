import { useState, useEffect, useMemo } from 'react';
import { Search, ExternalLink, Menu, ClipboardList, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ActionCard from '@/components/organisms/ActionCard';
import ResponsibleChart from '@/components/organisms/ResponsibleChart';
import SectorChart from '@/components/organisms/SectorChart';
import StatusChart from '@/components/organisms/StatusChart';
import ThemeToggle from '@/components/organisms/ThemeToggle';
import ExportButton from '@/components/organisms/ExportButton';
import NotificationPanel from '@/components/organisms/NotificationPanel';
import AdvancedDashboard from '@/components/organisms/AdvancedDashboard';
import AdvancedFilters from '@/components/organisms/AdvancedFilters';
import SortingControls, { SortField, SortDirection, sortActionData } from '@/components/organisms/SortingControls';
import { useProcessedActionData } from '@/hooks/useProcessedActionData';
import { useStatePersistence } from '@/hooks/useStatePersistence';
import { Button } from '@/components/ui/button';
import MobileMenu from '@/components/organisms/MobileMenu';
import useSidebar from '@/hooks/useSidebar';
import type { ActionItem } from '@/data/actionData';
import { planInfo } from '@/data/actionData';
import { searchInputSchema } from '@/lib/validation';
import { cn, calculateDelayStatus } from '@/lib/utils';
import { useCallback } from 'react';
import AIAssistantModal from '@/components/organisms/AIAssistantModal';
import AssistantONAInsights from '@/components/organisms/AssistantONAInsights';

const Index = () => {
  const processedActionData = useProcessedActionData();
  const {
    saveScrollPosition,
    saveActiveFilters,
    saveSelectedView,
    restoreScrollPosition,
    getPersistedState
  } = useStatePersistence();

  // Restaurar estado persistido na inicialização
  const persistedState = getPersistedState();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<'gemini' | 'copilot'>('gemini');

  const openModal = (assistant: 'gemini' | 'copilot') => {
    setSelectedAssistant(assistant);
    setIsModalOpen(true);
  };

  const sectionNames: { [key: string]: string } = {
    vision: 'Visão Geral',
    plan: 'Plano de Ação',
    responsible: 'Análise por Responsável',
    sector: 'Análise por Setor',
    insights: 'Assistente ONA Insights',
    settings: 'Configurações',
  };
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [advancedFilteredData, setAdvancedFilteredData] = useState(processedActionData);
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [sortedData, setSortedData] = useState(processedActionData);

  // Handler seguro para o campo de busca
  const handleSearchChange = (value: string) => {
    try {
      const validatedValue = searchInputSchema.parse(value);
      setSearchTerm(validatedValue);
    } catch (error) {
      // Se a validação falhar, mantém o valor anterior ou limita o tamanho
      const safValue = value.slice(0, 500).replace(/[^\w\s\-.#@(),:]/g, '');
      setSearchTerm(safValue);
    }
  };

  const {
    isMobileOpen,
    activeSection,
    toggleMobile,
    setSection,
  } = useSidebar();

  // Restaurar estado quando o componente for montado
  useEffect(() => {
    if (persistedState.activeFilters) {
      setCurrentFilter(persistedState.activeFilters.currentFilter || 'all');
      setSearchTerm(persistedState.activeFilters.searchTerm || '');
    }
    if (persistedState.selectedView) {
      setSection(persistedState.selectedView);
    }
    // Restaurar posição de scroll após um pequeno delay
    const timer = setTimeout(() => {
      restoreScrollPosition();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Listener para salvar posição de scroll
  useEffect(() => {
    const handleScroll = () => {
      saveScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [saveScrollPosition]);

  // Salvar filtros quando mudarem
  useEffect(() => {
    saveActiveFilters({
      currentFilter,
      searchTerm,
      sortField,
      sortDirection
    });
  }, [currentFilter, searchTerm, sortField, sortDirection, saveActiveFilters]);

  // Salvar seção ativa quando mudar
  useEffect(() => {
    saveSelectedView(activeSection);
  }, [activeSection, saveSelectedView]);

  useEffect(() => {
    const filtered = advancedFilteredData.filter(item => {
      const matchesSearch = item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.responsible.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sector.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (currentFilter === 'all') return matchesSearch;
      
      // Usar delayStatus calculado para filtrar
      const calculatedStatus = calculateDelayStatus(item.dueDate, item.status);
      return matchesSearch && calculatedStatus === currentFilter;
    });
    
    const sorted = sortActionData(filtered, sortField, sortDirection);
    setSortedData(sorted);
  }, [searchTerm, currentFilter, advancedFilteredData, sortField, sortDirection]);

  const handleSortChange = useCallback((field, direction) => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  const handleAdvancedFilterChange = (filteredData: ActionItem[]) => {
    setAdvancedFilteredData(filteredData);
  };

  // Calcular contagens para cada status usando delayStatus
  const statusCounts = useMemo(() => {
    const counts = {
      all: advancedFilteredData.length,
      'Em Atraso': 0,
      'No Prazo': 0,
      'Concluído': 0
    };
    
    advancedFilteredData.forEach(item => {
      // Usar delayStatus calculado em vez do status original
      const calculatedStatus = calculateDelayStatus(item.dueDate, item.status);
      if (calculatedStatus === 'Em Atraso') counts['Em Atraso']++;
      else if (calculatedStatus === 'No Prazo') counts['No Prazo']++;
      else if (calculatedStatus === 'Concluído') counts['Concluído']++;
    });
    
    return counts;
  }, [advancedFilteredData]);

  const filterButtons = [
    { value: 'all', label: 'Todas', count: statusCounts.all },
    { value: 'Em Atraso', label: 'Em Atraso', count: statusCounts['Em Atraso'] },
    { value: 'No Prazo', label: 'No Prazo', count: statusCounts['No Prazo'] },
    { value: 'Concluído', label: 'Concluído', count: statusCounts['Concluído'] }
  ];

  const getFooterText = () => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return `Atualizado em: ${formattedDate}`;
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'vision':
        return <AdvancedDashboard data={processedActionData} />;
      case 'plan':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6 transition-smooth">
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Buscar por ação, responsável..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-9 w-full h-10 transition-smooth"
                    />
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <SortingControls onSortChange={handleSortChange} />
                    <ExportButton data={processedActionData} filteredData={sortedData} searchTerm={searchTerm} currentFilter={currentFilter} />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {filterButtons.map(btn => (
                  <Button
                    key={btn.value}
                    variant={currentFilter === btn.value ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentFilter(btn.value)}
                    className={cn(
                      "flex items-center gap-2 relative",
                      currentFilter === btn.value && "ring-2 ring-primary/20 bg-primary/5 border-primary/30"
                    )}
                  >
                    {btn.label}
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-semibold",
                      currentFilter === btn.value 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-primary/10 text-primary"
                    )}>
                      {btn.count}
                    </span>
                    {currentFilter === btn.value && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                    )}
                  </Button>
                ))}
              </div>
              {sortedData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 animate-fade-in">
                  {sortedData.map(item => <ActionCard key={item.id} action={item} />)}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 animate-fade-in">
                  <div className="text-center max-w-md">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center transition-smooth">
                      <Search className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="typography-heading-3 text-slate-700 dark:text-slate-300 mb-2">
                      Não há ações disponíveis para seleção
                    </h3>
                    <p className="typography-body-md text-slate-500 dark:text-slate-400 max-w-md">
                      {currentFilter === 'all' 
                        ? 'Nenhuma ação foi encontrada com os critérios de busca atuais.'
                        : `Nenhuma ação foi encontrada para o filtro "${filterButtons.find(btn => btn.value === currentFilter)?.label}" com os critérios de busca atuais.`
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'responsible':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
              <h2 className="typography-heading-2 text-slate-900 dark:text-slate-100">Análise por Responsável</h2>
            </div>
            <div className="p-6">
              <ResponsibleChart data={processedActionData} />
            </div>
          </div>
        );
      case 'sector':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
              <h2 className="typography-heading-2 text-slate-900 dark:text-slate-100">Análise por Setor</h2>
            </div>
            <div className="p-6">
              <SectorChart data={processedActionData} />
            </div>
          </div>
        );
      case 'insights':
        return <AssistantONAInsights />;
      case 'settings':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="typography-heading-2 text-slate-900 dark:text-slate-100 mb-4">Configurações</h2>
            <p className="typography-body-md text-slate-600 dark:text-slate-400">Esta seção está em desenvolvimento.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <AIAssistantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialAssistant={selectedAssistant}
      />
      <MobileMenu
        activeSection={activeSection}
        onSectionChange={setSection}
        isMobileOpen={isMobileOpen}
        onMobileToggle={toggleMobile}
      />
      
      <div className="flex-1 flex flex-col min-h-screen w-full">
          <header className="sticky top-0 z-40">
            <div className="bg-white/98 dark:bg-slate-900/98 backdrop-blur-lg border-b border-slate-200/60 dark:border-slate-700/60 shadow-sm transition-smooth">
              <div className="px-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 sm:h-16">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMobile}
                      className="p-2 h-auto hover-lift"
                    >
                      <Menu className="w-5 h-5" />
                    </Button>
                    
                    <div className="hidden sm:flex items-center gap-3 text-sm min-w-0">
                      <img 
                        src="/images/sesi-senai-logomarca-nova.png" 
                        alt="SESI SENAI" 
                        className="sesi-senai-logo logo-header transition-smooth"
                      />
                      <span className="text-slate-400 dark:text-slate-500 mx-1">|</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-blue-700 dark:text-blue-300 font-bold tracking-wide truncate">
                          {planInfo.name}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {sectionNames[activeSection] || 'Visão Geral'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Mobile section title */}
                    <div className="sm:hidden flex flex-col min-w-0 flex-1">
                      <span className="text-blue-700 dark:text-blue-300 font-bold text-sm truncate">
                        {planInfo.name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {sectionNames[activeSection] || 'Visão Geral'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 sm:gap-3">
                    <a
                      href={planInfo.epaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden md:inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold text-white bg-blue-600 dark:bg-blue-700 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md hover-lift"
                    >
                      <ClipboardList className="w-4 h-4" />
                      <span className="hidden lg:inline">Plano de Ação do EPA</span>
                      <span className="lg:hidden">EPA</span>
                    </a>
                    
                    {/* Mobile EPA button */}
                    <a
                      href={planInfo.epaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="md:hidden inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-white bg-blue-600 dark:bg-blue-700 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200"
                    >
                      <ClipboardList className="w-3 h-3" />
                      EPA
                    </a>
                    
                    <NotificationPanel data={processedActionData} />
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-0 flex flex-col transition-smooth">
            <div className="max-w-7xl mx-auto w-full">
              {renderSection()}
            </div>
          </main>

          <footer className="mt-auto py-4 sm:py-5 border-t border-slate-200 dark:border-slate-700 bg-transparent transition-smooth">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-2">
                <p className="typography-body-sm text-slate-500 dark:text-slate-400 text-center sm:text-left order-2 sm:order-1">
                  {getFooterText()}
                </p>
                <p className="typography-body-sm text-slate-500 dark:text-slate-400 text-center sm:text-right order-1 sm:order-2">
                  © {new Date().getFullYear()} Status Report FIEA. Todos os direitos reservados.
                </p>
              </div>
            </div>
          </footer>
      </div>
    </div>
  );
};

export default Index;
