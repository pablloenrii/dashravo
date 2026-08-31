/**
 * RAVO OS — Cliente da API (PostgreSQL + PostgREST Self-Hosted)
 *
 * Este arquivo substitui a conexão Supabase Cloud pela sua VPS.
 * Funcionará com qualquer PostgreSQL + PostgREST.
 */

import { createClient } from '@supabase/supabase-js';

/**
 * URL da sua VPS PostgREST
 *
 * Padrão: https://crm.ravocompany.com.br (Nginx com TLS na frente do PostgREST).
 * Importante que seja HTTPS — o app roda publicado em HTTPS (Vercel), e o
 * navegador bloqueia silenciosamente qualquer chamada HTTP feita a partir de
 * uma página HTTPS ("mixed content"), o que aparecia como "Failed to fetch"
 * em toda escrita (criar/editar/mover/deletar lead).
 */
const POSTGREST_URL = import.meta.env.VITE_POSTGREST_URL || 'https://crm.ravocompany.com.br';

/**
 * Chave anônima (não é validada pelo PostgREST, só precisa existir)
 * Pode ser qualquer string, mas deixe um valor padrão
 */
const POSTGREST_KEY = import.meta.env.VITE_POSTGREST_KEY || 'anon-key';

function buildClient(token: string | null) {
  return createClient(POSTGREST_URL, POSTGREST_KEY, {
    // Desabilitar autenticação integrada (usamos login próprio, ver services/auth.ts)
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
        // Com um usuário logado, sobrescreve o Authorization padrão do
        // cliente (Bearer <POSTGREST_KEY>) pelo JWT pessoal emitido pelo
        // RPC `login` — é ele que o PostgREST valida contra o jwt-secret.
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  });
}

/**
 * Cliente Supabase compatível com PostgREST.
 *
 * `sb` é reatribuído (não recriado por import) quando o usuário loga/desloga
 * — como os outros arquivos importam `{ sb }` como binding vivo do ES module,
 * a troca de token feita aqui vale para toda chamada `sb.from(...)` /
 * `sb.rpc(...)` do app a partir desse ponto, sem precisar tocar em mais
 * nenhum arquivo.
 */
export let sb = buildClient(null);

/** Troca o token usado em todas as requisições (chamado por services/auth.ts). */
export function setAuthToken(token: string | null) {
  sb = buildClient(token);
}

// Log de conexão (só em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('✅ RAVO OS — Conectado a PostgREST');
  console.log(`   URL: ${POSTGREST_URL}`);
  console.log(`   Schema: public`);
}

// Verificar se as variáveis estão definidas
if (!POSTGREST_URL) {
  console.warn('⚠️  VITE_POSTGREST_URL não definida! Usando padrão: https://crm.ravocompany.com.br');
}
