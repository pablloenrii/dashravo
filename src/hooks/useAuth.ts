/**
 * RAVO OS — useAuth Hook
 * Hook para consumir estado de autenticação em componentes
 */

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import type { AuthCredentials, SignUpData, User } from '@/services/auth';

export interface UseAuthReturn {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;

  // Actions
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github' | 'discord') => Promise<void>;
  clearError: () => void;
}

/**
 * Hook para usar autenticação em componentes
 *
 * @example
 * const { user, isAuthenticated, signIn, signOut } = useAuth();
 *
 * if (!isAuthenticated) {
 *   return <LoginPage />;
 * }
 *
 * return (
 *   <div>
 *     <h1>Bem-vindo, {user?.name}</h1>
 *     <button onClick={signOut}>Sair</button>
 *   </div>
 * );
 */
export function useAuth(): UseAuthReturn {
  const {
    user,
    isAuthenticated,
    isLoading,
    isInitializing,
    error,
    initialize,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    signInWithOAuth,
    clearError,
  } = useAuthStore();

  // Inicializar autenticação ao montar
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitializing,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    signInWithOAuth,
    clearError,
  };
}

/**
 * Hook para verificar se está autenticado
 * Redireciona para login se não estiver
 *
 * @example
 * const { user } = useAuthGuard();
 * return <Dashboard user={user} />;
 */
export function useAuthGuard() {
  const { user, isInitializing } = useAuthStore();

  // TODO: Implementar redirecionamento para login
  // if (!isInitializing && !isAuthenticated) {
  //   window.location.href = '/login';
  // }

  return { user, isInitializing };
}

/**
 * Hook para obter apenas o usuário atual
 *
 * @example
 * const user = useUser();
 * return <div>{user?.name}</div>;
 */
export function useUser(): User | null {
  const { user } = useAuthStore();
  return user;
}
