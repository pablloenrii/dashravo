/**
 * RAVO OS — Sessão local (single-user)
 *
 * O backend é PostgreSQL + PostgREST self-hosted, que NÃO expõe o GoTrue
 * (serviço de auth do Supabase Cloud). Portanto `supabase.auth.*` nunca
 * retorna sessão e travaria o app no /login permanentemente.
 *
 * Como o RAVO OS é operado por um único usuário (visão de dono), a sessão é
 * resolvida no cliente contra credenciais definidas em variáveis de ambiente.
 *
 * LIMITE DE SEGURANÇA — leia antes de expor publicamente:
 * Este gate impede acesso casual à interface, mas NÃO protege os dados: quem
 * souber a URL do PostgREST consulta a API diretamente. A proteção real dos
 * dados precisa vir de JWT no PostgREST + RLS no PostgreSQL. Enquanto isso não
 * existir, mantenha a porta 8080 restrita por firewall ao seu IP.
 */

const SESSION_KEY = 'ravo.session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12h

export interface LocalSession {
  email: string;
  issuedAt: number;
  expiresAt: number;
}

/** Credenciais aceitas, vindas do .env.local. */
const ALLOWED_EMAIL = import.meta.env.VITE_AUTH_EMAIL ?? '';
const ALLOWED_PASSWORD = import.meta.env.VITE_AUTH_PASSWORD ?? '';

/** Lê a sessão persistida, descartando-a se expirada ou corrompida. */
export function getSession(): LocalSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as LocalSession;
    if (typeof parsed?.expiresAt !== 'number' || Date.now() > parsed.expiresAt) {
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
 * Valida credenciais e abre sessão.
 * Lança Error com mensagem exibível ao usuário quando falha.
 */
export function signIn(email: string, password: string): LocalSession {
  if (!ALLOWED_EMAIL || !ALLOWED_PASSWORD) {
    throw new Error(
      'Credenciais não configuradas. Defina VITE_AUTH_EMAIL e VITE_AUTH_PASSWORD no .env.local.'
    );
  }

  const emailOk = email.trim().toLowerCase() === ALLOWED_EMAIL.trim().toLowerCase();
  const passwordOk = password === ALLOWED_PASSWORD;

  if (!emailOk || !passwordOk) {
    throw new Error('Email ou senha incorretos.');
  }

  const now = Date.now();
  const session: LocalSession = {
    email: ALLOWED_EMAIL,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  notify(session);
  return session;
}

/** Encerra a sessão. */
export function signOut(): void {
  localStorage.removeItem(SESSION_KEY);
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

  // Sincroniza logout/login feitos em outra aba.
  const onStorage = (e: StorageEvent) => {
    if (e.key === SESSION_KEY) fn(getSession());
  };
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(fn);
    window.removeEventListener('storage', onStorage);
  };
}
