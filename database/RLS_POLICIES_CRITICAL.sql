-- ============================================================================
-- RLS CRITICAL POLICIES - RECEITAS, FLUXO_CAIXA, DESPESAS, METAS, SATISFACAO
-- ============================================================================
-- CRÍTICO: Adicione DELETE e UPDATE policies para maior segurança
-- Execute este arquivo no Supabase SQL Editor

-- ============================================================================
-- 1. TABELA: RECEITAS
-- ============================================================================

-- DELETE Policy - Receitas
DROP POLICY IF EXISTS "Receitas: DELETE own data" ON receitas;
CREATE POLICY "Receitas: DELETE own data" ON receitas
  FOR DELETE
  USING (auth.uid() = user_id);

-- UPDATE Policy - Receitas
DROP POLICY IF EXISTS "Receitas: UPDATE own data" ON receitas;
CREATE POLICY "Receitas: UPDATE own data" ON receitas
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- SELECT Policy - Receitas (se não existir)
DROP POLICY IF EXISTS "Receitas: SELECT own data" ON receitas;
CREATE POLICY "Receitas: SELECT own data" ON receitas
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT Policy - Receitas (se não existir)
DROP POLICY IF EXISTS "Receitas: INSERT own data" ON receitas;
CREATE POLICY "Receitas: INSERT own data" ON receitas
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 2. TABELA: FLUXO_CAIXA
-- ============================================================================

-- DELETE Policy - Fluxo Caixa
DROP POLICY IF EXISTS "Fluxo Caixa: DELETE own data" ON fluxo_caixa;
CREATE POLICY "Fluxo Caixa: DELETE own data" ON fluxo_caixa
  FOR DELETE
  USING (auth.uid() = user_id);

-- UPDATE Policy - Fluxo Caixa
DROP POLICY IF EXISTS "Fluxo Caixa: UPDATE own data" ON fluxo_caixa;
CREATE POLICY "Fluxo Caixa: UPDATE own data" ON fluxo_caixa
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- SELECT Policy - Fluxo Caixa (se não existir)
DROP POLICY IF EXISTS "Fluxo Caixa: SELECT own data" ON fluxo_caixa;
CREATE POLICY "Fluxo Caixa: SELECT own data" ON fluxo_caixa
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT Policy - Fluxo Caixa (se não existir)
DROP POLICY IF EXISTS "Fluxo Caixa: INSERT own data" ON fluxo_caixa;
CREATE POLICY "Fluxo Caixa: INSERT own data" ON fluxo_caixa
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 3. TABELA: DESPESAS
-- ============================================================================

-- DELETE Policy - Despesas
DROP POLICY IF EXISTS "Despesas: DELETE own data" ON despesas;
CREATE POLICY "Despesas: DELETE own data" ON despesas
  FOR DELETE
  USING (auth.uid() = user_id);

-- UPDATE Policy - Despesas
DROP POLICY IF EXISTS "Despesas: UPDATE own data" ON despesas;
CREATE POLICY "Despesas: UPDATE own data" ON despesas
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- SELECT Policy - Despesas (se não existir)
DROP POLICY IF EXISTS "Despesas: SELECT own data" ON despesas;
CREATE POLICY "Despesas: SELECT own data" ON despesas
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT Policy - Despesas (se não existir)
DROP POLICY IF EXISTS "Despesas: INSERT own data" ON despesas;
CREATE POLICY "Despesas: INSERT own data" ON despesas
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 4. TABELA: METAS
-- ============================================================================

-- DELETE Policy - Metas
DROP POLICY IF EXISTS "Metas: DELETE own data" ON metas;
CREATE POLICY "Metas: DELETE own data" ON metas
  FOR DELETE
  USING (auth.uid() = user_id);

-- UPDATE Policy - Metas
DROP POLICY IF EXISTS "Metas: UPDATE own data" ON metas;
CREATE POLICY "Metas: UPDATE own data" ON metas
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- SELECT Policy - Metas (se não existir)
DROP POLICY IF EXISTS "Metas: SELECT own data" ON metas;
CREATE POLICY "Metas: SELECT own data" ON metas
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT Policy - Metas (se não existir)
DROP POLICY IF EXISTS "Metas: INSERT own data" ON metas;
CREATE POLICY "Metas: INSERT own data" ON metas
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 5. TABELA: SATISFACAO
-- ============================================================================

-- DELETE Policy - Satisfacao
DROP POLICY IF EXISTS "Satisfacao: DELETE own data" ON satisfacao;
CREATE POLICY "Satisfacao: DELETE own data" ON satisfacao
  FOR DELETE
  USING (auth.uid() = user_id);

-- UPDATE Policy - Satisfacao
DROP POLICY IF EXISTS "Satisfacao: UPDATE own data" ON satisfacao;
CREATE POLICY "Satisfacao: UPDATE own data" ON satisfacao
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- SELECT Policy - Satisfacao (se não existir)
DROP POLICY IF EXISTS "Satisfacao: SELECT own data" ON satisfacao;
CREATE POLICY "Satisfacao: SELECT own data" ON satisfacao
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT Policy - Satisfacao (se não existir)
DROP POLICY IF EXISTS "Satisfacao: INSERT own data" ON satisfacao;
CREATE POLICY "Satisfacao: INSERT own data" ON satisfacao
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- VALIDAÇÃO FINAL
-- ============================================================================

-- Verificar RLS status de todas as tabelas
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('receitas', 'fluxo_caixa', 'despesas', 'metas', 'satisfacao')
ORDER BY tablename;

-- Listar todas as políticas RLS ativas
SELECT
  schemaname,
  tablename,
  policyname,
  qual as policy_definition
FROM pg_policies
WHERE tablename IN ('receitas', 'fluxo_caixa', 'despesas', 'metas', 'satisfacao')
ORDER BY tablename, policyname;
