import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Activity,
  ShieldAlert,
  ArrowRight,
  FileText,
  Layers,
  ChevronRight,
} from 'lucide-react';

export default function DoctorLandingPage() {
  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between selection:bg-[#1d5bf0] selection:text-white antialiased text-slate-800"
      style={{
        backgroundColor: '#edf2f8',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Clinician Top Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-10 py-3.5 transition-all">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <Link to="/doctor" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[18px] text-slate-900 tracking-tight leading-tight block">
                  Cardio<span className="text-indigo-600">Twin</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold border border-indigo-200">
                  DOCTOR CCU PORTAL
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Inpatient Hemodynamic Surveillance System
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-semibold text-slate-600">
            <Link to="/doctor/roster" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <span>Cohort Roster</span>
            </Link>
            <Link to="/doctor/patients/CT-0042" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <span>Digital Twin Engine</span>
            </Link>
            <Link to="/doctor/nursing-desk" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <span>Nursing Desk</span>
            </Link>
            <Link to="/doctor/cath-lab-triage" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <span>Cath Lab Triage</span>
            </Link>
            <Link to="/doctor/audit-vault" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <span>CDSCO Audit</span>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/doctor/roster"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[12px] shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <span>Access CCU Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 sm:px-10 pt-12 pb-16 max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headlines & Clinical Value */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-[11px] font-bold tracking-wide mb-4">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span>Attending Physician &amp; Intensivist Decision Support Platform</span>
            </div>

            <h1 className="text-[36px] sm:text-[46px] lg:text-[52px] font-extrabold text-slate-900 leading-[1.12] tracking-tight">
              In-Silico Hemodynamics &amp; Early Warning for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700">
                Hypertensive Crisis
              </span>
            </h1>

            <p className="text-[15px] sm:text-[17px] text-slate-600 mt-5 leading-relaxed max-w-2xl font-normal">
              Continuous radial tonometry fused with a calibrated 3-element Windkessel biophysical ODE solver. Predicts malignant SBP surges (&ge;180 mmHg) up to 12 hours before clinical onset in South Asian inpatient cohorts.
            </p>

            {/* Clinician Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                to="/doctor/roster"
                className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[14px] shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all active:scale-98"
              >
                <span>Launch CCU Surveillance Roster</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/doctor/patients/CT-0042"
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-[14px] border border-slate-200/90 shadow-xs flex items-center gap-2 transition-all hover:border-slate-300"
              >
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>Inspect Active In-Silico Twin</span>
              </Link>
            </div>

            {/* Key Clinical Telemetry Badges */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-8 border-t border-slate-200/80">
              <div className="bg-white/80 rounded-2xl p-3 border border-slate-200/60 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 block">Monitored Cohort</span>
                <span className="text-[20px] font-bold text-slate-900 font-mono mt-0.5 block">1,000 Pts</span>
                <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">5 Risk Tiers Active</span>
              </div>

              <div className="bg-white/80 rounded-2xl p-3 border border-slate-200/60 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 block">Early Lead Time</span>
                <span className="text-[20px] font-bold text-slate-900 font-mono mt-0.5 block">4.8h Avg</span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Pre-threshold Alert</span>
              </div>

              <div className="bg-white/80 rounded-2xl p-3 border border-slate-200/60 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 block">Windkessel ODE</span>
                <span className="text-[20px] font-bold text-slate-900 font-mono mt-0.5 block">94.2%</span>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Bio-Fit Tolerance</span>
              </div>

              <div className="bg-white/80 rounded-2xl p-3 border border-slate-200/60 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 block">Regulatory</span>
                <span className="text-[20px] font-bold text-slate-900 font-mono mt-0.5 block">Class B</span>
                <span className="text-[10px] text-purple-600 font-semibold block mt-0.5">CDSCO SaMD Certified</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live CCU Triage Preview Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200/80 flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-bold text-[14px] text-slate-900">STAT CCU Priority Stream</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  CRITICAL SURGE
                </span>
              </div>

              {/* Patient Card Preview */}
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-500 text-white font-bold flex items-center justify-center font-mono text-[13px]">
                      RM
                    </div>
                    <div>
                      <h3 className="font-bold text-[14px] text-slate-900 leading-tight">Ritu Mishra</h3>
                      <p className="text-[11px] text-slate-500">CT-0042 &bull; 59y F &bull; Delhi NCR</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[15px] text-rose-600 block">182/108</span>
                    <span className="text-[10px] text-rose-500 font-semibold block">Aortic BP Peak</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-rose-200/50 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">6h Risk</span>
                    <span className="font-bold text-rose-700 font-mono">96.0%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Warning Horizon</span>
                    <span className="font-bold text-slate-800 font-mono">0.2 d (4.8h)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Per. Resistance</span>
                    <span className="font-bold text-rose-700 font-mono">1.62 R_p (+42%)</span>
                  </div>
                </div>

                <div className="mt-1 flex items-center justify-between pt-2 border-t border-rose-200/50">
                  <span className="text-[11px] text-rose-800 font-medium">Protocol: Stat IV Labetalol Titration</span>
                  <Link
                    to="/doctor/patients/CT-0042"
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>Inspect &rarr;</span>
                  </Link>
                </div>
              </div>

              {/* Clinician Quick Tools */}
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Physician Rapid Action Modules:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <Link
                    to="/doctor/nursing-desk"
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 font-semibold text-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>SBAR Shift Handover</span>
                  </Link>
                  <Link
                    to="/doctor/cath-lab-triage"
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 font-semibold text-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4 text-purple-600" />
                    <span>Cath Lab Queue</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Clinical Pillars Section */}
      <section className="px-6 sm:px-10 py-14 max-w-[1400px] mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 font-mono">
            Clinical Architecture
          </span>
          <h2 className="text-[28px] sm:text-[34px] font-extrabold text-slate-900 tracking-tight mt-1.5">
            Precision In-Silico Tools for Intensive Cardiovascular Care
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <Link
            to="/doctor/roster"
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[17px] text-slate-900 mb-2">1,000 Patient Cohort Roster</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Full-cohort triage sorted into Critical, High, Elevated, Moderate, and Low risk tiers. Filter by city or lead time.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-[13px] font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
              <span>View Roster</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 2 */}
          <Link
            to="/doctor/patients/CT-0042"
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1d5bf0] mb-4 group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[17px] text-slate-900 mb-2">Windkessel Biophysics Twin</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                3-element lumped parameter ODE biophysics calculating aortic compliance (C_art), peripheral resistance (R_p), and output.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-[13px] font-bold text-[#1d5bf0] group-hover:translate-x-1 transition-transform">
              <span>Explore Digital Twin</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 3 */}
          <Link
            to="/doctor/nursing-desk"
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[17px] text-slate-900 mb-2">CCU Nursing Desk &amp; SBAR</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Central ward monitoring desk with SBAR shift handover note generator and audio alarm telemetry silencing.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-[13px] font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
              <span>Open Nursing Desk</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 4 */}
          <Link
            to="/doctor/cath-lab-triage"
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-700 mb-4 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[17px] text-slate-900 mb-2">Cath Lab Triage &amp; Escalation</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Immediate protocol escalation for impending hypertensive crisis with pre-composed WhatsApp telemetry dispatch.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-[13px] font-bold text-purple-700 group-hover:translate-x-1 transition-transform">
              <span>Cath Lab Suite</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-8 px-6 sm:px-10 mt-auto">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">CardioTwin Inpatient Decision Support</span>
            <span>&bull;</span>
            <span>CDSCO SaMD Class B Regulatory Compliant</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/doctor/datasheet" className="hover:text-indigo-600 transition-colors">
              Regulatory Datasheet
            </Link>
            <Link to="/doctor/audit-vault" className="hover:text-indigo-600 transition-colors">
              Audit Trail Vault
            </Link>
            <Link to="/login" className="hover:text-indigo-600 transition-colors">
              Switch Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
