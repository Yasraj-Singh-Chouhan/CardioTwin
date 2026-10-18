import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import type { EnvironmentData } from '../../api/types';

interface EnvironmentTimelineChartProps {
  current: EnvironmentData;
  forecast: EnvironmentData[];
}

export function EnvironmentTimelineChart({ current, forecast }: EnvironmentTimelineChartProps) {
  const chartData = [
    {
      time: 'Day -1',
      aqi: 320,
      pm25: 210,
      temp: 16.0,
      humidity: 62,
    },
    {
      time: '12h ago',
      aqi: 345,
      pm25: 245,
      temp: 15.1,
      humidity: 65,
    },
    {
      time: 'Now (Diwali peak)',
      aqi: current.aqi,
      pm25: current.pm25_ug_m3,
      temp: current.temperature_c,
      humidity: current.humidity_percent,
    },
    ...forecast.map((f, i) => ({
      time: `+${(i + 1) * 6}h Forecast`,
      aqi: f.aqi,
      pm25: f.pm25_ug_m3,
      temp: f.temperature_c,
      humidity: f.humidity_percent,
    })),
  ];

  return (
    <div className="w-full h-64 relative">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#bcc9cb" strokeOpacity={0.3} vertical={false} />

          <XAxis
            dataKey="time"
            stroke="#445f73"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#bcc9cb', strokeOpacity: 0.5 }}
          />

          {/* Left YAxis: PM2.5 / AQI */}
          <YAxis
            yAxisId="pollution"
            stroke="#ba1a1a"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={[0, 450]}
          />

          {/* Right YAxis: Temperature (°C) */}
          <YAxis
            yAxisId="temp"
            orientation="right"
            stroke="#00666f"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={[10, 25]}
            tickFormatter={(v) => `${v}°`}
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
                    <div className="font-bold text-[#111e1d] mb-1">{data.time}</div>
                    <div className="flex items-center gap-2 text-[#ba1a1a]">
                      <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
                      <span>AQI: <strong>{data.aqi}</strong> (PM2.5: {data.pm25} µg/m³)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#00666f] mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-[#00666f]"></span>
                      <span>Ambient Temp: <strong>{data.temp}°C</strong></span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />

          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            formatter={(value) => (
              <span className="text-[#445f73] font-medium">{value}</span>
            )}
          />

          {/* PM2.5 bar */}
          <Bar
            yAxisId="pollution"
            dataKey="pm25"
            name="PM2.5 (µg/m³)"
            fill="#ba1a1a"
            fillOpacity={0.65}
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />

          {/* Temperature chill line */}
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="temp"
            name="Ambient Chill (°C)"
            stroke="#00666f"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#ffffff', stroke: '#00666f', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
