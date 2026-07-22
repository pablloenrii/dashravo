import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MessageSquare, BarChart3, TrendingUp, Clock, Plus, CheckCircle2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { KPICardMinimal } from '@/components/KPICardMinimal';
import { Badge } from '@/components/Badge';
import { Alert } from '@/components/Alert';
import { Table } from '@/components/Table';
import { ChartTooltip } from '@/components/ChartTooltip';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { QueryError, QueryLoading } from '@/components/QueryState';
import { colorSystem } from '@/styles/color-system';
import { colorSystemPremium } from '@/styles/color-system-premium';
import { sb as supabase } from '@/services/supabase';
import { useTicketsData, useAttendanceChartData, useSatisfactionData, useContactsData } from '@/hooks/usePagesQueries';

const PRIORIDADES = ['baixa', 'média', 'alta', 'crítica'];
const genTicketId = () => `TK-${Date.now().toString(36).toUpperCase().slice(-6)}`;

/** Converte "2h 15m" / "45m" / "3h" em minutos. Retorna 0 se não reconhecer o formato. */
function parseTempoResposta(tempo?: string): number {
  if (!tempo) return 0;
  const h = /(\d+)\s*h/i.exec(tempo);
  const m = /(\d+)\s*m/i.exec(tempo);
  return (h ? Number(h[1]) : 0) * 60 + (m ? Number(m[1]) : 0);
}

interface TicketForm {
  contatoId: string;
  assunto: string;
  prioridade: string;
}
const EMPTY_TICKET_FORM: TicketForm = { contatoId: '', assunto: '', prioridade: 'média' };

export function CSPage() {
  const [showWaitAlert, setShowWaitAlert] = useState(true);
  const [showNpsAlert, setShowNpsAlert] = useState(true);

  // Fetch data from Supabase
  const { data: tickets, loading: loadingTickets, error: errorTickets, refetch: refetchTickets } = useTicketsData();
  const { data: dadosAtendimentos, loading: loadingAttendance, error: errorAttendance } = useAttendanceChartData();
  const { data: dadosSatisfacao, loading: loadingSatisfaction, error: errorSatisfaction } = useSatisfactionData();
  const { data: contatos } = useContactsData();

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState<TicketForm>(EMPTY_TICKET_FORM);
  const [savingTicket, setSavingTicket] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);

  const handleSaveTicket = async () => {
    const contato = contatos.find((c) => c.id === ticketForm.contatoId);
    if (!contato || !ticketForm.assunto) { setTicketError('Selecione um cliente e informe o assunto.'); return; }
    setSavingTicket(true); setTicketError(null);
    const { error } = await supabase.from('tickets').insert([{
      ticketid: genTicketId(),
      contato_id: contato.id,
      cliente: contato.nome,
      assunto: ticketForm.assunto,
      prioridade: ticketForm.prioridade,
      status: 'aberto',
    }]);
    setSavingTicket(false);
    if (error) { setTicketError(error.message); return; }
    setShowTicketModal(false);
    setTicketForm(EMPTY_TICKET_FORM);
    refetchTickets();
  };

  const handleResolveTicket = async (id: string) => {
    setTicketError(null);
    const { error } = await supabase.from('tickets').update({ status: 'resolvido', resolved_at: new Date().toISOString() }).eq('id', id);
    if (error) { setTicketError(error.message); return; }
    refetchTickets();
  };

  const handleDeleteTicket = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este ticket?')) return;
    setTicketError(null);
    const { error } = await supabase.from('tickets').delete().eq('id', id);
    if (error) { setTicketError(error.message); return; }
    refetchTickets();
  };

  // Show error state
  if (errorTickets || errorAttendance || errorSatisfaction) {
    return (
      <div style={{ padding: '16px', maxWidth: '1400px', margin: '0 auto' }}>
        <QueryError message={errorTickets || errorAttendance || errorSatisfaction || ''} onRetry={refetchTickets} />
      </div>
    );
  }

  // Show loading state
  if (loadingTickets || loadingAttendance || loadingSatisfaction) {
    return (
      <div style={{ padding: '16px', maxWidth: '1400px', margin: '0 auto' }}>
        <QueryLoading height={400} />
      </div>
    );
  }

  const ticketsEmEspera = tickets.filter((t) => parseTempoResposta(t.tempo_resposta) > 120).length;
  const npsAtual = dadosSatisfacao.length > 0 ? dadosSatisfacao[dadosSatisfacao.length - 1].nps : 0;
  const npsRecorde = dadosSatisfacao.length > 0 && npsAtual >= Math.max(...dadosSatisfacao.map((d) => d.nps));

  return (
    <div style={{ padding: '16px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Alerts */}
      <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {showWaitAlert && ticketsEmEspera > 0 && (
          <Alert
            type="warning"
            title="Atenção"
            message={`Existem ${ticketsEmEspera} ticket${ticketsEmEspera > 1 ? 's' : ''} em espera há mais de 2 horas`}
            onClose={() => setShowWaitAlert(false)}
          />
        )}
        {showNpsAlert && dadosSatisfacao.length > 0 && (
          <Alert
            type={npsRecorde ? 'success' : 'info'}
            title="Atualização"
            message={npsRecorde
              ? `NPS Score atingiu ${npsAtual} esta semana — recorde no período`
              : `NPS Score atual: ${npsAtual} pontos`}
            onClose={() => setShowNpsAlert(false)}
          />
        )}
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em', color: '#F2F2F3', margin: 0 }}>
              Atendimento ao Cliente
            </h1>
            <Badge variant="info">SUPORTE</Badge>
          </div>
          <p style={{ fontSize: '12px', color: '#A1A1A6', margin: 0 }}>
            Gestão de tickets, satisfação e relacionamento
          </p>
        </div>
        <Button
          onClick={() => { setTicketForm(EMPTY_TICKET_FORM); setTicketError(null); setShowTicketModal(true); }}
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          <Plus size={16} /> Novo Ticket
        </Button>
      </div>

      {ticketError && !showTicketModal && <div style={{ marginBottom: '16px' }}><QueryError message={ticketError} /></div>}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '16px' }}>
        <KPICardMinimal title="Tickets Recebidos" value={dadosAtendimentos.reduce((sum, a) => sum + (a.recebidos || 0), 0)} unit="tickets" icon={<MessageSquare />} color={colorSystem.customers.primary} />
        <KPICardMinimal title="Taxa de Resolução" value={(() => {
          const recebidos = dadosAtendimentos.reduce((sum, a) => sum + (a.recebidos || 0), 0);
          const resolvidos = dadosAtendimentos.reduce((sum, a) => sum + (a.resolvidos || 0), 0);
          return recebidos > 0 ? ((resolvidos / recebidos) * 100).toFixed(1) : 0;
        })()} unit="%" icon={<TrendingUp />} color={colorSystem.success} />
        <KPICardMinimal title="NPS Score" value={dadosSatisfacao.length > 0 ? dadosSatisfacao[dadosSatisfacao.length - 1].nps : 0} unit="pontos" icon={<BarChart3 />} color={colorSystem.conversion.primary} />
        <KPICardMinimal title="Tempo Médio" value={tickets.length > 0 ? (tickets.reduce((sum, t) => sum + parseTempoResposta(t.tempo_resposta), 0) / tickets.length / 60).toFixed(1) : 0} unit="horas" icon={<Clock />} color={'#8B8B8B'} />
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div style={{ background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 8px 0' }}>Atendimentos Diários</h3>
          {dadosAtendimentos.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dadosAtendimentos}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="dia" stroke="#86868B" style={{ fontSize: '11px' }} />
                <YAxis stroke="#86868B" style={{ fontSize: '11px' }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="recebidos" fill="#8B8B8B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolvidos" fill="#5A5A5A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', fontSize: '13px' }}>
              Nenhum dado disponível
            </div>
          )}
        </div>

        <div style={{ background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 8px 0' }}>Satisfação</h3>
          {dadosSatisfacao.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dadosSatisfacao}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="semana" stroke="#86868B" style={{ fontSize: '11px' }} />
                <YAxis stroke="#86868B" style={{ fontSize: '11px' }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Line type="monotone" dataKey="nps" stroke="#8B8B8B" dot={false} />
                <Line type="monotone" dataKey="satisfacao" stroke="#5A5A5A" dot={false} />
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
                  value === 'crítica' || value === 'alta' ? 'error' :
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
            {
              key: 'status',
              label: 'Ações',
              align: 'center',
              render: (_value, row) => (
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                  <button
                    onClick={() => handleResolveTicket(String(row.id))}
                    aria-label="Marcar como resolvido"
                    title="Marcar como resolvido"
                    style={{ background: 'transparent', border: 'none', color: '#3FB950', cursor: 'pointer', padding: '2px', display: 'flex' }}
                  >
                    <CheckCircle2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteTicket(String(row.id))}
                    aria-label="Deletar ticket"
                    title="Deletar ticket"
                    style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '2px', display: 'flex' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
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
          <div style={{ background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '32px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>
            Nenhum ticket disponível
          </div>
        )}
      </div>

      <Modal isOpen={showTicketModal} onClose={() => setShowTicketModal(false)} title="Novo Ticket" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {ticketError && <QueryError message={ticketError} />}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9CA3AF', marginBottom: '6px' }}>Cliente *</label>
            {contatos.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                Nenhum lead cadastrado ainda — cadastre um no CRM primeiro para poder abrir um ticket para ele.
              </p>
            ) : (
              <select
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F5F7', fontSize: '13px' }}
                value={ticketForm.contatoId}
                onChange={(e) => setTicketForm({ ...ticketForm, contatoId: e.target.value })}
              >
                <option value="">Selecione um cliente</option>
                {contatos.map((c) => <option key={c.id} value={c.id}>{c.nome}{c.empresa ? ` — ${c.empresa}` : ''}</option>)}
              </select>
            )}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9CA3AF', marginBottom: '6px' }}>Assunto *</label>
            <input
              placeholder="Ex: Erro na integração"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#EDEDED', fontSize: '13px' }}
              value={ticketForm.assunto}
              onChange={(e) => setTicketForm({ ...ticketForm, assunto: e.target.value })}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9CA3AF', marginBottom: '6px' }}>Prioridade</label>
            <select
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F5F7', fontSize: '13px' }}
              value={ticketForm.prioridade}
              onChange={(e) => setTicketForm({ ...ticketForm, prioridade: e.target.value })}
            >
              {PRIORIDADES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <Button variant="ghost" onClick={() => setShowTicketModal(false)}>Cancelar</Button>
            <Button onClick={handleSaveTicket} disabled={savingTicket || contatos.length === 0}>{savingTicket ? 'Salvando…' : 'Salvar'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CSPage;
