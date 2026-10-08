-- ============================================================================
-- RAVO OS — Ponte CRM → Dashboard (software house)
-- ============================================================================
-- Hoje, marcar um deal como "Ganho" no CRM grava em tabelas do schema antigo
-- (customers/subscriptions/receitas), que o Dashboard novo não lê. Esta
-- migration adiciona as duas colunas que faltam em `contatos` para que
-- "Ganho" possa criar um `contrato` de verdade no schema de software house
-- (retainer/projeto/hora/licença), e o Dashboard passe a refletir vendas
-- fechadas no CRM.
--
-- Pré-requisito: schema_softwarehouse.sql já aplicado (contratos precisa existir).
-- Idempotente: pode ser reaplicada sem perda de dados.
-- Aplicar com:
--   psql -U ravo_user -d ravo_db -h localhost -f migration_crm_bridge.sql
-- ============================================================================

BEGIN;

ALTER TABLE contatos ADD COLUMN IF NOT EXISTS tipo_receita TEXT
  CHECK (tipo_receita IN ('retainer', 'projeto', 'hora', 'licenca'));

ALTER TABLE contatos ADD COLUMN IF NOT EXISTS contrato_id BIGINT
  REFERENCES public.contratos(id) ON DELETE SET NULL;

COMMIT;
