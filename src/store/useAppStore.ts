import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ActionItem } from '@/data/actionData';

interface AppState {
  // Data
  actions: ActionItem[];
  filteredActions: ActionItem[];
  
  // UI State
  isLoading: boolean;
  currentView: 'dashboard' | 'list' | 'kanban';
  sidebarCollapsed: boolean;
  
  // Filters
  searchTerm: string;
  statusFilter: string;
  sectorFilter: string;
  responsibleFilter: string;
  dateRange: { start: Date | null; end: Date | null };
  
  // User Preferences
  theme: 'light' | 'dark' | 'system';
  itemsPerPage: number;
  defaultSort: { field: string; direction: 'asc' | 'desc' };
  
  // Actions
  setActions: (actions: ActionItem[]) => void;
  setLoading: (loading: boolean) => void;
  setCurrentView: (view: AppState['currentView']) => void;
  toggleSidebar: () => void;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: string) => void;
  setSectorFilter: (sector: string) => void;
  setResponsibleFilter: (responsible: string) => void;
  setDateRange: (range: AppState['dateRange']) => void;
  clearFilters: () => void;
  setTheme: (theme: AppState['theme']) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      actions: [],
      filteredActions: [],
      isLoading: false,
      currentView: 'dashboard',
      sidebarCollapsed: false,
      searchTerm: '',
      statusFilter: 'all',
      sectorFilter: 'all',
      responsibleFilter: 'all',
      dateRange: { start: null, end: null },
      theme: 'system',
      itemsPerPage: 12,
      defaultSort: { field: 'dueDate', direction: 'asc' },
      
      // Actions
      setActions: (actions) => set({ actions }),
      setLoading: (isLoading) => set({ isLoading }),
      setCurrentView: (currentView) => set({ currentView }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      setStatusFilter: (statusFilter) => set({ statusFilter }),
      setSectorFilter: (sectorFilter) => set({ sectorFilter }),
      setResponsibleFilter: (responsibleFilter) => set({ responsibleFilter }),
      setDateRange: (dateRange) => set({ dateRange }),
      clearFilters: () => set({
        searchTerm: '',
        statusFilter: 'all',
        sectorFilter: 'all',
        responsibleFilter: 'all',
        dateRange: { start: null, end: null }
      }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'fiea-status-report-store',
      partialize: (state) => ({
        theme: state.theme,
        itemsPerPage: state.itemsPerPage,
        defaultSort: state.defaultSort,
        currentView: state.currentView,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);