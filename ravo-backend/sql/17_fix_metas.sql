-- =============================================================================
-- RAVO OS — Migration: adiciona colunas faltantes em `metas` pra suportar a
-- feature de meta automática (puxando métrica do CRM/Financeiro).
-- =============================================================================
-- Diagnóstico: a tabela `metas` real (schema de software house) tem
-- titulo/valor_alvo/valor_atual/status/data_inicio/data_fim/data_criacao/
-- data_atualizacao — mas a página Metas (GoalsPage.tsx) sempre trabalhou com
-- um modelo diferente: nome/meta/realizado/metrica/unidade/mes. `metrica` e
-- `unidade` não são só nomes de coluna diferentes — são a feature de "meta
-- automática" (o realizado vem sozinho do CRM em vez de digitado à mão) e
-- não têm equivalente nenhum na tabela real. `mes` também não existe: é o
-- que a página usa pra filtrar metas por período.
--
-- Em vez de reescrever a página e perder a feature, adiciona as 3 colunas
-- que faltam (idempotente — ADD COLUMN IF NOT EXISTS, não mexe em dados
-- existentes). As demais colunas que a página precisa (nome→titulo,
-- meta→valor_alvo, realizado→valor_atual, created_at→data_criacao,
-- updated_at→data_atualizacao) já existem — só o frontend precisa passar a
-- usar os nomes reais (ver commit que acompanha esta migration).
-- =============================================================================

BEGIN;

ALTER TABLE metas ADD COLUMN IF NOT EXISTS metrica text DEFAULT 'manual';
ALTER TABLE metas ADD COLUMN IF NOT EXISTS unidade text DEFAULT 'numero';
ALTER TABLE metas ADD COLUMN IF NOT EXISTS mes date;

COMMIT;
