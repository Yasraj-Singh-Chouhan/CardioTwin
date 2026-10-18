import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { ShapContribution } from '../../api/types';

interface ShapBarsChartProps {
  contributions: ShapContribution[];
}

export function ShapBarsChart({ contributions }: ShapBarsChartProps) {
  const chartData = contributions.map(item => ({
    name: item.feature_name,
    value: item.contribution_value,
    direction: item.direction,
    category: item.category,
    color: item.direction === 'increases_risk' ? '#ba1a1a' : '#196C57',
  }));

  return (
    <div className="w-full h-72 relative">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
        >
          <XAxis
            type="number"
            domain={[-0.2, 0.4]}
            tickFormatter={(v) => (v > 0 ? `+${v}` : `${v}`)}
            stroke="#445f73"
            fontSize={11}
            tickLine={false}
          />

          <YAxis
            type="category"
            dataKey="name"
            stroke="#111e1d"
            fontSize={12}
            tickLine={false}
            width={180}
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
                    <div className="font-bold text-[#111e1d] mb-1">{data.name}</div>
                    <div className="text-[11px] text-[#445f73] mb-1.5">{data.category}</div>
                    <div className={`font-mono font-bold ${data.direction === 'increases_risk' ? 'text-[#ba1a1a]' : 'text-[#196C57]'}`}>
                      SHAP: {data.value > 0 ? `+${data.value.toFixed(2)}` : data.value.toFixed(2)}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />

          <ReferenceLine x={0} stroke="#445f73" strokeWidth={1.5} />

          <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
