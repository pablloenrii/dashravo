/**
 * RAVO OS — Goals Store
 * Estado global para Metas com Zustand
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { goalsService, type Goal } from '@/services/goals';

interface GoalsStore {
  // State
  goals: Goal[];
  activeGoals: Goal[];
  isLoading: boolean;
  error: string | null;
  overallProgress: number;

  // Actions
  fetchGoals: () => Promise<void>;
  fetchActiveGoals: () => Promise<void>;
  fetchOverallProgress: () => Promise<void>;
  createGoal: (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  updateGoalProgress: (id: string, currentValue: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addGoal: (goal: Goal) => void;
  removeGoal: (id: string) => void;
  updateGoalInStore: (id: string, updates: Partial<Goal>) => void;
  subscribeToGoals: () => void;
}

export const useGoalsStore = create<GoalsStore>()(
  devtools((set, get) => ({
    // State
    goals: [],
    activeGoals: [],
    isLoading: false,
    error: null,
    overallProgress: 0,

    // Actions
    fetchGoals: async () => {
      set({ isLoading: true, error: null });
      try {
        const goals = await goalsService.getGoals();
        set({ goals, isLoading: false });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erro ao buscar metas',
          isLoading: false,
        });
      }
    },

    fetchActiveGoals: async () => {
      try {
        const activeGoals = await goalsService.getActiveGoals();
        set({ activeGoals });
      } catch (error) {
        console.error('Erro ao buscar metas ativas:', error);
      }
    },

    fetchOverallProgress: async () => {
      try {
        const overallProgress = await goalsService.getOverallProgress();
        set({ overallProgress });
      } catch (error) {
        console.error('Erro ao calcular progresso geral:', error);
      }
    },

    createGoal: async (goal) => {
      set({ isLoading: true, error: null });
      try {
        const newGoal = await goalsService.createGoal(goal);
        if (newGoal) {
          set({
            goals: [...get().goals, newGoal],
            isLoading: false,
          });
          await get().fetchActiveGoals();
          await get().fetchOverallProgress();
        }
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erro ao criar meta',
          isLoading: false,
        });
      }
    },

    updateGoal: async (id, updates) => {
      set({ isLoading: true, error: null });
      try {
        const updated = await goalsService.updateGoal(id, updates);
        if (updated) {
          const goals = get().goals.map((g) => (g.id === id ? updated : g));
          set({
            goals,
            isLoading: false,
          });
          await get().fetchActiveGoals();
          await get().fetchOverallProgress();
        }
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erro ao atualizar meta',
          isLoading: false,
        });
      }
    },

    updateGoalProgress: async (id, currentValue) => {
      try {
        const updated = await goalsService.updateGoalProgress(id, currentValue);
        if (updated) {
          const goals = get().goals.map((g) => (g.id === id ? updated : g));
          set({ goals });
          await get().fetchOverallProgress();
        }
      } catch (error) {
        console.error('Erro ao atualizar progresso:', error);
      }
    },

    deleteGoal: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const success = await goalsService.deleteGoal(id);
        if (success) {
          const goals = get().goals.filter((g) => g.id !== id);
          set({
            goals,
            isLoading: false,
          });
          await get().fetchActiveGoals();
          await get().fetchOverallProgress();
        }
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erro ao deletar meta',
          isLoading: false,
        });
      }
    },

    // Real-time updates
    addGoal: (goal) => {
      set({ goals: [...get().goals, goal] });
    },

    removeGoal: (id) => {
      const goals = get().goals.filter((g) => g.id !== id);
      set({ goals });
    },

    updateGoalInStore: (id, updates) => {
      const goals = get().goals.map((g) =>
        g.id === id ? { ...g, ...updates } : g
      );
      set({ goals });
    },

    subscribeToGoals: () => {
      goalsService.subscribeToGoals({
        onInsert: (goal) => get().addGoal(goal),
        onUpdate: (goal) => get().updateGoalInStore(goal.id, goal),
        onDelete: (goal) => get().removeGoal(goal.id),
      });
    },
  }))
);
