-- ============================================================================
-- LIMPAR E REINSERIR DADOS DE TESTE
-- ============================================================================

-- REMOVER constraints temporariamente
ALTER TABLE contatos DROP CONSTRAINT IF EXISTS contatos_user_id_fkey;
ALTER TABLE receitas DROP CONSTRAINT IF EXISTS receitas_user_id_fkey;
ALTER TABLE fluxo_caixa DROP CONSTRAINT IF EXISTS fluxo_caixa_user_id_fkey;
ALTER TABLE despesas DROP CONSTRAINT IF EXISTS despesas_user_id_fkey;
ALTER TABLE metas DROP CONSTRAINT IF EXISTS metas_user_id_fkey;
ALTER TABLE progresso_semanal DROP CONSTRAINT IF EXISTS progresso_semanal_user_id_fkey;
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_user_id_fkey;
ALTER TABLE satisfacao DROP CONSTRAINT IF EXISTS satisfacao_user_id_fkey;

-- LIMPAR dados existentes
DELETE FROM contatos;
DELETE FROM receitas;
DELETE FROM fluxo_caixa;
DELETE FROM despesas;
DELETE FROM metas;
DELETE FROM progresso_semanal;
DELETE FROM tickets;
DELETE FROM satisfacao;

-- ============================================================================
-- INSERIR DADOS LIMPOS
-- ============================================================================

-- CONTATOS (8 registros)
INSERT INTO contatos (user_id, nome, empresa, email, telefone, etapa, valor)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'João Silva', 'Acme Corp', 'joao@example.com', '11 98765-4321', 'Qualificado', 45000),
  ('550e8400-e29b-41d4-a716-446655440002', 'Maria Santos', 'TechStart', 'maria@example.com', '21 99876-5432', 'Proposta', 28000),
  ('550e8400-e29b-41d4-a716-446655440003', 'Pedro Costa', 'WebFlow', 'pedro@example.com', '85 98765-1234', 'Contatado', 12000),
  ('550e8400-e29b-41d4-a716-446655440004', 'Ana Oliveira', 'CloudSys', 'ana@example.com', '31 97654-3210', 'Qualificado', 56000),
  ('550e8400-e29b-41d4-a716-446655440005', 'Carlos Mendes', 'DataCore', 'carlos@example.com', '41 98765-9876', 'Identificado', 15000),
  ('550e8400-e29b-41d4-a716-446655440006', 'Lucia Ferreira', 'SoftWare Inc', 'lucia@example.com', '51 99876-1234', 'Qualificado', 72000),
  ('550e8400-e29b-41d4-a716-446655440007', 'Marco Rossi', 'Tech Solutions', 'marco@example.com', '61 98765-5678', 'Proposta', 38000),
  ('550e8400-e29b-41d4-a716-446655440008', 'Beatriz Lima', 'Web Innovations', 'beatriz@example.com', '71 97654-8765', 'Fechado', 95000);

-- RECEITAS (6 registros)
INSERT INTO receitas (user_id, mes, receita, despesa, lucro)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '2026-02-01'::DATE, 125000, 85000, 40000),
  ('550e8400-e29b-41d4-a716-446655440001', '2026-03-01'::DATE, 118000, 82000, 36000),
  ('550e8400-e29b-41d4-a716-446655440001', '2026-04-01'::DATE, 145000, 88000, 57000),
  ('550e8400-e29b-41d4-a716-446655440001', '2026-05-01'::DATE, 168000, 92000, 76000),
  ('550e8400-e29b-41d4-a716-446655440001', '2026-06-01'::DATE, 185000, 95000, 90000),
  ('550e8400-e29b-41d4-a716-446655440001', '2026-07-01'::DATE, 215000, 98000, 117000);

-- FLUXO DE CAIXA (4 registros)
INSERT INTO fluxo_caixa (user_id, semana, entradas, saidas)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '2026-06-15'::DATE, 45000, 28000),
  ('550e8400-e29b-41d4-a716-446655440001', '2026-06-22'::DATE, 52000, 31000),
  ('550e8400-e29b-41d4-a716-446655440001', '2026-06-29'::DATE, 38000, 24000),
  ('550e8400-e29b-41d4-a716-446655440001', '2026-07-06'::DATE, 61000, 35000);

-- DESPESAS (4 registros)
INSERT INTO despesas (user_id, categoria, valor, mes)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Pessoal', 45000, '2026-07-01'::DATE),
  ('550e8400-e29b-41d4-a716-446655440001', 'Infraestrutura', 25000, '2026-07-01'::DATE),
  ('550e8400-e29b-41d4-a716-446655440001', 'Marketing', 18000, '2026-07-01'::DATE),
  ('550e8400-e29b-41d4-a716-446655440001', 'Outros', 12000, '2026-07-01'::DATE);

-- METAS (6 registros)
INSERT INTO metas (user_id, nome, meta, realizado, status, periodo)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Faturamento Q2', 500000, 485000, 'no-prazo', 'Q2'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Novos Clientes', 50, 48, 'no-prazo', 'Mensal'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Taxa de Retenção', 95, 92, 'no-prazo', 'Mensal'),
  ('550e8400-e29b-41d4-a716-446655440001', 'NPS Score', 80, 75, 'atencao', 'Mensal'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Margem Lucro', 55, 54, 'no-prazo', 'Mensal'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Satisfação Cliente', 90, 87, 'no-prazo', 'Mensal');

-- PROGRESSO SEMANAL (4 registros)
INSERT INTO progresso_semanal (user_id, semana, atingido, meta)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '2026-06-15'::DATE, 15, 25),
  ('550e8400-e29b-41d4-a716-446655440001', '2026-06-22'::DATE, 28, 25),
  ('550e8400-e29b-41d4-a716-446655440001', '2026-06-29'::DATE, 31, 25),
  ('550e8400-e29b-41d4-a716-446655440001', '2026-07-06'::DATE, 38, 25);

-- TICKETS (6 registros)
INSERT INTO tickets (user_id, ticketId, cliente, assunto, prioridade, status, tempo_resposta)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '#TKT-2451', 'Acme Corp', 'Erro na integração', 'alta', 'aberto', '2h 15m'),
  ('550e8400-e29b-41d4-a716-446655440001', '#TKT-2450', 'TechStart', 'Fatura em duplicata', 'média', 'aberto', '1h 30m'),
  ('550e8400-e29b-41d4-a716-446655440001', '#TKT-2449', 'WebFlow', 'Reset de senha', 'baixa', 'resolvido', '45m'),
  ('550e8400-e29b-41d4-a716-446655440001', '#TKT-2448', 'CloudSys', 'Dúvida sobre recurso', 'baixa', 'resolvido', '1h 10m'),
  ('550e8400-e29b-41d4-a716-446655440001', '#TKT-2447', 'DataCore', 'Upgrade de plano', 'média', 'aberto', '3h 20m'),
  ('550e8400-e29b-41d4-a716-446655440001', '#TKT-2446', 'SoftWare Inc', 'API timeout', 'alta', 'aberto', '1h 45m');

-- SATISFAÇÃO (4 registros)
INSERT INTO satisfacao (user_id, semana, nps, satisfacao)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '2026-06-15'::DATE, 68, 85),
  ('550e8400-e29b-41d4-a716-446655440001', '2026-06-22'::DATE, 72, 87),
  ('550e8400-e29b-41d4-a716-446655440001', '2026-06-29'::DATE, 75, 89),
  ('550e8400-e29b-41d4-a716-446655440001', '2026-07-06'::DATE, 78, 91);

-- ============================================================================
-- RECREAR constraints
-- ============================================================================

ALTER TABLE contatos
ADD CONSTRAINT contatos_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE receitas
ADD CONSTRAINT receitas_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE fluxo_caixa
ADD CONSTRAINT fluxo_caixa_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE despesas
ADD CONSTRAINT despesas_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE metas
ADD CONSTRAINT metas_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE progresso_semanal
ADD CONSTRAINT progresso_semanal_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE tickets
ADD CONSTRAINT tickets_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE satisfacao
ADD CONSTRAINT satisfacao_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

SELECT 'Contatos' as tabela, COUNT(*) as total FROM contatos
UNION ALL SELECT 'Receitas', COUNT(*) FROM receitas
UNION ALL SELECT 'Fluxo Caixa', COUNT(*) FROM fluxo_caixa
UNION ALL SELECT 'Despesas', COUNT(*) FROM despesas
UNION ALL SELECT 'Metas', COUNT(*) FROM metas
UNION ALL SELECT 'Progresso', COUNT(*) FROM progresso_semanal
UNION ALL SELECT 'Tickets', COUNT(*) FROM tickets
UNION ALL SELECT 'Satisfação', COUNT(*) FROM satisfacao
ORDER BY tabela;
