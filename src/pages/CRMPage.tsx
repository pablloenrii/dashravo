/**
 * RAVO OS — CRM Pipeline (estilo Pipedrive)
 * Kanban de leads com drag-and-drop, fases, forecast ponderado e insights.
 * Toggle Board / Lista. CRUD real contra Supabase (tabela `contatos`).
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Trash2, Edit2, LayoutGrid, List as ListIcon, GripVertical,
  DollarSign, Target, Percent, AlertTriangle, Search, X,
  Inbox, Filter, CheckSquare, Bookmark, ChevronDown, Save,
} from 'lucide-react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Input } from '@/components/Input';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { QueryError, QueryLoading } from '@/components/QueryState';
import { MetricCard } from '@/components/MetricCard';
import { SectionLabel, HeroStat, Panel, heroGrid, panelGrid } from '@/components/SectionKit';
import { LeadDrawer } from '@/components/LeadDrawer';
import { sb as supabase } from '@/services/supabase';
import { useContactsData, ContactData, useFollowUpsData, NextFollowUp } from '@/hooks/usePagesQueries';
import { usePeriod, prevMonthKey, monthLabel } from '@/contexts/PeriodContext';
import { fmtMoneyCents, pctChange } from '@/utils/format';
import { toastSuccess, toastError } from '@/utils/toast';
import {
  STAGES, STAGE_MAP, isOpen, daysSince, ROT_DAYS,
  computeCrmMetrics, computeFunnel, computeBySource,
} from '@/utils/crmMetrics';
import { useRevalidateStore } from '@/store/revalidate.store';
import { useThemeTokens } from '@/hooks/useThemeTokens';

const ORIGENS = ['Indicação', 'Inbound', 'Outbound', 'Evento', 'Site', 'Outro'];

/** Views salvas do CRM — combinações de busca/filtros nomeadas, persistidas
 *  localmente (app single-user, não precisa de tabela no banco). */
const SAVED_VIEWS_KEY = 'ravo_crm_saved_views_v1';
interface SavedView { id: string; nome: string; searchTerm: string; filterEtapa: string; filterOrigem: string }
function loadSavedViews(): SavedView[] {
  try {
    const raw = localStorage.getItem(SAVED_VIEWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
function persistSavedViews(views: SavedView[]) {
  try { localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(views)); } catch { /* localStorage indisponível — ignora */ }
}

/** Rótulo curto do follow-up mais próximo de um lead: "atrasado", "hoje" ou "em Nd". */
function followUpLabel(dataPrevista: string): { texto: string; atrasado: boolean } {
  const hoje = new Date(new Date().toDateString());
  const alvo = new Date(`${dataPrevista}T00:00:00`);
  const dias = Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
  if (dias < 0) return { texto: `atrasado ${Math.abs(dias)}d`, atrasado: true };
  if (dias === 0) return { texto: 'hoje', atrasado: false };
  return { texto: `em ${dias}d`, atrasado: false };
}

/** Tipo de receita do contrato criado ao marcar um deal como Ganho — mesmo
 *  vocabulário de `contratos.tipo` no schema de software house. */
const TIPO_RECEITA_OPTIONS: { value: string; label: string }[] = [
  { value: 'retainer', label: 'Retainer mensal (recorrente)' },
  { value: 'licenca', label: 'Licença de SaaS (recorrente)' },
  { value: 'projeto', label: 'Projeto — escopo fechado' },
  { value: 'hora', label: 'Hora / alocação' },
];
const PRECO_FIELD: Record<string, 'valor_mensal' | 'valor_total' | 'valor_hora'> = {
  retainer: 'valor_mensal', licenca: 'valor_mensal', projeto: 'valor_total', hora: 'valor_hora',
};

const initials = (nome: string) =>
  nome.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
const fmtDate = (iso: string) => { const d = new Date(iso); return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`; };

interface ContactForm {
  nome: string; empresa: string; email: string; telefone: string; valor: number; etapa: string;
  origem: string; dataPrevista: string; motivo: string; tipoReceita: string;
}
const EMPTY_FORM: ContactForm = { nome: '', empresa: '', email: '', telefone: '', valor: 0, etapa: 'Novo Lead', origem: '', dataPrevista: '', motivo: '', tipoReceita: '' };

export default function CRMPage() {
  const contacts = useContactsData();
  const followUps = useFollowUpsData();
  const { month, isAllTime, label: periodLabel } = usePeriod();
  const { chart, text, surface, semantic, layout, type } = useThemeTokens();

  const [items, setItems] = useState<ContactData[]>([]);
  useEffect(() => { setItems(contacts.data); }, [contacts.data]);

  const followUpMap = useMemo(() => {
    const map = new Map<string, NextFollowUp>();
    for (const f of followUps.data) map.set(f.contato_id, f);
    return map;
  }, [followUps.data]);

  const [view, setView] = useState<'board' | 'list'>('board');
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const [moveFor, setMoveFor] = useState<ContactData | null>(null);

  // --- Ficha do lead (drawer) ---
  const [openContact, setOpenContact] = useState<ContactData | null>(null);
  // Mantém a ficha aberta em sincronia com `items` (ex.: depois de editar pelo modal).
  useEffect(() => {
    if (!openContact) return;
    const fresh = items.find((c) => c.id === openContact.id);
    if (!fresh) { setOpenContact(null); return; }
    if (fresh !== openContact) setOpenContact(fresh);
  }, [items, openContact]);

  const isTouch = useMemo(
    () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0),
    []
  );
  // Tela estreita (celular): board vira uma coluna só com seletor de fase,
  // em vez de 7 colunas fixas de 250px forçando scroll horizontal constante.
  const isNarrow = useMemo(() => typeof window !== 'undefined' && window.innerWidth < 640, []);
  const [mobileStage, setMobileStage] = useState<string>(STAGES[0].key);

  // --- Busca e filtros ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEtapa, setFilterEtapa] = useState('');
  const [filterOrigem, setFilterOrigem] = useState('');

  // --- Views salvas (localStorage) ---
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  useEffect(() => { setSavedViews(loadSavedViews()); }, []);
  const [showViewsMenu, setShowViewsMenu] = useState(false);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const hasActiveFilters = Boolean(searchTerm || filterEtapa || filterOrigem);

  const applyView = (v: SavedView) => {
    setSearchTerm(v.searchTerm); setFilterEtapa(v.filterEtapa); setFilterOrigem(v.filterOrigem);
    setShowViewsMenu(false);
  };
  const saveCurrentView = () => {
    if (!newViewName.trim()) { toastError('Dê um nome para a view.'); return; }
    const view: SavedView = {
      id: crypto.randomUUID(), nome: newViewName.trim(),
      searchTerm, filterEtapa, filterOrigem,
    };
    const next = [...savedViews, view];
    setSavedViews(next); persistSavedViews(next);
    setShowSaveViewModal(false); setNewViewName('');
    toastSuccess('View salva');
  };
  const deleteView = (id: string) => {
    const next = savedViews.filter((v) => v.id !== id);
    setSavedViews(next); persistSavedViews(next);
  };

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
      setFormData({ nome: c.nome, empresa: c.empresa, email: c.email, telefone: c.telefone ?? '', valor: c.valor, etapa: c.etapa, origem: c.origem ?? '', dataPrevista: c.data_prevista ?? '', motivo: c.motivo ?? '', tipoReceita: c.tipo_receita ?? '' });
      setEditingId(c.id);
    } else {
      setFormData(EMPTY_FORM); setEditingId(null);
    }
    setShowModal(true);
  };

  /**
   * Cria/atualiza o contrato real no schema de software house quando um deal é
   * marcado como Ganho — é essa ponte que faz o Dashboard executivo (Resultado,
   * Previsibilidade, Carteira) refletir vendas fechadas no CRM. Sem `tipoReceita`
   * não há como decidir o campo de preço certo (mensal/total/hora), então a
   * integração é recusada com um aviso em vez de adivinhar.
   */
  const integrateWonDeal = async (deal: {
    id: string; nome: string; empresa: string; origem?: string;
    valor: number; tipoReceita?: string; contratoId?: number | null;
  }) => {
    try {
      if (!deal.tipoReceita) {
        toastError('Lead marcado como Ganho, mas sem "Tipo de receita" — não integrado ao Dashboard. Edite o lead pra corrigir.');
        return;
      }
      const precoField = PRECO_FIELD[deal.tipoReceita];
      if (!precoField) return;

      let contratoId = deal.contratoId ?? null;

      if (contratoId) {
        const { error } = await supabase.from('contratos')
          .update({ [precoField]: deal.valor, tipo: deal.tipoReceita, status: 'ativo' })
          .eq('id', contratoId);
        if (error) { toastError(`Lead salvo, mas não atualizou o contrato: ${error.message}`); return; }
      } else {
        const clienteNome = (deal.empresa || deal.nome).trim();
        let clienteId: number | undefined;
        const { data: existingCliente } = await supabase
          .from('clientes').select('id').ilike('nome', clienteNome).maybeSingle();

        if (existingCliente) {
          clienteId = existingCliente.id;
        } else {
          const { data: createdCliente, error: clienteError } = await supabase
            .from('clientes')
            .insert([{
              nome: clienteNome, origem: deal.origem || null, status: 'ativo',
              cliente_desde: new Date().toISOString().slice(0, 10),
            }])
            .select('id').single();
          if (clienteError) { toastError(`Lead salvo, mas não integrou ao Dashboard: ${clienteError.message}`); return; }
          clienteId = createdCliente?.id;
        }
        if (!clienteId) return;

        const { data: createdContrato, error: contratoError } = await supabase
          .from('contratos')
          .insert([{
            cliente_id: clienteId, nome: deal.nome, tipo: deal.tipoReceita,
            [precoField]: deal.valor, data_inicio: new Date().toISOString().slice(0, 10),
            status: 'ativo',
          }])
          .select('id').single();
        if (contratoError) { toastError(`Lead salvo, mas não integrou ao Dashboard: ${contratoError.message}`); return; }
        contratoId = createdContrato?.id ?? null;

        const { error: linkError } = await supabase.from('contatos').update({ contrato_id: contratoId }).eq('id', deal.id);
        if (linkError) { toastError(`Contrato criado, mas não vinculado ao lead: ${linkError.message}`); return; }
      }

      // Reconhece a receita no mês corrente via fatura — sem isso, o contrato existe
      // mas nada aparece em Resultado/Receita reconhecida no Dashboard.
      const mesISO = `${new Date().toISOString().slice(0, 7)}-01`;
      const { data: existingFatura } = await supabase
        .from('faturas').select('id').eq('contrato_id', contratoId).eq('competencia', mesISO).maybeSingle();

      const { error: faturaError } = existingFatura
        ? await supabase.from('faturas').update({ valor: deal.valor }).eq('id', existingFatura.id)
        : await supabase.from('faturas').insert([{ contrato_id: contratoId, competencia: mesISO, valor: deal.valor, status: 'emitida' }]);

      if (faturaError) { toastError(`Contrato criado, mas a fatura do mês não foi registrada: ${faturaError.message}`); return; }

      toastSuccess('Lead integrado ao Dashboard — contrato e fatura criados');
      contacts.refetch();
    } catch (err) {
      toastError(`Lead salvo, mas não integrou ao Dashboard: ${err instanceof Error ? err.message : 'erro desconhecido'}`);
    }
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.email) { toastError('Nome e email são obrigatórios.'); return; }
    if (formData.etapa === 'Ganho' && !formData.tipoReceita) {
      toastError('Escolha o "Tipo de receita" para integrar esse lead ao Dashboard.');
      return;
    }
    setSaving(true);
    const payload = {
      nome: formData.nome, empresa: formData.empresa || null, email: formData.email,
      telefone: formData.telefone || null, valor: formData.valor, etapa: formData.etapa,
      origem: formData.origem || null, data_prevista: formData.dataPrevista || null, motivo: formData.motivo || null,
      tipo_receita: formData.tipoReceita || null,
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
      const existente = editingId ? items.find((c) => c.id === editingId) : undefined;
      await integrateWonDeal({
        id: saved.id, nome: formData.nome, empresa: formData.empresa, origem: formData.origem,
        valor: formData.valor, tipoReceita: formData.tipoReceita, contratoId: existente?.contrato_id ?? null,
      });
    }
    useRevalidateStore.getState().invalidate();
  };

  const handleDelete = async (id: string) => {
    const prev = items;
    setItems(items.filter((c) => c.id !== id));
    const { error } = await supabase.from('contatos').delete().eq('id', id);
    if (error) { setItems(prev); toastError(error.message); return; }
    toastSuccess('Lead removido');
    setOpenContact((cur) => (cur?.id === id ? null : cur));
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
      await integrateWonDeal({
        id: current.id, nome: current.nome, empresa: current.empresa, origem: current.origem,
        valor: current.valor, tipoReceita: current.tipo_receita, contratoId: current.contrato_id ?? null,
      });
    }
    useRevalidateStore.getState().invalidate();
  };

  /**
   * Gate antes de mover pra Ganho: sem tipo de receita não dá pra criar o
   * contrato certo. Em vez de mover silenciosamente sem integrar, abre a
   * ficha do lead já em "Ganho" pedindo pra escolher o tipo primeiro —
   * mesmo padrão de "campo obrigatório na troca de fase" do Pipedrive.
   */
  const attemptMoveTo = (id: string, etapa: string) => {
    const current = items.find((c) => c.id === id);
    if (etapa === 'Ganho' && current && current.etapa !== 'Ganho' && !current.tipo_receita) {
      toastError('Escolha o "Tipo de receita" antes de marcar como Ganho — é o que integra esse deal ao Dashboard.');
      handleOpenModal(current);
      setFormData((f) => ({ ...f, etapa: 'Ganho' }));
      return;
    }
    void moveTo(id, etapa);
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

  /* --- Sinais de risco do pipeline: o que precisa de atenção sem procurar --- */
  const alertas = useMemo(() => {
    const out: { texto: string; nivel: 'alto' | 'medio' }[] = [];
    if (m.parados > 0) {
      out.push({
        nivel: m.parados >= 3 ? 'alto' : 'medio',
        texto: `${m.parados} deal(s) sem contato há ${ROT_DAYS}+ dias — risco de esfriar`,
      });
    }
    if (!isAllTime && m.novosLeadsCount === 0) {
      out.push({ nivel: 'medio', texto: 'Nenhum lead novo entrou no funil neste período' });
    }
    return out;
  }, [m.parados, m.novosLeadsCount, isAllTime]);

  // Board/lista seguem o mesmo recorte temporal das métricas: em um mês específico,
  // "aberto" é o snapshot de quem já existia e ainda não tinha desfecho até o fim
  // daquele mês (igual a `m.abertos`) — não "tudo que está aberto agora".
  // Isso é o que faz trocar o mês no seletor realmente mudar o board, e não só os números.
  const visiveis = useMemo(
    () => (isAllTime ? itemsFiltrados : itemsFiltrados.filter((c) => {
      if (m.abertos.some((a) => a.id === c.id)) return true;
      return m.ganhos.some((g) => g.id === c.id) || m.perdidos.some((p) => p.id === c.id);
    })),
    [isAllTime, itemsFiltrados, m.abertos, m.ganhos, m.perdidos]
  );

  const thStyle: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: text.secondary };
  const cardBtn: React.CSSProperties = { background: 'transparent', border: 'none', color: text.secondary, cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 600, color: text.muted, marginBottom: '6px' };
  const fld: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', background: surface.input, border: `1px solid ${surface.borderStrong}`, color: chart.light, fontSize: '13px' };
  const tag: React.CSSProperties = { fontSize: '10px', fontWeight: 500, color: chart.line, background: surface.divider, padding: '2px 7px', borderRadius: '5px' };

  /**
   * Uma coluna do board. Extraída pra ser reaproveitada tanto no layout
   * desktop (7 colunas lado a lado) quanto no mobile (1 coluna + seletor de
   * fase acima) — mesma lógica de drag-and-drop e mesmo card nos dois.
   *
   * Card enxuto: editar/deletar saíram daqui — o clique no card já abre a
   * ficha do lead (drawer), que tem os dois botões. Menos ação competindo
   * por espaço num card de ~250px, e menos risco de toque errado no
   * celular. "Mover" fica sempre visível (não só em touch) — dá um jeito de
   * trocar de fase sem depender de acertar o drag-and-drop, inclusive no
   * desktop (acessibilidade: hoje não existe alternativa de teclado pro
   * drag-and-drop puro).
   */
  function renderColumn(stage: (typeof STAGES)[number], fullWidth: boolean) {
    const cards = visiveis.filter((c) => c.etapa === stage.key);
    const total = cards.reduce((s, c) => s + c.valor, 0);
    return (
      <div
        key={stage.key}
        onDragOver={(e) => { e.preventDefault(); setOverCol(stage.key); }}
        onDragLeave={() => setOverCol((p) => (p === stage.key ? null : p))}
        onDrop={() => { if (dragId) attemptMoveTo(dragId, stage.key); setDragId(null); setOverCol(null); }}
        style={{
          flex: fullWidth ? '1 1 auto' : '0 0 250px', minWidth: fullWidth ? 0 : '250px',
          background: overCol === stage.key ? surface.hover : surface.card,
          border: `1px solid ${overCol === stage.key ? 'rgba(255,255,255,0.4)' : surface.borderStrong}`,
          borderRadius: '12px', padding: '10px', transition: 'background 150ms, border-color 150ms',
        }}
      >
        {!fullWidth && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', padding: '2px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: stage.color }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: text.bright }}>{stage.key}</span>
              <span style={{ fontSize: '11px', color: text.dim }}>{cards.length}</span>
            </div>
          </div>
        )}
        <div style={{ fontSize: '11px', color: text.secondary, padding: '0 4px 8px 4px', fontWeight: 600 }}>{fmtMoneyCents(total)}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '80px' }}>
          {cards.map((c) => {
            const rot = isOpen(c.etapa) && daysSince(c.updated_at) >= ROT_DAYS;
            const fu = followUpMap.get(c.id);
            return (
              <div
                key={c.id}
                draggable
                onDragStart={() => setDragId(c.id)}
                onDragEnd={() => { setDragId(null); setOverCol(null); }}
                onClick={() => setOpenContact(c)}
                style={{
                  background: surface.elevated, border: `1px solid ${rot ? 'rgba(239,68,68,0.35)' : surface.borderStrong}`,
                  borderRadius: '10px', padding: '10px', cursor: 'pointer',
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
                  <span style={{ fontSize: '13px', fontWeight: 700, color: c.etapa === 'Ganho' ? chart.revenue : chart.light }}>{fmtMoneyCents(c.valor)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {rot && <span title={`Parado há ${daysSince(c.updated_at)} dias`} style={{ display: 'flex', color: semantic.danger }}><AlertTriangle size={13} /></span>}
                    <span style={{ fontSize: '10px', color: text.dim }} title="Dias desde a última movimentação">{daysSince(c.updated_at)}d</span>
                    <button onClick={(e) => { e.stopPropagation(); setMoveFor(c); }} style={cardBtn} aria-label={`Mover ${c.nome}`} title="Mover para outra fase"><GripVertical size={13} /></button>
                  </div>
                </div>
                {(c.origem || fu || (isOpen(c.etapa) && c.data_prevista) || (!isOpen(c.etapa) && c.motivo)) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {c.origem && <span style={tag}>{c.origem}</span>}
                    {fu && (() => {
                      const { texto, atrasado } = followUpLabel(fu.data_prevista);
                      return (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: 600,
                          color: atrasado ? semantic.danger : chart.line,
                          background: atrasado ? 'rgba(239,68,68,0.1)' : surface.divider,
                          padding: '2px 7px', borderRadius: '5px',
                        }}>
                          <CheckSquare size={10} /> {texto}
                        </span>
                      );
                    })()}
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
  }

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

      {/* ---------------- Alertas ---------------- */}
      {alertas.length > 0 && !contacts.loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '0 0 16px' }}>
          {alertas.map((a) => (
            <div key={a.texto} style={{
              display: 'flex', alignItems: 'center', gap: '9px',
              padding: '9px 13px', borderRadius: '9px', fontSize: '13px',
              background: a.nivel === 'alto' ? 'rgba(239,68,68,0.07)' : 'rgba(217,119,6,0.07)',
              border: `1px solid ${a.nivel === 'alto' ? semantic.danger : semantic.warning}33`,
              color: text.secondary,
            }}>
              <AlertTriangle
                size={13}
                style={{ color: a.nivel === 'alto' ? semantic.danger : semantic.warning, flexShrink: 0 }}
              />
              {a.texto}
            </div>
          ))}
        </div>
      )}

      {/* ═══════════ PIPELINE ═══════════ */}
      <SectionLabel icon={Target} title="Pipeline" hint="o funil cobre o que preciso fechar?" />

      <div style={heroGrid}>
        <HeroStat
          label="Forecast ponderado" value={fmtMoneyCents(m.forecast)}
          delta={d(m.forecast, mPrev.forecast)}
          sub={`${fmtMoneyCents(m.pipelineAberto)} em aberto · ${m.abertos.length} ${m.abertos.length === 1 ? 'deal' : 'deals'}`}
        />
        <HeroStat
          label="Receita fechada" value={fmtMoneyCents(m.receitaGanha)} tone="positive"
          delta={d(m.receitaGanha, mPrev.receitaGanha)} sub={vsLabel}
        />
        <HeroStat
          label="Win rate" value={`${m.winRate}%`}
          tone={m.winRate >= 40 ? 'positive' : m.winRate >= 20 ? 'warning' : 'negative'}
          delta={d(m.winRate, mPrev.winRate)}
          sub={`${m.ganhos.length} ganhos · ${m.perdidos.length} perdidos`}
        />
        <HeroStat
          label="Ciclo de venda" value={`${m.cicloMedio}d`}
          tone={m.cicloMedio <= 30 ? 'positive' : m.cicloMedio <= 60 ? 'warning' : 'negative'}
          delta={d(m.cicloMedio, mPrev.cicloMedio)}
          sub="lead → fechamento"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))', gap: '12px', marginTop: '12px', marginBottom: '24px' }}>
        <MetricCard
          label="Ticket médio" value={fmtMoneyCents(m.ticketMedio)} icon={<DollarSign size={14} />}
          deltaPct={d(m.ticketMedio, mPrev.ticketMedio)} sublabel={vsLabel} loading={contacts.loading}
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
        <MetricCard
          label="Pipeline aberto" value={fmtMoneyCents(m.pipelineAberto)} icon={<Percent size={14} />}
          deltaPct={d(m.pipelineAberto, mPrev.pipelineAberto)}
          sublabel="valor bruto, sem ponderar" loading={contacts.loading}
        />
      </div>

      {/* ═══════════ FUNIL & CANAIS ═══════════ */}
      <SectionLabel icon={Filter} title="Funil & canais" hint="onde os leads travam e de onde vêm os melhores" />

      {!contacts.loading && (
        <div style={{ ...panelGrid, marginBottom: '8px' }}>
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
                    <span style={{ textAlign: 'right', color: r.receita > 0 ? chart.revenue : text.label, fontWeight: 600 }}>{fmtMoneyCents(r.receita)}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      )}

      {/* ═══════════ DEALS ═══════════ */}
      <SectionLabel
        icon={LayoutGrid} title="Deals"
        hint={isAllTime
          ? 'todo o histórico · arraste no board ou edite pela lista'
          : `snapshot de ${periodLabel} · arraste no board ou edite pela lista`}
      />

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

        {/* --- Views salvas --- */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowViewsMenu((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px', borderRadius: '8px',
              background: surface.input, border: `1px solid ${surface.borderStrong}`, color: text.bright,
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Bookmark size={13} /> Views {savedViews.length > 0 && <span style={{ color: text.dim }}>({savedViews.length})</span>} <ChevronDown size={12} />
          </button>
          {showViewsMenu && (
            <>
              <div onClick={() => setShowViewsMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 41, minWidth: '220px',
                background: surface.elevated, border: `1px solid ${surface.borderStrong}`, borderRadius: '10px',
                boxShadow: '0 12px 28px rgba(0,0,0,0.35)', padding: '6px', display: 'flex', flexDirection: 'column', gap: '2px',
              }}>
                {savedViews.length === 0 ? (
                  <div style={{ fontSize: '12px', color: text.dim, padding: '10px 8px' }}>Nenhuma view salva ainda.</div>
                ) : savedViews.map((v) => (
                  <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={() => applyView(v)}
                      style={{ flex: 1, textAlign: 'left', padding: '8px 8px', borderRadius: '7px', background: 'transparent', border: 'none', color: text.bright, fontSize: '12.5px', cursor: 'pointer' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = surface.hover)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {v.nome}
                    </button>
                    <button onClick={() => deleteView(v.id)} aria-label={`Remover view ${v.nome}`} style={{ background: 'transparent', border: 'none', color: text.dim, cursor: 'pointer', padding: '4px', display: 'flex' }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <div style={{ borderTop: `1px solid ${surface.divider}`, marginTop: '4px', paddingTop: '4px' }}>
                  <button
                    onClick={() => { if (!hasActiveFilters) { toastError('Ajuste a busca ou os filtros antes de salvar uma view.'); return; } setShowViewsMenu(false); setShowSaveViewModal(true); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', textAlign: 'left', padding: '8px 8px', borderRadius: '7px', background: 'transparent', border: 'none', color: chart.line, fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <Save size={13} /> Salvar filtros atuais…
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {contacts.loading ? (
        <QueryLoading height={300} />
      ) : view === 'board' ? (
        isNarrow ? (
          <div>
            {/* Seletor de fase — substitui as 7 colunas lado a lado, que em
                tela estreita viravam um scroll horizontal só de título de
                coluna, sem dar pra comparar fases de verdade. */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '2px' }}>
              {STAGES.map((stage) => {
                const count = visiveis.filter((c) => c.etapa === stage.key).length;
                const active = mobileStage === stage.key;
                return (
                  <button
                    key={stage.key}
                    onClick={() => setMobileStage(stage.key)}
                    style={{
                      flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '7px 12px', borderRadius: '999px', cursor: 'pointer', whiteSpace: 'nowrap',
                      background: active ? surface.active : surface.card,
                      border: `1px solid ${active ? surface.borderHover : surface.borderStrong}`,
                      color: active ? text.bright : text.secondary, fontSize: '12px', fontWeight: 600,
                    }}
                  >
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: stage.color }} />
                    {stage.key} <span style={{ color: text.dim, fontWeight: 500 }}>{count}</span>
                  </button>
                );
              })}
            </div>
            {renderColumn(STAGES.find((s) => s.key === mobileStage) ?? STAGES[0], true)}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px' }}>
            {STAGES.map((stage) => renderColumn(stage, false))}
          </div>
        )
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
                    <th style={{ ...thStyle, textAlign: 'center' }}>Follow-up</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Dias</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map((c) => {
                    const fu = followUpMap.get(c.id);
                    return (
                    <tr key={c.id} style={{ borderBottom: `1px solid ${surface.divider}`, cursor: 'pointer' }}
                      onClick={() => setOpenContact(c)}
                      onMouseEnter={(e) => (e.currentTarget.style.background = surface.input)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: text.bright, fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: surface.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', color: text.white, fontSize: '11px', fontWeight: 700 }}>{initials(c.nome)}</div>
                          {c.nome}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: text.secondaryAlt }}>{c.empresa || '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: c.etapa === 'Ganho' ? chart.revenue : chart.light, fontWeight: 600, textAlign: 'center' }}>{fmtMoneyCents(c.valor)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: STAGE_MAP[c.etapa]?.color ?? text.secondary, background: `${STAGE_MAP[c.etapa]?.color ?? text.secondary}1f`, padding: '3px 10px', borderRadius: '999px' }}>{c.etapa}</span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {fu ? (() => {
                          const { texto, atrasado } = followUpLabel(fu.data_prevista);
                          return (
                            <span style={{ fontSize: '11px', fontWeight: 600, color: atrasado ? semantic.danger : text.secondary }}>{texto}</span>
                          );
                        })() : <span style={{ fontSize: '11px', color: text.dim }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: daysSince(c.updated_at) >= ROT_DAYS && isOpen(c.etapa) ? semantic.danger : text.secondary }}>{daysSince(c.updated_at)}d</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button onClick={(e) => { e.stopPropagation(); handleOpenModal(c); }} style={cardBtn} aria-label={`Editar ${c.nome}`}><Edit2 size={16} /></button>
                          <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(c); }} style={cardBtn} aria-label={`Deletar ${c.nome}`}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
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
          {formData.etapa === 'Ganho' && (
            <div>
              <label style={lbl}>Tipo de receita *</label>
              <select style={fld} value={formData.tipoReceita} onChange={(e) => setFormData({ ...formData, tipoReceita: e.target.value })}>
                <option value="">Selecione…</option>
                {TIPO_RECEITA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div style={{ fontSize: '11px', color: text.faint, marginTop: '4px' }}>
                Cria o contrato real no Dashboard — retainer/licença viram receita recorrente, projeto/hora entram como faturamento fechado.
              </div>
            </div>
          )}
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
                onClick={() => { if (moveFor) attemptMoveTo(moveFor.id, s.key); setMoveFor(null); }}
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

      <Modal isOpen={showSaveViewModal} onClose={() => setShowSaveViewModal(false)} title="Salvar view" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Nome da view"
            placeholder="Ex: Negociação — Inbound"
            value={newViewName}
            onChange={(e) => setNewViewName(e.target.value)}
          />
          <div style={{ fontSize: '11px', color: text.faint }}>
            Salva a busca e os filtros atuais (
            {searchTerm && `busca "${searchTerm}"`}
            {searchTerm && (filterEtapa || filterOrigem) && ' · '}
            {filterEtapa && `fase ${filterEtapa}`}
            {filterEtapa && filterOrigem && ' · '}
            {filterOrigem && `origem ${filterOrigem}`}
            ).
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="ghost" onClick={() => setShowSaveViewModal(false)}>Cancelar</Button>
            <Button onClick={saveCurrentView}>Salvar</Button>
          </div>
        </div>
      </Modal>

      {openContact && (
        <LeadDrawer
          contact={openContact}
          onClose={() => setOpenContact(null)}
          onEdit={(c) => { setOpenContact(null); handleOpenModal(c); }}
          onDelete={(c) => setConfirmDelete(c)}
          onActivityChange={() => followUps.refetch()}
        />
      )}
    </div>
  );
}

function ViewBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  const { chart, surface } = useThemeTokens();
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
      fontSize: '12px', fontWeight: 600,
      background: active ? surface.active : 'transparent', color: active ? chart.light : chart.line,
    }}>{icon}{label}</button>
  );
}
