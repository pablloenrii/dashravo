/**
 * RAVO OS v2.0 — Main Entry Point
 * React application with routing
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import CRMPage from './modules/crm/pages/CRMPage';
import FinancePage from './modules/finance/pages/FinancePage';
import GoalsPage from './modules/goals/pages/GoalsPage';
import CSPage from './modules/cs/pages/CSPage';
import './index.css';

// Log startup
console.log('🚀 RAVO OS v2.0 - Production Build');
console.log('📚 Documentação: /docs/README.md');
console.log('🔧 Status: Autenticação e módulos implementados');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/crm" element={<CRMPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/cs" element={<CSPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
