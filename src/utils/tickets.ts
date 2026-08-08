/**
 * RAVO OS — Helpers de tickets / atendimento (CS)
 */

/** Converte "2h 15m" / "45m" / "3h" em minutos. Retorna 0 se não reconhecer o formato. */
export function parseTempoResposta(tempo?: string | null): number {
  if (!tempo) return 0;
  const h = /(\d+)\s*h/i.exec(tempo);
  const m = /(\d+)\s*m/i.exec(tempo);
  return (h ? Number(h[1]) : 0) * 60 + (m ? Number(m[1]) : 0);
}
