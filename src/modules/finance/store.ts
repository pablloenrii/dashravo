/**
 * RAVO OS — Finance Module Store
 */

import { create } from 'zustand';
import { sb as supabase } from '@/services/supabase';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface FinanceStore {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  totalIncome: number;
  totalExpense: number;

  fetchTransactions: () => Promise<void>;
  createTransaction: (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useFinanceStore = create<FinanceStore>((set) => ({
  transactions: [],
  isLoading: false,
  error: null,
  totalIncome: 0,
  totalExpense: 0,

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const income = data?.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : 0), 0) || 0;
      const expense = data?.reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : 0), 0) || 0;

      set({
        transactions: data || [],
        totalIncome: income,
        totalExpense: expense,
        isLoading: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar transações';
      set({ error: message, isLoading: false });
    }
  },

  createTransaction: async (transaction) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select();

      if (error) throw error;

      set((state) => ({
        transactions: [data[0], ...state.transactions],
        totalIncome: state.totalIncome + (data[0].type === 'income' ? data[0].amount : 0),
        totalExpense: state.totalExpense + (data[0].type === 'expense' ? data[0].amount : 0),
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar transação';
      set({ error: message, isLoading: false });
    }
  },

  updateTransaction: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;

      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === id ? data[0] : t)),
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar transação';
      set({ error: message, isLoading: false });
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar transação';
      set({ error: message, isLoading: false });
    }
  },

  setError: (error) => set({ error }),
}));
