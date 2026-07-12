import { useEffect, useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const commands: CommandItem[] = [
  {
    id: 'crm',
    title: 'Ir para CRM',
    description: 'Gerenciar leads e pipeline',
    category: 'Navegação',
    shortcut: 'Cmd K',
    action: () => window.location.href = '/crm',
  },
  {
    id: 'finance',
    title: 'Ir para Finance',
    description: 'Análise financeira',
    category: 'Navegação',
    action: () => window.location.href = '/finance',
  },
  {
    id: 'goals',
    title: 'Ir para Goals',
    description: 'Acompanhar KPIs',
    category: 'Navegação',
    action: () => window.location.href = '/goals',
  },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Evita índice fora do range quando o filtro muda (fonte do TypeError histórico)
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (filtered.length > 0) {
          setSelectedIndex(prev => (prev + 1) % filtered.length);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (filtered.length > 0) {
          setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        filtered[selectedIndex]?.action();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Command Palette */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50">
        <div className="bg-var(--bg-tertiary) border border-var(--border-primary) rounded-xl shadow-xl overflow-hidden">
          {/* Search Input */}
          <div className="p-4 border-b border-var(--border-primary) flex items-center gap-3">
            <Search className="w-5 h-5 text-var(--text-tertiary) flex-shrink-0" strokeWidth={2} />
            <input
              autoFocus
              type="text"
              placeholder="Buscar comando..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedIndex(0);
              }}
              className="flex-1 bg-transparent border-none outline-none text-var(--text-primary) placeholder-var(--text-tertiary)"
            />
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-var(--text-tertiary)">Nenhum comando encontrado</p>
              </div>
            ) : (
              <div className="py-2">
                {filtered.map((cmd, index) => (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    className={`w-full px-4 py-3 flex items-center justify-between hover:bg-var(--bg-hover) transition-colors ${
                      index === selectedIndex ? 'bg-var(--bg-hover)' : ''
                    }`}
                  >
                    <div className="text-left">
                      <p className="text-var(--text-primary) font-medium">{cmd.title}</p>
                      {cmd.description && (
                        <p className="text-xs text-var(--text-tertiary) mt-0.5">{cmd.description}</p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-var(--text-tertiary) flex-shrink-0" strokeWidth={2} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-var(--border-primary) bg-var(--bg-secondary) text-xs text-var(--text-tertiary) flex items-center justify-between">
            <span>↑ ↓ para navegar • ⏎ para executar • Esc para fechar</span>
          </div>
        </div>
      </div>
    </>
  );
}
