-- =============================================================================
-- RAVO OS — Migration: adiciona colunas faltantes em `tickets` (Atendimento/CS)
-- =============================================================================
-- Mesmo diagnóstico de migration_fix_metas.sql: a tabela `tickets` real
-- (schema de software house) só tem customer_id/titulo/descricao/status/
-- prioridade/data_criacao/data_atualizacao/data_fechamento — mas a tela de
-- Atendimento (CSPage.tsx) sempre trabalhou com contato_id (vínculo com o
-- CRM — tabela `contatos`, não `customers`), cliente (nome denormalizado) e
-- assunto. Nenhuma dessas 3 colunas existe na tabela real.
--
-- Idempotente — ADD COLUMN IF NOT EXISTS, não mexe em dados existentes.
-- `assunto`/`cliente` ficam com o mesmo dado que a tela já grava hoje
-- (assunto→titulo já existe e pode ser reaproveitado, mas mantemos assunto
-- como alias explícito pra não obrigar a reescrever a página inteira agora).
-- `tempo_resposta` não vira coluna: passa a ser calculado no frontend a
-- partir de data_criacao/data_fechamento (tempo real decorrido, não um
-- campo solto que ninguém preenche).
-- =============================================================================

BEGIN;

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS contato_id bigint REFERENCES contatos(id) ON DELETE SET NULL;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS cliente text;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assunto text;

CREATE INDEX IF NOT EXISTS idx_tickets_contato_id ON tickets(contato_id);

COMMIT;
