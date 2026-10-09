-- ============================================================================
-- 20_dre.sql — DRE completa (Simples Nacional)
--
-- Cascata (mesma do modelo G4 "Fundamentos em Finanças"):
--   Faturamento bruto
--   (−) Cancelamentos                 faturas com status 'cancelada'
--   (−) Impostos s/ faturamento       alíquota do Simples × (bruto − cancelamentos)
--   = Faturamento líquido
--   (−) Custo de entrega              horas apontadas × custo/hora + despesas classe 'custo'
--   = Lucro bruto
--   (−) Despesas variáveis            classe 'variavel' (comissão, mídia, taxas)
--   = Margem de contribuição
--   (−) Despesas fixas                classe 'fixa'
--   = EBITDA
--   (−) Despesas financeiras e depreciação
--   = LAIR
--   (−) Impostos s/ lucro             0 no Simples (IRPJ/CSLL já estão no DAS)
--   = Lucro líquido
--
-- Percentuais usam o faturamento líquido como base e ficam NULL quando ele é 0.
-- ============================================================================

-- 1. Classe da despesa ------------------------------------------------------
ALTER TABLE public.despesas_operacionais ADD COLUMN IF NOT EXISTS classe TEXT;

-- Classificação inicial por palavra-chave da categoria; o que não casar vira 'fixa'.
-- Só toca linhas ainda sem classe, então reaplicar a migração não desfaz edições.
UPDATE public.despesas_operacionais SET classe = CASE
  WHEN categoria ~* '(juro|tarifa banc|financ|iof)'                                   THEN 'financeira'
  WHEN categoria ~* '(deprecia|amortiza)'                                             THEN 'depreciacao'
  WHEN categoria ~* '(freela|terceiriz|entrega|produ[çc][ãa]o|operaç)'               THEN 'custo'
  WHEN categoria ~* '(marketing|m[ií]dia|an[úu]ncio|tr[áa]fego|comiss|vendas|taxa)'  THEN 'variavel'
  ELSE 'fixa' END
WHERE classe IS NULL;

ALTER TABLE public.despesas_operacionais ALTER COLUMN classe SET DEFAULT 'fixa';
ALTER TABLE public.despesas_operacionais ALTER COLUMN classe SET NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'despesas_classe_chk') THEN
    ALTER TABLE public.despesas_operacionais ADD CONSTRAINT despesas_classe_chk
      CHECK (classe IN ('custo','variavel','fixa','financeira','depreciacao'));
  END IF;
END $$;

-- 2. Alíquota do Simples (% sobre o faturamento) ----------------------------
INSERT INTO public.config (chave, valor, descricao) VALUES
  ('aliquota_simples', 6, 'Alíquota efetiva do Simples Nacional sobre o faturamento (%)')
ON CONFLICT (chave) DO NOTHING;

-- 3. DRE mensal -------------------------------------------------------------
DROP FUNCTION IF EXISTS public.rpc_dre(INT, DATE);
CREATE FUNCTION public.rpc_dre(months_back INT DEFAULT 6, ref_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  mes                       DATE,
  faturamento_bruto         NUMERIC,
  cancelamentos             NUMERIC,
  impostos_faturamento      NUMERIC,
  faturamento_liquido       NUMERIC,
  custo_horas               NUMERIC,
  custo_lancado             NUMERIC,
  custo_entrega             NUMERIC,
  lucro_bruto               NUMERIC,
  margem_bruta_pct          NUMERIC,
  despesas_variaveis        NUMERIC,
  margem_contribuicao       NUMERIC,
  margem_contribuicao_pct   NUMERIC,
  despesas_fixas            NUMERIC,
  ebitda                    NUMERIC,
  ebitda_pct                NUMERIC,
  despesas_financeiras      NUMERIC,
  depreciacao               NUMERIC,
  lair                      NUMERIC,
  impostos_lucro            NUMERIC,
  lucro_liquido             NUMERIC,
  lucro_liquido_pct         NUMERIC
)
LANGUAGE sql STABLE AS $$
  WITH cfg AS (
    SELECT COALESCE((SELECT c.valor FROM public.config c WHERE c.chave = 'aliquota_simples'), 6) / 100.0 AS aliq
  ),
  meses AS (
    SELECT (date_trunc('month', ref_month) - make_interval(months => n))::date AS m
    FROM generate_series(GREATEST(months_back, 1) - 1, 0, -1) AS n
  ),
  fat AS (
    SELECT date_trunc('month', f.competencia)::date AS m,
           SUM(f.valor)                                      AS bruto,
           SUM(f.valor) FILTER (WHERE f.status = 'cancelada') AS cancel
    FROM public.faturas f GROUP BY 1
  ),
  des AS (
    SELECT date_trunc('month', d.competencia)::date AS m,
           SUM(d.valor) FILTER (WHERE d.classe = 'custo')       AS custo,
           SUM(d.valor) FILTER (WHERE d.classe = 'variavel')    AS variavel,
           SUM(d.valor) FILTER (WHERE d.classe = 'fixa')        AS fixa,
           SUM(d.valor) FILTER (WHERE d.classe = 'financeira')  AS financeira,
           SUM(d.valor) FILTER (WHERE d.classe = 'depreciacao') AS deprec
    FROM public.despesas_operacionais d GROUP BY 1
  ),
  base AS (
    SELECT me.m,
      COALESCE(f.bruto, 0)  AS bruto,
      COALESCE(f.cancel, 0) AS cancel,
      ROUND((COALESCE(f.bruto, 0) - COALESCE(f.cancel, 0)) * (SELECT aliq FROM cfg), 2) AS imposto,
      public.fn_custo_direto(me.m)  AS horas,
      COALESCE(d.custo, 0)      AS custo,
      COALESCE(d.variavel, 0)   AS variavel,
      COALESCE(d.fixa, 0)       AS fixa,
      COALESCE(d.financeira, 0) AS financeira,
      COALESCE(d.deprec, 0)     AS deprec
    FROM meses me
    LEFT JOIN fat f ON f.m = me.m
    LEFT JOIN des d ON d.m = me.m
  ),
  c1 AS (
    SELECT b.*,
      b.bruto - b.cancel - b.imposto AS liquido,
      b.horas + b.custo              AS custo_total
    FROM base b
  ),
  c2 AS (
    SELECT c1.*,
      liquido - custo_total                   AS lucro_bruto,
      liquido - custo_total - variavel        AS mc,
      liquido - custo_total - variavel - fixa AS ebitda
    FROM c1
  )
  SELECT
    c2.m, c2.bruto, c2.cancel, c2.imposto, c2.liquido,
    ROUND(c2.horas, 2), c2.custo, ROUND(c2.custo_total, 2),
    ROUND(c2.lucro_bruto, 2),
    CASE WHEN c2.liquido > 0 THEN ROUND(c2.lucro_bruto / c2.liquido * 100, 1) END,
    c2.variavel,
    ROUND(c2.mc, 2),
    CASE WHEN c2.liquido > 0 THEN ROUND(c2.mc / c2.liquido * 100, 1) END,
    c2.fixa,
    ROUND(c2.ebitda, 2),
    CASE WHEN c2.liquido > 0 THEN ROUND(c2.ebitda / c2.liquido * 100, 1) END,
    c2.financeira, c2.deprec,
    ROUND(c2.ebitda - c2.financeira - c2.deprec, 2),
    0::numeric,
    ROUND(c2.ebitda - c2.financeira - c2.deprec, 2),
    CASE WHEN c2.liquido > 0 THEN ROUND((c2.ebitda - c2.financeira - c2.deprec) / c2.liquido * 100, 1) END
  FROM c2
  ORDER BY c2.m;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_dre(INT, DATE) TO ravo_user;
