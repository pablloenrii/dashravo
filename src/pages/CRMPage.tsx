/**
 * RAVO OS — CRM (CRUD real contra Supabase)
 * 4 KPIs + 2 gráficos + tabela de contatos
 */

import { useState } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Target, TrendingUp, DollarSign, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Input } from '@/components/Input';
import { Badge } from '@/components/Badge';
import { ChartTooltip } from '@/components/ChartTooltip';
import { QueryError, QueryLoading } from '@/components/QueryState';
import { sb as supabase } from '@/services/supabase';
import { useContactsData, useContactsChartData, useOpportunitiesData, ContactData } from '@/hooks/usePagesQueries';

const ETAPAS = ['Identificado', 'Contatado', 'Qualificado', 'Proposta', 'Fechado'] as const;

interface ContactForm {
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  valor: number;
  etapa: string;
}

const EMPTY_FORM: ContactForm = { nome: '', empresa: '', email: '', telefone: '', valor: 0, etapa: 'Identificado' };

export default function CRMPage() {
  const contacts = useContactsData();
  const chart = useContactsChartData();
  const opportunities = useOpportunitiesData();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContactForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const handleOpenModal = (contact?: ContactData) => {
    setMutationError(null);
    if (contact) {
      setFormData({
        nome: contact.nome,
        empresa: contact.empresa,
        email: contact.email,
        telefone: contact.telefone ?? '',
        valor: contact.valor,
        etapa: contact.etapa,
      });
      setEditingId(contact.id);
    } else {
      setFormData(EMPTY_FORM);
      setEditingId(null);
    }
    setShowModal(true);
  };

  const refreshAll = () => {
    contacts.refetch();
    chart.refetch();
    opportunities.refetch();
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.email) {
      setMutationError('Nome e email são obrigatórios.');
      return;
    }
    setSaving(true);
    setMutationError(null);

    const payload = {
      nome: formData.nome,
      empresa: formData.empresa || null,
      email: formData.email,
      telefone: formData.telefone || null,
      valor: formData.valor,
      etapa: formData.etapa,
    };

    const { error } = editingId
      ? await supabase.from('contatos').update(payload).eq('id', editingId)
      : await supabase.from('contatos').insert([payload]);

    setSaving(false);
    if (error) {
      setMutationError(error.message);
      return;
    }
    setShowModal(false);
    refreshAll();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este contato?')) return;
    setMutationError(null);
    const { error } = await supabase.from('contatos').delete().eq('id', id);
    if (error) {
      setMutationError(error.message);
      return;
    }
    refreshAll();
  };

  const list = contacts.data;
  const totalPipeline = list.reduce((sum, c) => sum + c.valor, 0);
  const conversionRate = list.length > 0 ? ((list.filter((c) => c.etapa === 'Fechado').length / list.length) * 100).toFixed(1) : '0';
  const opportunitiesCount = list.filter((c) => c.etapa !== 'Fechado').length;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#F5F5F7', margin: '0 0 8px 0' }}>CRM</h1>
          <p style={{ fontSize: '14px', color: '#9CA3AF', margin: 0 }}>Gestão de relacionamento e oportunidades</p>
        </div>
        <Button onClick={() => handleOpenModal()} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Plus size={16} /> Novo Contato
        </Button>
      </div>

      {/* Erros */}
      {contacts.error && <QueryError message={contacts.error} onRetry={contacts.refetch} />}
      {chart.error && <QueryError message={chart.error} onRetry={chart.refetch} />}
      {opportunities.error && <QueryError message={opportunities.error} onRetry={opportunities.refetch} />}
      {mutationError && !showModal && <QueryError message={mutationError} />}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <KPICard title="Contatos" value={contacts.loading ? '…' : list.length.toString()} unit="total" icon={<Users size={20} />} color="#FF6200" />
        <KPICard title="Pipeline" value={contacts.loading ? '…' : (totalPipeline / 1000).toFixed(0)} unit="K" icon={<DollarSign size={20} />} color="#FF6200" />
        <KPICard title="Conversão" value={contacts.loading ? '…' : conversionRate} unit="%" icon={<TrendingUp size={20} />} color="#10B981" />
        <KPICard title="Oportunidades" value={contacts.loading ? '…' : opportunitiesCount.toString()} unit="abertas" icon={<Target size={20} />} color="#F59E0B" />
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <ChartCard title="Contatos por Mês">
          {chart.loading ? (
            <QueryLoading />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="mes" stroke="#86868B" style={{ fontSize: '11px' }} />
                <YAxis stroke="#86868B" style={{ fontSize: '11px' }} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="novos" stroke="#FF6200" dot={false} name="Novos" />
                <Line type="monotone" dataKey="ativos" stroke="#10B981" dot={false} name="Ativos" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Oportunidades por Etapa">
          {opportunities.loading ? (
            <QueryLoading />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={opportunities.data} cx="50%" cy="50%" innerRadius={50} outerRadius={100} paddingAngle={2} dataKey="quantidade" nameKey="name">
                  {opportunities.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Tabela */}
      <div style={{ background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#F5F5F7', margin: 0 }}>Contatos</h3>
        </div>
        {contacts.loading ? (
          <div style={{ padding: '16px' }}><QueryLoading height={200} /></div>
        ) : list.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: '#9CA3AF' }}>
            Nenhum contato cadastrado. Clique em “Novo Contato” para começar.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={thStyle}>Avatar</th>
                  <th style={thStyle}>Nome</th>
                  <th style={thStyle}>Empresa</th>
                  <th style={thStyle}>Email</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Valor</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Etapa</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {list.map((contact) => (
                  <tr
                    key={contact.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 200ms' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FF6200 0%, #CC4E00 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '11px', fontWeight: '700'
                      }}>
                        {contact.nome.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#F5F5F7', fontWeight: '500' }}>{contact.nome}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#A1A1A6' }}>{contact.empresa}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#A1A1A6' }}>{contact.email}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#10B981', fontWeight: '600', textAlign: 'center' }}>
                      R$ {(contact.valor / 1000).toFixed(0)}K
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <Badge variant={contact.etapa === 'Fechado' ? 'success' : contact.etapa === 'Proposta' ? 'warning' : 'default'}>
                        {contact.etapa}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button onClick={() => handleOpenModal(contact)} style={actionBtnStyle('#FF6200')} aria-label={`Editar ${contact.nome}`}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(contact.id)} style={actionBtnStyle('#F59E0B')} aria-label={`Deletar ${contact.nome}`}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Editar Contato' : 'Novo Contato'}
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mutationError && <QueryError message={mutationError} />}
          <Input label="Nome *" placeholder="João Silva" value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
          <Input label="Email *" type="email" placeholder="joao@example.com" value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <Input label="Empresa" placeholder="Tech Corp" value={formData.empresa}
            onChange={(e) => setFormData({ ...formData, empresa: e.target.value })} />
          <Input label="Telefone" placeholder="11 98765-4321" value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} />
          <Input label="Valor" type="number" placeholder="50000" value={formData.valor}
            onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })} />
          <select
            style={{
              padding: '8px 12px', borderRadius: '6px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#F5F5F7', fontSize: '13px'
            }}
            value={formData.etapa}
            onChange={(e) => setFormData({ ...formData, etapa: e.target.value })}
          >
            {ETAPAS.map((etapa) => (
              <option key={etapa} value={etapa}>{etapa}</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#9CA3AF',
};

const actionBtnStyle = (color: string): React.CSSProperties => ({
  background: 'transparent', border: 'none', color, cursor: 'pointer',
  padding: '4px 8px', display: 'flex', alignItems: 'center',
});

function KPICard({ title, value, unit, icon, color }: { title: string; value: string; unit: string; icon: React.ReactNode; color: string }) {
  return (
    <div style={{
      background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)', borderLeft: `3px solid ${color}`,
      borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color }}>
        {icon}
        <span style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF' }}>{title}</span>
      </div>
      <div style={{ fontSize: '28px', fontWeight: '700', color: '#F5F5F7', marginBottom: '4px' }}>{value}</div>
      <span style={{ fontSize: '11px', color: '#6B7280' }}>{unit}</span>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px' }}>
      <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#F5F5F7', margin: '0 0 12px 0' }}>{title}</h3>
      {children}
    </div>
  );
}
