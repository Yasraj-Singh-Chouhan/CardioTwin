interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  badge?: React.ReactNode;
  footer?: React.ReactNode;
}

import React from 'react';

export default function StatCard({ label, value, subtitle, badge, footer }: StatCardProps) {
  return (
    <div
      className="relative overflow-hidden flex flex-col justify-between p-5"
      style={{
        background: 'rgba(255,255,255,0.60)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: '20px',
        boxShadow: '0 2px 8px -2px rgba(11,42,60,0.03)',
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="font-semibold uppercase tracking-wider"
          style={{ fontFamily: 'Inter', fontSize: '13px', color: '#4c6173', letterSpacing: '0.01em' }}
        >
          {label}
        </span>
        {badge}
      </div>
      <div className="my-2.5">
        <span
          className="font-bold tracking-tight tabular-nums"
          style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '36px', lineHeight: '44px', letterSpacing: '-0.015em', color: '#111e1d' }}
        >
          {value}
        </span>
      </div>
      {subtitle && (
        <p style={{ fontFamily: 'Inter', fontSize: '12px', color: '#4c6173' }}>{subtitle}</p>
      )}
      {footer && <div className="mt-2">{footer}</div>}
    </div>
  );
}
