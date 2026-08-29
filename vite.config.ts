/**
 * RAVO OS — Vite Configuration
 * Build configuration for production
 */

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Sem VITE_POSTGREST_URL configurada (ex.: build na Vercel sem env vars
  // ainda setadas), o build NAO falha mais: cai em modo demo com dados de
  // exemplo, para o site sempre subir com algo visivel. src/services/supabase.ts
  // ja tem o mesmo fallback de URL para o runtime -- aqui e so o aviso de build.
  // Assim que as env vars reais forem configuradas na Vercel (ver
  // database/APLICAR.md), o proximo deploy troca automaticamente para dados
  // reais da VPS.
  const demoMode = !env.VITE_POSTGREST_URL;
  if (demoMode) {
    console.warn(
      'RAVO OS: VITE_POSTGREST_URL nao configurada -- build em MODO DEMO ' +
      '(dados de exemplo, login demo). Configure as env vars na Vercel para dados reais.'
    );
  }

  return {
    plugins: [react()],
    define: {
      // Constante em build: sem a flag, o codigo de mock e eliminado
      // do bundle de producao (dead-code elimination do import dinamico).
      // Em modo demo (sem VITE_POSTGREST_URL), assume mock=true por padrao,
      // a menos que VITE_USE_MOCK tenha sido setado explicitamente.
      'import.meta.env.VITE_USE_MOCK': JSON.stringify(env.VITE_USE_MOCK ?? (demoMode ? 'true' : 'false')),
      // demoMode e booleano; stringify precisa da forma texto ('true'/'false')
      // para casar com a comparacao `=== 'true'` em services/auth.ts -- JSON.stringify
      // direto no booleano gera o literal `true` sem aspas no bundle, o que quebra
      // a comparacao de string silenciosamente (bug corrigido aqui).
      'import.meta.env.VITE_DEMO_MODE': JSON.stringify(demoMode ? 'true' : 'false'),
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
