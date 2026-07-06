import { ReactNode } from 'react';
import { AlertCircle, Inbox } from 'lucide-react';

interface StateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon = <Inbox className="w-12 h-12 text-var(--text-tertiary)" strokeWidth={1.5} />,
}: StateProps) {
  return (
    <div className="card p-12">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-4">{icon}</div>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        {description && (
          <p className="text-var(--text-secondary) mb-6 max-w-sm">{description}</p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  );
}

export function ErrorState({
  title = 'Algo deu errado',
  description = 'Ocorreu um erro inesperado. Tente novamente.',
  action,
  icon = <AlertCircle className="w-12 h-12 text-red-500" strokeWidth={1.5} />,
}: StateProps) {
  return (
    <div className="card p-12 border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-4">{icon}</div>
        <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-red-600 dark:text-red-300 mb-6 max-w-sm">{description}</p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  );
}
