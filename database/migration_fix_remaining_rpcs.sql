-- =============================================================================
-- RAVO OS — Migration: corrige as RPCs restantes que referenciam auth.uid()
-- (schema Supabase Cloud que não existe no Postgres self-hosted) e/ou colunas
-- que não existem mais no schema real (software house).
-- =============================================================================
-- Mesmo diagnóstico da migration_fix_finance_rpcs_v2.sql: o pivô de schema
-- deixou pra trás funções com auth.uid() e nomes de coluna do modelo antigo.
-- Reescritas contra o schema real (confirmado via \d na VPS) e testadas num
-- Postgres local descartável antes de aplicar aqui.
--
-- Schema real usado nesta migration:
--   customers:          id, user_id, nome, email, telefone, data_criacao, data_atualizacao
--   subscriptions:       id, customer_id, plano, valor_mensal, data_inicio,
--                         data_proxima_cobranca, status(default 'ativa'),
--                         data_criacao, data_atualizacao
--   progresso_semanal:   id, user_id, semana(date), meta_vendas,
--                         vendas_realizadas, taxa_progresso, data_criacao, data_atualizacao
--   satisfacao:          id, customer_id, score(1-10), comentario,
--                         data_pesquisa(date), data_criacao, data_atualizacao
--   tickets:             id, customer_id, titulo, descricao,
--                         status(default 'aberto'), prioridade, data_criacao,
--                         data_atualizacao, data_fechamento
--
-- Observação sobre CAC/LTV (get_customer_metrics): o RAVO OS não rastreia
-- custo de aquisição nem histórico de retenção por cliente — não existe
-- coluna nenhuma pra isso em nenhuma tabela. Em vez de inventar um número,
-- as duas métricas retornam 0 (o frontend já trata isso: "sem CAC
-- calculado"). Quando houver dados reais de marketing/custo, dá pra plugar
-- aqui — mas fabricar um valor agora seria pior que mostrar 0.
--
-- Observação sobre NRR (get_churn_rate): sem histórico de MRR por cliente
-- (expansão/contração), a métrica usada é uma aproximação:
-- MRR do mês atual / MRR do mês anterior × 100. É uma proxy, não NRR real
-- (que exigiria rastrear upgrade/downgrade por cliente) — mas é a melhor
-- aproximação possível com os dados que existem hoje.
-- =============================================================================

BEGIN;

-- ------------------------------------------------------------------------
-- 1. get_mrr_by_month: MRR/ARR por mês, a partir de subscriptions ativas
--    (status='ativa' e já iniciadas até o fim de cada mês da janela).
-- ------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.get_mrr_by_month(integer);

CREATE OR REPLACE FUNCTION public.get_mrr_by_month(
  months_back integer DEFAULT 6,
  ref_month date DEFAULT CURRENT_DATE
) RETURNS TABLE(mes text, mrr numeric, arr numeric)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH meses AS (
    SELECT generate_series(
      DATE_TRUNC('month', ref_month)::date - (INTERVAL '1 month' * (months_back - 1)),
      DATE_TRUNC('month', ref_month)::date,
      INTERVAL '1 month'
    )::date AS mes_ref
  ),
  mrr_mes AS (
    SELECT m.mes_ref, COALESCE(SUM(s.valor_mensal), 0) AS total
    FROM meses m
    LEFT JOIN subscriptions s
      ON s.status = 'ativa'
      AND s.data_inicio <= (m.mes_ref + INTERVAL '1 month' - INTERVAL '1 day')::date
    GROUP BY m.mes_ref
  )
  SELECT
    TO_CHAR(mm.mes_ref, 'Mon') AS mes,
    mm.total AS mrr,
    mm.total * 12 AS arr
  FROM mrr_mes mm
  ORDER BY mm.mes_ref ASC;
END;
$function$;

-- ------------------------------------------------------------------------
-- 2. get_churn_rate: taxa de cancelamento por mês + proxy de NRR
--    (subscriptions não tem data de cancelamento própria — usa
--    data_atualizacao de assinaturas com status='cancelada' como proxy).
-- ------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.get_churn_rate(integer);

CREATE OR REPLACE FUNCTION public.get_churn_rate(
  months_back integer DEFAULT 6,
  ref_month date DEFAULT CURRENT_DATE
) RETURNS TABLE(mes text, churn_rate numeric, nrr numeric)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH meses AS (
    SELECT generate_series(
      DATE_TRUNC('month', ref_month)::date - (INTERVAL '1 month' * (months_back - 1)),
      DATE_TRUNC('month', ref_month)::date,
      INTERVAL '1 month'
    )::date AS mes_ref
  ),
  base AS (
    SELECT
      m.mes_ref,
      (SELECT COUNT(*) FROM subscriptions s
        WHERE s.data_inicio < m.mes_ref
          AND (s.status = 'ativa'
               OR (s.status = 'cancelada' AND s.data_atualizacao::date >= m.mes_ref))
      ) AS ativos_inicio,
      (SELECT COUNT(*) FROM subscriptions s
        WHERE s.status = 'cancelada'
          AND DATE_TRUNC('month', s.data_atualizacao)::date = m.mes_ref
      ) AS cancelados_no_mes,
      (SELECT COALESCE(SUM(s.valor_mensal), 0) FROM subscriptions s
        WHERE s.status = 'ativa'
          AND s.data_inicio <= (m.mes_ref + INTERVAL '1 month' - INTERVAL '1 day')::date
      ) AS mrr_mes
    FROM meses m
  ),
  com_mrr_anterior AS (
    SELECT b.*, LAG(b.mrr_mes) OVER (ORDER BY b.mes_ref) AS mrr_mes_anterior
    FROM base b
  )
  SELECT
    TO_CHAR(c.mes_ref, 'Mon') AS mes,
    CASE WHEN c.ativos_inicio > 0
      THEN ROUND((c.cancelados_no_mes::numeric / c.ativos_inicio * 100), 2)
      ELSE 0
    END AS churn_rate,
    CASE WHEN c.mrr_mes_anterior IS NOT NULL AND c.mrr_mes_anterior > 0
      THEN ROUND((c.mrr_mes / c.mrr_mes_anterior * 100), 2)
      ELSE 100
    END AS nrr
  FROM com_mrr_anterior c
  ORDER BY c.mes_ref ASC;
END;
$function$;

-- ------------------------------------------------------------------------
-- 3. get_customer_metrics: pares (metric_name, value) consumidos pelo
--    MonthDetailPanel — 'Active Customers', 'MRR Total', 'CAC', 'LTV'.
--    CAC/LTV = 0: não há dado de custo de aquisição nem retenção histórica
--    no schema atual (ver nota no cabeçalho do arquivo).
-- ------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.get_customer_metrics();

CREATE OR REPLACE FUNCTION public.get_customer_metrics(
  ref_month date DEFAULT CURRENT_DATE
) RETURNS TABLE(metric_name text, value numeric)
LANGUAGE plpgsql
AS $function$
DECLARE
  fim_mes date := (DATE_TRUNC('month', ref_month) + INTERVAL '1 month' - INTERVAL '1 day')::date;
  v_active_customers numeric;
  v_mrr_total numeric;
BEGIN
  SELECT COUNT(DISTINCT s.customer_id) INTO v_active_customers
  FROM subscriptions s
  WHERE s.status = 'ativa' AND s.data_inicio <= fim_mes;

  SELECT COALESCE(SUM(s.valor_mensal), 0) INTO v_mrr_total
  FROM subscriptions s
  WHERE s.status = 'ativa' AND s.data_inicio <= fim_mes;

  RETURN QUERY VALUES
    ('Active Customers', COALESCE(v_active_customers, 0)),
    ('MRR Total', v_mrr_total),
    ('CAC', 0::numeric),
    ('LTV', 0::numeric);
END;
$function$;

-- ------------------------------------------------------------------------
-- 4. get_goal_progress_by_week: progresso_semanal já tem os dados certos
--    (meta_vendas/vendas_realizadas) — só faltava tirar o auth.uid() e usar
--    os nomes de coluna reais em vez de atingido/meta (que não existem).
-- ------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.get_goal_progress_by_week();
DROP FUNCTION IF EXISTS public.get_goal_progress_by_week(integer, date);

CREATE OR REPLACE FUNCTION public.get_goal_progress_by_week(
  weeks_back integer DEFAULT 4,
  ref_month date DEFAULT CURRENT_DATE
) RETURNS TABLE(semana text, atingido numeric, meta numeric)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    'Sem ' || ROW_NUMBER() OVER (ORDER BY p.semana DESC)::TEXT AS semana,
    p.vendas_realizadas AS atingido,
    p.meta_vendas AS meta
  FROM progresso_semanal p
  WHERE p.semana >= DATE_TRUNC('month', ref_month)::DATE
    AND p.semana < DATE_TRUNC('month', ref_month)::DATE + INTERVAL '1 month'
  ORDER BY p.semana DESC
  LIMIT weeks_back;
END;
$function$;

-- ------------------------------------------------------------------------
-- 5. get_attendance_by_day: recebidos/resolvidos/pendentes por dia, a
--    partir de tickets (data_criacao/data_fechamento/status), últimos
--    `days_back` dias do mês de referência.
-- ------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.get_attendance_by_day();
DROP FUNCTION IF EXISTS public.get_attendance_by_day(integer, date);

CREATE OR REPLACE FUNCTION public.get_attendance_by_day(
  days_back integer DEFAULT 5,
  ref_month date DEFAULT CURRENT_DATE
) RETURNS TABLE(dia text, recebidos numeric, resolvidos numeric, pendentes numeric)
LANGUAGE plpgsql
AS $function$
DECLARE
  dia_fim date := LEAST(
    CURRENT_DATE,
    (DATE_TRUNC('month', ref_month) + INTERVAL '1 month' - INTERVAL '1 day')::date
  );
  dia_ini date := dia_fim - (days_back - 1);
BEGIN
  RETURN QUERY
  WITH dias AS (
    SELECT generate_series(dia_ini, dia_fim, INTERVAL '1 day')::date AS dia_ref
  )
  SELECT
    TO_CHAR(d.dia_ref, 'DD/Mon') AS dia,
    COALESCE((SELECT COUNT(*) FROM tickets t WHERE t.data_criacao::date = d.dia_ref), 0)::numeric AS recebidos,
    COALESCE((SELECT COUNT(*) FROM tickets t WHERE t.data_fechamento::date = d.dia_ref), 0)::numeric AS resolvidos,
    COALESCE((SELECT COUNT(*) FROM tickets t
      WHERE t.data_criacao::date <= d.dia_ref
        AND (t.data_fechamento IS NULL OR t.data_fechamento::date > d.dia_ref)
    ), 0)::numeric AS pendentes
  FROM dias d
  ORDER BY d.dia_ref ASC;
END;
$function$;

-- ------------------------------------------------------------------------
-- 6. get_satisfaction_by_week: NPS + satisfação média por semana, a partir
--    de satisfacao.score (1-10). satisfacao real não tem `semana`/`nps`
--    próprios — calculados aqui a partir de data_pesquisa/score.
-- ------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.get_satisfaction_by_week();
DROP FUNCTION IF EXISTS public.get_satisfaction_by_week(integer, date);

CREATE OR REPLACE FUNCTION public.get_satisfaction_by_week(
  weeks_back integer DEFAULT 4,
  ref_month date DEFAULT CURRENT_DATE
) RETURNS TABLE(semana text, nps numeric, satisfacao numeric)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH por_semana AS (
    SELECT
      DATE_TRUNC('week', s.data_pesquisa)::date AS semana_ref,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE s.score >= 9) AS promotores,
      COUNT(*) FILTER (WHERE s.score <= 6) AS detratores,
      AVG(s.score) AS media_score
    FROM satisfacao s
    WHERE s.data_pesquisa >= DATE_TRUNC('month', ref_month)::DATE
      AND s.data_pesquisa < DATE_TRUNC('month', ref_month)::DATE + INTERVAL '1 month'
    GROUP BY 1
  )
  SELECT
    'Sem ' || ROW_NUMBER() OVER (ORDER BY ps.semana_ref DESC)::TEXT AS semana,
    CASE WHEN ps.total > 0
      THEN ROUND(((ps.promotores - ps.detratores)::numeric / ps.total * 100), 2)
      ELSE 0
    END AS nps,
    ROUND(COALESCE(ps.media_score, 0) * 10, 2) AS satisfacao
  FROM por_semana ps
  ORDER BY ps.semana_ref DESC
  LIMIT weeks_back;
END;
$function$;

-- ------------------------------------------------------------------------
-- 7. get_contacts_by_month: novos leads (criados no mês) e leads ativos
--    (pipeline aberto até o fim do mês, etapa fora de Ganho/Perdido).
--    Schema real de contatos confirmado via \d na VPS.
-- ------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.get_contacts_by_month(integer);
DROP FUNCTION IF EXISTS public.get_contacts_by_month(integer, date);

CREATE OR REPLACE FUNCTION public.get_contacts_by_month(
  months_back integer DEFAULT 6,
  ref_month date DEFAULT CURRENT_DATE
) RETURNS TABLE(mes text, novos numeric, ativos numeric)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH meses AS (
    SELECT generate_series(
      DATE_TRUNC('month', ref_month)::date - (INTERVAL '1 month' * (months_back - 1)),
      DATE_TRUNC('month', ref_month)::date,
      INTERVAL '1 month'
    )::date AS mes_ref
  )
  SELECT
    TO_CHAR(m.mes_ref, 'Mon') AS mes,
    COALESCE((SELECT COUNT(*) FROM contatos c
      WHERE DATE_TRUNC('month', c.created_at)::date = m.mes_ref
    ), 0)::numeric AS novos,
    COALESCE((SELECT COUNT(*) FROM contatos c
      WHERE c.etapa NOT IN ('Ganho', 'Perdido')
        AND c.created_at::date <= (m.mes_ref + INTERVAL '1 month' - INTERVAL '1 day')::date
    ), 0)::numeric AS ativos
  FROM meses m
  ORDER BY m.mes_ref ASC;
END;
$function$;

-- ------------------------------------------------------------------------
-- 8. get_opportunities_by_stage: distribuição do pipeline por etapa entre
--    os leads criados no mês de referência.
-- ------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.get_opportunities_by_stage();
DROP FUNCTION IF EXISTS public.get_opportunities_by_stage(date);

CREATE OR REPLACE FUNCTION public.get_opportunities_by_stage(
  ref_month date DEFAULT CURRENT_DATE
) RETURNS TABLE(estagio text, quantidade numeric)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT c.etapa AS estagio, COUNT(*)::numeric AS quantidade
  FROM contatos c
  WHERE DATE_TRUNC('month', c.created_at)::date = DATE_TRUNC('month', ref_month)::date
  GROUP BY c.etapa
  ORDER BY COUNT(*) DESC;
END;
$function$;

-- ------------------------------------------------------------------------
-- 9. get_sales_funnel: sem uso hoje no frontend (useFunnelData não é
--    importado em nenhuma página) — corrigida por consistência/futuro, mas
--    não é uma correção de bug ativo.
-- ------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_sales_funnel()
RETURNS TABLE(estagio text, quantidade numeric, conversao numeric)
LANGUAGE plpgsql
AS $function$
DECLARE
  total_topo numeric;
BEGIN
  SELECT COUNT(*) INTO total_topo FROM contatos;

  RETURN QUERY
  SELECT
    c.etapa AS estagio,
    COUNT(*)::numeric AS quantidade,
    CASE WHEN total_topo > 0
      THEN ROUND((COUNT(*)::numeric / total_topo * 100), 2)
      ELSE 0
    END AS conversao
  FROM contatos c
  GROUP BY c.etapa
  ORDER BY COUNT(*) DESC;
END;
$function$;

COMMIT;
