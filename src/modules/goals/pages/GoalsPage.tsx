/**
 * RAVO OS — Goals Page (Premium Design)
 * Planejamento Estratégico — KPIs e Acompanhamento de Metas
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

  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const failedGoals = goals.filter(g => g.status === 'failed').length;

  const statusConfig: Record<string, { gradient: string; badge: string; icon: string }> = {
    pending: { gradient: 'from-amber-500 to-amber-600', badge: 'bg-amber-100 text-amber-700', icon: '⏳' },
    active: { gradient: 'from-blue-500 to-blue-600', badge: 'bg-blue-100 text-blue-700', icon: '🔄' },
    completed: { gradient: 'from-green-500 to-emerald-600', badge: 'bg-green-100 text-green-700', icon: '✓' },
    failed: { gradient: 'from-red-500 to-rose-600', badge: 'bg-red-100 text-red-700', icon: '✕' },
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'from-green-500 to-emerald-600';
    if (progress >= 75) return 'from-blue-500 to-indigo-600';
    if (progress >= 50) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getProgressLabel = (progress: number) => {
    if (progress >= 100) return '✓ Meta atingida';
    if (progress >= 75) return '⏰ Quase lá';
    if (progress >= 50) return '📊 Bom progresso';
    return '🎯 Iniciando';
  };

  return (
    <Layout>
      <Header
        title="Goals"
        subtitle="Defina e acompanhe suas metas estratégicas"
        actions={
          <button className="btn-primary">
            + Nova Meta
          </button>
        }
      />

      <div className="main-content space-y-8">
        {/* Overall Progress Card */}
        <div className="card-premium overflow-hidden">
          <div className={`h-1 bg-gradient-to-r from-purple-600 to-indigo-600`} />
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-gray-600 text-sm font-medium mb-4">Progresso Geral</h3>
                <div className="flex items-end gap-4">
                  <div className="text-6xl font-bold text-purple-600">{overallProgress}%</div>
                  <div className="mb-2">
                    <p className="text-sm text-gray-600">{goals.length} metas</p>
                    <p className="text-sm text-gray-600">{completedGoals} completadas</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="h-full bg-gray-100 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-4">Resumo por Status</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">✓</span>
                          <span className="text-gray-700 font-medium">Completadas</span>
                        </div>
                        <span className="text-2xl font-bold text-green-600">{completedGoals}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🔄</span>
                          <span className="text-gray-700 font-medium">Ativas</span>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">{activeGoals}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">✕</span>
                          <span className="text-gray-700 font-medium">Falhadas</span>
                        </div>
                        <span className="text-2xl font-bold text-red-600">{failedGoals}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <ErrorState
            title="Erro ao carregar metas"
            message={error}
            action={<Button onClick={fetchGoals}>Tentar novamente</Button>}
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="card-premium p-12 text-center">
            <LoadingSpinner />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && goals.length === 0 && (
          <div className="card-premium p-12 text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sem metas definidas</h3>
            <p className="text-gray-600 mb-6">Crie sua primeira meta para começar o acompanhamento</p>
            <button className="btn-primary">+ Nova Meta</button>
          </div>
        )}

        {/* Goals Grid */}
        {!isLoading && goals.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goals.map((goal) => {
              const progress = (goal.current / goal.target) * 100;
              const config = statusConfig[goal.status as keyof typeof statusConfig] || statusConfig.pending;

              return (
                <div key={goal.id} className="card-premium overflow-hidden group cursor-pointer">
                  <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />

                  <div className="p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{goal.title}</h3>
                        <p className="text-sm text-gray-600">{goal.category}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${config.badge}`}>
                        {config.icon} {goal.status}
                      </div>
                    </div>

                    {/* Progress Section */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          {goal.current} / {goal.target} {goal.unit}
                        </span>
                        <span className="text-lg font-bold text-gray-900">{Math.round(progress)}%</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`bg-gradient-to-r ${getProgressColor(progress)} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-xs font-medium text-gray-600">
                        {getProgressLabel(progress)}
                      </span>
                      <span className="text-xs text-gray-500">Atualizado</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
