/**
 * RAVO OS — Métricas do mês
 * Painel com todas as métricas de um mês específico, aberto a partir do menu
 * de meses do header. Cada opção do menu abre o detalhe daquele mês, sem
 * depender da janela 3/6 meses do Dashboard.
 */

import { useMemo } from 'react';
import {
  ComposedChart, BarChart, Bar, Line, Cell, PieChart, Pie,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { ArrowDownRight, DollarSign, Target, Percent, Timer, Trophy, Users, TrendingUp } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { ChartTooltip } from '@/components/ChartTooltip';
import { ChartCard } from '@/components/ChartCard';
import { QueryError, QueryLoading } from '@/components/QueryState';
import { MetricCard } from '@/components/MetricCard';
import { useMRRData, useChurnData, useCustomerMetrics } from '@/hooks/useMetricsQueries';
import {
  useFinanceChartData, useContactsData, useContactsChartData,
  useExpensesData, useCashFlowData,
} from '@/hooks/usePagesQueries';
import { MonthKey, monthLabelLong, prevMonthKey } from '@/contexts/PeriodContext';
import { computeCrmMetrics } from '@/utils/crmMetrics';
import { monthSnapshot } from '@/utils/monthlyAnalysis';
import { fmtMoney, fmtK, pctChange } from '@/utils/format';
import { useThemeTokens } from '@/hooks/useThemeTokens';

export function MonthDetailPanel({ month, onClose }: {
  month: MonthKey | null;
  onClose: () => void;
}) {
  if (!month) return null;
  return <MonthDetailModal key={month} month={month} onClose={onClose} />;
}

function MonthDetailModal({ month, onClose }: { month: MonthKey; onClose: () => void }) {
  const { chart } = useThemeTokens();
  const REVENUE = chart.revenue;
  const LINE = chart.line;
  const AXIS = chart.axis;
  const finance = useFinanceChartData(month);
  const mrr = useMRRData(month);
  const churn = useChurnData(month);
  const metrics = useCustomerMetrics(month);
  const contacts = useContactsData();
  const contactsChart = useContactsChartData(month);
  const expenses = useExpensesData(month);
  const cashFlow = useCashFlowData(month);

  const snap = useMemo(
    () => monthSnapshot(finance.data, mrr.data, churn.data, contactsChart.data, month),
    [finance.data, mrr.data, churn.data, contactsChart.data, month]
  );

  const crm = useMemo(() => computeCrmMetrics(contacts.data, month), [contacts.data, month]);
  const crmPrev = useMemo(
    () => computeCrmMetrics(contacts.data, prevMonthKey(month)),
    [contacts.data, month]
  );
  const d = (cur: number, prev: number) => pctChange(cur, prev);

  const loading =
    finance.loading || mrr.loading || churn.loading || metrics.loading ||
    contacts.loading || contactsChart.loading;

  const activeCustomers = metrics.data['Active Customers'] ?? snap.current.ativos;
  const ltv = metrics.data['LTV'] ?? 0;
  const cac = metrics.data['CAC'] ?? 0;
  const ltvCac = cac > 0 ? (ltv / cac).toFixed(1) : '—';
  const prevLabel = snap.previous ? 'vs mês anterior' : 'sem base de comparação';

  return (
    <Modal isOpen onClose={onClose} title={`Métricas · ${monthLabelLong(month)}`} size="lg">
      {finance.error && <QueryError message={finance.error} onRetry={finance.refetch} />}
      {expenses.error && <QueryError message={expenses.error} onRetry={expenses.refetch} />}
      {cashFlow.error && <QueryError message={cashFlow.error} onRetry={cashFlow.refetch} />}

      {/* Financeiro */}
      <SectionTitle>Receitas × Investimentos</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <MetricCard label="Receita" value={fmtMoney(snap.current.receita)} icon={<DollarSign size={14} />}
          deltaPct={snap.deltas.receita} sublabel={prevLabel} loading={loading} />
        <MetricCard label="Investimento" value={fmtMoney(snap.current.despesa)} icon={<ArrowDownRight size={14} />}
          deltaPct={snap.deltas.despesa} invertDelta sublabel="despesas do mês" loading={loading} />
        <MetricCard label="Lucro" value={fmtMoney(snap.current.lucro)} icon={<TrendingUp size={14} />}
          deltaPct={snap.deltas.lucro} sublabel="receita − investimento" loading={loading} />
        <MetricCard label="Margem" value={`${snap.current.margem.toFixed(1)}%`} icon={<Percent size={14} />}
          progress={Math.max(0, snap.current.margem)}
          sublabel={snap.deltaMargem !== undefined ? `${snap.deltaMargem >= 0 ? '+' : ''}${snap.deltaMargem.toFixed(1)}pp` : prevLabel}
          loading={loading} />
      </div>

      {/* Recorrência e aquisição */}
      <SectionTitle>Recorrência</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <MetricCard label="MRR" value={fmtK(snap.current.mrr)} icon={<TrendingUp size={14} />}
          deltaPct={snap.deltas.mrr} sublabel="/mês" loading={loading} />
        <MetricCard label="ARR" value={fmtK(snap.current.arr)} icon={<TrendingUp size={14} />}
          deltaPct={snap.deltas.arr} sublabel="/ano" loading={loading} />
        <MetricCard label="Clientes ativos" value={String(activeCustomers.toFixed(0))} icon={<Users size={14} />}
          deltaPct={snap.deltas.ativos} sublabel="base do mês" loading={loading} />
        <MetricCard label="Novos leads" value={String(Math.round(snap.current.novos))} icon={<Target size={14} />}
          deltaPct={snap.deltas.novos} sublabel="entraram no funil" loading={loading} />
        <MetricCard label="Churn" value={`${snap.current.churn.toFixed(1)}%`} icon={<Percent size={14} />}
          deltaPct={snap.deltas.churn} invertDelta sublabel="clientes perdidos" loading={loading} />
        <MetricCard label="NRR" value={`${snap.current.nrr.toFixed(0)}%`} icon={<Percent size={14} />}
          deltaPct={snap.deltas.nrr} sublabel="receita líquida retida" loading={loading} />
        <MetricCard label="LTV / CAC" value={String(ltvCac)} icon={<Percent size={14} />}
          sublabel={cac > 0 ? 'eficiência de aquisição' : 'sem CAC calculado'} loading={loading} />
      </div>

      {/* Comercial */}
      <SectionTitle>Comercial</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <MetricCard label="Receita fechada" value={fmtMoney(crm.receitaGanha)} icon={<Trophy size={14} />}
          deltaPct={d(crm.receitaGanha, crmPrev.receitaGanha)} sublabel="deals ganhos no mês" loading={contacts.loading} />
        <MetricCard label="Pipeline aberto" value={fmtMoney(crm.pipelineAberto)} icon={<DollarSign size={14} />}
          deltaPct={d(crm.pipelineAberto, crmPrev.pipelineAberto)}
          sublabel={`${crm.abertos.length} ${crm.abertos.length === 1 ? 'deal' : 'deals'}`} loading={contacts.loading} />
        <MetricCard label="Win rate" value={`${crm.winRate}%`} icon={<Percent size={14} />}
          deltaPct={d(crm.winRate, crmPrev.winRate)}
          sublabel={`${crm.ganhos.length}G / ${crm.perdidos.length}P`} loading={contacts.loading} />
        <MetricCard label="Ciclo de venda" value={`${crm.cicloMedio}d`} icon={<Timer size={14} />}
          deltaPct={d(crm.cicloMedio, crmPrev.cicloMedio)} invertDelta
          sublabel="lead → fechamento" loading={contacts.loading} />
      </div>

      {/* Gráficos do mês */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <ChartCard title="Receita, Investimento e Lucro" subtitle="janela até o mês selecionado">
          {finance.loading ? <QueryLoading height={200} /> : (
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={finance.data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                <XAxis dataKey="mes" stroke={AXIS} tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
                <YAxis stroke={AXIS} tickLine={false} axisLine={false} style={{ fontSize: '11px' }} tickFormatter={fmtK} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="receita" name="Receita" radius={[3, 3, 0, 0]} barSize={16}>
                  {finance.data.map((_, i) => (
                    <Cell key={i} fill={i === finance.data.length - 1 ? REVENUE : `${REVENUE}59`} />
                  ))}
                </Bar>
                <Bar dataKey="despesa" name="Investimento" fill={LINE} radius={[3, 3, 0, 0]} barSize={16} />
                <Line type="monotone" dataKey="lucro" name="Lucro" stroke={chart.light} strokeWidth={1.75} dot={{ r: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Fluxo de caixa do mês" subtitle="entradas × saídas">
          {cashFlow.loading ? <QueryLoading height={200} /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cashFlow.data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <XAxis dataKey="semana" stroke={AXIS} tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
                <YAxis stroke={AXIS} tickLine={false} axisLine={false} style={{ fontSize: '11px' }} tickFormatter={fmtK} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="entradas" name="Entradas" fill={REVENUE} radius={[2, 2, 0, 0]} barSize={10} />
                <Bar dataKey="saidas" name="Saídas" fill={LINE} radius={[2, 2, 0, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Despesas por categoria" subtitle={monthLabelLong(month)}>
          {expenses.loading ? <QueryLoading height={200} /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={expenses.data} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2} dataKey="value" nameKey="name">
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
    </Modal>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  const { type, text } = useThemeTokens();
  return (
    <h3 style={{ ...type.sectionTitle, color: text.label, margin: '0 0 10px 0' }}>{children}</h3>
  );
}
