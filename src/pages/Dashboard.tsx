/**
 * RAVO OS — Dashboard Executivo (Software House)
 *
 * Hierarquia de leitura, de cima para baixo, seguindo a ordem em que um dono
 * precisa das respostas:
 *
 *   1. RESULTADO      o mês fechou no azul? quanto tempo o caixa aguenta?
 *   2. PREVISIBILIDADE quanto da receita é recorrente e quanto já está vendido?
 *   3. ENTREGA        quais projetos estão comendo margem? o time cabe na demanda?
 *   4. CARTEIRA       perder um cliente me quebra?
 *   5. COMERCIAL      o funil repõe o que vai sair?
 *
 * Decisão de design: um sinal por bloco. Cada seção responde a UMA pergunta e
 * destaca UM número; o resto é contexto de apoio. Grades de 12 KPIs iguais não
 * priorizam nada e é isso que faz um dashboard virar enfeite.
 */

import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import {
  TrendingUp, TrendingDown, AlertTriangle, Clock,
  Wallet, Repeat, Layers, Users,
} from 'lucide-react';
import { ChartTooltip } from '@/components/ChartTooltip';
import { QueryError } from '@/components/QueryState';
import {
  useResumoExecutivo, useMixReceita, useReceitaMensal, useUtilizacao,
  useMargemProjetos, useConcentracao, useBacklog, usePipeline,
  useSaudeComercial, useCarteiraRecorrente,
} from '@/hooks/useSoftwareHouseQueries';
import { usePeriod, monthLabel, prevMonthKey } from '@/contexts/PeriodContext';
import { fmtMoneyFull, fmtK, pctChange } from '@/utils/format';
import { useThemeTokens } from '@/hooks/useThemeTokens';

/* ==========================================================================
   Primitivos visuais locais
   ========================================================================== */

/** Rótulo de seção — âncora de leitura entre blocos. */
function SectionLabel({
  icon: Icon, title, hint,
}: { icon: typeof Wallet; title: string; hint: string }) {
  const { text, surface } = useThemeTokens();
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: '10px',
      margin: '32px 0 14px', paddingBottom: '10px',
      borderBottom: `1px solid ${surface.divider}`,
    }}>
      <Icon size={14} style={{ color: text.tertiary, alignSelf: 'center' }} />
      <span style={{
        fontSize: '11px', fontWeight: 650, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: text.secondary,
      }}>{title}</span>
      <span style={{ fontSize: '12px', color: text.faint }}>{hint}</span>
    </div>
  );
}

/** Cartão de destaque: o número que carrega a seção. */
function HeroStat({
  label, value, sub, delta, tone = 'neutral',
}: {
  label: string; value: string; sub?: string;
  delta?: number; tone?: 'positive' | 'negative' | 'warning' | 'neutral';
}) {
  const { text, surface, semantic } = useThemeTokens();
  const toneColor = {
    positive: semantic.success, negative: semantic.danger,
    warning: semantic.warning, neutral: text.primary,
  }[tone];

  return (
    <div style={{
      background: surface.card, border: `1px solid ${surface.border}`,
      borderRadius: '12px', padding: '18px 20px',
    }}>
      <div style={{
        fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em',
        textTransform: 'uppercase', color: text.tertiary, marginBottom: '10px',
      }}>{label}</div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <span style={{
          fontSize: '28px', fontWeight: 660, letterSpacing: '-0.025em',
          color: toneColor, lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}>{value}</span>

        {delta !== undefined && Number.isFinite(delta) && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '2px',
            fontSize: '12px', fontWeight: 600,
            color: delta >= 0 ? semantic.success : semantic.danger,
          }}>
            {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>

      {sub && (
        <div style={{ fontSize: '12px', color: text.muted, marginTop: '8px' }}>{sub}</div>
      )}
    </div>
  );
}

/** Barra de proporção horizontal — usada em mix e concentração. */
function ProportionBar({
  segments,
}: { segments: { label: string; value: number; pct: number; color: string }[] }) {
  const { text, surface } = useThemeTokens();
  if (segments.length === 0) return null;

  return (
    <div>
      <div style={{
        display: 'flex', height: '10px', borderRadius: '5px',
        overflow: 'hidden', background: surface.elevated, marginBottom: '14px',
      }}>
        {segments.map((s) => (
          <div key={s.label} style={{ width: `${s.pct}%`, background: s.color }} title={s.label} />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {segments.map((s) => (
          <div key={s.label} style={{
            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px',
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '2px',
              background: s.color, flexShrink: 0,
            }} />
            <span style={{ color: text.secondary, flex: 1 }}>{s.label}</span>
            <span style={{ color: text.primary, fontVariantNumeric: 'tabular-nums' }}>
              {fmtMoneyFull(s.value)}
            </span>
            <span style={{
              color: text.faint, width: '46px', textAlign: 'right',
              fontVariantNumeric: 'tabular-nums',
            }}>{s.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Painel neutro que abriga gráficos e tabelas. */
function Panel({
  title, hint, children, span = 1,
}: { title: string; hint?: string; children: React.ReactNode; span?: number }) {
  const { text, surface } = useThemeTokens();
  return (
    <div style={{
      background: surface.card, border: `1px solid ${surface.border}`,
      borderRadius: '12px', padding: '18px 20px',
      gridColumn: `span ${span}`, minWidth: 0,
    }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: 620, color: text.primary }}>{title}</div>
        {hint && (
          <div style={{ fontSize: '12px', color: text.faint, marginTop: '3px' }}>{hint}</div>
        )}
      </div>
      {children}
    </div>
  );
}

const grid2: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px',
};

/* ==========================================================================
   Dashboard
   ========================================================================== */

export default function Dashboard() {
  const { month, isAllTime, label: periodLabel } = usePeriod();
  const { text, surface, semantic, chart, layout } = useThemeTokens();

  const resumo     = useResumoExecutivo(month);
  const mix        = useMixReceita(month);
  const serie      = useReceitaMensal(month, 6);
  const utilizacao = useUtilizacao(month);
  const projetos   = useMargemProjetos(month);
  const concentr   = useConcentracao(month);
  const backlog    = useBacklog(month);
  const pipeline   = usePipeline();
  const comercial  = useSaudeComercial(month);
  const carteira   = useCarteiraRecorrente(month, 6);

  const erro = resumo.error ?? serie.error ?? mix.error;

  /* --- Cores por stream: fixas, para o olho aprender a associação ---------- */
  const STREAM = useMemo(() => ({
    retainer: chart.palette[1],
    projeto:  chart.palette[0],
    hora:     chart.palette[2],
    licenca:  chart.palette[3],
  }), [chart.palette]);

  const STREAM_LABEL: Record<string, string> = {
    retainer: 'Retainer', projeto: 'Projeto', hora: 'Alocação/hora', licenca: 'Licença SaaS',
  };

  /* --- Deltas vs. mês anterior a partir da própria série ------------------- */
  const deltaReceita = useMemo(() => {
    if (serie.data.length < 2) return undefined;
    const cur = serie.data[serie.data.length - 1];
    const prev = serie.data[serie.data.length - 2];
    return pctChange(cur.total, prev.total);
  }, [serie.data]);

  const recorrentePct = useMemo(() => {
    const total = mix.data.reduce((s, m) => s + m.receita, 0);
    if (total <= 0) return 0;
    const rec = mix.data.filter((m) => m.recorrente).reduce((s, m) => s + m.receita, 0);
    return (rec / total) * 100;
  }, [mix.data]);

  const mrrAtual = carteira.data.at(-1)?.mrr ?? 0;
  const churnAtual = carteira.data.at(-1)?.churn_pct ?? 0;

  /* --- Sinais de risco: o que o dono precisa ver sem procurar -------------- */
  const projetosNoVermelho = projetos.data.filter((p) => p.margem_pct < 15);
  const topCliente = concentr.data[0];
  const sobrecarregados = utilizacao.data.filter((u) => u.utilizacao_pct > 95);
  const ociosos = utilizacao.data.filter((u) => u.utilizacao_pct < 40 && u.capacidade > 0);

  const pipelinePonderado = pipeline.data.reduce((s, p) => s + p.valor_ponderado, 0);

  const alertas = useMemo(() => {
    const out: { texto: string; nivel: 'alto' | 'medio' }[] = [];

    if (topCliente && topCliente.participacao > 30) {
      out.push({
        nivel: topCliente.participacao > 40 ? 'alto' : 'medio',
        texto: `${topCliente.cliente} concentra ${topCliente.participacao.toFixed(0)}% da receita do mês`,
      });
    }
    if (projetosNoVermelho.length > 0) {
      out.push({
        nivel: projetosNoVermelho.some((p) => p.margem_pct < 0) ? 'alto' : 'medio',
        texto: `${projetosNoVermelho.length} projeto(s) abaixo de 15% de margem`,
      });
    }
    if (recorrentePct < 40 && mix.data.length > 0) {
      out.push({
        nivel: 'medio',
        texto: `Só ${recorrentePct.toFixed(0)}% da receita é recorrente — o resto precisa ser vendido de novo`,
      });
    }
    if (sobrecarregados.length > 0) {
      out.push({
        nivel: 'medio',
        texto: `${sobrecarregados.map((u) => u.pessoa).join(', ')} acima de 95% de utilização`,
      });
    }
    if (resumo.data.runway_meses !== null && resumo.data.runway_meses < 6) {
      out.push({
        nivel: 'alto',
        texto: `Runway de ${resumo.data.runway_meses.toFixed(1)} meses`,
      });
    }
    return out;
  }, [topCliente, projetosNoVermelho, recorrentePct, mix.data.length, sobrecarregados, resumo.data.runway_meses]);

  /* --- Estados de erro ----------------------------------------------------- */
  if (erro) {
    return (
      <div style={{ maxWidth: layout.pageMaxWidth, margin: '0 auto' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 640, color: text.primary, margin: '0 0 16px' }}>
          Dashboard
        </h1>
        <QueryError message={erro} onRetry={() => { resumo.refetch(); serie.refetch(); mix.refetch(); }} />
      </div>
    );
  }

  const carregando = resumo.loading && serie.loading;

  return (
    <div style={{ maxWidth: layout.pageMaxWidth, margin: '0 auto', paddingBottom: '48px' }}>

      {/* ---------------- Cabeçalho ---------------- */}
      <div style={{ marginBottom: '4px' }}>
        <h1 style={{
          fontSize: '20px', fontWeight: 640, letterSpacing: '-0.015em',
          color: text.primary, margin: '0 0 4px',
        }}>Visão executiva</h1>
        <p style={{ fontSize: '13px', color: text.muted, margin: 0 }}>
          {isAllTime ? 'Todo o período' : periodLabel}
          {!isAllTime && month && (
            <span style={{ color: text.faint }}> · comparado a {monthLabel(prevMonthKey(month))}</span>
          )}
        </p>
      </div>

      {/* ---------------- Alertas ---------------- */}
      {alertas.length > 0 && !carregando && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '18px 0 4px' }}>
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

      {/* ═══════════ 1. RESULTADO ═══════════ */}
      <SectionLabel icon={Wallet} title="Resultado" hint="o mês fechou no azul?" />

      <div style={grid2}>
        <HeroStat
          label="Receita reconhecida"
          value={fmtMoneyFull(resumo.data.receita)}
          delta={deltaReceita}
          sub={`Custo direto de entrega ${fmtMoneyFull(resumo.data.custo_direto)}`}
        />
        <HeroStat
          label="Margem bruta"
          value={`${resumo.data.margem_bruta_pct.toFixed(1)}%`}
          tone={resumo.data.margem_bruta_pct >= 50 ? 'positive'
               : resumo.data.margem_bruta_pct >= 30 ? 'warning' : 'negative'}
          sub={`${fmtMoneyFull(resumo.data.margem_bruta)} depois das horas de entrega`}
        />
        <HeroStat
          label="Resultado do mês"
          value={fmtMoneyFull(resumo.data.resultado)}
          tone={resumo.data.resultado >= 0 ? 'positive' : 'negative'}
          sub={`Despesas operacionais ${fmtMoneyFull(resumo.data.despesas)}`}
        />
        <HeroStat
          label="Runway"
          value={resumo.data.runway_meses === null ? '—' : `${resumo.data.runway_meses.toFixed(1)} meses`}
          tone={resumo.data.runway_meses === null ? 'neutral'
               : resumo.data.runway_meses >= 12 ? 'positive'
               : resumo.data.runway_meses >= 6 ? 'warning' : 'negative'}
          sub="Caixa sobre a queima média de 3 meses"
        />
      </div>

      {/* ═══════════ 2. PREVISIBILIDADE ═══════════ */}
      <SectionLabel
        icon={Repeat}
        title="Previsibilidade"
        hint="quanto da receita se repete sozinha no mês que vem"
      />

      <div style={grid2}>
        <HeroStat
          label="Receita recorrente"
          value={`${recorrentePct.toFixed(0)}%`}
          tone={recorrentePct >= 60 ? 'positive' : recorrentePct >= 40 ? 'warning' : 'negative'}
          sub={`MRR de ${fmtMoneyFull(mrrAtual)} · churn ${churnAtual.toFixed(1)}%`}
        />
        <HeroStat
          label="Backlog contratado"
          value={fmtMoneyFull(backlog.data.backlog_total)}
          sub={backlog.data.cobertura_meses === null
            ? 'Receita vendida ainda não reconhecida'
            : `${backlog.data.cobertura_meses.toFixed(1)} meses de operação já vendidos`}
        />
      </div>

      <div style={{ ...grid2, marginTop: '12px' }}>
        <Panel title="Composição da receita" hint="por tipo de contrato, no período">
          <ProportionBar
            segments={mix.data.map((m) => ({
              label: STREAM_LABEL[m.tipo] ?? m.tipo,
              value: m.receita,
              pct: m.participacao,
              color: STREAM[m.tipo] ?? chart.neutral,
            }))}
          />
        </Panel>

        <Panel title="Receita por stream" hint="últimos 6 meses">
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={serie.data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
              <XAxis
                dataKey="mes" tick={{ fontSize: 11, fill: chart.axisAlt }}
                axisLine={false} tickLine={false}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis
                tick={{ fontSize: 11, fill: chart.axisAlt }}
                axisLine={false} tickLine={false} tickFormatter={fmtK}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="retainer" stackId="1" name="Retainer"
                    stroke={STREAM.retainer} fill={STREAM.retainer} fillOpacity={0.5} />
              <Area type="monotone" dataKey="projeto" stackId="1" name="Projeto"
                    stroke={STREAM.projeto} fill={STREAM.projeto} fillOpacity={0.5} />
              <Area type="monotone" dataKey="hora" stackId="1" name="Alocação"
                    stroke={STREAM.hora} fill={STREAM.hora} fillOpacity={0.5} />
              <Area type="monotone" dataKey="licenca" stackId="1" name="Licença"
                    stroke={STREAM.licenca} fill={STREAM.licenca} fillOpacity={0.5} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* ═══════════ 3. ENTREGA ═══════════ */}
      <SectionLabel
        icon={Layers}
        title="Entrega"
        hint="onde a margem está sendo ganha ou perdida"
      />

      <Panel title="Margem por projeto" hint="ordenado da pior margem para a melhor">
        {projetos.data.length === 0 ? (
          <div style={{ fontSize: '13px', color: text.faint, padding: '18px 0' }}>
            Nenhum projeto no período.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '640px' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${surface.divider}` }}>
                  {['Projeto', 'Cliente', 'Receita', 'Custo', 'Margem', 'Horas', 'Escopo'].map((h, i) => (
                    <th key={h} style={{
                      textAlign: i < 2 ? 'left' : 'right', padding: '0 10px 9px',
                      fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em',
                      textTransform: 'uppercase', color: text.tertiary, whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projetos.data.map((p) => {
                  const corMargem = p.margem_pct < 0 ? semantic.danger
                                  : p.margem_pct < 15 ? semantic.warning
                                  : semantic.success;
                  const estourou = (p.desvio_escopo_pct ?? 0) > 10;
                  return (
                    <tr key={`${p.projeto}-${p.cliente}`} style={{ borderBottom: `1px solid ${surface.divider}` }}>
                      <td style={{ padding: '11px 10px', color: text.primary, fontWeight: 550 }}>
                        {p.projeto}
                      </td>
                      <td style={{ padding: '11px 10px', color: text.muted }}>{p.cliente}</td>
                      <td style={{ padding: '11px 10px', textAlign: 'right', color: text.secondary, fontVariantNumeric: 'tabular-nums' }}>
                        {fmtMoneyFull(p.receita)}
                      </td>
                      <td style={{ padding: '11px 10px', textAlign: 'right', color: text.muted, fontVariantNumeric: 'tabular-nums' }}>
                        {fmtMoneyFull(p.custo)}
                      </td>
                      <td style={{ padding: '11px 10px', textAlign: 'right', color: corMargem, fontWeight: 620, fontVariantNumeric: 'tabular-nums' }}>
                        {p.margem_pct.toFixed(1)}%
                      </td>
                      <td style={{ padding: '11px 10px', textAlign: 'right', color: text.muted, fontVariantNumeric: 'tabular-nums' }}>
                        {p.horas_reais.toFixed(0)}/{p.horas_estimadas.toFixed(0)}
                      </td>
                      <td style={{
                        padding: '11px 10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums',
                        color: estourou ? semantic.warning : text.faint,
                        fontWeight: estourou ? 620 : 400,
                      }}>
                        {p.desvio_escopo_pct === null ? '—'
                          : `${p.desvio_escopo_pct > 0 ? '+' : ''}${p.desvio_escopo_pct.toFixed(0)}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <div style={{ ...grid2, marginTop: '12px' }}>
        <Panel title="Utilização faturável" hint="horas que viraram receita ÷ capacidade contratada">
          {utilizacao.data.length === 0 ? (
            <div style={{ fontSize: '13px', color: text.faint, padding: '18px 0' }}>
              Sem apontamentos no período.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
              {utilizacao.data.map((u) => {
                const cor = u.utilizacao_pct > 95 ? semantic.danger
                          : u.utilizacao_pct >= 65 ? semantic.success
                          : u.utilizacao_pct >= 40 ? semantic.warning
                          : text.faint;
                return (
                  <div key={u.pessoa}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'baseline', marginBottom: '5px', fontSize: '13px',
                    }}>
                      <span style={{ color: text.secondary }}>
                        {u.pessoa}
                        <span style={{ color: text.faint, fontSize: '12px' }}> · {u.papel}</span>
                      </span>
                      <span style={{ color: cor, fontWeight: 620, fontVariantNumeric: 'tabular-nums' }}>
                        {u.utilizacao_pct.toFixed(0)}%
                      </span>
                    </div>
                    <div style={{ height: '5px', borderRadius: '3px', background: surface.elevated, overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(u.utilizacao_pct, 100)}%`, height: '100%',
                        background: cor, borderRadius: '3px',
                      }} />
                    </div>
                  </div>
                );
              })}
              {ociosos.length > 0 && (
                <div style={{ fontSize: '12px', color: text.faint, marginTop: '2px' }}>
                  Capacidade ociosa: {ociosos.map((u) => u.pessoa).join(', ')}
                </div>
              )}
            </div>
          )}
        </Panel>

        <Panel title="Pipeline ponderado" hint={`${fmtMoneyFull(pipelinePonderado)} esperados pelo funil`}>
          {pipeline.data.length === 0 ? (
            <div style={{ fontSize: '13px', color: text.faint, padding: '18px 0' }}>
              Nenhuma oportunidade aberta.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={pipeline.data} layout="vertical" margin={{ top: 0, right: 12, left: 22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: chart.axisAlt }}
                       axisLine={false} tickLine={false} tickFormatter={fmtK} />
                <YAxis type="category" dataKey="estagio" width={86}
                       tick={{ fontSize: 11, fill: chart.axisAlt }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="valor_ponderado" name="Ponderado" radius={[0, 4, 4, 0]}>
                  {pipeline.data.map((_, i) => (
                    <Cell key={i} fill={chart.palette[i % chart.palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>
      </div>

      {/* ═══════════ 4. CARTEIRA ═══════════ */}
      <SectionLabel
        icon={Users}
        title="Carteira"
        hint="risco de concentração e saúde da recorrência"
      />

      <div style={grid2}>
        <Panel
          title="Concentração de receita"
          hint={topCliente
            ? `Maior cliente responde por ${topCliente.participacao.toFixed(0)}% do mês`
            : 'Sem receita no período'}
        >
          <ProportionBar
            segments={concentr.data.slice(0, 6).map((c, i) => ({
              label: c.cliente,
              value: c.receita,
              pct: c.participacao,
              color: i === 0 && c.participacao > 30
                ? semantic.warning
                : chart.palette[i % chart.palette.length],
            }))}
          />
        </Panel>

        <Panel title="Saúde comercial" hint="oportunidades fechadas nos últimos 6 meses">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            {[
              { rotulo: 'Win rate', valor: `${comercial.data.win_rate.toFixed(0)}%`,
                apoio: `${comercial.data.ganhos} ganhos · ${comercial.data.perdidos} perdidos` },
              { rotulo: 'Ciclo de venda', valor: `${comercial.data.ciclo_dias.toFixed(0)} dias`,
                apoio: 'Abertura até fechamento' },
              { rotulo: 'Ticket médio', valor: fmtMoneyFull(comercial.data.ticket_medio),
                apoio: 'Por negócio ganho' },
              { rotulo: 'Pipeline aberto', valor: fmtMoneyFull(pipelinePonderado),
                apoio: 'Ponderado pela probabilidade' },
            ].map((m) => (
              <div key={m.rotulo}>
                <div style={{
                  fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em',
                  textTransform: 'uppercase', color: text.tertiary, marginBottom: '6px',
                }}>{m.rotulo}</div>
                <div style={{
                  fontSize: '19px', fontWeight: 640, color: text.primary,
                  fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
                }}>{m.valor}</div>
                <div style={{ fontSize: '12px', color: text.faint, marginTop: '3px' }}>{m.apoio}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div style={{ marginTop: '12px' }}>
        <Panel title="Evolução da carteira recorrente" hint="MRR de retainers e licenças — projetos não entram aqui">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={carteira.data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: chart.axisAlt }}
                     axisLine={false} tickLine={false} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: chart.axisAlt }}
                     axisLine={false} tickLine={false} tickFormatter={fmtK} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="mrr" name="MRR"
                    stroke={chart.palette[1]} fill={chart.palette[1]} fillOpacity={0.16} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* ---------------- Rodapé de contexto ---------------- */}
      <div style={{
        marginTop: '28px', paddingTop: '14px',
        borderTop: `1px solid ${surface.divider}`,
        fontSize: '12px', color: text.faint,
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        <Clock size={11} />
        Margem bruta desconta as horas apontadas ao custo real de cada pessoa.
        Receita recorrente considera apenas contratos de retainer e licença.
      </div>
    </div>
  );
}
