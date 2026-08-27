import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeTokens } from '@/hooks/useThemeTokens';

export function ThemeToggle() {
  const { mode, toggleMode } = useTheme();
  const { surface } = useThemeTokens();

  return (
    <button
      onClick={toggleMode}
      title={mode === 'light' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
      aria-label="Alternar tema"
      style={{
        width: '34px',
        height: '34px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: surface.card,
        border: `1px solid ${surface.borderStrong}`,
        borderRadius: '8px',
        color: textTertiary(),
        cursor: 'pointer',
        transition: 'color .15s ease, border-color .15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = textPrimary();
        e.currentTarget.style.borderColor = surface.borderHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = textTertiary();
        e.currentTarget.style.borderColor = surface.borderStrong;
      }}
    >
      {mode === 'light' ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}

function textPrimary() {
  return 'var(--text-primary)';
}

function textTertiary() {
  return 'var(--text-secondary)';
}
