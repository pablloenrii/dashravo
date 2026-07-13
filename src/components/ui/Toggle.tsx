interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ display: 'none' }}
      />
      <div style={{
        width: '48px',
        height: '28px',
        borderRadius: '14px',
        background: checked ? '#EDEDED' : '#475569',
        position: 'relative',
        transition: 'background 0.3s'
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '12px',
          background: 'white',
          position: 'absolute',
          top: '2px',
          left: checked ? '22px' : '2px',
          transition: 'left 0.3s'
        }} />
      </div>
      {label && <span style={{ color: '#94A3B8' }}>{label}</span>}
    </label>
  );
}
