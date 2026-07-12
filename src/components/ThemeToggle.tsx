import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { mode, toggleMode } = useTheme();

  return (
    <button
      onClick={toggleMode}
      className={`
        w-12 h-12 rounded-lg flex items-center justify-center
        transition-all duration-300 hover-lift
        ${mode === 'light'
          ? 'bg-gray-100 text-yellow-600 hover:bg-gray-200'
          : 'bg-gray-800 text-blue-400 hover:bg-gray-700'
        }
      `}
      title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
    >
      {mode === 'light' ? (
        <span className="text-xl">🌙</span>
      ) : (
        <span className="text-xl">☀️</span>
      )}
    </button>
  );
}
