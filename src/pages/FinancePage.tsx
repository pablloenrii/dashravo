/**
 * RAVO OS — Finance (dados reais do Supabase)
 * 4 KPIs + 3 gráficos
 */

import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Percent, Wallet } from 'lucide-react';
import { ChartTooltip } from '@/components/ChartTooltip';
import { QueryError, QueryLoading } from '@/components/QueryState';
import { useFinanceChartData, useCashFlowData, useExpensesData } from '@/hooks/usePagesQueries';

const fmtK = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v.toFixed(0));

export default function FinancePage() {
  const finance = useFinanceChartData();
  const cashFlow = useCashFlowData();
  const expenses = useExpensesData();

  const totalRevenue = finance.data.reduce((sum, m) => sum + m.receita, 0);
  const totalExpensesVal = finance.data.reduce((sum, m) => sum + m.despesa, 0);
  const profit = totalRevenue - totalExpensesVal;
  const margin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : '0';
  const cash = cashFlow.data.reduce((sum, w) => sum + w.entradas - w.saidas, 0);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#F5F5F7', margin: '0 0 8px 0' }}>Financeiro</h1>
        <p style={{ fontSize: '14px', color: '#9CA3AF', margin: 0 }}>Controle de receitas, despesas e fluxo de caixa</p>
      </div>

      {/* Erros */}
      {finance.error && <QueryError message={finance.error} onRetry={finance.refetch} />}
      {cashFlow.error && <QueryError message={cashFlow.error} onRetry={cashFlow.refetch} />}
      {expenses.error && <QueryError message={expenses.error} onRetry={expenses.refetch} />}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '32px' }}>
        <KPICard title="Receita (6m)" value={finance.loading ? '…' : fmtK(totalRevenue)} unit="" color="#FF6200" icon={<DollarSign size={20} />} />
        <KPICard title="Lucro (6m)" value={finance.loading ? '…' : fmtK(profit)} unit="" color="#10B981" icon={<TrendingUp size={20} />} />
        <KPICard title="Margem" value={finance.loading ? '…' : margin} unit="%" color="#FF6200" icon={<Percent size={20} />} />
        <KPICard title="Caixa (4 sem)" value={cashFlow.loading ? '…' : fmtK(cash)} unit="" color="#10B981" icon={<Wallet size={20} />} />
      </div>

      {/* Gráfico principal — Receita vs Despesa */}
      <div style={{ background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 12px 0' }}>Receita vs Despesa</h3>
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
      </div>

      {/* Gráficos secundários */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 12px 0' }}>Fluxo de Caixa Semanal</h3>
          {cashFlow.loading ? (
            <QueryLoading />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cashFlow.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="semana" stroke="#86868B" style={{ fontSize: '11px' }} />
                <YAxis stroke="#86868B" style={{ fontSize: '11px' }} tickFormatter={fmtK} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="entradas" fill="#10B981" radius={[4, 4, 0, 0]} name="Entradas" />
                <Bar dataKey="saidas" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 12px 0' }}>Despesas por Categoria</h3>
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
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, unit, color, icon }: { title: string; value: string; unit: string; color: string; icon: React.ReactNode }) {
  return (
    <div style={{
      background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)', borderLeft: `3px solid ${color}`,
      borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color }}>
        {icon}
        <span style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF' }}>{title}</span>
      </div>
      <div style={{ fontSize: '28px', fontWeight: '700', color: '#F5F5F7' }}>
        {value}
        {unit && <span style={{ fontSize: '14px', color: '#9CA3AF', marginLeft: '4px' }}>{unit}</span>}
      </div>
    </div>
  );
}
