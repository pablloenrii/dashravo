import { ReactNode, HTMLAttributes } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  type?: 'error' | 'success' | 'warning' | 'info';
  message?: ReactNode;
  children?: ReactNode;
}

export function Alert({
  type = 'info',
  message,
  children,
  className = '',
  ...props
}: AlertProps) {
  const icons = {
    error: <AlertCircle className="w-5 h-5" />,
    success: <CheckCircle2 className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const styles = {
    error: {
      container: 'bg-[rgba(239,68,68,0.1)] border border-[#EF4444]',
      text: 'text-[#EF4444]',
    },
    success: {
      container: 'bg-[rgba(34,197,94,0.1)] border border-[#22C55E]',
      text: 'text-[#22C55E]',
    },
    warning: {
      container: 'bg-[rgba(245,158,11,0.1)] border border-[#F59E0B]',
      text: 'text-[#F59E0B]',
    },
    info: {
      container: 'bg-[rgba(59,130,246,0.1)] border border-[#3B82F6]',
      text: 'text-[#3B82F6]',
    },
  };

  const style = styles[type];

  return (
    <div
      className={`
        ${style.container}
        rounded-lg p-4 flex gap-3
        ${className}
      `}
      {...props}
    >
      <div className={`flex-shrink-0 ${style.text}`}>
        {icons[type]}
      </div>
      <div className={`flex-1 ${style.text} text-sm`}>
        {message || children}
      </div>
    </div>
  );
}
