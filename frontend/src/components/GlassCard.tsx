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
        hoverable ? 'hover:-translate-y-1 hover:shadow-xl cursor-pointer' : ''
      } ${
        isDark
          ? 'bg-[#0f172a]/85 border border-slate-700/60 text-slate-100 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.5)] hover:border-slate-600'
          : 'bg-white/92 border border-slate-200/80 text-slate-900 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.05),0_1px_3px_0_rgba(15,23,42,0.03)] hover:border-slate-300'
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
