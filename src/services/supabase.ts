/**
 * RAVO OS — Supabase Client
 *
 * A URL e a chave ANON vêm OBRIGATORIAMENTE de variáveis de ambiente
 * (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). A validação acontece no
 * vite.config.ts (fail-fast no build/dev): sem elas o app não compila — isso
 * impede que um deploy aponte silenciosamente para um projeto errado ou que
 * credenciais fiquem gravadas no repositório.
 *
 * As chaves anon são públicas por design (vão no bundle de qualquer forma);
 * a segurança real vem do Row Level Security (RLS) no banco.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !key) {
  throw new Error(
    'RAVO OS: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias. ' +
      'Copie .env.example para .env.local e preencha com as credenciais do seu projeto Supabase.'
  );
}

export const supabase: SupabaseClient = createClient(url, key);
export { supabase as sb };
