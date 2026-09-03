/**
 * RAVO OS — Formatação compartilhada (moeda, milhar, variação)
 *
 * Fonte única para os formatadores usados em Dashboard, Financeiro, CRM e Metas.
 * Antes cada página redefinia fmtK/fmtMoney com pequenas variações.
 */

/** Número compacto para eixos de gráfico e KPIs: 12.5K, 1.2M */
export function fmtK(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(v % 1_000 === 0 ? 0 : 1)}K`;
  return v.toFixed(0);
}

/** Moeda em formato compacto (R$ 12,5k / R$ 720) */
export function fmtMoney(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000) return `R$ ${(v / 1_000).toFixed(v % 1_000 === 0 ? 0 : 1)}k`;
  return `R$ ${Math.round(v)}`;
}

/** Moeda em formato completo com milhar (R$ 1.250.000,00) */
export function fmtMoneyFull(v: number): string {
  return v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
}

/** Moeda completa com centavos (R$ 11.000,00) — usado no CRM, onde o valor do
 *  deal não pode ficar ambíguo ("11K" pode ser R$ 10.500 ou R$ 11.499). */
export function fmtMoneyCents(v: number): string {
  return v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Variação percentual entre dois valores. undefined quando a base é 0. */
export function pctChange(current: number, previous: number): number | undefined {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return undefined;
  return ((current - previous) / Math.abs(previous)) * 100;
}
