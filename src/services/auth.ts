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

/** Selo "DADOS DE EXEMPLO" vs "INTELLIGENCE" na sidebar (ver AppLayout.tsx). */
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

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
  let data: unknown;
  let error: { code?: string; message?: string } | null;
  try {
    ({ data, error } = await sb.rpc('login', {
      email: email.trim().toLowerCase(),
      senha: password,
    }));
  } catch {
    // fetch rejeitado: servidor fora do ar, DNS, TLS ou CORS bloqueado.
    throw new Error('Não foi possível falar com o servidor. Tente novamente em instantes.');
  }

  if (error) {
    throw new Error(loginErrorMessage(error));
  }
  if (!data || typeof (data as LoginRpcResponse).token !== 'string') {
    // Resposta 200 que não é o JSON do login (ex.: a API apontando para o próprio frontend).
    throw new Error('O servidor de login respondeu de forma inesperada. Avise o suporte.');
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

/**
 * Traduz o erro do PostgREST em mensagem para o usuário, sem mascarar falhas de
 * infraestrutura como "senha errada". 28P01 é o SQLSTATE que a função login()
 * levanta para credencial inválida (PostgREST devolve 403/401).
 */
function loginErrorMessage(error: { code?: string; message?: string }): string {
  const code = error.code ?? '';
  const msg = (error.message ?? '').toLowerCase();
  if (code === '28P01' || msg.includes('email ou senha incorretos')) {
    return 'Email ou senha incorretos.';
  }
  if (code === 'PGRST202' || msg.includes('could not find the function')) {
    return 'O serviço de login não está instalado no servidor. Avise o suporte.';
  }
  if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('load failed')) {
    return 'Não foi possível falar com o servidor. Tente novamente em instantes.';
  }
  if (msg.includes('too many') || code === '429') {
    return 'Muitas tentativas. Aguarde um minuto e tente de novo.';
  }
  return 'Não foi possível entrar agora. Tente novamente ou avise o suporte.';
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
