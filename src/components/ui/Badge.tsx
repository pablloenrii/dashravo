export function Badge({ children, variant = 'primary' }: any) {
  const styles = {
    primary: 'bg-[rgba(255,98,0,0.1)] text-[#FF6200]',
    success: 'bg-[rgba(34,197,94,0.1)] text-[#22C55E]',
    danger: 'bg-[rgba(239,68,68,0.1)] text-[#EF4444]',
  };
  return <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${styles[variant]}`}>{children}</span>;
}
