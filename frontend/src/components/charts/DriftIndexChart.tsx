import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  CartesianGrid,
} from 'recharts';
import type { DriftPoint } from '../../api/types';

interface DriftIndexChartProps {
  trend: DriftPoint[];
  liveTdi?: number;
}

export function DriftIndexChart({ trend, liveTdi }: DriftIndexChartProps) {
  const chartData = trend.map((pt, idx) => {
    const isToday = idx === trend.length - 1;
    const score = isToday && liveTdi !== undefined ? liveTdi : pt.tdi_score;

    return {
      date: pt.date,
      dayLabel: pt.day_label,
      tdi: score,
      flag: pt.flag,
    };
  });

  return (
    <div className="w-full h-56 relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 15, right: 25, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="tdiGradientRecharts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00666f" stopOpacity={0.35} />
              <stop offset="70%" stopColor="#00666f" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#00666f" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#bcc9cb" strokeOpacity={0.3} vertical={false} />

          {/* Nominal Green Band (0 - 25) */}
          <ReferenceArea y1={0} y2={25} fill="#2FBF9B" fillOpacity={0.12} />

          <XAxis
            dataKey="date"
            stroke="#445f73"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#bcc9cb', strokeOpacity: 0.5 }}
          />

          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            stroke="#445f73"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div
                    className="p-3 rounded-xl text-[12px] shadow-lg border border-white/40"
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <div className="font-bold text-[#111e1d] mb-1">
                      {data.date} · {data.dayLabel}
                    </div>
                    <div className="flex items-center gap-2 text-[#00666f]">
                      <span className="w-2 h-2 rounded-full bg-[#00666f]"></span>
                      <span>Twin Drift Index: <strong>{data.tdi} / 100</strong></span>
                    </div>
                    {data.flag && (
                      <p className="mt-1.5 text-[11px] text-[#8E6200] max-w-xs leading-tight">
                        {data.flag}
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />

          {/* Alert Threshold line */}
          <ReferenceLine
            y={50}
            stroke="#F2704F"
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{
              value: 'Divergence Alert Threshold (TDI ≥ 50)',
              position: 'insideTopRight',
              fill: '#A3381B',
              fontSize: 10,
              fontWeight: 600,
            }}
          />

          {/* Nominal Threshold line */}
          <ReferenceLine
            y={25}
            stroke="#2FBF9B"
            strokeOpacity={0.6}
            strokeWidth={1}
            label={{
              value: 'Nominal Fidelity Limit (25)',
              position: 'insideBottomLeft',
              fill: '#196C57',
              fontSize: 10,
              fontWeight: 500,
            }}
          />

          <Area
            type="monotone"
            dataKey="tdi"
            stroke="#00666f"
            strokeWidth={3}
            fill="url(#tdiGradientRecharts)"
            dot={{ r: 4.5, fill: '#ffffff', stroke: '#00666f', strokeWidth: 2.5 }}
            activeDot={{ r: 6, fill: '#F5B83D', stroke: '#ffffff', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
