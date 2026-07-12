/**
 * RAVO OS v6 — Main Entry Point
 * Auth guard + error boundary global + code-splitting por página
 */

import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppLayout } from './layouts/AppLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RequireAuth } from './components/RequireAuth';
import './styles/minimalist.css';
import './index.css';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const LoginPage = lazy(() => import('./pages/Login'));
const SignupPage = lazy(() => import('./pages/Signup'));
const CRMPage = lazy(() => import('./pages/CRMPage'));
const FinancePage = lazy(() => import('./pages/FinancePage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const CSPage = lazy(() => import('./pages/CSPage'));

function PageFallback() {
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#9CA3AF', fontSize: '14px'
    }}>
      Carregando…
    </div>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AppLayout>
        <Suspense fallback={<PageFallback />}>{children}</Suspense>
      </AppLayout>
    </RequireAuth>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Suspense fallback={<PageFallback />}><LoginPage /></Suspense>} />
            <Route path="/signup" element={<Suspense fallback={<PageFallback />}><SignupPage /></Suspense>} />
            <Route path="/" element={<Protected><Dashboard /></Protected>} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/crm" element={<Protected><CRMPage /></Protected>} />
            <Route path="/cs" element={<Protected><CSPage /></Protected>} />
            <Route path="/finance" element={<Protected><FinancePage /></Protected>} />
            <Route path="/goals" element={<Protected><GoalsPage /></Protected>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
