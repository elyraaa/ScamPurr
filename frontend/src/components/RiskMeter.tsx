import { motion } from 'framer-motion';
import { cn, getRiskEmoji } from '../lib/utils';
import type { RiskLabel } from '../types';


interface RiskMeterProps {
  score: number;
  label: RiskLabel;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const SIZE_MAP = {
  sm: { outer: 100, stroke: 8, fontSize: 'text-xl', labelSize: 'text-xs' },
  md: { outer: 160, stroke: 12, fontSize: 'text-3xl', labelSize: 'text-sm' },
  lg: { outer: 220, stroke: 16, fontSize: 'text-5xl', labelSize: 'text-base' },
};

export function RiskMeter({ score, label, size = 'md', animated = true }: RiskMeterProps) {
  const cfg = SIZE_MAP[size];
  const radius = (cfg.outer - cfg.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = cfg.outer / 2;

  // 270° arc (from 135° to 405°, i.e. -135deg start)
  const arcFraction = (score / 100) * 0.75; // 75% of full circle
  const dashoffset = circumference * (1 - arcFraction);

  const gradientId = `risk-gradient-${label}`;

  const LABEL_COLORS: Record<RiskLabel, string> = {
    LOW: '#10b981',
    MEDIUM: '#f59e0b',
    HIGH: '#f97316',
    CRITICAL: '#ef4444',
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: cfg.outer, height: cfg.outer }}>
        <svg width={cfg.outer} height={cfg.outer} className="-rotate-[135deg]">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {score < 30 && (
                <>
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </>
              )}
              {score >= 30 && score < 60 && (
                <>
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#eab308" />
                </>
              )}
              {score >= 60 && score < 80 && (
                <>
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </>
              )}
              {score >= 80 && (
                <>
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#dc2626" />
                </>
              )}
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={cfg.stroke}
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round"
          />

          {/* Score arc */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={cfg.stroke}
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round"
            initial={animated ? { strokeDashoffset: circumference * 0.75 } : undefined}
            animate={{ strokeDashoffset: dashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
            strokeDashoffset={animated ? undefined : dashoffset}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-black leading-none', cfg.fontSize)} style={{ color: LABEL_COLORS[label] }}>
            {Math.round(score)}
          </span>
          <span className="text-slate-500 text-xs font-medium mt-0.5">/ 100</span>
        </div>
      </div>

      {/* Label badge */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">{getRiskEmoji(label)}</span>
        <span
          className={cn('font-bold tracking-widest uppercase text-sm px-3 py-1 rounded-full border')}
          style={{
            color: LABEL_COLORS[label],
            borderColor: LABEL_COLORS[label] + '40',
            backgroundColor: LABEL_COLORS[label] + '15',
          }}
        >
          {label} RISK
        </span>
      </div>
    </div>
  );
}
