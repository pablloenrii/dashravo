-- ============================================================================
-- INSERIR DADOS DE TESTE - COPIE E COLE NO SUPABASE SQL EDITOR
-- ============================================================================
--
-- INSTRUÇÕES:
-- 1. Abra Supabase → SQL Editor
-- 2. Cole TODO este script
-- 3. Clique RUN
-- 4. Pronto! 42 registros inseridos em 8 tabelas
--
-- ============================================================================

-- CONTATOS (8 registros)
INSERT INTO contatos (user_id, nome, empresa, email, telefone, etapa, valor)
SELECT gen_random_uuid(), nome, empresa, email, telefone, etapa, valor FROM (
  VALUES
    ('João Silva', 'Acme Corp', 'joao@example.com', '11 98765-4321', 'Qualificado', 45000),
    ('Maria Santos', 'TechStart', 'maria@example.com', '21 99876-5432', 'Proposta', 28000),
    ('Pedro Costa', 'WebFlow', 'pedro@example.com', '85 98765-1234', 'Contatado', 12000),
    ('Ana Oliveira', 'CloudSys', 'ana@example.com', '31 97654-3210', 'Qualificado', 56000),
    ('Carlos Mendes', 'DataCore', 'carlos@example.com', '41 98765-9876', 'Identificado', 15000),
    ('Lucia Ferreira', 'SoftWare Inc', 'lucia@example.com', '51 99876-1234', 'Qualificado', 72000),
    ('Marco Rossi', 'Tech Solutions', 'marco@example.com', '61 98765-5678', 'Proposta', 38000),
    ('Beatriz Lima', 'Web Innovations', 'beatriz@example.com', '71 97654-8765', 'Fechado', 95000)
) AS data(nome, empresa, email, telefone, etapa, valor);

-- RECEITAS (6 registros)
INSERT INTO receitas (user_id, mes, receita, despesa, lucro)
SELECT gen_random_uuid(), mes, receita, despesa, lucro FROM (
  VALUES
    ('2026-02-01'::DATE, 125000, 85000, 40000),
    ('2026-03-01'::DATE, 118000, 82000, 36000),
    ('2026-04-01'::DATE, 145000, 88000, 57000),
    ('2026-05-01'::DATE, 168000, 92000, 76000),
    ('2026-06-01'::DATE, 185000, 95000, 90000),
    ('2026-07-01'::DATE, 215000, 98000, 117000)
) AS data(mes, receita, despesa, lucro);

-- FLUXO DE CAIXA (4 registros)
INSERT INTO fluxo_caixa (user_id, semana, entradas, saidas)
SELECT gen_random_uuid(), semana, entradas, saidas FROM (
  VALUES
    ('2026-06-15'::DATE, 45000, 28000),
    ('2026-06-22'::DATE, 52000, 31000),
    ('2026-06-29'::DATE, 38000, 24000),
    ('2026-07-06'::DATE, 61000, 35000)
) AS data(semana, entradas, saidas);

-- DESPESAS (4 registros)
INSERT INTO despesas (user_id, categoria, valor, mes)
SELECT gen_random_uuid(), categoria, valor, mes FROM (
  VALUES
    ('Pessoal', 45000, '2026-07-01'::DATE),
    ('Infraestrutura', 25000, '2026-07-01'::DATE),
    ('Marketing', 18000, '2026-07-01'::DATE),
    ('Outros', 12000, '2026-07-01'::DATE)
) AS data(categoria, valor, mes);

-- METAS (6 registros)
INSERT INTO metas (user_id, nome, meta, realizado, status, periodo)
SELECT gen_random_uuid(), nome, meta, realizado, status, periodo FROM (
  VALUES
    ('Faturamento Q2', 500000, 485000, 'no-prazo', 'Q2'),
    ('Novos Clientes', 50, 48, 'no-prazo', 'Mensal'),
    ('Taxa de Retenção', 95, 92, 'no-prazo', 'Mensal'),
    ('NPS Score', 80, 75, 'atencao', 'Mensal'),
    ('Margem Lucro', 55, 54, 'no-prazo', 'Mensal'),
    ('Satisfação Cliente', 90, 87, 'no-prazo', 'Mensal')
) AS data(nome, meta, realizado, status, periodo);

-- PROGRESSO SEMANAL (4 registros)
INSERT INTO progresso_semanal (user_id, semana, atingido, meta)
SELECT gen_random_uuid(), semana, atingido, meta FROM (
  VALUES
    ('2026-06-15'::DATE, 15, 25),
    ('2026-06-22'::DATE, 28, 25),
    ('2026-06-29'::DATE, 31, 25),
    ('2026-07-06'::DATE, 38, 25)
) AS data(semana, atingido, meta);

-- TICKETS (6 registros)
INSERT INTO tickets (user_id, ticketId, cliente, assunto, prioridade, status, tempo_resposta)
SELECT gen_random_uuid(), ticketId, cliente, assunto, prioridade, status, tempo_resposta FROM (
  VALUES
    ('#TKT-2451', 'Acme Corp', 'Erro na integração', 'alta', 'aberto', '2h 15m'),
    ('#TKT-2450', 'TechStart', 'Fatura em duplicata', 'média', 'aberto', '1h 30m'),
    ('#TKT-2449', 'WebFlow', 'Reset de senha', 'baixa', 'resolvido', '45m'),
    ('#TKT-2448', 'CloudSys', 'Dúvida sobre recurso', 'baixa', 'resolvido', '1h 10m'),
    ('#TKT-2447', 'DataCore', 'Upgrade de plano', 'média', 'aberto', '3h 20m'),
    ('#TKT-2446', 'SoftWare Inc', 'API timeout', 'alta', 'aberto', '1h 45m')
) AS data(ticketId, cliente, assunto, prioridade, status, tempo_resposta);

-- SATISFAÇÃO (4 registros)
INSERT INTO satisfacao (user_id, semana, nps, satisfacao)
SELECT gen_random_uuid(), semana, nps, satisfacao FROM (
  VALUES
    ('2026-06-15'::DATE, 68, 85),
    ('2026-06-22'::DATE, 72, 87),
    ('2026-06-29'::DATE, 75, 89),
    ('2026-07-06'::DATE, 78, 91)
) AS data(semana, nps, satisfacao);

-- ============================================================================
-- VERIFICAÇÃO - Execute isto para confirmar os dados foram inseridos
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
