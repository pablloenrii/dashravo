/**
 * RAVO OS — Dashboard (dados reais do Supabase)
 * 6 KPIs + 4 gráficos
 */

import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Target, Percent, Wallet } from 'lucide-react';
import { ChartTooltip } from '@/components/ChartTooltip';
import { QueryError, QueryLoading } from '@/components/QueryState';
import { useMRRData, useChurnData, useFunnelData, useCustomerMetrics } from '@/hooks/useMetricsQueries';
import { useFinanceChartData } from '@/hooks/usePagesQueries';

const fmtK = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v.toFixed(0));

export default function Dashboard() {
  const mrr = useMRRData();
  const churn = useChurnData();
  const funnel = useFunnelData();
  const metrics = useCustomerMetrics();
  const finance = useFinanceChartData();

  const currentMRR = mrr.data.length > 0 ? mrr.data[mrr.data.length - 1].mrr : 0;
  const currentARR = mrr.data.length > 0 ? mrr.data[mrr.data.length - 1].arr : 0;
  const currentChurn = churn.data.length > 0 ? churn.data[churn.data.length - 1].churn_rate : 0;
  const currentNRR = churn.data.length > 0 ? churn.data[churn.data.length - 1].nrr : 0;
  const activeCustomers = metrics.data['Active Customers'] ?? 0;
  const ltv = metrics.data['LTV'] ?? 0;
  const cac = metrics.data['CAC'] ?? 0;
  const ltvCac = cac > 0 ? (ltv / cac).toFixed(1) : '—';

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#F5F5F7', margin: '0 0 8px 0' }}>Dashboard</h1>
        <p style={{ fontSize: '14px', color: '#9CA3AF', margin: 0 }}>Visão geral do negócio em tempo real</p>
      </div>

      {/* Erros de carregamento */}
      {mrr.error && <QueryError message={mrr.error} onRetry={mrr.refetch} />}
      {churn.error && <QueryError message={churn.error} onRetry={churn.refetch} />}
      {metrics.error && <QueryError message={metrics.error} onRetry={metrics.refetch} />}
      {funnel.error && <QueryError message={funnel.error} onRetry={funnel.refetch} />}
      {finance.error && <QueryError message={finance.error} onRetry={finance.refetch} />}

      {/* KPIs — Primeira linha */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <KPICard title="MRR" value={fmtK(currentMRR)} unit="/mês" color="#FF6200" icon={<DollarSign size={20} />} loading={mrr.loading} />
        <KPICard title="ARR" value={fmtK(currentARR)} unit="/ano" color="#FF6200" icon={<Wallet size={20} />} loading={mrr.loading} />
        <KPICard title="Clientes Ativos" value={activeCustomers.toFixed(0)} unit="clientes" color="#10B981" icon={<Users size={20} />} loading={metrics.loading} />
      </div>

      {/* KPIs — Segunda linha */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '32px' }}>
        <KPICard title="Churn Rate" value={currentChurn.toFixed(1)} unit="%" color="#10B981" icon={<Target size={20} />} loading={churn.loading} />
        <KPICard title="NRR" value={currentNRR.toFixed(0)} unit="%" color="#FF6200" icon={<Percent size={20} />} loading={churn.loading} />
        <KPICard title="LTV/CAC" value={String(ltvCac)} unit="razão" color="#10B981" icon={<TrendingUp size={20} />} loading={metrics.loading} />
      </div>

      {/* Gráficos 2x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <ChartCard title="MRR Trend">
          {mrr.loading ? (
            <QueryLoading />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mrr.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="mes" stroke="#86868B" style={{ fontSize: '11px' }} />
                <YAxis stroke="#86868B" style={{ fontSize: '11px' }} tickFormatter={fmtK} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Line type="monotone" dataKey="mrr" stroke="#FF6200" dot={false} strokeWidth={2} name="MRR" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Receita vs Despesa">
          {finance.loading ? (
            <QueryLoading />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={finance.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="mes" stroke="#86868B" style={{ fontSize: '11px' }} />
                <YAxis stroke="#86868B" style={{ fontSize: '11px' }} tickFormatter={fmtK} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Area type="monotone" dataKey="receita" stroke="#10B981" fill="rgba(16, 185, 129, 0.25)" name="Receita" />
                <Area type="monotone" dataKey="despesa" stroke="#F59E0B" fill="rgba(245, 158, 11, 0.25)" name="Despesa" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Churn Rate">
          {churn.loading ? (
            <QueryLoading />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={churn.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="mes" stroke="#86868B" style={{ fontSize: '11px' }} />
                <YAxis stroke="#86868B" style={{ fontSize: '11px' }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Line type="monotone" dataKey="churn_rate" stroke="#FF6200" dot={false} strokeWidth={2} name="Churn %" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Funil de Vendas">
          {funnel.loading ? (
            <QueryLoading />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnel.data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="#86868B" style={{ fontSize: '11px' }} />
                <YAxis type="category" dataKey="estagio" stroke="#86868B" style={{ fontSize: '11px' }} width={90} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="quantidade" fill="#FF6200" radius={[0, 4, 4, 0]} name="Contatos" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function KPICard({ title, value, unit, color, icon, loading }: {
  title: string; value: string; unit: string; color: string; icon: React.ReactNode; loading?: boolean;
}) {
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
        {loading ? '…' : value}
        <span style={{ fontSize: '14px', color: '#9CA3AF', marginLeft: '6px' }}>{unit}</span>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px' }}>
      <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 12px 0' }}>{title}</h3>
      {children}
    </div>
  );
}
