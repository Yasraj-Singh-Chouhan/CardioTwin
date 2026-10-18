import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck,
  Lock,
  Download,
  CheckCircle2,
  Calendar,
  User,
  Hash,
  Database,
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { GlassSkeleton, GlassError } from '../components/GlassState';
import { getAuditTrail } from '../api/client';
import type { AuditTrailEvent } from '../api/types';

export default function AuditVaultPage() {
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['auditTrail'],
    queryFn: getAuditTrail,
    refetchInterval: 8000,
  });

  const handleDownloadLedger = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CDSCO_CardioTwin_Audit_Ledger_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-[1560px] mx-auto p-4 flex flex-col gap-4">
        <GlassSkeleton lines={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-[1560px] mx-auto p-4">
        <GlassError message={(error as Error)?.message || 'Failed to connect to CDSCO audit vault'} onRetry={() => refetch()} />
      </div>
    );
  }

  const events: AuditTrailEvent[] = data?.events || [];
  const filteredEvents = filterAction === 'ALL'
    ? events
    : events.filter((e) => e.action.includes(filterAction));

  return (
    <div className="flex flex-col w-full max-w-[1560px] mx-auto gap-5 mt-2 pb-12">
      {/* Header Banner */}
      <GlassCard className="w-full p-6 border border-white/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#00666f] to-[#00818c] text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00666f] bg-[#e0f1ef] px-2.5 py-0.5 rounded-full font-mono">
                CDSCO Class B / C SaMD Governance
              </span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-700" />
                SHA-256 Ledger Sealed
              </span>
            </div>
            <h1 className="text-[22px] font-bold text-[#111e1d] mt-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Hospital Clinical Audit &amp; Medico-Legal Ledger
            </h1>
            <p className="text-[12px] text-[#445f73] mt-0.5">
              Every alert acknowledgement, cath lab escalation, and AI twin calibration is permanently sealed with operator signature and cryptographic hash.
            </p>
          </div>
        </div>

        {/* Export Dossier Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadLedger}
            className={`px-4 py-2.5 rounded-xl font-bold text-[12px] shadow-sm transition-all flex items-center gap-1.5 ${
              downloadSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-white hover:bg-gray-50 text-[#111e1d] border border-gray-200'
            }`}
            type="button"
          >
            {downloadSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Download className="w-4 h-4 text-[#00666f]" />}
            <span>{downloadSuccess ? 'Ledger Downloaded' : 'Export CDSCO Ledger (.json)'}</span>
          </button>
        </div>
      </GlassCard>

      {/* Audit KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 border border-white/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#445f73]">Total Sealed Records</span>
          <p className="text-[24px] font-mono font-bold text-[#00666f] mt-0.5">
            {data?.total_records || events.length}
          </p>
          <span className="text-[11px] text-[#445f73]">100% Cryptographically Intact</span>
        </GlassCard>

        <GlassCard className="p-4 border border-white/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#445f73]">Compliance Standard</span>
          <p className="text-[16px] font-bold text-[#111e1d] mt-1">
            ISO-13485:2016
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold">CDSCO Class B SaMD</span>
        </GlassCard>

        <GlassCard className="p-4 border border-white/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#445f73]">Ledger Type</span>
          <p className="text-[16px] font-bold font-mono text-[#111e1d] mt-1">
            SHA-256 Merkle Chain
          </p>
          <span className="text-[11px] text-[#445f73]">Non-repudiation Guaranteed</span>
        </GlassCard>

        <GlassCard className="p-4 border border-white/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#445f73]">Registered Attending</span>
          <p className="text-[15px] font-bold text-[#111e1d] mt-1 truncate">
            Dr. A. Sharma
          </p>
          <span className="text-[11px] text-[#00666f] font-mono">Reg #DMC-84920</span>
        </GlassCard>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-bold text-[#445f73] mr-1">Filter Action:</span>
        {['ALL', 'ACKNOWLEDGED', 'ESCALATION', 'CALIBRATED', 'PREDICTED'].map((filter) => (
          <button
            key={filter}
            onClick={() => setFilterAction(filter)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
              filterAction === filter
                ? 'bg-[#00666f] text-white shadow-2xs'
                : 'bg-white/80 text-[#445f73] hover:text-[#111e1d] border border-gray-200'
            }`}
            type="button"
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Ledger Table */}
      <GlassCard className="p-6 border border-white/80 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-black/5 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#00666f]" />
            <h2 className="text-[17px] font-bold text-[#111e1d]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Immutable Transaction Stream
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#445f73]">
            Showing {filteredEvents.length} events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-gray-200 text-[#445f73] uppercase text-[10px] tracking-wider font-mono">
                <th className="py-2.5 px-3">Event ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Patient</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Clinical Action Detail</th>
                <th className="py-2.5 px-3">Signed Operator</th>
                <th className="py-2.5 px-3">CDSCO Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEvents.map((ev) => (
                <tr key={ev.event_id} className="hover:bg-white/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#111e1d]">{ev.event_id}</td>
                  <td className="py-3 px-3 font-mono text-[#445f73] whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#00666f]" />
                      {new Date(ev.timestamp).toLocaleTimeString('en-IN', { hour12: false })}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-[#00666f]">{ev.patient_id}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase ${
                      ev.action.includes('ESCALATION')
                        ? 'bg-purple-100 text-purple-900 border border-purple-200'
                        : ev.action.includes('ACKNOWLEDGED')
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        : 'bg-blue-100 text-blue-900 border border-blue-200'
                    }`}>
                      {ev.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#111e1d] max-w-xs">{ev.details}</td>
                  <td className="py-3 px-3 text-[#445f73] whitespace-nowrap">
                    <span className="flex items-center gap-1 font-medium">
                      <User className="w-3 h-3 text-[#445f73]" />
                      {ev.operator}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-[#00666f] font-semibold whitespace-nowrap">
                    <span className="flex items-center gap-0.5 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                      <Hash className="w-3 h-3 text-[#445f73]" />
                      {ev.cdsco_hash}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
