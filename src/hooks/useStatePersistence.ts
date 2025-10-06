import { useEffect, useRef, useCallback } from 'react';
import { setSecureItem, getSecureItem, removeSecureItem, cleanExpiredData } from '@/lib/encryption';

// Tipagem dos filtros ativos persistidos
export interface ActiveFiltersState {
  currentFilter: string;
  searchTerm: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

interface PersistedState {
  scrollPosition: number;
  activeFilters?: ActiveFiltersState;
  selectedView?: string;
  lastUpdated: number;
}

const STORAGE_KEY = 'app-state-persistence';
const DEBOUNCE_DELAY = 300;

export const useStatePersistence = () => {
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isRestoringRef = useRef(false);

  // Salvar estado no localStorage com debounce e criptografia
  const saveState = useCallback((state: Partial<PersistedState>) => {
    if (isRestoringRef.current) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      try {
        const currentState = getPersistedState();
        const newState: PersistedState = {
          ...currentState,
          ...state,
          lastUpdated: Date.now()
        };
        // Usar criptografia para dados sensíveis
        setSecureItem(STORAGE_KEY, newState);
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Erro ao salvar estado:', error);
        }
        // Adicionar toast ou UI de erro aqui, ex.: toast.error('Erro ao salvar estado');
      }
    }, DEBOUNCE_DELAY);
  }, []);

  // Recuperar estado do localStorage com descriptografia
  const getPersistedState = useCallback((): PersistedState => {
    try {
      // Tentar recuperar dados criptografados primeiro
      const decryptedData = getSecureItem<PersistedState>(STORAGE_KEY);
      if (decryptedData && typeof decryptedData === 'object' && decryptedData.lastUpdated) {
        // Verificar se o estado não é muito antigo (24 horas)
        const isRecent = Date.now() - decryptedData.lastUpdated < 24 * 60 * 60 * 1000;
        if (isRecent) {
          return decryptedData;
        }
      }
      
      // Fallback para dados não criptografados (migração)
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && typeof stored === 'string' && stored.length > 0) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object' && parsed.lastUpdated && typeof parsed.lastUpdated === 'number') {
            const isRecent = Date.now() - parsed.lastUpdated < 24 * 60 * 60 * 1000;
            if (isRecent) {
              // Migrar para formato criptografado
              setSecureItem(STORAGE_KEY, parsed);
              localStorage.removeItem(STORAGE_KEY);
              return parsed as PersistedState;
            }
          }
        } catch {
          // Dados corrompidos, limpar
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.warn('Erro ao recuperar estado:', error);
    }
    return {
      scrollPosition: 0,
      lastUpdated: Date.now()
    } as PersistedState;
  }, []);

  // Salvar posição de scroll
  const saveScrollPosition = useCallback((position: number) => {
    saveState({ scrollPosition: position });
  }, [saveState]);

  // Salvar filtros ativos
  const saveActiveFilters = useCallback((filters: ActiveFiltersState) => {
    saveState({ activeFilters: filters });
  }, [saveState]);

  // Salvar visualização selecionada
  const saveSelectedView = useCallback((view: string) => {
    saveState({ selectedView: view });
  }, [saveState]);

  // Restaurar posição de scroll
  const restoreScrollPosition = useCallback(() => {
    const state = getPersistedState();
    if (state.scrollPosition > 0) {
      isRestoringRef.current = true;
      // Aguardar um pouco para garantir que o conteúdo foi renderizado
      setTimeout(() => {
        window.scrollTo({
          top: state.scrollPosition,
          behavior: 'auto'
        });
        isRestoringRef.current = false;
      }, 100);
    }
    return state;
  }, [getPersistedState]);

  // Limpar estado persistido de forma segura
  const clearPersistedState = useCallback(() => {
    try {
      removeSecureItem(STORAGE_KEY);
      // Também remover versão não criptografada se existir
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Erro ao limpar estado:', error);
    }
  }, []);

  // Cleanup no unmount e limpeza de dados expirados
  useEffect(() => {
    // Limpar dados expirados na inicialização
    cleanExpiredData();
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    saveScrollPosition,
    saveActiveFilters,
    saveSelectedView,
    restoreScrollPosition,
    getPersistedState,
    clearPersistedState
  };
};

export default useStatePersistence;