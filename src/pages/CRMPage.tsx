/**
 * RAVO OS — CRM Pipeline (estilo Pipedrive)
 * Kanban de leads com drag-and-drop, fases, forecast ponderado e insights.
 * Toggle Board / Lista. CRUD real contra Supabase (tabela `contatos`).
 */

import { useState, useEffect } from 'react';
import {
  Plus, Trash2, Edit2, LayoutGrid, List as ListIcon,
  DollarSign, Target, Percent, Timer, AlertTriangle, Trophy,
} from 'lucide-react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Input } from '@/components/Input';
import { QueryError, QueryLoading } from '@/components/QueryState';
import { sb as supabase } from '@/services/supabase';
import { useContactsData, ContactData } from '@/hooks/usePagesQueries';

/* ---------- Configuração das fases (com probabilidade p/ forecast) ---------- */
interface Stage { key: string; prob: number; color: string; }
const STAGES: Stage[] = [
  { key: 'Novo Lead',     prob: 0.10, color: '#626873' },
  { key: 'Contato Feito', prob: 0.25, color: '#8B8B8B' },
  { key: 'Qualificado',   prob: 0.50, color: '#EDEDED' },
  { key: 'Proposta',      prob: 0.65, color: '#8B8B8B' },
  { key: 'Negociação',    prob: 0.80, color: '#6E6E6E' },
  { key: 'Ganho',         prob: 1.00, color: '#3FB950' },
  { key: 'Perdido',       prob: 0.00, color: '#EF4444' },
];
const STAGE_MAP: Record<string, Stage> = Object.fromEntries(STAGES.map((s) => [s.key, s] as const));
const OPEN_KEYS = ['Novo Lead', 'Contato Feito', 'Qualificado', 'Proposta', 'Negociação'];
const isOpen = (etapa: string) => OPEN_KEYS.includes(etapa);
const ROT_DAYS = 14; // dias parado numa fase = "esfriando"
const ORIGENS = ['Indicação', 'Inbound', 'Outbound', 'Evento', 'Site', 'Outro'];

const fmtMoney = (v: number) =>
  v >= 1000 ? `R$ ${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `R$ ${Math.round(v)}`;
const daysSince = (iso?: string) =>
  iso ? Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)) : 0;
const initials = (nome: string) =>
  nome.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
const fmtDate = (iso: string) => { const d = new Date(iso); return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`; };

interface ContactForm {
  nome: string; empresa: string; email: string; telefone: string; valor: number; etapa: string;
  origem: string; dataPrevista: string; motivo: string;
}
const EMPTY_FORM: ContactForm = { nome: '', empresa: '', email: '', telefone: '', valor: 0, etapa: 'Novo Lead', origem: '', dataPrevista: '', motivo: '' };

export default function CRMPage() {
  const contacts = useContactsData();

  const [items, setItems] = useState<ContactData[]>([]);
  useEffect(() => { setItems(contacts.data); }, [contacts.data]);

  const [view, setView] = useState<'board' | 'list'>('board');
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContactForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const handleOpenModal = (c?: ContactData) => {
    setMutationError(null);
    if (c) {
      setFormData({ nome: c.nome, empresa: c.empresa, email: c.email, telefone: c.telefone ?? '', valor: c.valor, etapa: c.etapa, origem: c.origem ?? '', dataPrevista: c.data_prevista ?? '', motivo: c.motivo ?? '' });
      setEditingId(c.id);
    } else {
      setFormData(EMPTY_FORM); setEditingId(null);
    }
    setShowModal(true);
  };

  /**
   * Integra um deal "Ganho" ao resto do sistema:
   * 1) customers + subscriptions (mrr = valor do deal) → alimenta MRR/ARR,
   *    Clientes ativos e LTV/CAC no Dashboard. Idempotente por e-mail.
   * 2) receitas do mês corrente → alimenta o Financeiro e o gráfico de receita
   *    do Dashboard. Usa `contatos.receita_integrada` para lançar só a diferença
   *    (delta) caso o valor do deal seja editado depois de já ganho, evitando
   *    somar o mesmo dinheiro duas vezes.
   */
  const integrateWonDeal = async (deal: { id: string; nome: string; email: string; empresa: string; telefone?: string; valor: number }) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId || !deal.email) return;

      // --- 1) customers + subscriptions (Dashboard) ---
      let customerId: string | undefined;
      const { data: existingCustomer } = await supabase
        .from('customers').select('id').eq('user_id', userId).eq('email', deal.email).maybeSingle();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: createdCustomer, error: custError } = await supabase
          .from('customers')
          .insert([{
            name: deal.nome, email: deal.email, phone: deal.telefone || null,
            company: deal.empresa || null, status: 'active', user_id: userId, source: 'crm',
          }])
          .select('id').single();
        if (custError) { setMutationError(`Lead salvo, mas não integrou ao Dashboard: ${custError.message}`); return; }
        customerId = createdCustomer?.id;
      }
      if (customerId) {
        const { data: existingSub } = await supabase
          .from('subscriptions').select('id').eq('customer_id', customerId).eq('status', 'active').maybeSingle();

        const { error: subError } = existingSub
          ? await supabase.from('subscriptions').update({ mrr: deal.valor }).eq('id', existingSub.id)
          : await supabase.from('subscriptions').insert([{ customer_id: customerId, mrr: deal.valor, status: 'active' }]);
        if (subError) setMutationError(`Lead salvo, mas não integrou ao Dashboard: ${subError.message}`);
      }

      // --- 2) receitas (Financeiro + gráfico de receita do Dashboard) ---
      const { data: contatoRow } = await supabase
        .from('contatos').select('receita_integrada').eq('id', deal.id).maybeSingle();
      const jaIntegrado = Number(contatoRow?.receita_integrada ?? 0);
      const delta = deal.valor - jaIntegrado;
      if (delta !== 0) {
        const now = new Date();
        const mesISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        const { data: existingReceita } = await supabase
          .from('receitas').select('id, receita, despesa').eq('user_id', userId).eq('mes', mesISO).maybeSingle();

        const { error: receitaError } = existingReceita
          ? await supabase.from('receitas').update({
              receita: Number(existingReceita.receita) + delta,
              lucro: Number(existingReceita.receita) + delta - Number(existingReceita.despesa),
            }).eq('id', existingReceita.id)
          : await supabase.from('receitas').insert([{ user_id: userId, mes: mesISO, receita: delta, despesa: 0, lucro: delta }]);

        if (receitaError) {
          setMutationError(`Lead salvo, mas não integrou ao Financeiro: ${receitaError.message}`);
        } else {
          await supabase.from('contatos').update({ receita_integrada: deal.valor }).eq('id', deal.id);
        }
      }
    } catch (err) {
      setMutationError(`Lead salvo, mas não integrou ao Dashboard: ${err instanceof Error ? err.message : 'erro desconhecido'}`);
    }
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.email) { setMutationError('Nome e email são obrigatórios.'); return; }
    setSaving(true); setMutationError(null);
    const payload = {
      nome: formData.nome, empresa: formData.empresa || null, email: formData.email,
      telefone: formData.telefone || null, valor: formData.valor, etapa: formData.etapa,
      origem: formData.origem || null, data_prevista: formData.dataPrevista || null, motivo: formData.motivo || null,
      updated_at: new Date().toISOString(),
    };
    const { data: saved, error } = editingId
      ? await supabase.from('contatos').update(payload).eq('id', editingId).select('id').single()
      : await supabase.from('contatos').insert([payload]).select('id').single();
    setSaving(false);
    if (error) { setMutationError(error.message); return; }
    setShowModal(false);
    contacts.refetch();
    if (formData.etapa === 'Ganho' && saved?.id) {
      await integrateWonDeal({ id: saved.id, ...formData });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este lead?')) return;
    setMutationError(null);
    const prev = items;
    setItems(items.filter((c) => c.id !== id));
    const { error } = await supabase.from('contatos').delete().eq('id', id);
    if (error) { setItems(prev); setMutationError(error.message); }
  };

  const moveTo = async (id: string, etapa: string) => {
    const current = items.find((c) => c.id === id);
    if (!current || current.etapa === etapa) return;
    const prev = items;
    const nowIso = new Date().toISOString();
    setItems(items.map((c) => (c.id === id ? { ...c, etapa, updated_at: nowIso } : c)));
    const { error } = await supabase.from('contatos').update({ etapa, updated_at: nowIso }).eq('id', id);
    if (error) { setItems(prev); setMutationError(error.message); return; }
    if (etapa === 'Ganho') {
      await integrateWonDeal(current);
    }
  };

  const open = items.filter((c) => isOpen(c.etapa));
  const won = items.filter((c) => c.etapa === 'Ganho');
  const lost = items.filter((c) => c.etapa === 'Perdido');
  const pipelineAberto = open.reduce((s, c) => s + c.valor, 0);
  const forecast = open.reduce((s, c) => s + c.valor * (STAGE_MAP[c.etapa]?.prob ?? 0), 0);
  const winRate = won.length + lost.length > 0 ? Math.round((won.length / (won.length + lost.length)) * 100) : 0;
  const ticketMedio = won.length > 0 ? won.reduce((s, c) => s + c.valor, 0) / won.length
    : (open.length > 0 ? pipelineAberto / open.length : 0);
  const ciclo = won.length > 0
    ? Math.round(won.reduce((s, c) => s + Math.max(0, daysSince(c.created_at) - daysSince(c.updated_at)), 0) / won.length)
    : 0;
  const parados = open.filter((c) => daysSince(c.updated_at) >= ROT_DAYS).length;

  const insights = [
    { label: 'Pipeline aberto', value: fmtMoney(pipelineAberto), icon: <DollarSign size={14} /> },
    { label: 'Forecast ponderado', value: fmtMoney(forecast), icon: <Target size={14} /> },
    { label: 'Win rate', value: `${winRate}%`, icon: <Trophy size={14} /> },
    { label: 'Ticket médio', value: fmtMoney(ticketMedio), icon: <Percent size={14} /> },
    { label: 'Ciclo médio', value: `${ciclo}d`, icon: <Timer size={14} /> },
    { label: 'Deals parados', value: String(parados), icon: <AlertTriangle size={14} /> },
  ];

  return (
    <div style={{ maxWidth: '1500px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.01em', color: '#EDEDED', margin: '0 0 2px 0' }}>Pipeline de Vendas</h1>
          <p style={{ fontSize: '12.5px', color: '#6E6E6E', margin: 0 }}>Gestão de leads, fases e previsão de fechamento</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '3px' }}>
            <ViewBtn active={view === 'board'} onClick={() => setView('board')} icon={<LayoutGrid size={15} />} label="Board" />
            <ViewBtn active={view === 'list'} onClick={() => setView('list')} icon={<ListIcon size={15} />} label="Lista" />
          </div>
          <Button onClick={() => handleOpenModal()} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Plus size={16} /> Novo Lead
          </Button>
        </div>
      </div>

      {contacts.error && <QueryError message={contacts.error} onRetry={contacts.refetch} />}
      {mutationError && !showModal && <QueryError message={mutationError} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {insights.map((k) => (
          <div key={k.label} style={{ background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#6E6E6E' }}>
              {k.icon}<span style={{ fontSize: '11px', fontWeight: 500, color: '#6E6E6E' }}>{k.label}</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.02em', color: '#EDEDED' }}>{contacts.loading ? '—' : k.value}</div>
          </div>
        ))}
      </div>

      {contacts.loading ? (
        <QueryLoading height={300} />
      ) : view === 'board' ? (
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px' }}>
          {STAGES.map((stage) => {
            const cards = items.filter((c) => c.etapa === stage.key);
            const total = cards.reduce((s, c) => s + c.valor, 0);
            return (
              <div
                key={stage.key}
                onDragOver={(e) => { e.preventDefault(); setOverCol(stage.key); }}
                onDragLeave={() => setOverCol((p) => (p === stage.key ? null : p))}
                onDrop={() => { if (dragId) moveTo(dragId, stage.key); setDragId(null); setOverCol(null); }}
                style={{
                  flex: '0 0 250px', minWidth: '250px',
                  background: overCol === stage.key ? 'rgba(255,255,255,0.06)' : '#0F0F0F',
                  border: `1px solid ${overCol === stage.key ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '12px', padding: '10px', transition: 'background 150ms, border-color 150ms',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', padding: '2px 4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: stage.color }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#F5F5F7' }}>{stage.key}</span>
                    <span style={{ fontSize: '11px', color: '#6B7280' }}>{cards.length}</span>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', padding: '0 4px 8px 4px', fontWeight: 600 }}>{fmtMoney(total)}</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '80px' }}>
                  {cards.map((c) => {
                    const rot = isOpen(c.etapa) && daysSince(c.updated_at) >= ROT_DAYS;
                    return (
                      <div
                        key={c.id}
                        draggable
                        onDragStart={() => setDragId(c.id)}
                        onDragEnd={() => { setDragId(null); setOverCol(null); }}
                        style={{
                          background: '#1A1A1A', border: `1px solid ${rot ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.08)'}`,
                          borderRadius: '10px', padding: '10px', cursor: 'grab',
                          opacity: dragId === c.id ? 0.5 : 1,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>
                            {initials(c.nome)}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#F5F5F7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nome}</div>
                            <div style={{ fontSize: '11px', color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.empresa || '—'}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: c.etapa === 'Ganho' ? '#3FB950' : '#EDEDED' }}>{fmtMoney(c.valor)}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {rot && <span title={`Parado há ${daysSince(c.updated_at)} dias`} style={{ display: 'flex', color: '#EF4444' }}><AlertTriangle size={13} /></span>}
                            <span style={{ fontSize: '10px', color: '#6B7280' }}>{daysSince(c.updated_at)}d</span>
                            <button onClick={() => handleOpenModal(c)} style={cardBtn} aria-label={`Editar ${c.nome}`}><Edit2 size={13} /></button>
                            <button onClick={() => handleDelete(c.id)} style={cardBtn} aria-label={`Deletar ${c.nome}`}><Trash2 size={13} /></button>
                          </div>
                        </div>
                        {(c.origem || (isOpen(c.etapa) && c.data_prevista) || (!isOpen(c.etapa) && c.motivo)) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                            {c.origem && <span style={tag}>{c.origem}</span>}
                            {isOpen(c.etapa) && c.data_prevista && <span style={{ fontSize: '10px', color: '#6E6E6E' }}>fecha {fmtDate(c.data_prevista)}</span>}
                            {!isOpen(c.etapa) && c.motivo && <span style={{ fontSize: '10px', color: '#6E6E6E' }}>{c.motivo}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {cards.length === 0 && (
                    <div style={{ fontSize: '11px', color: '#4B5563', textAlign: 'center', padding: '16px 0' }}>Arraste um lead aqui</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
          {items.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: '#9CA3AF' }}>
              Nenhum lead cadastrado. Clique em Novo Lead para começar.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={thStyle}>Lead</th>
                    <th style={thStyle}>Empresa</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Valor</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Fase</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Dias</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#F5F5F7', fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 700 }}>{initials(c.nome)}</div>
                          {c.nome}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#A1A1A6' }}>{c.empresa || '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: c.etapa === 'Ganho' ? '#3FB950' : '#EDEDED', fontWeight: 600, textAlign: 'center' }}>{fmtMoney(c.valor)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: STAGE_MAP[c.etapa]?.color ?? '#9CA3AF', background: `${STAGE_MAP[c.etapa]?.color ?? '#9CA3AF'}1f`, padding: '3px 10px', borderRadius: '999px' }}>{c.etapa}</span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: daysSince(c.updated_at) >= ROT_DAYS && isOpen(c.etapa) ? '#EF4444' : '#9CA3AF' }}>{daysSince(c.updated_at)}d</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button onClick={() => handleOpenModal(c)} style={cardBtn} aria-label={`Editar ${c.nome}`}><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(c.id)} style={cardBtn} aria-label={`Deletar ${c.nome}`}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Editar Lead' : 'Novo Lead'} size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mutationError && <QueryError message={mutationError} />}
          <Input label="Nome *" placeholder="João Silva" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
          <Input label="Email *" type="email" placeholder="joao@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <Input label="Empresa" placeholder="Tech Corp" value={formData.empresa} onChange={(e) => setFormData({ ...formData, empresa: e.target.value })} />
          <Input label="Telefone" placeholder="11 98765-4321" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} />
          <Input label="Valor (R$)" type="number" placeholder="50000" value={formData.valor} onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })} />
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9CA3AF', marginBottom: '6px' }}>Fase</label>
            <select
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F5F7', fontSize: '13px' }}
              value={formData.etapa} onChange={(e) => setFormData({ ...formData, etapa: e.target.value })}>
              {STAGES.map((s) => <option key={s.key} value={s.key}>{s.key}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Origem</label>
            <select style={fld} value={formData.origem} onChange={(e) => setFormData({ ...formData, origem: e.target.value })}>
              <option value="">—</option>
              {ORIGENS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Data prevista de fechamento</label>
            <input type="date" style={fld} value={formData.dataPrevista} onChange={(e) => setFormData({ ...formData, dataPrevista: e.target.value })} />
          </div>
          {(formData.etapa === 'Ganho' || formData.etapa === 'Perdido') && (
            <div>
              <label style={lbl}>Motivo {formData.etapa === 'Ganho' ? 'do ganho' : 'da perda'}</label>
              <input style={fld} placeholder="Ex: preço, indicação, concorrente…" value={formData.motivo} onChange={(e) => setFormData({ ...formData, motivo: e.target.value })} />
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ViewBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
      fontSize: '12px', fontWeight: 600,
      background: active ? '#1E1E1E' : 'transparent', color: active ? '#EDEDED' : '#8B8B8B',
    }}>{icon}{label}</button>
  );
}

const thStyle: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#9CA3AF' };
const cardBtn: React.CSSProperties = { background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' };
const lbl: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 600, color: '#8A8F98', marginBottom: '6px' };
const fld: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#EDEDED', fontSize: '13px' };
const tag: React.CSSProperties = { fontSize: '10px', fontWeight: 500, color: '#8B8B8B', background: 'rgba(255,255,255,0.05)', padding: '2px 7px', borderRadius: '5px' };
