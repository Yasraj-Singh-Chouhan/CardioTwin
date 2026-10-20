import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPatients } from '../api/client';
import type { RiskTier } from '../api/types';
import RiskBadge from '../components/RiskBadge';
import { GlassSkeleton, GlassError } from '../components/GlassState';

const TIER_OPTIONS = [
  { value: 'all', label: 'All Cohort' },
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'ELEVATED', label: 'Elevated' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'LOW', label: 'Low' },
];

export default function RosterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'risk' | 'lead' | 'name'>('risk');
  const [search, setSearch] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null && q !== search) {
      setSearch(q);
    }
  }, [searchParams]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['patients', selectedTier, search],
    queryFn: () =>
      getPatients({
        tier: selectedTier === 'all' ? undefined : (selectedTier as RiskTier),
        search: search || undefined,
      }),
  });

  // Unique cities from data
  const availableCities = useMemo(() => {
    if (!data?.items) return [];
    const set = new Set<string>();
    data.items.forEach(p => {
      if (p.city) set.add(p.city);
    });
    return Array.from(set);
  }, [data]);

  // Filtered & Sorted items
  const processedItems = useMemo(() => {
    if (!data?.items) return [];
    let list = [...data.items];

    if (selectedCity !== 'all') {
      list = list.filter(p => p.city === selectedCity);
    }

    if (sortBy === 'risk') {
      list.sort((a, b) => (b.crisis_prob_6h ?? 0) - (a.crisis_prob_6h ?? 0));
    } else if (sortBy === 'lead') {
      list.sort((a, b) => {
        const hA = parseFloat(a.days_to_risk) || 999;
        const hB = parseFloat(b.days_to_risk) || 999;
        return hA - hB;
      });
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [data, selectedCity, sortBy]);

  return (
    <div className="flex flex-col w-full max-w-[1560px] mx-auto gap-6 mt-4 pb-10">
      {/* Title & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="text-[11px] font-bold tracking-widest uppercase text-[#1d5bf0] flex items-center gap-1.5"
              style={{ fontFamily: 'Inter', letterSpacing: '0.06em' }}
            >
              <span className="w-2 h-2 rounded-full bg-[#1d5bf0] animate-pulse" />
              Surveillance Command Desk
            </span>
            <span className="w-1 h-1 rounded-full bg-[#3d494a]/30" />
            <span className="text-[12px] text-[#445f73] font-medium" style={{ fontFamily: 'Inter' }}>
              CCU / Inflow Triage &amp; Risk Stratification
            </span>
          </div>
          <h1
            className="text-[32px] font-bold leading-none tracking-tight text-[#111e1d]"
            style={{ fontFamily: 'Plus Jakarta Sans', letterSpacing: '-0.025em' }}
          >
            Hypertensive Crisis Cohort Roster
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#1d5bf0] pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Search cohort by name/ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl text-[13px] bg-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d5bf0]/20 transition-all shadow-xs border border-white/80"
              style={{ fontFamily: 'Inter', width: '240px' }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-[#3d494a]/60 hover:text-[#111e1d]"
              >
                <span className="material-symbols-outlined text-[16px] block">close</span>
              </button>
            )}
          </div>

          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all shadow-xs bg-white/80 hover:bg-white text-[#111e1d] border border-white hover:border-[#1d5bf0]/20 active:scale-95"
            style={{ fontFamily: 'Inter' }}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-[#1d5bf0]">sync</span>
            <span>Refresh Roster</span>
          </button>
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && <GlassSkeleton lines={6} />}
      {isError && <GlassError message={(error as Error)?.message} onRetry={() => refetch()} />}

      {data && (
        <>
          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Monitored Cohort Card */}
            <div
              className="glass-card p-5 rounded-2xl flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[#3d494a]">
                <span className="text-[12px] font-semibold tracking-wide uppercase text-[#445f73]">Monitored Cohort</span>
                <div className="w-8 h-8 rounded-lg bg-[#e5efff] flex items-center justify-center text-[#1d5bf0]">
                  <span className="material-symbols-outlined text-[20px]">monitoring</span>
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-[34px] font-bold text-[#111e1d] font-mono tracking-tight">
                  {data.total_monitored}
                </span>
                <span className="text-[11px] text-[#196C57] font-semibold bg-[#2FBF9B]/15 px-2.5 py-0.5 rounded-full font-mono">
                  +{data.active_inflow_count} INFLOW
                </span>
              </div>
              <span className="text-[11px] text-[#445f73] mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#196C57]" />
                Live Wearable PPG streaming 1 Hz
              </span>
            </div>

            {/* Critical Triage Card */}
            <div
              className="glass-card p-5 rounded-2xl flex flex-col justify-between border-l-4 border-l-[#ba1a1a]"
            >
              <div className="flex items-center justify-between text-[#ba1a1a]">
                <span className="text-[12px] font-semibold tracking-wide uppercase">Critical Triage</span>
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-[#ba1a1a]">
                  <span className="material-symbols-outlined text-[20px] animate-pulse">crisis_alert</span>
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-[34px] font-bold text-[#ba1a1a] font-mono tracking-tight">
                  {data.critical_alerts_count}
                </span>
                <span className="text-[11px] text-[#ba1a1a] font-semibold bg-[#ba1a1a]/15 px-2.5 py-0.5 rounded-full font-mono">
                  IMMEDIATE ACTION
                </span>
              </div>
              <span className="text-[11px] text-[#ba1a1a] font-medium mt-1">
                SBP forecast trajectory &gt;180 mmHg
              </span>
            </div>

            {/* High Horizon Card */}
            <div
              className="glass-card p-5 rounded-2xl flex flex-col justify-between border-l-4 border-l-[#b25e00]"
            >
              <div className="flex items-center justify-between text-[#b25e00]">
                <span className="text-[12px] font-semibold tracking-wide uppercase">High Risk Horizon</span>
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-[#b25e00]">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-[34px] font-bold text-[#b25e00] font-mono tracking-tight">
                  {data.high_alerts_count}
                </span>
                <span className="text-[11px] text-[#b25e00] font-semibold bg-[#F5B83D]/15 px-2.5 py-0.5 rounded-full font-mono">
                  &lt; 12H FORECAST
                </span>
              </div>
              <span className="text-[11px] text-[#445f73] mt-1">
                Escalating peripheral resistance ($R_p$)
              </span>
            </div>

            {/* Early Warning Lead Time Card */}
            <div
              className="glass-card p-5 rounded-2xl flex flex-col justify-between border-l-4 border-l-[#1d5bf0]"
            >
              <div className="flex items-center justify-between text-[#1d5bf0]">
                <span className="text-[12px] font-semibold tracking-wide uppercase">Average Lead Time</span>
                <div className="w-8 h-8 rounded-lg bg-[#e5efff] flex items-center justify-center text-[#1d5bf0]">
                  <span className="material-symbols-outlined text-[20px]">timelapse</span>
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-[34px] font-bold text-[#1d5bf0] font-mono tracking-tight">
                  {data.avg_warning_window_hours}h
                </span>
                <span className="text-[11px] text-[#196C57] font-semibold bg-[#2FBF9B]/15 px-2.5 py-0.5 rounded-full font-mono">
                  PRE-CRISIS WINDOW
                </span>
              </div>
              <span className="text-[11px] text-[#445f73] mt-1">
                Actionable window before acute ED crisis
              </span>
            </div>
          </div>

          {/* Filter Bar with Tiers & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-2 rounded-2xl bg-white/50 border border-white/70">
            {/* Tiers Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {TIER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedTier(opt.value)}
                  className={`px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all ${
                    selectedTier === opt.value
                      ? 'bg-[#1d5bf0] text-white shadow-xs'
                      : 'bg-white/70 text-[#3d494a] hover:bg-white hover:text-[#111e1d]'
                  }`}
                  style={{ fontFamily: 'Inter' }}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* City & Sort Selectors */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              {availableCities.length > 0 && (
                <select
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-[12px] bg-white/80 border border-gray-200 text-[#111e1d] font-medium focus:outline-none"
                >
                  <option value="all">All Cities</option>
                  {availableCities.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'risk' | 'lead' | 'name')}
                className="px-3 py-1.5 rounded-xl text-[12px] bg-white/80 border border-gray-200 text-[#111e1d] font-medium focus:outline-none"
              >
                <option value="risk">Sort: 6h Crisis Risk</option>
                <option value="lead">Sort: Critical Lead Time</option>
                <option value="name">Sort: Patient Name</option>
              </select>
            </div>
          </div>

          {/* Patient Roster Table */}
          <div
            className="rounded-2xl overflow-hidden glass border border-white/80"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[#445f73] text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200/60">
                    <th className="py-3.5 px-6">Patient Subject</th>
                    <th className="py-3.5 px-4">Triage Tier</th>
                    <th className="py-3.5 px-4 text-center">6h Crisis Risk</th>
                    <th className="py-3.5 px-4 text-center">12h Crisis Risk</th>
                    <th className="py-3.5 px-4">Early Warning Window</th>
                    <th className="py-3.5 px-4">Telemetry Inflow</th>
                    <th className="py-3.5 px-6 text-right">Clinical Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px]">
                  {processedItems.length > 0 ? (
                    processedItems.map(patient => {
                      const isCritical = patient.risk_tier === 'CRITICAL';
                      const p6 = patient.crisis_prob_6h ?? 0;
                      const p12 = patient.crisis_prob_12h ?? 0;

                      return (
                        <tr
                          key={patient.patient_id}
                          onClick={() => navigate(`/doctor/patients/${patient.patient_id}`)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[14px] shrink-0 font-mono transition-transform group-hover:scale-105 ${
                                  isCritical
                                    ? 'bg-red-100 text-[#ba1a1a] border border-red-200'
                                    : 'bg-[#e5efff] text-[#1d5bf0] border border-[#1d5bf0]/15'
                                }`}
                              >
                                {patient.initials}
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-[#111e1d] group-hover:text-[#1d5bf0] transition-colors">
                                    {patient.name}
                                  </span>
                                  {isCritical && (
                                    <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-ping" />
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-[#445f73]">
                                  <span className="font-mono font-semibold text-[#1d5bf0]">{patient.patient_id}</span>
                                  <span>•</span>
                                  <span>{patient.age}y {patient.sex}</span>
                                  <span>•</span>
                                  <span className="font-medium text-[#111e1d]">{patient.city}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <RiskBadge tier={patient.risk_tier} />
                          </td>

                          {/* 6h Probability with Visual Mini Bar */}
                          <td className="py-4 px-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`font-mono font-bold text-[14px] ${
                                p6 >= 75 ? 'text-[#ba1a1a]' : p6 >= 50 ? 'text-[#b25e00]' : 'text-[#196C57]'
                              }`}>
                                {p6}%
                              </span>
                              <div className="w-16 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    p6 >= 75 ? 'bg-[#ba1a1a]' : p6 >= 50 ? 'bg-[#b25e00]' : 'bg-[#196C57]'
                                  }`}
                                  style={{ width: `${p6}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* 12h Probability with Visual Mini Bar */}
                          <td className="py-4 px-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`font-mono font-bold text-[14px] ${
                                p12 >= 75 ? 'text-[#ba1a1a]' : p12 >= 50 ? 'text-[#b25e00]' : 'text-[#196C57]'
                              }`}>
                                {p12}%
                              </span>
                              <div className="w-16 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    p12 >= 75 ? 'bg-[#ba1a1a]' : p12 >= 50 ? 'bg-[#b25e00]' : 'bg-[#196C57]'
                                  }`}
                                  style={{ width: `${p12}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Lead Time */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5 text-[#111e1d] font-mono text-[12px] bg-white/70 px-2.5 py-1 rounded-lg w-fit border border-gray-100">
                              <span className="material-symbols-outlined text-[15px] text-[#1d5bf0]">timelapse</span>
                              <span className="font-bold">{patient.days_to_risk}</span>
                            </div>
                          </td>

                          {/* Telemetry pipeline */}
                          <td className="py-4 px-4">
                            <div className="flex flex-col">
                              <span className="text-[#111e1d] text-[12px] font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#196C57]" />
                                {patient.telemetry_mode}
                              </span>
                              <span className="text-[11px] text-[#445f73] font-mono">{patient.telemetry_sync}</span>
                            </div>
                          </td>

                          {/* Action shortcuts */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Jump to Scenarios */}
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  navigate(`/doctor/patients/${patient.patient_id}/scenarios`);
                                }}
                                title="Simulate Countermeasures"
                                className="p-1.5 rounded-lg bg-white hover:bg-blue-50 text-[#1d5bf0] border border-gray-200 transition-colors shadow-2xs"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[17px] block">schema</span>
                              </button>

                              {/* Jump to Signals */}
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  navigate(`/doctor/patients/${patient.patient_id}/signals`);
                                }}
                                title="View Live Signals & Recalibrate"
                                className="p-1.5 rounded-lg bg-white hover:bg-blue-50 text-[#1d5bf0] border border-gray-200 transition-colors shadow-2xs"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[17px] block">vital_signs</span>
                              </button>

                              {/* Inspect Twin Primary Button */}
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  navigate(`/doctor/patients/${patient.patient_id}`);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-[#1d5bf0] hover:bg-[#1546b8] text-white font-semibold text-[12px] transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-1"
                                type="button"
                              >
                                <span>Inspect Twin</span>
                                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#445f73]">
                        <span className="material-symbols-outlined text-[36px] text-[#3d494a]/40 mb-2 block">
                          search_off
                        </span>
                        <p className="text-[15px] font-bold text-[#111e1d]">No cohort subjects found</p>
                        <p className="text-[12px] text-[#445f73] mt-1">
                          No matching patients found with the current filter and search criteria.
                        </p>
                        <button
                          onClick={() => {
                            setSelectedTier('all');
                            setSelectedCity('all');
                            setSearch('');
                          }}
                          className="mt-3 px-4 py-1.5 rounded-xl bg-[#1d5bf0] text-white text-[12px] font-semibold"
                          type="button"
                        >
                          Reset Filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
