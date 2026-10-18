import { getRiskTierConfig, type RiskTier } from '../data/patients';

interface RiskBadgeProps {
  tier: RiskTier | string;
  size?: 'sm' | 'md';
}

export default function RiskBadge({ tier, size = 'md' }: RiskBadgeProps) {
  const cfg = getRiskTierConfig(tier as string);
  const padding = size === 'sm' ? '2px 8px' : '2px 10px';
  const fontSize = '11px';

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-semibold"
      style={{
        padding,
        fontSize,
        fontFamily: 'Inter',
        letterSpacing: '0.04em',
        lineHeight: '14px',
        fontWeight: 600,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${cfg.ping ? 'animate-ping' : ''}`}
        style={{ background: cfg.dot }}
      />
      {cfg.label}
    </span>
  );
}
