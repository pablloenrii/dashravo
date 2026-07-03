/**
 * Hook para usar real-time no React
 */

import { useEffect, useState } from 'react';
import { realtimeManager } from '../services/realtime';

export function useRealtime<T>(
  tableName: string,
  initialData: T[] = []
) {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);

    try {
      const unsubscribe = realtimeManager.subscribe(tableName, {
        onInsert: (newItem) => {
          setData((prev) => [newItem, ...prev]);
          console.log(`✅ Novo item adicionado em ${tableName}`);
        },
        onUpdate: (updatedItem) => {
          setData((prev) =>
            prev.map((item) =>
              (item as any).id === (updatedItem as any).id ? updatedItem : item
            )
          );
          console.log(`✏️ Item atualizado em ${tableName}`);
        },
        onDelete: (deletedItem) => {
          setData((prev) =>
            prev.filter((item) => (item as any).id !== (deletedItem as any).id)
          );
          console.log(`🗑️ Item deletado em ${tableName}`);
        },
      });

      setIsLoading(false);

      return () => {
        unsubscribe();
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setIsLoading(false);
    }
  }, [tableName]);

  return { data, isLoading, error };
}
