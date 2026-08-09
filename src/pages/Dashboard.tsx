/**
 * RAVO OS — Dashboard
 * Minimalismo enterprise + período, comparação vs mês anterior, sparklines e drill-down.
 */

import { useState, useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Trophy, Target, Percent, Timer } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { ChartTooltip } from '@/components/ChartTooltip';
import { ChartCard } from '@/components/ChartCard';
import { QueryError, QueryLoading } from '@/components/QueryState';
import { MetricCard } from '@/components/MetricCard';
import { useMRRData, useChurnData, useFunnelData, useCustomerMetrics } from '@/hooks/useMetricsQueries';
import { useFinanceChartData, useContactsData } from '@/hooks/usePagesQueries';
import { usePeriod, prevMonthKey, monthLabel } from '@/contexts/PeriodContext';
import { computeCrmMetrics } from '@/utils/crmMetrics';
import { fmtK, fmtMoney, pctChange } from '@/utils/format';
import { chart, type, layout, surface, text } from '@/constants/theme';

const REVENUE = chart.revenue;
const LINE = chart.line;
const AXIS = chart.axis;

type Drill = { title: string; data: object[]; dataKey: string; color: string } | null;

export default function Dashboard() {
  const { month, isAllTime, label: periodLabel } = usePeriod();

  // Séries ancoradas no mês selecionado (ou no atual, quando "Todo o período")
  const mrr = useMRRData(month);
  const churn = useChurnData(month);
  const funnel = useFunnelData();
  const metrics = useCustomerMetrics(month);
  const finance = useFinanceChartData(month);
  const contacts = useContactsData();

  // Desempenho comercial do período selecionado (mesma fonte do CRM)
  const cm = useMemo(() => computeCrmMetrics(contacts.data, month), [contacts.data, month]);
  const cmPrev = useMemo(
    () => computeCrmMetrics(contacts.data, month === null ? null : prevMonthKey(month)),
    [contacts.data, month]
  );
  const dc = (cur: number, prev: number) => (isAllTime ? undefined : pctChange(cur, prev));
  const vsLabel = isAllTime ? 'acumulado' : `vs ${monthLabel(prevMonthKey(month as string))}`;

  const [period, setPeriod] = useState<'3m' | '6m'>('6m');
  const [drill, setDrill] = useState<Drill>(null);
  const n = period === '3m' ? 3 : 6;

  const mrrS = mrr.data.slice(-n);
  const churnS = churn.data.slice(-n);
  const finS = finance.data.slice(-n);

  const currentMRR = mrr.data.length > 0 ? mrr.data[mrr.data.length - 1].mrr : 0;
  const currentARR = mrr.data.length > 0 ? mrr.data[mrr.data.length - 1].arr : 0;
  const currentChurn = churn.data.length > 0 ? churn.data[churn.data.length - 1].churn_rate : 0;
  const currentNRR = churn.data.length > 0 ? churn.data[churn.data.length - 1].nrr : 0;
  const activeCustomers = metrics.data['Active Customers'] ?? 0;
  const ltv = metrics.data['LTV'] ?? 0;
  const cac = metrics.data['CAC'] ?? 0;
  const ltvCac = cac > 0 ? (ltv / cac).toFixed(1) : '—';

  const kpis: KpiDef[] = [
    { label: 'MRR', value: fmtK(currentMRR), unit: '/mês', series: mrrS.map((d) => d.mrr), drill: { title: 'MRR', data: mrrS, dataKey: 'mrr', color: LINE } },
    { label: 'ARR', value: fmtK(currentARR), unit: '/ano', series: mrrS.map((d) => d.arr), drill: { title: 'ARR', data: mrrS, dataKey: 'arr', color: LINE } },
    { label: 'Clientes ativos', value: String(activeCustomers.toFixed(0)), unit: '' },
    { label: 'Churn', value: `${currentChurn.toFixed(1)}%`, unit: '', series: churnS.map((d) => d.churn_rate), drill: { title: 'Churn %', data: churnS, dataKey: 'churn_rate', color: LINE } },
    { label: 'NRR', value: `${currentNRR.toFixed(0)}%`, unit: '', series: churnS.map((d) => d.nrr), drill: { title: 'NRR %', data: churnS, dataKey: 'nrr', color: LINE } },
    { label: 'LTV / CAC', value: String(ltvCac), unit: '' },
  ];

  const loading = mrr.loading || churn.loading || metrics.loading;

  return (
    <div style={{ maxWidth: layout.pageMaxWidth, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
        <div>
          <h1 style={{ ...type.pageTitle, color: text.primary, margin: '0 0 4px 0' }}>Dashboard</h1>
          <p style={{ fontSize: '14px', color: text.secondary, margin: 0 }}>{periodLabel} · visão geral do negócio</p>
        </div>
        <div style={{ display: 'flex', background: surface.card, border: `1px solid ${surface.border}`, borderRadius: '8px', padding: '3px' }}>
          {(['3m', '6m'] as const).map((pp) => (
            <button key={pp} onClick={() => setPeriod(pp)} style={{
              padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
              background: period === pp ? surface.active : 'transparent', color: period === pp ? chart.light : text.tertiary,
            }}>{pp === '3m' ? '3 meses' : '6 meses'}</button>
          ))}
        </div>
      </div>

      {mrr.error && <QueryError message={mrr.error} onRetry={mrr.refetch} />}
      {churn.error && <QueryError message={churn.error} onRetry={churn.refetch} />}
      {metrics.error && <QueryError message={metrics.error} onRetry={metrics.refetch} />}
      {finance.error && <QueryError message={finance.error} onRetry={finance.refetch} />}

      {/* Desempenho comercial do período */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ ...type.sectionTitle, color: text.label, margin: '0 0 10px 0' }}>
          Comercial
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
          <MetricCard label="Receita fechada" value={fmtMoney(cm.receitaGanha)} icon={<Trophy size={14} />}
            deltaPct={dc(cm.receitaGanha, cmPrev.receitaGanha)} sublabel={vsLabel} loading={contacts.loading} />
          <MetricCard label="Pipeline aberto" value={fmtMoney(cm.pipelineAberto)} icon={<Target size={14} />}
            deltaPct={dc(cm.pipelineAberto, cmPrev.pipelineAberto)}
            sublabel={`${cm.abertos.length} ${cm.abertos.length === 1 ? 'deal' : 'deals'}`} loading={contacts.loading} />
          <MetricCard label="Win rate" value={`${cm.winRate}%`} icon={<Percent size={14} />}
            deltaPct={dc(cm.winRate, cmPrev.winRate)}
            sublabel={`${cm.ganhos.length}G / ${cm.perdidos.length}P`} loading={contacts.loading} />
          <MetricCard label="Ciclo de venda" value={`${cm.cicloMedio}d`} icon={<Timer size={14} />}
            deltaPct={dc(cm.cicloMedio, cmPrev.cicloMedio)} invertDelta
            sublabel="lead → fechamento" loading={contacts.loading} />
        </div>
      </div>

      <h2 style={{ ...type.sectionTitle, color: text.label, margin: '0 0 10px 0' }}>
        Recorrência
      </h2>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        border: `1px solid ${surface.border}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '16px',
      }}>
        {kpis.map((k, i) => <KPI key={k.label} kpi={k} first={i === 0} loading={loading} onOpen={() => k.drill && setDrill(k.drill)} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        <ChartCard title="Receita mensal">
          {finance.loading ? <QueryLoading /> : (
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={finS} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
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
              <LineChart data={mrrS} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
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
              <LineChart data={churnS} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
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
                <Bar dataKey="quantidade" fill={chart.seriesAlt} radius={[0, 2, 2, 0]} name="Contatos" barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <Modal isOpen={drill !== null} onClose={() => setDrill(null)} title={drill?.title ?? ''} size="lg">
        {drill && (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={drill.data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <XAxis dataKey="mes" stroke={AXIS} tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
              <YAxis stroke={AXIS} tickLine={false} axisLine={false} style={{ fontSize: '11px' }} tickFormatter={fmtK} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <Line type="monotone" dataKey={drill.dataKey} stroke={drill.color} dot={{ r: 2 }} strokeWidth={1.75} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Modal>
    </div>
  );
}

interface KpiDef {
  label: string; value: string; unit: string;
  series?: number[];
  drill?: { title: string; data: object[]; dataKey: string; color: string };
}

function KPI({ kpi, first, loading, onOpen }: { kpi: KpiDef; first: boolean; loading: boolean; onOpen: () => void }) {
  const d = kpi.series && kpi.series.length >= 2 ? computeDelta(kpi.series) : null;
  const clickable = !!kpi.drill;
  return (
    <div
      onClick={clickable ? onOpen : undefined}
      style={{
        padding: '14px 16px', background: surface.card,
        borderLeft: first ? 'none' : `1px solid ${surface.divider}`,
        cursor: clickable ? 'pointer' : 'default',
      }}
    >
      <div style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.02em', color: text.tertiary, marginBottom: '8px' }}>{kpi.label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.02em', color: chart.light }}>{loading ? '—' : kpi.value}</span>
        {kpi.unit && <span style={{ fontSize: '12px', color: text.tertiary }}>{kpi.unit}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', minHeight: '20px' }}>
        {d ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', color: chart.line }}>
            {d.dir === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(d.pct)}%
          </span>
        ) : <span />}
        {kpi.series && <Sparkline data={kpi.series} />}
      </div>
    </div>
  );
}

function computeDelta(series: number[]): { pct: number; dir: 'up' | 'down' } | null {
  const last = series[series.length - 1];
  const prev = series[series.length - 2];
  if (prev === 0) return null;
  const pct = Math.round(((last - prev) / Math.abs(prev)) * 1000) / 10;
  return { pct, dir: pct >= 0 ? 'up' : 'down' };
}

function Sparkline({ data, color = chart.seriesAlt }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const w = 62, h = 18;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.25} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
