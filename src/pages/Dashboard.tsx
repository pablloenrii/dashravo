/**
 * RAVO OS — Dashboard
 * Minimalismo enterprise: preto/branco, tipografia contida, gráficos discretos.
 * Verde APENAS em receita confirmada. Sem vermelho/laranja em dados.
 */

import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartTooltip } from '@/components/ChartTooltip';
import { QueryError, QueryLoading } from '@/components/QueryState';
import { useMRRData, useChurnData, useFunnelData, useCustomerMetrics } from '@/hooks/useMetricsQueries';
import { useFinanceChartData } from '@/hooks/usePagesQueries';

const REVENUE = '#3FB950';   // verde: só receita confirmada
const LINE = '#8B8B8B';      // linhas/dados neutros
const AXIS = '#454545';
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

  const kpis = [
    { label: 'MRR', value: fmtK(currentMRR), unit: '/mês', loading: mrr.loading },
    { label: 'ARR', value: fmtK(currentARR), unit: '/ano', loading: mrr.loading },
    { label: 'Clientes ativos', value: String(activeCustomers.toFixed(0)), unit: '', loading: metrics.loading },
    { label: 'Churn', value: `${currentChurn.toFixed(1)}%`, unit: '', loading: churn.loading },
    { label: 'NRR', value: `${currentNRR.toFixed(0)}%`, unit: '', loading: churn.loading },
    { label: 'LTV / CAC', value: String(ltvCac), unit: '', loading: metrics.loading },
  ];

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.01em', color: '#EDEDED', margin: '0 0 2px 0' }}>Dashboard</h1>
      <p style={{ fontSize: '12.5px', color: '#6E6E6E', margin: '0 0 22px 0' }}>Visão geral do negócio</p>

      {mrr.error && <QueryError message={mrr.error} onRetry={mrr.refetch} />}
      {churn.error && <QueryError message={churn.error} onRetry={churn.refetch} />}
      {metrics.error && <QueryError message={metrics.error} onRetry={metrics.refetch} />}
      {funnel.error && <QueryError message={funnel.error} onRetry={funnel.refetch} />}
      {finance.error && <QueryError message={finance.error} onRetry={finance.refetch} />}

      {/* KPIs — faixa única, densa */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px',
      }}>
        {kpis.map((k, i) => (
          <div key={k.label} style={{
            padding: '14px 16px',
            borderLeft: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)',
            background: '#0F0F0F',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.02em', color: '#6E6E6E', marginBottom: '8px' }}>{k.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.02em', color: '#EDEDED' }}>{k.loading ? '—' : k.value}</span>
              {k.unit && <span style={{ fontSize: '12px', color: '#6E6E6E' }}>{k.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '16px' }}>
        <ChartCard title="Receita mensal">
          {finance.loading ? <QueryLoading /> : (
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={finance.data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <XAxis dataKey="mes" stroke={AXIS} tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
                <YAxis stroke={AXIS} tickLine={false} axisLine={false} style={{ fontSize: '11px' }} tickFormatter={fmtK} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Area type="monotone" dataKey="receita" stroke={REVENUE} fill="rgba(63,185,80,0.08)" strokeWidth={1.75} name="Receita" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="MRR">
          {mrr.loading ? <QueryLoading /> : (
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={mrr.data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <XAxis dataKey="mes" stroke={AXIS} tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
                <YAxis stroke={AXIS} tickLine={false} axisLine={false} style={{ fontSize: '11px' }} tickFormatter={fmtK} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Line type="monotone" dataKey="mrr" stroke={LINE} dot={false} strokeWidth={1.75} name="MRR" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Churn">
          {churn.loading ? <QueryLoading /> : (
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={churn.data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <XAxis dataKey="mes" stroke={AXIS} tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
                <YAxis stroke={AXIS} tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Line type="monotone" dataKey="churn_rate" stroke={LINE} dot={false} strokeWidth={1.75} name="Churn %" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Funil de vendas">
          {funnel.loading ? <QueryLoading /> : (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={funnel.data} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <XAxis type="number" stroke={AXIS} tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
                <YAxis type="category" dataKey="estagio" stroke={AXIS} tickLine={false} axisLine={false} style={{ fontSize: '11px' }} width={84} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="quantidade" fill="#5A5A5A" radius={[0, 2, 2, 0]} name="Contatos" barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px 16px' }}>
      <h3 style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.01em', color: '#8B8B8B', margin: '0 0 12px 0' }}>{title}</h3>
      {children}
    </div>
  );
}
