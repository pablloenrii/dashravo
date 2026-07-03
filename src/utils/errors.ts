/**
 * RAVO OS — Error Utils
 * Utilitários para tratamento de erros
 */

import { toastError, toastWarning } from './toast';

/**
 * Mapear códigos de erro para mensagens amigáveis
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  INVALID_CREDENTIALS: 'Email ou senha incorretos',
  USER_EXISTS: 'Este email já está registrado',
  WEAK_PASSWORD: 'Senha deve ter no mínimo 8 caracteres',
  EMAIL_NOT_CONFIRMED: 'Por favor, confirme seu email',
  SESSION_EXPIRED: 'Sua sessão expirou. Por favor, faça login novamente',

  // Network errors
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet',
  TIMEOUT: 'Requisição expirou. Tente novamente',
  NOT_FOUND: 'Recurso não encontrado',
  FORBIDDEN: 'Você não tem permissão para acessar isso',
  UNAUTHORIZED: 'Você precisa estar autenticado',
  INTERNAL_SERVER_ERROR: 'Erro do servidor. Tente novamente mais tarde',

  // Validation errors
  VALIDATION_ERROR: 'Verifique os dados fornecidos',
  INVALID_EMAIL: 'Email inválido',
  FIELD_REQUIRED: 'Este campo é obrigatório',

  // Generic
  UNKNOWN_ERROR: 'Erro desconhecido. Tente novamente',
};

/**
 * Interface para erros estruturados
 */
export interface AppError {
  code: string;
  message: string;
  originalError?: Error;
  status?: number;
  details?: Record<string, any>;
}

/**
 * Criar erro estruturado
 */
export function createError(
  code: string,
  message?: string,
  originalError?: Error,
  details?: Record<string, any>
): AppError {
  return {
    code,
    message: message || ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR,
    originalError,
    details,
  };
}

/**
 * Log de erro para console e analytics
 */
export function logError(error: AppError | Error, context?: string) {
  const timestamp = new Date().toISOString();
  const isAppError = 'code' in error;

  console.error(`[${timestamp}] ${context ? `[${context}] ` : ''}Error:`, {
    ...(isAppError ? error : { message: error.message, stack: error.stack }),
  });

  // TODO: Enviar para serviço de analytics (Sentry, LogRocket, etc)
}

/**
 * Tratar erro e disparar notificação
 */
export function handleError(
  error: any,
  context?: string,
  showToast: boolean = true
): AppError {
  let appError: AppError;

  if (error instanceof Error && 'code' in error) {
    appError = error as AppError;
  } else if (error instanceof Error) {
    appError = createError('UNKNOWN_ERROR', error.message, error);
  } else if (typeof error === 'string') {
    appError = createError('UNKNOWN_ERROR', error);
  } else {
    appError = createError('UNKNOWN_ERROR');
  }

  logError(appError, context);

  if (showToast) {
    toastError(appError.message);
  }

  return appError;
}

/**
 * Retry com backoff exponencial
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    onRetry,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const waitTime = delay * Math.pow(backoff, attempt - 1);
        onRetry?.(attempt, lastError);
        toastWarning(`Tentando novamente em ${Math.ceil(waitTime / 1000)}s...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError || createError('UNKNOWN_ERROR');
}

/**
 * Validar resposta HTTP e extrair erro
 */
export function handleHttpError(status: number, data?: any): AppError {
  const errorMap: Record<number, string> = {
    400: 'VALIDATION_ERROR',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    500: 'INTERNAL_SERVER_ERROR',
    503: 'INTERNAL_SERVER_ERROR',
  };

  const code = errorMap[status] || 'UNKNOWN_ERROR';
  const message = data?.message || ERROR_MESSAGES[code];

  return createError(code, message, undefined, { status, data });
}

/**
 * Assert para validação
 */
export function assert(
  condition: boolean,
  code: string,
  message?: string
): asserts condition {
  if (!condition) {
    throw createError(code, message);
  }
}

/**
 * Extrar mensagem de erro de qualquer tipo
 */
export function getErrorMessage(error: any): string {
  if (!error) return ERROR_MESSAGES.UNKNOWN_ERROR;

  if (typeof error === 'string') return error;

  if (error instanceof Error) {
    return error.message;
  }

  if (error.message) return error.message;

  return ERROR_MESSAGES.UNKNOWN_ERROR;
}
