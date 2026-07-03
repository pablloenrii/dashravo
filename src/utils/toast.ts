/**
 * RAVO OS — Toast Utils
 * Funções helper para notificações
 */

import { useToastStore } from '@/store/toast.store';

/**
 * Disparar notificação de sucesso
 */
export function toastSuccess(message: string, duration?: number) {
  return useToastStore.getState().addToast({
    type: 'success',
    message,
    duration: duration ?? 3000,
  });
}

/**
 * Disparar notificação de erro
 */
export function toastError(message: string, duration?: number) {
  return useToastStore.getState().addToast({
    type: 'error',
    message,
    duration: duration ?? 5000,
  });
}

/**
 * Disparar notificação de aviso
 */
export function toastWarning(message: string, duration?: number) {
  return useToastStore.getState().addToast({
    type: 'warning',
    message,
    duration: duration ?? 4000,
  });
}

/**
 * Disparar notificação de informação
 */
export function toastInfo(message: string, duration?: number) {
  return useToastStore.getState().addToast({
    type: 'info',
    message,
    duration: duration ?? 3000,
  });
}

/**
 * Disparar notificação com ação
 */
export function toastAction(
  message: string,
  action: { label: string; onClick: () => void },
  type: 'success' | 'error' | 'warning' | 'info' = 'info'
) {
  return useToastStore.getState().addToast({
    type,
    message,
    action,
    duration: 0, // Não desaparece automaticamente
  });
}

/**
 * Remover notificação
 */
export function removeToast(id: string) {
  useToastStore.getState().removeToast(id);
}

/**
 * Limpar todas as notificações
 */
export function clearToasts() {
  useToastStore.getState().clearToasts();
}

/**
 * Hook para usar toasts em componentes
 */
export function useToast() {
  const { toasts } = useToastStore();

  return {
    toasts,
    success: toastSuccess,
    error: toastError,
    warning: toastWarning,
    info: toastInfo,
    action: toastAction,
    remove: removeToast,
    clear: clearToasts,
  };
}
