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
      container: 'bg-[rgba(245,158,11,0.1)] border border-[#8B8B8B]',
      text: 'text-[#8B8B8B]',
    },
    info: {
      container: 'bg-[rgba(255,255,255,0.1)] border border-[#EDEDED]',
      text: 'text-[#EDEDED]',
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
