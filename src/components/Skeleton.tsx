import React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  count?: number;
  style?: React.CSSProperties;
}

export function Skeleton({
  width = '100%',
  height = '20px',
  variant = 'rectangular',
  count = 1,
  style,
}: SkeletonProps) {
  const skeletons = Array.from({ length: count });

  const baseStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 2s infinite',
    borderRadius: variant === 'circular' ? '50%' : variant === 'text' ? '4px' : '8px',
    ...style,
  };

  return (
    <>
      {skeletons.map((_, idx) => (
        <div
          key={idx}
          style={{
            width,
            height: variant === 'circular' ? width : height,
            ...baseStyle,
            marginBottom: idx < count - 1 ? '8px' : 0,
          }}
        />
      ))}

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}
