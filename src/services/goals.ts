/**
 * RAVO OS — Goals Service
 * Gerencia metas, KPIs e acompanhamento com real-time
 */

import { sb } from './supabase';
import { realtimeManager } from './realtime';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: 'vendas' | 'marketing' | 'operacional' | 'financeiro' | 'rh';
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  owner?: string;
  status: 'ativo' | 'pausado' | 'concluído' | 'falhado';
  progress: number; // 0-100
  created_at: string;
  updated_at: string;
}

export interface GoalChange {
  onInsert?: (goal: Goal) => void;
  onUpdate?: (goal: Goal) => void;
  onDelete?: (goal: Goal) => void;
}

/**
 * Goals Service - Gerencia metas e KPIs
 */
class GoalsService {
  private tableName = 'goals';

  /**
   * Buscar todas as metas
   */
  async getGoals() {
    const { data, error } = await sb
      .from(this.tableName)
      .select('*');

    if (error) {
      console.error('❌ Erro ao buscar metas:', error);
      return [];
    }
    return (data as Goal[]) || [];
  }

  /**
   * Buscar metas ativas
   */
  async getActiveGoals() {
    const { data, error } = await sb
      .from(this.tableName)
      .select('*')
      .eq('status', 'ativo');

    if (error) {
      console.error('❌ Erro ao buscar metas ativas:', error);
      return [];
    }
    return (data as Goal[]) || [];
  }

  /**
   * Buscar meta por ID
   */
  async getGoalById(id: string) {
    const { data, error } = await sb
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar meta:', error);
      return null;
    }
    return data as Goal;
  }

  /**
   * Criar meta
   */
  async createGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await sb
      .from(this.tableName)
      .insert([goal])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar meta:', error);
      return null;
    }
    return data as Goal;
  }

  /**
   * Atualizar meta
   */
  async updateGoal(id: string, updates: Partial<Goal>) {
    // Calcular progresso automaticamente se currentValue for atualizado
    if (updates.currentValue !== undefined && updates.targetValue === undefined) {
      const goal = await this.getGoalById(id);
      if (goal) {
        updates.progress = Math.min(
          100,
          Math.round((updates.currentValue / goal.targetValue) * 100)
        );
      }
    }

    const { data, error } = await sb
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar meta:', error);
      return null;
    }
    return data as Goal;
  }

  /**
   * Deletar meta
   */
  async deleteGoal(id: string) {
    const { error } = await sb
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao deletar meta:', error);
      return false;
    }
    return true;
  }

  /**
   * Subscrever a mudanças em metas (real-time)
   */
  subscribeToGoals(callbacks: GoalChange) {
    return realtimeManager.subscribe(this.tableName, {
      onInsert: callbacks.onInsert,
      onUpdate: callbacks.onUpdate,
      onDelete: callbacks.onDelete,
    });
  }

  /**
   * Buscar metas por categoria
   */
  async getGoalsByCategory(category: Goal['category']) {
    const { data, error } = await sb
      .from(this.tableName)
      .select('*')
      .eq('category', category);

    if (error) {
      console.error('❌ Erro ao buscar metas por categoria:', error);
      return [];
    }
    return (data as Goal[]) || [];
  }

  /**
   * Calcular progresso geral
   */
  async getOverallProgress() {
    const goals = await this.getActiveGoals();
    if (goals.length === 0) return 0;

    const totalProgress = goals.reduce((sum, g) => sum + g.progress, 0);
    return Math.round(totalProgress / goals.length);
  }

  /**
   * Atualizar valor atual de meta
   */
  async updateGoalProgress(id: string, currentValue: number) {
    return this.updateGoal(id, { currentValue });
  }
}

// Singleton
export const goalsService = new GoalsService();
