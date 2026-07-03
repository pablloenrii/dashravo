/**
 * RAVO OS — Supabase Client
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('⚠️ Supabase credentials não configuradas em .env.local');
}

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY);