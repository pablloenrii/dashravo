/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'ravo-dark': '#09090B',
        'ravo-sidebar': '#0F172A',
        'ravo-card': '#111827',
        'ravo-accent': '#FF6200',
      },
      backgroundColor: {
        'var(--bg-primary)': 'var(--bg-primary)',
        'var(--bg-secondary)': 'var(--bg-secondary)',
        'var(--bg-tertiary)': 'var(--bg-tertiary)',
        'var(--bg-hover)': 'var(--bg-hover)',
      },
      textColor: {
        'var(--text-primary)': 'var(--text-primary)',
        'var(--text-secondary)': 'var(--text-secondary)',
        'var(--text-tertiary)': 'var(--text-tertiary)',
      },
      borderColor: {
        'var(--border-primary)': 'var(--border-primary)',
        'var(--border-secondary)': 'var(--border-secondary)',
      },
    },
  },
  plugins: [],
}
