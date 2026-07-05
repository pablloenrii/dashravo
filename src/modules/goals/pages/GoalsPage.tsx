/**
 * RAVO OS — Goals Page
 * Acompanhar KPIs e metas com design moderno
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

  const statusConfig = {
    pending: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800', badge: 'bg-yellow-100' },
    active: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', badge: 'bg-blue-100' },
    completed: { bg: 'bg-green-50 border-green-200', text: 'text-green-800', badge: 'bg-green-100' },
    failed: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', badge: 'bg-red-100' },
  };

  return (
    <Layout>
      <Header
        title="Goals"
        subtitle="KPIs e Metas Estratégicas"
        actions={
          <Button variant="primary">
            + Nova Meta
          </Button>
        }
      />

      <div className="p-6 space-y-8">
        {/* Overall Progress */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90 mb-2">Progresso Geral</div>
                <div className="text-5xl font-bold">{overallProgress}%</div>
                <div className="text-sm mt-3 opacity-75">{goals.length} metas sendo acompanhadas</div>
              </div>
              <div className="w-32 h-32 rounded-full border-4 border-white/30 flex items-center justify-center flex-shrink-0">
                <div className="text-center">
                  <div className="text-4xl font-bold">{overallProgress}%</div>
                  <div className="text-xs opacity-75 mt-1">completo</div>
                </div>
              </div>
            </div>
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
            message="Crie sua primeira meta para começar a acompanhar seu progresso"
            action={<Button variant="primary">+ Nova Meta</Button>}
          />
        )}

        {!isLoading && goals.length > 0 && (
          <div className="grid gap-6">
            {goals.map((goal) => {
              const progress = (goal.current / goal.target) * 100;
              const config = statusConfig[goal.status as keyof typeof statusConfig] || statusConfig.pending;

              return (
                <Card key={goal.id} className={`border-2 overflow-hidden ${config.bg}`}>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">{goal.title}</h3>
                        <p className={`text-sm mt-1 ${config.text}`}>{goal.category}</p>
                      </div>
                      <Badge className={`${config.badge} ${config.text}`}>
                        {goal.status}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          {goal.current} / {goal.target} {goal.unit}
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`bg-gradient-to-r ${
                            progress >= 100
                              ? 'from-green-500 to-emerald-600'
                              : progress >= 75
                              ? 'from-blue-500 to-indigo-600'
                              : progress >= 50
                              ? 'from-yellow-500 to-orange-600'
                              : 'from-red-500 to-pink-600'
                          } h-3 rounded-full transition-all duration-300`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Status indicator */}
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>
                        {progress >= 100 && '✓ Meta atingida!'}
                        {progress >= 75 && progress < 100 && '⏰ Quase lá'}
                        {progress >= 50 && progress < 75 && '📊 Bom progresso'}
                        {progress < 50 && '🎯 Iniciando'}
                      </span>
                      <span>Atualizado recentemente</span>
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
