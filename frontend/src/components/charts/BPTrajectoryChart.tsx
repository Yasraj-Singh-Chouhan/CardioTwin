import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import type { TrajectoryPoint } from '../../api/types';

interface BPTrajectoryChartProps {
  trajectory: TrajectoryPoint[];
  liveSbp?: number;
  liveDbp?: number;
}

export function BPTrajectoryChart({ trajectory, liveSbp, liveDbp }: BPTrajectoryChartProps) {
  const chartData = trajectory.map(pt => {
    const isNow = pt.offset_hours === 0;
    const currentSbp = isNow && liveSbp ? liveSbp : pt.predicted_sbp;
    const currentDbp = isNow && liveDbp ? liveDbp : pt.predicted_dbp;

    return {
      offset: pt.offset_hours,
      timeLabel: pt.offset_hours === 0 ? 'Now' : `${pt.offset_hours > 0 ? '+' : ''}${pt.offset_hours}h`,
      observedSbp: pt.observed_sbp,
      observedDbp: pt.observed_dbp,
      predictedSbp: pt.is_forecast ? currentSbp : null,
      predictedDbp: pt.is_forecast ? currentDbp : null,
      connectedSbp: currentSbp,
      connectedDbp: currentDbp,
      upperEnvelope: pt.upper_envelope_sbp,
      lowerEnvelope: pt.lower_envelope_sbp,
      isForecast: pt.is_forecast,
    };
  });

  return (
    <div className="w-full h-60 relative select-none">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 15, right: 20, left: -15, bottom: 5 }}>
          <defs>
            <linearGradient id="forecastArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ba1a1a" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#ba1a1a" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="observedArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00666f" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#00666f" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#bcc9cb" strokeOpacity={0.25} vertical={false} />

          <XAxis
            dataKey="timeLabel"
            stroke="#445f73"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#bcc9cb', strokeOpacity: 0.4 }}
          />

          <YAxis
            domain={[60, 200]}
            ticks={[60, 80, 100, 120, 140, 160, 180, 200]}
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
                    className="p-3.5 rounded-2xl text-[12px] shadow-xl border border-white/80"
                    style={{
                      background: 'rgba(255, 255, 255, 0.96)',
                      backdropFilter: 'blur(16px)',
                    }}
                  >
                    <div className="font-bold text-[#111e1d] mb-1.5 flex items-center justify-between gap-3">
                      <span>{data.timeLabel}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gray-100 text-[#445f73] uppercase font-bold">
                        {data.offset >= 0 ? 'Windkessel Forecast' : 'Observed Inflow'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-[#ba1a1a] font-mono">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
                        Systolic SBP:
                      </span>
                      <strong>{data.connectedSbp} mmHg</strong>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-[#00666f] font-mono mt-0.5">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#00666f]" />
                        Diastolic DBP:
                      </span>
                      <strong>{data.connectedDbp} mmHg</strong>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-[#445f73] font-mono text-[11px] mt-1 pt-1 border-t border-gray-100">
                      <span>Pulse Pressure:</span>
                      <span>{data.connectedSbp - data.connectedDbp} mmHg</span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />

          {/* Hypertensive Crisis Threshold Line 180 mmHg */}
          <ReferenceLine
            y={180}
            stroke="#ba1a1a"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: 'Crisis Threshold (180 mmHg)',
              position: 'insideTopLeft',
              fill: '#ba1a1a',
              fontSize: 10,
              fontWeight: 700,
            }}
          />

          {/* Target Normotensive Line 130 mmHg */}
          <ReferenceLine
            y={130}
            stroke="#2FBF9B"
            strokeDasharray="3 3"
            strokeOpacity={0.6}
            label={{
              value: 'Safe Guideline Target (130 mmHg)',
              position: 'insideBottomLeft',
              fill: '#196C57',
              fontSize: 10,
            }}
          />

          {/* Zero Now marker */}
          <ReferenceLine x="Now" stroke="#00666f" strokeDasharray="2 2" strokeWidth={1.5} />

          {/* Shaded Forecast Area */}
          <Area
            type="monotone"
            dataKey="predictedSbp"
            stroke="none"
            fill="url(#forecastArea)"
            isAnimationActive={false}
          />

          {/* Historical Observed Telemetry SBP Line */}
          <Line
            type="monotone"
            dataKey="observedSbp"
            stroke="#00666f"
            strokeWidth={3}
            dot={{ r: 4, fill: '#ffffff', stroke: '#00666f', strokeWidth: 2 }}
            isAnimationActive={false}
          />

          {/* Future In Silico Simulated Forecast SBP Line */}
          <Line
            type="monotone"
            dataKey="predictedSbp"
            stroke="#ba1a1a"
            strokeWidth={2.5}
            strokeDasharray="5 4"
            dot={{ r: 4, fill: '#ba1a1a', stroke: '#ffffff', strokeWidth: 2 }}
            isAnimationActive={false}
          />

          {/* Diastolic Blood Pressure Line */}
          <Line
            type="monotone"
            dataKey="connectedDbp"
            stroke="#4c6173"
            strokeWidth={1.8}
            strokeDasharray="3 3"
            dot={{ r: 3, fill: '#ffffff', stroke: '#4c6173', strokeWidth: 1.5 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
