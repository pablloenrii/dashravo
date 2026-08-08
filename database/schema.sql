-- ============================================================================
-- RAVO OS — SCHEMA CONSOLIDADO (tabelas + RPCs + RLS)
-- ============================================================================
-- Substitui os arquivos antigos: supabase-migrations.sql,
-- RLS_POLICIES_CRITICAL.sql e INSERT_TEST_DATA_FIXED.sql.
--
-- Como usar:
--   1. Supabase Dashboard → SQL Editor → New Query
--   2. Cole TODO este arquivo e clique em Run (é idempotente, pode rodar de novo)
--   3. Dados de teste: rode database/seed.sql
--
-- Nota: ao contrário dos arquivos antigos, este schema cobre TUDO que o app
-- consome hoje: as tabelas customers/subscriptions, as colunas incrementais
-- (contatos.origem, metas.mes/metrica/unidade, etc.) e as 4 RPCs do Dashboard
-- (get_mrr_by_month, get_churn_rate, get_sales_funnel, get_customer_metrics).
-- ============================================================================

-- ============================================================================
-- 1. TABELAS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- CONTATOS (CRM) — pipeline de vendas
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contatos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  nome VARCHAR(255) NOT NULL,
  empresa VARCHAR(255),
  email VARCHAR(255),
  telefone VARCHAR(20),
  etapa VARCHAR(50) NOT NULL DEFAULT 'Contatado',
  valor DECIMAL(12, 2) DEFAULT 0,
  origem VARCHAR(100),
  motivo VARCHAR(500),
  data_prevista DATE,
  receita_integrada DECIMAL(12, 2) DEFAULT 0,
  data_contato TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contatos_user_id ON contatos(user_id);
CREATE INDEX IF NOT EXISTS idx_contatos_etapa ON contatos(etapa);

-- Upgrade incremental para bancos que já existiam antes (idempotente)
ALTER TABLE contatos ADD COLUMN IF NOT EXISTS origem VARCHAR(100);
ALTER TABLE contatos ADD COLUMN IF NOT EXISTS motivo VARCHAR(500);
ALTER TABLE contatos ADD COLUMN IF NOT EXISTS data_prevista DATE;
ALTER TABLE contatos ADD COLUMN IF NOT EXISTS receita_integrada DECIMAL(12, 2) DEFAULT 0;

-- ----------------------------------------------------------------------------
-- CUSTOMERS — clientes ativos (alimenta MRR/ARR, churn, LTV/CAC do Dashboard)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  company VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  source VARCHAR(50),
  custo_aquisicao DECIMAL(12, 2) DEFAULT 0,
  churned_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
-- Idempotência por e-mail (usada na integração deal "Ganho" → Dashboard)
CREATE UNIQUE INDEX IF NOT EXISTS uq_customers_user_email ON customers(user_id, email) WHERE email IS NOT NULL;

-- ----------------------------------------------------------------------------
-- SUBSCRIPTIONS — planos/MRR por cliente (alimenta MRR/ARR do Dashboard)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  mrr DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ----------------------------------------------------------------------------
-- TICKETS (Customer Success)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  ticketid VARCHAR(20) UNIQUE NOT NULL,
  contato_id UUID REFERENCES contatos(id) ON DELETE SET NULL,
  cliente VARCHAR(255) NOT NULL,
  assunto VARCHAR(500) NOT NULL,
  prioridade VARCHAR(20) DEFAULT 'média',
  status VARCHAR(50) DEFAULT 'aberto',
  tempo_resposta VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_prioridade ON tickets(prioridade);

-- Upgrade incremental
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS contato_id UUID REFERENCES contatos(id) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- METAS (Goals) — com métrica/unidade/mês usados pelo GoalsPage
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS metas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  nome VARCHAR(255) NOT NULL,
  meta DECIMAL(12, 2) NOT NULL,
  realizado DECIMAL(12, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'no-prazo',
  periodo VARCHAR(50),
  mes DATE NOT NULL DEFAULT (DATE_TRUNC('month', CURRENT_DATE))::DATE,
  metrica VARCHAR(50) DEFAULT 'manual',
  unidade VARCHAR(20) DEFAULT 'numero',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metas_user_id ON metas(user_id);
CREATE INDEX IF NOT EXISTS idx_metas_status ON metas(status);
CREATE INDEX IF NOT EXISTS idx_metas_mes ON metas(user_id, mes);

-- Upgrade incremental
ALTER TABLE metas ADD COLUMN IF NOT EXISTS mes DATE DEFAULT (DATE_TRUNC('month', CURRENT_DATE))::DATE;
ALTER TABLE metas ADD COLUMN IF NOT EXISTS metrica VARCHAR(50) DEFAULT 'manual';
ALTER TABLE metas ADD COLUMN IF NOT EXISTS unidade VARCHAR(20) DEFAULT 'numero';

-- ----------------------------------------------------------------------------
-- RECEITAS (Financeiro)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS receitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  mes DATE NOT NULL,
  receita DECIMAL(12, 2) NOT NULL,
  despesa DECIMAL(12, 2) NOT NULL,
  lucro DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, mes)
);

CREATE INDEX IF NOT EXISTS idx_receitas_user_id ON receitas(user_id);
CREATE INDEX IF NOT EXISTS idx_receitas_mes ON receitas(mes);

-- ----------------------------------------------------------------------------
-- FLUXO DE CAIXA (Financeiro)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fluxo_caixa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  semana DATE NOT NULL,
  entradas DECIMAL(12, 2) NOT NULL,
  saidas DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, semana)
);

CREATE INDEX IF NOT EXISTS idx_fluxo_user_id ON fluxo_caixa(user_id);

-- ----------------------------------------------------------------------------
-- DESPESAS (Financeiro)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS despesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  valor DECIMAL(12, 2) NOT NULL,
  mes DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_despesas_user_id ON despesas(user_id);
CREATE INDEX IF NOT EXISTS idx_despesas_categoria ON despesas(categoria);

-- ----------------------------------------------------------------------------
-- PROGRESSO SEMANAL (Goals)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS progresso_semanal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  semana DATE NOT NULL,
  atingido INTEGER NOT NULL DEFAULT 0,
  meta INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, semana)
);

CREATE INDEX IF NOT EXISTS idx_progresso_user_id ON progresso_semanal(user_id);

-- ----------------------------------------------------------------------------
-- SATISFAÇÃO (Customer Success — NPS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS satisfacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  semana DATE NOT NULL,
  nps INTEGER NOT NULL,
  satisfacao INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, semana)
);

CREATE INDEX IF NOT EXISTS idx_satisfacao_user_id ON satisfacao(user_id);

-- ============================================================================
-- 2. FUNÇÕES RPC
-- ============================================================================

-- ----------------------------------------------------------------------------
-- CRM: contatos novos e ativos por mês
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_contacts_by_month(months_back INT DEFAULT 6)
RETURNS TABLE(
  mes TEXT,
  novos BIGINT,
  ativos BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH months AS (
    SELECT DATE_TRUNC('month', NOW() - INTERVAL '1 month' * generate_series(0, months_back - 1))::DATE as month_start
  )
  SELECT
    TO_CHAR(m.month_start, 'Mon') as mes,
    COUNT(CASE WHEN c.created_at >= m.month_start AND c.created_at < m.month_start + INTERVAL '1 month' THEN 1 END) as novos,
    COUNT(CASE WHEN c.created_at < m.month_start + INTERVAL '1 month' THEN 1 END) as ativos
  FROM months m
  LEFT JOIN contatos c ON c.user_id = auth.uid()
  GROUP BY m.month_start
  ORDER BY m.month_start DESC;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- CRM: oportunidades por etapa
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_opportunities_by_stage()
RETURNS TABLE(
  estagio TEXT,
  quantidade BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    etapa as estagio,
    COUNT(*) as quantidade
  FROM contatos
  WHERE user_id = auth.uid()
  GROUP BY etapa
  ORDER BY quantidade DESC;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Dashboard: funil de vendas (estágio, quantidade e % em relação ao topo)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_sales_funnel()
RETURNS TABLE(
  estagio TEXT,
  quantidade BIGINT,
  conversao NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH contagem AS (
    SELECT c.etapa, COUNT(*)::BIGINT AS quantidade
    FROM contatos c
    WHERE c.user_id = auth.uid()
    GROUP BY c.etapa
  ),
  topo AS (
    SELECT MAX(quantidade)::NUMERIC AS base FROM contagem
  )
  SELECT c.etapa,
         c.quantidade,
         CASE WHEN t.base > 0 THEN ROUND((c.quantidade / t.base * 100)::NUMERIC, 1) ELSE 0 END AS conversao
  FROM contagem c
  CROSS JOIN topo t
  ORDER BY c.quantidade DESC;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Financeiro: receita vs despesa por mês
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_revenue_by_month(months_back INT DEFAULT 6, ref_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
  mes TEXT,
  receita DECIMAL,
  despesa DECIMAL,
  lucro DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(r.mes, 'Mon') as mes,
    r.receita,
    r.despesa,
    r.lucro
  FROM receitas r
  WHERE r.user_id = auth.uid()
    AND r.mes >= DATE_TRUNC('month', ref_month)::DATE - INTERVAL '1 month' * months_back
    AND r.mes <= DATE_TRUNC('month', ref_month)::DATE
  ORDER BY r.mes ASC
  LIMIT months_back;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Financeiro: fluxo de caixa semanal
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_cash_flow_by_week(weeks_back INT DEFAULT 4)
RETURNS TABLE(
  semana TEXT,
  entradas DECIMAL,
  saidas DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'Sem ' || ROW_NUMBER() OVER (ORDER BY f.semana DESC)::TEXT as semana,
    f.entradas,
    f.saidas
  FROM fluxo_caixa f
  WHERE f.user_id = auth.uid()
    AND f.semana >= NOW()::DATE - INTERVAL '1 week' * weeks_back
  ORDER BY f.semana DESC
  LIMIT weeks_back;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Financeiro: despesas por categoria (mês atual)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_expenses_by_category()
RETURNS TABLE(
  categoria VARCHAR,
  valor DECIMAL,
  percentual DECIMAL
) AS $$
DECLARE
  total_despesas DECIMAL;
BEGIN
  SELECT SUM(d.valor) INTO total_despesas
  FROM despesas d
  WHERE d.user_id = auth.uid()
    AND d.mes >= DATE_TRUNC('month', NOW())::DATE;

  RETURN QUERY
  SELECT
    d.categoria,
    SUM(d.valor) as valor,
    CASE WHEN total_despesas > 0
      THEN ROUND((SUM(d.valor) / total_despesas * 100)::NUMERIC, 2)
      ELSE 0
    END as percentual
  FROM despesas d
  WHERE d.user_id = auth.uid()
    AND d.mes >= DATE_TRUNC('month', NOW())::DATE
  GROUP BY d.categoria
  ORDER BY SUM(d.valor) DESC;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Metas: progresso semanal
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_goal_progress_by_week(weeks_back INT DEFAULT 4)
RETURNS TABLE(
  semana TEXT,
  atingido INTEGER,
  meta INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'Sem ' || ROW_NUMBER() OVER (ORDER BY p.semana DESC)::TEXT as semana,
    p.atingido,
    p.meta
  FROM progresso_semanal p
  WHERE p.user_id = auth.uid()
    AND p.semana >= NOW()::DATE - INTERVAL '1 week' * weeks_back
  ORDER BY p.semana DESC
  LIMIT weeks_back;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- CS: atendimentos por dia
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_attendance_by_day(days_back INT DEFAULT 5)
RETURNS TABLE(
  dia TEXT,
  recebidos BIGINT,
  resolvidos BIGINT,
  pendentes BIGINT
) AS $$
DECLARE
  dias_semana TEXT[] := ARRAY['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
BEGIN
  RETURN QUERY
  WITH dates AS (
    SELECT DATE_TRUNC('day', NOW() - INTERVAL '1 day' * generate_series(0, days_back - 1))::DATE as day_date
  )
  SELECT
    dias_semana[EXTRACT(ISODOW FROM d.day_date)::INT] as dia,
    COUNT(CASE WHEN t.created_at::DATE = d.day_date THEN 1 END) as recebidos,
    COUNT(CASE WHEN t.created_at::DATE = d.day_date AND t.status = 'resolvido' THEN 1 END) as resolvidos,
    COUNT(CASE WHEN t.created_at::DATE = d.day_date AND t.status = 'aberto' THEN 1 END) as pendentes
  FROM dates d
  LEFT JOIN tickets t ON t.user_id = auth.uid()
  GROUP BY d.day_date
  ORDER BY d.day_date DESC;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- CS: satisfação (NPS) por semana
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_satisfaction_by_week(weeks_back INT DEFAULT 4)
RETURNS TABLE(
  semana TEXT,
  nps INTEGER,
  satisfacao INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'Sem ' || ROW_NUMBER() OVER (ORDER BY s.semana DESC)::TEXT as semana,
    s.nps,
    s.satisfacao
  FROM satisfacao s
  WHERE s.user_id = auth.uid()
    AND s.semana >= NOW()::DATE - INTERVAL '1 week' * weeks_back
  ORDER BY s.semana DESC
  LIMIT weeks_back;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Dashboard: MRR e ARR por mês
-- Running-total das subscriptions ativas (por mês de created_at), respeitando
-- churn: uma sub deixou de contar no mês seguinte ao churn do cliente.
-- ARR = MRR × 12.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_mrr_by_month(months_back INT DEFAULT 6, ref_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
  mes TEXT,
  mrr NUMERIC,
  arr NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH months AS (
    SELECT (DATE_TRUNC('month', ref_month) - INTERVAL '1 month' * gs)::DATE AS month_start
    FROM generate_series(0, months_back - 1) AS gs
  )
  SELECT TO_CHAR(m.month_start, 'Mon') AS mes,
         COALESCE(SUM(s.mrr), 0) AS mrr,
         COALESCE(SUM(s.mrr), 0) * 12 AS arr
  FROM months m
  LEFT JOIN subscriptions s
    ON s.status = 'active'
    AND s.created_at < m.month_start + INTERVAL '1 month'
    AND EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = s.customer_id
        AND c.user_id = auth.uid()
        AND (c.churned_at IS NULL OR c.churned_at >= m.month_start + INTERVAL '1 month')
    )
  GROUP BY m.month_start
  ORDER BY m.month_start ASC;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Dashboard: churn rate e NRR por mês
-- Churn mensal = clientes com churned_at no mês / ativos no início do mês.
-- NRR é aproximado como 100% − churn (não há dados de expansão/contração).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_churn_rate(months_back INT DEFAULT 6, ref_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
  mes TEXT,
  churn_rate NUMERIC,
  nrr NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH months AS (
    SELECT (DATE_TRUNC('month', ref_month) - INTERVAL '1 month' * gs)::DATE AS month_start
    FROM generate_series(0, months_back - 1) AS gs
  ),
  base AS (
    SELECT m.month_start,
           COUNT(c.id)::NUMERIC AS ativos
    FROM months m
    LEFT JOIN customers c
      ON c.user_id = auth.uid()
      AND c.created_at < m.month_start + INTERVAL '1 month'
      AND (c.churned_at IS NULL OR c.churned_at >= m.month_start)
    GROUP BY m.month_start
  ),
  churnados AS (
    SELECT m.month_start,
           COUNT(c.id)::NUMERIC AS total
    FROM months m
    LEFT JOIN customers c
      ON c.user_id = auth.uid()
      AND c.churned_at >= m.month_start
      AND c.churned_at < m.month_start + INTERVAL '1 month'
    GROUP BY m.month_start
  )
  SELECT TO_CHAR(m.month_start, 'Mon') AS mes,
         CASE WHEN b.ativos > 0 THEN ROUND((ch.total / b.ativos * 100)::NUMERIC, 2) ELSE 0 END AS churn_rate,
         CASE WHEN b.ativos > 0 THEN ROUND((100 - ch.total / b.ativos * 100)::NUMERIC, 2) ELSE 100 END AS nrr
  FROM months m
  LEFT JOIN base b USING (month_start)
  LEFT JOIN churnados ch USING (month_start)
  ORDER BY m.month_start ASC;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Dashboard: métricas agregadas de clientes
-- Retorna linhas {metric_name, value}: Active Customers, MRR Total, CAC, LTV.
-- LTV = (MRR Total / ativos) × (100 / churn%) — fórmula SaaS padrão.
-- Com `ref_month`, os valores são "ao fim do mês de referência" (mesma semântica
-- do get_mrr_by_month): um cliente churnado depois do ref ainda conta como ativo.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_customer_metrics(ref_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
  metric_name TEXT,
  value NUMERIC
) AS $$
DECLARE
  inicio DATE; -- primeiro dia do mês de referência
  fim DATE;    -- primeiro dia do mês seguinte ao ref (corte de "ativo ao fim do mês")
  ativos INT;
  mrr_total NUMERIC;
  churn_pct NUMERIC;
  cac NUMERIC;
  ltv NUMERIC;
BEGIN
  inicio := DATE_TRUNC('month', ref_month)::DATE;
  fim := (DATE_TRUNC('month', ref_month) + INTERVAL '1 month')::DATE;

  SELECT COUNT(*) INTO ativos
  FROM customers
  WHERE user_id = auth.uid()
    AND created_at < fim
    AND (churned_at IS NULL OR churned_at >= fim);

  SELECT COALESCE(SUM(s.mrr), 0) INTO mrr_total
  FROM subscriptions s
  JOIN customers c ON c.id = s.customer_id
  WHERE c.user_id = auth.uid()
    AND s.status = 'active'
    AND s.created_at < fim
    AND (c.churned_at IS NULL OR c.churned_at >= fim);

  -- Churn do mês de referência: churnados no mês / ativos no início do mês
  WITH base AS (
    SELECT COUNT(*)::NUMERIC AS ativos_inicio
    FROM customers c
    WHERE c.user_id = auth.uid()
      AND c.created_at < fim
      AND (c.churned_at IS NULL OR c.churned_at >= inicio)
  ),
  ch AS (
    SELECT COUNT(*)::NUMERIC AS total
    FROM customers c
    WHERE c.user_id = auth.uid()
      AND c.churned_at >= inicio
      AND c.churned_at < fim
  )
  SELECT CASE WHEN b.ativos_inicio > 0 THEN ROUND((ch.total / b.ativos_inicio * 100)::NUMERIC, 2) ELSE 0 END
  INTO churn_pct
  FROM base b CROSS JOIN ch;

  SELECT COALESCE(AVG(custo_aquisicao), 0) INTO cac
  FROM customers
  WHERE user_id = auth.uid()
    AND custo_aquisicao > 0
    AND created_at < fim
    AND (churned_at IS NULL OR churned_at >= fim);

  IF ativos > 0 AND mrr_total > 0 AND COALESCE(churn_pct, 0) > 0 THEN
    ltv := ROUND((mrr_total / ativos) * (100.0 / churn_pct), 2);
  ELSE
    ltv := 0;
  END IF;

  RETURN QUERY
    SELECT 'Active Customers', ativos::NUMERIC
    UNION ALL SELECT 'MRR Total', mrr_total
    UNION ALL SELECT 'CAC', ROUND(cac, 2)
    UNION ALL SELECT 'LTV', COALESCE(ltv, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Cada tabela: ENABLE + 4 políticas (SELECT/INSERT/UPDATE/DELETE).
-- Nomes canônicos próprios da RAVO; políticas antigas são removidas para que o
-- arquivo seja idempotente mesmo em bancos que já tinham as versões antigas.

-- ----------------------------------------------------------------------------
-- CONTATOS
-- ----------------------------------------------------------------------------
ALTER TABLE contatos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own contacts" ON contatos;
DROP POLICY IF EXISTS "Users can insert their own contacts" ON contatos;
DROP POLICY IF EXISTS "Users can update their own contacts" ON contatos;
DROP POLICY IF EXISTS "contatos: SELECT own" ON contatos;
DROP POLICY IF EXISTS "contatos: INSERT own" ON contatos;
DROP POLICY IF EXISTS "contatos: UPDATE own" ON contatos;
DROP POLICY IF EXISTS "contatos: DELETE own" ON contatos;
CREATE POLICY "contatos: SELECT own" ON contatos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "contatos: INSERT own" ON contatos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "contatos: UPDATE own" ON contatos FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "contatos: DELETE own" ON contatos FOR DELETE USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- CUSTOMERS
-- ----------------------------------------------------------------------------
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "customers: SELECT own" ON customers;
DROP POLICY IF EXISTS "customers: INSERT own" ON customers;
DROP POLICY IF EXISTS "customers: UPDATE own" ON customers;
DROP POLICY IF EXISTS "customers: DELETE own" ON customers;
CREATE POLICY "customers: SELECT own" ON customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "customers: INSERT own" ON customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "customers: UPDATE own" ON customers FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "customers: DELETE own" ON customers FOR DELETE USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- SUBSCRIPTIONS — não tem user_id; acesso via customers (subquery)
-- ----------------------------------------------------------------------------
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "subscriptions: SELECT own" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions: INSERT own" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions: UPDATE own" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions: DELETE own" ON subscriptions;
CREATE POLICY "subscriptions: SELECT own" ON subscriptions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = customer_id AND c.user_id = auth.uid())
  );
CREATE POLICY "subscriptions: INSERT own" ON subscriptions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = customer_id AND c.user_id = auth.uid())
  );
CREATE POLICY "subscriptions: UPDATE own" ON subscriptions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = customer_id AND c.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = customer_id AND c.user_id = auth.uid())
  );
CREATE POLICY "subscriptions: DELETE own" ON subscriptions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = customer_id AND c.user_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- TICKETS
-- ----------------------------------------------------------------------------
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can insert their own tickets" ON tickets;
DROP POLICY IF EXISTS "tickets: SELECT own" ON tickets;
DROP POLICY IF EXISTS "tickets: INSERT own" ON tickets;
DROP POLICY IF EXISTS "tickets: UPDATE own" ON tickets;
DROP POLICY IF EXISTS "tickets: DELETE own" ON tickets;
CREATE POLICY "tickets: SELECT own" ON tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tickets: INSERT own" ON tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tickets: UPDATE own" ON tickets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tickets: DELETE own" ON tickets FOR DELETE USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- METAS
-- ----------------------------------------------------------------------------
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own goals" ON metas;
DROP POLICY IF EXISTS "Users can insert their own goals" ON metas;
DROP POLICY IF EXISTS "metas: SELECT own" ON metas;
DROP POLICY IF EXISTS "metas: INSERT own" ON metas;
DROP POLICY IF EXISTS "metas: UPDATE own" ON metas;
DROP POLICY IF EXISTS "metas: DELETE own" ON metas;
CREATE POLICY "metas: SELECT own" ON metas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "metas: INSERT own" ON metas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "metas: UPDATE own" ON metas FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "metas: DELETE own" ON metas FOR DELETE USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- RECEITAS
-- ----------------------------------------------------------------------------
ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own finance data" ON receitas;
DROP POLICY IF EXISTS "Receitas: SELECT own data" ON receitas;
DROP POLICY IF EXISTS "Receitas: INSERT own data" ON receitas;
DROP POLICY IF EXISTS "Receitas: UPDATE own data" ON receitas;
DROP POLICY IF EXISTS "Receitas: DELETE own data" ON receitas;
DROP POLICY IF EXISTS "receitas: SELECT own" ON receitas;
DROP POLICY IF EXISTS "receitas: INSERT own" ON receitas;
DROP POLICY IF EXISTS "receitas: UPDATE own" ON receitas;
DROP POLICY IF EXISTS "receitas: DELETE own" ON receitas;
CREATE POLICY "receitas: SELECT own" ON receitas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "receitas: INSERT own" ON receitas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "receitas: UPDATE own" ON receitas FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "receitas: DELETE own" ON receitas FOR DELETE USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- FLUXO DE CAIXA
-- ----------------------------------------------------------------------------
ALTER TABLE fluxo_caixa ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their cash flow" ON fluxo_caixa;
DROP POLICY IF EXISTS "Fluxo Caixa: SELECT own data" ON fluxo_caixa;
DROP POLICY IF EXISTS "Fluxo Caixa: INSERT own data" ON fluxo_caixa;
DROP POLICY IF EXISTS "Fluxo Caixa: UPDATE own data" ON fluxo_caixa;
DROP POLICY IF EXISTS "Fluxo Caixa: DELETE own data" ON fluxo_caixa;
DROP POLICY IF EXISTS "fluxo_caixa: SELECT own" ON fluxo_caixa;
DROP POLICY IF EXISTS "fluxo_caixa: INSERT own" ON fluxo_caixa;
DROP POLICY IF EXISTS "fluxo_caixa: UPDATE own" ON fluxo_caixa;
DROP POLICY IF EXISTS "fluxo_caixa: DELETE own" ON fluxo_caixa;
CREATE POLICY "fluxo_caixa: SELECT own" ON fluxo_caixa FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "fluxo_caixa: INSERT own" ON fluxo_caixa FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fluxo_caixa: UPDATE own" ON fluxo_caixa FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fluxo_caixa: DELETE own" ON fluxo_caixa FOR DELETE USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- DESPESAS
-- ----------------------------------------------------------------------------
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their expenses" ON despesas;
DROP POLICY IF EXISTS "Despesas: SELECT own data" ON despesas;
DROP POLICY IF EXISTS "Despesas: INSERT own data" ON despesas;
DROP POLICY IF EXISTS "Despesas: UPDATE own data" ON despesas;
DROP POLICY IF EXISTS "Despesas: DELETE own data" ON despesas;
DROP POLICY IF EXISTS "despesas: SELECT own" ON despesas;
DROP POLICY IF EXISTS "despesas: INSERT own" ON despesas;
DROP POLICY IF EXISTS "despesas: UPDATE own" ON despesas;
DROP POLICY IF EXISTS "despesas: DELETE own" ON despesas;
CREATE POLICY "despesas: SELECT own" ON despesas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "despesas: INSERT own" ON despesas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "despesas: UPDATE own" ON despesas FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "despesas: DELETE own" ON despesas FOR DELETE USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- PROGRESSO SEMANAL
-- ----------------------------------------------------------------------------
ALTER TABLE progresso_semanal ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their progress" ON progresso_semanal;
DROP POLICY IF EXISTS "progresso_semanal: SELECT own" ON progresso_semanal;
DROP POLICY IF EXISTS "progresso_semanal: INSERT own" ON progresso_semanal;
DROP POLICY IF EXISTS "progresso_semanal: UPDATE own" ON progresso_semanal;
DROP POLICY IF EXISTS "progresso_semanal: DELETE own" ON progresso_semanal;
CREATE POLICY "progresso_semanal: SELECT own" ON progresso_semanal FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "progresso_semanal: INSERT own" ON progresso_semanal FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "progresso_semanal: UPDATE own" ON progresso_semanal FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "progresso_semanal: DELETE own" ON progresso_semanal FOR DELETE USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- SATISFAÇÃO
-- ----------------------------------------------------------------------------
ALTER TABLE satisfacao ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their satisfaction data" ON satisfacao;
DROP POLICY IF EXISTS "Satisfacao: SELECT own data" ON satisfacao;
DROP POLICY IF EXISTS "Satisfacao: INSERT own data" ON satisfacao;
DROP POLICY IF EXISTS "Satisfacao: UPDATE own data" ON satisfacao;
DROP POLICY IF EXISTS "Satisfacao: DELETE own data" ON satisfacao;
DROP POLICY IF EXISTS "satisfacao: SELECT own" ON satisfacao;
DROP POLICY IF EXISTS "satisfacao: INSERT own" ON satisfacao;
DROP POLICY IF EXISTS "satisfacao: UPDATE own" ON satisfacao;
DROP POLICY IF EXISTS "satisfacao: DELETE own" ON satisfacao;
CREATE POLICY "satisfacao: SELECT own" ON satisfacao FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "satisfacao: INSERT own" ON satisfacao FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "satisfacao: UPDATE own" ON satisfacao FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "satisfacao: DELETE own" ON satisfacao FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 4. VERIFICAÇÃO
-- ============================================================================
-- Listar tabelas com RLS ativo:
--   SELECT tablename, rowsecurity FROM pg_tables
--   WHERE schemaname = 'public' ORDER BY tablename;
--
-- Listar políticas:
--   SELECT tablename, policyname FROM pg_policies
--   WHERE schemaname = 'public' ORDER BY tablename, policyname;
--
-- Listar funções RPC:
--   SELECT routine_name FROM information_schema.routines
--   WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
--   ORDER BY routine_name;
-- ============================================================================
-- FIM DO SCHEMA CONSOLIDADO
-- ============================================================================
