import { Link } from 'react-router-dom';
import {
  HeartPulse,
  ArrowRight,
  User,
  Stethoscope,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

export default function LandingPage() {
  const cart = 0.85; // Aortic compliance
  const rp = 1.35; // Systemic resistance

  const liveSbp = Math.round(112 + (1.4 - cart) * 78 + (rp - 1.0) * 32);
  const liveDbp = Math.round(76 + (rp - 1.0) * 28 - (1.4 - cart) * 8);

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between selection:bg-[#1d5bf0] selection:text-white antialiased"
      style={{
        backgroundColor: '#edf2f8',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-10 py-3.5 transition-all">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
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

          <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-[#1d5bf0] transition-colors">
              How It Works
            </a>
            <a href="#portals" className="hover:text-[#1d5bf0] transition-colors">
              Dual Portals
            </a>
            <a href="#phenotypes" className="hover:text-[#1d5bf0] transition-colors">
              South Asian Phenotypes
            </a>
            <Link to="/datasheet" className="hover:text-[#1d5bf0] transition-colors">
              CDSCO Datasheet
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="text-[13px] font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl hover:bg-slate-100/80 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/patient/CT-3092"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-slate-800 bg-white shadow-2xs border border-slate-200/80 hover:border-[#1d5bf0] transition-all"
            >
              <User className="w-3.5 h-3.5 text-[#1d5bf0]" />
              <span>Patient Portal</span>
            </Link>
            <Link
              to="/doctor"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor CCU Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 sm:px-10 pt-12 pb-16 lg:py-20 max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-2xs border border-slate-200/80 w-fit mb-5 text-[11px] font-mono font-bold text-[#1d5bf0]">
              <span className="w-2 h-2 rounded-full bg-[#1d5bf0] animate-pulse" />
              <span>CDSCO Class B Validated &bull; 4&ndash;12h Pre-Crisis Lead Time</span>
            </div>

            <h1 className="text-[38px] sm:text-[48px] lg:text-[54px] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Precision In-Silico <br />
              <span className="text-[#1d5bf0]">Cardiovascular</span> Digital Twin
            </h1>

            <p className="text-[16px] sm:text-[17px] text-slate-600 mt-5 leading-relaxed max-w-2xl font-normal">
              A dual-portal physiological AI architecture predicting hypertensive crises 4 to 12 hours prior to clinical onset. Continuously parameterizes 3-element Windkessel biophysics from non-invasive wearable tonometry.
            </p>

            {/* Direct Dual-Portal Launch CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to="/patient/CT-3092"
                className="px-6 py-3.5 rounded-2xl bg-[#1d5bf0] hover:bg-blue-700 text-white font-bold text-[14px] shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <User className="w-4 h-4" />
                <span>Launch Patient Portal</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                to="/doctor"
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-[14px] shadow-sm border border-slate-200/90 hover:border-slate-300 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Stethoscope className="w-4 h-4 text-indigo-600" />
                <span>Launch Doctor CCU Portal</span>
              </Link>
            </div>

            {/* Key Trust Signals */}
            <div className="mt-10 grid grid-cols-3 gap-4 pt-8 border-t border-slate-200/80 max-w-lg">
              <div>
                <span className="text-[24px] font-extrabold text-slate-900 block leading-tight font-mono">
                  4&ndash;12h
                </span>
                <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                  Early Warning Lead Time
                </span>
              </div>
              <div>
                <span className="text-[24px] font-extrabold text-slate-900 block leading-tight font-mono">
                  100%
                </span>
                <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                  South Asian Phenotype Fit
                </span>
              </div>
              <div>
                <span className="text-[24px] font-extrabold text-emerald-600 block leading-tight font-mono">
                  1 Hz
                </span>
                <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                  Wearable Telemetry Sync
                </span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Card: The Beating Digital Twin Preview */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-[460px] bg-white rounded-3xl p-6 shadow-[0_20px_50px_rgba(29,91,240,0.08)] border border-slate-200/80 flex flex-col justify-between">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1d5bf0] flex items-center justify-center font-bold text-[12px] font-mono">
                    CT
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-slate-900 leading-tight">
                      Jacqueline Delaney
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      58y &bull; Malignant HTN Suspect &bull; Bengaluru
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold font-mono text-[10px] border border-rose-100 animate-pulse">
                  CRITICAL SURGE
                </span>
              </div>

              {/* Heart Render with Realistic Beating Animation */}
              <div className="relative h-64 flex items-center justify-center my-4 overflow-hidden rounded-2xl bg-[#edf2f8]/60">
                <img
                  src="/assets/inspiration/torso_with_heart_exact.jpg"
                  alt="Anatomical Beating Heart"
                  className="w-full h-full object-contain pointer-events-none"
                />

                {/* Animated Pulsating Wave Rings */}
                <div className="absolute top-[46%] left-[63%] w-40 h-40 rounded-full border border-[#1d5bf0]/60 pointer-events-none animate-heartwave-1" />
                <div className="absolute top-[46%] left-[63%] w-52 h-52 rounded-full border border-blue-400/40 pointer-events-none animate-heartwave-2" />

                {/* Heartbeat Pulse Glow */}
                <div className="absolute top-[46%] left-[63%] -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full pointer-events-none animate-cardiac-pulse bg-[#1d5bf0]/20 blur-md" />

                {/* Live BPM Badge */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-white/95 shadow-xs border border-slate-200 text-[11px] font-mono font-bold text-slate-800 flex items-center gap-1.5 animate-cardiac-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>78 BPM &bull; Sinus Rhythm</span>
                </div>
              </div>

              {/* Live Metric Strip */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Estimated SBP / DBP
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-[17px] font-extrabold text-slate-900 font-mono">
                      {liveSbp}/{liveDbp}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">mmHg</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    6h Crisis Risk
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-[17px] font-extrabold text-rose-600 font-mono">
                      84%
                    </span>
                    <span className="text-[10px] text-rose-600 font-bold uppercase">Surge</span>
                  </div>
                </div>
              </div>

              {/* Quick Jump Action */}
              <Link
                to="/patient/CT-3092"
                className="mt-4 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[12px] flex items-center justify-center gap-1.5 transition-all text-center"
              >
                <span>Open Full Patient View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Portals Section: Dedicated Architecture */}
      <section id="portals" className="px-6 sm:px-10 py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#1d5bf0] font-mono">
              Role-Specific Separation
            </span>
            <h2 className="text-[30px] sm:text-[34px] font-extrabold text-slate-900 tracking-tight mt-1.5">
              Two Tailored Portals. Zero Confusion.
            </h2>
            <p className="text-[14px] text-slate-500 mt-2">
              Patients receive a calm, reassuring, and minimal vital view with direct tele-consultation. Doctors gain clinical-grade in-silico ODE simulation and acute CCU triage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Patient Portal Card */}
            <div className="bg-[#edf2f8]/70 rounded-3xl p-8 border border-slate-200/80 flex flex-col justify-between hover:border-[#1d5bf0]/40 transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white shadow-2xs flex items-center justify-center text-[#1d5bf0] mb-5 border border-slate-100">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-[22px] font-bold text-slate-900">
                  Patient Health Portal
                </h3>
                <p className="text-[14px] text-slate-600 mt-2 leading-relaxed">
                  Engineered for peace of mind. A clutter-free dashboard displaying your beating heart, live vitals, prescribed medication adherence, and 1-click consultation with your care team.
                </p>

                <ul className="mt-6 space-y-3 text-[13px] text-slate-700">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Smooth, rhythmically beating 3D heart with cardiac pulse</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Four clean vital sparklines (Heart Rate, BP, Blood Sugar, Glucose)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Available Doctors card with instant Voice Call and Chat message</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Prescriptions carousel with clear adherence tracking</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200/80">
                <Link
                  to="/patient/CT-3092"
                  className="inline-flex items-center gap-2 text-[13px] font-bold text-[#1d5bf0] hover:underline"
                >
                  <span>Explore Patient Portal (Jacqueline Delaney)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Doctor Portal Card */}
            <div className="bg-[#edf2f8]/70 rounded-3xl p-8 border border-slate-200/80 flex flex-col justify-between hover:border-indigo-400/40 transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white shadow-2xs flex items-center justify-center text-indigo-600 mb-5 border border-slate-100">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="text-[22px] font-bold text-slate-900">
                  Physician &amp; CCU Command Center
                </h3>
                <p className="text-[14px] text-slate-600 mt-2 leading-relaxed">
                  Designed for cardiologists and intensivists. In-silico Windkessel biophysical ODE solver, cohort risk ranking, explainable SHAP causality, SBAR shift notes, and cath lab queue.
                </p>

                <ul className="mt-6 space-y-3 text-[13px] text-slate-700">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Cohort Surveillance Roster with 4&ndash;12h crisis lead times</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>3-Element Windkessel ODE biophysics (R_p, C_art, Z_c)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Automated SBAR handover notes &amp; vasodilator titration assistant</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>CDSCO Class B tamper-evident audit vault with SHA-256 hashes</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200/80">
                <Link
                  to="/doctor"
                  className="inline-flex items-center gap-2 text-[13px] font-bold text-indigo-600 hover:underline"
                >
                  <span>Explore Doctor &amp; CCU Command Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* South Asian Phenotypes Callout */}
      <section id="phenotypes" className="px-6 sm:px-10 py-16 max-w-[1400px] mx-auto w-full">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#1d5bf0] font-mono">
              Epidemiological Grounding
            </span>
            <h2 className="text-[26px] sm:text-[30px] font-extrabold text-slate-900 tracking-tight mt-1.5 leading-snug">
              Calibrated Specifically for South Asian Cardiovascular Phenotypes
            </h2>
            <p className="text-[14px] text-slate-600 mt-3 leading-relaxed">
              Standard Western Framingham models underestimate hypertensive crisis onset in Indian cohorts due to 25% higher baseline peripheral resistance (R_p) and accelerated premature aortic stiffening (C_art). CardioTwin's hybrid ODE biophysics solver bridges this clinical gap.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <Link
              to="/datasheet"
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[13px] transition-all"
            >
              Read CDSCO Datasheet
            </Link>
            <Link
              to="/login"
              className="px-5 py-3 rounded-xl bg-[#1d5bf0] hover:bg-blue-700 text-white font-bold text-[13px] transition-all"
            >
              Access System Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-8 px-6 sm:px-10 text-center">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-slate-500">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-[#1d5bf0]" />
            <span className="font-bold text-slate-800">CardioTwin Physiological AI</span>
            <span>&bull;</span>
            <span>Bangalore AI Hackathon 2026</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/datasheet" className="hover:text-slate-900">Regulatory Datasheet</Link>
            <Link to="/audit-vault" className="hover:text-slate-900">Audit Vault</Link>
            <Link to="/login" className="hover:text-slate-900 font-semibold text-[#1d5bf0]">Portal Switcher</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
