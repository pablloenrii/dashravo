-- =============================================================================
-- RAVO OS — Migration: corrige de vez as RPCs da página Financeiro (v2)
-- =============================================================================
-- A migration_fix_finance_rpcs.sql anterior só removeu as versões duplicadas
-- (ambiguidade) e tirou o auth.uid() de get_cash_flow_by_week — mas não
-- reparou get_revenue_by_month e get_expenses_by_category, que também tinham
-- auth.uid() E referenciavam colunas que não existem mais (`r.mes`, `d.mes`,
-- `f.semana`): resíduo de um schema anterior, onde receitas/despesas/
-- fluxo_caixa tinham colunas diferentes das de hoje.
--
-- Schema real (confirmado via \d na VPS):
--   receitas:     id, user_id, descricao, valor, tipo, data_receita, status
--   despesas:     id, user_id, descricao, valor, categoria, data_despesa, status
--   fluxo_caixa:  id, user_id, data, saldo_inicial, entradas, saidas, saldo_final
--
-- As três funções abaixo foram reescritas contra esse schema real e testadas
-- num Postgres local descartável (dados de exemplo) antes de aplicar aqui.
-- =============================================================================

BEGIN;

-- ------------------------------------------------------------------------
-- get_revenue_by_month: agrega receitas.valor e despesas.valor por mês
-- (data_receita/data_despesa), últimos `months_back` meses até `ref_month`.
-- ------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_revenue_by_month(
  months_back integer DEFAULT 6,
  ref_month date DEFAULT CURRENT_DATE
) RETURNS TABLE(mes text, receita numeric, despesa numeric, lucro numeric)
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
  rec AS (
    SELECT DATE_TRUNC('month', r.data_receita)::date AS mes_ref, SUM(r.valor) AS total
    FROM receitas r
    GROUP BY 1
  ),
  desp AS (
    SELECT DATE_TRUNC('month', d.data_despesa)::date AS mes_ref, SUM(d.valor) AS total
    FROM despesas d
    GROUP BY 1
  )
  SELECT
    TO_CHAR(m.mes_ref, 'Mon') AS mes,
    COALESCE(rec.total, 0) AS receita,
    COALESCE(desp.total, 0) AS despesa,
    COALESCE(rec.total, 0) - COALESCE(desp.total, 0) AS lucro
  FROM meses m
  LEFT JOIN rec ON rec.mes_ref = m.mes_ref
  LEFT JOIN desp ON desp.mes_ref = m.mes_ref
  ORDER BY m.mes_ref ASC;
END;
$function$;

-- ------------------------------------------------------------------------
-- get_expenses_by_category: despesas do mês (data_despesa), agrupadas por
-- categoria, com percentual sobre o total do mês.
-- ------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_expenses_by_category(
  ref_month date DEFAULT CURRENT_DATE
) RETURNS TABLE(categoria character varying, valor numeric, percentual numeric)
LANGUAGE plpgsql
AS $function$
DECLARE
  total_despesas DECIMAL;
  inicio DATE;
  fim DATE;
BEGIN
  inicio := DATE_TRUNC('month', ref_month)::DATE;
  fim := (DATE_TRUNC('month', ref_month) + INTERVAL '1 month')::DATE;

  SELECT SUM(d.valor) INTO total_despesas
  FROM despesas d
  WHERE d.data_despesa >= inicio AND d.data_despesa < fim;

  RETURN QUERY
  SELECT
    d.categoria::character varying,
    SUM(d.valor) as valor,
    CASE WHEN total_despesas > 0
      THEN ROUND((SUM(d.valor) / total_despesas * 100)::NUMERIC, 2)
      ELSE 0
    END as percentual
  FROM despesas d
  WHERE d.data_despesa >= inicio AND d.data_despesa < fim
  GROUP BY d.categoria
  ORDER BY SUM(d.valor) DESC;
END;
$function$;

-- ------------------------------------------------------------------------
-- get_cash_flow_by_week: a v1 desta migration trocou auth.uid() mas manteve
-- `f.semana`, que não existe em fluxo_caixa (a coluna é `data`) — corrige.
-- ------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_cash_flow_by_week(
  weeks_back integer DEFAULT 4,
  ref_month date DEFAULT CURRENT_DATE
) RETURNS TABLE(semana text, entradas numeric, saidas numeric)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    'Sem ' || ROW_NUMBER() OVER (ORDER BY f.data DESC)::TEXT as semana,
    f.entradas,
    f.saidas
  FROM fluxo_caixa f
  WHERE f.data >= DATE_TRUNC('month', ref_month)::DATE
    AND f.data < DATE_TRUNC('month', ref_month)::DATE + INTERVAL '1 month'
  ORDER BY f.data DESC
  LIMIT weeks_back;
END;
$function$;

COMMIT;
