import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BrainCircuit,
  GitFork,
  Activity,
  ShieldAlert,
  CheckCircle2,
  Pill,
  Send,
  X,
  Stethoscope,
  RefreshCw,
  Check,
  FileText,
  Calculator,
  MessageSquare,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { getPatientDetail, getTwinState, getPredictions, getPatientAlerts, acknowledgeAlert, escalateAlert } from '../api/client';
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
import { useAudioTelemetry } from '../hooks/useAudioTelemetry';
import { ExactMinimalDigitalTwin } from '../components/inspiration/ExactMinimalDigitalTwin';

export default function TwinPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'doctor' ? 'advanced' : 'minimal';

  const patientId = id || 'CT-3092';
  const { triggerCardiacBeep } = useAudioTelemetry();

  const [acknowledging, setAcknowledging] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showSbarModal, setShowSbarModal] = useState(false);
  const [showTitrationModal, setShowTitrationModal] = useState(false);
  const [showConsultantModal, setShowConsultantModal] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState('Stat CCU Triage & Continuous Tonometry');
  const [actionNotice, setActionNotice] = useState<{ type: 'ack' | 'esc'; title: string; detail: string } | null>(null);
  const [viewMode, setViewMode] = useState<'minimal' | 'advanced'>(initialRole);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'doctor') {
      setViewMode('advanced');
    } else if (roleParam === 'patient') {
      setViewMode('minimal');
    }
  }, [searchParams]);

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

  return (
    <div className="w-full min-h-screen">
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

      {viewMode === 'minimal' ? (
        <div className="relative w-full min-h-screen">
          <div className="fixed top-4 right-6 z-50">
            <button
              onClick={() => {
                setViewMode('advanced');
                setSearchParams({ role: 'doctor' });
              }}
              className="px-4 py-2 rounded-full bg-white/95 hover:bg-white text-slate-800 font-bold text-[12px] shadow-md border border-slate-200/80 transition-all flex items-center gap-2 active:scale-95 cursor-pointer hover:border-[#1d5bf0]"
              title="Open Doctor / Clinician Inpatient CCU Command Center"
            >
              <Stethoscope className="w-4 h-4 text-[#1d5bf0]" />
              <span>Switch to Doctor Portal</span>
              <span className="text-[#1d5bf0]">&rarr;</span>
            </button>
          </div>

          <ExactMinimalDigitalTwin
            patientId={patientId}
            patientName={patient?.name || 'Jacqueline Delaney'}
            heartRate={currentHr || 78}
            sbp={currentSbp || 124}
            dbp={currentDbp || 80}
            bloodSugar="120/160"
            glucoseLevel={230}
          />
        </div>
      ) : (
        <div className="flex flex-col w-full max-w-[1560px] mx-auto gap-4 mt-2 pb-10 px-4">
          <div className="flex items-center justify-between py-2 border-b border-slate-200/80">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-[#1d5bf0] font-mono text-[11px] font-bold border border-blue-100 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor Portal &bull; Inpatient CCU Command Center</span>
              </span>
              <span className="text-[12px] text-slate-500 font-medium hidden sm:inline">
                Attending: <strong>Dr. A. Sharma (CCU Lead)</strong> &bull; Patient: <strong>{patientId}</strong>
              </span>
            </div>

            <button
              onClick={() => {
                setViewMode('minimal');
                setSearchParams({ role: 'patient' });
              }}
              className="px-4 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[12px] shadow-xs border border-slate-200/80 flex items-center gap-1.5 transition-all cursor-pointer hover:border-slate-300"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#1d5bf0]" />
              <span>&larr; Switch to Patient Portal</span>
            </button>
          </div>

          {patient && twin && predictions && (
            <>
              {/* Top Patient Master Bar */}
          <GlassCard className="w-full flex flex-wrap items-center justify-between gap-4 px-6 py-4 border border-white/80">
            <div className="flex items-center gap-4">
                  {/* Patient Initials Avatar with Risk Ring */}
              <div
                className={`relative w-13 h-13 rounded-2xl flex items-center justify-center font-bold text-[19px] shrink-0 font-mono shadow-xs ${
                  patient.risk_tier === 'CRITICAL'
                    ? 'bg-red-50 text-[#ba1a1a] border-2 border-[#ba1a1a]/30'
                    : 'bg-[#e5efff] text-[#1d5bf0] border-2 border-[#1d5bf0]/20'
                }`}
                style={{ fontFamily: 'Plus Jakarta Sans' }}
              >
                {patient.initials}
                <span
                  className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    patient.risk_tier === 'CRITICAL' ? 'bg-[#ba1a1a] animate-pulse' : 'bg-[#2FBF9B]'
                  }`}
                />
              </div>

              {/* Patient Meta */}
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <h1 className="text-[22px] font-bold text-[#111e1d] leading-none" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                    {patient.name}
                  </h1>
                  <span className="text-[12px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#e5efff] text-[#1d5bf0]">
                    {patient.patient_id}
                  </span>
                  <RiskBadge tier={patient.risk_tier} />
                </div>
                <div className="flex items-center gap-2.5 text-[12px] text-[#445f73] mt-1.5 flex-wrap">
                  <span className="font-medium text-[#111e1d]">{patient.age}y {patient.sex}</span>
                  <span>•</span>
                  <span><strong>{patient.city}</strong></span>
                  <span>•</span>
                  <span className="text-[#111e1d] font-semibold">{patient.primary_condition}</span>
                  <span>•</span>
                  <span>BMI <strong>{patient.bmi}</strong></span>
                  <span>•</span>
                  <span className="text-[11px] font-semibold text-[#1d5bf0] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    South Asian Phenotype Calibrated
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Pills */}
            <div className="flex items-center gap-2">
              <Link
                to={`/patients/${patient.patient_id}/explanation`}
                className="px-3.5 py-2 rounded-xl bg-white/80 hover:bg-white text-[#1d5bf0] text-[12px] font-semibold transition-all shadow-2xs border border-white hover:border-[#1d5bf0]/20 flex items-center gap-1.5"
              >
                <BrainCircuit className="w-4 h-4 text-[#1d5bf0]" />
                <span>SHAP Causality</span>
              </Link>
              <Link
                to={`/patients/${patient.patient_id}/scenarios`}
                className="px-3.5 py-2 rounded-xl bg-white/80 hover:bg-white text-[#1d5bf0] text-[12px] font-semibold transition-all shadow-2xs border border-white hover:border-[#1d5bf0]/20 flex items-center gap-1.5"
              >
                <GitFork className="w-4 h-4 text-[#1d5bf0]" />
                <span>What-If Testing</span>
              </Link>
              <Link
                to={`/patients/${patient.patient_id}/signals`}
                className="px-3.5 py-2 rounded-xl bg-white/80 hover:bg-white text-[#1d5bf0] text-[12px] font-semibold transition-all shadow-2xs border border-white hover:border-[#1d5bf0]/20 flex items-center gap-1.5"
              >
                <Activity className="w-4 h-4 text-[#1d5bf0]" />
                <span>Signals &amp; Recalibration</span>
              </Link>
            </div>
          </GlassCard>

          {/* Attending Physician Clinical Rapid Tools Toolbar */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 px-1 py-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1d5bf0] font-mono flex items-center gap-1.5 mr-1">
                <Stethoscope className="w-3.5 h-3.5 text-[#1d5bf0]" />
                Physician Rapid Tools:
              </span>

              <button
                onClick={() => setShowSbarModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-[#111e1d] text-[12px] font-semibold border border-[#1d5bf0]/20 hover:border-[#1d5bf0] shadow-2xs transition-all flex items-center gap-1.5 active:scale-95"
                type="button"
                title="Generate structured SBAR clinical report for shift handover"
              >
                <FileText className="w-3.5 h-3.5 text-[#1d5bf0]" />
                <span>SBAR Shift Handover Note</span>
              </button>

              <button
                onClick={() => setShowTitrationModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-[#111e1d] text-[12px] font-semibold border border-purple-200 hover:border-purple-400 shadow-2xs transition-all flex items-center gap-1.5 active:scale-95"
                type="button"
                title="CCU IV vasodilator dosing & safe MAP target assistant"
              >
                <Calculator className="w-3.5 h-3.5 text-purple-700" />
                <span>Vasodilator Titration Assistant</span>
              </button>

              <button
                onClick={() => setShowConsultantModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[12px] font-semibold border border-emerald-300 shadow-2xs transition-all flex items-center gap-1.5 active:scale-95"
                type="button"
                title="1-Click pre-composed WhatsApp telemetry dispatch to Senior Consultant"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Rapid WhatsApp Alert to On-Call</span>
              </button>
            </div>

            <div className="text-[11px] text-[#445f73] font-medium hidden xl:flex items-center gap-1.5 bg-white/60 px-3 py-1 rounded-xl border border-white/80">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1d5bf0]" />
              <span>Clinical Guideline: Lower MAP &le; 25% in hour 1 to preserve autoregulation</span>
            </div>
          </div>

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

          {/* Live Continuous Arterial Tonometry Oscilloscope with Calipers */}
          <EcgOscilloscope heartRate={currentHr} isCrisis={isCrisis} height={84} />

          {/* 3-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Digital Twin Biophysics & Gauge (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              {/* Fused Risk Gauge Card */}
              <GlassCard className="p-6 flex flex-col items-center border border-white/80">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#445f73]">
                    Fused Biophysical Risk
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] bg-[#2FBF9B]/15 text-[#196C57] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#196C57] animate-pulse" />
                    Telemetric Stream 1 Hz
                  </span>
                </div>

                <RiskGauge value={currentRiskScore} tier={twin.risk_tier} />

                <div className="w-full mt-4 p-3 rounded-xl bg-gradient-to-r from-[#e2f1ef]/60 to-[#cce2f8]/40 border border-white flex items-center justify-between text-[12px]">
                  <span className="text-[#445f73] font-semibold">Warning Horizon Lead</span>
                  <span className="font-mono font-bold text-[#111e1d] bg-white px-2 py-0.5 rounded-lg shadow-2xs">
                    {twin.days_to_risk}
                  </span>
                </div>

                {/* Windkessel Biophysics */}
                <div className="w-full mt-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#00666f]">
                      3-Element Windkessel Biophysics
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-[#196C57]">ODE BIO-FIT</span>
                  </div>

                  <div className="space-y-2 text-[12px]">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 border border-gray-100">
                      <div>
                        <span className="text-[#111e1d] font-semibold block">Peripheral Resistance (R_p)</span>
                        <span className="text-[10px] text-[#445f73]">Vasoconstrictive tone</span>
                      </div>
                      <span className="font-mono font-bold text-[#ba1a1a]">
                        {twin.windkessel_params.r_peripheral} (+{twin.windkessel_params.r_peripheral_shift_percent}%)
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 border border-gray-100">
                      <div>
                        <span className="text-[#111e1d] font-semibold block">Arterial Compliance (C_art)</span>
                        <span className="text-[10px] text-[#445f73]">Aortic elastic reservoir</span>
                      </div>
                      <span className="font-mono font-bold text-[#111e1d]">
                        {twin.windkessel_params.c_arterial} mL/mmHg
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 border border-gray-100">
                      <div>
                        <span className="text-[#111e1d] font-semibold block">Cardiac Output (Q_co)</span>
                        <span className="text-[10px] text-[#445f73]">Stroke volume x HR</span>
                      </div>
                      <span className="font-mono font-bold text-[#111e1d]">
                        {twin.windkessel_params.cardiac_output_l_min} L/min
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 border border-gray-100">
                      <div>
                        <span className="text-[#111e1d] font-semibold block">In Silico Tolerance</span>
                        <span className="text-[10px] text-[#445f73]">Calibration residual error</span>
                      </div>
                      <span className="font-mono font-bold text-[#196C57]">
                        {twin.windkessel_params.biofit_tolerance_percent}% Nominal
                      </span>
                    </div>
                  </div>
                </div>

                {/* Multiscale Scales */}
                <div className="w-full mt-5 pt-4 border-t border-[#bcc9cb]/30 flex flex-col gap-3">
                  <div className="text-[12px]">
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-[#ba1a1a]">Fast-Twin (Acute Crisis Stress)</span>
                      <span className="font-bold text-[#ba1a1a] font-mono">{twin.scales.acute_twin_score}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-red-100 overflow-hidden mb-1">
                      <div className="h-full bg-[#ba1a1a] rounded-full" style={{ width: `${twin.scales.acute_twin_score}%` }} />
                    </div>
                    <p className="text-[11px] text-[#445f73] leading-tight">{twin.scales.acute_twin_label}</p>
                  </div>

                  <div className="text-[12px]">
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-[#1d5bf0]">Slow-Twin (Chronic Atherosclerotic Stiffening)</span>
                      <span className="font-bold text-[#1d5bf0] font-mono">{twin.scales.chronic_twin_score}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#e5efff] overflow-hidden mb-1">
                      <div className="h-full bg-[#1d5bf0] rounded-full" style={{ width: `${twin.scales.chronic_twin_score}%` }} />
                    </div>
                    <p className="text-[11px] text-[#445f73] leading-tight">{twin.scales.chronic_twin_label}</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Middle Column: Biomechanical Heart Viewer + Trajectory Forecast + Meds (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* Biomechanical Heart Chamber Simulator */}
              <CardiacModelViewer
                sbp={currentSbp}
                dbp={currentDbp}
                heartRate={currentHr}
                rp={twin.windkessel_params.r_peripheral}
                cart={twin.windkessel_params.c_arterial}
                riskScore={currentRiskScore}
              />

              {/* Trajectory Card with Recharts */}
              <GlassCard className="p-6 flex flex-col border border-white/80">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1d5bf0] flex items-center gap-1.5 font-mono">
                      <Activity className="w-3.5 h-3.5" />
                      In Silico Hemodynamics
                    </span>
                    <h2 className="text-[18px] font-bold text-[#111e1d]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                      Blood Pressure Trajectory &amp; Crisis Horizon
                    </h2>
                  </div>
                  <span className="text-[12px] font-mono font-bold text-[#ba1a1a] bg-red-100 border border-red-200 px-2.5 py-1 rounded-xl shadow-2xs">
                    {predictions.forecast_peak_eta_text}
                  </span>
                </div>

                <p className="text-[12px] text-[#445f73] mb-3">
                  Live Streaming BP: <strong className="text-[#111e1d] font-mono">{currentSbp}/{currentDbp} mmHg</strong> &bull; Target alert marker: <strong className="text-[#ba1a1a]">crisis-range BP surge (&ge;180 mmHg)</strong>
                </p>

                {/* Real Recharts Interactive BP Trajectory */}
                <div className="w-full bg-white/85 rounded-2xl p-2.5 relative overflow-hidden border border-gray-100 shadow-2xs">
                  <BPTrajectoryChart
                    trajectory={predictions.trajectory}
                    liveSbp={currentSbp}
                    liveDbp={currentDbp}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-[#445f73]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-3 h-0.5 bg-[#1d5bf0] inline-block rounded" />
                    Observed Telemetry
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-3 h-0.5 border-t-2 border-dashed border-[#ba1a1a] inline-block" />
                    Windkessel Simulated Forecast
                  </span>
                  <span className="text-[#196C57] font-semibold bg-emerald-50 px-2 py-0.5 rounded font-mono">
                    94.2% Confidence
                  </span>
                </div>
              </GlassCard>

              {/* Medications Adherence Card */}
              <GlassCard className="p-6 flex flex-col border border-white/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1d5bf0]">
                    Pharmacotherapy Adherence
                  </span>
                  <span className="text-[11px] text-[#445f73] font-medium">Recorded Inflow Gap</span>
                </div>
                <h3 className="text-[16px] font-bold text-[#111e1d] mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                  Current Regimen &amp; Dosing Telemetry
                </h3>

                <div className="space-y-3">
                  {patient.medications.map((med) => {
                    const isPoor = med.adherence_score < 0.7;

                    return (
                      <div key={med.id} className="p-3.5 rounded-2xl bg-white/70 border border-gray-100 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                            isPoor ? 'bg-red-100 text-[#ba1a1a]' : 'bg-[#e5efff] text-[#1d5bf0]'
                          }`}>
                            <Pill className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-[#111e1d]">{med.name} {med.dosage}</span>
                            <span className="text-[11px] text-[#445f73]">{med.frequency} &bull; Last: {new Date(med.last_taken_time).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className={`text-[12px] font-bold font-mono ${isPoor ? 'text-[#ba1a1a]' : 'text-[#196C57]'}`}>
                            {Math.round(med.adherence_score * 100)}% Adherence
                          </span>
                          {med.omission_interval_hours > 0 && (
                            <span className="text-[10px] text-[#ba1a1a] font-semibold bg-red-50 px-2 py-0.5 rounded-full mt-0.5">
                              ~{med.omission_interval_hours}h gap omission
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </div>

            {/* Right Column: Alerts Deck & Clinical Actions (3 cols) */}
            <div className="lg:col-span-3 flex flex-col gap-5">
              <GlassCard className="p-6 flex flex-col border border-white/80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[16px] font-bold text-[#111e1d]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                    Clinical Alert Deck
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                    alerts.some((a) => a.status === 'ACTIVE')
                      ? 'bg-red-100 text-[#ba1a1a]'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {alerts.filter((a) => a.status === 'ACTIVE').length} Active
                  </span>
                </div>

                {actionNotice && (
                  <div className={`p-3.5 mb-3 rounded-2xl text-[12px] flex flex-col gap-1 border shadow-xs animate-in fade-in duration-200 ${
                    actionNotice.type === 'ack'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-purple-50 border-purple-200 text-purple-900'
                  }`}>
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        {actionNotice.title}
                      </span>
                      <button
                        onClick={() => setActionNotice(null)}
                        className="text-[#445f73] hover:text-[#111e1d] font-bold"
                        type="button"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[11px] leading-tight opacity-90">{actionNotice.detail}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {alerts.map((alt) => (
                    <div
                      key={alt.id}
                      className={`p-3.5 rounded-2xl border flex flex-col gap-2 transition-all ${
                        alt.status === 'ESCALATED'
                          ? 'border-purple-200 bg-purple-50/70'
                          : alt.status === 'ACKNOWLEDGED'
                          ? 'border-emerald-200 bg-emerald-50/50'
                          : 'border-red-200 bg-red-50/60 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider font-mono px-1.5 py-0.5 rounded text-white ${
                            alt.status === 'ESCALATED'
                              ? 'bg-purple-700'
                              : alt.status === 'ACKNOWLEDGED'
                              ? 'bg-[#1d5bf0]'
                              : 'bg-[#ba1a1a]'
                          }`}>
                            {alt.tier}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-mono ${
                            alt.status === 'ESCALATED'
                              ? 'bg-purple-200 text-purple-900'
                              : alt.status === 'ACKNOWLEDGED'
                              ? 'bg-emerald-200 text-emerald-900'
                              : 'bg-red-200 text-red-900'
                          }`}>
                            {alt.status}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[#445f73] font-semibold">{alt.eta_to_threshold}</span>
                      </div>

                      <h4 className="text-[13px] font-bold text-[#111e1d] leading-snug">
                        {alt.primary_concern}
                      </h4>

                      <p className="text-[11px] text-[#445f73] leading-relaxed">
                        {alt.trigger_summary}
                      </p>

                      {alt.escalation_protocol && (
                        <div className="p-2.5 rounded-xl bg-purple-100/80 text-[11px] text-purple-950 font-medium border border-purple-200">
                          <div className="font-bold text-purple-900 flex items-center justify-between">
                            <span>🚨 Dispatched to Cath Lab Triage</span>
                            <span className="font-mono text-[10px] bg-purple-200 px-1.5 py-0.5 rounded">STAT QUEUE</span>
                          </div>
                          <p className="mt-0.5 text-purple-900 font-semibold">{alt.escalation_protocol}</p>
                          <div className="mt-1 flex items-center justify-between text-[10px] text-purple-900">
                            <span>Recipient: Cath Lab • CCU Emergency Coordinator</span>
                            <Link to="/cath-lab-triage" className="font-bold underline hover:text-purple-700">
                              View Suite Queue &rarr;
                            </Link>
                          </div>
                        </div>
                      )}

                      {alt.status === 'ACKNOWLEDGED' && (
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-[11px] text-emerald-950 font-medium border border-emerald-200">
                          <div className="font-bold text-emerald-800 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Reviewed by Dr. A. Sharma
                            </span>
                            <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                              AUDIT LOGGED
                            </span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[10px] text-[#445f73]">
                            <span>Broadcast to: <strong>Central CCU Nursing Desk</strong> • Audio Muted</span>
                            <Link to="/nursing-desk" className="font-bold text-emerald-800 underline hover:text-emerald-600">
                              View Ward Desk &rarr;
                            </Link>
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[11px]">
                        <span className={alt.status === 'ESCALATED' ? 'text-purple-800 font-semibold' : 'text-[#ba1a1a] font-semibold'}>
                          {alt.recommended_action}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-4 pt-4 border-t border-[#bcc9cb]/30 flex flex-col gap-2.5">
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
                    className={`w-full py-2.5 rounded-xl font-bold text-[13px] shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-98 ${
                      alerts.every((a) => a.status === 'ACKNOWLEDGED')
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-[#1d5bf0] hover:bg-[#1546b8] text-white'
                    }`}
                    type="button"
                  >
                    <Check className="w-4 h-4" />
                    {acknowledging
                      ? 'Acknowledging...'
                      : alerts.every((a) => a.status === 'ACKNOWLEDGED')
                      ? 'Alert Acknowledged'
                      : 'Acknowledge Alert'}
                  </button>

                  <button
                    onClick={() => setShowEscalateModal(true)}
                    className="w-full py-2.5 rounded-xl bg-white/80 hover:bg-white text-[#111e1d] font-semibold text-[13px] transition-all shadow-2xs border border-gray-200 flex items-center justify-center gap-1.5 hover:text-purple-800 hover:border-purple-300 active:scale-98"
                    type="button"
                  >
                    <ShieldAlert className="w-4 h-4 text-purple-700" />
                    Escalate to Cath-Triage
                  </button>

                  {/* Routing Architecture Hint */}
                  <div className="p-2.5 rounded-xl bg-gray-50/80 border border-gray-200/60 text-[10px] text-[#445f73] leading-relaxed">
                    <span className="font-bold text-[#111e1d]">📡 Live Recipient Dashboards:</span>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Link to="/nursing-desk" className="font-bold text-[#1d5bf0] hover:underline flex items-center gap-0.5">
                        <span>👩‍⚕️ Central CCU Nursing Desk</span>
                      </Link>
                      <span>&bull;</span>
                      <Link to="/cath-lab-triage" className="font-bold text-purple-800 hover:underline flex items-center gap-0.5">
                        <span>🫀 Cath Lab Triage</span>
                      </Link>
                      <span>&bull;</span>
                      <Link to="/audit-vault" className="font-bold text-[#445f73] hover:underline flex items-center gap-0.5">
                        <span>🏛️ CDSCO Audit</span>
                      </Link>
                    </div>
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
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
                        checked={selectedProtocol === proto}
                        onChange={() => setSelectedProtocol(proto)}
                        className="accent-purple-700"
                      />
                      <span>{proto}</span>
                    </label>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl bg-[#e5efff] text-[12px] text-[#1d5bf0] flex items-center gap-2 border border-[#1d5bf0]/15">
                  <Stethoscope className="w-4 h-4 text-[#1d5bf0]" />
                  <span>Subject: <strong>{patient.patient_id}</strong> ({patient.name}) &bull; Attending: <strong>Dr. A. Sharma</strong></span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setShowEscalateModal(false)}
                    className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#445f73] hover:bg-gray-100 transition-colors"
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      const activeAlt = alerts.find((a) => a.status === 'ACTIVE') || alerts[0];
                      if (!activeAlt || escalating) return;
                      setEscalating(true);
                      try {
                        const res = await escalateAlert(patientId, activeAlt.id, selectedProtocol);
                        triggerCardiacBeep(180, 95);
                        await alertsQuery.refetch();
                        setShowEscalateModal(false);
                        setActionNotice({
                          type: 'esc',
                          title: 'Escalation Dispatched',
                          detail: res.message || `Patient dispatched to CCU under protocol: ${selectedProtocol}`,
                        });
                      } finally {
                        setEscalating(false);
                      }
                    }}
                    disabled={escalating}
                    className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-[13px] shadow-sm flex items-center gap-1.5 transition-all active:scale-98"
                    type="button"
                  >
                    {escalating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Dispatching...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Confirm CCU Dispatch</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
