-- ============================================================================
-- RAVO OS — SEED (dados de teste)
-- ============================================================================
-- Substitui o INSERT_TEST_DATA_FIXED.sql. Diferenças:
--   • Não usa placeholder 'YOUR_UUID' — pega o primeiro usuário de auth.users.
--   • Datas relativas a hoje (sempre nos últimos 6 meses) para o Dashboard
--     mostrar dados em qualquer data de execução.
--   • Popula customers/subscriptions (MRR, churn, LTV/CAC do Dashboard).
--   • Idempotente: pode rodar mais de uma vez sem duplicar.
--
-- Uso: Supabase Dashboard → SQL Editor → New Query → colar → Run.
-- ============================================================================

DO $$
DECLARE
  uid uuid;
  m0 date; m1 date; m2 date; m3 date; m4 date; m5 date;
BEGIN
  SELECT id INTO uid FROM auth.users ORDER BY created_at LIMIT 1;

  IF uid IS NULL THEN
    RAISE NOTICE 'Nenhum usuário em auth.users. Crie uma conta (login/signup da app) e rode o seed novamente.';
    RETURN;
  END IF;

  m0 := DATE_TRUNC('month', CURRENT_DATE)::date;        -- mês atual
  m1 := (m0 - INTERVAL '1 month')::date;
  m2 := (m0 - INTERVAL '2 months')::date;
  m3 := (m0 - INTERVAL '3 months')::date;
  m4 := (m0 - INTERVAL '4 months')::date;
  m5 := (m0 - INTERVAL '5 months')::date;

  RAISE NOTICE 'Semeando dados para o usuário %', uid;

  -- ==========================================================================
  -- CONTATOS (CRM)
  -- ==========================================================================
  INSERT INTO contatos (user_id, nome, empresa, email, telefone, etapa, valor, origem, motivo, data_prevista, created_at, updated_at)
  SELECT uid, 'João Silva', 'Acme Corp', 'joao@example.com', '11 98765-4321', 'Qualificado', 45000, 'Inbound', NULL, (m0 + 15)::date, m3 + INTERVAL '3 days', NOW()
  WHERE NOT EXISTS (SELECT 1 FROM contatos WHERE user_id = uid AND email = 'joao@example.com');

  INSERT INTO contatos (user_id, nome, empresa, email, telefone, etapa, valor, origem, motivo, data_prevista, created_at, updated_at)
  SELECT uid, 'Maria Santos', 'TechStart', 'maria@example.com', '21 99876-5432', 'Proposta', 28000, 'Inbound', NULL, (m0 + 20)::date, m2 + INTERVAL '5 days', NOW()
  WHERE NOT EXISTS (SELECT 1 FROM contatos WHERE user_id = uid AND email = 'maria@example.com');

  INSERT INTO contatos (user_id, nome, empresa, email, telefone, etapa, valor, origem, motivo, data_prevista, created_at, updated_at)
  SELECT uid, 'Pedro Costa', 'WebFlow', 'pedro@example.com', '85 98765-1234', 'Contato Feito', 12000, 'Site', NULL, (m0 + 25)::date, m1 + INTERVAL '2 days', NOW()
  WHERE NOT EXISTS (SELECT 1 FROM contatos WHERE user_id = uid AND email = 'pedro@example.com');

  INSERT INTO contatos (user_id, nome, empresa, email, telefone, etapa, valor, origem, motivo, data_prevista, created_at, updated_at)
  SELECT uid, 'Ana Oliveira', 'CloudSys', 'ana@example.com', '31 97654-3210', 'Negociação', 56000, 'Indicação', NULL, (m0 + 10)::date, m2 + INTERVAL '1 day', NOW()
  WHERE NOT EXISTS (SELECT 1 FROM contatos WHERE user_id = uid AND email = 'ana@example.com');

  INSERT INTO contatos (user_id, nome, empresa, email, telefone, etapa, valor, origem, motivo, data_prevista, created_at, updated_at)
  SELECT uid, 'Carlos Mendes', 'DataCore', 'carlos@example.com', '41 98765-9876', 'Ganho', 15000, 'Outbound', 'ganho', NULL, m4 + INTERVAL '2 days', m2 + INTERVAL '4 days'
  WHERE NOT EXISTS (SELECT 1 FROM contatos WHERE user_id = uid AND email = 'carlos@example.com');

  INSERT INTO contatos (user_id, nome, empresa, email, telefone, etapa, valor, origem, motivo, data_prevista, created_at, updated_at)
  SELECT uid, 'Lucia Ferreira', 'SoftWare Inc', 'lucia@example.com', '51 99876-1234', 'Ganho', 72000, 'Indicação', 'ganho', NULL, m3 + INTERVAL '1 day', m1 + INTERVAL '6 days'
  WHERE NOT EXISTS (SELECT 1 FROM contatos WHERE user_id = uid AND email = 'lucia@example.com');

  INSERT INTO contatos (user_id, nome, empresa, email, telefone, etapa, valor, origem, motivo, data_prevista, created_at, updated_at)
  SELECT uid, 'Marco Rossi', 'Tech Solutions', 'marco@example.com', '61 98765-5678', 'Perdido', 38000, 'Outbound', 'preço', NULL, m2 + INTERVAL '1 day', m1 + INTERVAL '2 days'
  WHERE NOT EXISTS (SELECT 1 FROM contatos WHERE user_id = uid AND email = 'marco@example.com');

  INSERT INTO contatos (user_id, nome, empresa, email, telefone, etapa, valor, origem, motivo, data_prevista, created_at, updated_at)
  SELECT uid, 'Beatriz Lima', 'Web Innovations', 'beatriz@example.com', '71 97654-8765', 'Qualificado', 95000, 'Evento', NULL, (m0 + 8)::date, m1 + INTERVAL '3 days', NOW()
  WHERE NOT EXISTS (SELECT 1 FROM contatos WHERE user_id = uid AND email = 'beatriz@example.com');

  -- ==========================================================================
  -- CUSTOMERS (alimentam MRR/churn/LTV/CAC do Dashboard)
  -- status: active (ativos) | churned (churnado em churned_at)
  -- ==========================================================================
  INSERT INTO customers (user_id, name, email, phone, company, status, source, custo_aquisicao, churned_at, created_at)
  SELECT uid, 'João Silva', 'joao@example.com', '11 98765-4321', 'Acme Corp', 'active', 'Inbound', 1500, NULL, m4
  ON CONFLICT DO NOTHING;
  INSERT INTO customers (user_id, name, email, phone, company, status, source, custo_aquisicao, churned_at, created_at)
  SELECT uid, 'Maria Santos', 'maria@example.com', '21 99876-5432', 'TechStart', 'active', 'Inbound', 1200, NULL, m3
  ON CONFLICT DO NOTHING;
  INSERT INTO customers (user_id, name, email, phone, company, status, source, custo_aquisicao, churned_at, created_at)
  SELECT uid, 'Pedro Costa', 'pedro@example.com', '85 98765-1234', 'WebFlow', 'active', 'Site', 1000, NULL, m2
  ON CONFLICT DO NOTHING;
  INSERT INTO customers (user_id, name, email, phone, company, status, source, custo_aquisicao, churned_at, created_at)
  SELECT uid, 'Ana Oliveira', 'ana@example.com', '31 97654-3210', 'CloudSys', 'active', 'Indicação', 1800, NULL, m2
  ON CONFLICT DO NOTHING;
  INSERT INTO customers (user_id, name, email, phone, company, status, source, custo_aquisicao, churned_at, created_at)
  SELECT uid, 'Carlos Mendes', 'carlos@example.com', '41 98765-9876', 'DataCore', 'churned', 'Outbound', 900, m2 + INTERVAL '15 days', m4
  ON CONFLICT DO NOTHING;
  INSERT INTO customers (user_id, name, email, phone, company, status, source, custo_aquisicao, churned_at, created_at)
  SELECT uid, 'Lucia Ferreira', 'lucia@example.com', '51 99876-1234', 'SoftWare Inc', 'active', 'Indicação', 2200, NULL, m3
  ON CONFLICT DO NOTHING;
  INSERT INTO customers (user_id, name, email, phone, company, status, source, custo_aquisicao, churned_at, created_at)
  SELECT uid, 'Marco Rossi', 'marco@example.com', '61 98765-5678', 'Tech Solutions', 'churned', 'Outbound', 1100, m1 + INTERVAL '10 days', m2
  ON CONFLICT DO NOTHING;
  INSERT INTO customers (user_id, name, email, phone, company, status, source, custo_aquisicao, churned_at, created_at)
  SELECT uid, 'Beatriz Lima', 'beatriz@example.com', '71 97654-8765', 'Web Innovations', 'active', 'Evento', 2600, NULL, m1
  ON CONFLICT DO NOTHING;

  -- ==========================================================================
  -- SUBSCRIPTIONS (MRR por cliente; criadas em meses distintos p/ curva de MRR)
  -- ==========================================================================
  INSERT INTO subscriptions (customer_id, mrr, status, created_at)
  SELECT c.id, 45000, 'active', m4 FROM customers c WHERE c.user_id = uid AND c.email = 'joao@example.com'
  AND NOT EXISTS (SELECT 1 FROM subscriptions s JOIN customers cc ON cc.id = s.customer_id WHERE cc.user_id = uid AND cc.email = 'joao@example.com');

  INSERT INTO subscriptions (customer_id, mrr, status, created_at)
  SELECT c.id, 28000, 'active', m3 FROM customers c WHERE c.user_id = uid AND c.email = 'maria@example.com'
  AND NOT EXISTS (SELECT 1 FROM subscriptions s JOIN customers cc ON cc.id = s.customer_id WHERE cc.user_id = uid AND cc.email = 'maria@example.com');

  INSERT INTO subscriptions (customer_id, mrr, status, created_at)
  SELECT c.id, 12000, 'active', m2 FROM customers c WHERE c.user_id = uid AND c.email = 'pedro@example.com'
  AND NOT EXISTS (SELECT 1 FROM subscriptions s JOIN customers cc ON cc.id = s.customer_id WHERE cc.user_id = uid AND cc.email = 'pedro@example.com');

  INSERT INTO subscriptions (customer_id, mrr, status, created_at)
  SELECT c.id, 56000, 'active', m2 FROM customers c WHERE c.user_id = uid AND c.email = 'ana@example.com'
  AND NOT EXISTS (SELECT 1 FROM subscriptions s JOIN customers cc ON cc.id = s.customer_id WHERE cc.user_id = uid AND cc.email = 'ana@example.com');

  INSERT INTO subscriptions (customer_id, mrr, status, created_at)
  SELECT c.id, 72000, 'active', m3 FROM customers c WHERE c.user_id = uid AND c.email = 'lucia@example.com'
  AND NOT EXISTS (SELECT 1 FROM subscriptions s JOIN customers cc ON cc.id = s.customer_id WHERE cc.user_id = uid AND cc.email = 'lucia@example.com');

  INSERT INTO subscriptions (customer_id, mrr, status, created_at)
  SELECT c.id, 95000, 'active', m1 FROM customers c WHERE c.user_id = uid AND c.email = 'beatriz@example.com'
  AND NOT EXISTS (SELECT 1 FROM subscriptions s JOIN customers cc ON cc.id = s.customer_id WHERE cc.user_id = uid AND cc.email = 'beatriz@example.com');

  -- ==========================================================================
  -- RECEITAS (últimos 6 meses — financeiro e gráfico de receita do Dashboard)
  -- ==========================================================================
  INSERT INTO receitas (user_id, mes, receita, despesa, lucro) VALUES
    (uid, m5, 125000, 85000, 40000),
    (uid, m4, 118000, 82000, 36000),
    (uid, m3, 145000, 88000, 57000),
    (uid, m2, 168000, 92000, 76000),
    (uid, m1, 185000, 95000, 90000),
    (uid, m0, 215000, 98000, 117000)
  ON CONFLICT (user_id, mes) DO NOTHING;

  -- ==========================================================================
  -- FLUXO DE CAIXA (4 semanas)
  -- ==========================================================================
  INSERT INTO fluxo_caixa (user_id, semana, entradas, saidas) VALUES
    (uid, (DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '3 weeks')::date, 45000, 28000),
    (uid, (DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '2 weeks')::date, 52000, 31000),
    (uid, (DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 week')::date, 38000, 24000),
    (uid, DATE_TRUNC('week', CURRENT_DATE)::date, 61000, 35000)
  ON CONFLICT (user_id, semana) DO NOTHING;

  -- ==========================================================================
  -- DESPESAS (mês atual)
  -- ==========================================================================
  INSERT INTO despesas (user_id, categoria, valor, mes)
  SELECT uid, 'Pessoal', 45000, m0
  WHERE NOT EXISTS (SELECT 1 FROM despesas WHERE user_id = uid AND mes = m0 AND categoria = 'Pessoal');

  INSERT INTO despesas (user_id, categoria, valor, mes)
  SELECT uid, 'Infraestrutura', 25000, m0
  WHERE NOT EXISTS (SELECT 1 FROM despesas WHERE user_id = uid AND mes = m0 AND categoria = 'Infraestrutura');

  INSERT INTO despesas (user_id, categoria, valor, mes)
  SELECT uid, 'Marketing', 18000, m0
  WHERE NOT EXISTS (SELECT 1 FROM despesas WHERE user_id = uid AND mes = m0 AND categoria = 'Marketing');

  INSERT INTO despesas (user_id, categoria, valor, mes)
  SELECT uid, 'Outros', 12000, m0
  WHERE NOT EXISTS (SELECT 1 FROM despesas WHERE user_id = uid AND mes = m0 AND categoria = 'Outros');

  -- ==========================================================================
  -- METAS (mês atual)
  -- ==========================================================================
  INSERT INTO metas (user_id, nome, meta, realizado, status, periodo, mes, metrica, unidade)
  SELECT uid, 'Faturamento', 500000, 0, 'no-prazo', 'Mensal', m0, 'receita_ganha', 'moeda'
  WHERE NOT EXISTS (SELECT 1 FROM metas WHERE user_id = uid AND nome = 'Faturamento' AND mes = m0);

  INSERT INTO metas (user_id, nome, meta, realizado, status, periodo, mes, metrica, unidade)
  SELECT uid, 'Novos Clientes', 50, 0, 'no-prazo', 'Mensal', m0, 'novos_leads', 'numero'
  WHERE NOT EXISTS (SELECT 1 FROM metas WHERE user_id = uid AND nome = 'Novos Clientes' AND mes = m0);

  INSERT INTO metas (user_id, nome, meta, realizado, status, periodo, mes, metrica, unidade)
  SELECT uid, 'Deals fechados', 8, 0, 'no-prazo', 'Mensal', m0, 'deals_ganhos', 'numero'
  WHERE NOT EXISTS (SELECT 1 FROM metas WHERE user_id = uid AND nome = 'Deals fechados' AND mes = m0);

  INSERT INTO metas (user_id, nome, meta, realizado, status, periodo, mes, metrica, unidade)
  SELECT uid, 'Win rate', 60, 0, 'no-prazo', 'Mensal', m0, 'win_rate', 'percentual'
  WHERE NOT EXISTS (SELECT 1 FROM metas WHERE user_id = uid AND nome = 'Win rate' AND mes = m0);

  INSERT INTO metas (user_id, nome, meta, realizado, status, periodo, mes, metrica, unidade)
  SELECT uid, 'Atendimento manual', 40, 22, 'no-prazo', 'Mensal', m0, 'manual', 'numero'
  WHERE NOT EXISTS (SELECT 1 FROM metas WHERE user_id = uid AND nome = 'Atendimento manual' AND mes = m0);

  -- ==========================================================================
  -- PROGRESSO SEMANAL (4 semanas)
  -- ==========================================================================
  INSERT INTO progresso_semanal (user_id, semana, atingido, meta) VALUES
    (uid, (DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '3 weeks')::date, 15, 25),
    (uid, (DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '2 weeks')::date, 28, 25),
    (uid, (DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 week')::date, 31, 25),
    (uid, DATE_TRUNC('week', CURRENT_DATE)::date, 38, 25)
  ON CONFLICT (user_id, semana) DO NOTHING;

  -- ==========================================================================
  -- TICKETS (CS)
  -- ==========================================================================
  INSERT INTO tickets (user_id, ticketid, contato_id, cliente, assunto, prioridade, status, tempo_resposta)
  SELECT uid, 'TK-2451', c.id, 'Acme Corp', 'Erro na integração', 'alta', 'aberto', '2h 15m'
  FROM contatos c WHERE c.user_id = uid AND c.email = 'joao@example.com'
  AND NOT EXISTS (SELECT 1 FROM tickets WHERE user_id = uid AND ticketid = 'TK-2451');

  INSERT INTO tickets (user_id, ticketid, contato_id, cliente, assunto, prioridade, status, tempo_resposta)
  SELECT uid, 'TK-2450', c.id, 'TechStart', 'Fatura em duplicata', 'média', 'aberto', '1h 30m'
  FROM contatos c WHERE c.user_id = uid AND c.email = 'maria@example.com'
  AND NOT EXISTS (SELECT 1 FROM tickets WHERE user_id = uid AND ticketid = 'TK-2450');

  INSERT INTO tickets (user_id, ticketid, contato_id, cliente, assunto, prioridade, status, tempo_resposta)
  SELECT uid, 'TK-2449', c.id, 'WebFlow', 'Reset de senha', 'baixa', 'resolvido', '45m'
  FROM contatos c WHERE c.user_id = uid AND c.email = 'pedro@example.com'
  AND NOT EXISTS (SELECT 1 FROM tickets WHERE user_id = uid AND ticketid = 'TK-2449');

  INSERT INTO tickets (user_id, ticketid, contato_id, cliente, assunto, prioridade, status, tempo_resposta)
  SELECT uid, 'TK-2448', c.id, 'CloudSys', 'Dúvida sobre recurso', 'baixa', 'resolvido', '1h 10m'
  FROM contatos c WHERE c.user_id = uid AND c.email = 'ana@example.com'
  AND NOT EXISTS (SELECT 1 FROM tickets WHERE user_id = uid AND ticketid = 'TK-2448');

  INSERT INTO tickets (user_id, ticketid, contato_id, cliente, assunto, prioridade, status, tempo_resposta)
  SELECT uid, 'TK-2447', c.id, 'DataCore', 'Upgrade de plano', 'média', 'aberto', '3h 20m'
  FROM contatos c WHERE c.user_id = uid AND c.email = 'carlos@example.com'
  AND NOT EXISTS (SELECT 1 FROM tickets WHERE user_id = uid AND ticketid = 'TK-2447');

  -- ==========================================================================
  -- SATISFAÇÃO (NPS — 4 semanas)
  -- ==========================================================================
  INSERT INTO satisfacao (user_id, semana, nps, satisfacao) VALUES
    (uid, (DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '3 weeks')::date, 68, 85),
    (uid, (DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '2 weeks')::date, 72, 87),
    (uid, (DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 week')::date, 75, 89),
    (uid, DATE_TRUNC('week', CURRENT_DATE)::date, 78, 91)
  ON CONFLICT (user_id, semana) DO NOTHING;

  RAISE NOTICE 'Seed concluído para o usuário %', uid;
END $$;

-- ============================================================================
-- VERIFICAÇÃO RÁPIDA (opcional)
-- ============================================================================
-- SELECT 'contatos' AS tabela, COUNT(*) FROM contatos
-- UNION ALL SELECT 'customers', COUNT(*) FROM customers
-- UNION ALL SELECT 'subscriptions', COUNT(*) FROM subscriptions
-- UNION ALL SELECT 'tickets', COUNT(*) FROM tickets
-- UNION ALL SELECT 'metas', COUNT(*) FROM metas
-- UNION ALL SELECT 'receitas', COUNT(*) FROM receitas
-- UNION ALL SELECT 'fluxo_caixa', COUNT(*) FROM fluxo_caixa
-- UNION ALL SELECT 'despesas', COUNT(*) FROM despesas
-- UNION ALL SELECT 'progresso_semanal', COUNT(*) FROM progresso_semanal
-- UNION ALL SELECT 'satisfacao', COUNT(*) FROM satisfacao;
-- ============================================================================
