import React from 'react';
import { useTheme } from '../context/ThemeContext';

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
  radius = 20,
  hoverable = false,
}: GlassCardProps) {
  const { isDark } = useTheme();

  return (
    <div
      className={`relative backdrop-blur-xl transition-all duration-300 ${
        hoverable ? 'hover:-translate-y-1 hover:shadow-2xl cursor-pointer' : ''
      } ${
        isDark
          ? 'bg-[#0e1626]/75 border border-white/[0.08] text-[#e2f1ef] shadow-[0_16px_48px_-8px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.08)] hover:border-cyan-400/30'
          : 'bg-white/75 border border-white/85 text-[#111e1d] shadow-[0_12px_40px_-6px_rgba(11,42,60,0.06),inset_0_1px_2px_rgba(255,255,255,0.95)]'
      } ${className}`}
      style={{
        borderRadius: `${radius}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
