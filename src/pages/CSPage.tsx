import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MessageSquare, BarChart3, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { KPICardMinimal } from '@/components/KPICardMinimal';
import { Badge } from '@/components/Badge';
import { Alert } from '@/components/Alert';
import { Table } from '@/components/Table';
import { ChartTooltip } from '@/components/ChartTooltip';
import { colorSystem } from '@/styles/color-system';
import { colorSystemPremium } from '@/styles/color-system-premium';
import { useTicketsData, useAttendanceChartData, useSatisfactionData } from '@/hooks/usePagesQueries';

export function CSPage() {
  const [showAlert, setShowAlert] = useState(true);

  // Fetch data from Supabase
  const { data: tickets, loading: loadingTickets, error: errorTickets } = useTicketsData();
  const { data: dadosAtendimentos, loading: loadingAttendance, error: errorAttendance } = useAttendanceChartData();
  const { data: dadosSatisfacao, loading: loadingSatisfaction, error: errorSatisfaction } = useSatisfactionData();

  // Show error state
  if (errorTickets || errorAttendance || errorSatisfaction) {
    return (
      <div style={{ padding: '16px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          color: '#FF6B6B',
          fontSize: '14px',
          background: 'rgba(255, 107, 107, 0.1)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 107, 107, 0.2)',
          marginBottom: '16px'
        }}>
          Erro ao carregar dados de atendimento: {errorTickets || errorAttendance || errorSatisfaction}
        </div>
      </div>
    );
  }

  // Show loading state
  if (loadingTickets || loadingAttendance || loadingSatisfaction) {
    return (
      <div style={{
        padding: '16px',
        textAlign: 'center',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: '#A1A1A6', fontSize: '14px' }}>
          ⏳ Carregando dados de atendimento...
        </div>
      </div>
    );
  }

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
        <KPICardMinimal title="Tickets Recebidos" value={dadosAtendimentos.reduce((sum, a) => sum + (a.recebidos || 0), 0)} unit="tickets" icon={<MessageSquare />} color={colorSystem.customers.primary} />
        <KPICardMinimal title="Taxa de Resolução" value={dadosAtendimentos.length > 0 ? ((dadosAtendimentos.reduce((sum, a) => sum + (a.resolvidos || 0), 0) / dadosAtendimentos.reduce((sum, a) => sum + (a.recebidos || 0), 0)) * 100).toFixed(1) : 0} unit="%" icon={<TrendingUp />} color={colorSystem.success} />
        <KPICardMinimal title="NPS Score" value={dadosSatisfacao.length > 0 ? dadosSatisfacao[dadosSatisfacao.length - 1].nps : 0} unit="pontos" icon={<BarChart3 />} color={colorSystem.conversion.primary} />
        <KPICardMinimal title="Tempo Médio" value={tickets.length > 0 ? (tickets.length / dadosAtendimentos.length).toFixed(1) : 0} unit="horas" icon={<Clock />} color={colorSystem.automation.primary} />
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div style={{ background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 8px 0' }}>Atendimentos Diários</h3>
          {dadosAtendimentos.length > 0 ? (
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
          ) : (
            <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', fontSize: '13px' }}>
              Nenhum dado disponível
            </div>
          )}
        </div>

        <div style={{ background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 8px 0' }}>Satisfação</h3>
          {dadosSatisfacao.length > 0 ? (
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
          ) : (
            <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', fontSize: '13px' }}>
              Nenhum dado disponível
            </div>
          )}
        </div>
      </div>

      {/* Tickets Premium */}
      <div style={{ marginTop: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#EBEBF0', margin: '0 0 12px 0' }}>
          Tickets em Aberto
        </h3>
        {tickets.length > 0 ? (
        <Table<typeof tickets[0]>
          columns={[
            {
              key: 'id',
              label: 'ID',
              sortable: true,
              width: '15%',
              render: (value) => (
                <span style={{ color: colorSystemPremium.data.blue, fontWeight: '600' }}>
                  {String(value).slice(0, 8)}
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
              key: 'tempo_resposta',
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
        ) : (
          <div style={{ background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '32px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>
            Nenhum ticket disponível
          </div>
        )}
      </div>
    </div>
  );
}

export default CSPage;
