/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_USE_MOCK?: string;
  readonly VITE_ENVIRONMENT?: string;
  readonly VITE_ENABLE_ANALYTICS?: string;
  readonly VITE_ENABLE_REAL_TIME?: string;
  readonly VITE_ENABLE_OFFLINE_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
