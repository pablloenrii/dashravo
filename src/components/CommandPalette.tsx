import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { useThemeTokens } from '@/hooks/useThemeTokens';

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

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const { surface, text } = useThemeTokens();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = [
    {
      id: 'dashboard',
      title: 'Ir para Dashboard',
      description: 'Visão geral do negócio',
      category: 'Navegação',
      action: () => navigate('/dashboard'),
    },
    {
      id: 'crm',
      title: 'Ir para CRM',
      description: 'Gerenciar leads e pipeline',
      category: 'Navegação',
      action: () => navigate('/crm'),
    },
    {
      id: 'cs',
      title: 'Ir para Customer Success',
      description: 'Tickets e satisfação',
      category: 'Navegação',
      action: () => navigate('/cs'),
    },
    {
      id: 'finance',
      title: 'Ir para Finance',
      description: 'Análise financeira',
      category: 'Navegação',
      action: () => navigate('/finance'),
    },
    {
      id: 'goals',
      title: 'Ir para Goals',
      description: 'Acompanhar KPIs',
      category: 'Navegação',
      action: () => navigate('/goals'),
    },
  ];

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
        style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.5)', zIndex: 40 }}
        onClick={onClose}
      />

      {/* Command Palette */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Busca de comandos"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: '440px',
          zIndex: 50,
          animation: 'fadeIn 150ms ease-out',
        }}
      >
        <div
          style={{
            background: surface.card,
            border: `1px solid ${surface.borderStrong}`,
            borderRadius: '12px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}
        >
          {/* Search Input */}
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${surface.borderStrong}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search size={17} style={{ color: text.tertiary, flexShrink: 0 }} />
            <input
              autoFocus
              type="text"
              placeholder="Buscar comando..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedIndex(0);
              }}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: text.primary,
                fontSize: '14px',
              }}
            />
          </div>

          {/* Commands List */}
          <div style={{ maxHeight: '384px', overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: text.tertiary, fontSize: '13px' }}>
                Nenhum comando encontrado
              </div>
            ) : (
              <div style={{ padding: '6px 0' }}>
                {filtered.map((cmd, index) => (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: index === selectedIndex ? surface.borderStrong : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: text.primary,
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 500, color: text.primary }}>{cmd.title}</div>
                      {cmd.description && (
                        <div style={{ fontSize: '12px', color: text.tertiary, marginTop: '2px' }}>{cmd.description}</div>
                      )}
                    </div>
                    <ChevronRight size={15} style={{ color: text.tertiary, flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '10px 16px',
              borderTop: `1px solid ${surface.borderStrong}`,
              fontSize: '11px',
              color: text.tertiary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>↑ ↓ navegar • Enter executar • Esc fechar</span>
          </div>
        </div>
      </div>
    </>
  );
}
