-- ============================================================================
-- RAVO OS — Atividades / Follow-up do CRM (nível Pipedrive)
-- ============================================================================
-- Adiciona a tabela `atividades`, que dá ao lead uma linha do tempo real:
-- notas, ligações, e-mails, reuniões e tarefas com data prevista. É a base
-- da ficha do lead (drawer de detalhe) e do indicador de "próximo follow-up"
-- nos cards do board/lista.
--
-- Idempotente: pode ser reaplicado sem perda de dados.
-- Aplicar com:
--   psql -U ravo_user -d ravo_db -h localhost -f migration_atividades.sql
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.atividades (
  id            BIGSERIAL PRIMARY KEY,
  contato_id    BIGINT NOT NULL REFERENCES public.contatos(id) ON DELETE CASCADE,
  tipo          TEXT NOT NULL DEFAULT 'nota'
                CHECK (tipo IN ('nota', 'ligacao', 'email', 'reuniao', 'tarefa')),
  descricao     TEXT NOT NULL,
  -- Data prevista de execução — só faz sentido para tarefas/ligações/reuniões
  -- futuras. Uma nota é só um registro no passado e fica NULL aqui.
  data_prevista DATE,
  concluida     BOOLEAN NOT NULL DEFAULT FALSE,
  concluida_em  TIMESTAMPTZ,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_atividades_contato ON public.atividades(contato_id, criado_em DESC);

-- Índice parcial: cobre exatamente a query do badge de follow-up no board
-- (pendências em aberto, ordenadas por data prevista) sem varrer concluídas.
CREATE INDEX IF NOT EXISTS idx_atividades_pendentes
  ON public.atividades(contato_id, data_prevista)
  WHERE concluida = FALSE;

-- Reaplicação idempotente para bancos que já tinham a tabela antes desta versão.
ALTER TABLE public.atividades ADD COLUMN IF NOT EXISTS concluida_em TIMESTAMPTZ;

COMMIT;
