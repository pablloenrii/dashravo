/**
 * RAVO OS — Finance (dados reais do Supabase)
 * 4 KPIs + 3 gráficos
 */

import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Percent, Wallet } from 'lucide-react';
import { useMemo } from 'react';
import { ChartTooltip } from '@/components/ChartTooltip';
import { ChartCard } from '@/components/ChartCard';
import { QueryError, QueryLoading } from '@/components/QueryState';
import { MetricCard } from '@/components/MetricCard';
import { useFinanceChartData, useCashFlowData, useExpensesData } from '@/hooks/usePagesQueries';
import { usePeriod, prevMonthKey, monthLabel, toMonthKey } from '@/contexts/PeriodContext';
import { fmtK, fmtMoney, pctChange } from '@/utils/format';
import { useThemeTokens } from '@/hooks/useThemeTokens';

export default function FinancePage() {
  const { chart, layout, text } = useThemeTokens();
  const { effectiveMonth, isAllTime, label: periodLabel, month } = usePeriod();

  const finance = useFinanceChartData(month);
  const cashFlow = useCashFlowData(month);
  const expenses = useExpensesData(month);
  // Janela ampla (5 anos) pra cobrir "Todo o período" e a comparação mês
  // anterior — mesma RPC do gráfico de 6 meses (get_revenue_by_month), só
  // com months_back maior. Substitui a antiga useReceitasRawData, que
  // fazia `receitas.select('*').order('mes')` direto na tabela — coluna
  // que não existe (é `data_receita`); ver migration_fix_finance_rpcs.sql.
  const receitas = useFinanceChartData(month, 60);

  // KPIs do mês selecionado (dados brutos preservam o mês/ano exato)
  const somaMes = useMemo(() => {
    const soma = (mk: string) => receitas.data
      .filter((r) => r.mes && toMonthKey(new Date(r.mes)) === mk)
      .reduce((acc, r) => ({
        receita: acc.receita + r.receita,
        despesa: acc.despesa + r.despesa,
      }), { receita: 0, despesa: 0 });

    if (isAllTime) {
      const tudo = receitas.data.reduce((acc, r) => ({
        receita: acc.receita + r.receita, despesa: acc.despesa + r.despesa,
      }), { receita: 0, despesa: 0 });
      return { atual: tudo, anterior: null as null | { receita: number; despesa: number } };
    }
    return { atual: soma(effectiveMonth), anterior: soma(prevMonthKey(effectiveMonth)) };
  }, [receitas.data, effectiveMonth, isAllTime]);

  const receitaMes = somaMes.atual.receita;
  const despesaMes = somaMes.atual.despesa;
  const lucroMes = receitaMes - despesaMes;
  const margemMes = receitaMes > 0 ? (lucroMes / receitaMes) * 100 : 0;

  const ant = somaMes.anterior;
  const lucroAnt = ant ? ant.receita - ant.despesa : 0;
  const d = (cur: number, prev: number) => (isAllTime || !ant ? undefined : pctChange(cur, prev));
  const vsLabel = isAllTime ? 'acumulado' : `vs ${monthLabel(prevMonthKey(effectiveMonth))}`;

  const totalRevenue = finance.data.reduce((sum, m) => sum + m.receita, 0);
  const totalExpensesVal = finance.data.reduce((sum, m) => sum + m.despesa, 0);
  const profit = totalRevenue - totalExpensesVal;
  const cash = cashFlow.data.reduce((sum, w) => sum + w.entradas - w.saidas, 0);

  return (
    <div style={{ maxWidth: layout.pageMaxWidth, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em', color: text.primary, margin: '0 0 4px 0' }}>Financeiro</h1>
        <p style={{ fontSize: '14px', color: text.secondary, margin: 0 }}>
          {periodLabel} · receitas, despesas e fluxo de caixa
        </p>
      </div>

      {/* Erros */}
      {finance.error && <QueryError message={finance.error} onRetry={finance.refetch} />}
      {receitas.error && <QueryError message={receitas.error} onRetry={receitas.refetch} />}
      {cashFlow.error && <QueryError message={cashFlow.error} onRetry={cashFlow.refetch} />}
      {expenses.error && <QueryError message={expenses.error} onRetry={expenses.refetch} />}

      {/* KPIs do período */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <MetricCard label="Receita" value={fmtMoney(receitaMes)} icon={<DollarSign size={14} />}
          deltaPct={d(receitaMes, ant?.receita ?? 0)} sublabel={vsLabel} loading={receitas.loading} />
        <MetricCard label="Despesa" value={fmtMoney(despesaMes)} icon={<Wallet size={14} />}
          deltaPct={d(despesaMes, ant?.despesa ?? 0)} invertDelta sublabel={vsLabel} loading={receitas.loading} />
        <MetricCard label="Lucro" value={fmtMoney(lucroMes)} icon={<TrendingUp size={14} />}
          deltaPct={d(lucroMes, lucroAnt)} sublabel={vsLabel} loading={receitas.loading} />
        <MetricCard label="Margem" value={`${margemMes.toFixed(1)}%`} icon={<Percent size={14} />}
          progress={margemMes} sublabel="lucro / receita" loading={receitas.loading} />
      </div>

      {/* Contexto histórico (6 meses) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <MetricCard label="Receita (6m)" value={fmtK(totalRevenue)} unit="acumulado" valueColor={chart.revenue} icon={<DollarSign size={14} />} sublabel="últimos 6 meses" loading={finance.loading} />
        <MetricCard label="Lucro (6m)" value={fmtK(profit)} unit="acumulado" valueColor={chart.light} icon={<TrendingUp size={14} />} sublabel="últimos 6 meses" loading={finance.loading} />
        <MetricCard label="Caixa (4 sem)" value={fmtK(cash)} valueColor={chart.revenue} icon={<Wallet size={14} />} sublabel="últimas 4 semanas" loading={cashFlow.loading} />
      </div>

      {/* Gráfico principal — Receita vs Despesa */}
      <div style={{ marginBottom: '16px' }}>
        <ChartCard title="Receita vs Despesa">
          {finance.loading ? (
            <QueryLoading />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={finance.data}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                <XAxis dataKey="mes" stroke={chart.axisAlt} style={{ fontSize: '11px' }} />
                <YAxis stroke={chart.axisAlt} style={{ fontSize: '11px' }} tickFormatter={fmtK} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Area type="monotone" dataKey="receita" stroke={chart.revenue} fill="rgba(63,185,80,0.08)" strokeWidth={1.75} name="Receita" />
                <Area type="monotone" dataKey="despesa" stroke={chart.line} fill="rgba(139,139,139,0.08)" strokeWidth={1.75} name="Despesa" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Gráficos secundários */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <ChartCard title="Fluxo de Caixa Semanal">
          {cashFlow.loading ? (
            <QueryLoading />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cashFlow.data}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                <XAxis dataKey="semana" stroke={chart.axisAlt} style={{ fontSize: '11px' }} />
                <YAxis stroke={chart.axisAlt} style={{ fontSize: '11px' }} tickFormatter={fmtK} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="entradas" fill={chart.revenue} radius={[2, 2, 0, 0]} name="Entradas" barSize={14} />
                <Bar dataKey="saidas" fill={chart.line} radius={[2, 2, 0, 0]} name="Saídas" barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Despesas por Categoria">
          {expenses.loading ? (
            <QueryLoading />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={expenses.data} cx="50%" cy="50%" innerRadius={50} outerRadius={100} paddingAngle={2} dataKey="value" nameKey="name">
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
    </div>
  );
}
