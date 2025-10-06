import {
  BarChart3,
  Users,
  Building2,
  Bot,
  ClipboardList,
  Menu,
  X,
  Settings,
  Eye,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect } from 'react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

const Sidebar = ({
  activeSection,
  onSectionChange,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileToggle
}: SidebarProps) => {
  const [isFullScreen, setIsFullScreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);
  const menuItems = [
    {
      id: 'vision',
      label: 'Visão Geral',
      icon: Eye,
      description: 'Dashboard e métricas'
    },
    {
      id: 'plan',
      label: 'Plano de Ação',
      icon: ClipboardList,
      description: 'Gerencie e acompanhe'
    },
    {
      id: 'responsible',
      label: 'Responsáveis',
      icon: Users,
      description: 'Análise por responsáveis'
    },
    {
      id: 'sector',
      label: 'Setores',
      icon: Building2,
      description: 'Distribuição por setores'
    },
    {
      id: 'insights',
      label: 'Assistente ONA Insights',
      icon: Lightbulb,
      description: 'Assistentes Gemini e Copilot'
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      description: 'Ajustes e preferências'
    }
  ];

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 h-screen min-h-screen bg-black/60 z-40 lg:hidden"
          onClick={onMobileToggle}
        />
      )}

      <aside
        className={cn(
          // Modern glass/gradient container
          "fixed left-0 top-0 h-screen min-h-screen z-50 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-b from-slate-50/60 to-slate-100/30 dark:from-slate-900/50 dark:to-slate-950/30 backdrop-blur-md shadow-xl ring-1 ring-black/[0.02] dark:ring-white/[0.03] lg:rounded-r-2xl",
          isCollapsed ? "w-20" : (isFullScreen ? "w-56" : "w-64"),
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div
          className={cn(
            // Header with subtle blur and divider
            "flex items-center p-4 h-16 justify-between border-b border-slate-200/50 dark:border-slate-800/50 bg-white/20 dark:bg-white/3 backdrop-blur-sm",
            isCollapsed ? "lg:justify-center" : "lg:justify-between"
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg ring-1 ring-white/20 p-1">
                <img 
                  src="/images/logo-fiea.png" 
                  alt="FIEA" 
                  className="fiea-logo logo-sidebar rounded-lg w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="typography-heading-3 text-slate-800 dark:text-slate-100">Status Report</span>
                <span className="typography-caption text-slate-600 dark:text-slate-400/90">SESI SENAI FIEA</span>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileToggle}
            className="lg:hidden h-8 w-8 rounded-full border border-white/15 bg-white/15 dark:bg-white/3 hover:bg-white/25 dark:hover:bg-white/8 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <nav className="flex-1 p-2 sm:p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const showIcon = isCollapsed || !isFullScreen || isActive;
            const content = (
              <Button
                variant="ghost"
                onClick={() => {
                  onSectionChange(item.id);
                  if (isMobileOpen) onMobileToggle();
                }}
                className={cn(
                  "w-full justify-start h-auto py-2 sm:py-2.5 px-2 sm:px-3 text-left group relative rounded-xl transition-smooth",
                  showIcon ? "gap-2 sm:gap-3" : "gap-0",
                  isCollapsed && "justify-center px-0",
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md ring-1 ring-white/10 hover-lift"
                    : "hover:bg-white/35 dark:hover:bg-white/8 hover:shadow-sm hover-lift"
                )}
              >
                {isActive && !isCollapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-white/80" />
                )}
                {showIcon && (
                  <Icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-slate-500/80 dark:text-slate-400/90 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                    )}
                  />
                )}
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "typography-body-md font-medium truncate",
                      isActive ? "text-white" : "text-slate-800 dark:text-slate-100"
                    )}>{item.label}</div>
                    <div className={cn(
                      "typography-body-sm truncate",
                      isActive ? "text-white/80" : "text-slate-600/90 dark:text-slate-400/80"
                    )}>{item.description}</div>
                  </div>
                )}
              </Button>
            );

            if (isCollapsed) {
              return (
                <TooltipProvider key={item.id} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {content}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }
            return <div key={item.id}>{content}</div>;
          })}
        </nav>

        {!isCollapsed && (
          <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="typography-body-sm text-center text-slate-600 dark:text-slate-400/90">
              <div>© {new Date().getFullYear()} Status Report FIEA</div>
              <div className="hover:text-blue-500">
                Desenvolvido por desenvolvedor independente
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;