/**
 * RAVO OS — Metas
 *
 * Metas mensais com cadastro manual. O "realizado" pode ser digitado (meta
 * livre) ou puxado automaticamente de uma métrica do CRM/Financeiro — nesse
 * caso o número acompanha o sistema sozinho, sem atualização manual.
 */

import { useState, useMemo } from 'react';
import { Target, TrendingUp, AlertCircle, CheckCircle2, Plus, Edit2, Trash2, Zap } from 'lucide-react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { ProgressBar } from '@/components/ProgressBar';
import { QueryError, QueryLoading } from '@/components/QueryState';
import { MetricCard } from '@/components/MetricCard';
import { sb as supabase } from '@/services/supabase';
import { useGoalsData, useContactsData, GoalData, GoalMetric, GoalUnit } from '@/hooks/usePagesQueries';
import { usePeriod, monthISO, monthLabelLong, toMonthKey } from '@/contexts/PeriodContext';
import { computeCrmMetrics } from '@/utils/crmMetrics';
import { fmtMoney } from '@/utils/format';
import { useRevalidateStore } from '@/store/revalidate.store';
import { useThemeTokens } from '@/hooks/useThemeTokens';

/** Catálogo de métricas automáticas — o realizado vem do próprio sistema. */
const METRICAS: { value: GoalMetric; label: string; unidade: GoalUnit; hint: string }[] = [
  { value: 'manual', label: 'Manual (eu atualizo)', unidade: 'numero', hint: 'Você digita o realizado' },
  { value: 'receita_ganha', label: 'Receita fechada', unidade: 'moeda', hint: 'Soma dos deals ganhos no mês' },
  { value: 'deals_ganhos', label: 'Deals fechados', unidade: 'numero', hint: 'Quantidade de deals ganhos' },
  { value: 'novos_leads', label: 'Novos leads', unidade: 'numero', hint: 'Leads criados no mês' },
  { value: 'pipeline_aberto', label: 'Pipeline aberto', unidade: 'moeda', hint: 'Valor em aberto no funil' },
  { value: 'ticket_medio', label: 'Ticket médio', unidade: 'moeda', hint: 'Receita média por deal ganho' },
  { value: 'win_rate', label: 'Win rate', unidade: 'percentual', hint: '% de deals ganhos vs decididos' },
];
const METRICA_MAP = Object.fromEntries(METRICAS.map((m) => [m.value, m] as const));

const fmtValor = (v: number, u: GoalUnit) => {
  if (u === 'moeda') return fmtMoney(v);
  if (u === 'percentual') return `${Math.round(v)}%`;
  return v.toLocaleString('pt-BR');
};

interface GoalForm {
  nome: string; meta: number; realizado: number; metrica: GoalMetric;
}
const EMPTY_FORM: GoalForm = { nome: '', meta: 0, realizado: 0, metrica: 'manual' };

export default function GoalsPage() {
  const { chart, text, surface, semantic, soft, layout, type } = useThemeTokens();
  const goals = useGoalsData();
  const contacts = useContactsData();
  const { effectiveMonth, isAllTime, label: periodLabel } = usePeriod();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GoalForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // Métricas do CRM no mês de referência — alimentam as metas automáticas.
  const crm = useMemo(
    () => computeCrmMetrics(contacts.data, isAllTime ? null : effectiveMonth),
    [contacts.data, isAllTime, effectiveMonth]
  );

  /** Valor realizado de uma meta: automático (do CRM) ou o que foi digitado. */
  const realizadoDe = (g: GoalData): number => {
    switch (g.metrica) {
      case 'receita_ganha': return crm.receitaGanha;
      case 'deals_ganhos': return crm.ganhos.length;
      case 'novos_leads': return crm.novosLeadsCount;
      case 'pipeline_aberto': return crm.pipelineAberto;
      case 'ticket_medio': return crm.ticketMedio;
      case 'win_rate': return crm.winRate;
      default: return g.realizado;
    }
  };

  // Metas do mês selecionado (ou todas, na visão acumulada)
  const lista = useMemo(() => {
    const base = isAllTime
      ? goals.data
      : goals.data.filter((g) => g.mes && toMonthKey(new Date(g.mes)) === effectiveMonth);
    return base.map((g) => {
      const realizado = realizadoDe(g);
      const percentual = g.meta > 0 ? Math.round((realizado / g.meta) * 100) : 0;
      return { ...g, realizado, percentual };
    });
    // realizadoDe depende de crm, já memoizado acima
  }, [goals.data, isAllTime, effectiveMonth, crm]);

  const atingidas = lista.filter((g) => g.percentual >= 100).length;
  const emRisco = lista.filter((g) => g.percentual < 50).length;
  const progressoMedio = lista.length > 0
    ? Math.round(lista.reduce((s, g) => s + Math.min(g.percentual, 100), 0) / lista.length)
    : 0;

  const openModal = (g?: GoalData) => {
    setMutationError(null);
    if (g) {
      setForm({ nome: g.nome, meta: g.meta, realizado: g.realizado, metrica: g.metrica });
      setEditingId(g.id);
    } else {
      setForm(EMPTY_FORM); setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nome.trim()) { setMutationError('Dê um nome para a meta.'); return; }
    if (!form.meta || form.meta <= 0) { setMutationError('O alvo precisa ser maior que zero.'); return; }
    setSaving(true); setMutationError(null);

    const unidade = METRICA_MAP[form.metrica]?.unidade ?? 'numero';
    const payload = {
      nome: form.nome.trim(),
      meta: form.meta,
      realizado: form.metrica === 'manual' ? form.realizado : 0,
      metrica: form.metrica,
      unidade,
      mes: monthISO(effectiveMonth),
      updated_at: new Date().toISOString(),
    };

    const { error } = editingId
      ? await supabase.from('metas').update(payload).eq('id', editingId)
      : await supabase.from('metas').insert([payload]);

    setSaving(false);
    if (error) { setMutationError(error.message); return; }
    setShowModal(false);
    goals.refetch();
    useRevalidateStore.getState().invalidate();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir esta meta?')) return;
    setMutationError(null);
    const { error } = await supabase.from('metas').delete().eq('id', id);
    if (error) { setMutationError(error.message); return; }
    goals.refetch();
    useRevalidateStore.getState().invalidate();
  };

  const unidadeForm = METRICA_MAP[form.metrica]?.unidade ?? 'numero';

  const lbl: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 600, color: text.muted, marginBottom: '6px' };
  const fld: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    background: surface.input, border: `1px solid ${surface.borderStrong}`,
    color: chart.light, fontSize: '13px', boxSizing: 'border-box',
  };

  return (
    <div style={{ maxWidth: layout.pageMaxWidth, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ ...type.pageTitle, color: text.primary, margin: '0 0 4px 0' }}>Metas</h1>
          <p style={{ fontSize: '14px', color: text.secondary, margin: 0 }}>
            {periodLabel} · {lista.length} {lista.length === 1 ? 'meta' : 'metas'} · {atingidas} {atingidas === 1 ? 'atingida' : 'atingidas'}
          </p>
        </div>
        <Button onClick={() => openModal()} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Plus size={16} /> Nova Meta
        </Button>
      </div>

      {goals.error && <QueryError message={goals.error} onRetry={goals.refetch} />}
      {mutationError && !showModal && <QueryError message={mutationError} />}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <MetricCard label="Progresso médio" value={`${progressoMedio}%`} icon={<TrendingUp size={14} />}
          progress={progressoMedio} loading={goals.loading} />
        <MetricCard label="Metas atingidas" value={`${atingidas}/${lista.length}`} icon={<CheckCircle2 size={14} />}
          sublabel="alvo alcançado" loading={goals.loading} />
        <MetricCard label="Em risco" value={String(emRisco)} icon={<AlertCircle size={14} />}
          sublabel="abaixo de 50%" loading={goals.loading} />
        <MetricCard label="Automáticas" value={String(lista.filter((g) => g.metrica !== 'manual').length)}
          icon={<Zap size={14} />} sublabel="puxam do sistema" loading={goals.loading} />
      </div>

      {/* Lista */}
      {goals.loading ? (
        <QueryLoading height={220} />
      ) : lista.length === 0 ? (
        <div style={{
          background: surface.card, border: `1px solid ${surface.borderStrong}`, borderRadius: '12px',
          padding: '44px 32px', textAlign: 'center',
        }}>
          <Target size={26} style={{ color: surface.skeleton, marginBottom: '12px' }} />
          <div style={{ fontSize: '14px', color: chart.light, fontWeight: 600, marginBottom: '4px' }}>
            Nenhuma meta em {periodLabel.toLowerCase()}
          </div>
          <div style={{ fontSize: '12.5px', color: text.tertiary, marginBottom: '18px' }}>
            Defina um alvo e acompanhe o progresso — o sistema pode calcular o realizado sozinho.
          </div>
          <Button onClick={() => openModal()} style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
            <Plus size={15} /> Criar primeira meta
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
          {lista.map((g) => {
            const pct = Math.min(g.percentual, 100);
            const cor = g.percentual >= 100 ? chart.revenue : g.percentual >= 50 ? chart.light : chart.line;
            const auto = g.metrica !== 'manual';
            return (
              <div key={g.id} style={{
                background: surface.card, border: `1px solid ${surface.border}`,
                borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '10px' }}>
                  <div style={{ minWidth: 0 }}>
                    <h4 style={{ fontSize: '13.5px', fontWeight: 650, color: text.primary, margin: '0 0 4px 0', letterSpacing: '-0.01em' }}>{g.nome}</h4>
                    <p style={{ fontSize: '11.5px', color: text.tertiary, margin: 0 }}>
                      {fmtValor(g.realizado, g.unidade)} de {fmtValor(g.meta, g.unidade)}
                      {auto && <span style={{ marginLeft: '6px', color: text.label }}>· auto</span>}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button onClick={() => openModal(g)} aria-label={`Editar ${g.nome}`}
                      style={{ background: 'transparent', border: 'none', color: text.tertiary, cursor: 'pointer', padding: '3px', display: 'flex' }}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => handleDelete(g.id)} aria-label={`Excluir ${g.nome}`}
                      style={{ background: 'transparent', border: 'none', color: text.tertiary, cursor: 'pointer', padding: '3px', display: 'flex' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <ProgressBar value={pct} showValue={false} color={cor} animated={false} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '18px', fontWeight: 650, color: cor, letterSpacing: '-0.02em' }}>{g.percentual}%</span>
                  <span style={{
                    fontSize: '10.5px', fontWeight: 600, padding: '3px 8px', borderRadius: '5px',
                    color: g.percentual >= 100 ? chart.revenue : g.percentual >= 50 ? text.secondary : semantic.danger,
                    background: g.percentual >= 100 ? soft.revenue : g.percentual >= 50 ? surface.divider : soft.danger,
                  }}>
                    {g.percentual >= 100 ? 'Atingida' : g.percentual >= 50 ? 'Em andamento' : 'Em risco'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal criar/editar */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Editar Meta' : 'Nova Meta'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={lbl}>Nome da meta *</label>
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Receita de julho" style={fld} />
          </div>

          <div>
            <label style={lbl}>Como medir o realizado</label>
            <select value={form.metrica}
              onChange={(e) => setForm({ ...form, metrica: e.target.value as GoalMetric })} style={fld}>
              {METRICAS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <p style={{ fontSize: '11px', color: text.tertiary, margin: '6px 0 0 0' }}>
              {METRICA_MAP[form.metrica]?.hint}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: form.metrica === 'manual' ? '1fr 1fr' : '1fr', gap: '12px' }}>
            <div>
              <label style={lbl}>
                Alvo * {unidadeForm === 'moeda' ? '(R$)' : unidadeForm === 'percentual' ? '(%)' : ''}
              </label>
              <input type="number" min={0} value={form.meta || ''}
                onChange={(e) => setForm({ ...form, meta: Number(e.target.value) })}
                placeholder="0" style={fld} />
            </div>
            {form.metrica === 'manual' && (
              <div>
                <label style={lbl}>Realizado</label>
                <input type="number" min={0} value={form.realizado || ''}
                  onChange={(e) => setForm({ ...form, realizado: Number(e.target.value) })}
                  placeholder="0" style={fld} />
              </div>
            )}
          </div>

          <p style={{ fontSize: '11.5px', color: text.label, margin: 0 }}>
            Meta do mês de <strong style={{ color: text.secondary }}>{monthLabelLong(effectiveMonth)}</strong>
            {isAllTime && ' (mês atual — troque o período no topo para outro mês)'}
          </p>

          {mutationError && <QueryError message={mutationError} />}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button onClick={() => setShowModal(false)} style={{
              padding: '9px 16px', borderRadius: '8px', border: `1px solid ${surface.borderStrong}`,
              background: 'transparent', color: text.secondary, fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}>Cancelar</button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando…' : editingId ? 'Salvar' : 'Criar meta'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
