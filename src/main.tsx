/**
 * RAVO OS v2.0 — Main Entry Point
 * Professional operations dashboard
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppLayout } from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import CRMPage from './pages/CRMPage';
import FinancePage from './pages/FinancePage';
import GoalsPage from './pages/GoalsPage';
import CSPage from './pages/CSPage';
import './styles/minimalist.css';
import './index.css';

console.log('🚀 RAVO OS v2.0 - Professional Dashboard');
console.log('📊 Real-time analytics and operations');
console.log('🎯 Enterprise-grade system');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/"
            element={
              <AppLayout>
                <Dashboard />
              </AppLayout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AppLayout>
                <Dashboard />
              </AppLayout>
            }
          />
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
