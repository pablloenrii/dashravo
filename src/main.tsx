/**
 * RAVO OS v2.0 — Main Entry Point
 * Enterprise-grade React application with routing
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppLayout } from './layouts/AppLayout';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import CRMPage from './modules/crm/pages/CRMPage';
import FinancePage from './modules/finance/pages/FinancePage';
import GoalsPage from './modules/goals/pages/GoalsPage';
import CSPage from './modules/cs/pages/CSPage';
import './index.css';

// Log startup
console.log('🚀 RAVO OS v2.0 - Enterprise Edition');
console.log('📚 Documentação: /docs/README.md');
console.log('🔧 Status: Enterprise-grade frontend com layout profissional');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<HomePage />} />
          <Route
            path="/crm"
            element={
              <AppLayout>
                <CRMPage />
              </AppLayout>
            }
          />
          <Route
            path="/finance"
            element={
              <AppLayout>
                <FinancePage />
              </AppLayout>
            }
          />
          <Route
            path="/goals"
            element={
              <AppLayout>
                <GoalsPage />
              </AppLayout>
            }
          />
          <Route
            path="/cs"
            element={
              <AppLayout>
                <CSPage />
              </AppLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
