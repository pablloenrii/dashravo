/**
 * RAVO OS — useOffline Hook
 * Hook para detectar e gerenciar estado offline
 */

import { useEffect } from 'react';
import { useOfflineStore, type OfflineAction } from '@/store/offline.store';

export interface UseOfflineReturn {
  isOnline: boolean;
  isPending: boolean;
  pendingCount: number;
  offlineActions: OfflineAction[];
  addAction: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'synced'>) => void;
  removeAction: (id: string) => void;
  clearActions: () => void;
  getUnsyncedActions: () => OfflineAction[];
  getActionsByModule: (module: string) => OfflineAction[];
}

/**
 * Hook para usar status offline em componentes
 *
 * @example
 * const { isOnline, pendingCount, offlineActions } = useOffline();
 *
 * return (
 *   <div>
 *     <p>Status: {isOnline ? '🟢 Online' : '🔴 Offline'}</p>
 *     {pendingCount > 0 && <p>Pendentes: {pendingCount}</p>}
 *   </div>
 * );
 */
export function useOffline(): UseOfflineReturn {
  const {
    isOnline,
    offlineActions,
    addOfflineAction,
    removeOfflineAction,
    clearOfflineActions,
    getUnsyncedActions,
    getPendingCount,
    getOfflineDataByModule,
  } = useOfflineStore();

  const pendingCount = getPendingCount();
  const isPending = pendingCount > 0;

  // Detectar mudanças de conectividade
  useEffect(() => {
    const handleOnline = () => {
      useOfflineStore.setState({ isOnline: true });
      console.log('🟢 Back online');
    };

    const handleOffline = () => {
      useOfflineStore.setState({ isOnline: false });
      console.log('🔴 Gone offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isPending,
    pendingCount,
    offlineActions,
    addAction: addOfflineAction,
    removeAction: removeOfflineAction,
    clearActions: clearOfflineActions,
    getUnsyncedActions,
    getActionsByModule: getOfflineDataByModule,
  };
}

/**
 * Hook para mostrar indicator de offline
 *
 * @example
 * const offlineStatus = useOfflineIndicator();
 * return offlineStatus ? <OfflineBar /> : null;
 */
export function useOfflineIndicator(): boolean {
  const { isOnline } = useOfflineStore();
  return !isOnline;
}

/**
 * Hook para verificar se há ações pendentes
 *
 * @example
 * const hasPending = usePendingActions();
 * if (hasPending) {
 *   // Mostrar banner de sync
 * }
 */
export function usePendingActions(): boolean {
  const { getPendingCount } = useOfflineStore();
  return getPendingCount() > 0;
}

/**
 * Hook para obter ações específicas de um módulo
 *
 * @example
 * const leadActions = useModuleOfflineActions('crm');
 */
export function useModuleOfflineActions(module: string): OfflineAction[] {
  const { getOfflineDataByModule } = useOfflineStore();
  return getOfflineDataByModule(module);
}
