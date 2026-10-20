import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HeartPulse,
  User,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor'>('patient');
  const patientId = 'CT-3092';

  const handlePatientLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    navigate(`/patient/${patientId}`);
  };

  const handleDoctorLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    navigate('/doctor/roster');
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between p-6 sm:p-10 select-none antialiased"
      style={{
        backgroundColor: '#edf2f8',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Top Navbar */}
      <header className="w-full max-w-[1280px] mx-auto flex items-center justify-between py-2">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-[#1d5bf0] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="font-bold text-[18px] text-slate-900 tracking-tight leading-tight block">
              Cardio<span className="text-[#1d5bf0]">Twin</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              In-Silico Physiological AI
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white shadow-2xs border border-slate-200/80 text-[11px] font-medium text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>CDSCO Class B Clinical System</span>
          </span>
          <Link
            to="/"
            className="text-[12px] font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-white/80 transition-all"
          >
            &larr; Back to Landing Page
          </Link>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="w-full max-w-[1040px] mx-auto my-auto py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-[#1d5bf0] text-[11px] font-bold font-mono border border-blue-100 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Secure Role-Based Clinical Access</span>
          </div>
          <h1 className="text-[32px] sm:text-[36px] font-extrabold text-slate-900 tracking-tight leading-tight">
            Select Your CardioTwin Portal
          </h1>
          <p className="text-[14px] text-slate-500 max-w-md mx-auto mt-2">
            Experience our streamlined, clutter-free environment designed specifically for either patient home monitoring or intensive CCU surveillance.
          </p>
        </div>

        {/* Dual Portal Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Card 1: Patient Portal */}
          <div
            onClick={() => setSelectedRole('patient')}
            className={`rounded-3xl p-7 transition-all cursor-pointer flex flex-col justify-between border ${
              selectedRole === 'patient'
                ? 'bg-white shadow-[0_16px_40px_rgba(29,91,240,0.10)] border-[#1d5bf0] ring-2 ring-[#1d5bf0]/20'
                : 'bg-white/80 hover:bg-white border-slate-200/80 shadow-sm hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1d5bf0] border border-blue-100">
                  <User className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-mono">
                  Personal Care
                </span>
              </div>

              <h2 className="text-[20px] font-bold text-slate-900 leading-snug">
                Patient Portal
              </h2>
              <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">
                Clean, serene dashboard to monitor your beating digital twin, view your 4 key vitals, log daily medications, and connect with your cardiologist.
              </p>

              <div className="mt-5 space-y-2 text-[12px] text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1d5bf0]" />
                  <span>Real-time beating 3D heart with telemetry</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1d5bf0]" />
                  <span>Continuous Apple Watch &amp; Omron sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1d5bf0]" />
                  <span>Direct 1-click consultation with Dr. Hella &amp; Dr. Will</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePatientLogin}
                className="w-full py-3 rounded-2xl bg-[#1d5bf0] hover:bg-blue-700 text-white font-bold text-[13px] shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                <span>Enter as Jacqueline Delaney (CT-3092)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Doctor / CCU Command Center */}
          <div
            onClick={() => setSelectedRole('doctor')}
            className={`rounded-3xl p-7 transition-all cursor-pointer flex flex-col justify-between border ${
              selectedRole === 'doctor'
                ? 'bg-white shadow-[0_16px_40px_rgba(29,91,240,0.10)] border-[#1d5bf0] ring-2 ring-[#1d5bf0]/20'
                : 'bg-white/80 hover:bg-white border-slate-200/80 shadow-sm hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-mono">
                  CCU Surveillance
                </span>
              </div>

              <h2 className="text-[20px] font-bold text-slate-900 leading-snug">
                Doctor &amp; CCU Portal
              </h2>
              <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">
                Full-featured clinical command center for attending physicians: in-silico Windkessel biophysics, crisis trajectory horizon, SBAR handover, and cath triage.
              </p>

              <div className="mt-5 space-y-2 text-[12px] text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  <span>Cohort Risk Stratification &amp; Lead Time Horizon</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  <span>3-Element Windkessel ODE biophysics solver</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  <span>SBAR notes, Titration calculator &amp; Cath Lab queue</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={handleDoctorLogin}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[13px] shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                <span>Enter as Dr. A. Sharma (CCU Lead)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="mt-8 text-center">
          <p className="text-[12px] text-slate-400">
            Instant evaluation mode: click either portal to load pre-seeded real-time physiological telemetry.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[1280px] mx-auto text-center text-[12px] text-slate-400 py-3 border-t border-slate-200/60">
        CardioTwin &bull; In-Silico Cardiovascular Digital Twin Architecture &bull; Compliant with CDSCO Medical Device Guidelines 2024
      </footer>
    </div>
  );
}
