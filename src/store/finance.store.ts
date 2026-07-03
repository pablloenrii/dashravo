/**
 * RAVO OS — Finance Store
 * Estado global para Financeiro com Zustand
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { financeService, type Transaction } from '@/services/finance';

interface MonthlyReport {
  month: number;
  year: number;
  receita: number;
  despesa: number;
  lucro: number;
}

interface FinanceStore {
  // State
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  balance: number;
  monthlyReport: MonthlyReport | null;

  // Actions
  fetchTransactions: () => Promise<void>;
  fetchBalance: () => Promise<void>;
  fetchMonthlyReport: (month: number, year: number) => Promise<void>;
  createTransaction: (
    transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: string) => void;
  updateTransactionInStore: (id: string, updates: Partial<Transaction>) => void;
  subscribeToTransactions: () => void;
}

export const useFinanceStore = create<FinanceStore>()(
  devtools((set, get) => ({
    // State
    transactions: [],
    isLoading: false,
    error: null,
    balance: 0,
    monthlyReport: null,

    // Actions
    fetchTransactions: async () => {
      set({ isLoading: true, error: null });
      try {
        const transactions = await financeService.getTransactions();
        set({ transactions, isLoading: false });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erro ao buscar transações',
          isLoading: false,
        });
      }
    },

    fetchBalance: async () => {
      try {
        const balance = await financeService.getBalance();
        set({ balance });
      } catch (error) {
        console.error('Erro ao calcular saldo:', error);
      }
    },

    fetchMonthlyReport: async (month, year) => {
      set({ isLoading: true, error: null });
      try {
        const monthlyReport = await financeService.getMonthlyReport(month, year);
        set({ monthlyReport, isLoading: false });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erro ao gerar relatório',
          isLoading: false,
        });
      }
    },

    createTransaction: async (transaction) => {
      set({ isLoading: true, error: null });
      try {
        const newTransaction = await financeService.createTransaction(transaction);
        if (newTransaction) {
          set({
            transactions: [...get().transactions, newTransaction],
            isLoading: false,
          });
          await get().fetchBalance();
        }
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erro ao criar transação',
          isLoading: false,
        });
      }
    },

    updateTransaction: async (id, updates) => {
      set({ isLoading: true, error: null });
      try {
        const updated = await financeService.updateTransaction(id, updates);
        if (updated) {
          const transactions = get().transactions.map((t) =>
            t.id === id ? updated : t
          );
          set({
            transactions,
            isLoading: false,
          });
          await get().fetchBalance();
        }
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erro ao atualizar transação',
          isLoading: false,
        });
      }
    },

    deleteTransaction: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const success = await financeService.deleteTransaction(id);
        if (success) {
          const transactions = get().transactions.filter((t) => t.id !== id);
          set({
            transactions,
            isLoading: false,
          });
          await get().fetchBalance();
        }
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erro ao deletar transação',
          isLoading: false,
        });
      }
    },

    // Real-time updates
    addTransaction: (transaction) => {
      set({ transactions: [...get().transactions, transaction] });
    },

    removeTransaction: (id) => {
      const transactions = get().transactions.filter((t) => t.id !== id);
      set({ transactions });
    },

    updateTransactionInStore: (id, updates) => {
      const transactions = get().transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      );
      set({ transactions });
    },

    subscribeToTransactions: () => {
      financeService.subscribeToTransactions({
        onInsert: (transaction) => get().addTransaction(transaction),
        onUpdate: (transaction) => get().updateTransactionInStore(transaction.id, transaction),
        onDelete: (transaction) => get().removeTransaction(transaction.id),
      });
    },
  }))
);
