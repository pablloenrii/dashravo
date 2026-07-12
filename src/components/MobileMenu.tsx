import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: { path: string; label: string }[];
  isActive: (path: string) => boolean;
}

export function MobileMenu({ isOpen, onClose, items, isActive }: MobileMenuProps) {
  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          zIndex: 50,
          animation: 'fadeIn 200ms ease-out',
        }}
      />

      {/* Menu */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: '280px',
          background: '#0B0E19',
          borderRight: '0.5px solid rgba(255,255,255,0.04)',
          zIndex: 51,
          animation: 'slideInLeft 300ms ease-out',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px',
            borderBottom: '0.5px solid rgba(234, 106, 27, 0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#EA6A1B', margin: 0 }}>
              RAVO
            </h2>
            <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>INTELLIGENCE</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive(item.path) ? '#EA6A1B' : '#9CA3AF',
                background: isActive(item.path) ? 'rgba(234, 106, 27, 0.12)' : 'rgba(255,255,255,0.02)',
                borderLeft: isActive(item.path) ? '2.5px solid #EA6A1B' : '2.5px solid transparent',
                transition: 'all 300ms ease-out',
                fontSize: '14px',
                fontWeight: isActive(item.path) ? '600' : '500',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: '12px',
            borderTop: '0.5px solid rgba(255,255,255,0.04)',
            color: '#6B7280',
            fontSize: '11px',
            textAlign: 'center',
          }}
        >
          RAVO OS v5.0
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
