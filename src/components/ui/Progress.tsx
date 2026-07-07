interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

export function Progress({ value, max = 100, label, variant = 'primary' }: ProgressProps) {
  const percentage = (value / max) * 100;
  
  const colorMap = {
    primary: '#FF6200',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444'
  };

  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
          <span style={{ color: '#94A3B8' }}>{label}</span>
          <span style={{ color: '#FF6200', fontWeight: 'bold' }}>{Math.round(percentage)}%</span>
        </div>
      )}
      <div style={{
        width: '100%',
        height: '8px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: colorMap[variant],
          borderRadius: '4px',
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
}
