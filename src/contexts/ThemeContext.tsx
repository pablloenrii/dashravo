import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark';
export type ThemeColor = 'orange' | 'blue' | 'purple' | 'green' | 'red';

interface ThemeConfig {
  mode: ThemeMode;
  color: ThemeColor;
}

interface ThemeContextType {
  mode: ThemeMode;
  color: ThemeColor;
  toggleMode: () => void;
  setColor: (color: ThemeColor) => void;
  setTheme: (theme: ThemeConfig) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const colorPalettes = {
  orange: {
    primary: '#EDEDED',
    hover: '#8B8B8B',
    light: 'rgba(255,255,255,0.1)',
  },
  blue: {
    primary: '#EDEDED',
    hover: '#6E6E6E',
    light: 'rgba(255,255,255,0.1)',
  },
  purple: {
    primary: '#A855F7',
    hover: '#9333EA',
    light: 'rgba(168,85,247,0.1)',
  },
  green: {
    primary: '#10B981',
    hover: '#059669',
    light: 'rgba(16,185,129,0.1)',
  },
  red: {
    primary: '#EF4444',
    hover: '#DC2626',
    light: 'rgba(239,68,68,0.1)',
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme-mode');
    return (saved as ThemeMode) || 'dark';
  });

  const [color, setColorState] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem('theme-color');
    return (saved as ThemeColor) || 'orange';
  });

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
    localStorage.setItem('theme-color', color);

    // Update CSS variables
    const palette = colorPalettes[color];
    document.documentElement.style.setProperty('--accent-primary', palette.primary);
    document.documentElement.style.setProperty('--accent-hover', palette.hover);
    document.documentElement.style.setProperty('--accent-light', palette.light);

    // Update data attributes
    document.documentElement.setAttribute('data-theme-mode', mode);
    document.documentElement.setAttribute('data-theme-color', color);

    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode, color]);

  const toggleMode = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setColor = (newColor: ThemeColor) => {
    setColorState(newColor);
  };

  const setTheme = (theme: ThemeConfig) => {
    setMode(theme.mode);
    setColorState(theme.color);
  };

  return (
    <ThemeContext.Provider value={{ mode, color, toggleMode, setColor, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export function useThemeColor() {
  const { color } = useTheme();
  return colorPalettes[color];
}
