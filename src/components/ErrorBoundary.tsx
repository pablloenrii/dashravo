/**
 * RAVO OS — Error Boundary
 * Captura erros globalmente em componentes React
 */

import React, { ReactNode } from 'react';
import { toastError } from '@/utils/toast';
import { ErrorBoundaryVisual } from '@/components/ErrorBoundaryVisual';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component para capturar erros
 *
 * @example
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log erro para debug
    console.error('❌ Error caught by boundary:', error, errorInfo);

    // Disparar notificação
    toastError(`Erro: ${error.message}`, 5000);

    // Chamar callback customizado se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              padding: '2rem',
            }}
          >
            <div style={{ width: '100%', maxWidth: '420px' }}>
              <ErrorBoundaryVisual
                error={this.state.error ?? undefined}
                onRetry={this.handleReset}
                title="Algo deu errado"
                description="A aplicação encontrou um erro inesperado. Tente novamente."
              />
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
