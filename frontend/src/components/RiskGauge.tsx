import { getRiskTierConfig, type RiskTier } from '../data/patients';

interface RiskGaugeProps {
  value: number; // 0-100
  tier: RiskTier | string;
  size?: number;
}

export default function RiskGauge({ value, tier, size = 230 }: RiskGaugeProps) {
  const cfg = getRiskTierConfig(tier as string);
  const clampedValue = Math.min(100, Math.max(0, value));

  // Semicircle arc: radius=90, total arc = π*90 ≈ 282.74
  const radius = 90;
  const centerX = 110;
  const centerY = 110;
  const totalArc = Math.PI * radius;
  const activeArc = (clampedValue / 100) * totalArc;
  const dashOffset = totalArc - activeArc;

  // Exact needle dot coordinates
  const rad = Math.PI - (clampedValue / 100) * Math.PI;
  const dotX = centerX + radius * Math.cos(rad);
  const dotY = centerY - radius * Math.sin(rad);

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <svg
        width={size}
        height={size * 0.62}
        viewBox="0 0 220 125"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="gaugeTrack" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2FBF9B" />
            <stop offset="35%" stopColor="#2FBF9B" />
            <stop offset="60%" stopColor="#F5B83D" />
            <stop offset="82%" stopColor="#F2704F" />
            <stop offset="100%" stopColor="#ba1a1a" />
          </linearGradient>

          <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer subtle guide arc */}
        <path
          d={`M ${centerX - radius - 5} ${centerY} A ${radius + 5} ${radius + 5} 0 0 1 ${centerX + radius + 5} ${centerY}`}
          fill="none"
          stroke="rgba(0, 102, 111, 0.08)"
          strokeWidth="1"
          strokeDasharray="2 3"
        />

        {/* Background arc track */}
        <path
          d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
          fill="none"
          stroke="#E2EBEA"
          strokeWidth="15"
          strokeLinecap="round"
        />

        {/* Active colored gradient arc */}
        <path
          d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
          fill="none"
          stroke="url(#gaugeTrack)"
          strokeWidth="15"
          strokeLinecap="round"
          strokeDasharray={totalArc}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map(tick => {
          const tickRad = Math.PI - (tick / 100) * Math.PI;
          const tx1 = centerX + (radius - 12) * Math.cos(tickRad);
          const ty1 = centerY - (radius - 12) * Math.sin(tickRad);
          const tx2 = centerX + (radius - 17) * Math.cos(tickRad);
          const ty2 = centerY - (radius - 17) * Math.sin(tickRad);

          return (
            <line
              key={tick}
              x1={tx1}
              y1={ty1}
              x2={tx2}
              y2={ty2}
              stroke="#8B9B9E"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          );
        })}

        {/* Dynamic Needle Dot */}
        <circle
          cx={dotX}
          cy={dotY}
          r="9"
          fill="#FFFFFF"
          filter="url(#gaugeGlow)"
          className="shadow-md"
        />
        <circle
          cx={dotX}
          cy={dotY}
          r="5.5"
          fill={cfg.dot}
          className={clampedValue >= 75 ? 'animate-pulse' : ''}
        />
      </svg>

      {/* Central Metric Value */}
      <div className="absolute bottom-0 flex flex-col items-center">
        <div className="flex items-baseline leading-none">
          <span
            className="font-bold font-mono tracking-tight"
            style={{
              fontSize: `${Math.round(size * 0.17)}px`,
              color: clampedValue >= 75 ? '#ba1a1a' : clampedValue >= 50 ? '#b25e00' : '#00666f',
              letterSpacing: '-0.03em',
            }}
          >
            {clampedValue}
          </span>
          <span
            className="font-bold text-[#445f73] font-mono ml-0.5"
            style={{ fontSize: `${Math.round(size * 0.085)}px` }}
          >
            %
          </span>
        </div>
        <span
          className="text-[9.5px] font-bold uppercase tracking-widest text-[#445f73] mt-0.5"
          style={{ letterSpacing: '0.08em' }}
        >
          Composite Stress Index
        </span>
      </div>
    </div>
  );
}
