/**
 * RAVO OS — DRE (Demonstração do Resultado) mensal, Simples Nacional
 *
 * Cascata e definições em ravo-backend/sql/20_dre.sql. Receita vem das faturas
 * (a mesma da página Insights); despesas são lançadas aqui e classificadas em
 * custo de entrega / variável / fixa / financeira / depreciação.
 */

import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { Receipt, Layers, Plus, Copy, Trash2 } from 'lucide-react';
import { SectionLabel, HeroStat, Panel, heroGrid } from '@/components/SectionKit';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { QueryError, QueryLoading } from '@/components/QueryState';
import { usePeriod, monthLabel, monthLabelLong, type MonthKey } from '@/contexts/PeriodContext';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import {
  useDre, useDespesasMes, useAliquotaSimples,
  type DreMes, type Despesa, type DespesaClasse,
} from '@/hooks/useDreQueries';
import { sb as supabase } from '@/services/supabase';
import { fmtMoneyFull, fmtK } from '@/utils/format';
import { toastError, toastSuccess } from '@/utils/toast';
import { useRevalidateStore } from '@/store/revalidate.store';

const CLASSES: { value: DespesaClasse; label: string; hint: string }[] = [
  { value: 'custo', label: 'Custo de entrega', hint: 'freelancers, ferramentas e time que entregam o serviço ao cliente' },
  { value: 'variavel', label: 'Variável', hint: 'cresce com a venda: mídia paga, comissão, taxas de pagamento' },
  { value: 'fixa', label: 'Fixa', hint: 'existe mesmo sem vender: aluguel, salários administrativos, softwares internos' },
  { value: 'financeira', label: 'Financeira', hint: 'juros, tarifas bancárias, IOF' },
  { value: 'depreciacao', label: 'Depreciação', hint: 'desgaste de equipamentos' },
];
const CLASSE_LABEL = Object.fromEntries(CLASSES.map((c) => [c.value, c.label])) as Record<DespesaClasse, string>;

const prevMonth = (m: MonthKey): MonthKey => {
  const [y, mo] = m.split('-').map(Number);
  const d = new Date(y, mo - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` as MonthKey;
};
const parseMoney = (s: string) => Number(s.replace(/\./g, '').replace(',', '.'));
const pct = (v: number | null) => (v === null ? '—' : `${v.toFixed(1).replace('.', ',')}%`);

type RowKind = 'total' | 'item' | 'pct' | 'result';
interface DreRow { label: string; kind: RowKind; get: (m: DreMes) => number | null; negate?: boolean; hint?: string }

const ROWS: DreRow[] = [
  { label: 'Faturamento bruto', kind: 'total', get: (m) => m.faturamento_bruto, hint: 'todas as faturas da competência' },
  { label: 'Cancelamentos', kind: 'item', negate: true, get: (m) => m.cancelamentos, hint: 'faturas canceladas' },
  { label: 'Impostos s/ faturamento', kind: 'item', negate: true, get: (m) => m.impostos_faturamento, hint: 'alíquota do Simples × (bruto − cancelamentos)' },
  { label: 'Faturamento líquido', kind: 'total', get: (m) => m.faturamento_liquido },
  { label: 'Custo de entrega', kind: 'item', negate: true, get: (m) => m.custo_entrega, hint: 'horas apontadas × custo/hora + despesas de custo' },
  { label: 'Lucro bruto', kind: 'total', get: (m) => m.lucro_bruto },
  { label: 'Margem bruta', kind: 'pct', get: (m) => m.margem_bruta_pct },
  { label: 'Despesas variáveis', kind: 'item', negate: true, get: (m) => m.despesas_variaveis },
  { label: 'Margem de contribuição', kind: 'total', get: (m) => m.margem_contribuicao },
  { label: 'Margem de contribuição %', kind: 'pct', get: (m) => m.margem_contribuicao_pct },
  { label: 'Despesas fixas', kind: 'item', negate: true, get: (m) => m.despesas_fixas },
  { label: 'EBITDA', kind: 'result', get: (m) => m.ebitda, hint: 'resultado operacional, antes de juros e depreciação' },
  { label: 'EBITDA %', kind: 'pct', get: (m) => m.ebitda_pct },
  { label: 'Despesas financeiras', kind: 'item', negate: true, get: (m) => m.despesas_financeiras },
  { label: 'Depreciação', kind: 'item', negate: true, get: (m) => m.depreciacao },
  { label: 'Lucro antes do IR (LAIR)', kind: 'total', get: (m) => m.lair },
  { label: 'Impostos s/ lucro', kind: 'item', negate: true, get: (m) => m.impostos_lucro, hint: 'no Simples, IRPJ e CSLL já estão no imposto sobre o faturamento' },
  { label: 'Lucro líquido', kind: 'result', get: (m) => m.lucro_liquido },
  { label: 'Lucro líquido %', kind: 'pct', get: (m) => m.lucro_liquido_pct },
];

export function DREPage() {
  const { chart, text, surface, semantic } = useThemeTokens();
  const { effectiveMonth, isAllTime } = usePeriod();

  const dreQ = useDre(effectiveMonth, 6);
  const despQ = useDespesasMes(effectiveMonth);
  const aliqQ = useAliquotaSimples();

  const refetchAll = () => {
    dreQ.refetch(); despQ.refetch(); aliqQ.refetch();
    useRevalidateStore.getState().invalidate();
  };

  const serie = dreQ.data;
  const atual = serie.find((m) => m.mes === effectiveMonth) ?? serie[serie.length - 1];

  const grafico = useMemo(() => serie.map((m) => ({
    label: monthLabel(m.mes),
    liquido: m.faturamento_liquido,
    ebitda: m.ebitda,
    lucro: m.lucro_liquido,
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
    padding: '8px 10px', fontSize: '12.5px', color: text.secondary, textAlign: 'right',
    whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', borderBottom: `1px solid ${surface.divider}`,
  };
  const fld: React.CSSProperties = {
    width: '100%', padding: '9px 11px', borderRadius: '8px', background: surface.input,
    border: `1px solid ${surface.borderStrong}`, color: text.primary, fontSize: '13px',
  };

  /* ------------------------------------------------------------- alíquota */
  const [aliqEdit, setAliqEdit] = useState<string | null>(null);
  const salvarAliquota = async () => {
    if (aliqEdit === null) return;
    const v = parseMoney(aliqEdit);
    setAliqEdit(null);
    if (!Number.isFinite(v) || v < 0 || v > 40) { toastError('Informe uma alíquota entre 0 e 40%.'); return; }
    if (v === aliqQ.data) return;
    const { error } = await supabase.from('config').upsert(
      [{ chave: 'aliquota_simples', valor: v, descricao: 'Alíquota efetiva do Simples Nacional sobre o faturamento (%)' }],
      { onConflict: 'chave' },
    );
    if (error) { toastError(`Não foi possível salvar a alíquota: ${error.message}`); return; }
    toastSuccess('Alíquota atualizada — a DRE de todos os meses foi recalculada');
    refetchAll();
  };

  /* ------------------------------------------------------------- despesas */
  const [nova, setNova] = useState(false);
  const [form, setForm] = useState({ descricao: '', categoria: '', valor: '', classe: 'fixa' as DespesaClasse, recorrente: false });
  const [salvando, setSalvando] = useState(false);
  const [excluir, setExcluir] = useState<Despesa | null>(null);
  const [copiando, setCopiando] = useState(false);

  const salvarDespesa = async () => {
    const valor = parseMoney(form.valor);
    if (!form.descricao.trim() || !Number.isFinite(valor) || valor <= 0) {
      toastError('Informe a descrição e um valor maior que zero.'); return;
    }
    setSalvando(true);
    const { error } = await supabase.from('despesas_operacionais').insert([{
      descricao: form.descricao.trim(), categoria: form.categoria.trim() || null, valor,
      competencia: `${effectiveMonth}-01`, recorrente: form.recorrente, classe: form.classe,
    }]);
    setSalvando(false);
    if (error) { toastError(`Não foi possível salvar: ${error.message}`); return; }
    toastSuccess('Despesa lançada');
    setNova(false);
    setForm({ descricao: '', categoria: '', valor: '', classe: 'fixa', recorrente: false });
    refetchAll();
  };

  const atualizarDespesa = async (d: Despesa, patch: Partial<Pick<Despesa, 'valor' | 'classe' | 'recorrente'>>) => {
    const { error } = await supabase.from('despesas_operacionais').update(patch).eq('id', d.id);
    if (error) { toastError(`Não foi possível atualizar: ${error.message}`); return; }
    refetchAll();
  };

  const excluirDespesa = async () => {
    if (!excluir) return;
    const { error } = await supabase.from('despesas_operacionais').delete().eq('id', excluir.id);
    setExcluir(null);
    if (error) { toastError(`Não foi possível excluir: ${error.message}`); return; }
    toastSuccess('Despesa excluída');
    refetchAll();
  };

  /** Copia as despesas recorrentes do mês anterior que ainda não existem neste mês. */
  const copiarRecorrentes = async () => {
    setCopiando(true);
    const ant = prevMonth(effectiveMonth);
    const { data, error } = await supabase
      .from('despesas_operacionais')
      .select('descricao,categoria,valor,classe')
      .eq('recorrente', true)
      .gte('competencia', `${ant}-01`)
      .lte('competencia', `${ant}-31`);
    if (error) { setCopiando(false); toastError(`Não foi possível buscar o mês anterior: ${error.message}`); return; }
    const jaTem = new Set(despQ.data.map((d) => d.descricao.toLowerCase()));
    const novas = (Array.isArray(data) ? data : [])
      .filter((r: Record<string, unknown>) => !jaTem.has(String(r.descricao).toLowerCase()))
      .map((r: Record<string, unknown>) => ({
        descricao: r.descricao, categoria: r.categoria, valor: r.valor, classe: r.classe,
        competencia: `${effectiveMonth}-01`, recorrente: true,
      }));
    if (novas.length === 0) {
      setCopiando(false);
      toastSuccess('Nada a copiar: as recorrentes do mês anterior já estão aqui (ou não há nenhuma)');
      return;
    }
    const { error: e2 } = await supabase.from('despesas_operacionais').insert(novas);
    setCopiando(false);
    if (e2) { toastError(`Não foi possível copiar: ${e2.message}`); return; }
    toastSuccess(`${novas.length} despesa${novas.length > 1 ? 's' : ''} copiada${novas.length > 1 ? 's' : ''}`);
    refetchAll();
  };

  const carregando = dreQ.loading && serie.length === 0;
  const erro = dreQ.error;
  const aliquota = aliqQ.data;
  const tomPos = (v: number) => (v > 0 ? 'positive' : v < 0 ? 'negative' : 'neutral') as 'positive' | 'negative' | 'neutral';

  return (
    <div>
      <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 650, color: text.primary, margin: 0, letterSpacing: '-0.01em' }}>DRE</h1>
          <p style={{ fontSize: '13px', color: text.muted, margin: '4px 0 0' }}>
            {monthLabelLong(effectiveMonth)}
            {isAllTime ? ' (mês atual — escolha outro mês no seletor do topo)' : ''}
            {' · regime de competência, Simples Nacional'}
          </p>
        </div>
        <label style={{ fontSize: '12px', color: text.secondary, display: 'flex', alignItems: 'center', gap: '8px' }}>
          Alíquota do Simples (%)
          <input
            aria-label="Alíquota do Simples"
            style={{ ...fld, width: '80px', textAlign: 'right', padding: '6px 9px' }}
            inputMode="decimal"
            value={aliqEdit ?? String(aliquota).replace('.', ',')}
            onChange={(e) => setAliqEdit(e.target.value)}
            onBlur={salvarAliquota}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          />
        </label>
      </div>

      {erro && <QueryError message={erro} onRetry={dreQ.refetch} />}
      {carregando && <QueryLoading height={220} />}

      {atual && (
        <>
          <SectionLabel icon={Receipt} title="Resultado do mês" hint="quanto sobra de cada real faturado" />
          <div style={heroGrid}>
            <HeroStat label="Faturamento líquido" value={fmtMoneyFull(atual.faturamento_liquido)}
              sub={`bruto ${fmtK(atual.faturamento_bruto)} · impostos ${fmtK(atual.impostos_faturamento)} · cancel. ${fmtK(atual.cancelamentos)}`} />
            <HeroStat label="Lucro bruto" value={fmtMoneyFull(atual.lucro_bruto)}
              tone={tomPos(atual.lucro_bruto)} sub={`margem bruta ${pct(atual.margem_bruta_pct)}`} />
            <HeroStat label="EBITDA" value={fmtMoneyFull(atual.ebitda)}
              tone={tomPos(atual.ebitda)} sub={`margem ${pct(atual.ebitda_pct)}`} />
            <HeroStat label="Lucro líquido" value={fmtMoneyFull(atual.lucro_liquido)}
              tone={tomPos(atual.lucro_liquido)} sub={`margem ${pct(atual.lucro_liquido_pct)}`} />
          </div>

          <div style={{ marginTop: '12px' }}>
            <Panel title="Faturamento líquido, EBITDA e lucro líquido" hint="últimos 6 meses">
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={grafico} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={surface.divider} vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: text.tertiary, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: text.tertiary, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtK} width={44} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [fmtMoneyFull(Number(v)), String(n)]} />
                    <Legend wrapperStyle={{ fontSize: 11, color: text.secondary }} />
                    <ReferenceLine y={0} stroke={surface.borderStrong} />
                    <Bar dataKey="liquido" name="Faturamento líquido" fill={chart.revenue} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="ebitda" name="EBITDA" fill={semantic.success} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="lucro" name="Lucro líquido" fill={semantic.successSoft} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>

          <SectionLabel icon={Layers} title="Demonstração do resultado" hint="mês selecionado em destaque; deduções aparecem negativas" />
          <Panel title="DRE por mês" hint="passe o mouse na linha para ver a definição">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
                <thead>
                  <tr>
                    <th style={{ ...th, textAlign: 'left' }}>Linha</th>
                    {serie.map((m) => (
                      <th key={m.mes} style={{ ...th, color: m.mes === atual.mes ? text.primary : text.tertiary }}>{monthLabel(m.mes)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r) => {
                    const strong = r.kind === 'total' || r.kind === 'result';
                    return (
                      <tr key={r.label} title={r.hint}>
                        <td style={{
                          ...td, textAlign: 'left', fontWeight: strong ? 650 : 400,
                          color: strong ? text.primary : r.kind === 'pct' ? text.faint : text.secondary,
                          paddingLeft: r.kind === 'item' ? '22px' : '10px', fontStyle: r.kind === 'pct' ? 'italic' : undefined,
                        }}>{r.label}</td>
                        {serie.map((m) => {
                          const raw = r.get(m);
                          let shown: string;
                          if (raw === null) shown = '—';
                          else if (r.kind === 'pct') shown = pct(raw);
                          else if (raw === 0) shown = '—';
                          else shown = fmtMoneyFull(r.negate ? -raw : raw);
                          const color = r.kind === 'result' && raw !== null && raw !== 0
                            ? (raw > 0 ? semantic.success : semantic.danger)
                            : strong ? text.primary : undefined;
                          return (
                            <td key={m.mes} style={{
                              ...td, fontWeight: strong ? 650 : 400, color,
                              background: m.mes === atual.mes ? surface.hover : undefined,
                            }}>{shown}</td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}

      {/* ============================== Despesas ============================== */}
      <SectionLabel icon={Receipt} title="Despesas do mês" hint="a classe decide em qual linha da DRE a despesa entra" />
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', margin: '0 0 8px', flexWrap: 'wrap' }}>
        <Button size="sm" variant="secondary" icon={<Copy size={13} />} onClick={copiarRecorrentes} loading={copiando}>
          Copiar recorrentes do mês anterior
        </Button>
        <Button size="sm" icon={<Plus size={13} />} onClick={() => setNova(true)}>Lançar despesa</Button>
      </div>
      <Panel title={`Lançamentos de ${monthLabelLong(effectiveMonth)}`} hint="valor salva ao sair do campo; a DRE recalcula na hora">
        {despQ.data.length === 0 ? (
          <div style={{ color: text.muted, fontSize: '13px' }}>
            Nenhuma despesa lançada neste mês. A DRE só fica completa depois de lançar mídia, ferramentas, salários e demais custos.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...th, textAlign: 'left' }}>Descrição</th>
                  <th style={{ ...th, textAlign: 'left' }}>Categoria</th>
                  <th style={th}>Valor</th>
                  <th style={th}>Classe</th>
                  <th style={th}>Recorrente</th>
                  <th style={th} />
                </tr>
              </thead>
              <tbody>
                {despQ.data.map((d) => (
                  <DespesaRow key={d.id} d={d} td={td} fld={fld} onChange={atualizarDespesa} onDelete={setExcluir} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Modal
        isOpen={nova}
        onClose={() => setNova(false)}
        title={`Lançar despesa — ${monthLabelLong(effectiveMonth)}`}
        footer={(
          <>
            <Button variant="ghost" onClick={() => setNova(false)}>Cancelar</Button>
            <Button onClick={salvarDespesa} loading={salvando}>Lançar</Button>
          </>
        )}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ fontSize: '12px', color: text.secondary }}>Descrição
            <input style={{ ...fld, marginTop: '5px' }} placeholder="Ex.: Meta Ads, Aluguel, Freelancer de design"
              value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
          </label>
          <label style={{ fontSize: '12px', color: text.secondary }}>Valor (R$)
            <input style={{ ...fld, marginTop: '5px' }} inputMode="decimal" placeholder="0,00"
              value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
          </label>
          <label style={{ fontSize: '12px', color: text.secondary }}>Classe
            <select style={{ ...fld, marginTop: '5px' }} value={form.classe}
              onChange={(e) => setForm({ ...form, classe: e.target.value as DespesaClasse })}>
              {CLASSES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <span style={{ display: 'block', marginTop: '4px', fontSize: '11.5px', color: text.faint }}>
              {CLASSES.find((c) => c.value === form.classe)?.hint}
            </span>
          </label>
          <label style={{ fontSize: '12px', color: text.secondary }}>Categoria (opcional)
            <input style={{ ...fld, marginTop: '5px' }} placeholder="Ex.: Marketing, Infra, Pessoal"
              value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
            <span style={{ display: 'block', marginTop: '4px', fontSize: '11.5px', color: text.faint }}>
              Categorias de marketing, mídia, vendas ou tráfego também entram no CAC da página Insights.
            </span>
          </label>
          <label style={{ fontSize: '12.5px', color: text.secondary, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={form.recorrente} onChange={(e) => setForm({ ...form, recorrente: e.target.checked })} />
            Recorrente (aparece em “Copiar recorrentes” no mês seguinte)
          </label>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={excluir !== null}
        onClose={() => setExcluir(null)}
        onConfirm={excluirDespesa}
        title="Excluir despesa"
        message={excluir ? `Excluir "${excluir.descricao}" (${fmtMoneyFull(excluir.valor)})? A DRE do mês será recalculada.` : ''}
        confirmLabel="Excluir"
      />
    </div>
  );
}

function DespesaRow({ d, td, fld, onChange, onDelete }: {
  d: Despesa;
  td: React.CSSProperties;
  fld: React.CSSProperties;
  onChange: (d: Despesa, patch: Partial<Pick<Despesa, 'valor' | 'classe' | 'recorrente'>>) => void;
  onDelete: (d: Despesa) => void;
}) {
  const { text } = useThemeTokens();
  const [valor, setValor] = useState(String(d.valor).replace('.', ','));

  const commitValor = () => {
    const n = parseMoney(valor);
    if (!Number.isFinite(n) || n <= 0) { setValor(String(d.valor).replace('.', ',')); return; }
    if (n !== d.valor) onChange(d, { valor: n });
  };

  return (
    <tr>
      <td style={{ ...td, textAlign: 'left', color: text.primary }}>{d.descricao}</td>
      <td style={{ ...td, textAlign: 'left' }}>{d.categoria || '—'}</td>
      <td style={td}>
        <input
          aria-label={`Valor de ${d.descricao}`}
          style={{ ...fld, width: '120px', textAlign: 'right', padding: '6px 9px' }}
          value={valor} inputMode="decimal"
          onChange={(e) => setValor(e.target.value)} onBlur={commitValor}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
        />
      </td>
      <td style={td}>
        <select
          aria-label={`Classe de ${d.descricao}`}
          style={{ ...fld, width: '150px', padding: '6px 9px' }}
          value={d.classe}
          onChange={(e) => onChange(d, { classe: e.target.value as DespesaClasse })}
        >
          {CLASSES.map((c) => <option key={c.value} value={c.value}>{CLASSE_LABEL[c.value]}</option>)}
        </select>
      </td>
      <td style={td}>
        <input type="checkbox" aria-label={`${d.descricao} é recorrente`} checked={d.recorrente}
          onChange={(e) => onChange(d, { recorrente: e.target.checked })} />
      </td>
      <td style={td}>
        <button aria-label={`Excluir ${d.descricao}`} onClick={() => onDelete(d)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: text.faint, padding: '4px' }}>
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  );
}

export default DREPage;
