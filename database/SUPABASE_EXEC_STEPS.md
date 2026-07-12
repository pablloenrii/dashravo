# Executar Migrations - Passo a Passo

## 🚀 Instruções Rápidas

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá para **SQL Editor** (esquerda)
4. Clique **New Query**
5. Execute cada bloco abaixo **sequencialmente**

---

## PARTE 1️⃣: Criar Tabelas Base

Copie e cole no SQL Editor:

```sql
-- Tabela: CONTATOS (CRM)
CREATE TABLE IF NOT EXISTS contatos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  nome VARCHAR(255) NOT NULL,
  empresa VARCHAR(255),
  email VARCHAR(255),
  telefone VARCHAR(20),
  etapa VARCHAR(50) NOT NULL DEFAULT 'Contatado',
  valor DECIMAL(12, 2) DEFAULT 0,
  data_contato TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contatos_user_id ON contatos(user_id);
CREATE INDEX IF NOT EXISTS idx_contatos_etapa ON contatos(etapa);

-- Tabela: TICKETS (Customer Service)
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  ticketId VARCHAR(20) UNIQUE NOT NULL,
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
```

Clique **Run** ✓

---

## PARTE 2️⃣: Mais Tabelas de Dados

```sql
-- Tabela: METAS (Goals)
CREATE TABLE IF NOT EXISTS metas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  nome VARCHAR(255) NOT NULL,
  meta DECIMAL(12, 2) NOT NULL,
  realizado DECIMAL(12, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'no-prazo',
  periodo VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metas_user_id ON metas(user_id);

-- Tabela: RECEITAS (Finance)
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

-- Tabela: FLUXO DE CAIXA
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
```

Clique **Run** ✓

---

## PARTE 3️⃣: Tabelas Complementares

```sql
-- Tabela: DESPESAS
CREATE TABLE IF NOT EXISTS despesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  valor DECIMAL(12, 2) NOT NULL,
  mes DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_despesas_user_id ON despesas(user_id);

-- Tabela: PROGRESSO SEMANAL
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

-- Tabela: SATISFACAO
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
```

Clique **Run** ✓

---

## PARTE 4️⃣: Ativar RLS (Segurança)

```sql
-- Habilitar Row Level Security
ALTER TABLE contatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE fluxo_caixa ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE progresso_semanal ENABLE ROW LEVEL SECURITY;
ALTER TABLE satisfacao ENABLE ROW LEVEL SECURITY;
```

Clique **Run** ✓

---

## PARTE 5️⃣: Políticas de Segurança (RLS)

```sql
-- Policies para CONTATOS
CREATE POLICY "Users can view their own contacts"
  ON contatos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts"
  ON contatos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON contatos FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies para TICKETS
CREATE POLICY "Users can view their own tickets"
  ON tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tickets"
  ON tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies para METAS
CREATE POLICY "Users can view their own goals"
  ON metas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
  ON metas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies para tabelas financeiras
CREATE POLICY "Users can view their own finance data" ON receitas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their cash flow" ON fluxo_caixa FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their expenses" ON despesas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their progress" ON progresso_semanal FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their satisfaction data" ON satisfacao FOR SELECT USING (auth.uid() = user_id);
```

Clique **Run** ✓

---

## PARTE 6️⃣: Funções SQL (RPC) - Bloco 1

```sql
-- Função: get_contacts_by_month
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

-- Função: get_opportunities_by_stage
CREATE OR REPLACE FUNCTION get_opportunities_by_stage()
RETURNS TABLE(
  estago TEXT,
  quantidade BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    etapa as estago,
    COUNT(*) as quantidade
  FROM contatos
  WHERE user_id = auth.uid()
  GROUP BY etapa
  ORDER BY quantidade DESC;
END;
$$ LANGUAGE plpgsql;
```

Clique **Run** ✓

---

## PARTE 7️⃣: Funções SQL (RPC) - Bloco 2

```sql
-- Função: get_revenue_by_month
CREATE OR REPLACE FUNCTION get_revenue_by_month(months_back INT DEFAULT 6)
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
    AND r.mes >= NOW()::DATE - INTERVAL '1 month' * months_back
  ORDER BY r.mes DESC
  LIMIT months_back;
END;
$$ LANGUAGE plpgsql;

-- Função: get_cash_flow_by_week
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
```

Clique **Run** ✓

---

## PARTE 8️⃣: Funções SQL (RPC) - Bloco 3

```sql
-- Função: get_expenses_by_category
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

-- Função: get_goal_progress_by_week
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
```

Clique **Run** ✓

---

## PARTE 9️⃣: Funções SQL (RPC) - Bloco 4 (Final)

```sql
-- Função: get_attendance_by_day
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

-- Função: get_satisfaction_by_week
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
```

Clique **Run** ✓

---

## ✅ Verificação Final

Execute este comando para verificar se tudo foi criado:

```sql
-- Listar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Listar funções RPC
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

Deve retornar:
- 8 tabelas: contatos, despesas, fluxo_caixa, metas, progresso_semanal, receitas, satisfacao, tickets
- 8 funções: get_attendance_by_day, get_cash_flow_by_week, get_contacts_by_month, etc

---

## 🎉 Pronto!

Todas as tabelas e funções foram criadas. Agora você pode:

1. ✓ Inserir dados de teste
2. ✓ Testar os hooks React
3. ✓ Rodar `npm run dev`

Próximo passo?
