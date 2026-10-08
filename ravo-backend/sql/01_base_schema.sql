-- =============================================================================
-- RAVO CRM — tabelas-base do schema real (reconstruído a partir do código do
-- frontend e das migrations migration_fix_*.sql, que citam as colunas reais).
-- Single-tenant: user_id existe nas tabelas mas é opcional e não há RLS.
-- Idempotente.
-- =============================================================================
BEGIN;

CREATE TABLE IF NOT EXISTS public.contatos (
  id                BIGSERIAL PRIMARY KEY,
  user_id           UUID,
  nome              TEXT NOT NULL,
  empresa           TEXT,
  email             TEXT,
  telefone          TEXT,
  etapa             TEXT NOT NULL DEFAULT 'Novo Lead',
  valor             NUMERIC(12,2) DEFAULT 0,
  origem            TEXT,
  motivo            TEXT,
  data_prevista     DATE,
  receita_integrada NUMERIC(12,2) DEFAULT 0,
  data_contato      TIMESTAMPTZ DEFAULT NOW(),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customers (
  id                 BIGSERIAL PRIMARY KEY,
  user_id            UUID,
  nome               TEXT NOT NULL,
  email              TEXT,
  telefone           TEXT,
  data_criacao       TIMESTAMPTZ DEFAULT NOW(),
  data_atualizacao   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                    BIGSERIAL PRIMARY KEY,
  customer_id           BIGINT REFERENCES public.customers(id) ON DELETE CASCADE,
  plano                 TEXT,
  valor_mensal          NUMERIC(12,2) DEFAULT 0,
  data_inicio           DATE,
  data_proxima_cobranca DATE,
  status                TEXT NOT NULL DEFAULT 'ativa',
  data_criacao          TIMESTAMPTZ DEFAULT NOW(),
  data_atualizacao      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tickets (
  id                BIGSERIAL PRIMARY KEY,
  customer_id       BIGINT REFERENCES public.customers(id) ON DELETE SET NULL,
  titulo            TEXT NOT NULL,
  descricao         TEXT,
  status            TEXT NOT NULL DEFAULT 'aberto',
  prioridade        TEXT,
  data_criacao      TIMESTAMPTZ DEFAULT NOW(),
  data_atualizacao  TIMESTAMPTZ DEFAULT NOW(),
  data_fechamento   TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.metas (
  id                BIGSERIAL PRIMARY KEY,
  user_id           UUID,
  titulo            TEXT NOT NULL,
  valor_alvo        NUMERIC(14,2) DEFAULT 0,
  valor_atual       NUMERIC(14,2) DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'em_andamento',
  data_inicio       DATE,
  data_fim          DATE,
  data_criacao      TIMESTAMPTZ DEFAULT NOW(),
  data_atualizacao  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.receitas (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID,
  descricao     TEXT,
  valor         NUMERIC(14,2) NOT NULL DEFAULT 0,
  tipo          TEXT,
  data_receita  DATE NOT NULL DEFAULT CURRENT_DATE,
  status        TEXT
);

CREATE TABLE IF NOT EXISTS public.despesas (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID,
  descricao     TEXT,
  valor         NUMERIC(14,2) NOT NULL DEFAULT 0,
  categoria     TEXT,
  data_despesa  DATE NOT NULL DEFAULT CURRENT_DATE,
  status        TEXT
);

CREATE TABLE IF NOT EXISTS public.fluxo_caixa (
  id             BIGSERIAL PRIMARY KEY,
  user_id        UUID,
  data           DATE NOT NULL DEFAULT CURRENT_DATE,
  saldo_inicial  NUMERIC(14,2) DEFAULT 0,
  entradas       NUMERIC(14,2) DEFAULT 0,
  saidas         NUMERIC(14,2) DEFAULT 0,
  saldo_final    NUMERIC(14,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.progresso_semanal (
  id                 BIGSERIAL PRIMARY KEY,
  user_id            UUID,
  semana             DATE NOT NULL,
  meta_vendas        NUMERIC(14,2) DEFAULT 0,
  vendas_realizadas  NUMERIC(14,2) DEFAULT 0,
  taxa_progresso     NUMERIC(7,2) DEFAULT 0,
  data_criacao       TIMESTAMPTZ DEFAULT NOW(),
  data_atualizacao   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.satisfacao (
  id                BIGSERIAL PRIMARY KEY,
  customer_id       BIGINT REFERENCES public.customers(id) ON DELETE CASCADE,
  score             INTEGER CHECK (score BETWEEN 1 AND 10),
  comentario        TEXT,
  data_pesquisa     DATE DEFAULT CURRENT_DATE,
  data_criacao      TIMESTAMPTZ DEFAULT NOW(),
  data_atualizacao  TIMESTAMPTZ DEFAULT NOW()
);

COMMIT;
