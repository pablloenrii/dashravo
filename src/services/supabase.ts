/**
 * RAVO OS — Supabase Client
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let sb: any = null;

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

const createMockSupabaseClient = () => ({
  auth: {
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => ({ data: null, error: { message: 'Not configured' } }),
    signUp: async () => ({ data: null, error: { message: 'Not configured' } }),
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: async () => ({ data: [], error: null }),
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
  }),
});

export const supabase = sb || createMockSupabaseClient();
export { supabase as sb };

export const isSupabaseConfigured = () => !!sb;
