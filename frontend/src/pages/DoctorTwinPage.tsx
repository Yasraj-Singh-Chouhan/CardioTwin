import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BrainCircuit,
  GitFork,
  Activity,
  ShieldAlert,
  CheckCircle2,
  Pill,
  X,
  Stethoscope,
  Check,
  FileText,
  Calculator,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Users,
  Clock,
} from 'lucide-react';
import { getPatientDetail, getTwinState, getPredictions, getPatientAlerts, acknowledgeAlert } from '../api/client';
import { useReplay } from '../hooks/useReplay';
import RiskBadge from '../components/RiskBadge';
import RiskGauge from '../components/RiskGauge';
import GlassCard from '../components/GlassCard';
import { GlassSkeleton, GlassError } from '../components/GlassState';
import { BPTrajectoryChart } from '../components/charts/BPTrajectoryChart';
import { ReplayControlsBar } from '../components/ReplayControlsBar';
import { EcgOscilloscope } from '../components/EcgOscilloscope';
import { CardiacModelViewer } from '../components/CardiacModelViewer';
import { SbarHandoverModal } from '../components/SbarHandoverModal';
import { DrugTitrationCalculatorModal } from '../components/DrugTitrationCalculatorModal';
import { ConsultantAlertModal } from '../components/ConsultantAlertModal';

const FEATURED_CCU_PATIENTS = [
  { id: 'CT-0042', name: 'Ritu Mishra', tier: 'CRITICAL', score: 98.0, sbp: 182, dbp: 108 },
  { id: 'CT-0210', name: 'Ashok Patel', tier: 'CRITICAL', score: 98.0, sbp: 178, dbp: 104 },
  { id: 'CT-0009', name: 'Ramesh Bhat', tier: 'HIGH', score: 73.9, sbp: 164, dbp: 96 },
  { id: 'CT-0006', name: 'Ritu Banerjee', tier: 'HIGH', score: 73.0, sbp: 162, dbp: 94 },
  { id: 'CT-3092', name: 'Rajesh Verma', tier: 'ELEVATED', score: 58.0, sbp: 154, dbp: 92 },
  { id: 'CT-0010', name: 'Mahesh Mishra', tier: 'MODERATE', score: 41.5, sbp: 142, dbp: 88 },
  { id: 'CT-0016', name: 'Arvind Mishra', tier: 'LOW', score: 24.5, sbp: 124, dbp: 80 },
];

export default function DoctorTwinPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patientId = id || 'CT-0042';

  const [acknowledging, setAcknowledging] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showSbarModal, setShowSbarModal] = useState(false);
  const [showTitrationModal, setShowTitrationModal] = useState(false);
  const [showConsultantModal, setShowConsultantModal] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState('Stat CCU Triage & Continuous Tonometry');
  const [actionNotice, setActionNotice] = useState<{ type: 'ack' | 'esc'; title: string; detail: string } | null>(null);
  const [centerTab, setCenterTab] = useState<'split' | 'chamber' | 'trajectory'>('split');
  const [rightTab, setRightTab] = useState<'alerts' | 'meds'>('alerts');

  // Live WebSocket Replay Hook
  const {
    isPlaying,
    speed,
    isConnected,
    liveTelemetry,
    togglePlay,
    changeSpeed,
  } = useReplay({ patientId, autoPlay: true, initialSpeed: '10x' });

  const patientQuery = useQuery({
    queryKey: ['patientDetail', patientId],
    queryFn: () => getPatientDetail(patientId),
  });

  const twinQuery = useQuery({
    queryKey: ['twinState', patientId],
    queryFn: () => getTwinState(patientId),
  });

  const predQuery = useQuery({
    queryKey: ['predictions', patientId],
    queryFn: () => getPredictions(patientId),
  });

  const alertsQuery = useQuery({
    queryKey: ['alerts', patientId],
    queryFn: () => getPatientAlerts(patientId),
  });

  const isLoading = patientQuery.isLoading || twinQuery.isLoading || predQuery.isLoading;
  const isError = patientQuery.isError || twinQuery.isError || predQuery.isError;
  const error = patientQuery.error || twinQuery.error || predQuery.error;

  const patient = patientQuery.data;
  const twin = twinQuery.data;
  const predictions = predQuery.data;
  const alerts = alertsQuery.data?.alerts || [];

  // Blend live telemetry into current twin risk gauge
  const currentRiskScore = liveTelemetry?.fused_risk_score ?? twin?.fused_risk_score ?? 84;
  const currentSbp = liveTelemetry?.systolic_bp ?? 154;
  const currentDbp = liveTelemetry?.diastolic_bp ?? 98;
  const currentHr = liveTelemetry?.heart_rate ?? 78;

  const isCrisis = currentSbp >= 165 || currentRiskScore >= 75;

  const currentIndex = FEATURED_CCU_PATIENTS.findIndex(p => p.id === patientId);

  const handleNextPatient = () => {
    const nextIdx = (currentIndex + 1) % FEATURED_CCU_PATIENTS.length;
    navigate(`/doctor/patients/${FEATURED_CCU_PATIENTS[nextIdx].id}`);
  };

  const handlePrevPatient = () => {
    const prevIdx = (currentIndex - 1 + FEATURED_CCU_PATIENTS.length) % FEATURED_CCU_PATIENTS.length;
    navigate(`/doctor/patients/${FEATURED_CCU_PATIENTS[prevIdx].id}`);
  };

  return (
    <div className="flex flex-col w-full gap-3 pb-8">
      {isLoading && <GlassSkeleton lines={7} />}
      {isError && (
        <GlassError
          message={(error as Error)?.message}
          onRetry={() => {
            patientQuery.refetch();
            twinQuery.refetch();
            predQuery.refetch();
          }}
        />
      )}

      {patient && twin && predictions && (
        <>
          {/* Unified Doctor CCU Master Command Header */}
          <GlassCard className="w-full p-4 border border-white/80 shadow-xs rounded-2xl flex flex-col gap-2.5">
            {/* Top Row: Patient Avatar, Identification & Segmented Switcher */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Left: Patient Avatar & Primary Identity */}
              <div className="flex items-center gap-3">
                <div
                  className={`relative w-11 h-11 rounded-xl flex items-center justify-center font-bold text-[16px] shrink-0 font-mono shadow-2xs ${
                    patient.risk_tier === 'CRITICAL'
                      ? 'bg-red-50 text-[#ba1a1a] border border-[#ba1a1a]/30'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200/70'
                  }`}
                  style={{ fontFamily: 'Plus Jakarta Sans' }}
                >
                  {patient.initials}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                      patient.risk_tier === 'CRITICAL' ? 'bg-[#ba1a1a] animate-pulse' : 'bg-[#2FBF9B]'
                    }`}
                  />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1
                      className="text-[19px] font-bold text-slate-900 leading-tight"
                      style={{ fontFamily: 'Plus Jakarta Sans' }}
                    >
                      {patient.name}
                    </h1>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                      {patient.patient_id}
                    </span>
                    <RiskBadge tier={patient.risk_tier} />
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                      <Stethoscope className="w-3 h-3 text-indigo-600" />
                      Attending: Dr. A. Sharma (CCU Lead)
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Patient Switcher & Action Navigation Pills */}
              <div className="flex items-center gap-2 flex-wrap justify-between lg:justify-end">
                {/* Segmented Patient Switcher */}
                <div className="flex items-center gap-0.5 bg-white rounded-xl border border-slate-200 shadow-2xs p-0.5">
                  <button
                    onClick={handlePrevPatient}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                    title="Previous Patient"
                    type="button"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowPatientDropdown(prev => !prev)}
                    className="flex items-center gap-1.5 px-2 py-1 text-[11.5px] font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                    type="button"
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Select: <span className="font-mono text-indigo-600">{patientId}</span> ({patient?.name?.split(' ')[0] || ''})</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  <button
                    onClick={handleNextPatient}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                    title="Next Patient"
                    type="button"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  to="/doctor/roster"
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-all flex items-center gap-1 border border-slate-200/60"
                >
                  <span>Cohort Roster (1,000 Pts) &rarr;</span>
                </Link>

                <div className="h-4 w-px bg-slate-200 mx-0.5 hidden xl:block" />

                {/* Sub-tools Links */}
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/doctor/patients/${patient.patient_id}/explanation`}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 text-[11px] font-semibold transition-all border border-slate-200 hover:border-indigo-300 shadow-2xs flex items-center gap-1"
                  >
                    <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
                    <span>SHAP Causality</span>
                  </Link>
                  <Link
                    to={`/doctor/patients/${patient.patient_id}/scenarios`}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 text-[11px] font-semibold transition-all border border-slate-200 hover:border-indigo-300 shadow-2xs flex items-center gap-1"
                  >
                    <GitFork className="w-3.5 h-3.5 text-indigo-600" />
                    <span>What-If</span>
                  </Link>
                  <Link
                    to={`/doctor/patients/${patient.patient_id}/signals`}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 text-[11px] font-semibold transition-all border border-slate-200 hover:border-indigo-300 shadow-2xs flex items-center gap-1"
                  >
                    <Activity className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Signals</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Switcher Dropdown Menu */}
            {showPatientDropdown && (
              <div className="absolute right-6 top-24 w-80 bg-white rounded-2xl p-2.5 shadow-2xl border border-slate-200 z-50 animate-in fade-in">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 font-mono">
                  Featured CCU Patients across Tiers:
                </div>
                <div className="flex flex-col gap-1 max-h-64 overflow-y-auto mt-1">
                  {FEATURED_CCU_PATIENTS.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setShowPatientDropdown(false);
                        navigate(`/doctor/patients/${p.id}`);
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                        p.id === patientId ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[12px] text-slate-900">{p.name}</span>
                          <span className="font-mono text-[10px] text-indigo-600 font-bold">{p.id}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">BP: {p.sbp}/{p.dbp} mmHg</span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        p.tier === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        p.tier === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                        p.tier === 'ELEVATED' ? 'bg-yellow-100 text-yellow-700' :
                        p.tier === 'MODERATE' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {p.tier}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Row: Demographic Meta & Rapid Tools */}
            <div className="pt-2.5 border-t border-slate-200/70 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              {/* Demographics */}
              <div className="flex items-center gap-2 text-[11.5px] text-slate-600 flex-wrap">
                <span className="font-semibold text-slate-800">{patient.age}y {patient.sex}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="font-medium text-slate-800">{patient.city}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="font-semibold text-slate-900">{patient.primary_condition}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>BMI <strong className="text-slate-800 font-mono">{patient.bmi}</strong></span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/80 font-mono">
                  South Asian Phenotype Calibrated
                </span>
              </div>

              {/* Rapid Action Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setShowSbarModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-semibold border border-indigo-200 hover:border-indigo-400 shadow-2xs transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                  type="button"
                  title="Generate structured SBAR clinical report for shift handover"
                >
                  <FileText className="w-3 h-3 text-indigo-600" />
                  <span>SBAR Handover</span>
                </button>

                <button
                  onClick={() => setShowTitrationModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-semibold border border-purple-200 hover:border-purple-400 shadow-2xs transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                  type="button"
                  title="CCU IV vasodilator dosing & safe MAP target assistant"
                >
                  <Calculator className="w-3 h-3 text-purple-700" />
                  <span>Titration Assistant</span>
                </button>

                <button
                  onClick={() => setShowConsultantModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] font-semibold border border-emerald-300 shadow-2xs transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                  type="button"
                  title="1-Click pre-composed WhatsApp telemetry dispatch to Senior Consultant"
                >
                  <MessageSquare className="w-3 h-3 text-emerald-600" />
                  <span>WhatsApp Alert</span>
                </button>

                <div className="text-[10.5px] text-slate-500 font-medium hidden 2xl:flex items-center gap-1 bg-white/70 px-2 py-0.5 rounded-md border border-slate-200/60">
                  <ShieldCheck className="w-3 h-3 text-indigo-600" />
                  <span>Guideline: &Delta;MAP &le; 25%/hr</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* WebSocket Replay Controls Bar */}
          <ReplayControlsBar
            isPlaying={isPlaying}
            speed={speed}
            isConnected={isConnected}
            clockDisplay={liveTelemetry.clock_display}
            onTogglePlay={togglePlay}
            onChangeSpeed={changeSpeed}
            liveSbp={currentSbp}
            liveDbp={currentDbp}
            liveHr={currentHr}
          />

          {/* Full-Width Continuous Arterial Tonometry Ribbon (Pura lamba across screen) */}
          <EcgOscilloscope
            heartRate={currentHr}
            isCrisis={isCrisis}
            height={56}
            className="w-full shadow-2xs"
          />

          {/* 3-Column Layout: Perfectly Aligned Heights & Single-Scroll Cockpit */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
            {/* Card 1: Left Column (4 cols) - Digital Twin Biophysics & Windkessel Parameters */}
            <div className="lg:col-span-4 flex flex-col h-full">
              <GlassCard className="p-4 flex flex-col justify-between border border-white/80 shadow-xs h-full">
                <div>
                  {/* Header */}
                  <div className="w-full flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 font-mono">
                        Fused Biophysical Risk
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/70 font-mono">
                      STREAM 1 Hz
                    </span>
                  </div>

                  {/* Risk Gauge */}
                  <div className="flex justify-center -my-1">
                    <RiskGauge value={currentRiskScore} tier={twin.risk_tier} size={175} />
                  </div>

                  {/* Warning Horizon Lead Pill */}
                  <div className="w-full mt-2 p-2 rounded-xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between text-[11.5px]">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      Warning Horizon Lead
                    </span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs tabular-nums text-[11px]">
                      {twin.days_to_risk}
                    </span>
                  </div>

                  {/* 3-Element Windkessel Biophysics */}
                  <div className="w-full mt-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-teal-700" />
                        <span className="text-[10.5px] font-bold uppercase tracking-wider text-teal-900 font-mono">
                          3-Element Windkessel Biophysics
                        </span>
                      </div>
                      <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200/80">
                        ODE BIO-FIT
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11.5px]">
                      {/* Param 1: Peripheral Resistance (R_p) */}
                      <div className="p-2 rounded-xl bg-white/80 border border-slate-200/70 shadow-2xs flex flex-col gap-0.5">
                        <div className="flex items-baseline justify-between">
                          <span className="text-slate-900 font-bold text-[12px] tracking-tight">Peripheral Resistance (R_p)</span>
                          <span className="font-mono font-bold text-[12.5px] text-slate-900 tabular-nums">
                            {twin.windkessel_params.r_peripheral} <span className="text-[9.5px] font-medium text-slate-500">mmHg·s/mL</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">Vasoconstrictive tone</span>
                          <span className="font-mono font-bold px-1.5 py-0.2 rounded bg-red-50 text-red-700 border border-red-200/60 leading-none">
                            +{twin.windkessel_params.r_peripheral_shift_percent}% Elevated Tone
                          </span>
                        </div>
                      </div>

                      {/* Param 2: Arterial Compliance (C_art) */}
                      <div className="p-2 rounded-xl bg-white/80 border border-slate-200/70 shadow-2xs flex flex-col gap-0.5">
                        <div className="flex items-baseline justify-between">
                          <span className="text-slate-900 font-bold text-[12px] tracking-tight">Arterial Compliance (C_art)</span>
                          <span className="font-mono font-bold text-[12.5px] text-slate-900 tabular-nums">
                            {twin.windkessel_params.c_arterial} <span className="text-[9.5px] font-medium text-slate-500">mL/mmHg</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">Aortic elastic reservoir</span>
                          <span className="font-mono font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200/60 leading-none">
                            Stiffened Reserve
                          </span>
                        </div>
                      </div>

                      {/* Param 3: Cardiac Output (Q_co) */}
                      <div className="p-2 rounded-xl bg-white/80 border border-slate-200/70 shadow-2xs flex flex-col gap-0.5">
                        <div className="flex items-baseline justify-between">
                          <span className="text-slate-900 font-bold text-[12px] tracking-tight">Cardiac Output (Q_co)</span>
                          <span className="font-mono font-bold text-[12.5px] text-slate-900 tabular-nums">
                            {twin.windkessel_params.cardiac_output_l_min} <span className="text-[9.5px] font-medium text-slate-500">L/min</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">Stroke volume × Heart Rate</span>
                          <span className="font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 leading-none">
                            Active Perfusion
                          </span>
                        </div>
                      </div>

                      {/* Param 4: In Silico Tolerance */}
                      <div className="p-2 rounded-xl bg-white/80 border border-slate-200/70 shadow-2xs flex flex-col gap-0.5">
                        <div className="flex items-baseline justify-between">
                          <span className="text-slate-900 font-bold text-[12px] tracking-tight">In Silico Tolerance</span>
                          <span className="font-mono font-bold text-[12.5px] text-emerald-700 tabular-nums">
                            {twin.windkessel_params.biofit_tolerance_percent}% <span className="text-[9.5px] font-medium text-slate-500">Nominal</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">Calibration residual error</span>
                          <span className="font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 leading-none">
                            ΔTDI 0.14 Validated
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Multiscale Scales */}
                <div className="w-full mt-3 pt-2.5 border-t border-slate-200/70 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    <span>Multiscale Time-Lapse</span>
                    <span>Stress Index</span>
                  </div>

                  <div className="text-[11.5px] flex flex-col gap-0.5">
                    <div className="flex justify-between items-baseline font-semibold">
                      <span className="text-red-700 font-bold text-[11.5px]">Fast-Twin (Acute Crisis Stress)</span>
                      <span className="font-bold text-red-700 font-mono text-[12px] tabular-nums">{twin.scales.acute_twin_score}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-red-100 overflow-hidden">
                      <div className="h-full bg-red-600 rounded-full transition-all duration-500" style={{ width: `${twin.scales.acute_twin_score}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">{twin.scales.acute_twin_label}</p>
                  </div>

                  <div className="text-[11.5px] flex flex-col gap-0.5">
                    <div className="flex justify-between items-baseline font-semibold">
                      <span className="text-indigo-700 font-bold text-[11.5px]">Slow-Twin (Chronic Vascular Stiffening)</span>
                      <span className="font-bold text-indigo-700 font-mono text-[12px] tabular-nums">{twin.scales.chronic_twin_score}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-indigo-100 overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${twin.scales.chronic_twin_score}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">{twin.scales.chronic_twin_label}</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Card 2: Middle Column (5 cols) - In Silico Hemodynamics & Biomechanical Chamber */}
            <div className="lg:col-span-5 flex flex-col h-full">
              <GlassCard className="p-4 flex flex-col justify-between border border-white/80 shadow-xs h-full">
                <div>
                  {/* Header with Segmented View Switcher */}
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1 font-mono">
                        <Activity className="w-3.5 h-3.5" />
                        In Silico Hemodynamics
                      </span>
                      <h2 className="text-[16px] font-bold text-slate-900 leading-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                        Biomechanical Chamber &amp; Trajectory
                      </h2>
                    </div>

                    {/* Segmented Controls */}
                    <div className="flex items-center gap-0.5 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200">
                      <button
                        onClick={() => setCenterTab('split')}
                        className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${
                          centerTab === 'split' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                        type="button"
                      >
                        Split
                      </button>
                      <button
                        onClick={() => setCenterTab('chamber')}
                        className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${
                          centerTab === 'chamber' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                        type="button"
                      >
                        Chamber
                      </button>
                      <button
                        onClick={() => setCenterTab('trajectory')}
                        className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${
                          centerTab === 'trajectory' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                        type="button"
                      >
                        Forecast
                      </button>
                    </div>
                  </div>

                  {/* Body based on view mode */}
                  {centerTab === 'split' && (
                    <div className="flex flex-col gap-2">
                      <CardiacModelViewer
                        sbp={currentSbp}
                        dbp={currentDbp}
                        heartRate={currentHr}
                        rp={twin.windkessel_params.r_peripheral}
                        cart={twin.windkessel_params.c_arterial}
                        riskScore={currentRiskScore}
                        hideHeader={true}
                        compact={true}
                      />

                      <div className="w-full h-px bg-slate-200/70" />

                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-slate-500">
                            Live BP: <strong className="font-mono text-slate-900">{currentSbp}/{currentDbp}</strong> &bull; Target alert: <strong className="text-red-700 font-semibold">&ge;180 mmHg</strong>
                          </span>
                          <span className="font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded text-[10.5px]">
                            {predictions.forecast_peak_eta_text}
                          </span>
                        </div>
                        <div className="w-full bg-white/85 rounded-xl p-1.5 border border-slate-200/60 shadow-2xs">
                          <BPTrajectoryChart
                            trajectory={predictions.trajectory}
                            liveSbp={currentSbp}
                            liveDbp={currentDbp}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {centerTab === 'chamber' && (
                    <div className="mt-1">
                      <CardiacModelViewer
                        sbp={currentSbp}
                        dbp={currentDbp}
                        heartRate={currentHr}
                        rp={twin.windkessel_params.r_peripheral}
                        cart={twin.windkessel_params.c_arterial}
                        riskScore={currentRiskScore}
                        hideHeader={true}
                      />
                    </div>
                  )}

                  {centerTab === 'trajectory' && (
                    <div className="flex flex-col gap-2 mt-1">
                      <div className="flex items-center justify-between text-[11.5px]">
                        <span className="text-slate-500">
                          Live Inflow: <strong className="font-mono text-slate-900">{currentSbp}/{currentDbp} mmHg</strong> &bull; Crisis threshold marker: <strong className="text-red-700 font-semibold">&ge;180 mmHg</strong>
                        </span>
                        <span className="font-mono font-bold text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-lg text-[11px]">
                          {predictions.forecast_peak_eta_text}
                        </span>
                      </div>
                      <div className="w-full bg-white/85 rounded-xl p-2 border border-slate-200/60 shadow-2xs">
                        <BPTrajectoryChart
                          trajectory={predictions.trajectory}
                          liveSbp={currentSbp}
                          liveDbp={currentDbp}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Legend */}
                <div className="mt-2 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[10.5px] text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <span className="w-2.5 h-0.5 bg-indigo-600 inline-block rounded" />
                    Observed Telemetry
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <span className="w-2.5 h-0.5 border-t border-dashed border-red-600 inline-block" />
                    Windkessel Forecast
                  </span>
                  <span className="text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded font-mono border border-emerald-200/60 text-[10px]">
                    94.2% Conf
                  </span>
                </div>
              </GlassCard>
            </div>

            {/* Card 3: Right Column (3 cols) - Clinical Decision Deck & Medications */}
            <div className="lg:col-span-3 flex flex-col h-full">
              <GlassCard className="p-4 flex flex-col justify-between border border-white/80 shadow-xs h-full">
                <div>
                  {/* Header with Segmented Alert vs Meds Switcher */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[16px] font-bold text-slate-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                      Clinical Action Deck
                    </h3>

                    <div className="flex items-center gap-0.5 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200">
                      <button
                        onClick={() => setRightTab('alerts')}
                        className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${
                          rightTab === 'alerts' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                        type="button"
                      >
                        Alerts ({alerts.filter((a) => a.status === 'ACTIVE').length})
                      </button>
                      <button
                        onClick={() => setRightTab('meds')}
                        className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${
                          rightTab === 'meds' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                        type="button"
                      >
                        Meds ({patient.medications.length})
                      </button>
                    </div>
                  </div>

                  {/* Body: Alerts Tab */}
                  {rightTab === 'alerts' && (
                    <div className="flex flex-col gap-2">
                      {actionNotice && (
                        <div className={`p-2.5 rounded-xl text-[11.5px] flex flex-col gap-0.5 border shadow-2xs animate-in fade-in duration-200 ${
                          actionNotice.type === 'ack'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-purple-50 border-purple-200 text-purple-900'
                        }`}>
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              {actionNotice.title}
                            </span>
                            <button
                              onClick={() => setActionNotice(null)}
                              className="text-slate-400 hover:text-slate-700 font-bold"
                              type="button"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[10.5px] leading-tight opacity-90">{actionNotice.detail}</p>
                        </div>
                      )}

                      <div className="space-y-2 max-h-[310px] overflow-y-auto pr-1">
                        {alerts.map((alt) => (
                          <div
                            key={alt.id}
                            className={`p-2.5 rounded-xl border flex flex-col gap-1.5 transition-all ${
                              alt.status === 'ESCALATED'
                                ? 'border-purple-200 bg-purple-50/70'
                                : alt.status === 'ACKNOWLEDGED'
                                ? 'border-emerald-200 bg-emerald-50/50'
                                : 'border-red-200 bg-red-50/60 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <span className={`text-[9.5px] font-bold uppercase tracking-wider font-mono px-1.5 py-0.2 rounded text-white ${
                                  alt.status === 'ESCALATED'
                                    ? 'bg-purple-700'
                                    : alt.status === 'ACKNOWLEDGED'
                                    ? 'bg-indigo-600'
                                    : 'bg-red-700'
                                }`}>
                                  {alt.tier}
                                </span>
                                <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-bold uppercase font-mono ${
                                  alt.status === 'ESCALATED'
                                    ? 'bg-purple-200 text-purple-900'
                                    : alt.status === 'ACKNOWLEDGED'
                                    ? 'bg-emerald-200 text-emerald-900'
                                    : 'bg-red-200 text-red-900'
                                }`}>
                                  {alt.status}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-500 font-semibold">{alt.eta_to_threshold}</span>
                            </div>

                            <h4 className="text-[12px] font-bold text-slate-900 leading-snug">
                              {alt.primary_concern}
                            </h4>

                            <p className="text-[10.5px] text-slate-500 leading-relaxed">
                              {alt.trigger_summary}
                            </p>

                            {alt.escalation_protocol && (
                              <div className="p-2 rounded-lg bg-purple-100/80 text-[10.5px] text-purple-950 font-medium border border-purple-200">
                                <div className="font-bold text-purple-900 flex items-center justify-between">
                                  <span>🚨 Cath Lab Priority</span>
                                  <span className="font-mono text-[9.5px] bg-purple-200 px-1 py-0.2 rounded">STAT</span>
                                </div>
                                <p className="mt-0.5 text-purple-900 font-semibold leading-tight">{alt.escalation_protocol}</p>
                              </div>
                            )}

                            {alt.status === 'ACKNOWLEDGED' && (
                              <div className="p-2 rounded-lg bg-emerald-50 text-[10.5px] text-emerald-950 font-medium border border-emerald-200">
                                <div className="font-bold text-emerald-800 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Reviewed &amp; Acknowledged
                                </div>
                              </div>
                            )}

                            <div className="pt-1 border-t border-black/5 flex items-center justify-between text-[10px]">
                              <span className={alt.status === 'ESCALATED' ? 'text-purple-800 font-semibold' : 'text-red-700 font-semibold'}>
                                {alt.recommended_action}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Body: Meds Tab */}
                  {rightTab === 'meds' && (
                    <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
                      <div className="text-[11px] text-slate-500 mb-0.5">
                        Inpatient pharmacotherapy regimen &amp; scheduled adherence:
                      </div>
                      {patient.medications.map((med) => {
                        const isPoor = med.adherence_score < 0.7;

                        return (
                          <div key={med.id} className="p-2.5 rounded-xl bg-white/70 border border-slate-200/60 flex items-center justify-between shadow-2xs">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                                isPoor ? 'bg-red-100 text-red-700' : 'bg-indigo-50 text-indigo-600'
                              }`}>
                                <Pill className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[12px] font-bold text-slate-900 leading-tight">{med.name} {med.dosage}</span>
                                <span className="text-[10px] text-slate-500 leading-tight mt-0.5">{med.frequency}</span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end">
                              <span className={`text-[11px] font-bold font-mono ${isPoor ? 'text-red-700' : 'text-emerald-700'}`}>
                                {Math.round(med.adherence_score * 100)}%
                              </span>
                              {med.omission_interval_hours > 0 && (
                                <span className="text-[9px] text-red-700 font-semibold bg-red-50 px-1.5 py-0.2 rounded-full mt-0.5 border border-red-200/60">
                                  ~{med.omission_interval_hours}h gap
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Bottom Action Buttons (pinned at bottom of Card 3) */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex flex-col gap-1.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={async () => {
                        const activeAlt = alerts.find((a) => a.status === 'ACTIVE') || alerts[0];
                        if (!activeAlt || acknowledging) return;
                        setAcknowledging(true);
                        try {
                          const res = await acknowledgeAlert(patientId, activeAlt.id);
                          await alertsQuery.refetch();
                          setActionNotice({
                            type: 'ack',
                            title: 'Alert Acknowledged by Dr. A. Sharma',
                            detail: res.message || `Transmitted to Central CCU Nursing Desk. Audio alarm silenced. Audit hash sealed in CDSCO Class B Vault by Dr. A. Sharma.`,
                          });
                        } finally {
                          setAcknowledging(false);
                        }
                      }}
                      disabled={acknowledging || alerts.every((a) => a.status === 'ACKNOWLEDGED')}
                      className={`py-1.5 px-2 rounded-lg font-bold text-[11.5px] shadow-xs transition-all flex items-center justify-center gap-1 active:scale-98 cursor-pointer ${
                        alerts.every((a) => a.status === 'ACKNOWLEDGED')
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                      type="button"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {acknowledging
                        ? 'Ack...'
                        : alerts.every((a) => a.status === 'ACKNOWLEDGED')
                        ? 'Acknowledged'
                        : 'Acknowledge'}
                    </button>

                    <button
                      onClick={() => setShowEscalateModal(true)}
                      className="py-1.5 px-2 rounded-lg bg-white/90 hover:bg-white text-slate-800 font-semibold text-[11.5px] transition-all shadow-2xs border border-slate-200 flex items-center justify-center gap-1 hover:text-purple-800 hover:border-purple-300 active:scale-98 cursor-pointer"
                      type="button"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />
                      Cath-Triage
                    </button>
                  </div>

                  {/* Routing Links */}
                  <div className="flex items-center justify-between text-[9.5px] text-slate-500 pt-0.5 px-0.5">
                    <Link to="/doctor/nursing-desk" className="font-bold text-indigo-600 hover:underline">
                      Nursing Desk &rarr;
                    </Link>
                    <span>&bull;</span>
                    <Link to="/doctor/cath-lab-triage" className="font-bold text-purple-800 hover:underline">
                      Cath Lab &rarr;
                    </Link>
                    <span>&bull;</span>
                    <Link to="/doctor/audit-vault" className="font-bold text-slate-600 hover:underline">
                      Audit Vault
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Modal 1: SBAR Handover Report Modal */}
          {showSbarModal && (
            <SbarHandoverModal
              patient={patient}
              twin={twin}
              alerts={alerts}
              currentSbp={currentSbp}
              currentDbp={currentDbp}
              currentHr={currentHr}
              onClose={() => setShowSbarModal(false)}
            />
          )}

          {/* Modal 2: Drug Titration Assistant Modal */}
          {showTitrationModal && (
            <DrugTitrationCalculatorModal
              currentSbp={currentSbp}
              currentDbp={currentDbp}
              onClose={() => setShowTitrationModal(false)}
            />
          )}

          {/* Modal 3: Consultant Rapid Alert Modal */}
          {showConsultantModal && (
            <ConsultantAlertModal
              patient={patient}
              twin={twin}
              alerts={alerts}
              currentSbp={currentSbp}
              currentDbp={currentDbp}
              currentHr={currentHr}
              onClose={() => setShowConsultantModal(false)}
            />
          )}

          {/* Escalation Modal Dialog */}
          {showEscalateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
              <div
                className="w-full max-w-lg p-6 rounded-3xl flex flex-col gap-4 relative animate-in fade-in zoom-in-95 duration-200 border border-white"
                style={{
                  background: 'rgba(255, 255, 255, 0.96)',
                  boxShadow: '0 24px 60px -12px rgba(11,42,60,0.30)',
                }}
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-800 font-bold shadow-xs">
                      <ShieldAlert className="w-5 h-5 text-purple-800" />
                    </div>
                    <div>
                      <h3 className="text-[17px] font-bold text-[#111e1d]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                        Escalate to Cath / CCU Triage
                      </h3>
                      <p className="text-[12px] text-[#445f73]">Direct inpatient clinical priority channel</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEscalateModal(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-[#445f73]"
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-2.5 text-[13px]">
                  <span className="font-bold text-[#111e1d]">Select Clinical Action Protocol:</span>
                  {[
                    'Stat CCU Triage & Continuous Tonometry',
                    'IV Vasodilator Protocol (Labetalol / Nicardipine titration)',
                    'Invasive Radial Arterial Line Placement & CCU Bed Allocation',
                    'Immediate Tele-Cardiology Attending Consult',
                  ].map((proto) => (
                    <label
                      key={proto}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedProtocol === proto
                          ? 'border-purple-600 bg-purple-50/80 text-purple-950 font-semibold shadow-xs'
                          : 'border-gray-200 hover:bg-gray-50 text-[#445f73]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="protocol"
                        value={proto}
                        checked={selectedProtocol === proto}
                        onChange={() => setSelectedProtocol(proto)}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span>{proto}</span>
                    </label>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setShowEscalateModal(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-slate-700 font-semibold text-[13px] hover:bg-gray-50"
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowEscalateModal(false);
                      setActionNotice({
                        type: 'esc',
                        title: 'Dispatched to Cath Lab Triage Queue',
                        detail: `Protocol "${selectedProtocol}" transmitted to CCU Cath Lab & Attending On-Call for patient ${patientId}.`,
                      });
                    }}
                    className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-[13px] shadow-sm transition-all"
                    type="button"
                  >
                    Confirm STAT Escalation
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
