/**
 * Hook para usar real-time no React
 */

import { useEffect, useState } from 'react';
import { realtimeManager } from '../services/realtime';

interface RealtimeItem {
  id: string | number;
  [key: string]: unknown;
}

export function useRealtime<T extends RealtimeItem>(
  tableName: string,
  initialData: T[] = []
) {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    try {
      unsubscribe = realtimeManager.subscribe(tableName, {
        onInsert: (newItem: T) => {
          if (isMounted) {
            setData((prev) => [newItem, ...prev]);
            console.log(`✅ Novo item adicionado em ${tableName}`);
          }
        },
        onUpdate: (updatedItem: T) => {
          if (isMounted) {
            setData((prev) =>
              prev.map((item) =>
                item.id === updatedItem.id ? updatedItem : item
              )
            );
            console.log(`✏️ Item atualizado em ${tableName}`);
          }
        },
        onDelete: (deletedItem: T) => {
          if (isMounted) {
            setData((prev) =>
              prev.filter((item) => item.id !== deletedItem.id)
            );
            console.log(`🗑️ Item deletado em ${tableName}`);
          }
        },
      });

      if (isMounted) {
        setIsLoading(false);
      }
    } catch (err) {
      if (isMounted) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setIsLoading(false);
      }
    }

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [tableName]);

  return { data, isLoading, error };
}
