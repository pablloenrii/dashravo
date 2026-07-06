import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  position?: 'left' | 'right';
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
}: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed top-0 ${position === 'right' ? 'right-0' : 'left-0'} bottom-0 z-50
          w-full max-w-md
          bg-var(--bg-primary) border-l border-var(--border-primary)
          shadow-xl
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : (position === 'right' ? 'translate-x-full' : '-translate-x-full')}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-var(--border-primary) flex items-center justify-between sticky top-0 bg-var(--bg-primary)">
          <h2 id="drawer-title" className="text-lg font-bold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-var(--bg-secondary) rounded transition-colors text-var(--text-secondary) hover:text-var(--text-primary)"
            aria-label="Close"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-56px)]">
          <div className="px-6 py-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
