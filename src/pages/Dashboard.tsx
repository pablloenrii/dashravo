/**
 * RAVO OS — Dashboard (dados reais do Supabase)
 * Visual sóbrio corporativo: neutro + laranja de marca, tipografia compacta.
 */

import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Target, Percent, Wallet } from 'lucide-react';
import { ChartTooltip } from '@/components/ChartTooltip';
import { QueryError, QueryLoading } from '@/components/QueryState';
import { useMRRData, useChurnData, useFunnelData, useCustomerMetrics } from '@/hooks/useMetricsQueries';
import { useFinanceChartData } from '@/hooks/usePagesQueries';

const ACCENT = '#FF6200';
const NEUTRAL = '#626873';
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
    <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em', color: '#ECEDEF', margin: '0 0 4px 0' }}>Dashboard</h1>
        <p style={{ fontSize: '13px', color: '#9096A1', margin: 0 }}>Visão geral do negócio em tempo real</p>
      </div>

      {mrr.error && <QueryError message={mrr.error} onRetry={mrr.refetch} />}
      {churn.error && <QueryError message={churn.error} onRetry={churn.refetch} />}
      {metrics.error && <QueryError message={metrics.error} onRetry={metrics.refetch} />}
      {funnel.error && <QueryError message={funnel.error} onRetry={funnel.refetch} />}
      {finance.error && <QueryError message={finance.error} onRetry={finance.refetch} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px', marginBottom: '12px' }}>
        <KPI title="MRR" value={fmtK(currentMRR)} unit="/mês" icon={<DollarSign size={15} />} loading={mrr.loading} />
        <KPI title="ARR" value={fmtK(currentARR)} unit="/ano" icon={<Wallet size={15} />} loading={mrr.loading} />
        <KPI title="Clientes Ativos" value={String(activeCustomers.toFixed(0))} unit="clientes" icon={<Users size={15} />} loading={metrics.loading} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <KPI title="Churn Rate" value={currentChurn.toFixed(1)} unit="%" icon={<Target size={15} />} loading={churn.loading} />
        <KPI title="NRR" value={currentNRR.toFixed(0)} unit="%" icon={<Percent size={15} />} loading={churn.loading} />
        <KPI title="LTV / CAC" value={String(ltvCac)} unit="razão" icon={<TrendingUp size={15} />} loading={metrics.loading} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '12px' }}>
        <ChartCard title="MRR Trend">
          {mrr.loading ? <QueryLoading /> : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={mrr.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="mes" stroke="#626873" style={{ fontSize: '11px' }} />
                <YAxis stroke="#626873" style={{ fontSize: '11px' }} tickFormatter={fmtK} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Line type="monotone" dataKey="mrr" stroke={ACCENT} dot={false} strokeWidth={2} name="MRR" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Receita vs Despesa">
          {finance.loading ? <QueryLoading /> : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={finance.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="mes" stroke="#626873" style={{ fontSize: '11px' }} />
                <YAxis stroke="#626873" style={{ fontSize: '11px' }} tickFormatter={fmtK} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Area type="monotone" dataKey="receita" stroke={ACCENT} fill="rgba(255,98,0,0.14)" strokeWidth={2} name="Receita" />
                <Area type="monotone" dataKey="despesa" stroke={NEUTRAL} fill="rgba(98,104,115,0.14)" strokeWidth={2} name="Despesa" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Churn Rate">
          {churn.loading ? <QueryLoading /> : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={churn.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="mes" stroke="#626873" style={{ fontSize: '11px' }} />
                <YAxis stroke="#626873" style={{ fontSize: '11px' }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Line type="monotone" dataKey="churn_rate" stroke={NEUTRAL} dot={false} strokeWidth={2} name="Churn %" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Funil de Vendas">
          {funnel.loading ? <QueryLoading /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={funnel.data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#626873" style={{ fontSize: '11px' }} />
                <YAxis type="category" dataKey="estagio" stroke="#626873" style={{ fontSize: '11px' }} width={90} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="quantidade" fill={ACCENT} radius={[0, 3, 3, 0]} name="Contatos" barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function KPI({ title, value, unit, icon, loading }: {
  title: string; value: string; unit: string; icon: React.ReactNode; loading?: boolean;
}) {
  return (
    <div style={{
      background: '#0E1116', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px', padding: '16px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9096A1' }}>{title}</span>
        <span style={{ color: '#626873', display: 'flex' }}>{icon}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span style={{ fontSize: '24px', fontWeight: 650, letterSpacing: '-0.02em', color: '#ECEDEF' }}>{loading ? '…' : value}</span>
        <span style={{ fontSize: '13px', color: '#9096A1' }}>{unit}</span>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#0E1116', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px 18px' }}>
      <h3 style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '-0.005em', color: '#ECEDEF', margin: '0 0 14px 0' }}>{title}</h3>
      {children}
    </div>
  );
}
