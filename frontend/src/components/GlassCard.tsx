import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  radius?: number;
  hoverable?: boolean;
}

export default function GlassCard({
  children,
  className = '',
  style,
  radius = 24,
  hoverable = false,
}: GlassCardProps) {
  return (
    <div
      className={`${className} ${hoverable ? 'hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200' : ''}`}
      style={{
        background: 'rgba(255, 255, 255, 0.68)',
        backdropFilter: 'blur(28px) saturate(190%)',
        WebkitBackdropFilter: 'blur(28px) saturate(190%)',
        border: '1px solid rgba(255, 255, 255, 0.82)',
        boxShadow:
          'inset 0 1px 1px 0 rgba(255, 255, 255, 0.9), 0 10px 32px -4px rgba(11, 42, 60, 0.05), 0 2px 8px -2px rgba(11, 42, 60, 0.03)',
        borderRadius: `${radius}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
