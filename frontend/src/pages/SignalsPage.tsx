import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  getPatientDetail,
  getTwinDrift,
  calibrateTwin,
  resetCalibration,
  getPatientWearable,
  getPatientEnvironment,
  getPredictions,
} from '../api/client';
import type { WearableSeriesResponse, CalibrationResponse } from '../api/types';
import GlassCard from '../components/GlassCard';
import { GlassSkeleton, GlassError } from '../components/GlassState';
import { DriftIndexChart } from '../components/charts/DriftIndexChart';
import { EnvironmentTimelineChart } from '../components/charts/EnvironmentTimelineChart';

function generatePoincarePoints(isIrregular: boolean, meanRR = 760) {
  const points: { rr_n: number; rr_n1: number; id: number }[] = [];
  const count = 75;
  for (let i = 0; i < count; i++) {
    const seed = (i * 9301 + 49297) % 233280;
    const u1 = seed / 233280;
    const seed2 = ((i + 17) * 9301 + 49297) % 233280;
    const u2 = seed2 / 233280;
    const z0 = Math.sqrt(-2.0 * Math.log(Math.max(0.001, u1))) * Math.cos(2.0 * Math.PI * u2);
    const z1 = Math.sqrt(-2.0 * Math.log(Math.max(0.001, u1))) * Math.sin(2.0 * Math.PI * u2);

    if (isIrregular) {
      const spread = 65 + (i % 3) * 30;
      const rrn = Math.round(meanRR + z0 * spread);
      const rrn1 = Math.round(meanRR + z1 * spread * 1.2 + (Math.abs(z0) > 0.8 ? (z0 > 0 ? 55 : -55) : 0));
      points.push({ rr_n: Math.max(560, Math.min(1040, rrn)), rr_n1: Math.max(560, Math.min(1040, rrn1)), id: i });
    } else {
      const along = z0 * 46;
      const perp = z1 * 13;
      const rrn = Math.round(meanRR + (along - perp) * 0.7071);
      const rrn1 = Math.round(meanRR + (along + perp) * 0.7071);
      points.push({ rr_n: Math.max(560, Math.min(1040, rrn)), rr_n1: Math.max(560, Math.min(1040, rrn1)), id: i });
    }
  }
  return points;
}

export default function SignalsPage() {
  const { id } = useParams<{ id: string }>();
  const patientId = id || 'CT-3092';

  const [activeTab, setActiveTab] = useState<'drift' | 'env' | 'rhythm'>('drift');
  const [calibrating, setCalibrating] = useState(false);
  const [calibrated, setCalibrated] = useState(false);
  const [calibrationDetails, setCalibrationDetails] = useState<CalibrationResponse | null>(null);
  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState(false);
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [telemetryData, setTelemetryData] = useState<WearableSeriesResponse | null>(null);

  const patientQuery = useQuery({
    queryKey: ['patientDetail', patientId],
    queryFn: () => getPatientDetail(patientId),
  });

  const driftQuery = useQuery({
    queryKey: ['twinDrift', patientId],
    queryFn: () => getTwinDrift(patientId),
  });

  const envQuery = useQuery({
    queryKey: ['patientEnvironment', patientId],
    queryFn: () => getPatientEnvironment(patientId),
  });

  const predQuery = useQuery({
    queryKey: ['predictions', patientId],
    queryFn: () => getPredictions(patientId),
  });

  const isLoading = patientQuery.isLoading || driftQuery.isLoading;
  const isError = patientQuery.isError || driftQuery.isError;
  const error = patientQuery.error || driftQuery.error;

  const patient = patientQuery.data;
  const drift = driftQuery.data;

  const handleCalibration = async () => {
    if (calibrated || calibrating) return;
    setCalibrating(true);
    try {
      const res = await calibrateTwin(patientId);
      setCalibrationDetails(res);
      await driftQuery.refetch();
      setCalibrated(true);
    } catch (err) {
      console.error(err);
    } finally {
      setCalibrating(false);
    }
  };

  const handleResetCalibration = async () => {
    try {
      await resetCalibration(patientId);
      await driftQuery.refetch();
      setCalibrated(false);
      setCalibrationDetails(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenTelemetry = async () => {
    setShowTelemetryDrawer(true);
    if (!telemetryData) {
      setTelemetryLoading(true);
      try {
        const data = await getPatientWearable(patientId, 24, 60);
        setTelemetryData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setTelemetryLoading(false);
      }
    }
  };

  const currentTDI = calibrated ? 14 : (drift?.current_tdi || 41);

  return (
    <div className="flex flex-col w-full max-w-[1560px] mx-auto gap-5 mt-4 pb-10">
      {isLoading && <GlassSkeleton lines={6} />}
      {isError && (
        <GlassError
          message={(error as Error)?.message}
          onRetry={() => {
            patientQuery.refetch();
            driftQuery.refetch();
          }}
        />
      )}

      {patient && drift && (
        <>
          {/* Patient Header Context Breadcrumb */}
          <GlassCard className="w-full flex flex-wrap items-center justify-between gap-4 px-6 py-4 border border-white/80">
            <div className="flex items-center gap-3">
              <Link
                to={`/doctor/patients/${patient.patient_id}`}
                className="w-9 h-9 rounded-xl bg-white/80 hover:bg-white text-[#445f73] flex items-center justify-center transition-all shadow-xs border border-white"
                title="Back to Patient Twin"
              >
                <span className="material-symbols-outlined text-[19px]">arrow_back</span>
              </Link>
              <div className="flex items-center gap-2.5 flex-wrap text-[13px]">
                <span className="text-[#445f73] font-semibold">Patient Twin</span>
                <span className="text-[#bcc9cb]">/</span>
                <span className="font-bold text-[#111e1d]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                  {patient.name}
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#e0f1ef] text-[#00666f] font-mono font-bold">
                  {patient.patient_id}
                </span>
                <span className="text-[#bcc9cb]">&bull;</span>
                <span className="text-[#445f73]">{patient.age}y {patient.sex} &bull; {patient.city}</span>
                <span className="text-[#bcc9cb]">&bull;</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e2f1ef] text-[#00666f]">
                  {patient.htn_stage}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e2f1ef] text-[#00666f]">
                  {patient.diabetes_type}
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#2FBF9B]/15 text-[#196C57] text-[11px] font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-[#196C57] animate-pulse" />
              <span>Twin State: Validated (98.4% Fit)</span>
            </div>
          </GlassCard>

          {/* Title & Description Header */}
          <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-[#00666f] font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">sensors</span>
                Continuous Hemodynamic Observables
              </span>
              <h1 className="text-[28px] text-[#111e1d] font-bold tracking-tight mt-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                Physiological Signals &amp; Sensor Drift
              </h1>
              <p className="text-[13px] text-[#445f73] mt-1 max-w-3xl">
                Longitudinal fidelity tracking across multimodal continuous telemetry streams and ambient covariates.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[#445f73] text-[11px] bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white shadow-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#00666f] animate-pulse" />
              <span>Telemetry Inflow: Realtime 1 Hz</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-2 p-1 rounded-2xl bg-white/60 backdrop-blur-md w-fit border border-white/80 shadow-xs">
            <button
              onClick={() => setActiveTab('drift')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                activeTab === 'drift'
                  ? 'bg-gradient-to-r from-[#00666f] to-[#00818c] text-white shadow-xs'
                  : 'text-[#445f73] hover:text-[#111e1d] hover:bg-white/80'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">monitoring</span>
              <span>Twin Drift Index (TDI)</span>
              <span className={`inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                activeTab === 'drift' ? 'bg-white/20 text-white' : 'bg-[#dcebe9] text-[#00666f]'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${calibrated ? 'bg-[#2FBF9B]' : 'bg-white animate-pulse'}`} />
                {currentTDI}/100
              </span>
            </button>

            <button
              onClick={() => setActiveTab('env')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                activeTab === 'env'
                  ? 'bg-gradient-to-r from-[#00666f] to-[#00818c] text-white shadow-xs'
                  : 'text-[#445f73] hover:text-[#111e1d] hover:bg-white/80'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">thermostat</span>
              <span>Ambient Microclimate</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                activeTab === 'env' ? 'bg-white/20 text-white' : 'bg-[#dcebe9] text-[#3d494a]'
              }`}>
                {envQuery.data ? `AQI ${envQuery.data.current_environment.aqi} • ${envQuery.data.current_environment.temperature_c}°C` : 'AQI 382 • 14.2°C'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('rhythm')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                activeTab === 'rhythm'
                  ? 'bg-gradient-to-r from-[#00666f] to-[#00818c] text-white shadow-xs'
                  : 'text-[#445f73] hover:text-[#111e1d] hover:bg-white/80'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">ecg</span>
              <span>Rhythm &amp; Poincaré RR</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                activeTab === 'rhythm' ? 'bg-white/20 text-white' : 'bg-[#dcebe9] text-[#3d494a]'
              }`}>
                {predQuery.data?.rhythm_irregularity_detected ? 'Irregular / AF' : 'Sinus (SD1/SD2 0.31)'}
              </span>
            </button>
          </div>

          {/* Tab 1: Twin Drift Index View */}
          {activeTab === 'drift' && (
            <>
              {/* Main Content Card: Twin Drift Index with Recharts Area Chart */}
              <GlassCard className="p-6 flex flex-col border border-white/80">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-[20px] text-[#111e1d] font-bold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                        Twin Drift Index (TDI) &mdash; 7-Day Longitudinal Tracking
                      </h2>
                      {calibrated ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] bg-[#2FBF9B]/15 text-[#196C57] font-bold font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#196C57]" />
                          Current TDI: 14 / 100 &bull; Calibrated Nominal
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] bg-[#F5B83D]/15 text-[#8E6200] font-bold font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8E6200] animate-ping" />
                          Current TDI: {drift.current_tdi} / 100 &bull; {drift.status}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-[#dcebe9] text-[#445f73] font-mono font-medium">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {calibrated ? 'Calibration Synchronized' : 'Expected Recalibration: T-18h'}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#445f73] mt-1">
                      Measures biophysical model divergence against observed wearable photoplethysmography (PPG) and cuff telemetry.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-[#445f73]">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-[#2FBF9B]/30" />
                      Nominal In Silico Fidelity (0&ndash;25)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-[#F2704F]" />
                      Divergence Alert (&gt;50)
                    </span>
                  </div>
                </div>

                {/* Real Recharts Drift Index Chart */}
                <div className="w-full relative mt-2 p-3 rounded-2xl bg-white/85 border border-gray-100 shadow-2xs">
                  <DriftIndexChart
                    trend={drift.seven_day_trend}
                    liveTdi={currentTDI}
                  />
                </div>

                <div className="mt-4 pt-3 flex flex-wrap items-center justify-between text-[#445f73] text-[12px] gap-2 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="material-symbols-outlined text-[16px] text-[#00666f]">sensors</span>
                      Telemetry Pipeline: Continuous Wearable PPG + Tonometric Oscillometry
                    </span>
                    <span className="text-[#bcc9cb]">&bull;</span>
                    <span className="font-mono">Rolling Window: 168 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex w-2 h-2 rounded-full bg-[#2FBF9B]" />
                    <span className="font-bold text-[#111e1d]">Algorithmic Confidence: 94.2%</span>
                  </div>
                </div>
              </GlassCard>

              {/* Biometric Drift Contributions Grid */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[18px] text-[#111e1d] font-bold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                      Biometric Drift Parameter Breakdown
                    </h3>
                    <p className="text-[12px] text-[#445f73]">
                      Factor decomposition revealing parameter variance between simulated biophysics and telemetry sensors.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#445f73] bg-white/70 px-2 py-0.5 rounded-full border border-gray-100">
                    Total Divergence = 100%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {drift.factor_contributions.map(fc => (
                    <div
                      key={fc.factor_name}
                      className="p-5 rounded-2xl flex flex-col justify-between glass-card border border-white/80"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-9 h-9 rounded-xl bg-[#e2f1ef] flex items-center justify-center text-[#00666f]">
                            <span className="material-symbols-outlined text-[20px]">tune</span>
                          </div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-amber-50 text-amber-900 border border-amber-200 font-mono font-bold">
                            <span className="material-symbols-outlined text-[13px]">arrow_upward</span>+{fc.percentage}%
                          </span>
                        </div>
                        <h4 className="text-[15px] text-[#111e1d] font-bold leading-tight mt-1">{fc.factor_name}</h4>
                        <p className="text-[12px] text-[#445f73] mt-2 leading-relaxed">
                          Baseline: <strong className="font-semibold text-[#111e1d]">{fc.baseline_value}</strong> &rarr; Observed:{' '}
                          <strong className="font-semibold text-[#ba1a1a]">{fc.observed_value}</strong>
                        </p>
                      </div>
                      <div className="mt-4 pt-2.5 flex items-center justify-between text-[11px] text-[#445f73] border-t border-gray-100">
                        <span className="flex items-center gap-1 font-mono">
                          <span className="material-symbols-outlined text-[15px] text-[#2FBF9B]">verified</span>
                          SNR: {fc.signal_snr}
                        </span>
                        <span className="font-bold text-[#00666f]">{fc.confidence}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Tab 2: Ambient Microclimate View */}
          {activeTab === 'env' && (
            <div className="flex flex-col gap-5">
              {envQuery.isLoading && <GlassSkeleton lines={6} />}
              {envQuery.data && (
                <>
                  {/* Microclimate Overview Banner */}
                  <GlassCard className="p-6 flex flex-col border border-white/80">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] uppercase tracking-wider text-[#00666f] font-mono font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">location_on</span>
                            CPCB Monitoring Station: {envQuery.data.current_environment.station_name}
                          </span>
                          <span className="text-[#bcc9cb]">&bull;</span>
                          <span className="text-[12px] text-[#445f73] font-semibold">
                            {envQuery.data.current_environment.city}, India
                          </span>
                        </div>
                        <h2 className="text-[22px] text-[#111e1d] font-bold tracking-tight mt-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                          Ambient Atmospheric Telemetry &amp; Urban Microclimate
                        </h2>
                        <p className="text-[13px] text-[#445f73] mt-0.5 max-w-2xl">
                          Real-time environmental covariates linked to the digital twin's systemic vascular resistance ($R_p$) and autonomic tone.
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={`px-4 py-3 rounded-2xl flex items-center gap-3 border shadow-xs ${
                          envQuery.data.current_environment.aqi > 300
                            ? 'bg-red-50/90 border-red-200 text-red-900'
                            : envQuery.data.current_environment.aqi > 200
                            ? 'bg-amber-50/90 border-amber-200 text-amber-900'
                            : 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                        }`}>
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider font-mono font-bold opacity-75">
                              CPCB AQI Index
                            </span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[26px] font-black leading-none font-mono">
                                {envQuery.data.current_environment.aqi}
                              </span>
                              <span className="text-[12px] font-bold">
                                {envQuery.data.current_environment.aqi_category}
                              </span>
                            </div>
                          </div>
                          <span className={`w-3 h-3 rounded-full animate-ping ${
                            envQuery.data.current_environment.aqi > 300 ? 'bg-red-500' : 'bg-amber-500'
                          }`} />
                        </div>
                      </div>
                    </div>

                    {/* Atmospheric Observables Metric Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="p-4 rounded-xl bg-white/70 border border-gray-100 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-[#445f73] text-[11px] font-medium">
                          <span>PM2.5 Concentration</span>
                          <span className="material-symbols-outlined text-[16px] text-red-500">blur_on</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-[22px] font-bold text-[#111e1d] font-mono">
                            {envQuery.data.current_environment.pm25_ug_m3}
                          </span>
                          <span className="text-[12px] text-[#445f73] ml-1 font-mono">µg/m³</span>
                        </div>
                        <span className="text-[11px] text-red-700 font-medium mt-1">
                          ~{(envQuery.data.current_environment.pm25_ug_m3 / 15).toFixed(1)}x WHO 24h Threshold
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-white/70 border border-gray-100 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-[#445f73] text-[11px] font-medium">
                          <span>Ambient Temperature</span>
                          <span className="material-symbols-outlined text-[16px] text-[#00666f]">device_thermostat</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-[22px] font-bold text-[#111e1d] font-mono">
                            {envQuery.data.current_environment.temperature_c}°
                          </span>
                          <span className="text-[12px] text-[#445f73] ml-1 font-mono">Celsius</span>
                        </div>
                        <span className="text-[11px] text-[#00666f] font-medium mt-1">
                          Winter Inversion Smog Chill
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-white/70 border border-gray-100 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-[#445f73] text-[11px] font-medium">
                          <span>Relative Humidity</span>
                          <span className="material-symbols-outlined text-[16px] text-[#00666f]">water_drop</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-[22px] font-bold text-[#111e1d] font-mono">
                            {envQuery.data.current_environment.humidity_percent}%
                          </span>
                          <span className="text-[12px] text-[#445f73] ml-1 font-mono">RH</span>
                        </div>
                        <span className="text-[11px] text-[#445f73] font-medium mt-1">
                          Enhanced Airflow Resistance
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-white/70 border border-gray-100 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-[#445f73] text-[11px] font-medium">
                          <span>Episodic Event Flag</span>
                          <span className="material-symbols-outlined text-[16px] text-amber-600">crisis_alert</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-[15px] font-bold text-[#ba1a1a] leading-tight">
                            {envQuery.data.current_environment.festival_flag || 'Diwali Stubble Inversion'}
                          </span>
                        </div>
                        <span className="text-[11px] text-amber-800 font-medium mt-1">
                          Nocturnal Peak Particulate Surge
                        </span>
                      </div>
                    </div>
                  </GlassCard>

                  {/* 24-Hour Timeline Chart */}
                  <GlassCard className="p-6 flex flex-col border border-white/80">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3">
                      <div>
                        <h3 className="text-[18px] text-[#111e1d] font-bold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                          Multivariate Environmental Trajectory &amp; 24h Dispersion Forecast
                        </h3>
                        <p className="text-[12px] text-[#445f73] mt-0.5">
                          Fine particulate concentration (PM2.5) plotted against nocturnal temperature swing and inversion layer retention.
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-[#445f73] font-mono">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-xs bg-[#ba1a1a]/70" />
                          PM2.5 (µg/m³)
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-0.5 bg-[#00666f]" />
                          Ambient Chill (°C)
                        </span>
                      </div>
                    </div>

                    <div className="w-full relative mt-2 p-3 rounded-2xl bg-white/85 border border-gray-100 shadow-2xs">
                      <EnvironmentTimelineChart
                        current={envQuery.data.current_environment}
                        forecast={envQuery.data.recent_forecast}
                      />
                    </div>
                  </GlassCard>

                  {/* Biophysical Mechanistic Pathway Card */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <GlassCard className="p-6 lg:col-span-2 flex flex-col justify-between border border-white/80">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-[20px] text-[#00666f]">biotech</span>
                          <h3 className="text-[17px] text-[#111e1d] font-bold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                            Biophysical Hemodynamic Coupling Mechanism
                          </h3>
                        </div>
                        <p className="text-[13px] text-[#445f73] leading-relaxed">
                          {envQuery.data.biophysical_impact_summary}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                          <div className="p-3.5 rounded-xl bg-white/80 border border-gray-100">
                            <span className="text-[10px] font-mono font-bold text-[#00666f] uppercase">Stage 1: Inhalation</span>
                            <h4 className="text-[13px] font-bold text-[#111e1d] mt-1">Alveolar Translocation</h4>
                            <p className="text-[11px] text-[#445f73] mt-1 leading-snug">
                              Ultrafine carbonaceous aerosols cross alveolar-capillary barrier into systemic circulation.
                            </p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-white/80 border border-gray-100">
                            <span className="text-[10px] font-mono font-bold text-[#ba1a1a] uppercase">Stage 2: Endothelial</span>
                            <h4 className="text-[13px] font-bold text-[#111e1d] mt-1">Nitric Oxide Depletion</h4>
                            <p className="text-[11px] text-[#445f73] mt-1 leading-snug">
                              Macrophage-induced oxidative stress quenches vascular NO, triggering acute endothelin-1 surge.
                            </p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-white/80 border border-gray-100">
                            <span className="text-[10px] font-mono font-bold text-amber-700 uppercase">Stage 3: Resistance</span>
                            <h4 className="text-[13px] font-bold text-[#111e1d] mt-1">Rp Impedance Rise (+24%)</h4>
                            <p className="text-[11px] text-[#445f73] mt-1 leading-snug">
                              Synergistic sympathetic vasospasm and ambient chill elevate arterial impedance toward crisis threshold.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#445f73]">
                        <span className="font-mono">South Asian Phenotype: Elevated Endothelial Susceptibility</span>
                        <span className="text-[#00666f] font-bold">Coupling Coeff: r = 0.42 (p &lt; 0.001)</span>
                      </div>
                    </GlassCard>

                    {/* Environmental Sensitivities Matrix */}
                    <GlassCard className="p-6 flex flex-col justify-between border border-white/80">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-[20px] text-[#00666f]">tune</span>
                          <h3 className="text-[17px] text-[#111e1d] font-bold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                            Sensitivity Factors
                          </h3>
                        </div>
                        <p className="text-[12px] text-[#445f73] mb-3">
                          Empirical model weighting for {envQuery.data.current_environment.city}:
                        </p>

                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 border border-gray-100 text-[12px]">
                            <span className="text-[#445f73]">PM2.5 Pressor Slope:</span>
                            <span className="font-mono font-bold text-[#ba1a1a]">+4.8 mmHg / 100µg</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 border border-gray-100 text-[12px]">
                            <span className="text-[#445f73]">Ambient Chill Delta:</span>
                            <span className="font-mono font-bold text-[#00666f]">+6.2 mmHg / 5°C</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 border border-gray-100 text-[12px]">
                            <span className="text-[#445f73]">Sympathovagal LF/HF:</span>
                            <span className="font-mono font-bold text-amber-800">2.92 (Sympathetic High)</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-3 rounded-xl bg-teal-50/70 border border-teal-200 text-[11px] text-[#00666f]">
                        <div className="font-bold flex items-center gap-1 mb-0.5">
                          <span className="material-symbols-outlined text-[14px]">shield</span>
                          Digital Twin Directive
                        </div>
                        Advise indoor HEPA purification and restrict morning physical exertion during peak temperature inversion.
                      </div>
                    </GlassCard>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab 3: Rhythm & Poincaré RR Tab Content */}
          {activeTab === 'rhythm' && (
            <div className="flex flex-col gap-5">
              {predQuery.isLoading && <GlassSkeleton lines={6} />}
              {predQuery.data && (
                <>
                  {/* Rhythm Status Banner */}
                  <GlassCard className="p-6 flex flex-col border border-white/80">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          predQuery.data.rhythm_irregularity_detected
                            ? 'bg-red-100 text-red-700'
                            : 'bg-[#e0f1ef] text-[#00666f]'
                        }`}>
                          <span className="material-symbols-outlined text-[26px]">ecg</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-mono ${
                              predQuery.data.rhythm_irregularity_detected
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-[#e0f1ef] text-[#00666f] border border-[#b2ded8]'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${
                                predQuery.data.rhythm_irregularity_detected ? 'bg-red-600 animate-ping' : 'bg-[#00666f]'
                              }`} />
                              {predQuery.data.rhythm_irregularity_detected
                                ? 'Paroxysmal Atrial Fibrillation / Irregular RR Dispersion Flagged'
                                : 'Sinus Rhythm with Sympathetic Autonomic Overdrive'}
                            </span>
                            <span className="text-[11px] font-mono text-[#445f73]">
                              Classifier Confidence: 91.8%
                            </span>
                          </div>
                          <h2 className="text-[22px] text-[#111e1d] font-bold tracking-tight mt-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                            Beat-to-Beat RR Interval Geometry &amp; Autonomic Coupling
                          </h2>
                          <p className="text-[13px] text-[#445f73] mt-0.5">
                            Poincaré phase space reconstruction over a 120-beat rolling photoplethysmography (PPG) epoch.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="px-3.5 py-2 rounded-xl bg-white/80 border border-gray-100 text-[11px] font-mono text-[#445f73]">
                          <span>Epoch Length: </span>
                          <strong className="text-[#111e1d]">120 Beats</strong>
                        </div>
                        <div className="px-3.5 py-2 rounded-xl bg-white/80 border border-gray-100 text-[11px] font-mono text-[#445f73]">
                          <span>Mean Heart Rate: </span>
                          <strong className="text-[#00666f]">78 bpm</strong>
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Poincaré Chart and Metrics Side-by-Side */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* SVG Poincaré Scatter Plot (7 cols) */}
                    <GlassCard className="p-6 lg:col-span-7 flex flex-col border border-white/80">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div>
                          <h3 className="text-[18px] text-[#111e1d] font-bold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                            Poincaré Phase Space Plot (RR[n] vs RR[n+1])
                          </h3>
                          <p className="text-[12px] text-[#445f73] mt-0.5">
                            Transverse dispersion (SD1) vs longitudinal dispersion (SD2) along the line of identity.
                          </p>
                        </div>
                        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                          Units: Milliseconds (ms)
                        </span>
                      </div>

                      {/* SVG Canvas for Poincaré Plot */}
                      <div className="w-full flex items-center justify-center p-2 mt-3">
                        <svg
                          viewBox="0 0 500 420"
                          className="w-full max-w-[480px] h-auto select-none overflow-visible"
                        >
                          <defs>
                            <linearGradient id="poincareEllipse" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#00666f" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#2FBF9B" stopOpacity="0.10" />
                            </linearGradient>
                            <filter id="pointGlow" x="-50%" y="-50%" width="200%" height="200%">
                              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#00666f" floodOpacity="0.3" />
                            </filter>
                          </defs>

                          {/* Background Grid & Axes Box */}
                          <rect x="55" y="25" width="410" height="340" fill="#f8fafb" rx="12" stroke="#e2e8f0" strokeWidth="1" />

                          {/* Grid lines (600, 700, 800, 900, 1000 ms) */}
                          {[600, 700, 800, 900, 1000].map(val => {
                            const x = 55 + ((val - 550) / 500) * 410;
                            const y = 25 + 340 - ((val - 550) / 500) * 340;
                            return (
                              <g key={val}>
                                {/* Vertical Grid line */}
                                <line x1={x} y1={25} x2={x} y2={365} stroke="#e2e8f0" strokeDasharray="3 3" />
                                <text x={x} y={382} textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="monospace">
                                  {val}
                                </text>
                                {/* Horizontal Grid line */}
                                <line x1={55} y1={y} x2={465} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                                <text x={48} y={y + 3} textAnchor="end" fontSize="10" fill="#64748b" fontFamily="monospace">
                                  {val}
                                </text>
                              </g>
                            );
                          })}

                          {/* Line of Identity (y = x) */}
                          <line
                            x1="55"
                            y1="365"
                            x2="465"
                            y2="25"
                            stroke="#94a3b8"
                            strokeWidth="1.8"
                            strokeDasharray="5 4"
                          />
                          <text x="440" y="45" fontSize="10" fill="#64748b" fontStyle="italic">
                            y = x
                          </text>

                          {/* Fitted SD1/SD2 Ellipse centered at (760, 760) */}
                          <g transform="translate(227, 222) rotate(-45)">
                            <ellipse
                              cx="0"
                              cy="0"
                              rx={predQuery.data.rhythm_irregularity_detected ? 72 : 58}
                              ry={predQuery.data.rhythm_irregularity_detected ? 38 : 18}
                              fill="url(#poincareEllipse)"
                              stroke="#00666f"
                              strokeWidth="2"
                              strokeDasharray="4 2"
                            />
                            {/* SD2 Major Axis vector */}
                            <line x1={predQuery.data.rhythm_irregularity_detected ? -72 : -58} y1="0" x2={predQuery.data.rhythm_irregularity_detected ? 72 : 58} y2="0" stroke="#00666f" strokeWidth="1.5" />
                            {/* SD1 Minor Axis vector */}
                            <line x1="0" y1={predQuery.data.rhythm_irregularity_detected ? -38 : -18} x2="0" y2={predQuery.data.rhythm_irregularity_detected ? 38 : 18} stroke="#ba1a1a" strokeWidth="1.5" />
                          </g>

                          {/* Center of Mass marker */}
                          <circle cx="227" cy="222" r="3.5" fill="#111e1d" />

                          {/* Scatter Plot RR Points */}
                          {generatePoincarePoints(predQuery.data.rhythm_irregularity_detected, 760).map(pt => {
                            const cx = 55 + ((pt.rr_n - 550) / 500) * 410;
                            const cy = 25 + 340 - ((pt.rr_n1 - 550) / 500) * 340;
                            return (
                              <circle
                                key={pt.id}
                                cx={cx}
                                cy={cy}
                                r="3.2"
                                fill={predQuery.data.rhythm_irregularity_detected ? '#ba1a1a' : '#00666f'}
                                fillOpacity={0.75}
                                stroke="#ffffff"
                                strokeWidth="1"
                                filter="url(#pointGlow)"
                              >
                                <title>{`RR[n]: ${pt.rr_n} ms, RR[n+1]: ${pt.rr_n1} ms`}</title>
                              </circle>
                            );
                          })}

                          {/* Axis Titles */}
                          <text x="260" y="405" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#334155">
                            RR[n] Interval (ms) &rarr;
                          </text>
                          <text x="16" y="195" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#334155" transform="rotate(-90 16 195)">
                            RR[n+1] Interval (ms) &rarr;
                          </text>
                        </svg>
                      </div>

                      {/* Poincaré Legend */}
                      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#445f73] mt-2 pt-3 border-t border-gray-100">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#00666f]" />
                          Observed RR Pair
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-4 h-0.5 bg-[#94a3b8] border-b border-dashed" />
                          Line of Identity (y = x)
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-2 rounded-xs border border-[#00666f] bg-[#00666f]/20" />
                          Fitted SD1/SD2 Ellipse
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-0.5 bg-[#ba1a1a]" />
                          SD1 Transverse (Vagal)
                        </span>
                      </div>
                    </GlassCard>

                    {/* Quantitative Non-Linear HRV Metrics (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col gap-3.5">
                      <GlassCard className="p-5 flex flex-col border border-white/80">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-[15px] font-bold text-[#111e1d]">Quantitative Poincaré Metrics</h4>
                          <span className="text-[10px] font-mono uppercase text-[#00666f] bg-[#e0f1ef] px-2 py-0.5 rounded-full font-bold">
                            Rolling 120-Beat Epoch
                          </span>
                        </div>

                        <div className="space-y-3 mt-1">
                          {/* SD1 Card */}
                          <div className="p-3 rounded-xl bg-white/70 border border-gray-100 flex items-center justify-between">
                            <div>
                              <div className="text-[12px] font-bold text-[#111e1d]">SD1 (Transverse Dispersion)</div>
                              <div className="text-[11px] text-[#445f73]">Beat-to-beat parasympathetic (vagal) tone</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[17px] font-black font-mono text-[#ba1a1a]">16.8 ms</div>
                              <span className="text-[10px] text-red-700 font-semibold">Low (Vagal Blunting)</span>
                            </div>
                          </div>

                          {/* SD2 Card */}
                          <div className="p-3 rounded-xl bg-white/70 border border-gray-100 flex items-center justify-between">
                            <div>
                              <div className="text-[12px] font-bold text-[#111e1d]">SD2 (Longitudinal Dispersion)</div>
                              <div className="text-[11px] text-[#445f73]">Long-term sympathetic tone &amp; baroreflex</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[17px] font-black font-mono text-[#00666f]">54.2 ms</div>
                              <span className="text-[10px] text-emerald-700 font-semibold">Nominal Tone</span>
                            </div>
                          </div>

                          {/* SD1 / SD2 Ratio */}
                          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                            <div>
                              <div className="text-[12px] font-bold text-amber-900">SD1 / SD2 Ratio</div>
                              <div className="text-[11px] text-amber-800">Autonomic balance index (Normal: 0.45-0.70)</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[18px] font-black font-mono text-amber-900">0.31</div>
                              <span className="text-[10px] text-amber-800 font-bold">Uncoupled Outflow</span>
                            </div>
                          </div>

                          {/* Other HRV indexes */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div className="p-2.5 rounded-xl bg-white/70 border border-gray-100">
                              <span className="text-[10px] text-[#445f73] block">RMSSD / Mean RR</span>
                              <span className="text-[14px] font-bold font-mono text-[#111e1d]">0.022</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/70 border border-gray-100">
                              <span className="text-[10px] text-[#445f73] block">CV of RR Intervals</span>
                              <span className="text-[14px] font-bold font-mono text-[#111e1d]">7.4%</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/70 border border-gray-100">
                              <span className="text-[10px] text-[#445f73] block">Sample Entropy (SampEn)</span>
                              <span className="text-[14px] font-bold font-mono text-[#111e1d]">1.42</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/70 border border-gray-100">
                              <span className="text-[10px] text-[#445f73] block">Shannon Entropy</span>
                              <span className="text-[14px] font-bold font-mono text-[#111e1d]">3.18</span>
                            </div>
                          </div>
                        </div>
                      </GlassCard>

                      <GlassCard className="p-4 flex flex-col justify-between border border-white/80 bg-slate-50/60">
                        <div className="flex items-center gap-2 text-[12px] font-bold text-[#111e1d] mb-1">
                          <span className="material-symbols-outlined text-[16px] text-[#00666f]">clinical_notes</span>
                          <span>Clinical Diagnostic Significance</span>
                        </div>
                        <p className="text-[11px] text-[#445f73] leading-relaxed">
                          A contracted transverse dispersion (SD1 &lt; 20 ms) in hypertensive crisis signifies loss of protective vagal damping. Unopposed sympathetic inotropy elevates cardiac stroke work and leaves the myocardium susceptible to rapid arterial pressure escalations.
                        </p>
                        <div className="mt-2 pt-2 border-t border-gray-200 text-[10px] text-[#64748b] font-mono">
                          Decision support only &bull; Correlate with 12-lead standard diagnostic ECG
                        </div>
                      </GlassCard>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Clinical Calibration Action Banner */}
          <div
            className="p-5 px-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 glass-card border border-white/80 shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#00666f]/10 text-[#00666f] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">auto_fix_high</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold text-[#111e1d] leading-tight">
                    {calibrated ? 'Physiological Alignment Active (TDI: 14)' : 'Physiological Re-alignment Recommended'}
                  </span>
                  {calibrationDetails && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold border border-emerald-200">
                      Rp: {calibrationDetails.calibrated_rp} &bull; C: {calibrationDetails.calibrated_c}
                    </span>
                  )}
                </div>
                <span className="text-[12px] text-[#445f73] mt-0.5">
                  {calibrated
                    ? 'In silico parameters updated with tonometric oscillometry and ambient pressure calibration.'
                    : 'Twin drift has crossed nominal threshold due to acute autonomic fatigue and atmospheric covariates.'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={handleOpenTelemetry}
                className="w-full md:w-auto px-4 py-2.5 rounded-xl text-[13px] font-semibold text-[#00666f] bg-white hover:bg-[#eaf4f3] border border-gray-200 transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
                type="button"
              >
                <span className="material-symbols-outlined text-[17px]">table_rows</span>
                <span>View Logged Telemetry Raw</span>
              </button>

              {calibrated && (
                <button
                  onClick={handleResetCalibration}
                  className="w-full md:w-auto px-3.5 py-2.5 rounded-xl text-[12px] font-semibold text-[#445f73] hover:text-[#ba1a1a] hover:bg-red-50 transition-colors"
                  type="button"
                  title="Reset to pre-calibrated baseline state"
                >
                  Reset Baseline
                </button>
              )}

              <button
                onClick={handleCalibration}
                disabled={calibrating || calibrated}
                className={`w-full md:w-auto px-5 py-2.5 rounded-xl text-[13px] font-bold text-white shadow-sm transition-all flex items-center justify-center active:scale-95 ${
                  calibrated ? 'bg-emerald-600' : 'bg-gradient-to-r from-[#00666f] to-[#00818c] hover:brightness-110'
                }`}
                type="button"
              >
                {calibrating && (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin mr-1.5">sync</span>
                    <span>Aligning Hemodynamics...</span>
                  </>
                )}
                {calibrated && (
                  <>
                    <span className="material-symbols-outlined text-[16px] text-white mr-1.5">check</span>
                    <span>Calibrated (TDI: 14)</span>
                  </>
                )}
                {!calibrating && !calibrated && 'Trigger In Silico Calibration'}
              </button>
            </div>
          </div>

          {/* Raw Telemetry Log Slide-Over Drawer Modal */}
          {showTelemetryDrawer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
              <div
                className="w-full max-w-4xl max-h-[85vh] p-6 rounded-3xl flex flex-col gap-4 relative animate-in fade-in zoom-in-95 duration-200 border border-white"
                style={{
                  background: 'rgba(255, 255, 255, 0.96)',
                  boxShadow: '0 24px 60px -12px rgba(11,42,60,0.30)',
                }}
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#00666f]/10 text-[#00666f] flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-[22px]">sensors</span>
                    </div>
                    <div>
                      <h3 className="text-[18px] font-bold text-[#111e1d]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                        Logged Wearable Telemetry Stream
                      </h3>
                      <p className="text-[12px] text-[#445f73]">
                        Subject: <strong>{patient.patient_id}</strong> ({patient.name}) &bull; Continuous 5-min epoch resolution
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`http://localhost:8000/api/patients/${encodeURIComponent(patientId)}/wearable/export-csv`}
                      download
                      className="px-3.5 py-2 rounded-xl bg-[#00666f] hover:bg-[#00818c] text-white text-[12px] font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">file_download</span>
                      <span>Download CSV</span>
                    </a>
                    <button
                      onClick={() => setShowTelemetryDrawer(false)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-[#445f73]"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>
                </div>

                {telemetryLoading && (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#445f73]">
                    <span className="material-symbols-outlined text-[32px] text-[#00666f] animate-spin">sync</span>
                    <span className="text-[13px] font-semibold">Streaming high-resolution wearable records...</span>
                  </div>
                )}

                {telemetryData && (
                  <div className="flex-1 overflow-auto rounded-xl border border-gray-200 bg-white">
                    <table className="w-full text-left border-collapse text-[12px]">
                      <thead className="bg-[#eef7f6] sticky top-0 text-[#111e1d] font-bold border-b border-gray-200 font-mono">
                        <tr>
                          <th className="py-2.5 px-3">Timestamp (IST)</th>
                          <th className="py-2.5 px-3">HR (bpm)</th>
                          <th className="py-2.5 px-3">BP (SBP/DBP)</th>
                          <th className="py-2.5 px-3">MAP</th>
                          <th className="py-2.5 px-3">RMSSD (ms)</th>
                          <th className="py-2.5 px-3">LF/HF</th>
                          <th className="py-2.5 px-3">SpO2</th>
                          <th className="py-2.5 px-3">Steps</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono">
                        {telemetryData.data_points.map((dp, i) => (
                          <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-2 px-3 text-[#445f73] font-medium">{dp.timestamp}</td>
                            <td className="py-2 px-3 font-bold text-[#00666f]">{dp.heart_rate}</td>
                            <td className="py-2 px-3 font-bold text-[#111e1d]">{dp.systolic_bp}/{dp.diastolic_bp}</td>
                            <td className="py-2 px-3 text-[#445f73]">{dp.mean_arterial_pressure}</td>
                            <td className="py-2 px-3 text-[#445f73]">{dp.hrv_rmssd.toFixed(1)}</td>
                            <td className="py-2 px-3 text-[#445f73]">{dp.hrv_lf_hf.toFixed(2)}</td>
                            <td className="py-2 px-3 text-[#196C57] font-bold">{dp.spo2}%</td>
                            <td className="py-2 px-3 text-[#445f73]">{dp.step_count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
