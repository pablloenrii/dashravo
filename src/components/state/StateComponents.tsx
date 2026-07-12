/**
 * RAVO OS — State Components
 * Componentes para Loading, Empty e Error states
 */

import React, { ReactNode } from 'react';

// Loading Spinner
export const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin`} />
    </div>
  );
};

// Empty State
export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {icon && <div className="text-6xl mb-4">{icon}</div>}
    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
    {description && <p className="text-gray-500 mt-2">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

// Error State
export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState = ({
  title = 'Erro',
  message,
  onRetry,
}: ErrorStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="text-6xl mb-4">❌</div>
    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
    <p className="text-gray-500 mt-2 max-w-md">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Tentar novamente
      </button>
    )}
  </div>
);

// Skeleton Loader
export const Skeleton = ({
  className,
  count = 1,
}: {
  className?: string;
  count?: number;
}) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={`bg-gray-200 animate-pulse rounded ${className || 'h-4 w-full mb-2'}`}
      />
    ))}
  </>
);
