import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPatientDetail, runScenario, getPrescriptions } from '../api/client';
import type { ScenarioRequest } from '../api/types';
import GlassCard from '../components/GlassCard';
import { GlassSkeleton, GlassError } from '../components/GlassState';

const SCENARIO_TILES = [
  { id: 'missed_dose', label: 'Missed Antihypertensive', sub: 'Amlodipine 5mg · +24h Omission', icon: 'medication' },
  { id: 'acute_exertion', label: 'Acute Stress & Exertion', sub: 'Autonomic overload / HIIT', icon: 'directions_run' },
  { id: 'sympathetic_surge', label: 'Diwali Microclimate Surge', sub: 'AQI 380+ & High Cortisol Spike', icon: 'psychology' },
];

export default function ScenariosPage() {
  const { id } = useParams<{ id: string }>();
  const patientId = id || 'CT-3092';

  const [activeScenario, setActiveScenario] = useState<ScenarioRequest['scenario_type']>('missed_dose');
  const [durationHours, setDurationHours] = useState(24);
  const [simulatedPlan, setSimulatedPlan] = useState<{ rank: number; title: string } | null>(null);

  const patientQuery = useQuery({
    queryKey: ['patientDetail', patientId],
    queryFn: () => getPatientDetail(patientId),
  });

  const scenarioQuery = useQuery({
    queryKey: ['scenario', patientId, activeScenario, durationHours, simulatedPlan?.rank],
    queryFn: () => runScenario(patientId, {
      scenario_type: simulatedPlan ? 'prescription_plan' : activeScenario,
      duration_hours: durationHours,
      prescription_rank: simulatedPlan?.rank,
      plan_title: simulatedPlan?.title,
    }),
  });

  const prescriptionsQuery = useQuery({
    queryKey: ['prescriptions', patientId],
    queryFn: () => getPrescriptions(patientId),
  });

  const isLoading = patientQuery.isLoading || scenarioQuery.isLoading || prescriptionsQuery.isLoading;
  const isError = patientQuery.isError || scenarioQuery.isError || prescriptionsQuery.isError;
  const error = patientQuery.error || scenarioQuery.error || prescriptionsQuery.error;

  const patient = patientQuery.data;
  const scenario = scenarioQuery.data;
  const prescriptions = prescriptionsQuery.data;

  return (
    <div className="flex flex-col w-full max-w-[1560px] mx-auto gap-5 mt-4 pb-10">
      {isLoading && <GlassSkeleton lines={6} />}
      {isError && (
        <GlassError
          message={(error as Error)?.message}
          onRetry={() => {
            patientQuery.refetch();
            scenarioQuery.refetch();
            prescriptionsQuery.refetch();
          }}
        />
      )}

      {patient && scenario && prescriptions && (
        <>
          {/* Top Context Breadcrumb */}
          <GlassCard className="w-full flex flex-wrap items-center justify-between gap-4 px-6 py-4 border border-white/80">
            <div className="flex items-center gap-3">
              <Link
                to={`/patients/${patient.patient_id}`}
                className="w-9 h-9 rounded-xl bg-white/80 hover:bg-white text-[#445f73] flex items-center justify-center transition-all shadow-xs border border-white"
              >
                <span className="material-symbols-outlined text-[19px]">arrow_back</span>
              </Link>
              <div className="flex items-center gap-2.5 text-[13px] flex-wrap">
                <span className="text-[#445f73] font-semibold">Patient Twin</span>
                <span className="text-[#bcc9cb]">/</span>
                <span className="font-bold text-[#111e1d]">{patient.name}</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#e0f1ef] text-[#00666f] font-mono font-bold">
                  {patient.patient_id}
                </span>
                <span className="text-[#bcc9cb]">&bull;</span>
                <span className="text-[#445f73]">{patient.age}y {patient.sex} &bull; {patient.city}</span>
                <span className="text-[#bcc9cb]">&bull;</span>
                <span className="text-[#00666f] font-bold">What-If In Silico Testing Sandbox</span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#2FBF9B]/15 text-[#196C57] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#196C57] animate-pulse" />
              {scenario.state_label}
            </span>
          </GlassCard>

          {/* Interactive Scenario Selector Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SCENARIO_TILES.map(tile => {
              const isActive = activeScenario === tile.id && !simulatedPlan;

              return (
                <button
                  key={tile.id}
                  onClick={() => {
                    setSimulatedPlan(null);
                    setActiveScenario(tile.id as ScenarioRequest['scenario_type']);
                  }}
                  className={`p-5 rounded-2xl text-left transition-all flex flex-col justify-between border ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00666f] to-[#00818c] text-white shadow-md border-transparent scale-[1.01]'
                      : 'glass-card hover:bg-white text-[#111e1d] border-white/80'
                  }`}
                  type="button"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#e2f1ef] text-[#00666f]'
                    }`}>
                      <span className="material-symbols-outlined text-[22px]">{tile.icon}</span>
                    </div>
                    {isActive && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full font-mono">
                        Active Sandbox
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className={`text-[15px] font-bold ${isActive ? 'text-white' : 'text-[#111e1d]'}`}>
                      {tile.label}
                    </h3>
                    <p className={`text-[12px] mt-0.5 ${isActive ? 'text-white/80' : 'text-[#445f73]'}`}>
                      {tile.sub}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Prescription Plan Notification (If active) */}
          {simulatedPlan && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between shadow-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-emerald-950">
                      Simulating Countermeasure Policy #{simulatedPlan.rank}: {simulatedPlan.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold">
                      IN SILICO RECOVERY
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Calculated arterial compliance (C_art) restoration and autonomic vagal decompression active.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSimulatedPlan(null)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 font-semibold text-[12px] shadow-2xs border border-emerald-200 flex items-center gap-1 transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">undo</span>
                <span>Reset to Standard Scenarios</span>
              </button>
            </div>
          )}

          {/* Scenario Details & Trajectory Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left: Simulation Chart & Slider (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              <GlassCard className="p-6 flex flex-col border border-white/80">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#00666f] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px]">show_chart</span>
                      Dynamic Trajectory Forecast
                    </span>
                    <h2 className="text-[18px] font-bold text-[#111e1d]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                      {scenario.scenario_title}
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#445f73] font-medium">Projected Peak SBP</span>
                    <div className={`text-[24px] font-bold font-mono leading-none ${
                      scenario.perturbed_peak_sbp >= 170 ? 'text-[#ba1a1a]' : 'text-[#196C57]'
                    }`}>
                      {scenario.perturbed_peak_sbp} mmHg
                    </div>
                  </div>
                </div>

                {/* Duration Slider with Medical Styling */}
                <div className="p-4 rounded-xl bg-white/70 border border-gray-100 mb-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#445f73] font-semibold">Simulation Window Horizon</span>
                    <span className="font-mono font-bold text-[#00666f] bg-[#e0f1ef] px-2 py-0.5 rounded">
                      {durationHours} hours
                    </span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="48"
                    step="6"
                    value={durationHours}
                    onChange={e => setDurationHours(Number(e.target.value))}
                    className="w-full accent-[#00666f] cursor-pointer h-2 bg-gray-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-[#445f73] font-mono">
                    <span>6h</span>
                    <span>12h</span>
                    <span>24h (Standard)</span>
                    <span>36h</span>
                    <span>48h (Extended)</span>
                  </div>
                </div>

                {/* Trajectory Comparison Chart SVG */}
                <div className="w-full bg-white/85 rounded-2xl p-3 relative overflow-hidden border border-gray-100 shadow-2xs">
                  {(() => {
                    const points = scenario.trajectory_comparison || [];
                    const chartW = 370;
                    const chartH = 95;
                    const padX = 40;
                    const padY = 25;
                    const maxHr = points.length > 1 ? points[points.length - 1].hour : 12;

                    const getX = (h: number) => padX + (h / (maxHr || 12)) * chartW;
                    const getY = (v: number) => padY + chartH - ((v - 100) / (200 - 100)) * chartH;

                    const baselinePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(p.hour).toFixed(1)} ${getY(p.baseline_sbp).toFixed(1)}`).join(' ');
                    const scenarioPath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(p.hour).toFixed(1)} ${getY(p.scenario_sbp).toFixed(1)}`).join(' ');

                    const y180 = getY(180);
                    const breachPt = points.find(p => p.scenario_sbp >= 180);
                    const lastPt = points[points.length - 1];

                    return (
                      <svg className="w-full h-44 overflow-visible" viewBox="0 0 450 160">
                        {/* Crisis safety threshold line (180 mmHg) */}
                        <line stroke="#ba1a1a" strokeDasharray="4 4" strokeWidth="1.5" x1="30" x2="425" y1={y180} y2={y180} />
                        <text fill="#ba1a1a" fontSize="10" fontWeight="700" x="35" y={y180 - 6}>
                          Crisis Safety Margin (180 mmHg)
                        </text>

                        {/* Baseline trajectory (teal) */}
                        <path
                          d={baselinePath}
                          fill="none"
                          stroke="#00666f"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />

                        {/* Perturbed or Recovered trajectory */}
                        <path
                          d={scenarioPath}
                          fill="none"
                          stroke={scenario.perturbed_peak_sbp >= 170 ? '#ba1a1a' : '#196C57'}
                          strokeDasharray="5 4"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />

                        {/* Breach or recovery indicator */}
                        {breachPt ? (
                          <>
                            <circle cx={getX(breachPt.hour)} cy={getY(breachPt.scenario_sbp)} fill="#ba1a1a" r="5" />
                            <text fill="#ba1a1a" fontSize="10.5" fontWeight="700" textAnchor="middle" x={getX(breachPt.hour)} y={getY(breachPt.scenario_sbp) - 8}>
                              Breach @ T+{scenario.eta_to_threshold_hours || breachPt.hour}h
                            </text>
                          </>
                        ) : lastPt ? (
                          <>
                            <circle cx={getX(lastPt.hour)} cy={getY(lastPt.scenario_sbp)} fill="#196C57" r="4.5" />
                            <text fill="#196C57" fontSize="10.5" fontWeight="700" textAnchor="middle" x={getX(lastPt.hour)} y={getY(lastPt.scenario_sbp) - 8}>
                              Safe Margin ({lastPt.scenario_sbp} mmHg)
                            </text>
                          </>
                        ) : null}

                        {/* X-axis ticks */}
                        <text fill="#445f73" fontSize="10" textAnchor="middle" x="40" y="145">T+0h</text>
                        <text fill="#445f73" fontSize="10" textAnchor="middle" x="100" y="145">T+2h</text>
                        <text fill="#445f73" fontSize="10" textAnchor="middle" x="160" y="145">T+4h</text>
                        <text fill="#445f73" fontSize="10" textAnchor="middle" x="225" y="145">T+6h</text>
                        <text fill="#445f73" fontSize="10" textAnchor="middle" x="290" y="145">T+8h</text>
                        <text fill="#445f73" fontSize="10" textAnchor="middle" x="350" y="145">T+10h</text>
                        <text fill="#445f73" fontSize="10" textAnchor="middle" x="410" y="145">T+12h</text>
                      </svg>
                    );
                  })()}
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-[#445f73]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-3 h-0.5 bg-[#00666f] inline-block rounded" />
                    Nominal Trajectory (Baseline)
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className={`w-3 h-0.5 border-t-2 border-dashed inline-block ${
                      scenario.perturbed_peak_sbp >= 170 ? 'border-[#ba1a1a]' : 'border-[#196C57]'
                    }`} />
                    {simulatedPlan ? 'Countermeasure Recovery Trajectory' : 'Perturbed Forecast Trajectory'}
                  </span>
                </div>

                <p className="mt-4 text-[12px] text-[#445f73] bg-[#e2f1ef]/60 p-3.5 rounded-xl leading-relaxed border border-[#00666f]/15">
                  <strong className="text-[#00666f]">Simulated Biophysical Impact:</strong> {scenario.plain_language_impact}
                </p>
              </GlassCard>
            </div>

            {/* Right: Countermeasure Prescriptions (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <GlassCard className="p-6 flex flex-col border border-white/80">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#00666f]">
                      Optimal Action Policy
                    </span>
                    <h3 className="text-[18px] font-bold text-[#111e1d]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                      Ranked Countermeasures
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#196C57] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    PARETO-OPTIMAL
                  </span>
                </div>

                <div className="space-y-3">
                  {prescriptions.ranked_options.map(rx => {
                    const isSelected = simulatedPlan?.rank === rx.rank;

                    return (
                      <div
                        key={rx.rank}
                        className={`p-4 rounded-2xl transition-all flex flex-col gap-2 border shadow-xs ${
                          isSelected
                            ? 'bg-white border-[#00666f] ring-2 ring-[#00666f]/20 shadow-sm'
                            : 'bg-white/70 hover:bg-white border-gray-100 hover:border-[#00666f]/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] font-mono ${
                            isSelected
                              ? 'bg-[#00666f] text-white'
                              : 'bg-[#00666f]/15 text-[#00666f]'
                          }`}>
                            {rx.rank}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-[#445f73]">Projected Score:</span>
                            <span className="font-mono font-bold text-[#196C57] text-[12px] bg-emerald-50 px-1.5 py-0.5 rounded">
                              {rx.projected_risk_score}
                            </span>
                          </div>
                        </div>

                        <h4 className="text-[14px] font-bold text-[#111e1d]">{rx.title}</h4>
                        <p className="text-[12px] text-[#445f73] leading-relaxed">{rx.description}</p>

                        <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#445f73]">
                          <span>Difficulty Cost: <strong>{rx.difficulty_cost}</strong></span>
                          <button
                            onClick={() => {
                              setSimulatedPlan({ rank: rx.rank, title: rx.title });
                            }}
                            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 shadow-2xs active:scale-95 ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#00666f]/10 text-[#00666f] hover:bg-[#00666f] hover:text-white'
                            }`}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              {isSelected ? 'check' : 'play_arrow'}
                            </span>
                            <span>{isSelected ? 'Simulated Active' : 'Simulate Plan'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="mt-4 text-[11px] text-[#445f73] italic">
                  {prescriptions.disclaimer}
                </p>
              </GlassCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
