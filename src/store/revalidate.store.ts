/**
 * RAVO OS — Store de invalidação global
 *
 * Incrementa `version` a cada mutação (CRUD). Hooks que vivem fora do ciclo de
 * vida de uma página — como `useNotifications`, no header — escutam essa versão
 * e revalidam seus dados após qualquer escrita, sem precisar conhecer a página
 * que fez a mudança.
 */

import { create } from 'zustand';

interface RevalidateState {
  /** Incrementado a cada mutação; consumidores escutam para refetch */
  version: number;
  invalidate: () => void;
}

export const useRevalidateStore = create<RevalidateState>((set) => ({
  version: 0,
  invalidate: () => set((s) => ({ version: s.version + 1 })),
}));
