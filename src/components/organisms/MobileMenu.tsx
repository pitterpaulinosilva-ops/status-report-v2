import {
  Users2,
  Building2,
  ListChecks,
  X,
  Settings2,
  LayoutDashboard,
  Sparkles,
  ClipboardCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

const MobileMenu = ({
  activeSection,
  onSectionChange,
  isMobileOpen,
  onMobileToggle
}: MobileMenuProps) => {
  const menuItems = [
    {
      id: 'vision',
      label: 'Visão Geral',
      icon: LayoutDashboard,
      description: 'Dashboard e métricas'
    },
    {
      id: 'plan',
      label: 'Plano de Ação',
      icon: ListChecks,
      description: 'Gerencie e acompanhe'
    },
    {
      id: 'responsible',
      label: 'Responsáveis',
      icon: Users2,
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
      icon: Sparkles,
      description: 'Assistentes Gemini e Copilot'
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings2,
      description: 'Ajustes e preferências'
    }
  ];

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 h-screen min-h-screen bg-black/60 z-40"
          onClick={onMobileToggle}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen min-h-screen z-50 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-200/80 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl w-80",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Decorative gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#164194] via-[#52AE32] to-[#E84910]"></div>
        
        <div className="flex items-center p-5 h-20 justify-between border-b border-slate-200/80 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            {/* Ícone animado do projeto */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#164194] to-[#52AE32] rounded-xl animate-pulse opacity-20"></div>
              <div className="relative w-11 h-11 bg-gradient-to-br from-[#164194] to-[#52AE32] rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                <ClipboardCheck className="w-6 h-6 text-white animate-bounce" style={{ animationDuration: '2s' }} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[#164194] dark:text-[#4a7bc8] text-base">Status Report</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">FIEA</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileToggle}
            className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <div key={item.id}>
                <Button
                  variant="ghost"
                  onClick={() => {
                    onSectionChange(item.id);
                    onMobileToggle();
                  }}
                  className={cn(
                    "w-full justify-start h-auto py-3.5 px-4 text-left group relative rounded-xl transition-all duration-300 gap-3",
                    isActive
                      ? "bg-gradient-to-r from-[#164194] to-[#52AE32] text-white shadow-md hover:shadow-lg"
                      : "bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm hover:shadow-md"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-white shadow-md" />
                  )}
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300",
                    isActive
                      ? "bg-white/20"
                      : "bg-slate-100 dark:bg-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-600"
                  )}>
                    <Icon
                      className={cn(
                        "w-5 h-5 flex-shrink-0 transition-colors",
                        isActive
                          ? "text-white"
                          : "text-[#164194] dark:text-[#4a7bc8]"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "font-semibold text-sm truncate",
                      isActive ? "text-white" : "text-slate-800 dark:text-slate-100"
                    )}>{item.label}</div>
                    <div className={cn(
                      "text-xs truncate mt-0.5",
                      isActive ? "text-white/80" : "text-slate-500 dark:text-slate-400"
                    )}>{item.description}</div>
                  </div>
                </Button>
              </div>
            );
          })}
        </nav>

        <div className="p-5 border-t border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80">
          <div className="flex flex-col items-center gap-3">
            <img 
              src="/images/sesi-senai-logo.png" 
              alt="SESI SENAI" 
              className="h-7 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
            />
            <div className="text-xs text-center text-slate-500 dark:text-slate-400">
              <div className="font-medium">© {new Date().getFullYear()} Status Report FIEA</div>
              <div className="text-[10px] mt-1 text-slate-400 dark:text-slate-500">
                Desenvolvido por desenvolvedor independente
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default MobileMenu;