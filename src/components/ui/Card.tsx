import { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`
        bg-[#1A1A1A]
        border border-[rgba(255,255,255,0.06)]
        rounded-lg
        shadow-sm
        transition-all duration-200
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
