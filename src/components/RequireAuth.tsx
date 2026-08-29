/**
 * RAVO OS — Route Guard
 * Bloqueia rotas protegidas sem sessão local; reage a login/logout sem reload.
 */

import { useEffect, useState, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getSession, onSessionChange, type LocalSession } from '@/services/auth';
import { useThemeTokens } from '@/hooks/useThemeTokens';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { surface, text } = useThemeTokens();
  const [session, setSession] = useState<LocalSession | null>(() => getSession());
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setSession(getSession());
    setChecking(false);
    return onSessionChange(setSession);
  }, []);

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: surface.app, color: text.secondary, fontSize: '14px',
      }}>
        Verificando sessão…
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
