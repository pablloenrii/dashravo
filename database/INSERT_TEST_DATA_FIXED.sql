-- ============================================================================
-- DADOS DE TESTE - DASHRAVO (Versão Manual para Supabase Editor)
-- ============================================================================
-- Execute isto no Supabase SQL Editor diretamente
-- Substitua 'YOUR_UUID' pelo seu User ID do Supabase Auth

-- OPÇÃO 1: Obter seu UUID (execute isto primeiro)
SELECT id, email FROM auth.users LIMIT 1;
-- Copie o ID retornado e substitua em 'YOUR_UUID' nos comandos abaixo

-- ============================================================================
-- CONTATOS
-- ============================================================================
INSERT INTO contatos (user_id, nome, empresa, email, telefone, etapa, valor) VALUES
  ('YOUR_UUID', 'João Silva', 'Acme Corp', 'joao@example.com', '11 98765-4321', 'Qualificado', 45000),
  ('YOUR_UUID', 'Maria Santos', 'TechStart', 'maria@example.com', '21 99876-5432', 'Proposta', 28000),
  ('YOUR_UUID', 'Pedro Costa', 'WebFlow', 'pedro@example.com', '85 98765-1234', 'Contatado', 12000),
  ('YOUR_UUID', 'Ana Oliveira', 'CloudSys', 'ana@example.com', '31 97654-3210', 'Qualificado', 56000),
  ('YOUR_UUID', 'Carlos Mendes', 'DataCore', 'carlos@example.com', '41 98765-9876', 'Identificado', 15000),
  ('YOUR_UUID', 'Lucia Ferreira', 'SoftWare Inc', 'lucia@example.com', '51 99876-1234', 'Qualificado', 72000),
  ('YOUR_UUID', 'Marco Rossi', 'Tech Solutions', 'marco@example.com', '61 98765-5678', 'Proposta', 38000),
  ('YOUR_UUID', 'Beatriz Lima', 'Web Innovations', 'beatriz@example.com', '71 97654-8765', 'Fechado', 95000);

-- ============================================================================
-- RECEITAS
-- ============================================================================
INSERT INTO receitas (user_id, mes, receita, despesa, lucro) VALUES
  ('YOUR_UUID', '2026-02-01', 125000, 85000, 40000),
  ('YOUR_UUID', '2026-03-01', 118000, 82000, 36000),
  ('YOUR_UUID', '2026-04-01', 145000, 88000, 57000),
  ('YOUR_UUID', '2026-05-01', 168000, 92000, 76000),
  ('YOUR_UUID', '2026-06-01', 185000, 95000, 90000),
  ('YOUR_UUID', '2026-07-01', 215000, 98000, 117000);

-- ============================================================================
-- FLUXO DE CAIXA
-- ============================================================================
INSERT INTO fluxo_caixa (user_id, semana, entradas, saidas) VALUES
  ('YOUR_UUID', '2026-06-15', 45000, 28000),
  ('YOUR_UUID', '2026-06-22', 52000, 31000),
  ('YOUR_UUID', '2026-06-29', 38000, 24000),
  ('YOUR_UUID', '2026-07-06', 61000, 35000);

-- ============================================================================
-- DESPESAS
-- ============================================================================
INSERT INTO despesas (user_id, categoria, valor, mes) VALUES
  ('YOUR_UUID', 'Pessoal', 45000, '2026-07-01'),
  ('YOUR_UUID', 'Infraestrutura', 25000, '2026-07-01'),
  ('YOUR_UUID', 'Marketing', 18000, '2026-07-01'),
  ('YOUR_UUID', 'Outros', 12000, '2026-07-01');

-- ============================================================================
-- METAS
-- ============================================================================
INSERT INTO metas (user_id, nome, meta, realizado, status, periodo) VALUES
  ('YOUR_UUID', 'Faturamento Q2', 500000, 485000, 'no-prazo', 'Q2'),
  ('YOUR_UUID', 'Novos Clientes', 50, 48, 'no-prazo', 'Mensal'),
  ('YOUR_UUID', 'Taxa de Retenção', 95, 92, 'no-prazo', 'Mensal'),
  ('YOUR_UUID', 'NPS Score', 80, 75, 'atencao', 'Mensal'),
  ('YOUR_UUID', 'Margem Lucro', 55, 54, 'no-prazo', 'Mensal'),
  ('YOUR_UUID', 'Satisfação Cliente', 90, 87, 'no-prazo', 'Mensal');

-- ============================================================================
-- PROGRESSO SEMANAL
-- ============================================================================
INSERT INTO progresso_semanal (user_id, semana, atingido, meta) VALUES
  ('YOUR_UUID', '2026-06-15', 15, 25),
  ('YOUR_UUID', '2026-06-22', 28, 25),
  ('YOUR_UUID', '2026-06-29', 31, 25),
  ('YOUR_UUID', '2026-07-06', 38, 25);

-- ============================================================================
-- TICKETS
-- ============================================================================
INSERT INTO tickets (user_id, ticketId, cliente, assunto, prioridade, status, tempo_resposta) VALUES
  ('YOUR_UUID', '#TKT-2451', 'Acme Corp', 'Erro na integração', 'alta', 'aberto', '2h 15m'),
  ('YOUR_UUID', '#TKT-2450', 'TechStart', 'Fatura em duplicata', 'média', 'aberto', '1h 30m'),
  ('YOUR_UUID', '#TKT-2449', 'WebFlow', 'Reset de senha', 'baixa', 'resolvido', '45m'),
  ('YOUR_UUID', '#TKT-2448', 'CloudSys', 'Dúvida sobre recurso', 'baixa', 'resolvido', '1h 10m'),
  ('YOUR_UUID', '#TKT-2447', 'DataCore', 'Upgrade de plano', 'média', 'aberto', '3h 20m'),
  ('YOUR_UUID', '#TKT-2446', 'SoftWare Inc', 'API timeout', 'alta', 'aberto', '1h 45m');

-- ============================================================================
-- SATISFAÇÃO
-- ============================================================================
INSERT INTO satisfacao (user_id, semana, nps, satisfacao) VALUES
  ('YOUR_UUID', '2026-06-15', 68, 85),
  ('YOUR_UUID', '2026-06-22', 72, 87),
  ('YOUR_UUID', '2026-06-29', 75, 89),
  ('YOUR_UUID', '2026-07-06', 78, 91);

-- ============================================================================
-- VERIFICAR DADOS
-- ============================================================================
SELECT 'Contatos' as tabela, COUNT(*) as total FROM contatos WHERE user_id = 'YOUR_UUID'
UNION ALL
SELECT 'Receitas', COUNT(*) FROM receitas WHERE user_id = 'YOUR_UUID'
UNION ALL
SELECT 'Fluxo Caixa', COUNT(*) FROM fluxo_caixa WHERE user_id = 'YOUR_UUID'
UNION ALL
SELECT 'Despesas', COUNT(*) FROM despesas WHERE user_id = 'YOUR_UUID'
UNION ALL
SELECT 'Metas', COUNT(*) FROM metas WHERE user_id = 'YOUR_UUID'
UNION ALL
SELECT 'Progresso', COUNT(*) FROM progresso_semanal WHERE user_id = 'YOUR_UUID'
UNION ALL
SELECT 'Tickets', COUNT(*) FROM tickets WHERE user_id = 'YOUR_UUID'
UNION ALL
SELECT 'Satisfação', COUNT(*) FROM satisfacao WHERE user_id = 'YOUR_UUID';
