/**
 * RAVO OS — Ficha do lead (drawer de detalhe, nível Pipedrive)
 *
 * Painel lateral com os dados completos do deal + timeline de atividades
 * (notas, ligações, e-mails, reuniões, tarefas com follow-up). Abre ao
 * clicar em qualquer lead no board ou na lista do CRM.
 */

import { useEffect, useRef, useState } from 'react';
import {
  X, Edit2, Trash2, Mail, Phone, Building2, Calendar, Clock,
  StickyNote, Users, CheckSquare, Plus, Check, Undo2,
} from 'lucide-react';
import { Button } from '@/components/Button';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { fmtMoneyCents } from '@/utils/format';
import { toastError, toastSuccess } from '@/utils/toast';
import {
  ContactData, ActivityData, ActivityType,
  fetchLeadActivities,
} from '@/hooks/usePagesQueries';
import { sb as supabase } from '@/services/supabase';
import { STAGE_MAP, daysSince } from '@/utils/crmMetrics';

const ACTIVITY_TYPES: { value: ActivityType; label: string; icon: typeof StickyNote }[] = [
  { value: 'nota', label: 'Nota', icon: StickyNote },
  { value: 'ligacao', label: 'Ligação', icon: Phone },
  { value: 'email', label: 'E-mail', icon: Mail },
  { value: 'reuniao', label: 'Reunião', icon: Users },
  { value: 'tarefa', label: 'Tarefa', icon: CheckSquare },
];
const ACTIVITY_MAP = Object.fromEntries(ACTIVITY_TYPES.map((t) => [t.value, t])) as Record<ActivityType, typeof ACTIVITY_TYPES[number]>;

const fmtDateFull = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};
const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

interface LeadDrawerProps {
  contact: ContactData | null;
  onClose: () => void;
  onEdit: (c: ContactData) => void;
  onDelete: (c: ContactData) => void;
  /** Chamado sempre que uma atividade é criada/concluída/reaberta — o CRM usa
   *  isso pra revalidar o badge de follow-up dos cards sem esperar o usuário
   *  fechar o drawer. */
  onActivityChange?: () => void;
}

export function LeadDrawer({ contact, onClose, onEdit, onDelete, onActivityChange }: LeadDrawerProps) {
  const { text, surface, semantic, chart } = useThemeTokens();
  const panelRef = useRef<HTMLDivElement>(null);

  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const [novoTipo, setNovoTipo] = useState<ActivityType>('nota');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novaData, setNovaData] = useState('');
  const [saving, setSaving] = useState(false);

  const isOpen = contact !== null;

  useEffect(() => {
    if (!contact) return;
    let active = true;
    setLoadingActivities(true);
    setNovoTipo('nota');
    setNovaDescricao('');
    setNovaData('');
    fetchLeadActivities(contact.id).then(({ data, error }) => {
      if (!active) return;
      if (error) toastError(`Não foi possível carregar as atividades: ${error}`);
      setActivities(data);
      setLoadingActivities(false);
    });
    return () => { active = false; };
  }, [contact?.id]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => panelRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  if (!contact) return null;

  const stage = STAGE_MAP[contact.etapa];

  const handleAddActivity = async () => {
    if (!novaDescricao.trim()) { toastError('Descreva a atividade antes de salvar.'); return; }
    setSaving(true);
    const payload = {
      contato_id: contact.id,
      tipo: novoTipo,
      descricao: novaDescricao.trim(),
      data_prevista: novaData || null,
      concluida: false,
    };
    const { data, error } = await supabase.from('atividades').insert([payload]).select('*').single();
    setSaving(false);
    if (error) { toastError(error.message); return; }
    setActivities((prev) => [{
      id: String(data.id), contato_id: contact.id, tipo: novoTipo,
      descricao: payload.descricao, data_prevista: payload.data_prevista ?? undefined,
      concluida: false, criado_em: data.criado_em,
    }, ...prev]);
    setNovaDescricao('');
    setNovaData('');
    toastSuccess('Atividade registrada');
    onActivityChange?.();
  };

  const toggleConcluida = async (activity: ActivityData) => {
    const concluida = !activity.concluida;
    const prev = activities;
    setActivities((list) => list.map((a) => (a.id === activity.id ? { ...a, concluida, concluida_em: concluida ? new Date().toISOString() : undefined } : a)));
    const { error } = await supabase
      .from('atividades')
      .update({ concluida, concluida_em: concluida ? new Date().toISOString() : null })
      .eq('id', activity.id);
    if (error) { setActivities(prev); toastError(error.message); return; }
    onActivityChange?.();
  };

  const deleteActivity = async (activity: ActivityData) => {
    const prev = activities;
    setActivities((list) => list.filter((a) => a.id !== activity.id));
    const { error } = await supabase.from('atividades').delete().eq('id', activity.id);
    if (error) { setActivities(prev); toastError(error.message); return; }
    onActivityChange?.();
  };

  const pendentes = activities.filter((a) => !a.concluida && a.data_prevista);
  const proximaPendente = pendentes.length > 0 ? pendentes[0] : undefined;

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', zIndex: 50, animation: 'fadeIn 200ms ease-out' }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Ficha de ${contact.nome}`}
        tabIndex={-1}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 'min(100%, 460px)',
          background: surface.elevated,
          borderLeft: `1px solid ${surface.borderStrong}`,
          boxShadow: '-20px 0 40px rgba(0,0,0,0.35)',
          zIndex: 51,
          display: 'flex', flexDirection: 'column',
          animation: 'slideInRight 240ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* ---- Header ---- */}
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${surface.divider}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: text.highlight, margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {contact.nome}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: stage?.color ?? text.secondary, background: `${stage?.color ?? text.secondary}1f`, padding: '3px 9px', borderRadius: '999px' }}>
                  {contact.etapa}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: contact.etapa === 'Ganho' ? chart.revenue : chart.light }}>
                  {fmtMoneyCents(contact.valor)}
                </span>
              </div>
            </div>
            <button onClick={onClose} aria-label="Fechar" style={{ background: 'transparent', border: 'none', color: text.secondary, cursor: 'pointer', padding: '4px', display: 'flex', flexShrink: 0 }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
            <Button variant="secondary" size="sm" icon={<Edit2 size={13} />} onClick={() => onEdit(contact)}>Editar</Button>
            <Button variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={() => onDelete(contact)}>Deletar</Button>
          </div>
        </div>

        {/* ---- Corpo (scrollável) ---- */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>
          {/* Dados de contato */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '22px' }}>
            <InfoRow icon={<Mail size={14} />} value={contact.email} />
            {contact.telefone && <InfoRow icon={<Phone size={14} />} value={contact.telefone} />}
            {contact.empresa && <InfoRow icon={<Building2 size={14} />} value={contact.empresa} />}
            {contact.data_prevista && <InfoRow icon={<Calendar size={14} />} value={`Fechamento previsto: ${fmtDateFull(contact.data_prevista)}`} />}
            <InfoRow icon={<Clock size={14} />} value={`${daysSince(contact.updated_at)} dias nesta fase`} />
            {proximaPendente && (
              <InfoRow
                icon={<CheckSquare size={14} />}
                value={`Próximo follow-up: ${fmtDateFull(proximaPendente.data_prevista as string)}`}
                tone={new Date(`${proximaPendente.data_prevista}T00:00:00`) < new Date(new Date().toDateString()) ? 'danger' : undefined}
              />
            )}
          </div>

          {/* Nova atividade */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: text.muted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Registrar atividade
            </div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
              {ACTIVITY_TYPES.map((t) => {
                const ActiveIcon = t.icon;
                const active = novoTipo === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => setNovoTipo(t.value)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '7px',
                      border: `1px solid ${active ? surface.borderHover : surface.borderStrong}`,
                      background: active ? surface.active : surface.input,
                      color: active ? chart.light : text.secondary,
                      fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    <ActiveIcon size={12} /> {t.label}
                  </button>
                );
              })}
            </div>
            <textarea
              value={novaDescricao}
              onChange={(e) => setNovaDescricao(e.target.value)}
              placeholder="O que aconteceu ou o que precisa ser feito?"
              rows={2}
              style={{
                width: '100%', padding: '9px 11px', borderRadius: '8px', resize: 'vertical',
                background: surface.input, border: `1px solid ${surface.borderStrong}`,
                color: text.bright, fontSize: '13px', fontFamily: 'inherit', marginBottom: '8px',
              }}
            />
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="date"
                value={novaData}
                onChange={(e) => setNovaData(e.target.value)}
                title="Data prevista (opcional — deixe em branco para uma nota do que já aconteceu)"
                style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', background: surface.input, border: `1px solid ${surface.borderStrong}`, color: text.bright, fontSize: '12px' }}
              />
              <Button size="sm" icon={<Plus size={13} />} onClick={handleAddActivity} disabled={saving}>
                {saving ? 'Salvando…' : 'Adicionar'}
              </Button>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: text.muted, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Linha do tempo
            </div>
            {loadingActivities ? (
              <div style={{ fontSize: '12px', color: text.dim }}>Carregando…</div>
            ) : activities.length === 0 ? (
              <div style={{ fontSize: '12px', color: text.dim, padding: '12px 0' }}>
                Nenhuma atividade registrada ainda.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {activities.map((a) => {
                  const meta = ACTIVITY_MAP[a.tipo];
                  const Icon = meta?.icon ?? StickyNote;
                  const atrasada = !a.concluida && a.data_prevista && new Date(`${a.data_prevista}T00:00:00`) < new Date(new Date().toDateString());
                  return (
                    <div key={a.id} style={{ display: 'flex', gap: '10px', padding: '10px 0', borderTop: `1px solid ${surface.divider}` }}>
                      <div style={{
                        width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                        background: a.concluida ? surface.input : atrasada ? 'rgba(239,68,68,0.12)' : surface.hover,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: a.concluida ? text.dim : atrasada ? semantic.danger : chart.line,
                      }}>
                        <Icon size={13} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '13px', color: a.concluida ? text.dim : text.bright,
                          textDecoration: a.concluida ? 'line-through' : 'none',
                          lineHeight: '1.4', wordBreak: 'break-word',
                        }}>
                          {a.descricao}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <span style={{ fontSize: '10.5px', color: text.dim }}>{fmtDateTime(a.criado_em)}</span>
                          {a.data_prevista && (
                            <span style={{ fontSize: '10.5px', fontWeight: 600, color: a.concluida ? text.dim : atrasada ? semantic.danger : text.tertiary }}>
                              {a.concluida ? 'concluída' : atrasada ? `atrasada · ${fmtDateFull(a.data_prevista)}` : `prevista ${fmtDateFull(a.data_prevista)}`}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                        {a.data_prevista && (
                          <button
                            onClick={() => toggleConcluida(a)}
                            aria-label={a.concluida ? 'Reabrir' : 'Concluir'}
                            title={a.concluida ? 'Reabrir' : 'Marcar como concluída'}
                            style={{ background: 'transparent', border: 'none', color: text.dim, cursor: 'pointer', padding: '3px', display: 'flex' }}
                          >
                            {a.concluida ? <Undo2 size={13} /> : <Check size={13} />}
                          </button>
                        )}
                        <button
                          onClick={() => deleteActivity(a)}
                          aria-label="Remover atividade"
                          style={{ background: 'transparent', border: 'none', color: text.dim, cursor: 'pointer', padding: '3px', display: 'flex' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function InfoRow({ icon, value, tone }: { icon: React.ReactNode; value: string; tone?: 'danger' }) {
  const { text, semantic } = useThemeTokens();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '12.5px', color: tone === 'danger' ? semantic.danger : text.secondary }}>
      <span style={{ display: 'flex', color: tone === 'danger' ? semantic.danger : text.dim, flexShrink: 0 }}>{icon}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
}
