/**
 * RAVO OS — Finance Page (Premium Design)
 * Gestão Financeira — Transações e Relatórios Analíticos
 */

import { useEffect, useState } from 'react';
import { Layout, Header } from '@/components/layout';
import { Button } from '@/components/ui';
import { LoadingSpinner, ErrorState } from '@/components/state';
import { useFinanceStore } from '../store';

export default function FinancePage() {
  const { transactions, isLoading, error, totalIncome, totalExpense, fetchTransactions } =
    useFinanceStore();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const balance = totalIncome - totalExpense;
  const filteredTransactions = filterType === 'all'
    ? transactions
    : transactions.filter(t => t.type === filterType);

  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  return (
    <Layout>
      <Header
        title="Finance"
        subtitle="Gestão financeira e análise de fluxo de caixa"
        actions={
          <button className="btn-primary">
            + Nova Transação
          </button>
        }
      />

      <div className="main-content space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card-premium overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600" />
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Receita Total</p>
                  <p className="text-4xl font-bold text-green-600 mt-2">${totalIncome.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-xl">📈</div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-600">Transactions</span>
                <span className="text-sm font-bold text-green-600">{incomeTransactions.length}</span>
              </div>
            </div>
          </div>

          <div className="card-premium overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-red-500 to-pink-600" />
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Despesa Total</p>
                  <p className="text-4xl font-bold text-red-600 mt-2">${totalExpense.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center text-xl">📉</div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-600">Transactions</span>
                <span className="text-sm font-bold text-red-600">{expenseTransactions.length}</span>
              </div>
            </div>
          </div>

          <div className={`card-premium overflow-hidden`}>
            <div className={`h-1 bg-gradient-to-r ${balance >= 0 ? 'from-blue-500 to-indigo-600' : 'from-orange-500 to-red-600'}`} />
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Saldo Líquido</p>
                  <p className={`text-4xl font-bold mt-2 ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    ${balance.toFixed(2)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'} flex items-center justify-center text-xl`}>
                  {balance >= 0 ? '✓' : '⚠'}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-600">Status</span>
                <span className={`text-sm font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {balance >= 0 ? 'Positivo' : 'Negativo'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex flex-wrap gap-3">
          {[
            { type: 'all' as const, label: 'Todas', count: transactions.length },
            { type: 'income' as const, label: 'Receitas', count: incomeTransactions.length },
            { type: 'expense' as const, label: 'Despesas', count: expenseTransactions.length },
          ].map((btn) => (
            <button
              key={btn.type}
              onClick={() => setFilterType(btn.type)}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all text-sm ${
                filterType === btn.type
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {btn.label} <span className="ml-2 opacity-70">({btn.count})</span>
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <ErrorState
            title="Erro ao carregar transações"
            message={error}
            action={<Button onClick={fetchTransactions}>Tentar novamente</Button>}
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="card-premium p-12 text-center">
            <LoadingSpinner />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredTransactions.length === 0 && (
          <div className="card-premium p-12 text-center">
            <div className="text-5xl mb-4">💸</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filterType === 'all' ? 'Sem transações' : `Sem ${filterType === 'income' ? 'receitas' : 'despesas'}`}
            </h3>
            <p className="text-gray-600 mb-6">Comece adicionando uma transação</p>
            <button className="btn-primary">+ Nova Transação</button>
          </div>
        )}

        {/* Transactions Table */}
        {!isLoading && filteredTransactions.length > 0 && (
          <div className="card-premium overflow-hidden">
            <div className="border-b border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900">
                {filterType === 'all' ? 'Todas as Transações' : (filterType === 'income' ? 'Receitas' : 'Despesas')} ({filteredTransactions.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Tipo</th>
                    <th className="text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((t) => (
                    <tr key={t.id}>
                      <td className="font-medium text-gray-900">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                      <td className="font-medium text-gray-900">{t.description}</td>
                      <td className="text-gray-600">{t.category}</td>
                      <td>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          t.type === 'income'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {t.type === 'income' ? '📈 Receita' : '📉 Despesa'}
                        </span>
                      </td>
                      <td className={`text-right font-bold text-lg ${
                        t.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
