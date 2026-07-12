-- ============================================================================
-- DADOS DE TESTE - DASHRAVO
-- Cole isto no Supabase SQL Editor APÓS executar as migrations
-- ============================================================================

-- ⚠️ IMPORTANTE: Execute cada bloco sequencialmente
-- NOTA: Substitua 'YOUR_USER_ID' pelo seu UUID real
-- Você pode obter seu UUID em: Supabase > Auth > Users

-- ============================================================================
-- INSERIR CONTATOS (CRM)
-- ============================================================================

INSERT INTO contatos (user_id, nome, empresa, email, telefone, etapa, valor) VALUES
  (auth.uid(), 'João Silva', 'Acme Corp', 'joao@example.com', '11 98765-4321', 'Qualificado', 45000),
  (auth.uid(), 'Maria Santos', 'TechStart', 'maria@example.com', '21 99876-5432', 'Proposta', 28000),
  (auth.uid(), 'Pedro Costa', 'WebFlow', 'pedro@example.com', '85 98765-1234', 'Contatado', 12000),
  (auth.uid(), 'Ana Oliveira', 'CloudSys', 'ana@example.com', '31 97654-3210', 'Qualificado', 56000),
  (auth.uid(), 'Carlos Mendes', 'DataCore', 'carlos@example.com', '41 98765-9876', 'Identificado', 15000),
  (auth.uid(), 'Lucia Ferreira', 'SoftWare Inc', 'lucia@example.com', '51 99876-1234', 'Qualificado', 72000),
  (auth.uid(), 'Marco Rossi', 'Tech Solutions', 'marco@example.com', '61 98765-5678', 'Proposta', 38000),
  (auth.uid(), 'Beatriz Lima', 'Web Innovations', 'beatriz@example.com', '71 97654-8765', 'Fechado', 95000);

-- ✓ Run this query

-- ============================================================================
-- INSERIR RECEITAS (Finance) - últimos 6 meses
-- ============================================================================

INSERT INTO receitas (user_id, mes, receita, despesa, lucro) VALUES
  (auth.uid(), '2026-02-01', 125000, 85000, 40000),
  (auth.uid(), '2026-03-01', 118000, 82000, 36000),
  (auth.uid(), '2026-04-01', 145000, 88000, 57000),
  (auth.uid(), '2026-05-01', 168000, 92000, 76000),
  (auth.uid(), '2026-06-01', 185000, 95000, 90000),
  (auth.uid(), '2026-07-01', 215000, 98000, 117000);

-- ✓ Run this query

-- ============================================================================
-- INSERIR FLUXO DE CAIXA (Weekly)
-- ============================================================================

INSERT INTO fluxo_caixa (user_id, semana, entradas, saidas) VALUES
  (auth.uid(), '2026-06-15', 45000, 28000),
  (auth.uid(), '2026-06-22', 52000, 31000),
  (auth.uid(), '2026-06-29', 38000, 24000),
  (auth.uid(), '2026-07-06', 61000, 35000);

-- ✓ Run this query

-- ============================================================================
-- INSERIR DESPESAS (por categoria)
-- ============================================================================

INSERT INTO despesas (user_id, categoria, valor, mes) VALUES
  (auth.uid(), 'Pessoal', 45000, '2026-07-01'),
  (auth.uid(), 'Infraestrutura', 25000, '2026-07-01'),
  (auth.uid(), 'Marketing', 18000, '2026-07-01'),
  (auth.uid(), 'Outros', 12000, '2026-07-01');

-- ✓ Run this query

-- ============================================================================
-- INSERIR METAS (Goals)
-- ============================================================================

INSERT INTO metas (user_id, nome, meta, realizado, status, periodo) VALUES
  (auth.uid(), 'Faturamento Q2', 500000, 485000, 'no-prazo', 'Q2'),
  (auth.uid(), 'Novos Clientes', 50, 48, 'no-prazo', 'Mensal'),
  (auth.uid(), 'Taxa de Retenção', 95, 92, 'no-prazo', 'Mensal'),
  (auth.uid(), 'NPS Score', 80, 75, 'atencao', 'Mensal'),
  (auth.uid(), 'Margem Lucro', 55, 54, 'no-prazo', 'Mensal'),
  (auth.uid(), 'Satisfação Cliente', 90, 87, 'no-prazo', 'Mensal');

-- ✓ Run this query

-- ============================================================================
-- INSERIR PROGRESSO SEMANAL (Goals Progress)
-- ============================================================================

INSERT INTO progresso_semanal (user_id, semana, atingido, meta) VALUES
  (auth.uid(), '2026-06-15', 15, 25),
  (auth.uid(), '2026-06-22', 28, 25),
  (auth.uid(), '2026-06-29', 31, 25),
  (auth.uid(), '2026-07-06', 38, 25);

-- ✓ Run this query

-- ============================================================================
-- INSERIR TICKETS (Customer Service)
-- ============================================================================

INSERT INTO tickets (user_id, ticketId, cliente, assunto, prioridade, status, tempo_resposta) VALUES
  (auth.uid(), '#TKT-2451', 'Acme Corp', 'Erro na integração', 'alta', 'aberto', '2h 15m'),
  (auth.uid(), '#TKT-2450', 'TechStart', 'Fatura em duplicata', 'média', 'aberto', '1h 30m'),
  (auth.uid(), '#TKT-2449', 'WebFlow', 'Reset de senha', 'baixa', 'resolvido', '45m'),
  (auth.uid(), '#TKT-2448', 'CloudSys', 'Dúvida sobre recurso', 'baixa', 'resolvido', '1h 10m'),
  (auth.uid(), '#TKT-2447', 'DataCore', 'Upgrade de plano', 'média', 'aberto', '3h 20m'),
  (auth.uid(), '#TKT-2446', 'SoftWare Inc', 'API timeout', 'alta', 'aberto', '1h 45m');

-- ✓ Run this query

-- ============================================================================
-- INSERIR SATISFAÇÃO (NPS & Satisfaction)
-- ============================================================================

INSERT INTO satisfacao (user_id, semana, nps, satisfacao) VALUES
  (auth.uid(), '2026-06-15', 68, 85),
  (auth.uid(), '2026-06-22', 72, 87),
  (auth.uid(), '2026-06-29', 75, 89),
  (auth.uid(), '2026-07-06', 78, 91);

-- ✓ Run this query

-- ============================================================================
-- VERIFICAR DADOS INSERIDOS
-- ============================================================================

-- Execute isto para verificar:
SELECT COUNT(*) as total_contatos FROM contatos WHERE user_id = auth.uid();
SELECT COUNT(*) as total_receitas FROM receitas WHERE user_id = auth.uid();
SELECT COUNT(*) as total_tickets FROM tickets WHERE user_id = auth.uid();
SELECT COUNT(*) as total_metas FROM metas WHERE user_id = auth.uid();
SELECT COUNT(*) as total_satisfacao FROM satisfacao WHERE user_id = auth.uid();

-- ============================================================================
-- ✅ PRONTO!
-- ============================================================================
-- Todos os dados de teste foram inseridos!
-- Próximo: Execute `npm run dev` para ver os dados nos gráficos
