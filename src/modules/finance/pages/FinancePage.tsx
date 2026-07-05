/**
 * RAVO OS — Finance Page
 * Visualizar transações e relatórios com design moderno
 */

import { useEffect, useState } from 'react';
import { Layout, Header } from '@/components/layout';
import { Button, Card } from '@/components/ui';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/state';
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

  return (
    <Layout>
      <Header
        title="Finance"
        subtitle="Transações e Relatórios Financeiros"
        actions={
          <Button variant="primary">
            + Nova Transação
          </Button>
        }
      />

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-3 gap-6">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white">
              <div className="text-sm opacity-90 mb-2">Receita Total</div>
              <div className="text-3xl font-bold">${totalIncome.toFixed(2)}</div>
              <div className="text-xs mt-2 opacity-75">+12% este mês</div>
            </div>
          </Card>
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-red-500 to-pink-600 p-6 text-white">
              <div className="text-sm opacity-90 mb-2">Despesa Total</div>
              <div className="text-3xl font-bold">${totalExpense.toFixed(2)}</div>
              <div className="text-xs mt-2 opacity-75">-5% este mês</div>
            </div>
          </Card>
          <Card className="overflow-hidden">
            <div className={`bg-gradient-to-br ${balance >= 0 ? 'from-blue-500 to-indigo-600' : 'from-orange-500 to-red-600'} p-6 text-white`}>
              <div className="text-sm opacity-90 mb-2">Saldo</div>
              <div className="text-3xl font-bold">${balance.toFixed(2)}</div>
              <div className="text-xs mt-2 opacity-75">{balance >= 0 ? '✓ Positivo' : '⚠ Negativo'}</div>
            </div>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            Todas ({transactions.length})
          </Button>
          <Button
            variant={filterType === 'income' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilterType('income')}
          >
            Receitas ({transactions.filter(t => t.type === 'income').length})
          </Button>
          <Button
            variant={filterType === 'expense' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilterType('expense')}
          >
            Despesas ({transactions.filter(t => t.type === 'expense').length})
          </Button>
        </div>

        {error && (
          <ErrorState
            title="Erro ao carregar"
            message={error}
            action={<Button onClick={fetchTransactions}>Tentar novamente</Button>}
          />
        )}

        {isLoading && <LoadingSpinner />}

        {!isLoading && filteredTransactions.length === 0 && (
          <EmptyState
            title={filterType === 'all' ? "Sem transações" : `Sem ${filterType === 'income' ? 'receitas' : 'despesas'}`}
            message={filterType === 'all' ? "Adicione sua primeira transação" : `Adicione sua primeira ${filterType === 'income' ? 'receita' : 'despesa'}`}
            action={<Button variant="primary">+ Nova Transação</Button>}
          />
        )}

        {!isLoading && filteredTransactions.length > 0 && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Data</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Descrição</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Categoria</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tipo</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{t.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{t.category}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          t.type === 'income'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {t.type === 'income' ? '+ Receita' : '- Despesa'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm font-semibold text-right ${
                        t.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
