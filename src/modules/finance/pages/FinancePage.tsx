/**
 * RAVO OS — Finance Page
 */

import { useEffect } from 'react';
import { Layout, Header } from '@/components/layout';
import { Button, Card } from '@/components/ui';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/state';
import { useFinanceStore } from '../store';

export default function FinancePage() {
  const { transactions, isLoading, error, totalIncome, totalExpense, fetchTransactions } =
    useFinanceStore();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const balance = totalIncome - totalExpense;

  return (
    <Layout>
      <Header
        title="Finance"
        subtitle="Transações e Relatórios"
        actions={
          <Button variant="primary">
            + Nova Transação
          </Button>
        }
      />

      <div className="p-6">
        <div className="grid grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="p-4">
              <div className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</div>
              <div className="text-gray-600 text-sm mt-2">Receita Total</div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-2xl font-bold text-red-600">${totalExpense.toFixed(2)}</div>
              <div className="text-gray-600 text-sm mt-2">Despesa Total</div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                ${balance.toFixed(2)}
              </div>
              <div className="text-gray-600 text-sm mt-2">Saldo</div>
            </div>
          </Card>
        </div>

        {error && (
          <ErrorState
            title="Erro ao carregar"
            message={error}
            action={<Button onClick={fetchTransactions}>Tentar novamente</Button>}
          />
        )}

        {isLoading && <LoadingSpinner />}

        {!isLoading && transactions.length === 0 && (
          <EmptyState
            title="Sem transações"
            message="Adicione sua primeira transação"
            action={<Button variant="primary">+ Nova Transação</Button>}
          />
        )}

        {!isLoading && transactions.length > 0 && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Data</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Descrição</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Categoria</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Tipo</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4 text-sm">{t.description}</td>
                      <td className="px-6 py-4 text-sm">{t.category}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={t.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                          {t.type === 'income' ? '+' : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">${t.amount.toFixed(2)}</td>
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
