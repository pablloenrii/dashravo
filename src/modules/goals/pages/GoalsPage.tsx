/**
 * RAVO OS — Goals Page
 */

import { useEffect } from 'react';
import { Layout, Header } from '@/components/layout';
import { Button, Card, Badge } from '@/components/ui';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/state';
import { useGoalsStore } from '../store';

export default function GoalsPage() {
  const { goals, isLoading, error, fetchGoals } = useGoalsStore();

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const overallProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + (g.current / g.target) * 100, 0) / goals.length)
    : 0;

  return (
    <Layout>
      <Header
        title="Goals"
        subtitle="KPIs e Metas"
        actions={
          <Button variant="primary">
            + Nova Meta
          </Button>
        }
      />

      <div className="p-6">
        <Card className="mb-6">
          <div className="p-4">
            <div className="text-3xl font-bold text-purple-600">{overallProgress}%</div>
            <div className="text-gray-600 text-sm mt-2">Progresso Geral</div>
          </div>
        </Card>

        {error && (
          <ErrorState
            title="Erro ao carregar"
            message={error}
            action={<Button onClick={fetchGoals}>Tentar novamente</Button>}
          />
        )}

        {isLoading && <LoadingSpinner />}

        {!isLoading && goals.length === 0 && (
          <EmptyState
            title="Sem metas"
            message="Crie sua primeira meta para acompanhar"
            action={<Button variant="primary">+ Nova Meta</Button>}
          />
        )}

        {!isLoading && goals.length > 0 && (
          <div className="grid gap-6">
            {goals.map((goal) => {
              const progress = (goal.current / goal.target) * 100;
              return (
                <Card key={goal.id}>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                        <p className="text-sm text-gray-600">{goal.category}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">{goal.status}</Badge>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">
                          {goal.current} / {goal.target} {goal.unit}
                        </span>
                        <span className="font-semibold">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
