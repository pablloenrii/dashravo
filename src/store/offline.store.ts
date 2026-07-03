/**
 * RAVO OS — Offline Store
 * Gerencia estado offline e sincronização com Zustand
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  module: 'crm' | 'finance' | 'goals' | 'cs';
  data: any;
  timestamp: number;
  synced: boolean;
}

interface OfflineStore {
  // State
  isOnline: boolean;
  isLoading: boolean;
  offlineActions: OfflineAction[];
  lastSyncTime: number | null;

  // Actions
  setIsOnline: (online: boolean) => void;
  addOfflineAction: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'synced'>) => void;
  removeOfflineAction: (id: string) => void;
  markActionSynced: (id: string) => void;
  clearOfflineActions: () => void;
  setLastSyncTime: (time: number) => void;

  // Selectors
  getUnsyncedActions: () => OfflineAction[];
  getPendingCount: () => number;
  getOfflineDataByModule: (module: string) => OfflineAction[];
}

export const useOfflineStore = create<OfflineStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        isLoading: false,
        offlineActions: [],
        lastSyncTime: null,

        // Actions
        setIsOnline: (online) => {
          set({ isOnline: online });
          if (online && get().getUnsyncedActions().length > 0) {
            console.log('📡 Offline actions detected, sync needed');
          }
        },

        addOfflineAction: (action) => {
          const newAction: OfflineAction = {
            ...action,
            id: Math.random().toString(36).substring(2),
            timestamp: Date.now(),
            synced: false,
          };

          set({
            offlineActions: [...get().offlineActions, newAction],
          });

          console.log('📝 Offline action recorded:', newAction);
        },

        removeOfflineAction: (id) => {
          set({
            offlineActions: get().offlineActions.filter((a) => a.id !== id),
          });
        },

        markActionSynced: (id) => {
          set({
            offlineActions: get().offlineActions.map((a) =>
              a.id === id ? { ...a, synced: true } : a
            ),
          });
        },

        clearOfflineActions: () => {
          set({ offlineActions: [] });
        },

        setLastSyncTime: (time) => {
          set({ lastSyncTime: time });
        },

        // Selectors
        getUnsyncedActions: () => {
          return get().offlineActions.filter((a) => !a.synced);
        },

        getPendingCount: () => {
          return get().getUnsyncedActions().length;
        },

        getOfflineDataByModule: (module) => {
          return get().offlineActions.filter((a) => a.module === module);
        },
      }),
      {
        name: 'offline-storage',
        version: 1,
      }
    )
  )
);

/**
 * Initialize offline state on app start
 */
export function initializeOfflineStore() {
  if (typeof window !== 'undefined') {
    const store = useOfflineStore.getState();

    // Listen to online/offline events
    window.addEventListener('online', () => {
      store.setIsOnline(true);
      console.log('🟢 Back online');
    });

    window.addEventListener('offline', () => {
      store.setIsOnline(false);
      console.log('🔴 Gone offline');
    });

    // Check initial state
    store.setIsOnline(navigator.onLine);
  }
}
