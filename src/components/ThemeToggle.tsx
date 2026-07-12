import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        w-12 h-12 rounded-lg flex items-center justify-center
        transition-all duration-300 hover-lift
        ${theme === 'light'
          ? 'bg-gray-100 text-yellow-600 hover:bg-gray-200'
          : 'bg-gray-800 text-blue-400 hover:bg-gray-700'
        }
      `}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <span className="text-xl">🌙</span>
      ) : (
        <span className="text-xl">☀️</span>
      )}
    </button>
  );
}
