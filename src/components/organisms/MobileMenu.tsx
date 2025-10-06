import {
  BarChart3,
  Users,
  Building2,
  ClipboardList,
  X,
  Settings,
  Eye,
  Lightbulb
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
          className="fixed inset-0 h-screen min-h-screen bg-black/60 z-40"
          onClick={onMobileToggle}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen min-h-screen z-50 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-b from-slate-50/80 to-slate-100/40 dark:from-slate-900/70 dark:to-slate-950/40 backdrop-blur-md shadow-xl ring-1 ring-black/[0.02] dark:ring-white/[0.03] rounded-r-2xl w-80",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center p-4 h-16 justify-between border-b border-slate-200/60 dark:border-slate-800/60 bg-white/30 dark:bg-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg ring-1 ring-white/20">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Menu</span>
              <span className="text-xs text-slate-600 dark:text-slate-400/90">Status Report FIEA</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileToggle}
            className="h-8 w-8 rounded-full border border-white/20 bg-white/20 dark:bg-white/5 hover:bg-white/30 dark:hover:bg-white/10 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
                    "w-full justify-start h-auto py-2.5 px-3 text-left group relative rounded-xl transition-all gap-3",
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md ring-1 ring-white/10"
                      : "hover:bg-white/50 dark:hover:bg-white/10 hover:shadow-sm"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-white/80" />
                  )}
                  <Icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-slate-500/80 dark:text-slate-400/90 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "font-medium text-sm truncate",
                      isActive ? "text-white" : "text-slate-800 dark:text-slate-100"
                    )}>{item.label}</div>
                    <div className={cn(
                      "text-xs truncate",
                      isActive ? "text-white/80" : "text-slate-600/90 dark:text-slate-400/80"
                    )}>{item.description}</div>
                  </div>
                </Button>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="text-xs text-center text-slate-600 dark:text-slate-400/90">
            <div>© {new Date().getFullYear()} Status Report FIEA</div>
            <div className="hover:text-blue-500">
              Desenvolvido por desenvolvedor independente
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default MobileMenu;