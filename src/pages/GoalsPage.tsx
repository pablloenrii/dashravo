/**
 * RAVO OS — Goals (dados reais do Supabase)
 * 4 KPIs + gráfico de progresso + lista de metas
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, TrendingUp, AlertCircle, Zap } from 'lucide-react';
import { ChartTooltip } from '@/components/ChartTooltip';
import { ProgressBar } from '@/components/ProgressBar';
import { QueryError, QueryLoading } from '@/components/QueryState';
import { useGoalsData, useGoalProgressData } from '@/hooks/usePagesQueries';

export default function GoalsPage() {
  const goals = useGoalsData();
  const progress = useGoalProgressData();

  const list = goals.data;
  const completedGoals = list.filter((g) => g.percentual >= 100).length;
  const warningGoals = list.filter((g) => g.status === 'atencao' || g.status === 'atrasado').length;
  const avgProgress = list.length > 0
    ? (list.reduce((sum, g) => sum + g.percentual, 0) / list.length).toFixed(0)
    : '0';
  const onTrackGoals = list.filter((g) => g.status === 'no-prazo' || g.status === 'concluido').length;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#F5F5F7', margin: '0 0 8px 0' }}>Metas</h1>
        <p style={{ fontSize: '14px', color: '#9CA3AF', margin: 0 }}>Acompanhamento de objetivos e progresso</p>
      </div>

      {/* Erros */}
      {goals.error && <QueryError message={goals.error} onRetry={goals.refetch} />}
      {progress.error && <QueryError message={progress.error} onRetry={progress.refetch} />}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '32px' }}>
        <KPICard title="Progresso Médio" value={goals.loading ? '…' : avgProgress} unit="%" color="#FF6200" icon={<TrendingUp size={20} />} />
        <KPICard title="Metas Atingidas" value={goals.loading ? '…' : completedGoals.toString()} unit={`/${list.length}`} color="#10B981" icon={<Target size={20} />} />
        <KPICard title="Atenção" value={goals.loading ? '…' : warningGoals.toString()} unit="metas" color="#F59E0B" icon={<AlertCircle size={20} />} />
        <KPICard title="No Prazo" value={goals.loading ? '…' : onTrackGoals.toString()} unit="metas" color="#FF6200" icon={<Zap size={20} />} />
      </div>

      {/* Gráfico de progresso semanal */}
      <div style={{ background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 12px 0' }}>Progresso Semanal vs Meta</h3>
        {progress.loading ? (
          <QueryLoading />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progress.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="semana" stroke="#86868B" style={{ fontSize: '11px' }} />
              <YAxis stroke="#86868B" style={{ fontSize: '11px' }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="meta" fill="rgba(255,255,255,0.1)" name="Meta" radius={[4, 4, 0, 0]} />
              <Bar dataKey="atingido" fill="#FF6200" name="Atingido" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Lista de metas */}
      {goals.loading ? (
        <QueryLoading height={200} />
      ) : list.length === 0 && !goals.error ? (
        <div style={{
          background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
          padding: '32px', textAlign: 'center', fontSize: '13px', color: '#9CA3AF'
        }}>
          Nenhuma meta cadastrada.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '12px' }}>
          {list.map((goal) => {
            const onTrack = goal.status === 'no-prazo' || goal.status === 'concluido';
            return (
              <div key={goal.id} style={{
                background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 4px 0' }}>{goal.nome}</h4>
                    <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>
                      {goal.realizado.toLocaleString('pt-BR')} de {goal.meta.toLocaleString('pt-BR')}
                      {goal.periodo ? ` · ${goal.periodo}` : ''}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: '600', padding: '4px 8px',
                    borderRadius: '4px', color: 'white',
                    background: onTrack ? '#10B981' : '#F59E0B'
                  }}>
                    {onTrack ? 'No Prazo' : 'Atenção'}
                  </span>
                </div>
                <div style={{ width: '100%' }}>
                  <ProgressBar
                    value={Math.min(goal.percentual, 100)}
                    showValue={false}
                    color={onTrack ? '#10B981' : '#F59E0B'}
                  />
                </div>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                  {goal.percentual}% concluído
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function KPICard({ title, value, unit, color, icon }: { title: string; value: string; unit: string; color: string; icon: React.ReactNode }) {
  return (
    <div style={{
      background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)', borderLeft: `3px solid ${color}`,
      borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color }}>
        {icon}
        <span style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF' }}>{title}</span>
      </div>
      <div style={{ fontSize: '28px', fontWeight: '700', color: '#F5F5F7' }}>
        {value}
        <span style={{ fontSize: '14px', color: '#9CA3AF', marginLeft: '4px' }}>{unit}</span>
      </div>
    </div>
  );
}
