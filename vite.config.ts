/**
 * RAVO OS — Vite Configuration
 * Build configuration for production
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    // Constante em build: sem a flag, o código de mock é eliminado
    // do bundle de produção (dead-code elimination do import dinâmico).
    'import.meta.env.VITE_USE_MOCK': JSON.stringify(process.env.VITE_USE_MOCK ?? 'false'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@validators': path.resolve(__dirname, './src/validators'),
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
});
