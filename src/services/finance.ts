/**
 * RAVO OS — Finance Service
 * Gerencia receitas, despesas e fluxo de caixa com real-time
 */

import { sb } from './supabase';
import { realtimeManager } from './realtime';

export interface Transaction {
  id: string;
  type: 'receita' | 'despesa';
  category: string;
  description: string;
  amount: number;
  date: string;
  status: 'pendente' | 'confirmado' | 'cancelado';
  reference?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionChange {
  onInsert?: (transaction: Transaction) => void;
  onUpdate?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

/**
 * Finance Service - Gerencia transações financeiras
 */
class FinanceService {
  private tableName = 'transactions';

  /**
   * Buscar todas as transações
   */
  async getTransactions() {
    const { data, error } = await sb
      .from(this.tableName)
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar transações:', error);
      return [];
    }
    return (data as Transaction[]) || [];
  }

  /**
   * Buscar transações por período
   */
  async getTransactionsByPeriod(startDate: string, endDate: string) {
    const { data, error } = await sb
      .from(this.tableName)
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar transações por período:', error);
      return [];
    }
    return (data as Transaction[]) || [];
  }

  /**
   * Buscar saldo total
   */
  async getBalance() {
    const { data, error } = await sb
      .from(this.tableName)
      .select('type, amount')
      .eq('status', 'confirmado');

    if (error) {
      console.error('❌ Erro ao calcular saldo:', error);
      return 0;
    }

    const transactions = (data as Pick<Transaction, 'type' | 'amount'>[]) || [];
    return transactions.reduce((acc, t) => {
      return t.type === 'receita' ? acc + t.amount : acc - t.amount;
    }, 0);
  }

  /**
   * Criar transação
   */
  async createTransaction(
    transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>
  ) {
    const { data, error } = await sb
      .from(this.tableName)
      .insert([transaction])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar transação:', error);
      return null;
    }
    return data as Transaction;
  }

  /**
   * Atualizar transação
   */
  async updateTransaction(id: string, updates: Partial<Transaction>) {
    const { data, error } = await sb
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar transação:', error);
      return null;
    }
    return data as Transaction;
  }

  /**
   * Deletar transação
   */
  async deleteTransaction(id: string) {
    const { error } = await sb
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao deletar transação:', error);
      return false;
    }
    return true;
  }

  /**
   * Subscrever a mudanças em transações (real-time)
   */
  subscribeToTransactions(callbacks: TransactionChange) {
    return realtimeManager.subscribe(this.tableName, {
      onInsert: callbacks.onInsert,
      onUpdate: callbacks.onUpdate,
      onDelete: callbacks.onDelete,
    });
  }

  /**
   * Relatório mensal
   */
  async getMonthlyReport(month: number, year: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;

    const transactions = await this.getTransactionsByPeriod(startDate, endDate);

    const receita = transactions
      .filter((t) => t.type === 'receita' && t.status === 'confirmado')
      .reduce((sum, t) => sum + t.amount, 0);

    const despesa = transactions
      .filter((t) => t.type === 'despesa' && t.status === 'confirmado')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      month,
      year,
      receita,
      despesa,
      lucro: receita - despesa,
    };
  }
}

// Singleton
export const financeService = new FinanceService();
