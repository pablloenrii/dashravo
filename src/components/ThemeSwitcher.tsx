import { useTheme } from '@/contexts/ThemeContext';
import { Palette } from 'lucide-react';

export function ThemeSwitcher() {
  const { color, setColor } = useTheme();
  
  const themes = [
    { id: 'orange', label: 'Orange', color: '#FF6200' },
    { id: 'blue', label: 'Blue', color: '#3B82F6' },
    { id: 'purple', label: 'Purple', color: '#A855F7' },
    { id: 'green', label: 'Green', color: '#10B981' },
  ];

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        style={{
          padding: '8px',
          background: 'transparent',
          border: 'none',
          color: '#94A3B8',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
        title="Change theme color"
      >
        <Palette className="w-5 h-5" strokeWidth={1.5} />
      </button>
      
      <div style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '8px',
        background: '#0F172A',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding: '12px',
        display: 'flex',
        gap: '8px',
        backdropFilter: 'blur(10px)',
        zIndex: 1000
      }}>
        {themes.map(theme => (
          <button
            key={theme.id}
            onClick={() => setColor(theme.id as any)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: theme.color,
              border: color === theme.id ? '2px solid white' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title={theme.label}
          />
        ))}
      </div>
    </div>
  );
}
