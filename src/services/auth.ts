/**
 * RAVO OS — Auth Service
 * Autenticação com Supabase Auth
 */

import { sb } from './supabase';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
  createdAt: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends AuthCredentials {
  name?: string;
}

/**
 * Auth Service - Gerencia autenticação e sessão
 */
class AuthService {
  /**
   * Registrar novo usuário
   */
  async signUp({ email, password, name }: SignUpData) {
    try {
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
          },
        },
      });

      if (error) {
        throw error;
      }

      console.log('✅ Usuário criado com sucesso:', data.user?.email);
      return data;
    } catch (error) {
      console.error('❌ Erro ao registrar:', error);
      throw error;
    }
  }

  /**
   * Login com email e senha
   */
  async signIn({ email, password }: AuthCredentials) {
    try {
      const { data, error } = await sb.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      console.log('✅ Login realizado:', data.user?.email);
      return data;
    } catch (error) {
      console.error('❌ Erro ao fazer login:', error);
      throw error;
    }
  }

  /**
   * Logout
   */
  async signOut() {
    try {
      const { error } = await sb.auth.signOut();

      if (error) {
        throw error;
      }

      console.log('✅ Logout realizado');
      return true;
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      throw error;
    }
  }

  /**
   * Obter usuário atual
   */
  async getCurrentUser() {
    try {
      const { data, error } = await sb.auth.getUser();

      if (error || !data.user) {
        return null;
      }

      return {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name,
        avatar: data.user.user_metadata?.avatar_url,
        role: data.user.user_metadata?.role,
        createdAt: data.user.created_at,
      } as User;
    } catch (error) {
      console.error('❌ Erro ao obter usuário:', error);
      return null;
    }
  }

  /**
   * Obter sessão atual
   */
  async getSession() {
    try {
      const { data, error } = await sb.auth.getSession();

      if (error || !data.session) {
        return null;
      }

      return data.session;
    } catch (error) {
      console.error('❌ Erro ao obter sessão:', error);
      return null;
    }
  }

  /**
   * Resetar senha
   */
  async resetPassword(email: string) {
    try {
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      console.log('✅ Email de reset enviado para:', email);
      return true;
    } catch (error) {
      console.error('❌ Erro ao resetar senha:', error);
      throw error;
    }
  }

  /**
   * Atualizar senha
   */
  async updatePassword(newPassword: string) {
    try {
      const { error } = await sb.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      console.log('✅ Senha atualizada com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar senha:', error);
      throw error;
    }
  }

  /**
   * Atualizar perfil
   */
  async updateProfile(updates: Partial<User>) {
    try {
      const { error } = await sb.auth.updateUser({
        data: {
          name: updates.name,
          avatar_url: updates.avatar,
          role: updates.role,
        },
      });

      if (error) {
        throw error;
      }

      console.log('✅ Perfil atualizado');
      return await this.getCurrentUser();
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      throw error;
    }
  }

  /**
   * Ouvir mudanças de autenticação
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    const { data } = sb.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });

    // Retornar função para unsubscribe
    return () => {
      data?.subscription?.unsubscribe();
    };
  }

  /**
   * Verificar se está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return !!session;
  }

  /**
   * Login com OAuth (Google, GitHub, etc)
   */
  async signInWithOAuth(provider: 'google' | 'github' | 'discord') {
    try {
      const { error } = await sb.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      console.log(`✅ Iniciando login com ${provider}`);
    } catch (error) {
      console.error(`❌ Erro ao fazer login com ${provider}:`, error);
      throw error;
    }
  }
}

// Singleton
export const authService = new AuthService();
