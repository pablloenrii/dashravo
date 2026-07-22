
export interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export function Sparkline({
  data,
  color = '#EDEDED',
  height = 40,
  showLabel = true
}: SparklineProps) {
  if (!data || data.length === 0) return null;

  // Encontrar min e max
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Gerar pontos SVG
  const width = 100;
  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1 || 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  // Determinar cor baseada em tendência
  const firstValue = data[0];
  const lastValue = data[data.length - 1];
  const isTrendingUp = lastValue >= firstValue;
  const displayColor = isTrendingUp ? '#10B981' : '#EF4444';

  return (
    <div style={{ width: '100%' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{
          width: '100%',
          height: `${height}px`,
          display: 'block',
        }}
        preserveAspectRatio="none"
      >
        {/* Linha */}
        <polyline
          points={points}
          fill="none"
          stroke={displayColor}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Gradiente sob a linha */}
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={displayColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={displayColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Área preenchida */}
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill={`url(#gradient-${color})`}
        />
      </svg>

      {/* Label de tendência */}
      {showLabel && (
        <div
          style={{
            fontSize: '10px',
            color: displayColor,
            marginTop: '4px',
            fontWeight: '600',
            textAlign: 'center',
          }}
        >
          {isTrendingUp ? '↑ Crescente' : '↓ Decrescente'}
        </div>
      )}
    </div>
  );
}
