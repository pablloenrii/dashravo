/**
 * RAVO OS — Sessão multi-usuário
 *
 * Login validado no servidor: o email/senha são conferidos contra a tabela
 * `usuarios` (hash bcrypt via pgcrypto) por um RPC (`login`) no próprio
 * PostgREST, que devolve um JWT assinado com o mesmo `jwt-secret` do
 * PostgREST — por isso o token já é aceito por todas as rotas existentes.
 *
 * Nenhuma senha trafega ou fica guardada em texto puro no cliente: a senha
 * digitada só é usada na chamada de login e descartada em seguida; o que
 * fica salvo localmente é o JWT (curto prazo, expira em 12h).
 *
 * Ver database/migration_usuarios.sql para a tabela/RPC, e como cadastrar,
 * trocar senha ou desativar um usuário.
 */

import { sb, setAuthToken } from './supabase';

const SESSION_KEY = 'ravo.session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12h (deve bater com o `exp` emitido pelo RPC login)

export interface LocalSession {
  email: string;
  nome: string;
  token: string;
  issuedAt: number;
  expiresAt: number;
}

interface LoginRpcResponse {
  token: string;
  email: string;
  nome: string;
}

/** Lê a sessão persistida, descartando-a se expirada ou corrompida. */
export function getSession(): LocalSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as LocalSession;
    if (
      typeof parsed?.expiresAt !== 'number' ||
      typeof parsed?.token !== 'string' ||
      Date.now() > parsed.expiresAt
    ) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

/**
 * Valida credenciais no servidor (RPC `login`) e abre sessão.
 * Lança Error com mensagem exibível ao usuário quando falha.
 */
export async function signIn(email: string, password: string): Promise<LocalSession> {
  const { data, error } = await sb.rpc('login', {
    email: email.trim().toLowerCase(),
    senha: password,
  });

  if (error || !data) {
    throw new Error('Email ou senha incorretos.');
  }

  const result = data as LoginRpcResponse;
  const now = Date.now();
  const session: LocalSession = {
    email: result.email,
    nome: result.nome,
    token: result.token,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  setAuthToken(session.token);
  notify(session);
  return session;
}

/** Encerra a sessão. */
export function signOut(): void {
  localStorage.removeItem(SESSION_KEY);
  setAuthToken(null);
  notify(null);
}

/* --------------------------------------------------------------------------
   Observadores — permitem que RequireAuth reaja a login/logout sem reload,
   inclusive quando acontecem em outra aba do navegador.
   -------------------------------------------------------------------------- */

type Listener = (session: LocalSession | null) => void;
const listeners = new Set<Listener>();

function notify(session: LocalSession | null) {
  listeners.forEach((fn) => fn(session));
}

export function onSessionChange(fn: Listener): () => void {
  listeners.add(fn);

  // Sincroniza logout/login feitos em outra aba (inclusive o header Authorization).
  const onStorage = (e: StorageEvent) => {
    if (e.key !== SESSION_KEY) return;
    const session = getSession();
    setAuthToken(session?.token ?? null);
    fn(session);
  };
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(fn);
    window.removeEventListener('storage', onStorage);
  };
}

// Ao carregar o módulo (refresh de página com sessão válida), religa o token
// no cliente PostgREST antes de qualquer query disparar.
setAuthToken(getSession()?.token ?? null);
