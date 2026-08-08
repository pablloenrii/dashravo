/**
 * RAVO OS — Notificações do header
 * Deriva alertas reais (sem mock) a partir de contatos/tickets/metas do usuário:
 * leads parados no CRM, tickets em espera no CS e metas em risco.
 *
 * Revalida sempre que o store de invalidação global avança (após qualquer CRUD),
 * já que o header permanece montado entre as páginas.
 */

import { useCallback, useEffect, useState } from 'react';
import { sb as supabase } from '@/services/supabase';
import { OPEN_KEYS, ROT_DAYS, daysSince } from '@/utils/crmMetrics';
import { parseTempoResposta } from '@/utils/tickets';
import { useRevalidateStore } from '@/store/revalidate.store';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: 'warning' | 'danger';
  href: string;
}

/** Tickets aguardando mais de X minutos viram alerta */
const TICKET_ALERT_MIN = 120;

export function useNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const version = useRevalidateStore((s) => s.version);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [leadsRes, ticketsRes, metasRes] = await Promise.all([
        supabase.from('contatos').select('id, etapa, updated_at').in('etapa', OPEN_KEYS),
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
        .filter((t) => parseTempoResposta(t.tempo_resposta) > TICKET_ALERT_MIN).length;
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar as notificações.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, version]);

  return { items, loading, error, refetch: load };
}
