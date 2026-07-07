import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearchClick: () => void;
}

export function SearchBar({ onSearchClick }: SearchBarProps) {
  return (
    <button
      onClick={onSearchClick}
      className="flex items-center gap-3 px-4 py-2.5 bg-var(--bg-secondary) border border-var(--border-primary) rounded-lg hover:border-var(--border-primary) hover:bg-var(--bg-tertiary) transition-colors w-full max-w-xs"
    >
      <Search className="w-4 h-4 text-var(--text-tertiary)" strokeWidth={2} />
      <span className="text-var(--text-tertiary) text-sm flex-1 text-left">Buscar...</span>
      <span className="text-xs text-var(--text-tertiary) bg-var(--bg-tertiary) px-2 py-1 rounded">Ctrl K</span>
    </button>
  );
}
