-- =============================================================================
-- RAVO OS — Migration: corrige RPCs duplicadas/quebradas da página Financeiro
-- =============================================================================
-- Diagnóstico (visto ao vivo na página /finance depois que o login passou a
-- funcionar de verdade e a página conseguiu carregar):
--
-- 1) get_revenue_by_month e get_expenses_by_category existem em DUAS versões
--    cada (uma antiga, sem ref_month; uma nova, com ref_month). O Postgres não
--    consegue decidir qual usar quando o frontend chama passando só os
--    argumentos nomeados que tem — erro "Could not choose the best candidate
--    function". O frontend (usePagesQueries.ts) só usa a versão NOVA (com
--    ref_month) — a antiga é resíduo do schema anterior e pode sair.
--
-- 2) get_cash_flow_by_week (a versão nova, com ref_month) filtra por
--    `f.user_id = auth.uid()` — função do schema `auth` do Supabase Cloud,
--    que não existe no Postgres self-hosted. Como o RAVO OS roda single-tenant
--    (um `db-anon-role` só, sem RLS por usuário — ver nota de segurança em
--    APLICAR.md), essa filtragem por usuário não faz sentido aqui: remove.
--
-- Todas testadas localmente (Postgres 16 descartável) antes de aplicar.
-- =============================================================================

BEGIN;

-- ------------------------------------------------------------------------
-- 1. Remove as versões antigas (sem ref_month) — duplicadas/não usadas
-- ------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.get_revenue_by_month(integer);
DROP FUNCTION IF EXISTS public.get_expenses_by_category();
DROP FUNCTION IF EXISTS public.get_cash_flow_by_week();

-- ------------------------------------------------------------------------
-- 2. Recria get_cash_flow_by_week sem o auth.uid() (single-tenant)
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
    'Sem ' || ROW_NUMBER() OVER (ORDER BY f.semana DESC)::TEXT as semana,
    f.entradas,
    f.saidas
  FROM fluxo_caixa f
  WHERE f.semana >= DATE_TRUNC('month', ref_month)::DATE
    AND f.semana < DATE_TRUNC('month', ref_month)::DATE + INTERVAL '1 month'
  ORDER BY f.semana DESC
  LIMIT weeks_back;
END;
$function$;

COMMIT;
