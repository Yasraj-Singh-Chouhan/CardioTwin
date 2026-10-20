import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPatientDetail, getExplanation, getPatientEnvironment } from '../api/client';
import GlassCard from '../components/GlassCard';
import { GlassSkeleton, GlassError } from '../components/GlassState';
import { ShapBarsChart } from '../components/charts/ShapBarsChart';
import { EnvironmentTimelineChart } from '../components/charts/EnvironmentTimelineChart';

export default function ExplanationPage() {
  const { id } = useParams<{ id: string }>();
  const patientId = id || 'CT-3092';

  const patientQuery = useQuery({
    queryKey: ['patientDetail', patientId],
    queryFn: () => getPatientDetail(patientId),
  });

  const explanationQuery = useQuery({
    queryKey: ['explanation', patientId],
    queryFn: () => getExplanation(patientId),
  });

  const envQuery = useQuery({
    queryKey: ['environment', patientId],
    queryFn: () => getPatientEnvironment(patientId),
  });

  const isLoading = patientQuery.isLoading || explanationQuery.isLoading || envQuery.isLoading;
  const isError = patientQuery.isError || explanationQuery.isError || envQuery.isError;
  const error = patientQuery.error || explanationQuery.error || envQuery.error;

  const patient = patientQuery.data;
  const exp = explanationQuery.data;
  const env = envQuery.data;

  return (
    <div className="flex flex-col w-full max-w-[1560px] mx-auto gap-5 mt-4 pb-10">
      {isLoading && <GlassSkeleton lines={6} />}
      {isError && (
        <GlassError
          message={(error as Error)?.message}
          onRetry={() => {
            patientQuery.refetch();
            explanationQuery.refetch();
            envQuery.refetch();
          }}
        />
      )}

      {patient && exp && env && (
        <>
          {/* Top context breadcrumb */}
          <GlassCard className="w-full flex flex-wrap items-center justify-between gap-4 px-6 py-4 border border-white/80">
            <div className="flex items-center gap-3">
              <Link
                to={`/doctor/patients/${patient.patient_id}`}
                className="w-9 h-9 rounded-xl bg-white/80 hover:bg-white text-[#445f73] flex items-center justify-center transition-all shadow-xs border border-white"
                title="Return to Digital Twin"
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
                <span className="text-[#00666f] font-bold">Game-Theoretic SHAP &amp; Causality</span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] bg-[#2FBF9B]/15 text-[#196C57] font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-[#196C57] animate-pulse" />
              {exp.windkessel_biofit_label}
            </span>
          </GlassCard>

          {/* Synthesis Banner */}
          <div
            className="p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 glass-card border border-white/80"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#00666f] to-[#00818c] text-white flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-[26px]">psychology</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#ba1a1a] bg-red-100 px-2 py-0.5 rounded font-mono">
                    {exp.primary_alert_level}
                  </span>
                  <span className="text-[#bcc9cb]">&bull;</span>
                  <span className="text-[12px] text-[#445f73] font-semibold">{exp.pathway_nature}</span>
                </div>
                <h1 className="text-[22px] font-bold text-[#111e1d] mt-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                  Biophysical Attribution &amp; Mechanistic Cascade
                </h1>
                <p className="text-[13px] text-[#445f73] mt-1 max-w-4xl leading-relaxed">
                  {exp.biophysical_synthesis}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0 self-start md:self-center bg-white/70 p-3 rounded-2xl border border-gray-100">
              <span className="text-[30px] font-bold text-[#00666f] font-mono leading-none">{exp.simulation_confidence_percent}%</span>
              <span className="text-[11px] text-[#445f73] font-bold uppercase tracking-wider mt-1">In Silico Fidelity</span>
            </div>
          </div>

          {/* Mechanistic Cascade Nodes (4 Columns) */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[18px] font-bold text-[#111e1d]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Mechanistic Causality Cascade (Biophysical Progression)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {exp.cascade_nodes.map(node => (
                <div
                  key={node.node_index}
                  className="p-5 rounded-2xl flex flex-col justify-between glass-card border border-white/80"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-[#00666f] font-mono bg-[#e0f1ef] px-2 py-0.5 rounded">
                        {node.node_tag}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-[#e2f1ef] flex items-center justify-center text-[#00666f] shadow-2xs">
                        <span className="material-symbols-outlined text-[18px]">{node.icon_name}</span>
                      </div>
                    </div>

                    <h3 className="text-[16px] font-bold text-[#111e1d]">{node.title}</h3>
                    <p className="text-[12px] text-[#445f73] mt-1 leading-snug">{node.subtitle}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[12px]">
                    <span className="text-[#445f73] font-medium">{node.metric_label}</span>
                    <span className="font-mono font-bold text-[#ba1a1a] bg-red-50 px-2 py-0.5 rounded">
                      {node.metric_value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2-Column: Real Recharts SHAP Feature Importance & Environmental Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left: Recharts SHAP attribution (7 cols) */}
            <div className="lg:col-span-7 flex flex-col">
              <GlassCard className="p-6 flex flex-col border border-white/80">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#00666f] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px]">scatter_plot</span>
                      Game-Theoretic Attribution
                    </span>
                    <h3 className="text-[18px] font-bold text-[#111e1d]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                      SHAP Factor Decomposition
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-[#445f73] font-semibold bg-gray-100 px-2.5 py-0.5 rounded-full">
                    Marginal Odds Ratio
                  </span>
                </div>

                <p className="text-[12px] text-[#445f73] mb-3">
                  Positive values indicate factors accelerating simulated progression towards crisis threshold (&ge;180 mmHg).
                </p>

                {/* Real Recharts Horizontal Bar Chart */}
                <div className="w-full bg-white/85 rounded-2xl p-3 border border-gray-100 shadow-2xs">
                  <ShapBarsChart contributions={exp.shap_contributions} />
                </div>
              </GlassCard>
            </div>

            {/* Right: Recharts Environmental Stressors Timeline (5 cols) */}
            <div className="lg:col-span-5 flex flex-col">
              <GlassCard className="p-6 flex flex-col gap-4 border border-white/80">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#00666f] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px]">air</span>
                    Ambient Microclimate Coupling
                  </span>
                  <h3 className="text-[18px] font-bold text-[#111e1d]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                    Environmental Stressors Timeline
                  </h3>
                  <p className="text-[12px] text-[#445f73] mt-1 leading-relaxed">
                    {env.biophysical_impact_summary}
                  </p>
                </div>

                {/* Real Recharts Dual-Axis Timeline */}
                <div className="w-full bg-white/85 rounded-2xl p-2.5 border border-gray-100 shadow-2xs">
                  <EnvironmentTimelineChart
                    current={env.current_environment}
                    forecast={env.recent_forecast}
                  />
                </div>

                {/* Microclimate telemetry quick pills */}
                <div className="grid grid-cols-2 gap-3 text-[12px]">
                  <div className="p-3 rounded-2xl bg-white/70 border border-gray-100 flex flex-col">
                    <span className="text-[#445f73] text-[11px] font-medium">Station Grounding</span>
                    <span className="text-[13px] font-bold text-[#111e1d] mt-1 truncate">
                      {env.current_environment.station_name}
                    </span>
                    <span className="text-[11px] text-[#00666f] font-bold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00666f]" />
                      Telemetry Synced
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/70 border border-gray-100 flex flex-col">
                    <span className="text-[#445f73] text-[11px] font-medium">Atmospheric Stress</span>
                    <span className="text-[13px] font-bold text-[#ba1a1a] mt-1">
                      {env.current_environment.aqi_category} ({env.current_environment.aqi})
                    </span>
                    <span className="text-[11px] text-[#445f73] mt-0.5">Vasoconstrictive trigger</span>
                  </div>
                </div>

                {env.current_environment.festival_flag && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-[12px] text-amber-900">
                    <span className="material-symbols-outlined text-[18px] text-amber-600">festival</span>
                    <span><strong>Active Seasonal Window:</strong> {env.current_environment.festival_flag}</span>
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
