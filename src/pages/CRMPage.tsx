/**
 * RAVO OS — CRM Pipeline (estilo Pipedrive)
 * Kanban de leads com drag-and-drop, fases, forecast ponderado e insights.
 * Toggle Board / Lista. CRUD real contra Supabase (tabela `contatos`).
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Trash2, Edit2, LayoutGrid, List as ListIcon, GripVertical,
  DollarSign, Target, Percent, Timer, AlertTriangle, Trophy, Search, X,
  Inbox, Filter,
} from 'lucide-react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Input } from '@/components/Input';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { QueryError, QueryLoading } from '@/components/QueryState';
import { MetricCard } from '@/components/MetricCard';
import { sb as supabase } from '@/services/supabase';
import { useContactsData, ContactData } from '@/hooks/usePagesQueries';
import { usePeriod, prevMonthKey, monthLabel } from '@/contexts/PeriodContext';
import { fmtMoney, pctChange } from '@/utils/format';
import { toastSuccess, toastError } from '@/utils/toast';
import {
  STAGES, STAGE_MAP, isOpen, daysSince, ROT_DAYS,
  computeCrmMetrics, computeFunnel, computeBySource,
} from '@/utils/crmMetrics';
import { useRevalidateStore } from '@/store/revalidate.store';
import { chart, text, surface, semantic, layout, type } from '@/constants/theme';

const ORIGENS = ['Indicação', 'Inbound', 'Outbound', 'Evento', 'Site', 'Outro'];

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
  const { month, isAllTime, label: periodLabel } = usePeriod();

  const [items, setItems] = useState<ContactData[]>([]);
  useEffect(() => { setItems(contacts.data); }, [contacts.data]);

  const [view, setView] = useState<'board' | 'list'>('board');
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const [moveFor, setMoveFor] = useState<ContactData | null>(null);

  const isTouch = useMemo(
    () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0),
    []
  );

  // --- Busca e filtros ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEtapa, setFilterEtapa] = useState('');
  const [filterOrigem, setFilterOrigem] = useState('');

  const itemsFiltrados = useMemo(() => {
    let result = items;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((c) =>
        c.nome.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.empresa && c.empresa.toLowerCase().includes(q))
      );
    }
    if (filterEtapa) result = result.filter((c) => c.etapa === filterEtapa);
    if (filterOrigem) result = result.filter((c) => c.origem === filterOrigem);
    return result;
  }, [items, searchTerm, filterEtapa, filterOrigem]);

  // --- Modal de lead ---
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContactForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // --- Confirm dialog ---
  const [confirmDelete, setConfirmDelete] = useState<ContactData | null>(null);

  const handleOpenModal = (c?: ContactData) => {
    if (c) {
      setFormData({ nome: c.nome, empresa: c.empresa, email: c.email, telefone: c.telefone ?? '', valor: c.valor, etapa: c.etapa, origem: c.origem ?? '', dataPrevista: c.data_prevista ?? '', motivo: c.motivo ?? '' });
      setEditingId(c.id);
    } else {
      setFormData(EMPTY_FORM); setEditingId(null);
    }
    setShowModal(true);
  };

  const integrateWonDeal = async (deal: { id: string; nome: string; email: string; empresa: string; telefone?: string; valor: number }) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId || !deal.email) return;

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
        if (custError) { toastError(`Lead salvo, mas não integrou ao Dashboard: ${custError.message}`); return; }
        customerId = createdCustomer?.id;
      }
      if (customerId) {
        const { data: existingSub } = await supabase
          .from('subscriptions').select('id').eq('customer_id', customerId).eq('status', 'active').maybeSingle();

        const { error: subError } = existingSub
          ? await supabase.from('subscriptions').update({ mrr: deal.valor }).eq('id', existingSub.id)
          : await supabase.from('subscriptions').insert([{ customer_id: customerId, mrr: deal.valor, status: 'active' }]);
        if (subError) toastError(`Lead salvo, mas não integrou ao Dashboard: ${subError.message}`);
      }

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
          toastError(`Lead salvo, mas não integrou ao Financeiro: ${receitaError.message}`);
        } else {
          await supabase.from('contatos').update({ receita_integrada: deal.valor }).eq('id', deal.id);
          toastSuccess('Lead integrado ao Dashboard e Financeiro');
        }
      }
    } catch (err) {
      toastError(`Lead salvo, mas não integrou ao Dashboard: ${err instanceof Error ? err.message : 'erro desconhecido'}`);
    }
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.email) { toastError('Nome e email são obrigatórios.'); return; }
    setSaving(true);
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
    if (error) { toastError(error.message); return; }
    setShowModal(false);
    toastSuccess(editingId ? 'Lead atualizado com sucesso' : 'Lead criado com sucesso');
    contacts.refetch();
    if (formData.etapa === 'Ganho' && saved?.id) {
      await integrateWonDeal({ id: saved.id, ...formData });
    }
    useRevalidateStore.getState().invalidate();
  };

  const handleDelete = async (id: string) => {
    const prev = items;
    setItems(items.filter((c) => c.id !== id));
    const { error } = await supabase.from('contatos').delete().eq('id', id);
    if (error) { setItems(prev); toastError(error.message); return; }
    toastSuccess('Lead removido');
    useRevalidateStore.getState().invalidate();
  };

  const moveTo = async (id: string, etapa: string) => {
    const current = items.find((c) => c.id === id);
    if (!current || current.etapa === etapa) return;
    const prev = items;
    const nowIso = new Date().toISOString();
    setItems(items.map((c) => (c.id === id ? { ...c, etapa, updated_at: nowIso } : c)));
    const { error } = await supabase.from('contatos').update({ etapa, updated_at: nowIso }).eq('id', id);
    if (error) { setItems(prev); toastError(error.message); return; }
    toastSuccess(`Lead movido para ${etapa}`);
    if (etapa === 'Ganho') {
      await integrateWonDeal(current);
    }
    useRevalidateStore.getState().invalidate();
  };

  const m = useMemo(() => computeCrmMetrics(items, month), [items, month]);
  const mPrev = useMemo(
    () => computeCrmMetrics(items, month === null ? null : prevMonthKey(month)),
    [items, month]
  );
  const funil = useMemo(
    () => computeFunnel(month === null ? items : m.novosLeads),
    [items, m.novosLeads, month]
  );
  const porOrigem = useMemo(
    () => computeBySource(month === null ? items : m.novosLeads),
    [items, m.novosLeads, month]
  );

  const d = (cur: number, prev: number) => (isAllTime ? undefined : pctChange(cur, prev));
  const vsLabel = isAllTime ? undefined : `vs ${monthLabel(prevMonthKey(month as string))}`;

  const visiveis = useMemo(
    () => (isAllTime ? itemsFiltrados : itemsFiltrados.filter((c) => {
      if (isOpen(c.etapa)) return true;
      return m.ganhos.some((g) => g.id === c.id) || m.perdidos.some((p) => p.id === c.id);
    })),
    [isAllTime, itemsFiltrados, m.ganhos, m.perdidos]
  );

  return (
    <div style={{ maxWidth: layout.pageMaxWidth, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ ...type.pageTitle, color: text.primary, margin: '0 0 4px 0' }}>Pipeline de Vendas</h1>
          <p style={{ fontSize: '14px', color: text.secondary, margin: 0 }}>
            {periodLabel} · {m.novosLeadsCount} {m.novosLeadsCount === 1 ? 'novo lead' : 'novos leads'} · {m.ganhos.length} {m.ganhos.length === 1 ? 'fechado' : 'fechados'}
            {visiveis.length !== items.length && <span> · {visiveis.length} vis{visiveis.length === 1 ? 'ível' : 'íveis'}</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: surface.card, border: `1px solid ${surface.borderStrong}`, borderRadius: '8px', padding: '3px' }}>
            <ViewBtn active={view === 'board'} onClick={() => setView('board')} icon={<LayoutGrid size={15} />} label="Board" />
            <ViewBtn active={view === 'list'} onClick={() => setView('list')} icon={<ListIcon size={15} />} label="Lista" />
          </div>
          <Button onClick={() => handleOpenModal()} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Plus size={16} /> Novo Lead
          </Button>
        </div>
      </div>

      {contacts.error && <QueryError message={contacts.error} onRetry={contacts.refetch} />}

      {/* --- Barra de busca e filtros --- */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '180px' }}>
          <Search size={14} color={text.dim} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Buscar por nome, email ou empresa…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '8px 10px 8px 30px', borderRadius: '8px',
              background: surface.input, border: `1px solid ${surface.borderStrong}`,
              color: text.bright, fontSize: '12px', outline: 'none',
            }}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: text.dim, cursor: 'pointer', padding: '2px', display: 'flex' }}>
              <X size={13} />
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={13} color={text.dim} />
          <select
            value={filterEtapa}
            onChange={(e) => setFilterEtapa(e.target.value)}
            style={{ padding: '7px 10px', borderRadius: '8px', background: surface.input, border: `1px solid ${surface.borderStrong}`, color: text.bright, fontSize: '12px' }}
          >
            <option value="">Todas as fases</option>
            {STAGES.map((s) => <option key={s.key} value={s.key}>{s.key}</option>)}
          </select>
          <select
            value={filterOrigem}
            onChange={(e) => setFilterOrigem(e.target.value)}
            style={{ padding: '7px 10px', borderRadius: '8px', background: surface.input, border: `1px solid ${surface.borderStrong}`, color: text.bright, fontSize: '12px' }}
          >
            <option value="">Todas as origens</option>
            {ORIGENS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Métricas comerciais do período */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))', gap: '12px', marginBottom: '12px' }}>
        <MetricCard
          label="Receita fechada" value={fmtMoney(m.receitaGanha)} icon={<Trophy size={14} />}
          deltaPct={d(m.receitaGanha, mPrev.receitaGanha)} sublabel={vsLabel} loading={contacts.loading}
        />
        <MetricCard
          label="Pipeline aberto" value={fmtMoney(m.pipelineAberto)} icon={<DollarSign size={14} />}
          deltaPct={d(m.pipelineAberto, mPrev.pipelineAberto)}
          sublabel={`${m.abertos.length} ${m.abertos.length === 1 ? 'deal' : 'deals'}`} loading={contacts.loading}
        />
        <MetricCard
          label="Forecast ponderado" value={fmtMoney(m.forecast)} icon={<Target size={14} />}
          deltaPct={d(m.forecast, mPrev.forecast)} sublabel="por probabilidade" loading={contacts.loading}
        />
        <MetricCard
          label="Win rate" value={`${m.winRate}%`} icon={<Percent size={14} />}
          deltaPct={d(m.winRate, mPrev.winRate)}
          sublabel={`${m.ganhos.length}G / ${m.perdidos.length}P`} loading={contacts.loading}
        />
        <MetricCard
          label="Ticket médio" value={fmtMoney(m.ticketMedio)} icon={<DollarSign size={14} />}
          deltaPct={d(m.ticketMedio, mPrev.ticketMedio)} sublabel={vsLabel} loading={contacts.loading}
        />
        <MetricCard
          label="Ciclo de venda" value={`${m.cicloMedio}d`} icon={<Timer size={14} />}
          deltaPct={d(m.cicloMedio, mPrev.cicloMedio)} invertDelta
          sublabel="lead → fechamento" loading={contacts.loading}
        />
        <MetricCard
          label="Novos leads" value={String(m.novosLeadsCount)} icon={<Plus size={14} />}
          deltaPct={d(m.novosLeadsCount, mPrev.novosLeadsCount)} sublabel={vsLabel} loading={contacts.loading}
        />
        <MetricCard
          label="Deals parados" value={String(m.parados)} icon={<AlertTriangle size={14} />}
          deltaPct={d(m.parados, mPrev.parados)} invertDelta
          sublabel={`sem contato há ${ROT_DAYS}d+`} loading={contacts.loading}
        />
      </div>

      {/* Funil de conversão + desempenho por canal */}
      {!contacts.loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <Panel title="Conversão por etapa" hint={isAllTime ? 'todo o histórico' : 'leads do período'}>
            {funil[0]?.quantidade === 0 ? (
              <EmptyState icon={<Inbox size={24} color={text.dim} />} title="Nenhum lead no período" description="Adicione leads para ver o funil de conversão." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {funil.map((f, i) => {
                  const base = funil[0].quantidade || 1;
                  const largura = Math.max(3, (f.quantidade / base) * 100);
                  return (
                    <div key={f.etapa}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11.5px', color: text.secondary, fontWeight: 500 }}>{f.etapa}</span>
                        <span style={{ fontSize: '11.5px', color: text.tertiary }}>
                          <strong style={{ color: chart.light, fontWeight: 650 }}>{f.quantidade}</strong>
                          {i > 0 && <span style={{ marginLeft: '6px' }}>{f.conversaoEtapa}%</span>}
                        </span>
                      </div>
                      <div style={{ height: '6px', background: surface.input, borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${largura}%`, height: '100%', background: f.color,
                          borderRadius: '3px', transition: 'width .5s cubic-bezier(0.4,0,0.2,1)',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          <Panel title="Desempenho por canal" hint="receita gerada">
            {porOrigem.length === 0 ? (
              <EmptyState icon={<Inbox size={24} color={text.dim} />} title="Nenhum lead no período" description="Adicione leads para ver o desempenho por canal." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 52px 52px 74px', gap: '8px', padding: '0 0 7px 0', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em', color: text.label, fontWeight: 600 }}>
                  <span>Canal</span><span style={{ textAlign: 'right' }}>Leads</span>
                  <span style={{ textAlign: 'right' }}>Win</span><span style={{ textAlign: 'right' }}>Receita</span>
                </div>
                {porOrigem.slice(0, 6).map((r) => (
                  <div key={r.origem} style={{
                    display: 'grid', gridTemplateColumns: '1fr 52px 52px 74px', gap: '8px',
                    padding: '7px 0', borderTop: `1px solid ${surface.input}`,
                    fontSize: '12px', alignItems: 'center',
                  }}>
                    <span style={{ color: chart.light, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.origem}</span>
                    <span style={{ textAlign: 'right', color: text.secondary }}>{r.leads}</span>
                    <span style={{ textAlign: 'right', color: r.winRate >= 50 ? chart.revenue : text.secondary, fontWeight: 600 }}>{r.winRate}%</span>
                    <span style={{ textAlign: 'right', color: r.receita > 0 ? chart.revenue : text.label, fontWeight: 600 }}>{fmtMoney(r.receita)}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      )}

      {contacts.loading ? (
        <QueryLoading height={300} />
      ) : view === 'board' ? (
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px' }}>
          {STAGES.map((stage) => {
            const cards = visiveis.filter((c) => c.etapa === stage.key);
            const total = cards.reduce((s, c) => s + c.valor, 0);
            return (
              <div
                key={stage.key}
                onDragOver={(e) => { e.preventDefault(); setOverCol(stage.key); }}
                onDragLeave={() => setOverCol((p) => (p === stage.key ? null : p))}
                onDrop={() => { if (dragId) moveTo(dragId, stage.key); setDragId(null); setOverCol(null); }}
                style={{
                  flex: '0 0 250px', minWidth: '250px',
                  background: overCol === stage.key ? surface.hover : surface.card,
                  border: `1px solid ${overCol === stage.key ? 'rgba(255,255,255,0.4)' : surface.borderStrong}`,
                  borderRadius: '12px', padding: '10px', transition: 'background 150ms, border-color 150ms',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', padding: '2px 4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: stage.color }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: text.bright }}>{stage.key}</span>
                    <span style={{ fontSize: '11px', color: text.dim }}>{cards.length}</span>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: text.secondary, padding: '0 4px 8px 4px', fontWeight: 600 }}>{fmtMoney(total)}</div>

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
                          background: surface.elevated, border: `1px solid ${rot ? 'rgba(239,68,68,0.35)' : surface.borderStrong}`,
                          borderRadius: '10px', padding: '10px', cursor: 'grab',
                          opacity: dragId === c.id ? 0.5 : 1,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: surface.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', color: text.white, fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>
                            {initials(c.nome)}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: text.bright, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nome}</div>
                            <div style={{ fontSize: '11px', color: text.secondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.empresa || '—'}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: c.etapa === 'Ganho' ? chart.revenue : chart.light }}>{fmtMoney(c.valor)}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {rot && <span title={`Parado há ${daysSince(c.updated_at)} dias`} style={{ display: 'flex', color: semantic.danger }}><AlertTriangle size={13} /></span>}
                            <span style={{ fontSize: '10px', color: text.dim }}>{daysSince(c.updated_at)}d</span>
                            {isTouch && (
                              <button onClick={() => setMoveFor(c)} style={cardBtn} aria-label={`Mover ${c.nome}`} title="Mover para outra fase"><GripVertical size={13} /></button>
                            )}
                            <button onClick={() => handleOpenModal(c)} style={cardBtn} aria-label={`Editar ${c.nome}`}><Edit2 size={13} /></button>
                            <button onClick={() => setConfirmDelete(c)} style={cardBtn} aria-label={`Deletar ${c.nome}`}><Trash2 size={13} /></button>
                          </div>
                        </div>
                        {(c.origem || (isOpen(c.etapa) && c.data_prevista) || (!isOpen(c.etapa) && c.motivo)) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                            {c.origem && <span style={tag}>{c.origem}</span>}
                            {isOpen(c.etapa) && c.data_prevista && <span style={{ fontSize: '10px', color: text.tertiary }}>fecha {fmtDate(c.data_prevista)}</span>}
                            {!isOpen(c.etapa) && c.motivo && <span style={{ fontSize: '10px', color: text.tertiary }}>{c.motivo}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {cards.length === 0 && (
                    <EmptyState
                      icon={<Inbox size={18} color={text.dim} />}
                      title={isTouch ? 'Toque para mover' : 'Arraste um lead aqui'}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: surface.card, border: `1px solid ${surface.borderStrong}`, borderRadius: '12px', overflow: 'hidden' }}>
          {visiveis.length === 0 ? (
            <EmptyState
              icon={<Inbox size={24} color={text.dim} />}
              title={items.length === 0 ? 'Nenhum lead cadastrado' : 'Nenhum lead encontrado'}
              description={items.length === 0
                ? 'Clique em "Novo Lead" para começar a organizar seus deals.'
                : 'Altere os filtros ou troque o período no topo da tela.'}
              actionLabel={items.length === 0 ? 'Novo Lead' : undefined}
              onAction={items.length === 0 ? () => handleOpenModal() : undefined}
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: surface.input, borderBottom: `1px solid ${surface.borderStrong}` }}>
                    <th style={thStyle}>Lead</th>
                    <th style={thStyle}>Empresa</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Valor</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Fase</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Dias</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map((c) => (
                    <tr key={c.id} style={{ borderBottom: `1px solid ${surface.divider}` }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = surface.input)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: text.bright, fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: surface.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', color: text.white, fontSize: '11px', fontWeight: 700 }}>{initials(c.nome)}</div>
                          {c.nome}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: text.secondaryAlt }}>{c.empresa || '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: c.etapa === 'Ganho' ? chart.revenue : chart.light, fontWeight: 600, textAlign: 'center' }}>{fmtMoney(c.valor)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: STAGE_MAP[c.etapa]?.color ?? text.secondary, background: `${STAGE_MAP[c.etapa]?.color ?? text.secondary}1f`, padding: '3px 10px', borderRadius: '999px' }}>{c.etapa}</span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: daysSince(c.updated_at) >= ROT_DAYS && isOpen(c.etapa) ? semantic.danger : text.secondary }}>{daysSince(c.updated_at)}d</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button onClick={() => handleOpenModal(c)} style={cardBtn} aria-label={`Editar ${c.nome}`}><Edit2 size={16} /></button>
                          <button onClick={() => setConfirmDelete(c)} style={cardBtn} aria-label={`Deletar ${c.nome}`}><Trash2 size={16} /></button>
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
          <Input label="Nome *" placeholder="João Silva" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
          <Input label="Email *" type="email" placeholder="joao@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <Input label="Empresa" placeholder="Tech Corp" value={formData.empresa} onChange={(e) => setFormData({ ...formData, empresa: e.target.value })} />
          <Input label="Telefone" placeholder="11 98765-4321" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} />
          <Input label="Valor (R$)" type="number" placeholder="50000" value={formData.valor} onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })} />
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: text.secondary, marginBottom: '6px' }}>Fase</label>
            <select
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: surface.input, border: `1px solid ${surface.borderStrong}`, color: text.bright, fontSize: '13px' }}
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

      <Modal isOpen={moveFor !== null} onClose={() => setMoveFor(null)} title="Mover para outra fase" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {STAGES.map((s) => {
            const active = moveFor?.etapa === s.key;
            return (
              <button
                key={s.key}
                onClick={() => { if (moveFor) moveTo(moveFor.id, s.key); setMoveFor(null); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '12px',
                  borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                  background: active ? surface.hover : surface.input,
                  border: `1px solid ${active ? surface.borderHover : surface.borderStrong}`,
                  color: text.primary, fontSize: '13px', fontWeight: active ? 650 : 500,
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
                {s.key}
                {active && <span style={{ marginLeft: 'auto', fontSize: '11px', color: text.label }}>fase atual</span>}
              </button>
            );
          })}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { if (confirmDelete) handleDelete(confirmDelete.id); }}
        title="Deletar lead"
        message={`Tem certeza que deseja deletar o lead "${confirmDelete?.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Deletar"
        danger
      />
    </div>
  );
}

function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: surface.card, border: `1px solid ${surface.border}`, borderRadius: '10px', padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '12.5px', fontWeight: 650, color: text.primary, margin: 0, letterSpacing: '-0.01em' }}>{title}</h3>
        {hint && <span style={{ fontSize: '10.5px', color: text.label }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function ViewBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
      fontSize: '12px', fontWeight: 600,
      background: active ? surface.active : 'transparent', color: active ? chart.light : chart.line,
    }}>{icon}{label}</button>
  );
}

const thStyle: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: text.secondary };
const cardBtn: React.CSSProperties = { background: 'transparent', border: 'none', color: text.secondary, cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' };
const lbl: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 600, color: text.muted, marginBottom: '6px' };
const fld: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', background: surface.input, border: `1px solid ${surface.borderStrong}`, color: chart.light, fontSize: '13px' };
const tag: React.CSSProperties = { fontSize: '10px', fontWeight: 500, color: chart.line, background: surface.divider, padding: '2px 7px', borderRadius: '5px' };
