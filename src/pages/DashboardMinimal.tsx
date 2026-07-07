import { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Zap, Target, Eye, Percent } from 'lucide-react';
import { KPICardMinimal } from '@/components/KPICardMinimal';
import { Badge } from '@/components/Badge';
import { Tabs } from '@/components/Tabs';
import { ChartTooltip, ChartGradients } from '@/components/ChartTooltip';
import { colorSystemPremium } from '@/styles/color-system-premium';
import { colorSystem, metricTypes } from '@/styles/color-system';

// Dados
const dadosReceita = [
  { mês: 'Jan', receita: 4200, meta: 4000 },
  { mês: 'Fev', receita: 3800, meta: 4000 },
  { mês: 'Mar', receita: 4800, meta: 4200 },
  { mês: 'Abr', receita: 5200, meta: 4500 },
  { mês: 'Mai', receita: 6100, meta: 5000 },
  { mês: 'Jun', receita: 7200, meta: 5500 },
];

const dadosPipeline = [
  { estágio: 'Prospecção', quantidade: 450 },
  { estágio: 'Qualificado', quantidade: 240 },
  { estágio: 'Proposta', quantidade: 120 },
  { estágio: 'Fechado', quantidade: 85 },
];

const dadosConversao = [
  { nome: 'Prospecção', valor: 450, fill: colorSystemPremium.data.blue },
  { nome: 'Qualificado', valor: 240, fill: colorSystemPremium.data.cyan },
  { nome: 'Proposta', valor: 120, fill: colorSystemPremium.data.orange },
  { nome: 'Fechado', valor: 85, fill: colorSystemPremium.semantic.success },
];

const dadosAtividade = [
  { hora: '08:00', ligações: 12, emails: 8, reuniões: 2 },
  { hora: '10:00', ligações: 18, emails: 14, reuniões: 4 },
  { hora: '12:00', ligações: 22, emails: 19, reuniões: 5 },
  { hora: '14:00', ligações: 28, emails: 25, reuniões: 6 },
  { hora: '16:00', ligações: 24, emails: 21, reuniões: 4 },
];

const leadsRecentes = [
  { nome: 'Acme Corp', valor: 45000, status: 'qualificado', dias: '2 dias atrás' },
  { nome: 'TechStart', valor: 28000, status: 'proposta', dias: '4 horas atrás' },
  { nome: 'WebFlow', valor: 12000, status: 'contatado', dias: '1 semana atrás' },
  { nome: 'CloudSys', valor: 56000, status: 'qualificado', dias: '3 dias atrás' },
  { nome: 'DataCore', valor: 18000, status: 'contatado', dias: '2 semanas atrás' },
];

export function DashboardMinimal() {
  return (
    <div style={{
      padding: '16px',
      maxWidth: '1400px',
      margin: '0 auto',
      width: '100%'
    }}>
      {/* Cabeçalho */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#F5F5F7', margin: 0 }}>
              Painel de Controle
            </h1>
            <Badge variant="default">RAVO</Badge>
          </div>
          <p style={{ fontSize: '12px', color: '#A1A1A6', margin: 0 }}>
            Métricas em tempo real e desempenho operacional
          </p>
        </div>
        <div style={{ fontSize: '32px', opacity: 0.1 }}>📊</div>
      </div>

      {/* ===== KPIs (Linha Compacta) ===== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px',
          marginBottom: '16px',
        }}
      >
        <KPICardMinimal
          title="Receita"
          value="R$ 124K"
          unit="este mês"
          icon={<DollarSign style={{ width: '14px', height: '14px' }} />}
          trend={{ direction: 'up', percentage: 12 }}
          color={colorSystemPremium.data.orange}
        />
        <KPICardMinimal
          title="Clientes"
          value="234"
          unit="ativos"
          icon={<Users style={{ width: '14px', height: '14px' }} />}
          trend={{ direction: 'up', percentage: 8 }}
          color={colorSystemPremium.data.cyan}
        />
        <KPICardMinimal
          title="Conversão"
          value="23.4%"
          unit="este mês"
          icon={<Percent style={{ width: '14px', height: '14px' }} />}
          trend={{ direction: 'up', percentage: 3 }}
          color={colorSystemPremium.data.purple}
        />
        <KPICardMinimal
          title="Online"
          value="1,234"
          unit="conectados"
          icon={<Eye style={{ width: '14px', height: '14px' }} />}
          trend={{ direction: 'up', percentage: 15 }}
          color={colorSystemPremium.data.blue}
        />
        <KPICardMinimal
          title="Pipeline"
          value="R$ 892K"
          unit="valor total"
          icon={<Target style={{ width: '14px', height: '14px' }} />}
          trend={{ direction: 'up', percentage: 22 }}
          color={colorSystemPremium.data.blue}
        />
        <KPICardMinimal
          title="Automações"
          value="3,456"
          unit="esta semana"
          icon={<Zap style={{ width: '14px', height: '14px' }} />}
          trend={{ direction: 'up', percentage: 45 }}
          color={colorSystemPremium.data.amber}
        />
      </div>

      {/* ===== GRÁFICOS PRINCIPAIS ===== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        {/* Gráfico de Receita - GRANDE */}
        <div
          style={{
            background: 'rgba(11, 14, 25, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            padding: '14px',
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#EBEBF0', margin: '0 0 12px 0' }}>
            Tendência de Receita
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dadosReceita}>
              <defs>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colorSystemPremium.data.orange} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={colorSystemPremium.data.orange} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="mês" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Area
                type="monotone"
                dataKey="receita"
                stroke={colorSystemPremium.data.orange}
                fillOpacity={1}
                fill="url(#colorReceita)"
                strokeWidth={2}
              />
              <Line type="monotone" dataKey="meta" stroke="#6B7280" strokeDasharray="4 4" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Atividade */}
        <div
          style={{
            background: '#0B0E19',
            border: '0.5px solid rgba(255,255,255,0.04)',
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 8px 0' }}>
            Atividades
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dadosAtividade}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="hora" stroke="#86868B" style={{ fontSize: '11px' }} />
              <YAxis stroke="#86868B" style={{ fontSize: '11px' }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#A1A1A6' }} />
              <Line type="monotone" dataKey="ligações" stroke={colorSystemPremium.data.orange} dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="emails" stroke={colorSystemPremium.data.cyan} dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="reuniões" stroke={colorSystemPremium.semantic.success} dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== GRÁFICOS SECUNDÁRIOS ===== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        {/* Distribuição do Pipeline */}
        <div
          style={{
            background: '#0B0E19',
            border: '0.5px solid rgba(255,255,255,0.04)',
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 8px 0' }}>
            Pipeline
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={dadosConversao}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="valor"
              >
                {dadosConversao.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Funil de Conversão */}
        <div
          style={{
            background: '#0B0E19',
            border: '0.5px solid rgba(255,255,255,0.04)',
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 8px 0' }}>
            Funil de Vendas
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dadosPipeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="estágio" stroke="#86868B" style={{ fontSize: '10px' }} />
              <YAxis stroke="#86868B" style={{ fontSize: '10px' }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="quantidade" fill={colorSystem.pipeline.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tabela de Leads Recentes */}
        <div
          style={{
            background: '#0B0E19',
            border: '0.5px solid rgba(255,255,255,0.04)',
            borderRadius: '8px',
            padding: '12px',
            overflow: 'auto',
          }}
        >
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 8px 0' }}>
            Leads Recentes
          </h3>
          <table style={{ width: '100%', fontSize: '11px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', color: '#A1A1A6', fontWeight: '600', paddingBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  Nome
                </th>
                <th style={{ textAlign: 'right', color: '#A1A1A6', fontWeight: '600', paddingBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  Valor
                </th>
                <th style={{ textAlign: 'center', color: '#A1A1A6', fontWeight: '600', paddingBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {leadsRecentes.map((lead, idx) => (
                <tr key={idx}>
                  <td style={{ paddingTop: '4px', paddingBottom: '4px', color: '#F5F5F7', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    {lead.nome}
                  </td>
                  <td style={{ textAlign: 'right', paddingTop: '4px', paddingBottom: '4px', color: colorSystem.revenue.primary, borderBottom: '1px solid rgba(255,255,255,0.03)', fontWeight: '600' }}>
                    R$ {(lead.valor / 1000).toFixed(0)}K
                  </td>
                  <td style={{ textAlign: 'center', paddingTop: '4px', paddingBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background:
                          lead.status === 'qualificado'
                            ? 'rgba(52, 199, 89, 0.1)'
                            : lead.status === 'proposta'
                              ? 'rgba(255, 149, 0, 0.1)'
                              : 'rgba(161, 161, 166, 0.1)',
                        color:
                          lead.status === 'qualificado'
                            ? colorSystem.success
                            : lead.status === 'proposta'
                              ? colorSystem.automation.primary
                              : '#A1A1A6',
                      }}
                    >
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MÉTRICAS-CHAVE RESUMIDAS ===== */}
      <div
        style={{
          background: '#0A0E1A',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '8px',
          padding: '12px',
        }}
      >
        <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 8px 0' }}>
          Métricas-Chave
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            fontSize: '12px',
          }}
        >
          <div>
            <p style={{ color: '#A1A1A6', margin: '0 0 4px 0' }}>Ticket Médio</p>
            <p style={{ fontSize: '16px', fontWeight: '700', color: colorSystem.revenue.primary, margin: 0 }}>
              R$ 24,5K
            </p>
          </div>
          <div>
            <p style={{ color: '#A1A1A6', margin: '0 0 4px 0' }}>Taxa de Ganho</p>
            <p style={{ fontSize: '16px', fontWeight: '700', color: colorSystem.success, margin: 0 }}>
              18.9%
            </p>
          </div>
          <div>
            <p style={{ color: '#A1A1A6', margin: '0 0 4px 0' }}>Ciclo de Vendas</p>
            <p style={{ fontSize: '16px', fontWeight: '700', color: colorSystem.customers.primary, margin: 0 }}>
              23 dias
            </p>
          </div>
          <div>
            <p style={{ color: '#A1A1A6', margin: '0 0 4px 0' }}>Saúde Pipeline</p>
            <p style={{ fontSize: '16px', fontWeight: '700', color: colorSystem.success, margin: 0 }}>
              98%
            </p>
          </div>
          <div>
            <p style={{ color: '#A1A1A6', margin: '0 0 4px 0' }}>Precisão Previsão</p>
            <p style={{ fontSize: '16px', fontWeight: '700', color: colorSystem.conversion.primary, margin: 0 }}>
              92%
            </p>
          </div>
          <div>
            <p style={{ color: '#A1A1A6', margin: '0 0 4px 0' }}>Capacidade Time</p>
            <p style={{ fontSize: '16px', fontWeight: '700', color: colorSystem.automation.primary, margin: 0 }}>
              78%
            </p>
          </div>
        </div>
      </div>

      {/* Exemplo de Tabs */}
      <div style={{ marginTop: '24px', background: '#0B0E19', border: '0.5px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#EBEBF0', margin: '0 0 16px 0' }}>
          Visões de Análise
        </h3>
        <Tabs
          tabs={[
            {
              id: 'resumo',
              label: 'Resumo Executivo',
              content: <p style={{ color: '#9CA3AF' }}>Visão geral do mês com KPIs principais</p>,
            },
            {
              id: 'detalhado',
              label: 'Análise Detalhada',
              content: <p style={{ color: '#9CA3AF' }}>Breakdown completo por departamento e região</p>,
            },
            {
              id: 'previsao',
              label: 'Projeções',
              content: <p style={{ color: '#9CA3AF' }}>Forecasts para os próximos trimestres baseado em histórico</p>,
            },
          ]}
          defaultTab="resumo"
        />
      </div>
    </div>
  );
}

export default DashboardMinimal;
