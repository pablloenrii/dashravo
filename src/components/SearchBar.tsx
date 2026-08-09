import { Search } from 'lucide-react';
import { surface, text } from '@/constants/theme';

interface SearchBarProps {
  onSearchClick: () => void;
}

export function SearchBar({ onSearchClick }: SearchBarProps) {
  return (
    <button
      onClick={onSearchClick}
      aria-label="Buscar"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        maxWidth: '240px',
        padding: '8px 12px',
        background: surface.card,
        border: `1px solid ${surface.borderStrong}`,
        borderRadius: '8px',
        color: text.tertiary,
        fontSize: '13px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'border-color .15s ease, background .15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = surface.borderHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = surface.borderStrong;
      }}
    >
      <Search size={15} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>Buscar...</span>
      <kbd
        style={{
          fontSize: '11px',
          background: surface.borderStrong,
          color: text.secondary,
          padding: '2px 6px',
          borderRadius: '4px',
        }}
      >
        Ctrl K
      </kbd>
    </button>
  );
}
