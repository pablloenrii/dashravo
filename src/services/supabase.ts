/**
 * RAVO OS — Supabase Client
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let sb: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    sb = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase inicializado');
  } catch (error) {
    console.error('Erro ao inicializar Supabase:', error);
  }
} else {
  console.warn('Supabase credentials nao configuradas em .env.local');
}

const createMockSupabaseClient = (): SupabaseClient => {
  return createClient('https://fallback.supabase.co', 'fallback-key') as SupabaseClient;
};

export const supabase: SupabaseClient = sb || createMockSupabaseClient();
export { supabase as sb };

export const isSupabaseConfigured = (): boolean => !!sb;
