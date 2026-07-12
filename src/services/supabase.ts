/**
 * RAVO OS — Supabase Client
 *
 * A URL e a chave ANON são públicas por design (vão no bundle de qualquer
 * forma; a segurança vem do RLS). Ficam fixas aqui como fonte da verdade —
 * env vars só sobrepõem se apontarem para o MESMO projeto (validação do ref
 * no payload do JWT), o que impede que uma env corrompida/antiga quebre o app.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://zldufaakxgqwvlpfspjt.supabase.co';
const DEFAULT_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsZHVmYWFreGdxd3ZscGZzcGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MDc2NTIsImV4cCI6MjA5ODA4MzY1Mn0.pav0m1IUHswC6Jip5OaPdLOBZWyG5GrQ82UTjMrfiY8';

/** Extrai o ref do projeto do payload do JWT (sem verificar assinatura) */
function jwtRef(key: string): string | null {
  try {
    const payload = JSON.parse(atob(key.split('.')[1]));
    return typeof payload.ref === 'string' ? payload.ref : null;
  } catch {
    return null;
  }
}

/** Extrai o ref do subdomínio da URL do projeto */
function urlRef(url: string): string | null {
  const m = /^https:\/\/([a-z0-9]+)\.supabase\.co$/.exec(url.trim().replace(/\/$/, ''));
  return m ? m[1] : null;
}

function resolveConfig(): { url: string; key: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const ref = urlRef(envUrl);
  // Env só é aceita se URL e chave forem consistentes entre si
  if (ref && jwtRef(envKey) === ref) {
    return { url: envUrl, key: envKey };
  }

  if (envUrl || envKey) {
    console.warn(
      'Supabase: env vars ausentes ou inconsistentes (URL x chave). Usando configuração padrão do projeto.'
    );
  }
  return { url: DEFAULT_URL, key: DEFAULT_KEY };
}

const { url, key } = resolveConfig();

export const supabase: SupabaseClient = createClient(url, key);
export { supabase as sb };

export const isSupabaseConfigured = (): boolean => true;
