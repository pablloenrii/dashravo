/**
 * RAVO OS — Dashboard
 * Minimalismo enterprise + período, comparação vs mês anterior, sparklines,
 * drill-down, "Receitas × Investimentos" e análise mês a mês com métricas
 * selecionáveis.
 */

import { useState, useMemo } from 'react';
import {
  ComposedChart, BarChart, LineChart, AreaChart, PieChart,
  Bar, Line, Area, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Trophy, Target, Percent, Timer } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { ChartTooltip } from '@/components/ChartTooltip';
import { ChartCard } from '@/components/ChartCard';
import { QueryError, QueryLoading } from '@/components/QueryState';
import { MetricCard } from '@/components/MetricCard';
import { MonthlyTable } from '@/components/MonthlyTable';
import { useMRRData, useChurnData, useFunnelData, useCustomerMetrics } from '@/hooks/useMetricsQueries';
import {
  useFinanceChartData, useContactsData, useContactsChartData,
  useCashFlowData, useExpensesData,
} from '@/hooks/usePagesQueries';
import {
  usePeriod, prevMonthKey, monthLabel, monthsEndingAt, MonthKey,
} from '@/contexts/PeriodContext';
import { computeCrmMetrics } from '@/utils/crmMetrics';
import { fmtK, fmtMoney, pctChange } from '@/utils/format';
import {
  mergeMonthly, DEFAULT_SELECTED, MonthlyMetricKey, FinanceSlice,
} from '@/utils/monthlyAnalysis';
import { useThemeTokens } from '@/hooks/useThemeTokens';

type Drill = { title: string; data: object[]; dataKey: string; color: string } | null;

export default function Dashboard() {
  const { month, isAllTime, label: periodLabel, effectiveMonth, setMonth } = usePeriod();
  const { chart, type, layout, surface, text } = useThemeTokens();

  const REVENUE = chart.revenue;
  const LINE = chart.line;
  const AXIS = chart.axis;

  // Séries ancoradas no mês selecionado (ou no atual, quando "Todo o período")
  const mrr = useMRRData(month);
  const churn = useChurnData(month);
  const funnel = useFunnelData();
  const metrics = useCustomerMetrics(month);
  const finance = useFinanceChartData(month);
  const contacts = useContactsData();
  const contactsChart = useContactsChartData(month);
  const cashFlow = useCashFlowData(month);
  const expenses = useExpensesData(month);

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
  const [selMetrics, setSelMetrics] = useState<MonthlyMetricKey[]>(DEFAULT_SELECTED);
  const n = period === '3m' ? 3 : 6;

  const mrrS = mrr.data.slice(-n);
  const churnS = churn.data.slice(-n);
  const finS = finance.data.slice(-n);
  const contactsS = contactsChart.data.slice(-n);

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

  // --------------------------------------------------------------------------
  // Análise do mês selecionado: Receita × Investimento (despesa)
  // --------------------------------------------------------------------------
  const selFin = finS[finS.length - 1];
  const prevFin = finS[finS.length - 2];
  const monthKPIs = useMemo(() => {
    if (isAllTime) {
      const receita = finS.reduce((s, m) => s + m.receita, 0);
      const despesa = finS.reduce((s, m) => s + m.despesa, 0);
      const lucro = receita - despesa;
      return { receita, despesa, lucro, margem: receita > 0 ? (lucro / receita) * 100 : 0, deltaReceita: undefined, deltaDespesa: undefined, deltaLucro: undefined };
    }
    const receita = selFin?.receita ?? 0;
    const despesa = selFin?.despesa ?? 0;
    const lucro = selFin?.lucro ?? receita - despesa;
    return {
      receita, despesa, lucro, margem: receita > 0 ? (lucro / receita) * 100 : 0,
      deltaReceita: prevFin ? pctChange(receita, prevFin.receita) : undefined,
      deltaDespesa: prevFin ? pctChange(despesa, prevFin.despesa) : undefined,
      deltaLucro: prevFin ? pctChange(lucro, prevFin.lucro) : undefined,
    };
  }, [finS, isAllTime, selFin, prevFin]);

  const highlightedMonth: MonthKey | null = isAllTime ? null : month;
  const finKeys = monthsEndingAt(effectiveMonth, finS.length);
  const monthRows = useMemo(
    () => mergeMonthly(finS as FinanceSlice[], mrrS, churnS, contactsS, finKeys),
    [finS, mrrS, churnS, contactsS, finKeys]
  );

  const loading = mrr.loading || churn.loading || metrics.loading;
  const highlightIndex = isAllTime ? -1 : finS.length - 1;

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
      {expenses.error && <QueryError message={expenses.error} onRetry={expenses.refetch} />}
      {cashFlow.error && <QueryError message={cashFlow.error} onRetry={cashFlow.refetch} />}

      {/* Desempenho comercial do período */}
      <div style={{ marginBottom: '16px' }}>
        <SectionTitle>Comercial</SectionTitle>
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

      <SectionTitle>Recorrência</SectionTitle>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        border: `1px solid ${surface.border}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '16px',
      }}>
        {kpis.map((k, i) => <KPI key={k.label} kpi={k} first={i === 0} loading={loading} onOpen={() => k.drill && setDrill(k.drill)} />)}
      </div>

      {/* Receitas × Investimentos */}
      <div style={{ marginBottom: '16px' }}>
        <SectionTitle>Receitas × Investimentos</SectionTitle>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <MetricCard label="Receita" value={fmtMoney(monthKPIs.receita)} icon={<ArrowUpRight size={14} />}
            deltaPct={monthKPIs.deltaReceita} sublabel={isAllTime ? `${periodLabel}` : monthLabel(effectiveMonth)} loading={finance.loading} />
          <MetricCard label="Investimento" value={fmtMoney(monthKPIs.despesa)} icon={<ArrowDownRight size={14} />}
            deltaPct={monthKPIs.deltaDespesa} invertDelta sublabel="despesas do período" loading={finance.loading} />
          <MetricCard label="Lucro" value={fmtMoney(monthKPIs.lucro)} icon={<ArrowUpRight size={14} />}
            deltaPct={monthKPIs.deltaLucro} sublabel="receita − investimento" loading={finance.loading} />
          <MetricCard label="Margem" value={`${monthKPIs.margem.toFixed(1)}%`} icon={<Percent size={14} />}
            progress={monthKPIs.margem} sublabel="lucro / receita" loading={finance.loading} />
        </div>

        <ChartCard title="Receita, Investimento e Lucro" subtitle={periodLabel}>
          {finance.loading ? <QueryLoading /> : (
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={finS} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                <XAxis dataKey="mes" stroke={AXIS} tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
                <YAxis stroke={AXIS} tickLine={false} axisLine={false} style={{ fontSize: '11px' }} tickFormatter={fmtK} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="receita" name="Receita" radius={[3, 3, 0, 0]} barSize={18}>
                  {finS.map((_, i) => (
                    <Cell key={i} fill={i === highlightIndex ? REVENUE : `${REVENUE}59`} />
                  ))}
                </Bar>
                <Bar dataKey="despesa" name="Investimento" fill={LINE} radius={[3, 3, 0, 0]} barSize={18} />
                <Line type="monotone" dataKey="lucro" name="Lucro" stroke={chart.light} strokeWidth={1.75} dot={{ r: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Análise mês a mês */}
      <div style={{ marginBottom: '16px' }}>
        <SectionTitle>Análise mês a mês</SectionTitle>
        <p style={{ fontSize: '12px', color: text.tertiary, margin: '0 0 10px 0' }}>
          Selecione as métricas e clique em uma linha para fixar o mês na análise acima.
        </p>
        <MonthlyTable
          rows={monthRows}
          selected={selMetrics}
          onSelectedChange={setSelMetrics}
          highlightedMonth={highlightedMonth}
          onSelectMonth={setMonth}
          loading={finance.loading || mrr.loading}
        />
      </div>

      {/* Gráficos de detalhe */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
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

        <ChartCard title="Fluxo de caixa semanal">
          {cashFlow.loading ? <QueryLoading /> : (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={cashFlow.data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <XAxis dataKey="semana" stroke={AXIS} tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
                <YAxis stroke={AXIS} tickLine={false} axisLine={false} style={{ fontSize: '11px' }} tickFormatter={fmtK} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="entradas" name="Entradas" fill={REVENUE} radius={[2, 2, 0, 0]} barSize={12} />
                <Bar dataKey="saidas" name="Saídas" fill={LINE} radius={[2, 2, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Novos vs ativos">
          {contactsChart.loading ? <QueryLoading /> : (
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={contactsS} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <XAxis dataKey="mes" stroke={AXIS} tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
                <YAxis stroke={AXIS} tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Area type="monotone" dataKey="novos" stroke={chart.palette[1]} fill="rgba(16,185,129,0.08)" strokeWidth={1.5} name="Novos" />
                <Area type="monotone" dataKey="ativos" stroke={chart.palette[2]} fill="rgba(139,139,139,0.06)" strokeWidth={1.5} name="Ativos" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Despesas por categoria">
          {expenses.loading ? <QueryLoading /> : (
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={expenses.data} cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={2} dataKey="value" nameKey="name">
                  {expenses.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  const { type, text } = useThemeTokens();
  return (
    <h2 style={{ ...type.sectionTitle, color: text.label, margin: '0 0 10px 0' }}>{children}</h2>
  );
}

interface KpiDef {
  label: string; value: string; unit: string;
  series?: number[];
  drill?: { title: string; data: object[]; dataKey: string; color: string };
}

function KPI({ kpi, first, loading, onOpen }: { kpi: KpiDef; first: boolean; loading: boolean; onOpen: () => void }) {
  const { chart, text, surface } = useThemeTokens();
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

function Sparkline({ data, color }: { data: number[]; color?: string }) {
  const { chart } = useThemeTokens();
  const strokeColor = color ?? chart.seriesAlt;
  if (data.length < 2) return null;
  const w = 62, h = 18;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <polyline points={pts} fill="none" stroke={strokeColor} strokeWidth={1.25} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
