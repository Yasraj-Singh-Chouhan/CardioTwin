import { useState } from 'react';
import { Activity, Heart, Gauge } from 'lucide-react';

interface CardiacModelViewerProps {
  sbp?: number;
  dbp?: number;
  heartRate?: number;
  rp?: number; // Peripheral resistance (mmHg*s/mL)
  cart?: number; // Compliance (mL/mmHg)
  riskScore?: number;
  className?: string;
  hideHeader?: boolean;
  compact?: boolean;
}

export function CardiacModelViewer({
  sbp = 154,
  dbp = 98,
  heartRate = 78,
  rp = 1.34,
  cart = 0.88,
  riskScore = 82,
  className = '',
  hideHeader = false,
  compact = false,
}: CardiacModelViewerProps) {
  const [activePart, setActivePart] = useState<'aorta' | 'ventricle' | 'microvessels' | null>(null);

  const isCrisis = sbp >= 165 || riskScore >= 75;
  const isElevated = sbp >= 135 || riskScore >= 45;

  // Pulse animation period in seconds (e.g. 60 / 78 = 0.77s)
  const beatDuration = Math.max(0.4, 60 / heartRate);

  // Status colors matching user's original brand palette
  const primaryColor = isCrisis ? '#ba1a1a' : isElevated ? '#b25e00' : '#00666f';

  return (
    <div
      className={`relative rounded-2xl transition-all duration-300 ${
        compact ? 'p-2 border-0 bg-transparent shadow-none' :
        isCrisis
          ? 'border border-red-300/80 bg-red-50/40 p-4 shadow-[0_8px_30px_rgba(186,26,26,0.12)] glass-card'
          : 'border border-white/90 bg-white/75 p-4 shadow-sm glass-card'
      } ${className}`}
    >
      {/* Top Clinical Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-black/5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs"
            style={{
              background: isCrisis
                ? 'linear-gradient(135deg, #ba1a1a 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #00666f 0%, #00818c 100%)',
              color: '#ffffff',
            }}
          >
            <Heart className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span
              className="text-[12px] font-bold text-[#111e1d] leading-none block"
              style={{ fontFamily: 'Plus Jakarta Sans' }}
            >
              3-Element Windkessel Biomechanical Chamber
            </span>
            <span className="text-[10px] text-[#445f73] font-medium">
              In Silico Lumped-Parameter Hemodynamics ODE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
              isCrisis
                ? 'bg-red-100 text-red-900 border-red-200'
                : isElevated
                ? 'bg-amber-100 text-amber-900 border-amber-200'
                : 'bg-emerald-100 text-emerald-900 border-emerald-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isCrisis ? 'bg-red-600 animate-ping' : 'bg-emerald-600 animate-pulse'}`}
            />
            {isCrisis ? 'CRISIS STRAIN' : isElevated ? 'ELEVATED TONE' : 'HOMEOSTASIS'}
          </span>
        </div>
      </div>
      )}

      {/* Main Cardiac Simulator Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Animated Biophysical Heart & Aortic Arch SVG */}
        <div className="md:col-span-7 flex flex-col items-center justify-center relative min-h-[220px] bg-gradient-to-b from-[#eaf6f5]/70 to-[#dff0ee]/40 rounded-2xl p-3 border border-[#00666f]/10">
          {/* Ambient Radiation Ring */}
          <div
            className="absolute w-44 h-44 rounded-full pointer-events-none transition-all duration-700 opacity-40 blur-2xl"
            style={{
              background: `radial-gradient(circle, ${primaryColor}40 0%, transparent 70%)`,
              animation: `pulse ${beatDuration}s infinite ease-in-out`,
            }}
          />

          <svg
            viewBox="0 0 300 240"
            className="w-full max-w-[280px] h-auto drop-shadow-md z-10 transition-transform duration-200"
            style={{
              animation: `cardiacContract ${beatDuration}s infinite ease-in-out`,
            }}
          >
            <style>{`
              @keyframes cardiacContract {
                0%, 100% { transform: scale(1); }
                15% { transform: scale(1.05); filter: drop-shadow(0 4px 12px rgba(0,102,111,0.25)); }
                30% { transform: scale(0.98); }
                45% { transform: scale(1.01); }
              }
              @keyframes flowDash {
                to { stroke-dashoffset: -40; }
              }
            `}</style>

            <defs>
              <linearGradient id="aorticGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ba1a1a" />
                <stop offset="60%" stopColor="#00666f" />
                <stop offset="100%" stopColor="#00818c" />
              </linearGradient>
            </defs>

            {/* Aortic Arch (Curved conduit) */}
            <path
              d="M 130 110 C 120 40, 200 30, 210 90 C 215 130, 205 180, 210 220"
              fill="none"
              stroke="url(#aorticGradLight)"
              strokeWidth={activePart === 'aorta' ? '18' : '14'}
              strokeLinecap="round"
              className="cursor-pointer transition-all duration-200 hover:opacity-100 opacity-90"
              onMouseEnter={() => setActivePart('aorta')}
              onMouseLeave={() => setActivePart(null)}
            />

            {/* Systolic Blood Ejection Wave (flowing dashes) */}
            <path
              d="M 130 110 C 120 40, 200 30, 210 90 C 215 130, 205 180, 210 220"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeDasharray="6 14"
              strokeLinecap="round"
              style={{
                animation: `flowDash ${Math.max(0.3, beatDuration * 0.8)}s linear infinite`,
              }}
            />

            {/* Left Ventricle (Biomechanical Pump Chamber) */}
            <path
              d="M 130 110 C 135 150, 160 190, 140 215 C 115 235, 75 195, 75 145 C 75 110, 110 95, 130 110 Z"
              fill={isCrisis ? 'rgba(186, 26, 26, 0.35)' : 'rgba(0, 102, 111, 0.25)'}
              stroke={primaryColor}
              strokeWidth={activePart === 'ventricle' ? '3.5' : '2.5'}
              className="cursor-pointer transition-all duration-200 hover:opacity-100"
              onMouseEnter={() => setActivePart('ventricle')}
              onMouseLeave={() => setActivePart(null)}
            />

            {/* Right Ventricle / Pulmonary Trunk */}
            <path
              d="M 75 145 C 55 125, 60 90, 95 80 C 110 75, 115 90, 110 105 Z"
              fill="rgba(76, 97, 115, 0.15)"
              stroke="#4c6173"
              strokeWidth="1.8"
              opacity="0.8"
            />

            {/* Microvascular Systemic Bed (Peripheral resistance mesh) */}
            <g
              className="cursor-pointer"
              onMouseEnter={() => setActivePart('microvessels')}
              onMouseLeave={() => setActivePart(null)}
            >
              <circle cx="210" cy="220" r="14" fill="rgba(0,102,111,0.08)" stroke="#00666f" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M 210 220 L 235 230 M 210 220 L 195 235 M 210 220 L 225 210" stroke="#00666f" strokeWidth="1.5" />
            </g>

            {/* Annotations */}
            <text x="145" y="45" fill="#111e1d" fontSize="9" fontFamily="monospace" fontWeight="bold">
              AORTA (C_art: {cart})
            </text>
            <text x="50" y="170" fill="#111e1d" fontSize="9" fontFamily="monospace" fontWeight="bold">
              LV CHAMBER
            </text>
            <text x="215" y="215" fill="#111e1d" fontSize="8" fontFamily="monospace">
              R_p BED
            </text>
          </svg>

          {/* Interactive Inspection Tooltip */}
          <div className="text-center mt-2 h-6">
            {activePart === 'aorta' && (
              <span className="font-mono text-xs text-[#00666f] font-bold animate-fadeIn">
                Aortic Compliance (C_art): {cart} mL/mmHg &bull; Elastance: {(1 / cart).toFixed(2)} mmHg/mL
              </span>
            )}
            {activePart === 'ventricle' && (
              <span className="font-mono text-xs text-[#111e1d] font-bold animate-fadeIn">
                Left Ventricle Contractility (E_max): 2.45 mmHg/mL &bull; Stroke Vol: 74 mL
              </span>
            )}
            {activePart === 'microvessels' && (
              <span className="font-mono text-xs text-[#ba1a1a] font-bold animate-fadeIn">
                Systemic Vascular Resistance (R_p): {rp} mmHg·s/mL &bull; Vasoconstriction +24%
              </span>
            )}
            {!activePart && (
              <span className="text-[11px] text-[#445f73]">
                Hover over chambers or aortic arch to inspect biophysical ODE parameters
              </span>
            )}
          </div>
        </div>

        {/* Tactical Parameters Column */}
        <div className="md:col-span-5 flex flex-col gap-3">
          {/* Compliance Meter */}
          <div className="bg-white/80 border border-gray-100 rounded-2xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#111e1d] flex items-center gap-1.5 font-semibold">
                <Gauge className="w-3.5 h-3.5 text-[#00666f]" /> Arterial Compliance (C_art)
              </span>
              <span className="font-mono font-bold text-[#00666f]">{cart} mL/mmHg</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (cart / 1.5) * 100)}%`,
                  backgroundColor: cart < 0.8 ? '#ba1a1a' : cart < 1.1 ? '#b25e00' : '#00666f',
                }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-[#445f73] mt-1">
              <span>0.4 (Stiff/Calcified)</span>
              <span>1.5 (Elastic)</span>
            </div>
          </div>

          {/* Peripheral Resistance Meter */}
          <div className="bg-white/80 border border-gray-100 rounded-2xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#111e1d] flex items-center gap-1.5 font-semibold">
                <Activity className="w-3.5 h-3.5 text-[#00818c]" /> Peripheral Resistance (R_p)
              </span>
              <span className="font-mono font-bold text-[#ba1a1a]">{rp} mmHg·s/mL</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (rp / 2.0) * 100)}%`,
                  backgroundColor: rp > 1.4 ? '#ba1a1a' : rp > 1.1 ? '#b25e00' : '#00666f',
                }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-[#445f73] mt-1">
              <span>0.8 (Vasodilated)</span>
              <span>2.0 (Severe Constriction)</span>
            </div>
          </div>

          {/* Vitals Summary Pill */}
          <div
            className="rounded-2xl p-3.5 border flex items-center justify-between shadow-2xs"
            style={{
              backgroundColor: isCrisis ? 'rgba(255, 218, 214, 0.4)' : 'rgba(226, 241, 239, 0.6)',
              borderColor: isCrisis ? 'rgba(186, 26, 26, 0.25)' : 'rgba(0, 102, 111, 0.2)',
            }}
          >
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#445f73]">
                PULSE PRESSURE
              </div>
              <div className="font-mono font-black text-xl text-[#111e1d]">
                {sbp - dbp} <span className="text-xs font-normal text-[#445f73]">mmHg</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#445f73]">
                CALC MEAN ARTERIAL PRESSURE
              </div>
              <div className="font-mono font-black text-xl text-[#00666f]">
                {Math.round(dbp + (sbp - dbp) / 3)} <span className="text-xs font-normal text-[#445f73]">mmHg</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
