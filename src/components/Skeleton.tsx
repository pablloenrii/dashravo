interface SkeletonProps {
  className?: string;
  count?: number;
  height?: 'sm' | 'md' | 'lg';
}

const heightClasses = {
  sm: 'h-4',
  md: 'h-6',
  lg: 'h-12',
};

export function Skeleton({ className, count = 1, height = 'md' }: SkeletonProps) {
  const heightClass = heightClasses[height];

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`
            ${heightClass}
            bg-gradient-to-r from-var(--bg-secondary) via-var(--bg-tertiary) to-var(--bg-secondary)
            rounded animate-pulse
            ${className || 'mb-3'}
          `}
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite',
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

export function SkeletonCard() {
  return (
    <div className="card p-6">
      <Skeleton height="lg" className="mb-4 w-1/3" />
      <Skeleton count={3} />
      <Skeleton height="sm" className="mt-6 w-1/4" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card">
      <div className="p-6 space-y-4">
        <Skeleton height="md" className="w-1/4" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton height="sm" className="flex-1" />
            <Skeleton height="sm" className="w-1/3" />
            <Skeleton height="sm" className="w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
