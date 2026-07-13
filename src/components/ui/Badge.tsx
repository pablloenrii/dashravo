import { ReactNode } from 'react';

type BadgeVariant = 'primary' | 'success' | 'danger';

export function Badge({ children, variant = 'primary' }: { children: ReactNode; variant?: BadgeVariant }) {
  const styles: Record<BadgeVariant, string> = {
    primary: 'bg-[rgba(255,255,255,0.1)] text-[#EDEDED]',
    success: 'bg-[rgba(34,197,94,0.1)] text-[#22C55E]',
    danger: 'bg-[rgba(239,68,68,0.1)] text-[#EF4444]',
  };
  return <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${styles[variant]}`}>{children}</span>;
}
