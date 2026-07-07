import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Percent, AlertCircle } from 'lucide-react';
import { KPICardMinimal } from '@/components/KPICardMinimal';
import { Badge } from '@/components/Badge';
import { ChartTooltip } from '@/components/ChartTooltip';
import { colorSystem } from '@/styles/color-system';

const dadosReceita = [
  { mês: 'Jan', receita: 125000, despesa: 85000, lucro: 40000 },
  { mês: 'Fev', receita: 118000, despesa: 82000, lucro: 36000 },
  { mês: 'Mar', receita: 145000, despesa: 88000, lucro: 57000 },
  { mês: 'Abr', receita: 168000, despesa: 92000, lucro: 76000 },
  { mês: 'Mai', receita: 185000, despesa: 95000, lucro: 90000 },
  { mês: 'Jun', receita: 215000, despesa: 98000, lucro: 117000 },
];

const dadosFluxo = [
  { semana: 'Sem 1', entradas: 45000, saídas: 28000 },
  { semana: 'Sem 2', entradas: 52000, saídas: 31000 },
  { semana: 'Sem 3', entradas: 38000, saídas: 24000 },
  { semana: 'Sem 4', entradas: 61000, saídas: 35000 },
];

const despesas = [
  { categoria: 'Pessoal', valor: 45000, percentual: 45 },
  { categoria: 'Infraestrutura', valor: 25000, percentual: 25 },
  { categoria: 'Marketing', valor: 18000, percentual: 18 },
  { categoria: 'Outros', valor: 12000, percentual: 12 },
];

export function FinancePage() {
  return (
    <div style={{ padding: '16px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#F5F5F7', margin: 0 }}>
              Financeiro - Análise Fiscal
            </h1>
            <Badge variant="default">REVENUE</Badge>
          </div>
          <p style={{ fontSize: '12px', color: '#A1A1A6', margin: 0 }}>
            Controle de receitas, despesas e fluxo de caixa
          </p>
        </div>
        <div style={{ fontSize: '32px', opacity: 0.1 }}>💰</div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '16px' }}>
        <KPICardMinimal title="Receita Mês" value="R$ 215K" unit="junho" icon={<DollarSign />} color={colorSystem.revenue.primary} trend={{ direction: 'up', percentage: 16 }} />
        <KPICardMinimal title="Lucro Líquido" value="R$ 117K" unit="este mês" icon={<TrendingUp />} color={colorSystem.success} trend={{ direction: 'up', percentage: 30 }} />
        <KPICardMinimal title="Margem Lucro" value="54.4%" unit="do faturamento" icon={<Percent />} color={colorSystem.conversion.primary} trend={{ direction: 'up', percentage: 8 }} />
        <KPICardMinimal title="Caixa Disponível" value="R$ 324K" unit="saldo" icon={<AlertCircle />} color={colorSystem.automation.primary} trend={{ direction: 'up', percentage: 5 }} />
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div style={{ background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 8px 0' }}>Receita vs Despesa</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dadosReceita}>
              <defs>
                <linearGradient id="colorReceita2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colorSystem.revenue.primary} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={colorSystem.revenue.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="mês" stroke="#86868B" style={{ fontSize: '11px' }} />
              <YAxis stroke="#86868B" style={{ fontSize: '11px' }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Area type="monotone" dataKey="receita" stroke={colorSystem.revenue.primary} fillOpacity={1} fill="url(#colorReceita2)" />
              <Area type="monotone" dataKey="despesa" stroke={colorSystem.automation.primary} fill="none" />
              <Area type="monotone" dataKey="lucro" stroke={colorSystem.success} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 8px 0' }}>Fluxo de Caixa</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dadosFluxo}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="semana" stroke="#86868B" style={{ fontSize: '11px' }} />
              <YAxis stroke="#86868B" style={{ fontSize: '11px' }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="entradas" fill={colorSystem.success} radius={[4, 4, 0, 0]} />
              <Bar dataKey="saídas" fill={colorSystem.automation.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resumo Despesas */}
      <div style={{ background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 8px 0' }}>Distribuição de Despesas</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {despesas.map((item, idx) => (
            <div key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#A1A1A6' }}>{item.categoria}</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#F5F5F7' }}>R$ {(item.valor / 1000).toFixed(0)}K</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${item.percentual}%`, height: '100%', background: colorSystem.revenue.primary }} />
              </div>
              <span style={{ fontSize: '10px', color: '#86868B' }}>{item.percentual}% do orçamento</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FinancePage;
