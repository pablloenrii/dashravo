/**
 * RAVO OS v2.0 — Main Entry Point
 * React application initialization
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import HomePage from './pages/Home';
import './index.css';

// Log startup
console.log('🚀 RAVO OS v2.0 - Production Build');
console.log('📚 Documentação: /docs/README.md');
console.log('🔧 Próximo passo: Implementar módulos em src/modules/');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HomePage />
  </React.StrictMode>,
);
