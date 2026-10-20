import { useState } from 'react';
import {
  Layers,
  Sparkles,
  Heart,
  User,
  Activity,
} from 'lucide-react';
import { FullBodyHeartView } from './FullBodyHeartView';
import { OverviewConditionsView } from './OverviewConditionsView';
import { PatientPathologyView } from './PatientPathologyView';

interface ClinicalInspirationHubProps {
  patientId?: string;
  patientName?: string;
  heartRate?: number;
  sbp?: number;
  dbp?: number;
  riskScore?: number;
  childrenIcuTwin?: React.ReactNode;
}

export type InspirationMode = 'full_body' | 'overview' | 'pathology' | 'icu_twin';

export function ClinicalInspirationHub({
  patientId: _patientId = 'CT-3092',
  patientName = 'Jacqueline Delaney',
  heartRate = 92,
  sbp = 124,
  dbp = 80,
  riskScore: _riskScore = 84,
  childrenIcuTwin,
}: ClinicalInspirationHubProps) {
  // Active inspiration view mode: default to Mode 1 (Full Body / Heart Details from Image 1)
  const [activeMode, setActiveMode] = useState<InspirationMode>('full_body');

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Floating View Mode Switcher Toolbar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] select-none">
        {/* Left: Indicator of Inspiration Fidelity */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1d5bf0] to-[#437ef7] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-slate-900 leading-none">
                Clinical Digital Twin UI
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1d5bf0] text-[10px] font-bold font-mono border border-blue-100">
                Pixel-Accurate
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Toggle between the 3 inspiration designs &amp; the deep ICU ODE solver
            </span>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60">
          {/* Mode 1: Full Body & Heart Details (Image 1) */}
          <button
            type="button"
            onClick={() => setActiveMode('full_body')}
            className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold flex items-center gap-2 transition-all ${
              activeMode === 'full_body'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Design 1: Torso Silhouette + Pulse Radii + Available Doctors + Sparkline Vitals"
          >
            <Layers className="w-3.5 h-3.5 text-[#1d5bf0]" />
            <span>Full Body / Heart</span>
          </button>

          {/* Mode 2: Overview Conditions (Image 2) */}
          <button
            type="button"
            onClick={() => setActiveMode('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold flex items-center gap-2 transition-all ${
              activeMode === 'overview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Design 2: Overview Conditions + Hotspots + My Schedule + Body Carousel"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Overview Conditions</span>
          </button>

          {/* Mode 3: Patient Details & Pathology (Image 3) */}
          <button
            type="button"
            onClick={() => setActiveMode('pathology')}
            className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold flex items-center gap-2 transition-all ${
              activeMode === 'pathology'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Design 3: Jacqueline Delaney Profile + Disorders + Aorta Pathology Highlight + Donut Gauge"
          >
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>Patient &amp; Pathology</span>
          </button>

          {/* Mode 4: ICU Biophysics & ODE Simulation */}
          {childrenIcuTwin && (
            <button
              type="button"
              onClick={() => setActiveMode('icu_twin')}
              className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold flex items-center gap-2 transition-all ${
                activeMode === 'icu_twin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Advanced ICU ODE Simulator, Continuous Tonometry, SBAR & Vasodilator Titration"
            >
              <Activity className="w-3.5 h-3.5 text-purple-600" />
              <span>CCU Hemodynamics ODE</span>
            </button>
          )}
        </div>
      </div>

      {/* Render Selected View */}
      <div className="w-full">
        {activeMode === 'full_body' && (
          <FullBodyHeartView
            patientName={patientName}
            heartRate={heartRate}
            sbp={sbp}
            dbp={dbp}
            glucose={230}
            bloodSugar="120/160"
          />
        )}

        {activeMode === 'overview' && (
          <OverviewConditionsView
            heartRate={heartRate || 120}
            sbp={sbp || 116}
            dbp={dbp || 70}
            glucose="230/ml"
            bloodCount="80-90"
          />
        )}

        {activeMode === 'pathology' && (
          <PatientPathologyView
            onBack={() => setActiveMode('full_body')}
          />
        )}

        {activeMode === 'icu_twin' && childrenIcuTwin}
      </div>
    </div>
  );
}
