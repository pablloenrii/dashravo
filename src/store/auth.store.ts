/**
 * RAVO OS — Auth Store
 * Estado global para autenticação com Zustand
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { authService, type User, type AuthCredentials, type SignUpData } from '@/services/auth';

interface AuthStore {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github' | 'discord') => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
  subscribe: () => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools((set, get) => ({
    // State
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitializing: true,
    error: null,

    // Actions
    initialize: async () => {
      set({ isInitializing: true });
      try {
        const user = await authService.getCurrentUser();
        const isAuthenticated = await authService.isAuthenticated();

        set({
          user,
          isAuthenticated,
          isInitializing: false,
        });

        // Subscrever a mudanças de autenticação
        get().subscribe();
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erro ao inicializar autenticação',
          isInitializing: false,
        });
      }
    },

    signUp: async (data) => {
      set({ isLoading: true, error: null });
      try {
        await authService.signUp(data);
        // Após signup, pode ser necessário confirmar email
        // Depois fazer login automático
        set({ isLoading: false });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erro ao registrar',
          isLoading: false,
        });
        throw error;
      }
    },

    signIn: async (credentials) => {
      set({ isLoading: true, error: null });
      try {
        await authService.signIn(credentials);
        const user = await authService.getCurrentUser();
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erro ao fazer login',
          isLoading: false,
        });
        throw error;
      }
    },

    signOut: async () => {
      set({ isLoading: true, error: null });
      try {
        await authService.signOut();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erro ao fazer logout',
          isLoading: false,
        });
        throw error;
      }
    },

    resetPassword: async (email) => {
      set({ isLoading: true, error: null });
      try {
        await authService.resetPassword(email);
        set({ isLoading: false });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erro ao resetar senha',
          isLoading: false,
        });
        throw error;
      }
    },

    updatePassword: async (newPassword) => {
      set({ isLoading: true, error: null });
      try {
        await authService.updatePassword(newPassword);
        set({ isLoading: false });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erro ao atualizar senha',
          isLoading: false,
        });
        throw error;
      }
    },

    updateProfile: async (updates) => {
      set({ isLoading: true, error: null });
      try {
        const user = await authService.updateProfile(updates);
        set({
          user,
          isLoading: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erro ao atualizar perfil',
          isLoading: false,
        });
        throw error;
      }
    },

    signInWithOAuth: async (provider) => {
      set({ isLoading: true, error: null });
      try {
        await authService.signInWithOAuth(provider);
        set({ isLoading: false });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : `Erro ao fazer login com ${provider}`,
          isLoading: false,
        });
        throw error;
      }
    },

    setUser: (user) => {
      set({
        user,
        isAuthenticated: !!user,
      });
    },

    clearError: () => {
      set({ error: null });
    },

    subscribe: () => {
      authService.onAuthStateChange((user) => {
        get().setUser(user);
      });
    },
  }))
);
