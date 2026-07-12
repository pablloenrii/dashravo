
export interface SkeletonCardProps {
  variant?: 'kpi' | 'chart' | 'table' | 'list';
  count?: number;
}

export function SkeletonCard({ variant = 'kpi', count = 1 }: SkeletonCardProps) {
  const renderKPISkeleton = () => (
    <div
      style={{
        background: 'rgba(11, 14, 25, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '16px',
        animation: 'shimmer 2s infinite',
        backgroundImage:
          'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
        backgroundSize: '1000px 100%',
      }}
    >
      {/* Title */}
      <div
        style={{
          height: '12px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '4px',
          marginBottom: '12px',
          width: '70%',
        }}
      />
      {/* Value */}
      <div
        style={{
          height: '24px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '4px',
          marginBottom: '8px',
          width: '100%',
        }}
      />
      {/* Trend */}
      <div
        style={{
          height: '10px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '4px',
          width: '50%',
        }}
      />
    </div>
  );

  const renderChartSkeleton = () => (
    <div
      style={{
        background: 'rgba(11, 14, 25, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '16px',
        height: '280px',
        animation: 'shimmer 2s infinite',
        backgroundImage:
          'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
        backgroundSize: '1000px 100%',
      }}
    >
      {/* Title */}
      <div
        style={{
          height: '14px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '4px',
          marginBottom: '16px',
          width: '60%',
        }}
      />
      {/* Chart placeholder bars */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px' }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${40 + i * 20}%`,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '4px',
            }}
          />
        ))}
      </div>
    </div>
  );

  const renderTableSkeleton = () => (
    <div style={{ animation: 'shimmer 2s infinite' }}>
      {[...Array(3)].map((_, rowIdx) => (
        <div
          key={rowIdx}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginBottom: '12px',
            padding: '12px',
            background: 'rgba(11, 14, 25, 0.7)',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.1)',
            backgroundImage:
              'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
            backgroundSize: '1000px 100%',
          }}
        >
          {[...Array(4)].map((_, colIdx) => (
            <div
              key={colIdx}
              style={{
                height: '12px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '4px',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );

  const renderListSkeleton = () => (
    <div style={{ animation: 'shimmer 2s infinite' }}>
      {[...Array(4)].map((_, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            gap: '12px',
            padding: '12px',
            marginBottom: '8px',
            background: 'rgba(11, 14, 25, 0.7)',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.1)',
            backgroundImage:
              'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
            backgroundSize: '1000px 100%',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              flexShrink: 0,
            }}
          />
          {/* Content */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                height: '12px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '4px',
                marginBottom: '8px',
                width: '70%',
              }}
            />
            <div
              style={{
                height: '10px',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '4px',
                width: '50%',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const skeletons = {
    kpi: renderKPISkeleton,
    chart: renderChartSkeleton,
    table: renderTableSkeleton,
    list: renderListSkeleton,
  };

  const renderSkeleton = skeletons[variant] || renderKPISkeleton;

  return (
    <div>
      {[...Array(count)].map((_, idx) => (
        <div key={idx} style={{ marginBottom: count > 1 ? '12px' : 0 }}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
}
