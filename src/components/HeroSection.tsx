import { ReactNode } from 'react';

interface HeroSectionProps {
  greeting?: string;
  status: string;
  healthScore: number;
  children: ReactNode;
}

export function HeroSection({
  greeting = 'Bom dia',
  status,
  healthScore,
  children,
}: HeroSectionProps) {
  return (
    <div className="card p-8 mb-8 overflow-hidden relative">
      {/* Background gradient */}
      <div className="absolute -right-20 -top-20 w-40 h-40 bg-[rgba(255,98,0,0.05)] rounded-full blur-3xl"></div>
      <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-[rgba(59,130,246,0.05)] rounded-full blur-3xl"></div>

      {/* Content */}
      <div className="relative">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-var(--text-primary) mb-2">
              {greeting}, Pablo.
            </h1>
            <p className="text-var(--text-secondary)">
              {status}
            </p>
          </div>

          {/* Health Score Badge */}
          <div className="flex flex-col items-end">
            <div className="relative w-24 h-24 mb-2">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#FF6200"
                  strokeWidth="8"
                  strokeDasharray={`${45 * 2 * Math.PI * (healthScore / 100)} ${45 * 2 * Math.PI}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-var(--text-primary)">
                  {healthScore}
                </span>
                <span className="text-xs text-var(--text-tertiary)">score</span>
              </div>
            </div>
            <span className="text-xs text-var(--text-secondary) font-medium">Saúde</span>
          </div>
        </div>

        {/* KPI Grid */}
        {children}
      </div>
    </div>
  );
}
