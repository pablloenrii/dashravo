/**
 * RAVO OS — Cliente da API (PostgreSQL + PostgREST Self-Hosted)
 *
 * Este arquivo substitui a conexão Supabase Cloud pela sua VPS.
 * Funcionará com qualquer PostgreSQL + PostgREST.
 */

import { createClient } from '@supabase/supabase-js';

/**
 * URL da sua VPS PostgREST
 * Em desenvolvimento: http://89.117.32.203:8080
 * Em produção: https://seu-dominio.com (com SSL)
 */
const POSTGREST_URL = import.meta.env.VITE_POSTGREST_URL || 'http://89.117.32.203:8080';

/**
 * Chave anônima (não é validada pelo PostgREST, só precisa existir)
 * Pode ser qualquer string, mas deixe um valor padrão
 */
const POSTGREST_KEY = import.meta.env.VITE_POSTGREST_KEY || 'anon-key';

/**
 * Criar cliente Supabase compatível com PostgREST
 * O cliente Supabase funciona com qualquer API que respeite o padrão PostgREST
 */
export const sb = createClient(POSTGREST_URL, POSTGREST_KEY, {
  // Desabilitar autenticação integrada (você pode adicionar depois)
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
  // Configuração do banco
  db: {
    schema: 'public',
  },
  // Configuração de requisições
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },
});

// Log de conexão (só em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('✅ RAVO OS — Conectado a PostgREST');
  console.log(`   URL: ${POSTGREST_URL}`);
  console.log(`   Schema: public`);
}

// Verificar se as variáveis estão definidas
if (!POSTGREST_URL) {
  console.warn('⚠️  VITE_POSTGREST_URL não definida! Usando padrão: http://89.117.32.203:8080');
}