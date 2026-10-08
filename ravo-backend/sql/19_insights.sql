-- =============================================================================
-- RAVO CRM — Insights de receita recorrente (MRR/ARR/churn/NRR/LTV/CAC),
-- cancelamento de contratos, observações no lead e histórico de etapas.
-- Idempotente.
--
-- Definições (padrão SaaS/serviços recorrentes):
--  * Recorrente = contratos tipo retainer/licenca (valor_mensal).
--  * Um contrato conta no MRR de um mês se estava vigente no ÚLTIMO DIA do mês
--    (data_inicio <= fim do mês E sem data de término ou término depois do fim do mês).
--  * Término = data_cancelamento (cancelado) | data_fim (concluído/vencido).
--  * Novo = cliente sem MRR no mês anterior; Churn = cliente que zerou o MRR;
--    Expansão/Contração = variação de MRR de quem permaneceu.
--  * NRR = (MRR_ini + expansão - contração - churn) / MRR_ini
--    GRR = (MRR_ini - contração - churn) / MRR_ini
--  * LTV  = ARPA x margem bruta / churn mensal de logos (média móvel de 6 meses)
--    CAC  = custo comercial (despesas de marketing/mídia/comercial/vendas/tráfego,
--           3 meses) / clientes novos (3 meses)
--    margem bruta = config 'meta_margem_bruta' (padrão 60%).
-- =============================================================================
BEGIN;

ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS data_cancelamento   DATE;
ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS motivo_cancelamento TEXT;
ALTER TABLE public.contatos  ADD COLUMN IF NOT EXISTS observacoes         TEXT;

-- -----------------------------------------------------------------------------
-- Histórico de etapas do lead (permite medir ciclo de venda e tempo por etapa)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contatos_historico (
  id             BIGSERIAL PRIMARY KEY,
  contato_id     BIGINT NOT NULL REFERENCES public.contatos(id) ON DELETE CASCADE,
  etapa_anterior TEXT,
  etapa_nova     TEXT NOT NULL,
  em             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contatos_hist_contato ON public.contatos_historico(contato_id, em);

CREATE OR REPLACE FUNCTION public.fn_contatos_historico() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.contatos_historico (contato_id, etapa_anterior, etapa_nova, em)
    VALUES (NEW.id, NULL, NEW.etapa, COALESCE(NEW.created_at, NOW()));
  ELSIF NEW.etapa IS DISTINCT FROM OLD.etapa THEN
    INSERT INTO public.contatos_historico (contato_id, etapa_anterior, etapa_nova)
    VALUES (NEW.id, OLD.etapa, NEW.etapa);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_contatos_historico ON public.contatos;
CREATE TRIGGER trg_contatos_historico
  AFTER INSERT OR UPDATE OF etapa ON public.contatos
  FOR EACH ROW EXECUTE FUNCTION public.fn_contatos_historico();

-- Leads que já existiam ganham a linha inicial (uma vez)
INSERT INTO public.contatos_historico (contato_id, etapa_anterior, etapa_nova, em)
SELECT c.id, NULL, c.etapa, COALESCE(c.created_at, NOW())
FROM public.contatos c
WHERE NOT EXISTS (SELECT 1 FROM public.contatos_historico h WHERE h.contato_id = c.id);

-- -----------------------------------------------------------------------------
-- Data em que o contrato deixou de valer (NULL = vigente)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_contrato_fim(c public.contratos) RETURNS DATE
LANGUAGE sql STABLE AS $$
  SELECT CASE c.status
    WHEN 'cancelado' THEN COALESCE(c.data_cancelamento, c.data_fim, c.criado_em::date)
    WHEN 'concluido' THEN COALESCE(c.data_fim, c.criado_em::date)
    ELSE c.data_fim
  END
$$;

-- -----------------------------------------------------------------------------
-- Painel mensal de receita recorrente
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.rpc_insights_mrr(INT, DATE);
CREATE FUNCTION public.rpc_insights_mrr(months_back INT DEFAULT 12, ref_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  mes                  TEXT,
  mrr                  NUMERIC,
  arr                  NUMERIC,
  novos_mrr            NUMERIC,
  expansao_mrr         NUMERIC,
  contracao_mrr        NUMERIC,
  churn_mrr            NUMERIC,
  net_new_mrr          NUMERIC,
  clientes_ini         BIGINT,
  clientes_fim         BIGINT,
  clientes_novos       BIGINT,
  clientes_churn       BIGINT,
  logo_churn_pct       NUMERIC,
  receita_churn_pct    NUMERIC,
  grr_pct              NUMERIC,
  nrr_pct              NUMERIC,
  arpa                 NUMERIC,
  ltv                  NUMERIC,
  cac                  NUMERIC,
  ltv_cac              NUMERIC,
  payback_meses        NUMERIC,
  custo_aquisicao      NUMERIC,
  receita_total        NUMERIC,
  receita_paga         NUMERIC,
  receita_inadimplente NUMERIC,
  receita_recorrente   NUMERIC,
  receita_pontual      NUMERIC
)
LANGUAGE sql STABLE AS $$
  WITH params AS (
    SELECT COALESCE((SELECT valor FROM public.config WHERE chave = 'meta_margem_bruta'), 60) / 100.0 AS margem
  ),
  meses AS (
    SELECT g::date AS m
    FROM generate_series(
      date_trunc('month', ref_month) - make_interval(months => months_back + 6),
      date_trunc('month', ref_month),
      INTERVAL '1 month'
    ) g
  ),
  -- MRR por cliente no último dia de cada mês
  cm AS (
    SELECT me.m, ct.cliente_id, SUM(ct.valor_mensal) AS mrr
    FROM meses me
    JOIN public.contratos ct
      ON ct.tipo IN ('retainer', 'licenca')
     AND ct.valor_mensal IS NOT NULL
     AND ct.data_inicio <= (me.m + INTERVAL '1 month - 1 day')::date
     AND (public.fn_contrato_fim(ct) IS NULL
          OR public.fn_contrato_fim(ct) > (me.m + INTERVAL '1 month - 1 day')::date)
    GROUP BY me.m, ct.cliente_id
  ),
  pr AS (
    SELECT COALESCE(c.m, (p.m + INTERVAL '1 month')::date) AS m,
           COALESCE(c.cliente_id, p.cliente_id)            AS cliente_id,
           COALESCE(c.mrr, 0)                              AS cur,
           COALESCE(p.mrr, 0)                              AS prv
    FROM cm c
    FULL JOIN cm p
      ON p.cliente_id = c.cliente_id AND p.m = (c.m - INTERVAL '1 month')::date
  ),
  agg AS (
    SELECT me.m,
      COALESCE(SUM(pr.cur), 0)                                                     AS mrr,
      COALESCE(SUM(pr.prv), 0)                                                     AS mrr_ini,
      COALESCE(SUM(pr.cur) FILTER (WHERE pr.prv = 0 AND pr.cur > 0), 0)            AS novos,
      COALESCE(SUM(pr.cur - pr.prv) FILTER (WHERE pr.prv > 0 AND pr.cur > pr.prv), 0)  AS expansao,
      COALESCE(SUM(pr.prv - pr.cur) FILTER (WHERE pr.cur > 0 AND pr.cur < pr.prv), 0)  AS contracao,
      COALESCE(SUM(pr.prv) FILTER (WHERE pr.prv > 0 AND pr.cur = 0), 0)            AS churn,
      COUNT(*) FILTER (WHERE pr.cur > 0)                                           AS cli_fim,
      COUNT(*) FILTER (WHERE pr.prv > 0)                                           AS cli_ini,
      COUNT(*) FILTER (WHERE pr.prv = 0 AND pr.cur > 0)                            AS cli_novos,
      COUNT(*) FILTER (WHERE pr.prv > 0 AND pr.cur = 0)                            AS cli_churn
    FROM meses me
    LEFT JOIN pr ON pr.m = me.m
    GROUP BY me.m
  ),
  custo AS (
    SELECT date_trunc('month', d.competencia)::date AS m, SUM(d.valor) AS valor
    FROM public.despesas_operacionais d
    WHERE d.categoria ~* '(marketing|m[ií]dia|comercial|vendas|an[úu]ncio|tr[áa]fego)'
    GROUP BY 1
  ),
  fat AS (
    SELECT date_trunc('month', f.competencia)::date AS m,
      SUM(f.valor) FILTER (WHERE f.status <> 'cancelada')                                           AS total,
      SUM(f.valor) FILTER (WHERE f.status = 'paga')                                                 AS paga,
      SUM(f.valor) FILTER (WHERE f.status = 'inadimplente')                                         AS inadimplente,
      SUM(f.valor) FILTER (WHERE f.status <> 'cancelada' AND ct.tipo IN ('retainer','licenca'))     AS recorrente,
      SUM(f.valor) FILTER (WHERE f.status <> 'cancelada' AND ct.tipo NOT IN ('retainer','licenca')) AS pontual
    FROM public.faturas f
    JOIN public.contratos ct ON ct.id = f.contrato_id
    GROUP BY 1
  ),
  calc AS (
    SELECT a.*,
      COALESCE(c.valor, 0) AS custo_mes,
      SUM(a.cli_churn) OVER w6                       AS churn6,
      SUM(a.cli_ini)   OVER w6                       AS ini6,
      SUM(a.cli_novos) OVER w3                       AS novos3,
      SUM(COALESCE(c.valor, 0)) OVER w3              AS custo3
    FROM agg a
    LEFT JOIN custo c ON c.m = a.m
    WINDOW w6 AS (ORDER BY a.m ROWS BETWEEN 5 PRECEDING AND CURRENT ROW),
           w3 AS (ORDER BY a.m ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)
  )
  SELECT
    TO_CHAR(k.m, 'YYYY-MM'),
    ROUND(k.mrr, 2),
    ROUND(k.mrr * 12, 2),
    ROUND(k.novos, 2),
    ROUND(k.expansao, 2),
    ROUND(k.contracao, 2),
    ROUND(k.churn, 2),
    ROUND(k.novos + k.expansao - k.contracao - k.churn, 2),
    k.cli_ini,
    k.cli_fim,
    k.cli_novos,
    k.cli_churn,
    CASE WHEN k.cli_ini > 0 THEN ROUND(k.cli_churn::numeric / k.cli_ini * 100, 1) END,
    CASE WHEN k.mrr_ini > 0 THEN ROUND((k.churn + k.contracao) / k.mrr_ini * 100, 1) END,
    CASE WHEN k.mrr_ini > 0 THEN ROUND((k.mrr_ini - k.contracao - k.churn) / k.mrr_ini * 100, 1) END,
    CASE WHEN k.mrr_ini > 0 THEN ROUND((k.mrr_ini + k.expansao - k.contracao - k.churn) / k.mrr_ini * 100, 1) END,
    CASE WHEN k.cli_fim > 0 THEN ROUND(k.mrr / k.cli_fim, 2) END,
    -- LTV: só existe se houve churn na janela (sem churn o LTV é indefinido, não infinito)
    CASE WHEN k.cli_fim > 0 AND k.churn6 > 0 AND k.ini6 > 0
         THEN ROUND((k.mrr / k.cli_fim) * p.margem / (k.churn6::numeric / k.ini6), 2) END,
    CASE WHEN k.custo3 > 0 AND k.novos3 > 0 THEN ROUND(k.custo3 / k.novos3, 2) END,
    CASE WHEN k.custo3 > 0 AND k.novos3 > 0 AND k.cli_fim > 0 AND k.churn6 > 0 AND k.ini6 > 0
         THEN ROUND(((k.mrr / k.cli_fim) * p.margem / (k.churn6::numeric / k.ini6))
                    / (k.custo3 / k.novos3), 1) END,
    CASE WHEN k.custo3 > 0 AND k.novos3 > 0 AND k.cli_fim > 0 AND k.mrr > 0
         THEN ROUND((k.custo3 / k.novos3) / ((k.mrr / k.cli_fim) * p.margem), 1) END,
    ROUND(k.custo_mes, 2),
    ROUND(COALESCE(ft.total, 0), 2),
    ROUND(COALESCE(ft.paga, 0), 2),
    ROUND(COALESCE(ft.inadimplente, 0), 2),
    ROUND(COALESCE(ft.recorrente, 0), 2),
    ROUND(COALESCE(ft.pontual, 0), 2)
  FROM calc k
  CROSS JOIN params p
  LEFT JOIN fat ft ON ft.m = k.m
  WHERE k.m >= date_trunc('month', ref_month) - make_interval(months => months_back - 1)
  ORDER BY k.m;
$$;

-- -----------------------------------------------------------------------------
-- Contratos cancelados (com MRR perdido, tempo de vida e motivo)
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.rpc_insights_cancelados(INT, DATE);
CREATE FUNCTION public.rpc_insights_cancelados(months_back INT DEFAULT 24, ref_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  contrato_id        BIGINT,
  cliente            TEXT,
  contrato           TEXT,
  tipo               TEXT,
  mrr_perdido        NUMERIC,
  data_cancelamento  DATE,
  meses_ativo        INT,
  motivo             TEXT,
  cliente_status     TEXT
)
LANGUAGE sql STABLE AS $$
  SELECT ct.id, cl.nome, ct.nome, ct.tipo,
         CASE WHEN ct.tipo IN ('retainer','licenca') THEN ct.valor_mensal END,
         public.fn_contrato_fim(ct),
         GREATEST(0, (EXTRACT(YEAR FROM age(public.fn_contrato_fim(ct), ct.data_inicio)) * 12
                    + EXTRACT(MONTH FROM age(public.fn_contrato_fim(ct), ct.data_inicio)))::INT),
         ct.motivo_cancelamento,
         cl.status
  FROM public.contratos ct
  JOIN public.clientes cl ON cl.id = ct.cliente_id
  WHERE ct.status = 'cancelado'
    AND public.fn_contrato_fim(ct) >= (date_trunc('month', ref_month) - make_interval(months => months_back - 1))::date
  ORDER BY public.fn_contrato_fim(ct) DESC, ct.id DESC;
$$;

-- -----------------------------------------------------------------------------
-- Cancelar / reativar contrato
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rpc_cancelar_contrato(
  p_contrato_id BIGINT, p_data DATE DEFAULT CURRENT_DATE, p_motivo TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql AS $$
DECLARE v_cliente BIGINT;
BEGIN
  UPDATE public.contratos
     SET status = 'cancelado', data_cancelamento = p_data, motivo_cancelamento = NULLIF(trim(p_motivo), '')
   WHERE id = p_contrato_id
   RETURNING cliente_id INTO v_cliente;
  IF v_cliente IS NULL THEN RAISE EXCEPTION 'Contrato % não encontrado', p_contrato_id; END IF;

  -- faturas ainda não pagas de meses posteriores ao cancelamento deixam de valer
  UPDATE public.faturas
     SET status = 'cancelada'
   WHERE contrato_id = p_contrato_id
     AND competencia > p_data
     AND status IN ('prevista', 'emitida');

  -- cliente sem nenhum outro contrato vigente vira churn
  UPDATE public.clientes cl SET status = 'churn'
   WHERE cl.id = v_cliente
     AND NOT EXISTS (SELECT 1 FROM public.contratos o
                      WHERE o.cliente_id = cl.id AND o.status IN ('ativo', 'pausado'));
END $$;

CREATE OR REPLACE FUNCTION public.rpc_reativar_contrato(p_contrato_id BIGINT) RETURNS VOID
LANGUAGE plpgsql AS $$
DECLARE v_cliente BIGINT;
BEGIN
  UPDATE public.contratos
     SET status = 'ativo', data_cancelamento = NULL, motivo_cancelamento = NULL
   WHERE id = p_contrato_id AND status = 'cancelado'
   RETURNING cliente_id INTO v_cliente;
  IF v_cliente IS NULL THEN RAISE EXCEPTION 'Contrato % não está cancelado', p_contrato_id; END IF;
  UPDATE public.clientes SET status = 'ativo' WHERE id = v_cliente AND status = 'churn';
END $$;

-- -----------------------------------------------------------------------------
-- Gera as faturas dos contratos recorrentes vigentes que ainda não têm fatura no mês
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rpc_gerar_faturas_mes(p_mes DATE) RETURNS INT
LANGUAGE plpgsql AS $$
DECLARE
  v_ini DATE := date_trunc('month', p_mes)::date;
  v_fim DATE := (date_trunc('month', p_mes) + INTERVAL '1 month - 1 day')::date;
  v_n   INT;
BEGIN
  INSERT INTO public.faturas (contrato_id, competencia, valor, status)
  SELECT ct.id, v_ini, ct.valor_mensal, 'emitida'
  FROM public.contratos ct
  WHERE ct.tipo IN ('retainer', 'licenca')
    AND ct.valor_mensal IS NOT NULL
    AND ct.data_inicio <= v_fim
    AND (public.fn_contrato_fim(ct) IS NULL OR public.fn_contrato_fim(ct) > v_fim)
    AND NOT EXISTS (
      SELECT 1 FROM public.faturas f
       WHERE f.contrato_id = ct.id AND f.competencia BETWEEN v_ini AND v_fim
    );
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RETURN v_n;
END $$;

COMMIT;
