-- ============================================================================
-- RAVO OS — RPCs de métricas para software house
-- ============================================================================
-- Cada função responde a uma pergunta de dono. A convenção `ref_month` recebe
-- qualquer data do mês desejado; a função normaliza para o primeiro dia.
--
-- Aplicar DEPOIS de schema_softwarehouse.sql:
--   psql -U ravo_user -d ravo_db -h localhost -f rpcs_softwarehouse.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- HELPER — custo direto de entrega de um mês (horas apontadas × custo/hora)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fn_custo_direto(ref DATE)
RETURNS NUMERIC
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(SUM(a.horas * p.custo_hora), 0)
  FROM public.apontamentos a
  JOIN public.pessoas p ON p.id = a.pessoa_id
  WHERE date_trunc('month', a.data) = date_trunc('month', ref);
$$;

-- ============================================================================
-- 1. RESUMO EXECUTIVO
-- Pergunta: o mês fechou no azul, e por quê?
-- ============================================================================
DROP FUNCTION IF EXISTS public.rpc_resumo_executivo(DATE);
CREATE FUNCTION public.rpc_resumo_executivo(ref_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  receita             NUMERIC,
  custo_direto        NUMERIC,
  margem_bruta        NUMERIC,
  margem_bruta_pct    NUMERIC,
  despesas            NUMERIC,
  resultado           NUMERIC,
  resultado_pct       NUMERIC,
  runway_meses        NUMERIC
)
LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_receita  NUMERIC;
  v_custo    NUMERIC;
  v_despesa  NUMERIC;
  v_burn     NUMERIC;
  v_caixa    NUMERIC;
BEGIN
  -- Receita reconhecida: tudo que não foi cancelado conta como receita do mês.
  SELECT COALESCE(SUM(f.valor), 0) INTO v_receita
  FROM public.faturas f
  WHERE date_trunc('month', f.competencia) = date_trunc('month', ref_month)
    AND f.status <> 'cancelada';

  v_custo := public.fn_custo_direto(ref_month);

  SELECT COALESCE(SUM(d.valor), 0) INTO v_despesa
  FROM public.despesas_operacionais d
  WHERE date_trunc('month', d.competencia) = date_trunc('month', ref_month);

  -- Burn médio dos últimos 3 meses: base mais estável que o mês corrente
  -- para projetar quanto tempo o caixa aguenta.
  SELECT COALESCE(AVG(total), 0) INTO v_burn FROM (
    SELECT date_trunc('month', d.competencia) AS m, SUM(d.valor) AS total
    FROM public.despesas_operacionais d
    WHERE d.competencia >= (date_trunc('month', ref_month) - INTERVAL '3 months')
      AND d.competencia <  (date_trunc('month', ref_month) + INTERVAL '1 month')
    GROUP BY 1
  ) t;

  SELECT COALESCE(c.valor, 0) INTO v_caixa FROM public.config c WHERE c.chave = 'saldo_caixa';

  receita          := v_receita;
  custo_direto     := v_custo;
  margem_bruta     := v_receita - v_custo;
  margem_bruta_pct := CASE WHEN v_receita > 0
                           THEN ROUND((v_receita - v_custo) / v_receita * 100, 1) ELSE 0 END;
  despesas         := v_despesa;
  resultado        := v_receita - v_custo - v_despesa;
  resultado_pct    := CASE WHEN v_receita > 0
                           THEN ROUND((v_receita - v_custo - v_despesa) / v_receita * 100, 1) ELSE 0 END;
  runway_meses     := CASE WHEN v_burn > 0 THEN ROUND(v_caixa / v_burn, 1) ELSE NULL END;

  RETURN NEXT;
END;
$$;

-- ============================================================================
-- 2. MIX DE RECEITA — previsível vs. que precisa ser vendida de novo
-- A métrica mais importante de uma software house multi-stream.
-- ============================================================================
DROP FUNCTION IF EXISTS public.rpc_mix_receita(DATE);
CREATE FUNCTION public.rpc_mix_receita(ref_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  tipo          TEXT,
  receita       NUMERIC,
  participacao  NUMERIC,
  recorrente    BOOLEAN
)
LANGUAGE sql STABLE AS $$
  WITH base AS (
    SELECT c.tipo AS tipo, SUM(f.valor) AS receita
    FROM public.faturas f
    JOIN public.contratos c ON c.id = f.contrato_id
    WHERE date_trunc('month', f.competencia) = date_trunc('month', ref_month)
      AND f.status <> 'cancelada'
    GROUP BY c.tipo
  ),
  tot AS (SELECT COALESCE(SUM(receita), 0) AS total FROM base)
  SELECT
    b.tipo,
    b.receita,
    CASE WHEN t.total > 0 THEN ROUND(b.receita / t.total * 100, 1) ELSE 0 END,
    b.tipo IN ('retainer','licenca')
  FROM base b CROSS JOIN tot t
  ORDER BY b.receita DESC;
$$;

-- ============================================================================
-- 3. SÉRIE MENSAL DE RECEITA POR STREAM
-- ============================================================================
DROP FUNCTION IF EXISTS public.rpc_receita_mensal(INT, DATE);
CREATE FUNCTION public.rpc_receita_mensal(months_back INT DEFAULT 6, ref_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  mes           TEXT,
  retainer      NUMERIC,
  projeto       NUMERIC,
  hora          NUMERIC,
  licenca       NUMERIC,
  total         NUMERIC,
  recorrente_pct NUMERIC
)
LANGUAGE sql STABLE AS $$
  WITH meses AS (
    SELECT generate_series(
      date_trunc('month', ref_month) - ((months_back - 1) || ' months')::INTERVAL,
      date_trunc('month', ref_month),
      '1 month'
    )::DATE AS m
  ),
  agg AS (
    SELECT
      date_trunc('month', f.competencia)::DATE AS m,
      SUM(f.valor) FILTER (WHERE c.tipo = 'retainer') AS retainer,
      SUM(f.valor) FILTER (WHERE c.tipo = 'projeto')  AS projeto,
      SUM(f.valor) FILTER (WHERE c.tipo = 'hora')     AS hora,
      SUM(f.valor) FILTER (WHERE c.tipo = 'licenca')  AS licenca
    FROM public.faturas f
    JOIN public.contratos c ON c.id = f.contrato_id
    WHERE f.status <> 'cancelada'
    GROUP BY 1
  )
  SELECT
    TO_CHAR(m.m, 'YYYY-MM'),
    COALESCE(a.retainer, 0),
    COALESCE(a.projeto, 0),
    COALESCE(a.hora, 0),
    COALESCE(a.licenca, 0),
    COALESCE(a.retainer, 0) + COALESCE(a.projeto, 0) + COALESCE(a.hora, 0) + COALESCE(a.licenca, 0),
    CASE
      WHEN COALESCE(a.retainer,0)+COALESCE(a.projeto,0)+COALESCE(a.hora,0)+COALESCE(a.licenca,0) > 0
      THEN ROUND((COALESCE(a.retainer,0)+COALESCE(a.licenca,0))
                 / (COALESCE(a.retainer,0)+COALESCE(a.projeto,0)+COALESCE(a.hora,0)+COALESCE(a.licenca,0)) * 100, 1)
      ELSE 0
    END
  FROM meses m LEFT JOIN agg a ON a.m = m.m
  ORDER BY m.m;
$$;

-- ============================================================================
-- 4. TAXA DE UTILIZAÇÃO FATURÁVEL
-- Pergunta: quanto da capacidade que eu pago virou receita?
-- ============================================================================
DROP FUNCTION IF EXISTS public.rpc_utilizacao(DATE);
CREATE FUNCTION public.rpc_utilizacao(ref_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  pessoa            TEXT,
  papel             TEXT,
  horas_faturaveis  NUMERIC,
  horas_totais      NUMERIC,
  capacidade        NUMERIC,
  utilizacao_pct    NUMERIC,
  realized_rate     NUMERIC
)
LANGUAGE sql STABLE AS $$
  WITH dias AS (
    -- Capacidade do mês: semanas úteis aproximadas pela razão dias/7.
    SELECT (EXTRACT(DAY FROM (date_trunc('month', ref_month) + INTERVAL '1 month - 1 day')) / 7.0) AS semanas
  ),
  ap AS (
    SELECT
      a.pessoa_id,
      SUM(a.horas) FILTER (WHERE a.faturavel) AS faturaveis,
      SUM(a.horas) AS totais
    FROM public.apontamentos a
    WHERE date_trunc('month', a.data) = date_trunc('month', ref_month)
    GROUP BY a.pessoa_id
  ),
  rec AS (
    -- Receita atribuída à pessoa, rateada pelas horas faturáveis que ela lançou
    -- em cada contrato. Permite comparar o rate realizado com o rate alvo.
    SELECT a.pessoa_id, SUM(f.valor * a.horas / NULLIF(th.total, 0)) AS receita
    FROM public.apontamentos a
    JOIN public.faturas f ON f.contrato_id = a.contrato_id
                         AND date_trunc('month', f.competencia) = date_trunc('month', a.data)
    JOIN (
      SELECT contrato_id, date_trunc('month', data) AS m, SUM(horas) AS total
      FROM public.apontamentos WHERE faturavel GROUP BY 1, 2
    ) th ON th.contrato_id = a.contrato_id AND th.m = date_trunc('month', a.data)
    WHERE a.faturavel
      AND f.status <> 'cancelada'
      AND date_trunc('month', a.data) = date_trunc('month', ref_month)
    GROUP BY a.pessoa_id
  )
  SELECT
    p.nome,
    p.papel,
    COALESCE(ap.faturaveis, 0),
    COALESCE(ap.totais, 0),
    ROUND(p.horas_semana * d.semanas, 1),
    CASE WHEN p.horas_semana * d.semanas > 0
         THEN ROUND(COALESCE(ap.faturaveis, 0) / (p.horas_semana * d.semanas) * 100, 1)
         ELSE 0 END,
    CASE WHEN COALESCE(ap.faturaveis, 0) > 0
         THEN ROUND(COALESCE(rec.receita, 0) / ap.faturaveis, 2)
         ELSE 0 END
  FROM public.pessoas p
  CROSS JOIN dias d
  LEFT JOIN ap  ON ap.pessoa_id  = p.id
  LEFT JOIN rec ON rec.pessoa_id = p.id
  WHERE p.ativo
  ORDER BY 6 DESC;
$$;

-- ============================================================================
-- 5. MARGEM POR PROJETO + DESVIO DE ESCOPO
-- Pergunta: quais projetos estão comendo minha margem?
-- ============================================================================
DROP FUNCTION IF EXISTS public.rpc_margem_projetos(DATE);
CREATE FUNCTION public.rpc_margem_projetos(ref_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  projeto           TEXT,
  cliente           TEXT,
  tipo              TEXT,
  status            TEXT,
  receita           NUMERIC,
  custo             NUMERIC,
  margem            NUMERIC,
  margem_pct        NUMERIC,
  horas_estimadas   NUMERIC,
  horas_reais       NUMERIC,
  desvio_escopo_pct NUMERIC
)
LANGUAGE sql STABLE AS $$
  WITH custo AS (
    SELECT a.projeto_id, SUM(a.horas * p.custo_hora) AS custo, SUM(a.horas) AS horas
    FROM public.apontamentos a
    JOIN public.pessoas p ON p.id = a.pessoa_id
    WHERE a.projeto_id IS NOT NULL
    GROUP BY a.projeto_id
  ),
  receita AS (
    SELECT c.id AS contrato_id, SUM(f.valor) AS receita
    FROM public.faturas f
    JOIN public.contratos c ON c.id = f.contrato_id
    WHERE f.status <> 'cancelada'
    GROUP BY c.id
  )
  SELECT
    pr.nome,
    cl.nome,
    ct.tipo,
    pr.status,
    COALESCE(r.receita, 0),
    COALESCE(cu.custo, 0),
    COALESCE(r.receita, 0) - COALESCE(cu.custo, 0),
    CASE WHEN COALESCE(r.receita, 0) > 0
         THEN ROUND((r.receita - COALESCE(cu.custo, 0)) / r.receita * 100, 1) ELSE 0 END,
    pr.horas_estimadas,
    COALESCE(cu.horas, 0),
    CASE WHEN pr.horas_estimadas > 0
         THEN ROUND((COALESCE(cu.horas, 0) - pr.horas_estimadas) / pr.horas_estimadas * 100, 1)
         ELSE NULL END
  FROM public.projetos pr
  JOIN public.contratos ct ON ct.id = pr.contrato_id
  JOIN public.clientes  cl ON cl.id = ct.cliente_id
  LEFT JOIN custo   cu ON cu.projeto_id  = pr.id
  LEFT JOIN receita r  ON r.contrato_id  = ct.id
  WHERE pr.status <> 'cancelado'
  ORDER BY 8 ASC;
$$;

-- ============================================================================
-- 6. CONCENTRAÇÃO DE RECEITA — risco de carteira
-- Pergunta: perder um cliente me quebra?
-- ============================================================================
DROP FUNCTION IF EXISTS public.rpc_concentracao_clientes(DATE);
CREATE FUNCTION public.rpc_concentracao_clientes(ref_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  cliente       TEXT,
  receita       NUMERIC,
  participacao  NUMERIC,
  acumulado     NUMERIC
)
LANGUAGE sql STABLE AS $$
  WITH base AS (
    SELECT cl.nome AS cliente, SUM(f.valor) AS receita
    FROM public.faturas f
    JOIN public.contratos ct ON ct.id = f.contrato_id
    JOIN public.clientes  cl ON cl.id = ct.cliente_id
    WHERE date_trunc('month', f.competencia) = date_trunc('month', ref_month)
      AND f.status <> 'cancelada'
    GROUP BY cl.nome
  ),
  tot AS (SELECT COALESCE(SUM(receita), 0) AS total FROM base)
  SELECT
    b.cliente,
    b.receita,
    CASE WHEN t.total > 0 THEN ROUND(b.receita / t.total * 100, 1) ELSE 0 END,
    CASE WHEN t.total > 0 THEN ROUND(
      SUM(b.receita) OVER (ORDER BY b.receita DESC ROWS UNBOUNDED PRECEDING) / t.total * 100, 1)
    ELSE 0 END
  FROM base b CROSS JOIN tot t
  ORDER BY b.receita DESC;
$$;

-- ============================================================================
-- 7. BACKLOG CONTRATADO — receita já vendida ainda não reconhecida
-- Pergunta: quantos meses de operação eu já tenho garantidos?
-- ============================================================================
DROP FUNCTION IF EXISTS public.rpc_backlog(DATE);
CREATE FUNCTION public.rpc_backlog(ref_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  backlog_projetos    NUMERIC,
  backlog_recorrente  NUMERIC,
  backlog_total       NUMERIC,
  receita_media_3m    NUMERIC,
  cobertura_meses     NUMERIC
)
LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_proj  NUMERIC;
  v_rec   NUMERIC;
  v_media NUMERIC;
BEGIN
  -- Projetos: valor fechado menos o que já foi faturado.
  SELECT COALESCE(SUM(GREATEST(c.valor_total - COALESCE(fat.total, 0), 0)), 0) INTO v_proj
  FROM public.contratos c
  LEFT JOIN (
    SELECT contrato_id, SUM(valor) AS total FROM public.faturas
    WHERE status <> 'cancelada' GROUP BY contrato_id
  ) fat ON fat.contrato_id = c.id
  WHERE c.tipo = 'projeto' AND c.status = 'ativo';

  -- Recorrentes: valor mensal × meses restantes de contrato (12 se indeterminado).
  SELECT COALESCE(SUM(
    c.valor_mensal * CASE
      WHEN c.data_fim IS NULL THEN 12
      ELSE GREATEST(
        EXTRACT(YEAR  FROM AGE(c.data_fim, ref_month)) * 12 +
        EXTRACT(MONTH FROM AGE(c.data_fim, ref_month)), 0)
    END
  ), 0) INTO v_rec
  FROM public.contratos c
  WHERE c.tipo IN ('retainer','licenca') AND c.status = 'ativo';

  SELECT COALESCE(AVG(total), 0) INTO v_media FROM (
    SELECT date_trunc('month', f.competencia) AS m, SUM(f.valor) AS total
    FROM public.faturas f
    WHERE f.status <> 'cancelada'
      AND f.competencia >= (date_trunc('month', ref_month) - INTERVAL '3 months')
      AND f.competencia <  (date_trunc('month', ref_month) + INTERVAL '1 month')
    GROUP BY 1
  ) t;

  backlog_projetos   := v_proj;
  backlog_recorrente := v_rec;
  backlog_total      := v_proj + v_rec;
  receita_media_3m   := ROUND(v_media, 2);
  cobertura_meses    := CASE WHEN v_media > 0 THEN ROUND((v_proj + v_rec) / v_media, 1) ELSE NULL END;

  RETURN NEXT;
END;
$$;

-- ============================================================================
-- 8. PIPELINE PONDERADO
-- ============================================================================
DROP FUNCTION IF EXISTS public.rpc_pipeline();
CREATE FUNCTION public.rpc_pipeline()
RETURNS TABLE (
  estagio         TEXT,
  quantidade      BIGINT,
  valor_total     NUMERIC,
  valor_ponderado NUMERIC
)
LANGUAGE sql STABLE AS $$
  SELECT
    o.estagio,
    COUNT(*),
    COALESCE(SUM(o.valor_estimado), 0),
    COALESCE(SUM(o.valor_estimado * o.probabilidade / 100), 0)
  FROM public.oportunidades o
  WHERE o.estagio NOT IN ('ganho','perdido')
  GROUP BY o.estagio
  ORDER BY 4 DESC;
$$;

-- ============================================================================
-- 9. SAÚDE COMERCIAL — win rate, ciclo de venda, ticket médio
-- ============================================================================
DROP FUNCTION IF EXISTS public.rpc_saude_comercial(INT, DATE);
CREATE FUNCTION public.rpc_saude_comercial(months_back INT DEFAULT 6, ref_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  win_rate        NUMERIC,
  ciclo_dias      NUMERIC,
  ticket_medio    NUMERIC,
  ganhos          BIGINT,
  perdidos        BIGINT
)
LANGUAGE sql STABLE AS $$
  WITH fechadas AS (
    SELECT *
    FROM public.oportunidades
    WHERE estagio IN ('ganho','perdido')
      AND data_fechamento IS NOT NULL
      AND data_fechamento >= (date_trunc('month', ref_month) - ((months_back - 1) || ' months')::INTERVAL)
      AND data_fechamento <  (date_trunc('month', ref_month) + INTERVAL '1 month')
  )
  SELECT
    CASE WHEN COUNT(*) > 0
         THEN ROUND(COUNT(*) FILTER (WHERE estagio = 'ganho')::NUMERIC / COUNT(*) * 100, 1)
         ELSE 0 END,
    ROUND(COALESCE(AVG(data_fechamento - data_abertura) FILTER (WHERE estagio = 'ganho'), 0), 0),
    ROUND(COALESCE(AVG(valor_estimado) FILTER (WHERE estagio = 'ganho'), 0), 2),
    COUNT(*) FILTER (WHERE estagio = 'ganho'),
    COUNT(*) FILTER (WHERE estagio = 'perdido')
  FROM fechadas;
$$;

-- ============================================================================
-- 10. SAÚDE DA CARTEIRA RECORRENTE — MRR, churn e NRR só do que é recorrente
-- (Aplicar MRR ao faturamento inteiro seria erro: projeto não é recorrente.)
-- ============================================================================
DROP FUNCTION IF EXISTS public.rpc_carteira_recorrente(INT, DATE);
CREATE FUNCTION public.rpc_carteira_recorrente(months_back INT DEFAULT 6, ref_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  mes           TEXT,
  mrr           NUMERIC,
  clientes      BIGINT,
  churn_pct     NUMERIC,
  nrr_pct       NUMERIC
)
LANGUAGE sql STABLE AS $$
  WITH meses AS (
    SELECT generate_series(
      date_trunc('month', ref_month) - ((months_back - 1) || ' months')::INTERVAL,
      date_trunc('month', ref_month),
      '1 month'
    )::DATE AS m
  ),
  base AS (
    SELECT
      m.m,
      COALESCE(SUM(f.valor), 0) AS mrr,
      COUNT(DISTINCT ct.cliente_id) AS clientes
    FROM meses m
    LEFT JOIN public.faturas f
           ON date_trunc('month', f.competencia) = m.m AND f.status <> 'cancelada'
    LEFT JOIN public.contratos ct
           ON ct.id = f.contrato_id AND ct.tipo IN ('retainer','licenca')
    WHERE ct.id IS NOT NULL OR f.id IS NULL
    GROUP BY m.m
  )
  SELECT
    TO_CHAR(b.m, 'YYYY-MM'),
    b.mrr,
    b.clientes,
    CASE WHEN LAG(b.clientes) OVER (ORDER BY b.m) > 0
         THEN ROUND(GREATEST(LAG(b.clientes) OVER (ORDER BY b.m) - b.clientes, 0)::NUMERIC
                    / LAG(b.clientes) OVER (ORDER BY b.m) * 100, 1)
         ELSE 0 END,
    CASE WHEN LAG(b.mrr) OVER (ORDER BY b.m) > 0
         THEN ROUND(b.mrr / LAG(b.mrr) OVER (ORDER BY b.m) * 100, 1)
         ELSE 100 END
  FROM base b
  ORDER BY b.m;
$$;

-- ============================================================================
-- PERMISSÕES — PostgREST expõe apenas o que a role anônima enxerga
-- ============================================================================
GRANT USAGE ON SCHEMA public TO ravo_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ravo_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ravo_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO ravo_user;

COMMIT;
