/**
 * RAVO OS — Cadastro desativado
 *
 * O sistema opera em modo single-user com sessão local (ver services/auth.ts),
 * portanto não existe fluxo de auto-cadastro. Mantido apenas como redirect para
 * não quebrar links antigos.
 */

import { Navigate } from 'react-router-dom';

export default function SignupPage() {
  return <Navigate to="/login" replace />;
}
