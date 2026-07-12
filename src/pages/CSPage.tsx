import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MessageSquare, BarChart3, TrendingUp, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { KPICardMinimal } from '@/components/KPICardMinimal';
import { Badge } from '@/components/Badge';
import { Alert } from '@/components/Alert';
import { Skeleton } from '@/components/Skeleton';
import { Table, TableColumn } from '@/components/Table';
import { ChartTooltip } from '@/components/ChartTooltip';
import { colorSystem } from '@/styles/color-system';
import { colorSystemPremium } from '@/styles/color-system-premium';

const dadosAtendimentos = [
  { dia: 'Segunda', recebidos: 145, resolvidos: 142, pendentes: 3 },
  { dia: 'Terça', recebidos: 168, resolvidos: 165, pendentes: 3 },
  { dia: 'Quarta', recebidos: 152, resolvidos: 151, pendentes: 1 },
  { dia: 'Quinta', recebidos: 178, resolvidos: 175, pendentes: 3 },
  { dia: 'Sexta', recebidos: 195, resolvidos: 192, pendentes: 3 },
];

const dadosSatisfacao = [
  { semana: 'Sem 1', nps: 68, satisfacao: 85 },
  { semana: 'Sem 2', nps: 72, satisfacao: 87 },
  { semana: 'Sem 3', nps: 75, satisfacao: 89 },
  { semana: 'Sem 4', nps: 78, satisfacao: 91 },
];

const tickets = [
  { ticketId: '#TKT-2451', cliente: 'Acme Corp', assunto: 'Erro na integração', prioridade: 'alta', tempo: '2h 15m' },
  { ticketId: '#TKT-2450', cliente: 'TechStart', assunto: 'Fatura em duplicata', prioridade: 'média', tempo: '1h 30m' },
  { ticketId: '#TKT-2449', cliente: 'WebFlow', assunto: 'Reset de senha', prioridade: 'baixa', tempo: '45m' },
  { ticketId: '#TKT-2448', cliente: 'CloudSys', assunto: 'Dúvida sobre recurso', prioridade: 'baixa', tempo: '1h 10m' },
  { ticketId: '#TKT-2447', cliente: 'DataCore', assunto: 'Upgrade de plano', prioridade: 'média', tempo: '3h 20m' },
  { ticketId: '#TKT-2446', cliente: 'SoftWare Inc', assunto: 'API timeout', prioridade: 'alta', tempo: '1h 45m' },
];

const getPrioridadeColor = (prioridade: string) => {
  switch (prioridade) {
    case 'alta':
      return { bg: 'rgba(255, 59, 48, 0.1)', text: colorSystem.danger };
    case 'média':
      return { bg: 'rgba(255, 149, 0, 0.1)', text: colorSystem.automation.primary };
    default:
      return { bg: 'rgba(52, 199, 89, 0.1)', text: colorSystem.success };
  }
};

export function CSPage() {
  const [showAlert, setShowAlert] = useState(true);
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ padding: '16px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Alerts */}
      <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {showAlert && (
          <Alert
            type="warning"
            title="Atenção"
            message="Existem 3 tickets em espera há mais de 2 horas"
            icon={<AlertCircle size={16} />}
            onClose={() => setShowAlert(false)}
          />
        )}
        <Alert
          type="success"
          title="Atualização"
          message="NPS Score atingiu 78 esta semana - recorde histórico!"
          onClose={() => {}}
        />
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#F5F5F7', margin: 0 }}>
              Atendimento ao Cliente
            </h1>
            <Badge variant="info">SUPORTE</Badge>
          </div>
          <p style={{ fontSize: '12px', color: '#A1A1A6', margin: 0 }}>
            Gestão de tickets, satisfação e relacionamento
          </p>
        </div>
        <div style={{ fontSize: '32px', opacity: 0.1 }}>💬</div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '16px' }}>
        <KPICardMinimal title="Tickets Recebidos" value="838" unit="este mês" icon={<MessageSquare />} color={colorSystem.customers.primary} trend={{ direction: 'up', percentage: 12 }} />
        <KPICardMinimal title="Taxa de Resolução" value="99.6%" unit="resolvidos" icon={<TrendingUp />} color={colorSystem.success} trend={{ direction: 'up', percentage: 2 }} />
        <KPICardMinimal title="NPS Score" value="78" unit="este mês" icon={<BarChart3 />} color={colorSystem.conversion.primary} trend={{ direction: 'up', percentage: 5 }} />
        <KPICardMinimal title="Tempo Médio" value="1h 30m" unit="por ticket" icon={<Clock />} color={colorSystem.automation.primary} trend={{ direction: 'down', percentage: 8 }} />
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div style={{ background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 8px 0' }}>Atendimentos Diários</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dadosAtendimentos}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="dia" stroke="#86868B" style={{ fontSize: '11px' }} />
              <YAxis stroke="#86868B" style={{ fontSize: '11px' }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="recebidos" fill={colorSystem.customers.primary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolvidos" fill={colorSystem.success} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 8px 0' }}>Satisfação</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dadosSatisfacao}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="semana" stroke="#86868B" style={{ fontSize: '11px' }} />
              <YAxis stroke="#86868B" style={{ fontSize: '11px' }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Line type="monotone" dataKey="nps" stroke={colorSystem.conversion.primary} dot={false} />
              <Line type="monotone" dataKey="satisfacao" stroke={colorSystem.success} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tickets Premium */}
      <div style={{ marginTop: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#EBEBF0', margin: '0 0 12px 0' }}>
          Tickets em Aberto
        </h3>
        <Table<typeof tickets[0]>
          columns={[
            {
              key: 'ticketId',
              label: 'ID',
              sortable: true,
              width: '15%',
              render: (value) => (
                <span style={{ color: colorSystemPremium.data.blue, fontWeight: '600' }}>
                  {value}
                </span>
              ),
            },
            {
              key: 'cliente',
              label: 'Cliente',
              sortable: true,
              width: '25%',
            },
            {
              key: 'assunto',
              label: 'Assunto',
              sortable: true,
              width: '30%',
            },
            {
              key: 'prioridade',
              label: 'Prioridade',
              sortable: true,
              align: 'center',
              render: (value) => (
                <Badge variant={
                  value === 'alta' ? 'danger' :
                  value === 'média' ? 'warning' :
                  'success'
                }>
                  {value}
                </Badge>
              ),
            },
            {
              key: 'tempo',
              label: 'Tempo',
              sortable: true,
              align: 'right',
              render: (value) => (
                <span style={{ color: '#9CA3AF', fontSize: '12px' }}>
                  {value}
                </span>
              ),
            },
          ]}
          data={tickets}
          selectable={true}
          paginated={true}
          pageSize={5}
          hoverable={true}
          striped={true}
        />
      </div>
    </div>
  );
}

export default CSPage;
