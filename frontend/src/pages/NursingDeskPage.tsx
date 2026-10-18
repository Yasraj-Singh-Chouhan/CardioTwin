import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Activity,
  Heart,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  Stethoscope,
  PhoneCall,
  ArrowUpRight,
  RefreshCw,
  ClipboardList,
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { GlassSkeleton, GlassError } from '../components/GlassState';
import { getNursingDeskStatus, acknowledgeAlert } from '../api/client';
import type { NursingBedItem } from '../api/types';

export default function NursingDeskPage() {
  const [localMuted, setLocalMuted] = useState(false);
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);
  const [nurseCheckedBeds, setNurseCheckedBeds] = useState<Record<string, boolean>>({
    'CCU-01': true,
    'CCU-02': true,
    'CCU-04': true,
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['nursingDeskStatus'],
    queryFn: getNursingDeskStatus,
    refetchInterval: 5000,
  });

  const handleNurseAcknowledge = async (patientId: string, alertId: string) => {
    setAcknowledgingId(patientId);
    try {
      await acknowledgeAlert(patientId, alertId);
      await refetch();
    } finally {
      setAcknowledgingId(null);
    }
  };

  const toggleNurseCheck = (bedId: string) => {
    setNurseCheckedBeds((prev) => ({ ...prev, [bedId]: !prev[bedId] }));
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
        <GlassError message={(error as Error)?.message || 'Failed to connect to CCU telemetry'} onRetry={() => refetch()} />
      </div>
    );
  }

  const beds: NursingBedItem[] = data?.beds || [];
  const criticalCount = beds.filter((b) => b.alarm_state === 'CRITICAL').length;

  return (
    <div className="flex flex-col w-full max-w-[1560px] mx-auto gap-5 mt-2 pb-12">
      {/* Top Station Master Banner */}
      <GlassCard className="w-full p-6 border border-white/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#00666f] to-[#00818c] text-white flex items-center justify-center shadow-md">
            <Activity className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00666f] bg-[#e0f1ef] px-2.5 py-0.5 rounded-full font-mono">
                Ward Central Telemetry • Unit 4B
              </span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                Live 1 Hz Continuous
              </span>
            </div>
            <h1 className="text-[22px] font-bold text-[#111e1d] mt-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              CCU Central Nursing Telemetry Station
            </h1>
            <p className="text-[12px] text-[#445f73] mt-0.5">
              Recipient desk for attending physician acknowledgements, bedside telemetry alarms, and crisis orders.
            </p>
          </div>
        </div>

        {/* Station Duty Badges */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-[11px] font-bold text-[#445f73] uppercase tracking-wider">Charge Nurse on Duty</span>
            <span className="text-[14px] font-bold text-[#111e1d] flex items-center justify-end gap-1.5">
              <UserCheck className="w-4 h-4 text-[#00666f]" />
              Sister Mary (Shift B)
            </span>
            <span className="text-[11px] text-[#00666f] font-medium">Attending: Dr. A. Sharma (Cath Lab)</span>
          </div>

          <button
            onClick={() => setLocalMuted(!localMuted)}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-[12px] font-bold shadow-2xs ${
              localMuted
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-white/80 text-[#445f73] hover:text-[#111e1d] border-gray-200'
            }`}
            title="Toggle Station Audio Buzzer"
            type="button"
          >
            {localMuted ? <VolumeX className="w-4 h-4 text-amber-700" /> : <Volume2 className="w-4 h-4 text-[#00666f]" />}
            <span>{localMuted ? 'Alarms Silenced' : 'Station Chime On'}</span>
          </button>

          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-white/80 hover:bg-white text-[#445f73] hover:text-[#111e1d] border border-gray-200 shadow-2xs transition-all"
            title="Refresh Telemetry"
            type="button"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </GlassCard>

      {/* Recipient Flow Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-[12px]">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <strong className="text-emerald-950 font-bold">Doctor Acknowledged Routing Active:</strong>{' '}
            <span className="text-[#3d494a]">
              When Dr. A. Sharma clicks "Acknowledge" on any patient twin, this Central Nursing Desk console receives the verified electronic order, mutes bedside emergency sirens, and updates the telemetry badge.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-xl bg-white/80 border border-emerald-200 text-emerald-800">
            {criticalCount === 0 ? '0 Active Unacknowledged Crises' : `${criticalCount} Critical Siren Triggered`}
          </span>
        </div>
      </div>

      {/* Bedside Monitors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {beds.map((bed) => {
          const isAck = bed.acknowledged || bed.alarm_state === 'ACKNOWLEDGED';
          const isCritical = bed.alarm_state === 'CRITICAL';
          const isWatch = bed.alarm_state === 'WATCH';
          const isTargetPatient = bed.patient_id === 'CT-3092';

          return (
            <GlassCard
              key={bed.bed_id}
              className={`p-5 flex flex-col justify-between transition-all relative overflow-hidden border ${
                isTargetPatient
                  ? 'ring-2 ring-[#00666f]/40 shadow-md'
                  : 'border-white/80'
              } ${
                isCritical
                  ? 'bg-red-50/70 border-red-300 animate-pulse'
                  : isAck
                  ? 'bg-white/85 border-emerald-200'
                  : 'bg-white/80'
              }`}
            >
              {/* Card Header: Bed ID + Status */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] font-bold text-[#111e1d] bg-gray-100 px-2 py-0.5 rounded-lg border border-gray-200">
                      {bed.bed_id}
                    </span>
                    {isTargetPatient && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#00666f] bg-[#e0f1ef] px-2 py-0.5 rounded-full font-mono">
                        Active Twin
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded-full ${
                      isCritical
                        ? 'bg-red-600 text-white animate-bounce'
                        : isAck
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : isWatch
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-gray-100 text-[#445f73]'
                    }`}
                  >
                    {isCritical ? '⚠️ UNACKNOWLEDGED' : isAck ? '✓ ACKNOWLEDGED' : bed.alarm_state}
                  </span>
                </div>

                {/* Patient Name & Diagnosis */}
                <h3 className="text-[15px] font-bold text-[#111e1d] leading-snug">
                  {bed.patient_name}
                </h3>
                <p className="text-[11px] text-[#445f73] mt-0.5 font-mono">
                  {bed.patient_id} &bull; {bed.age_gender} &bull; {bed.admit_diagnosis}
                </p>

                {/* Vitals HUD */}
                <div className="my-3 p-3 rounded-2xl bg-white/90 border border-gray-100 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#445f73]">NIBP (mmHg)</span>
                    <p className={`text-[18px] font-bold font-mono ${
                      bed.sbp >= 160 ? 'text-[#ba1a1a]' : bed.sbp >= 140 ? 'text-amber-800' : 'text-[#00666f]'
                    }`}>
                      {bed.sbp}/{bed.dbp}
                    </p>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#445f73]">Pulse</span>
                    <p className="text-[17px] font-bold font-mono text-[#111e1d] flex items-center justify-center gap-0.5">
                      <Heart className="w-3.5 h-3.5 text-red-600 fill-red-600 animate-pulse" />
                      {bed.hr}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#445f73]">SpO2</span>
                    <p className="text-[17px] font-bold font-mono text-[#00666f]">
                      {bed.spo2}%
                    </p>
                  </div>
                </div>

                {/* Attending Physician Status Box */}
                {isAck && (
                  <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200 mb-2.5 text-[11px] text-emerald-950 flex flex-col gap-0.5">
                    <span className="font-bold flex items-center gap-1 text-emerald-900">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Reviewed by {bed.acknowledged_by || 'Dr. A. Sharma'}
                    </span>
                    <span className="text-[10px] text-[#445f73]">Bedside audio siren silenced. Order in progress.</span>
                  </div>
                )}

                {isCritical && (
                  <div className="p-2 rounded-xl bg-red-100/80 border border-red-300 mb-2.5 text-[11px] text-red-950 flex flex-col gap-1">
                    <span className="font-bold flex items-center gap-1 text-red-900">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      Urgent BP Surge (&ge;165 mmHg)
                    </span>
                    <button
                      onClick={() => handleNurseAcknowledge(bed.patient_id, `ALT-${bed.patient_id}-FEED`)}
                      disabled={acknowledgingId === bed.patient_id}
                      className="w-full py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] shadow-xs transition-colors"
                      type="button"
                    >
                      {acknowledgingId === bed.patient_id ? 'Acknowledging...' : 'Acknowledge from Nursing Desk'}
                    </button>
                  </div>
                )}

                {/* Nurse Checklist */}
                <div className="space-y-1.5 text-[11px] text-[#3d494a] mb-2 pt-2 border-t border-black/5">
                  <div className="flex items-center justify-between text-[10px] text-[#445f73]">
                    <span className="font-semibold uppercase tracking-wider">Bedside Line:</span>
                    <span className="font-mono text-[#111e1d] truncate max-w-[140px]">{bed.iv_infusion}</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!nurseCheckedBeds[bed.bed_id]}
                      onChange={() => toggleNurseCheck(bed.bed_id)}
                      className="rounded text-[#00666f] focus:ring-[#00666f] w-3.5 h-3.5"
                    />
                    <span className={nurseCheckedBeds[bed.bed_id] ? 'line-through text-[#445f73]' : 'font-medium'}>
                      Nurse 30-min vitals check confirmed
                    </span>
                  </label>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="pt-2 border-t border-black/5 flex items-center justify-between">
                <span className="text-[10px] text-[#445f73] flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {bed.last_nurse_check}
                </span>

                <Link
                  to={`/patients/${bed.patient_id}`}
                  className="text-[11px] font-bold text-[#00666f] hover:underline flex items-center gap-0.5"
                >
                  <span>Open Twin</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Nursing Station Handover Log */}
      <GlassCard className="p-6 border border-white/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <ClipboardList className="w-5 h-5 text-[#00666f]" />
            <h2 className="text-[17px] font-bold text-[#111e1d]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              CCU Nursing Station Live Shift Activity Ledger
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#00666f] bg-[#e0f1ef] px-2.5 py-0.5 rounded-full font-bold">
            Real-time Broadcast Bus
          </span>
        </div>

        <div className="space-y-2.5 text-[12px]">
          <div className="p-3 rounded-xl bg-white/70 border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                <strong>Dr. A. Sharma (Chief Attending)</strong> electronically acknowledged acute alert for <strong>Bed 04 (Vikram Malhotra - CT-3092)</strong>. Bedside tone silenced.
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#445f73]">Just now</span>
          </div>

          <div className="p-3 rounded-xl bg-white/70 border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-[#00666f]" />
              <span>
                <strong>Sister Mary</strong> verified IV Nicardipine standby infusion and continuous Lead II tonometry on Bed 04.
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#445f73]">14 min ago</span>
          </div>

          <div className="p-3 rounded-xl bg-white/70 border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-purple-600" />
              <span>
                Cath Lab Emergency Triage notified for Bed 04 stand-by protocol: <em>Stat CCU Triage &amp; Continuous Tonometry</em>.
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#445f73]">26 min ago</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
