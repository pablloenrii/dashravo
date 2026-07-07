import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeButton?: boolean;
}

const sizeMap = {
  sm: '400px',
  md: '600px',
  lg: '800px',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeButton = true,
}: ModalProps) {
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
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 50,
          animation: 'fadeIn 200ms ease-out',
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `min(calc(100% - 32px), ${sizeMap[size]})`,
          maxHeight: '90vh',
          background: 'rgba(11, 14, 25, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06), 0 20px 40px rgba(0, 0, 0, 0.6)',
          borderRadius: '12px',
          zIndex: 51,
          animation: 'slideUp 300ms ease-out',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || closeButton) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '0.5px solid rgba(255,255,255,0.04)',
            }}
          >
            {title && (
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#EBEBF0',
                  margin: 0,
                }}
              >
                {title}
              </h2>
            )}
            {closeButton && (
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  transition: 'all 200ms ease-out',
                  marginLeft: 'auto',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#EBEBF0'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px',
            color: '#EBEBF0',
            fontSize: '14px',
            lineHeight: '1.6',
          }}
        >
          {children}
        </div>

        {footer && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '0.5px solid rgba(255,255,255,0.04)',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
