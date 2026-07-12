/**
 * RAVO OS — Toast Store
 * Gerencia notificações com Zustand
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number; // em ms, 0 = indefinido
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastStore>()(
  devtools((set, get) => ({
    toasts: [],

    addToast: (toast) => {
      const id = Math.random().toString(36).substring(2);
      const newToast: Toast = {
        ...toast,
        id,
        duration: toast.duration ?? 5000, // 5s padrão
      };

      set({ toasts: [...get().toasts, newToast] });

      // Auto-remove após duration
      if (newToast.duration > 0) {
        setTimeout(() => {
          get().removeToast(id);
        }, newToast.duration);
      }

      return id;
    },

    removeToast: (id) => {
      set({ toasts: get().toasts.filter((t) => t.id !== id) });
    },

    clearToasts: () => {
      set({ toasts: [] });
    },
  }))
);
