import { useState, ReactNode } from 'react';

interface PopoverProps {
  trigger: ReactNode;
  content: ReactNode;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Popover({
  trigger,
  content,
  title,
  position = 'bottom',
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Popover */}
          <div
            className={`
              absolute ${positionClasses[position]}
              z-50 w-72
              bg-white rounded-xl shadow-xl
              glass-card p-4
              animate-scale-in
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <h3 className="font-bold text-gray-900 mb-3">{title}</h3>
            )}
            <div className="text-gray-700">
              {content}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
