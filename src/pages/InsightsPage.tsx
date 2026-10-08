/**
 * RAVO OS — Insights de receita
 *
 * MRR/ARR/churn/NRR/LTV/CAC com as definições de mercado (ver cabeçalho de
 * ravo-backend/sql/19_insights.sql), receita do mês editável (faturas) e a lista
 * de contratos cancelados. O mês vem do seletor global do header.
 */

import { useMemo, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { TrendingUp, Wallet, UserMinus, Gauge, Plus, RefreshCw, Undo2 } from 'lucide-react';
import { SectionLabel, HeroStat, Panel, heroGrid, panelGrid } from '@/components/SectionKit';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { QueryError, QueryLoading } from '@/components/QueryState';
import { usePeriod, monthLabel, monthLabelLong } from '@/contexts/PeriodContext';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import {
  useInsightsMrr, useCancelados, useFaturasMes, useContratos,
  type InsightMes, type FaturaMes, type FaturaStatus, type Cancelado,
} from '@/hooks/useInsightsQueries';
import { sb as supabase } from '@/services/supabase';
import { fmtMoneyFull, fmtMoneyCents, fmtK, pctChange } from '@/utils/format';
import { toastError, toastSuccess } from '@/utils/toast';
import { useRevalidateStore } from '@/store/revalidate.store';

const STATUS_FATURA: { value: FaturaStatus; label: string }[] = [
  { value: 'emitida', label: 'Emitida' },
  { value: 'paga', label: 'Paga' },
  { value: 'inadimplente', label: 'Inadimplente' },
  { value: 'prevista', label: 'Prevista' },
  { value: 'cancelada', label: 'Cancelada' },
];

const TIPO_LABEL: Record<string, string> = {
  retainer: 'Retainer', licenca: 'Licença', projeto: 'Projeto', hora: 'Hora',
};

const MOTIVOS = ['Preço', 'Resultado abaixo do esperado', 'Fechou a empresa', 'Foi para concorrente', 'Internalizou o serviço', 'Inadimplência', 'Fim do projeto'];

const pct = (v: number | null) => (v === null ? '—' : `${v.toFixed(1).replace('.', ',')}%`);
const money = (v: number | null) => (v === null ? '—' : fmtMoneyFull(v));
const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDateBR = (iso: string) => (iso ? iso.split('-').reverse().join('/') : '—');

export function InsightsPage() {
  const { chart, text, surface, semantic } = useThemeTokens();
  const { effectiveMonth, isAllTime } = usePeriod();

  const mrrQ = useInsightsMrr(effectiveMonth, 12);
  const canceladosQ = useCancelados(effectiveMonth, 24);
  const faturasQ = useFaturasMes(effectiveMonth);
  const contratosQ = useContratos();

  const refetchAll = () => {
    mrrQ.refetch(); canceladosQ.refetch(); faturasQ.refetch(); contratosQ.refetch();
    useRevalidateStore.getState().invalidate();
  };

  const serie = mrrQ.data;
  const atual: InsightMes | undefined = serie.find((m) => m.mes === effectiveMonth) ?? serie[serie.length - 1];
  const anterior: InsightMes | undefined = atual ? serie[serie.indexOf(atual) - 1] : undefined;

  const grafico = useMemo(() => serie.map((m) => ({
    label: monthLabel(m.mes),
    mrr: m.mrr,
    novos: m.novos_mrr,
    expansao: m.expansao_mrr,
    contracao: -m.contracao_mrr,
    churn: -m.churn_mrr,
  })), [serie]);

  const tooltipStyle = {
    background: surface.card, border: `1px solid ${surface.borderStrong}`,
    borderRadius: '8px', fontSize: '12px', color: text.primary,
  };

  const th: React.CSSProperties = {
    padding: '8px 10px', fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.04em',
    textTransform: 'uppercase', color: text.tertiary, textAlign: 'right', whiteSpace: 'nowrap',
    borderBottom: `1px solid ${surface.divider}`,
  };
  const td: React.CSSProperties = {
    padding: '9px 10px', fontSize: '12.5px', color: text.secondary, textAlign: 'right',
    whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', borderBottom: `1px solid ${surface.divider}`,
  };
  const fld: React.CSSProperties = {
    width: '100%', padding: '9px 11px', borderRadius: '8px', background: surface.input,
    border: `1px solid ${surface.borderStrong}`, color: text.primary, fontSize: '13px',
  };

  /* ------------------------------------------------------------------ faturas */
  const [novaReceita, setNovaReceita] = useState(false);
  const [receitaForm, setReceitaForm] = useState({ contratoId: '', valor: '', status: 'emitida' as FaturaStatus });
  const [gerando, setGerando] = useState(false);
  const [salvandoReceita, setSalvandoReceita] = useState(false);

  const gerarFaturas = async () => {
    setGerando(true);
    const { data, error } = await supabase.rpc('rpc_gerar_faturas_mes', { p_mes: `${effectiveMonth}-01` });
    setGerando(false);
    if (error) { toastError(`Não foi possível gerar as faturas: ${error.message}`); return; }
    const n = Number(data) || 0;
    toastSuccess(n === 0 ? 'Todos os contratos recorrentes já têm fatura neste mês' : `${n} fatura${n > 1 ? 's' : ''} gerada${n > 1 ? 's' : ''}`);
    refetchAll();
  };

  const salvarReceita = async () => {
    const valor = Number(receitaForm.valor.replace(/\./g, '').replace(',', '.'));
    if (!receitaForm.contratoId || !Number.isFinite(valor) || valor <= 0) {
      toastError('Escolha o contrato e informe um valor maior que zero.'); return;
    }
    setSalvandoReceita(true);
    const { error } = await supabase.from('faturas').insert([{
      contrato_id: Number(receitaForm.contratoId), competencia: `${effectiveMonth}-01`, valor,
      status: receitaForm.status,
      data_pagamento: receitaForm.status === 'paga' ? todayISO() : null,
    }]);
    setSalvandoReceita(false);
    if (error) { toastError(`Não foi possível salvar: ${error.message}`); return; }
    toastSuccess('Receita lançada');
    setNovaReceita(false);
    setReceitaForm({ contratoId: '', valor: '', status: 'emitida' });
    refetchAll();
  };

  const atualizarFatura = async (f: FaturaMes, patch: { valor?: number; status?: FaturaStatus }) => {
    const update: Record<string, unknown> = { ...patch };
    if (patch.status) update.data_pagamento = patch.status === 'paga' ? (f.data_pagamento ?? todayISO()) : null;
    const { error } = await supabase.from('faturas').update(update).eq('id', f.id);
    if (error) { toastError(`Não foi possível atualizar: ${error.message}`); return; }
    refetchAll();
  };

  /* --------------------------------------------------------------- cancelamento */
  const [cancelando, setCancelando] = useState(false);
  const [cancelForm, setCancelForm] = useState({ contratoId: '', data: todayISO(), motivo: '' });
  const [salvandoCancel, setSalvandoCancel] = useState(false);
  const [reativar, setReativar] = useState<Cancelado | null>(null);

  const contratosVigentes = contratosQ.data.filter((c) => c.status === 'ativo' || c.status === 'pausado');

  const cancelarContrato = async () => {
    if (!cancelForm.contratoId || !cancelForm.data) { toastError('Escolha o contrato e a data do cancelamento.'); return; }
    setSalvandoCancel(true);
    const { error } = await supabase.rpc('rpc_cancelar_contrato', {
      p_contrato_id: Number(cancelForm.contratoId), p_data: cancelForm.data, p_motivo: cancelForm.motivo || null,
    });
    setSalvandoCancel(false);
    if (error) { toastError(`Não foi possível cancelar: ${error.message}`); return; }
    toastSuccess('Contrato cancelado');
    setCancelando(false);
    setCancelForm({ contratoId: '', data: todayISO(), motivo: '' });
    refetchAll();
  };

  const reativarContrato = async () => {
    if (!reativar) return;
    const { error } = await supabase.rpc('rpc_reativar_contrato', { p_contrato_id: reativar.contrato_id });
    setReativar(null);
    if (error) { toastError(`Não foi possível reativar: ${error.message}`); return; }
    toastSuccess('Contrato reativado');
    refetchAll();
  };

  /* ------------------------------------------------------------------- render */
  const carregando = mrrQ.loading && serie.length === 0;
  const erro = mrrQ.error;

  return (
    <div>
      <div style={{ marginBottom: '4px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 650, color: text.primary, margin: 0, letterSpacing: '-0.01em' }}>
          Insights de receita
        </h1>
        <p style={{ fontSize: '13px', color: text.muted, margin: '4px 0 0' }}>
          {monthLabelLong(effectiveMonth)}
          {isAllTime ? ' (mês atual — escolha outro mês no seletor do topo)' : ''}
          {' · recorrência = contratos de retainer e licença, medida no último dia de cada mês'}
        </p>
      </div>

      {erro && <QueryError message={erro} onRetry={mrrQ.refetch} />}
      {carregando && <QueryLoading height={220} />}

      {!carregando && !erro && !atual && (
        <Panel title="Sem dados ainda" hint="Cadastre contratos recorrentes (ou marque um lead como Ganho no CRM) para ver o MRR.">
          <div style={{ color: text.muted, fontSize: '13px' }}>Nenhum contrato encontrado.</div>
        </Panel>
      )}

      {atual && (
        <>
          {/* ============================ Recorrência ============================ */}
          <SectionLabel icon={TrendingUp} title="Receita recorrente" hint="quanto entra todo mês, sem contar projetos" />
          <div style={heroGrid}>
            <HeroStat
              label="MRR"
              value={fmtMoneyFull(atual.mrr)}
              delta={anterior ? pctChange(atual.mrr, anterior.mrr) : undefined}
              sub={`${atual.clientes_fim} cliente${atual.clientes_fim === 1 ? '' : 's'} recorrente${atual.clientes_fim === 1 ? '' : 's'}`}
            />
            <HeroStat label="ARR" value={fmtMoneyFull(atual.arr)} sub="MRR × 12" />
            <HeroStat
              label="Net new MRR"
              value={`${atual.net_new_mrr > 0 ? '+' : ''}${fmtMoneyFull(atual.net_new_mrr)}`}
              tone={atual.net_new_mrr > 0 ? 'positive' : atual.net_new_mrr < 0 ? 'negative' : 'neutral'}
              sub={`novos ${fmtK(atual.novos_mrr)} · expansão ${fmtK(atual.expansao_mrr)} · contração ${fmtK(atual.contracao_mrr)} · churn ${fmtK(atual.churn_mrr)}`}
            />
            <HeroStat
              label="NRR"
              value={pct(atual.nrr_pct)}
              tone={atual.nrr_pct === null ? 'neutral' : atual.nrr_pct >= 100 ? 'positive' : 'warning'}
              sub={atual.nrr_pct === null ? 'sem MRR no mês anterior' : `retenção bruta (GRR) ${pct(atual.grr_pct)}`}
            />
          </div>

          <div style={{ ...panelGrid, marginTop: '12px' }}>
            <Panel title="Evolução do MRR" hint="últimos 12 meses">
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={grafico} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={surface.divider} vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: text.tertiary, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: text.tertiary, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtK} width={44} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [fmtMoneyFull(Number(v)), 'MRR']} />
                    <Line type="monotone" dataKey="mrr" stroke={chart.revenue} strokeWidth={2.2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Movimento do MRR" hint="o que entrou e o que saiu em cada mês">
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={grafico} stackOffset="sign" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={surface.divider} vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: text.tertiary, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: text.tertiary, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtK} width={44} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [fmtMoneyFull(Math.abs(Number(v))), String(n)]} />
                    <Legend wrapperStyle={{ fontSize: 11, color: text.secondary }} />
                    <ReferenceLine y={0} stroke={surface.borderStrong} />
                    <Bar dataKey="novos" name="Novos" stackId="m" fill={semantic.success} />
                    <Bar dataKey="expansao" name="Expansão" stackId="m" fill={semantic.successSoft} />
                    <Bar dataKey="contracao" name="Contração" stackId="m" fill={semantic.warning} />
                    <Bar dataKey="churn" name="Churn" stackId="m" fill={semantic.danger} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>

          {/* ===================== Churn e unit economics ===================== */}
          <SectionLabel icon={Gauge} title="Retenção e unit economics" hint="o crescimento se paga?" />
          <Panel title="Indicadores do mês" hint="o que cada número significa e de onde sai">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  ['Churn de clientes (logo)', pct(atual.logo_churn_pct), `${atual.clientes_churn} de ${atual.clientes_ini} cliente(s) saíram no mês`],
                  ['Churn de receita', pct(atual.receita_churn_pct), 'MRR perdido por cancelamento + redução ÷ MRR do início do mês'],
                  ['ARPA (ticket médio)', money(atual.arpa), 'MRR ÷ clientes recorrentes'],
                  ['LTV', money(atual.ltv), atual.ltv === null
                    ? 'indefinido: nenhum cliente saiu nos últimos 6 meses (sem churn não há como estimar a vida do cliente)'
                    : 'ARPA × margem bruta ÷ churn mensal de clientes (média de 6 meses)'],
                  ['CAC', money(atual.cac), atual.cac === null
                    ? 'sem custo comercial lançado (categorias marketing/mídia/comercial/vendas/tráfego) ou sem cliente novo em 3 meses'
                    : `custo comercial de 3 meses ÷ clientes novos de 3 meses (custo do mês: ${fmtMoneyFull(atual.custo_aquisicao)})`],
                  ['LTV : CAC', atual.ltv_cac === null ? '—' : `${atual.ltv_cac.toFixed(1).replace('.', ',')}×`, 'referência de mercado: acima de 3×'],
                  ['Payback do CAC', atual.payback_meses === null ? '—' : `${atual.payback_meses.toFixed(1).replace('.', ',')} meses`, 'CAC ÷ (ARPA × margem bruta); referência: abaixo de 12 meses'],
                ].map(([label, valor, explica]) => (
                  <tr key={label}>
                    <td style={{ ...td, textAlign: 'left', color: text.primary, fontWeight: 560 }}>{label}</td>
                    <td style={{ ...td, color: text.primary, fontWeight: 650, fontSize: '14px' }}>{valor}</td>
                    <td style={{ ...td, textAlign: 'left', whiteSpace: 'normal', color: text.faint, fontSize: '12px' }}>{explica}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </>
      )}

      {/* ========================= Receita do mês ========================= */}
      <SectionLabel icon={Wallet} title="Receita do mês" hint="escolha o mês no topo; edite valor e status direto na linha" />
      <Panel
        title={`Faturas de ${monthLabelLong(effectiveMonth)}`}
        hint={atual
          ? `Total ${fmtMoneyFull(atual.receita_total)} · recebido ${fmtMoneyFull(atual.receita_paga)} · inadimplente ${fmtMoneyFull(atual.receita_inadimplente)} · recorrente ${fmtMoneyFull(atual.receita_recorrente)} · pontual ${fmtMoneyFull(atual.receita_pontual)}`
          : undefined}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <Button size="sm" variant="secondary" icon={<RefreshCw size={13} />} onClick={gerarFaturas} loading={gerando}>
            Gerar faturas recorrentes do mês
          </Button>
          <Button size="sm" icon={<Plus size={13} />} onClick={() => setNovaReceita(true)}>
            Lançar receita
          </Button>
        </div>
        {faturasQ.error && <QueryError message={faturasQ.error} onRetry={faturasQ.refetch} />}
        {faturasQ.data.length === 0 && !faturasQ.loading ? (
          <div style={{ color: text.muted, fontSize: '13px', padding: '8px 0' }}>
            Nenhuma fatura neste mês. Use “Gerar faturas recorrentes” para criar uma por contrato vigente.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...th, textAlign: 'left' }}>Cliente</th>
                  <th style={{ ...th, textAlign: 'left' }}>Contrato</th>
                  <th style={th}>Tipo</th>
                  <th style={th}>Valor</th>
                  <th style={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {faturasQ.data.map((f) => (
                  <FaturaRow key={`${f.id}-${f.valor}-${f.status}`} f={f} td={td} fld={fld} onChange={atualizarFatura} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* =========================== Cancelados =========================== */}
      <SectionLabel icon={UserMinus} title="Cancelados" hint="contratos encerrados nos últimos 24 meses" />
      <Panel title="Contratos cancelados" hint="MRR perdido, tempo de casa e motivo">
        <div style={{ marginBottom: '14px' }}>
          <Button size="sm" variant="secondary" onClick={() => setCancelando(true)} disabled={contratosVigentes.length === 0}>
            Registrar cancelamento
          </Button>
        </div>
        {canceladosQ.error && <QueryError message={canceladosQ.error} onRetry={canceladosQ.refetch} />}
        {canceladosQ.data.length === 0 && !canceladosQ.loading ? (
          <div style={{ color: text.muted, fontSize: '13px' }}>Nenhum cancelamento no período.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...th, textAlign: 'left' }}>Cliente</th>
                  <th style={{ ...th, textAlign: 'left' }}>Contrato</th>
                  <th style={th}>MRR perdido</th>
                  <th style={th}>Cancelado em</th>
                  <th style={th}>Meses de casa</th>
                  <th style={{ ...th, textAlign: 'left' }}>Motivo</th>
                  <th style={th} />
                </tr>
              </thead>
              <tbody>
                {canceladosQ.data.map((c) => (
                  <tr key={c.contrato_id}>
                    <td style={{ ...td, textAlign: 'left', color: text.primary }}>{c.cliente}</td>
                    <td style={{ ...td, textAlign: 'left' }}>{c.contrato} <span style={{ color: text.faint }}>· {TIPO_LABEL[c.tipo] ?? c.tipo}</span></td>
                    <td style={{ ...td, color: c.mrr_perdido ? semantic.danger : text.faint }}>{c.mrr_perdido === null ? '—' : fmtMoneyCents(c.mrr_perdido)}</td>
                    <td style={td}>{fmtDateBR(c.data_cancelamento)}</td>
                    <td style={td}>{c.meses_ativo}</td>
                    <td style={{ ...td, textAlign: 'left', whiteSpace: 'normal' }}>{c.motivo ?? <span style={{ color: text.faint }}>não informado</span>}</td>
                    <td style={td}>
                      <button
                        onClick={() => setReativar(c)}
                        title="Reativar contrato"
                        aria-label={`Reativar ${c.contrato}`}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: text.tertiary, display: 'inline-flex' }}
                      ><Undo2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* ======================== Histórico mensal ======================== */}
      {serie.length > 0 && (
        <>
          <SectionLabel icon={TrendingUp} title="Histórico mensal" hint="12 meses, do mais recente para o mais antigo" />
          <Panel title="MRR bridge">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ ...th, textAlign: 'left' }}>Mês</th>
                    <th style={th}>MRR</th>
                    <th style={th}>Novos</th>
                    <th style={th}>Expansão</th>
                    <th style={th}>Contração</th>
                    <th style={th}>Churn</th>
                    <th style={th}>Net new</th>
                    <th style={th}>Clientes</th>
                    <th style={th}>Churn logo</th>
                    <th style={th}>NRR</th>
                    <th style={th}>Receita faturada</th>
                  </tr>
                </thead>
                <tbody>
                  {[...serie].reverse().map((m) => (
                    <tr key={m.mes} style={m.mes === effectiveMonth ? { background: surface.hover } : undefined}>
                      <td style={{ ...td, textAlign: 'left', color: text.primary, fontWeight: 560 }}>{monthLabel(m.mes)}</td>
                      <td style={{ ...td, color: text.primary }}>{fmtMoneyFull(m.mrr)}</td>
                      <td style={td}>{m.novos_mrr ? fmtMoneyFull(m.novos_mrr) : '—'}</td>
                      <td style={td}>{m.expansao_mrr ? fmtMoneyFull(m.expansao_mrr) : '—'}</td>
                      <td style={td}>{m.contracao_mrr ? fmtMoneyFull(m.contracao_mrr) : '—'}</td>
                      <td style={{ ...td, color: m.churn_mrr ? semantic.danger : text.secondary }}>{m.churn_mrr ? fmtMoneyFull(m.churn_mrr) : '—'}</td>
                      <td style={{ ...td, color: m.net_new_mrr < 0 ? semantic.danger : m.net_new_mrr > 0 ? semantic.success : text.secondary }}>
                        {m.net_new_mrr ? fmtMoneyFull(m.net_new_mrr) : '—'}
                      </td>
                      <td style={td}>{m.clientes_fim}</td>
                      <td style={td}>{pct(m.logo_churn_pct)}</td>
                      <td style={td}>{pct(m.nrr_pct)}</td>
                      <td style={td}>{fmtMoneyFull(m.receita_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}

      {/* ============================== Modais ============================== */}
      <Modal
        isOpen={novaReceita}
        onClose={() => setNovaReceita(false)}
        title={`Lançar receita — ${monthLabelLong(effectiveMonth)}`}
        footer={(
          <>
            <Button variant="ghost" onClick={() => setNovaReceita(false)}>Cancelar</Button>
            <Button onClick={salvarReceita} loading={salvandoReceita}>Lançar</Button>
          </>
        )}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ fontSize: '12px', color: text.secondary }}>Contrato
            <select style={{ ...fld, marginTop: '5px' }} value={receitaForm.contratoId}
              onChange={(e) => setReceitaForm({ ...receitaForm, contratoId: e.target.value })}>
              <option value="">Selecione…</option>
              {contratosQ.data.filter((c) => c.status !== 'cancelado').map((c) => (
                <option key={c.id} value={c.id}>{c.cliente} — {c.nome} ({TIPO_LABEL[c.tipo] ?? c.tipo})</option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: '12px', color: text.secondary }}>Valor (R$)
            <input style={{ ...fld, marginTop: '5px' }} inputMode="decimal" placeholder="0,00" value={receitaForm.valor}
              onChange={(e) => setReceitaForm({ ...receitaForm, valor: e.target.value })} />
          </label>
          <label style={{ fontSize: '12px', color: text.secondary }}>Status
            <select style={{ ...fld, marginTop: '5px' }} value={receitaForm.status}
              onChange={(e) => setReceitaForm({ ...receitaForm, status: e.target.value as FaturaStatus })}>
              {STATUS_FATURA.filter((s) => s.value !== 'cancelada').map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
        </div>
      </Modal>

      <Modal
        isOpen={cancelando}
        onClose={() => setCancelando(false)}
        title="Registrar cancelamento"
        footer={(
          <>
            <Button variant="ghost" onClick={() => setCancelando(false)}>Voltar</Button>
            <Button variant="danger" onClick={cancelarContrato} loading={salvandoCancel}>Cancelar contrato</Button>
          </>
        )}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ fontSize: '12px', color: text.secondary }}>Contrato
            <select style={{ ...fld, marginTop: '5px' }} value={cancelForm.contratoId}
              onChange={(e) => setCancelForm({ ...cancelForm, contratoId: e.target.value })}>
              <option value="">Selecione…</option>
              {contratosVigentes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.cliente} — {c.nome}{c.valor_mensal ? ` (${fmtMoneyCents(c.valor_mensal)}/mês)` : ''}
                </option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: '12px', color: text.secondary }}>Data do cancelamento
            <input type="date" style={{ ...fld, marginTop: '5px' }} value={cancelForm.data}
              onChange={(e) => setCancelForm({ ...cancelForm, data: e.target.value })} />
          </label>
          <label style={{ fontSize: '12px', color: text.secondary }}>Motivo
            <input style={{ ...fld, marginTop: '5px' }} list="motivos-cancelamento" placeholder="Escolha ou escreva"
              value={cancelForm.motivo} onChange={(e) => setCancelForm({ ...cancelForm, motivo: e.target.value })} />
            <datalist id="motivos-cancelamento">{MOTIVOS.map((m) => <option key={m} value={m} />)}</datalist>
          </label>
          <div style={{ fontSize: '12px', color: text.faint }}>
            O MRR sai do mês do cancelamento em diante. Faturas futuras ainda não pagas são canceladas.
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={reativar !== null}
        onClose={() => setReativar(null)}
        onConfirm={reativarContrato}
        title="Reativar contrato"
        message={reativar ? `Reativar "${reativar.contrato}" de ${reativar.cliente}? O MRR volta a contar normalmente.` : ''}
        confirmLabel="Reativar"
      />
    </div>
  );
}

/** Linha editável: valor salva ao sair do campo; status salva ao trocar. */
function FaturaRow({ f, td, fld, onChange }: {
  f: FaturaMes;
  td: React.CSSProperties;
  fld: React.CSSProperties;
  onChange: (f: FaturaMes, patch: { valor?: number; status?: FaturaStatus }) => void;
}) {
  const { text } = useThemeTokens();
  const [valor, setValor] = useState(String(f.valor).replace('.', ','));
  const cancelada = f.status === 'cancelada';

  const commitValor = () => {
    const n = Number(valor.replace(/\./g, '').replace(',', '.'));
    if (!Number.isFinite(n) || n <= 0) { setValor(String(f.valor).replace('.', ',')); return; }
    if (n !== f.valor) onChange(f, { valor: n });
  };

  return (
    <tr style={cancelada ? { opacity: 0.5 } : undefined}>
      <td style={{ ...td, textAlign: 'left', color: text.primary }}>{f.cliente}</td>
      <td style={{ ...td, textAlign: 'left' }}>{f.contrato}</td>
      <td style={td}>{TIPO_LABEL[f.tipo] ?? f.tipo}</td>
      <td style={td}>
        <input
          aria-label={`Valor da fatura de ${f.cliente}`}
          style={{ ...fld, width: '120px', textAlign: 'right', padding: '6px 9px' }}
          value={valor}
          inputMode="decimal"
          onChange={(e) => setValor(e.target.value)}
          onBlur={commitValor}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
        />
      </td>
      <td style={td}>
        <select
          aria-label={`Status da fatura de ${f.cliente}`}
          style={{ ...fld, width: '140px', padding: '6px 9px' }}
          value={f.status}
          onChange={(e) => onChange(f, { status: e.target.value as FaturaStatus })}
        >
          {STATUS_FATURA.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </td>
    </tr>
  );
}

export default InsightsPage;
