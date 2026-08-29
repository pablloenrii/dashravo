/**
 * RAVO OS — Vite Configuration
 * Build configuration for production
 */

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Fail-fast: sem a URL da API o app não deve compilar nem rodar.
  // IMPORTANTE: usar `env` (loadEnv) e não `process.env` — o Vite não injeta
  // variáveis do .env.local em process.env durante a resolução do config.
  if (!env.VITE_POSTGREST_URL) {
    throw new Error(
      'RAVO OS: VITE_POSTGREST_URL é obrigatória. Configure no .env.local'
    );
  }

  return {
    plugins: [react()],
    define: {
      // Constante em build: sem a flag, o código de mock é eliminado
      // do bundle de produção (dead-code elimination do import dinâmico).
      'import.meta.env.VITE_USE_MOCK': JSON.stringify(env.VITE_USE_MOCK ?? 'false'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      open: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      rollupOptions: {
        output: {
          // Vendor libs em chunks próprios e nomeados: sem isso, o Rollup agrupa
          // código compartilhado (ex.: internals do recharts usados por vários
          // gráficos lazy-loaded) no chunk de qualquer arquivo local que aparecer
          // primeiro no grafo — resultando em nomes enganosos como
          // "ChartTooltip-*.js" pesando 350KB+ por código que não é dele.
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('react-router-dom') || id.includes('/react/') || id.includes('/react-dom/')) {
              return 'react-vendor';
            }
            if (id.includes('recharts') || id.includes('/d3-')) return 'charts-vendor';
            if (id.includes('@supabase')) return 'supabase-vendor';
            return undefined;
          },
        },
      },
    },
  };
});
