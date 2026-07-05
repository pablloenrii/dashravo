/**
 * RAVO OS — Goals Module Store
 */

import { create } from 'zustand';
import { sb as supabase } from '@/services/supabase';

export interface Goal {
  id: string;
  title: string;
  category: string;
  target: number;
  current: number;
  unit: string;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  updated_at: string;
}

export interface GoalsStore {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;

  fetchGoals: () => Promise<void>;
  createGoal: (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useGoalsStore = create<GoalsStore>((set) => ({
  goals: [],
  isLoading: false,
  error: null,

  fetchGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ goals: data || [], isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar metas';
      set({ error: message, isLoading: false });
    }
  },

  createGoal: async (goal) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([goal])
        .select();

      if (error) throw error;

      set((state) => ({
        goals: [data[0], ...state.goals],
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar meta';
      set({ error: message, isLoading: false });
    }
  },

  updateGoal: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;

      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? data[0] : g)),
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar meta';
      set({ error: message, isLoading: false });
    }
  },

  deleteGoal: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar meta';
      set({ error: message, isLoading: false });
    }
  },

  setError: (error) => set({ error }),
}));
