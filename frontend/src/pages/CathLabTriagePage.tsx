import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  HeartPulse,
  UserCheck,
  Building2,
  Check,
  Sparkles,
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { GlassSkeleton, GlassError } from '../components/GlassState';
import { getCathLabQueue } from '../api/client';
import type { CathLabQueueItem, CathLabRoomItem } from '../api/types';

export default function CathLabTriagePage() {
  const [acceptedRooms, setAcceptedRooms] = useState<Record<string, boolean>>({});
  const [checks, setChecks] = useState<Record<string, boolean>>({
    'prep-radial': true,
    'prep-consent': true,
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['cathLabQueue'],
    queryFn: getCathLabQueue,
    refetchInterval: 5000,
  });

  const toggleCheck = (id: string) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAcceptPatient = (patientId: string) => {
    setAcceptedRooms((prev) => ({ ...prev, [patientId]: true }));
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
        <GlassError message={(error as Error)?.message || 'Failed to connect to Cath Lab dispatch'} onRetry={() => refetch()} />
      </div>
    );
  }

  const queue: CathLabQueueItem[] = data?.queue || [];
  const rooms: CathLabRoomItem[] = data?.rooms || [];

  return (
    <div className="flex flex-col w-full max-w-[1560px] mx-auto gap-5 mt-2 pb-12">
      {/* Top Banner */}
      <GlassCard className="w-full p-6 border border-white/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-purple-700 to-indigo-800 text-white flex items-center justify-center shadow-md">
            <ShieldAlert className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full font-mono">
                Cath Lab Emergency Triage Queue
              </span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                Interventional Standby Active
              </span>
            </div>
            <h1 className="text-[22px] font-bold text-[#111e1d] mt-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Catheterization Suite &amp; Rapid Intervention Desk
            </h1>
            <p className="text-[12px] text-[#445f73] mt-0.5">
              Receives patients dispatched via <strong>"Escalate to Cath-Triage"</strong> with door-to-procedure tracking and suite readiness.
            </p>
          </div>
        </div>

        {/* Lead Attending Card */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-[11px] font-bold text-[#445f73] uppercase tracking-wider">Interventional Director</span>
            <span className="text-[14px] font-bold text-[#111e1d] flex items-center justify-end gap-1.5">
              <UserCheck className="w-4 h-4 text-purple-700" />
              Dr. A. Sharma (Chief Attending)
            </span>
            <span className="text-[11px] text-[#00666f] font-medium">Apex Heart &amp; Vascular Institute</span>
          </div>

          <Link
            to="/patients/CT-3092"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00666f] to-[#00818c] text-white font-bold text-[12px] shadow-sm hover:brightness-110 transition-all flex items-center gap-1.5"
          >
            <HeartPulse className="w-4 h-4" />
            <span>Active Digital Twin</span>
          </Link>
        </div>
      </GlassCard>

      {/* Cath Suites Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.map((room) => (
          <GlassCard key={room.room_id} className="p-5 border border-white/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-700" />
                  <span className="font-bold text-[15px] text-[#111e1d]">{room.room_id}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider font-mono px-2.5 py-0.5 rounded-full ${
                  room.status.includes('STANDBY')
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {room.status}
                </span>
              </div>
              <p className="text-[12px] font-medium text-[#111e1d]">{room.equipment}</p>
              <div className="mt-3 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] text-[#445f73]">
                <span>Cath Tech: <strong>{room.on_duty_tech}</strong></span>
                <span>Scrub Nurse: <strong>{room.scrub_nurse}</strong></span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Escalated Queue */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-700" />
            <h2 className="text-[18px] font-bold text-[#111e1d]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Active Escalated Triage Queue ({queue.length})
            </h2>
          </div>
          <span className="text-[11px] font-mono text-purple-900 bg-purple-100 px-3 py-1 rounded-xl font-bold">
            Target Door-to-Procedure: &lt; 90 min
          </span>
        </div>

        {queue.map((item) => {
          const isAccepted = !!acceptedRooms[item.patient_id];

          return (
            <GlassCard
              key={item.triage_id}
              className="p-6 border border-purple-200 bg-purple-50/40 shadow-sm flex flex-col gap-5 relative overflow-hidden"
            >
              {/* Triage Item Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-purple-200/60">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[12px] font-bold bg-purple-700 text-white px-2.5 py-1 rounded-lg">
                    {item.priority}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[18px] font-bold text-[#111e1d]">
                        {item.patient_name}
                      </h3>
                      <span className="text-[12px] font-mono text-[#445f73]">
                        ({item.patient_id} &bull; {item.age_gender})
                      </span>
                    </div>
                    <p className="text-[12px] text-purple-950 font-medium">
                      Active Protocol: <strong>{item.protocol}</strong> &bull; Dispatched by <strong>{item.escalated_by}</strong>
                    </p>
                  </div>
                </div>

                {/* Door to Procedure Elapsed Timer */}
                <div className="flex items-center gap-4 bg-white/90 p-3 rounded-2xl border border-purple-200 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-700 animate-spin" style={{ animationDuration: '6s' }} />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#445f73] tracking-wider block leading-none">
                        Elapsed Time
                      </span>
                      <span className="text-[18px] font-mono font-bold text-purple-900 leading-none">
                        {item.door_to_procedure_elapsed_mins} min
                      </span>
                    </div>
                  </div>
                  <div className="border-l border-gray-200 pl-3">
                    <span className="text-[10px] uppercase font-bold text-[#445f73] tracking-wider block leading-none">
                      Target Window
                    </span>
                    <span className="text-[13px] font-mono font-semibold text-emerald-700">
                      &lt; {item.target_max_mins} min
                    </span>
                  </div>
                </div>
              </div>

              {/* Vitals & Hemodynamics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/80 border border-gray-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#445f73]">Aortic SBP/DBP</span>
                  <p className="text-[20px] font-mono font-bold text-[#ba1a1a]">
                    {item.sbp}/{item.dbp} <span className="text-[11px] font-normal text-[#445f73]">mmHg</span>
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/80 border border-gray-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#445f73]">Mean Arterial (MAP)</span>
                  <p className="text-[20px] font-mono font-bold text-[#00666f]">
                    {item.map} <span className="text-[11px] font-normal text-[#445f73]">mmHg</span>
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/80 border border-gray-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#445f73]">Allocated Suite</span>
                  <p className="text-[16px] font-bold text-[#111e1d] flex items-center gap-1 mt-0.5">
                    <Building2 className="w-4 h-4 text-purple-700" />
                    {item.target_room}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/80 border border-gray-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#445f73]">Triage State</span>
                  <p className="text-[15px] font-bold font-mono text-purple-900 mt-0.5">
                    {isAccepted ? '✓ ADMITTED IN SUITE 1' : item.status}
                  </p>
                </div>
              </div>

              {/* Pre-Procedure Interventional Readiness Checklist */}
              <div className="p-4 rounded-2xl bg-white/80 border border-purple-200/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 block mb-2 font-mono">
                  Cath Lab Pre-Op Readiness Checklist
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[12px]">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dual Antiplatelet Loaded</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Serum Creatinine Cleared</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={checks['prep-radial']}
                      onChange={() => toggleCheck('prep-radial')}
                      className="rounded text-purple-700 focus:ring-purple-700 w-4 h-4"
                    />
                    <span className={checks['prep-radial'] ? 'font-medium text-[#111e1d]' : 'text-[#445f73]'}>
                      Right Radial Access Prepped
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={checks['prep-consent']}
                      onChange={() => toggleCheck('prep-consent')}
                      className="rounded text-purple-700 focus:ring-purple-700 w-4 h-4"
                    />
                    <span className={checks['prep-consent'] ? 'font-medium text-[#111e1d]' : 'text-[#445f73]'}>
                      Emergency Consent Verified
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-[12px] text-[#445f73]">
                  <AlertCircle className="w-4 h-4 text-purple-700" />
                  <span>Team Dispatched: Dr. Sharma, Tech Nambiar, Nurse Thomas</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Link
                    to={`/patients/${item.patient_id}`}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-[#111e1d] font-bold text-[12px] shadow-2xs transition-all"
                  >
                    View Digital Twin
                  </Link>

                  <button
                    onClick={() => handleAcceptPatient(item.patient_id)}
                    disabled={isAccepted}
                    className={`px-5 py-2 rounded-xl font-bold text-[12px] shadow-sm transition-all flex items-center gap-1.5 ${
                      isAccepted
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-purple-700 hover:bg-purple-800 text-white active:scale-98'
                    }`}
                    type="button"
                  >
                    {isAccepted ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    <span>{isAccepted ? 'Admitted to Suite 1' : 'Accept to Cath Lab Suite 1'}</span>
                  </button>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Recipient Flow Explanatory Card */}
      <GlassCard className="p-6 border border-white/80 shadow-xs">
        <h3 className="text-[16px] font-bold text-[#111e1d] mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Interventional Escalation Protocol (AHA / ACC CCU Triage Guideline)
        </h3>
        <p className="text-[12px] text-[#445f73] leading-relaxed">
          When the attending cardiologist escalates an alert from the CardioTwin digital twin, the patient record bypasses standard ED wait times and establishes direct real-time communication between the CCU telemetry desk and the Cath Lab suite. Pre-procedure checklists ensure contrast nephropathy checks and vascular access are verified prior to table transfer.
        </p>
      </GlassCard>
    </div>
  );
}
