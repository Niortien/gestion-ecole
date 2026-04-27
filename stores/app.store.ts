'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AnneeScolaire } from '@/lib/types';

interface AppState {
  activeAnneeScolaire: AnneeScolaire | null;
  sidebarCollapsed: boolean;
  hasUnsavedChanges: boolean;
  setActiveAnneeScolaire: (annee: AnneeScolaire | null) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setHasUnsavedChanges: (value: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeAnneeScolaire: null,
      sidebarCollapsed: false,
      hasUnsavedChanges: false,
      setActiveAnneeScolaire: (annee) => set({ activeAnneeScolaire: annee }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setHasUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        activeAnneeScolaire: state.activeAnneeScolaire,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);
