/**
 * RAVO OS — Estados de query (erro / loading)
 * Sem fallback silencioso: erros de dados aparecem aqui.
 */

import { AlertTriangle, RefreshCw } from 'lucide-react';

interface QueryErrorProps {
  message: string;
  onRetry?: () => void;
}

/** Banner de erro por card/seção — âmbar, minimalista */
export function QueryError({ message, onRetry }: QueryErrorProps) {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        borderLeft: '3px solid #F59E0B',
        borderRadius: '8px',
        margin: '8px 0',
      }}
    >
      <AlertTriangle size={16} color="#F59E0B" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#F5F5F7' }}>
          Erro ao carregar dados
        </div>
        <div style={{ fontSize: '11px', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {message}
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'transparent',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: '6px',
            color: '#F59E0B',
            fontSize: '11px',
            fontWeight: 600,
            padding: '6px 10px',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={12} /> Tentar novamente
        </button>
      )}
    </div>
  );
}

/** Skeleton de carregamento para áreas de gráfico/tabela */
export function QueryLoading({ height = 300 }: { height?: number }) {
  return (
    <div
      aria-busy="true"
      style={{
        height: `${height}px`,
        borderRadius: '8px',
        background:
          'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%)',
        backgroundSize: '200% 100%',
        animation: 'ravo-shimmer 1.4s ease infinite',
      }}
    >
      <style>{'@keyframes ravo-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }'}</style>
    </div>
  );
}
