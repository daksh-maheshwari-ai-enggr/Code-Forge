import React from 'react';

interface RiskGaugeProps {
  score: number;
  size?: number;
  showLabel?: boolean;
  label?: string;
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ score, size = 80, showLabel = true, label }) => {
  const radius = (size / 2) - 10;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  const color = clampedScore >= 75 ? '#ef4444' : clampedScore >= 35 ? '#f59e0b' : '#10b981';
  const glow = clampedScore >= 75 ? 'rgba(239,68,68,0.4)' : clampedScore >= 35 ? 'rgba(245,158,11,0.4)' : 'rgba(16,185,129,0.4)';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <filter id={`glow-${score}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {/* Background track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#1a2538" strokeWidth="8"
          />
          {/* Value arc */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 4px ${glow})` }}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-bold leading-none" style={{ color }}>{Math.round(clampedScore)}</span>
          <span className="text-[9px] text-slate-500 mt-0.5">/ 100</span>
        </div>
      </div>
      {showLabel && label && (
        <span className="text-[11px] text-slate-400 text-center font-medium leading-tight">{label}</span>
      )}
    </div>
  );
};

export default RiskGauge;
