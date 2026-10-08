-- ============================================================================
-- RAVO OS — Schema Software House (multi-stream)
-- ============================================================================
-- Modela as 4 fontes de receita da RAVO simultaneamente:
--   retainer  → contrato recorrente mensal (tráfego, automação, sustentação)
--   projeto   → escopo fechado com preço e prazo definidos
--   hora      → alocação faturada por hora trabalhada
--   licenca   → assinatura de produto próprio (RAVO Juris etc.)
--
-- Decisão central: a receita NÃO vive numa tabela genérica. Cada real entra
-- por um `contrato`, que carrega seu tipo. É isso que permite responder a
-- pergunta que decide o caixa de uma software house: quanto da minha receita
-- é previsível e quanto eu preciso vender de novo todo mês.
--
-- Idempotente: pode ser reaplicado sem perda de dados.
-- Aplicar com:
--   psql -U ravo_user -d ravo_db -h localhost -f schema_softwarehouse.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. PESSOAS — time interno, base do custo direto e da utilização
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pessoas (
  id                BIGSERIAL PRIMARY KEY,
  nome              TEXT NOT NULL,
  papel             TEXT,                        -- dev, tráfego, designer, SDR...
  custo_hora        NUMERIC(10,2) NOT NULL DEFAULT 0,  -- custo real p/ empresa
  rate_hora         NUMERIC(10,2) NOT NULL DEFAULT 0,  -- valor de venda alvo
  horas_semana      NUMERIC(5,2)  NOT NULL DEFAULT 40, -- capacidade contratada
  ativo             BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. CLIENTES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.clientes (
  id                BIGSERIAL PRIMARY KEY,
  nome              TEXT NOT NULL,
  segmento          TEXT,                        -- advocacia, saúde, varejo...
  origem            TEXT,                        -- indicação, ads, outbound...
  status            TEXT NOT NULL DEFAULT 'ativo'
                    CHECK (status IN ('ativo','inativo','churn')),
  cliente_desde     DATE,
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. CONTRATOS — a espinha dorsal do modelo de receita
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.contratos (
  id                BIGSERIAL PRIMARY KEY,
  cliente_id        BIGINT NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  nome              TEXT NOT NULL,
  tipo              TEXT NOT NULL
                    CHECK (tipo IN ('retainer','projeto','hora','licenca')),

  -- Retainer e licença: valor cobrado por mês.
  valor_mensal      NUMERIC(14,2),
  -- Projeto: valor total fechado do escopo.
  valor_total       NUMERIC(14,2),
  -- Hora: valor cobrado por hora apontada.
  valor_hora        NUMERIC(10,2),

  data_inicio       DATE NOT NULL,
  data_fim          DATE,                        -- NULL = vigente/indeterminado
  status            TEXT NOT NULL DEFAULT 'ativo'
                    CHECK (status IN ('ativo','concluido','cancelado','pausado')),
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Garante que cada tipo de contrato carrega o campo de preço que lhe cabe.
  CONSTRAINT contrato_precificacao_coerente CHECK (
    (tipo IN ('retainer','licenca') AND valor_mensal IS NOT NULL) OR
    (tipo = 'projeto' AND valor_total IS NOT NULL) OR
    (tipo = 'hora'    AND valor_hora  IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_contratos_cliente ON public.contratos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_contratos_tipo    ON public.contratos(tipo, status);

-- ============================================================================
-- 4. PROJETOS — unidade de entrega; onde a margem é ganha ou perdida
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.projetos (
  id                BIGSERIAL PRIMARY KEY,
  contrato_id       BIGINT NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
  nome              TEXT NOT NULL,
  horas_estimadas   NUMERIC(10,2) NOT NULL DEFAULT 0,  -- base do desvio de escopo
  data_inicio       DATE,
  data_prevista     DATE,
  data_entrega      DATE,
  status            TEXT NOT NULL DEFAULT 'em_andamento'
                    CHECK (status IN ('planejado','em_andamento','entregue','cancelado')),
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projetos_contrato ON public.projetos(contrato_id);

-- ============================================================================
-- 5. APONTAMENTOS — horas trabalhadas; origem do custo direto e da utilização
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.apontamentos (
  id                BIGSERIAL PRIMARY KEY,
  pessoa_id         BIGINT NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  projeto_id        BIGINT REFERENCES public.projetos(id) ON DELETE SET NULL,
  contrato_id       BIGINT REFERENCES public.contratos(id) ON DELETE SET NULL,
  data              DATE NOT NULL,
  horas             NUMERIC(6,2) NOT NULL CHECK (horas > 0),
  -- Distingue hora que vira receita de hora que vira custo puro
  -- (interno, retrabalho, pré-venda). É o numerador da taxa de utilização.
  faturavel         BOOLEAN NOT NULL DEFAULT TRUE,
  descricao         TEXT,
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apont_data    ON public.apontamentos(data);
CREATE INDEX IF NOT EXISTS idx_apont_projeto ON public.apontamentos(projeto_id);
CREATE INDEX IF NOT EXISTS idx_apont_pessoa  ON public.apontamentos(pessoa_id, data);

-- ============================================================================
-- 6. FATURAS — receita reconhecida
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.faturas (
  id                BIGSERIAL PRIMARY KEY,
  contrato_id       BIGINT NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
  competencia       DATE NOT NULL,               -- mês de referência da receita
  valor             NUMERIC(14,2) NOT NULL,
  status            TEXT NOT NULL DEFAULT 'emitida'
                    CHECK (status IN ('prevista','emitida','paga','inadimplente','cancelada')),
  data_pagamento    DATE,
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faturas_comp     ON public.faturas(competencia);
CREATE INDEX IF NOT EXISTS idx_faturas_contrato ON public.faturas(contrato_id);

-- ============================================================================
-- 7. DESPESAS OPERACIONAIS — custo que não é hora de gente alocada
-- ============================================================================
-- Nome `despesas_operacionais`, não `despesas`: o schema antigo (schema.sql,
-- ainda em uso por Financeiro/Metas/CS) já tem uma tabela `despesas` própria
-- (colunas diferentes: user_id, mes em vez de competencia). CREATE TABLE IF
-- NOT EXISTS teria pulado a criação desta e deixado a antiga no lugar —
-- quebrando todas as RPCs que esperam a coluna `competencia`.
CREATE TABLE IF NOT EXISTS public.despesas_operacionais (
  id                BIGSERIAL PRIMARY KEY,
  descricao         TEXT NOT NULL,
  categoria         TEXT,                        -- infra, mídia, ferramentas...
  valor             NUMERIC(14,2) NOT NULL,
  competencia       DATE NOT NULL,
  recorrente        BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_despesas_operacionais_comp ON public.despesas_operacionais(competencia);

-- ============================================================================
-- 8. OPORTUNIDADES — pipeline comercial
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.oportunidades (
  id                BIGSERIAL PRIMARY KEY,
  cliente_id        BIGINT REFERENCES public.clientes(id) ON DELETE SET NULL,
  nome              TEXT NOT NULL,
  tipo_receita      TEXT CHECK (tipo_receita IN ('retainer','projeto','hora','licenca')),
  valor_estimado    NUMERIC(14,2) NOT NULL DEFAULT 0,
  estagio           TEXT NOT NULL DEFAULT 'qualificacao'
                    CHECK (estagio IN ('qualificacao','diagnostico','proposta','negociacao','ganho','perdido')),
  probabilidade     NUMERIC(5,2) NOT NULL DEFAULT 0,   -- 0..100, base do pipeline ponderado
  data_abertura     DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fechamento   DATE,
  motivo_perda      TEXT,
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_oport_estagio ON public.oportunidades(estagio);

-- ============================================================================
-- 9. CONFIG — parâmetros do negócio usados nos cálculos
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.config (
  chave             TEXT PRIMARY KEY,
  valor             NUMERIC(14,2) NOT NULL,
  descricao         TEXT
);

INSERT INTO public.config (chave, valor, descricao) VALUES
  ('saldo_caixa',        0,  'Saldo de caixa atual, usado no cálculo de runway'),
  ('meta_utilizacao',   75,  'Taxa de utilização faturável alvo (%)'),
  ('meta_margem_bruta', 60,  'Margem bruta alvo (%)')
ON CONFLICT (chave) DO NOTHING;

COMMIT;
