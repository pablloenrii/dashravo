import React, { useState, useRef, useEffect } from 'react';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  divider?: boolean;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export function Dropdown({ trigger, items, align = 'left' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer' }}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: '100%',
            [align]: 0,
            marginTop: '8px',
            minWidth: '200px',
            background: '#0B0E19',
            border: '0.5px solid rgba(255,255,255,0.04)',
            borderRadius: '8px',
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            animation: 'slideDown 200ms ease-out',
          }}
        >
          {items.map((item) => (
            <React.Fragment key={item.id}>
              {item.divider ? (
                <div
                  style={{
                    height: '1px',
                    background: 'rgba(255,255,255,0.03)',
                    margin: '4px 0',
                  }}
                />
              ) : (
                <button
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  disabled={item.disabled}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    color: item.disabled ? '#6B7280' : '#EBEBF0',
                    fontSize: '13px',
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 200ms ease-out',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: item.disabled ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!item.disabled) {
                      e.currentTarget.style.background = 'rgba(234, 106, 27, 0.1)';
                      e.currentTarget.style.color = '#EA6A1B';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#EBEBF0';
                  }}
                >
                  {item.icon && <span>{item.icon}</span>}
                  {item.label}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
