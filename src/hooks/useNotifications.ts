/**
 * RAVO OS — Notificações do header
 * Deriva alertas reais (sem mock) a partir de contatos/tickets/metas do usuário:
 * leads parados no CRM, tickets em espera no CS e metas em risco.
 */

import { useCallback, useEffect, useState } from 'react';
import { sb as supabase } from '@/services/supabase';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: 'warning' | 'danger';
  href: string;
}

const OPEN_STAGES = ['Novo Lead', 'Contato Feito', 'Qualificado', 'Proposta', 'Negociação'];
const ROT_DAYS = 14;

function daysSince(iso?: string | null): number {
  if (!iso) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
}

/** Converte "2h 15m" / "45m" / "3h" em minutos. */
function parseTempoResposta(tempo?: string | null): number {
  if (!tempo) return 0;
  const h = /(\d+)\s*h/i.exec(tempo);
  const m = /(\d+)\s*m/i.exec(tempo);
  return (h ? Number(h[1]) : 0) * 60 + (m ? Number(m[1]) : 0);
}

export function useNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [leadsRes, ticketsRes, metasRes] = await Promise.all([
      supabase.from('contatos').select('id, etapa, updated_at').in('etapa', OPEN_STAGES),
      supabase.from('tickets').select('id, tempo_resposta').eq('status', 'aberto'),
      supabase.from('metas').select('id, status').in('status', ['atencao', 'atrasado']),
    ]);

    const next: NotificationItem[] = [];

    const parados = ((leadsRes.data ?? []) as { updated_at: string | null }[])
      .filter((c) => daysSince(c.updated_at) >= ROT_DAYS).length;
    if (parados > 0) {
      next.push({
        id: 'crm-parados',
        title: 'Leads parados',
        message: `${parados} lead${parados > 1 ? 's' : ''} sem movimentação há mais de ${ROT_DAYS} dias`,
        severity: 'warning',
        href: '/crm',
      });
    }

    const aguardando = ((ticketsRes.data ?? []) as { tempo_resposta: string | null }[])
      .filter((t) => parseTempoResposta(t.tempo_resposta) > 120).length;
    if (aguardando > 0) {
      next.push({
        id: 'cs-aguardando',
        title: 'Tickets em espera',
        message: `${aguardando} ticket${aguardando > 1 ? 's' : ''} aguardando resposta há mais de 2 horas`,
        severity: 'danger',
        href: '/cs',
      });
    }

    const metasRisco = (metasRes.data ?? []).length;
    if (metasRisco > 0) {
      next.push({
        id: 'goals-risco',
        title: 'Metas em risco',
        message: `${metasRisco} meta${metasRisco > 1 ? 's' : ''} em atenção ou atrasada${metasRisco > 1 ? 's' : ''}`,
        severity: 'warning',
        href: '/goals',
      });
    }

    setItems(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, refetch: load };
}
