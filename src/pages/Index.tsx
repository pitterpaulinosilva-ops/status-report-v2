import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Menu, ListChecks } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ActionCard from '@/components/organisms/ActionCard';
import ResponsibleChart from '@/components/organisms/ResponsibleChart';
import SectorChart from '@/components/organisms/SectorChart';
import ThemeToggle from '@/components/organisms/ThemeToggle';
import ExportButton from '@/components/organisms/ExportButton';
import NotificationPanel from '@/components/organisms/NotificationPanel';
import AdvancedDashboard from '@/components/organisms/AdvancedDashboard';
import SortingControls from '@/components/organisms/SortingControls';
import { SortField, SortDirection, sortActionsWithTasks } from '@/lib/sortUtils';
import { applyFilters, calculateStatusCounts, FilteredActionWithTasks } from '@/lib/filterUtils';
import { useActionData } from '@/hooks/useActionData';
import { useStatePersistence } from '@/hooks/useStatePersistence';
import { Button } from '@/components/ui/button';
import MobileMenu from '@/components/organisms/MobileMenu';
import useSidebar from '@/hooks/useSidebar';
import { planInfo } from '@/data/actionData';
import { searchInputSchema } from '@/lib/validation';
import { cn } from '@/lib/utils';
import AIAssistantModal from '@/components/organisms/AIAssistantModal';
import AssistantONAInsights from '@/components/organisms/AssistantONAInsights';
import { seedExampleTasks, clearExampleTasks } from '@/utils/seedTasks';
import { ActionModal } from '@/components/organisms/ActionModal';
import { ActionItem } from '@/data/actionData';
import { Plus } from 'lucide-react';

const Index = () => {
  const { actions: processedActionData, refresh: refreshActions } = useActionData();
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
  const [selectedAssistant] = useState<'gemini' | 'copilot'>('gemini');
  
  // Action modal states
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionItem | undefined>();

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
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filteredData, setFilteredData] = useState<FilteredActionWithTasks[]>([]);

  // Handler seguro para o campo de busca
  const handleSearchChange = (value: string) => {
    try {
      const validatedValue = searchInputSchema.parse(value);
      setSearchTerm(validatedValue);
    } catch {
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

  // Restaurar estado quando o componente for montado (apenas uma vez)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Apply filters and sorting with task support
  useEffect(() => {
    // Apply all filters (search, status, responsible)
    const filtered = applyFilters(processedActionData, searchTerm, currentFilter);
    
    // Sort considering tasks
    const sorted = sortActionsWithTasks(filtered, sortField, sortDirection);
    
    setFilteredData(sorted);
  }, [searchTerm, currentFilter, processedActionData, sortField, sortDirection]);

  const handleSortChange = useCallback((field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  // Calculate status counts including tasks
  const statusCounts = useMemo(() => {
    return calculateStatusCounts(processedActionData);
  }, [processedActionData]);

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
      case 'vision': {
        return <AdvancedDashboard data={processedActionData} />;
      }
      case 'plan': {
        return (
          <div className="space-y-6">
            {/* Header Card with SESI/SENAI Gradient */}
            <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#164194]/5 to-[#52AE32]/5 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-3xl shadow-xl border-2 border-slate-200/60 dark:border-slate-700/60 p-6 sm:p-8 transition-all duration-500">
              {/* Decorative elements - SESI/SENAI colors */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#164194]/10 to-[#52AE32]/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#52AE32]/10 to-[#E84910]/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                {/* Title Section - SESI/SENAI colors */}
                <div className="mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold gradient-sesi-text mb-2">
                    Plano de Ação
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Gerencie e acompanhe todas as ações do projeto
                  </p>
                </div>

                {/* Search and Actions Bar */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        placeholder="Buscar ações, responsáveis, setores..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-12 h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm focus:border-sesi-blue dark:focus:border-sesi-blue transition-all shadow-sm"
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 justify-end flex-wrap">
                      <Button
                        onClick={() => {
                          setSelectedAction(undefined);
                          setIsActionModalOpen(true);
                        }}
                        className="h-12 px-6 bg-sesi-green hover:bg-[#52AE32]/90 dark:bg-sesi-green dark:hover:bg-[#52AE32]/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        <span className="hidden sm:inline">Nova Ação</span>
                        <span className="sm:hidden">Nova</span>
                      </Button>
                      <SortingControls 
                        onSortChange={handleSortChange}
                        sortField={sortField}
                        sortDirection={sortDirection}
                      />
                      <ExportButton data={filteredData} searchTerm={searchTerm} currentFilter={currentFilter} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters Card */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-5 transition-smooth">
              <div className="flex flex-wrap items-center gap-3">
                {filterButtons.map(btn => (
                  <Button
                    key={btn.value}
                    variant={currentFilter === btn.value ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => setCurrentFilter(btn.value)}
                    className={cn(
                      "flex items-center gap-3 relative px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg",
                      currentFilter === btn.value 
                        ? "gradient-sesi text-white shadow-lg border-0" 
                        : "bg-white/60 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 hover:border-sesi-blue dark:hover:border-sesi-blue"
                    )}
                  >
                    <span className="text-sm">{btn.label}</span>
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm",
                      currentFilter === btn.value 
                        ? "bg-white/20 text-white backdrop-blur-sm" 
                        : "bg-gradient-to-r from-[#164194]/10 to-[#52AE32]/10 dark:from-[#164194]/30 dark:to-[#52AE32]/30 text-[#164194] dark:text-[#4a7bc8]"
                    )}>
                      {btn.count}
                    </span>
                    {currentFilter === btn.value && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg" />
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Actions Grid */}
            <div className="relative">
              {/* Background decoration - SESI/SENAI colors */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#164194]/5 via-transparent to-[#52AE32]/5 dark:from-[#164194]/10 dark:via-transparent dark:to-[#52AE32]/10 rounded-3xl -z-10"></div>
              {filteredData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-6 animate-fade-in">
                  {filteredData.map(item => (
                    <ActionCard 
                      key={item.id} 
                      action={item}
                      shouldExpandTasks={item.shouldExpandTasks}
                      onEdit={(action) => {
                        setSelectedAction(action);
                        setIsActionModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 animate-fade-in">
                  <div className="text-center max-w-lg">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#164194]/20 to-[#52AE32]/20 rounded-full blur-xl"></div>
                      <div className="relative w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center shadow-lg">
                        <Search className="w-10 h-10 sm:w-12 sm:h-12 text-[#164194] dark:text-[#4a7bc8]" />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold gradient-sesi-text mb-3">
                      Nenhuma ação encontrada
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6">
                      {currentFilter === 'all' 
                        ? 'Nenhuma ação corresponde aos critérios de busca atuais.'
                        : `Nenhuma ação encontrada para o filtro "${filterButtons.find(btn => btn.value === currentFilter)?.label}".`
                      }
                    </p>
                    <Button
                      onClick={() => {
                        setSearchTerm('');
                        setCurrentFilter('all');
                      }}
                      variant="outline"
                      className="rounded-xl border-2 hover:border-sesi-blue dark:hover:border-sesi-blue hover:text-sesi-blue dark:hover:text-sesi-blue"
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              )}
            </div>
            </div>
        );
      }
      case 'responsible': {
        return (
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#164194]/5 to-[#52AE32]/5 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-3xl shadow-xl border-2 border-slate-200/60 dark:border-slate-700/60 transition-all duration-500">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#164194]/10 to-[#52AE32]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#52AE32]/10 to-[#E84910]/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="bg-gradient-to-r from-[#164194]/5 to-[#52AE32]/5 dark:from-[#164194]/10 dark:to-[#52AE32]/10 px-6 sm:px-8 py-6 border-b-2 border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl sm:text-3xl font-bold gradient-sesi-text mb-2">Análise por Responsável</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Visualize a distribuição de ações por responsável
                </p>
              </div>
              <div className="p-6 sm:p-8">
                <ResponsibleChart />
              </div>
            </div>
          </div>
        );
      }
      case 'sector': {
        return (
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#164194]/5 to-[#52AE32]/5 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-3xl shadow-xl border-2 border-slate-200/60 dark:border-slate-700/60 transition-all duration-500">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#164194]/10 to-[#52AE32]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#52AE32]/10 to-[#E84910]/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="bg-gradient-to-r from-[#164194]/5 to-[#52AE32]/5 dark:from-[#164194]/10 dark:to-[#52AE32]/10 px-6 sm:px-8 py-6 border-b-2 border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl sm:text-3xl font-bold gradient-sesi-text mb-2">Análise por Setor</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Visualize a distribuição de ações por setor
                </p>
              </div>
              <div className="p-6 sm:p-8">
                <SectorChart />
              </div>
            </div>
          </div>
        );
      }
      case 'insights': {
        return <AssistantONAInsights />;
      }
      case 'settings': {
        return (
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#164194]/5 to-[#52AE32]/5 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-3xl shadow-xl border-2 border-slate-200/60 dark:border-slate-700/60 p-6 sm:p-8 transition-all duration-500">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#164194]/10 to-[#52AE32]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#52AE32]/10 to-[#E84910]/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold gradient-sesi-text mb-4">Configurações</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Esta seção está em desenvolvimento.</p>
            </div>
          </div>
        );
      }
      default: {
        return null;
      }
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
            {/* Barra decorativa superior */}
            <div className="h-1 bg-gradient-to-r from-[#164194] via-[#52AE32] to-[#E84910]"></div>
            
            <div className="bg-white/98 dark:bg-slate-900/98 backdrop-blur-lg border-b border-slate-200/60 dark:border-slate-700/60 shadow-lg transition-smooth">
              <div className="px-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-18">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMobile}
                      className="p-2 h-auto hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300"
                    >
                      <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    </Button>
                    
                    <div className="hidden sm:flex items-center gap-4 text-sm min-w-0">
                      <img 
                        src="/images/sesi-senai-logo.png" 
                        alt="SESI SENAI" 
                        className="h-9 w-auto object-contain hover:scale-105 transition-all duration-300 drop-shadow-sm"
                      />
                      <div className="w-px h-10 bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent"></div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[#164194] dark:text-[#4a7bc8] font-bold text-base tracking-wide truncate">
                          Manutenção da Certificação ONA 2026
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#52AE32] animate-pulse"></span>
                          {sectionNames[activeSection] || 'Visão Geral'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Mobile section title */}
                    <div className="sm:hidden flex flex-col min-w-0 flex-1">
                      <span className="text-[#164194] dark:text-[#4a7bc8] font-bold text-sm truncate">
                        ONA 2026
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {sectionNames[activeSection] || 'Visão Geral'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-3">
                    <a
                      href={planInfo.epaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#164194] to-[#0EA5E9] rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-md"
                    >
                      <ListChecks className="w-4 h-4" />
                      <span className="hidden lg:inline">Plano de Ação do EPA</span>
                      <span className="lg:hidden">EPA</span>
                    </a>
                    
                    {/* Mobile EPA button */}
                    <a
                      href={planInfo.epaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="md:hidden inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#164194] to-[#0EA5E9] rounded-lg hover:shadow-md transition-all duration-300"
                    >
                      <ListChecks className="w-3.5 h-3.5" />
                      EPA
                    </a>
                    
                    {/* Botões de Teste */}
                    <div className="hidden lg:flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          seedExampleTasks();
                          window.location.reload();
                        }}
                        className="text-xs"
                      >
                        ➕ Criar Tarefas Exemplo
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          clearExampleTasks();
                          window.location.reload();
                        }}
                        className="text-xs"
                      >
                        🗑️ Limpar Tarefas
                      </Button>
                    </div>
                    
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
      
      {/* Action Modal */}
      <ActionModal
        isOpen={isActionModalOpen}
        onClose={() => {
          setIsActionModalOpen(false);
          setSelectedAction(undefined);
        }}
        onSuccess={() => {
          refreshActions();
        }}
        action={selectedAction}
      />
    </div>
  );
};

export default Index;
