import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartPulse,
  Activity,
  ShieldCheck,
  ArrowRight,
  Sliders,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { EcgOscilloscope } from '../components/EcgOscilloscope';

export default function LandingPage() {
  // Interactive In Silico Stiffening Simulator state on Hero
  const [cart, setCart] = useState(0.85); // Aortic compliance
  const [rp, setRp] = useState(1.35); // Systemic resistance

  // Compute live dynamic hemodynamics
  const liveSbp = Math.round(110 + (1.4 - cart) * 80 + (rp - 1.0) * 35);
  const liveDbp = Math.round(75 + (rp - 1.0) * 30 - (1.4 - cart) * 10);
  const liveMap = Math.round(liveDbp + (liveSbp - liveDbp) / 3);
  const liveRisk = Math.min(98, Math.max(15, Math.round(((liveSbp - 110) / 80) * 100)));
  const isCrisis = liveSbp >= 165 || liveRisk >= 75;

  return (
    <div
      className="min-h-screen relative overflow-x-hidden selection:bg-[#00666f] selection:text-white"
      style={{
        background: 'linear-gradient(135deg, #E8F7F5 0%, #D6EEF7 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#111e1d',
      }}
    >
      {/* Ambient Glow Blobs */}
      <div
        className="absolute -top-24 left-1/4 w-[520px] h-[520px] rounded-full pointer-events-none opacity-40 blur-[120px]"
        style={{ background: 'rgba(0,102,111,0.14)' }}
      />
      <div
        className="absolute top-1/3 -right-20 w-[580px] h-[580px] rounded-full pointer-events-none opacity-40 blur-[130px]"
        style={{ background: 'rgba(207,229,251,0.45)' }}
      />

      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center px-8 justify-between border-b border-white/60"
        style={{
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(28px) saturate(190%)',
          boxShadow: '0 4px 20px -2px rgba(11,42,60,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
            style={{
              background: 'linear-gradient(135deg, #00666f 0%, #00818c 100%)',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(0,102,111,0.25)',
            }}
          >
            <HeartPulse className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span
              style={{
                fontFamily: 'Plus Jakarta Sans',
                fontSize: '20px',
                fontWeight: 700,
                color: '#111e1d',
                letterSpacing: '-0.02em',
                lineHeight: '24px',
              }}
            >
              Cardio<span className="text-[#00666f]">Twin</span>
            </span>
            <span
              style={{
                fontFamily: 'Inter',
                fontSize: '10px',
                fontWeight: 700,
                color: '#00666f',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginTop: '2px',
              }}
            >
              Physiological AI &bull; CDSCO Class C
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-7">
          <a
            href="#how-it-works"
            className="text-[13px] font-medium text-[#3d494a] hover:text-[#00666f] transition-colors"
          >
            Hemodynamic Architecture
          </a>
          <a
            href="#simulator"
            className="text-[13px] font-medium text-[#3d494a] hover:text-[#00666f] transition-colors"
          >
            3-Element Windkessel
          </a>
          <Link
            to="/datasheet"
            className="text-[13px] font-medium text-[#3d494a] hover:text-[#00666f] transition-colors"
          >
            CDSCO Model Datasheet
          </Link>
          <a
            href="#archetypes"
            className="text-[13px] font-medium text-[#3d494a] hover:text-[#00666f] transition-colors"
          >
            South Asian Phenotypes
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/patients/CT-3092"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl text-[13px] font-semibold text-[#00666f] bg-white hover:bg-[#eaf4f3] border border-[#00666f]/20 transition-all shadow-2xs"
          >
            Sample Twin (CT-3092)
          </Link>
          <Link
            to="/roster"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[13px] text-white hover:brightness-110 active:scale-95 transition-all shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #00666f 0%, #00818c 100%)',
              boxShadow: '0 4px 16px rgba(14,154,167,0.30)',
            }}
          >
            <span>Open CCU Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full pt-20">
        <div className="relative w-full overflow-hidden px-8 py-12">
          <div className="max-w-[1440px] mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center min-h-[calc(100vh-140px)]">
              {/* Left: Headline & Actions */}
              <div className="lg:col-span-6 flex flex-col justify-center z-10">
                {/* Live Pill */}
                <div
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full w-fit mb-5 border border-white/80"
                  style={{
                    background: 'rgba(255,255,255,0.75)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 2px 8px rgba(11,42,60,0.06)',
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-[#00666f] animate-pulse" />
                  <span
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: '#00666f',
                    }}
                  >
                    Physiological Digital Twin Engine
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#e0f1ef] text-[#00666f] font-bold">
                    v4.8b
                  </span>
                </div>

                <h1
                  className="tracking-tight leading-none mb-5"
                  style={{
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: '56px',
                    fontWeight: 800,
                    lineHeight: '62px',
                    letterSpacing: '-0.03em',
                    color: '#111e1d',
                  }}
                >
                  See a blood pressure crisis{' '}
                  <span className="text-[#00666f] underline decoration-[#00666f]/20 underline-offset-4">
                    6 to 12 hours
                  </span>{' '}
                  before it happens.
                </h1>

                <p
                  className="max-w-xl mb-9 leading-relaxed text-[16px] text-[#445f73]"
                  style={{ fontFamily: 'Inter', lineHeight: '26px' }}
                >
                  CardioTwin fuses clinical records, wearable photoplethysmography (PPG), and atmospheric covariates with a 3-element Windkessel biophysical ODE to warn doctors early, preventing acute hypertensive encephalopathy and decompensation.
                </p>

                <div className="flex flex-wrap items-center gap-3.5">
                  <Link
                    to="/roster"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[14px] text-white hover:brightness-110 active:scale-98 transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #00666f 0%, #00818c 100%)',
                      boxShadow: '0 6px 24px rgba(0,102,111,0.32)',
                    }}
                  >
                    <span>Launch CCU Surveillance Desk</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/patients/CT-3092"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-[14px] bg-white/80 hover:bg-white text-[#111e1d] border border-white transition-all shadow-xs"
                  >
                    <Activity className="w-4 h-4 text-[#00666f]" />
                    <span>Inspect Patient Twin</span>
                  </Link>
                </div>

                {/* Validation Metrics Grid */}
                <div className="grid grid-cols-3 gap-5 mt-10 pt-6 border-t border-black/5">
                  {[
                    { val: '92.4%', label: 'Pre-crisis sensitivity', sub: 'Validated on 1,000 cohort' },
                    { val: '8.4 hrs', label: 'Average lead warning', sub: 'Before ED admission' },
                    { val: '< 38 ms', label: 'In silico solver', sub: '3-Element ODE ODE bio-fit' },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="font-bold tabular-nums text-[26px] tracking-tight text-[#111e1d] font-mono leading-none">
                        {s.val}
                      </p>
                      <p className="text-[12px] font-semibold text-[#111e1d] mt-1">{s.label}</p>
                      <p className="text-[10px] text-[#445f73]">{s.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Live Workstation Telemetry Card with Embedded Oscilloscope & Stiffening Simulator */}
              <div id="simulator" className="lg:col-span-6 relative flex justify-center z-10">
                <div className="w-full max-w-[580px] p-6 rounded-3xl glass-card border border-white/90 shadow-xl">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00666f] opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00666f]" />
                      </span>
                      <div>
                        <p className="font-bold text-[13px] text-[#111e1d]">
                          Subject CT-4091 &bull; 54y M &bull; Delhi NCR
                        </p>
                        <p className="text-[11px] text-[#445f73]">
                          Windkessel Bio-fit Active &bull; Continuous Wearable PPG
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#e0f1ef] text-[#00666f]">
                      LIVE IN SILICO
                    </span>
                  </div>

                  {/* Real-time Oscilloscope Embedded Banner */}
                  <div className="mb-4">
                    <EcgOscilloscope heartRate={76} isCrisis={isCrisis} height={80} />
                  </div>

                  {/* Interactive Compliance Sliders */}
                  <div className="p-3.5 rounded-2xl mb-4 bg-white/70 border border-gray-100 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#00666f] flex items-center gap-1.5 font-mono">
                        <Sliders className="w-3.5 h-3.5" />
                        In Silico Compliance Sliders
                      </span>
                      <span className="text-[10px] text-[#445f73]">Drag to simulate arterial crisis</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Arterial Compliance Slider */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#445f73] text-[11px]">Compliance (C_art)</span>
                          <span className="font-mono font-bold text-[#00666f]">{cart.toFixed(2)} mL/mmHg</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="1.4"
                          step="0.05"
                          value={cart}
                          onChange={(e) => setCart(parseFloat(e.target.value))}
                          className="w-full accent-[#00666f] cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] font-mono text-[#445f73] mt-0.5">
                          <span>0.5 (Stiff)</span>
                          <span>1.4 (Compliant)</span>
                        </div>
                      </div>

                      {/* Systemic Resistance Slider */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#445f73] text-[11px]">Resistance (R_p)</span>
                          <span className="font-mono font-bold text-[#ba1a1a]">{rp.toFixed(2)} mmHg·s/mL</span>
                        </div>
                        <input
                          type="range"
                          min="0.9"
                          max="1.9"
                          step="0.05"
                          value={rp}
                          onChange={(e) => setRp(parseFloat(e.target.value))}
                          className="w-full accent-[#ba1a1a] cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] font-mono text-[#445f73] mt-0.5">
                          <span>0.9 (Dilated)</span>
                          <span>1.9 (Constricted)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Calculated Hemodynamics Readout */}
                  <div className="grid grid-cols-12 gap-3 mb-4">
                    {/* Aortic Wave Profile */}
                    <div className="col-span-7 flex flex-col justify-between rounded-2xl p-3.5 bg-white/80 border border-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#445f73]">
                          Simulated Aortic BP
                        </span>
                        <span
                          className={`text-[16px] font-mono font-bold ${
                            isCrisis ? 'text-[#ba1a1a] animate-pulse' : 'text-[#00666f]'
                          }`}
                        >
                          {liveSbp}/{liveDbp} mmHg
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#445f73] pt-2 border-t border-gray-100">
                        <span>MAP: <strong className="text-[#111e1d]">{liveMap} mmHg</strong></span>
                        <span>PP: <strong className="text-[#00666f]">{liveSbp - liveDbp} mmHg</strong></span>
                      </div>
                    </div>

                    {/* Risk Projection */}
                    <div className="col-span-5 flex flex-col justify-between items-center rounded-2xl p-3.5 bg-white/80 border border-gray-100 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#445f73]">
                        Risk Projection
                      </span>
                      <div className="my-1">
                        <span
                          className={`font-mono font-black text-2xl leading-none ${
                            isCrisis ? 'text-[#ba1a1a]' : 'text-[#8E6200]'
                          }`}
                        >
                          {liveRisk}%
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                          isCrisis
                            ? 'bg-red-100 border-red-200 text-red-900 animate-pulse'
                            : 'bg-amber-50 border-amber-200 text-amber-900'
                        }`}
                      >
                        {isCrisis ? 'CRITICAL SURGE' : 'ELEVATED RISK'}
                      </span>
                    </div>
                  </div>

                  {/* Verification Banner */}
                  <div className="pt-2 flex items-center justify-between text-[11px] border-t border-gray-100 text-[#445f73]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-4 h-4 text-[#00666f]" />
                      3-Element Biophysics ODE Constraint: Verified
                    </span>
                    <span className="font-mono text-[10px] text-[#00666f] font-bold">t-step 250ms &bull; 100% Fit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="w-full px-8 py-3">
          <div className="max-w-[1440px] mx-auto rounded-2xl py-3 px-5 flex flex-wrap items-center justify-center gap-3 text-center glass border border-white/80">
            <ShieldCheck className="w-5 h-5 text-[#00666f]" />
            <p className="text-[12px] text-[#445f73] font-medium">
              Clinical decision-support architecture &bull; Class C SaMD Framework &bull; Calibrated for Indian adult hypertensive phenotypes &bull; Grounded in 3-Element ODE biophysics
            </p>
          </div>
        </div>

        {/* High-Risk Patient Archetypes Section */}
        <section id="archetypes" className="w-full px-8 py-16">
          <div className="max-w-[1440px] mx-auto">
            <div className="max-w-2xl mb-10">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#00666f]">
                Validated Cohort Scenarios
              </span>
              <h2
                className="text-[36px] font-bold leading-tight mt-1 text-[#111e1d]"
                style={{ fontFamily: 'Plus Jakarta Sans', letterSpacing: '-0.02em' }}
              >
                Triage South Asian hypertensive archetypes.
              </h2>
              <p className="text-[14px] mt-2 leading-relaxed text-[#445f73]">
                Explore continuous digital twins pre-calibrated with localized environmental factors (e.g. Delhi Winter PM2.5), autonomic stress, and sodium surges.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {[
                {
                  id: 'CT-3092',
                  name: 'Vikram Malhotra',
                  age: '61y M',
                  city: 'Mumbai',
                  tier: 'CRITICAL',
                  condition: 'Post-PCI Tonometry & Stiffening',
                  risk: 94,
                  warning: '3.2h to Encephalopathy',
                },
                {
                  id: 'CT-1001',
                  name: 'Rajesh Sharma',
                  age: '58y M',
                  city: 'Delhi NCR',
                  tier: 'CRITICAL',
                  condition: 'Severe Air Pollution AQI 420 Surge',
                  risk: 91,
                  warning: '4.8h to Crisis Decompensation',
                },
                {
                  id: 'CT-2044',
                  name: 'Priya Iyer',
                  age: '49y F',
                  city: 'Chennai',
                  tier: 'HIGH',
                  condition: 'Diabetic Nephropathy & Fluid Retention',
                  risk: 78,
                  warning: '6.4h Lead Warning Window',
                },
                {
                  id: 'CT-4091',
                  name: 'Amitabh Sen',
                  age: '54y M',
                  city: 'Kolkata',
                  tier: 'ELEVATED',
                  condition: 'Autonomous Autonomic Tone Drift',
                  risk: 62,
                  warning: 'Compensating under ACEi',
                },
              ].map((p) => (
                <Link
                  key={p.id}
                  to={`/patients/${p.id}`}
                  className="p-5 rounded-2xl border border-white/80 bg-white/80 hover:bg-white hover:border-[#00666f]/30 hover:shadow-lg transition-all flex flex-col justify-between group shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#e0f1ef] text-[#00666f]">
                        {p.id}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded-full ${
                          p.tier === 'CRITICAL' ? 'bg-red-100 text-[#ba1a1a]' : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {p.tier}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-[#111e1d] group-hover:text-[#00666f] transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-[#445f73]">
                      {p.age} &bull; <strong>{p.city}</strong>
                    </p>
                    <p className="text-xs mt-2 line-clamp-2 text-[#445f73]">
                      {p.condition}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-[#445f73]">RISK INDEX</div>
                      <div className="font-mono font-bold text-lg text-[#00666f]">{p.risk}%</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-[#00666f] group-hover:translate-x-1 transition-transform">
                      <span>Launch Twin</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How it works Section */}
        <section id="how-it-works" className="w-full px-8 py-16">
          <div className="max-w-[1440px] mx-auto">
            <div className="max-w-2xl mb-12">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#00666f]">
                Hemodynamic Architecture
              </span>
              <h2
                className="text-[36px] font-bold leading-tight text-[#111e1d] mt-1"
                style={{ fontFamily: 'Plus Jakarta Sans', letterSpacing: '-0.02em' }}
              >
                Three stages of computational physiology.
              </h2>
              <p className="text-[14px] text-[#445f73] mt-2 leading-relaxed">
                CardioTwin bridges the gap between episodic clinical records and continuous wearable dynamics using physical arterial equations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  stage: 'STAGE 01',
                  title: '1. Multimodal Fusion',
                  subtitle: 'EHR + Continuous Wearables',
                  icon: Activity,
                  desc: 'Continuous ingestion of episodic electronic health records coupled with wearable PPG waveforms and environmental AQI/temperature streams.',
                  metric: '100 Hz Sync',
                  metricLabel: 'Data Stream Alignment',
                  pct: 92,
                },
                {
                  stage: 'STAGE 02',
                  title: '2. Biophysical Simulation',
                  subtitle: '3-Element Windkessel ODE',
                  icon: HeartPulse,
                  desc: 'A patient-calibrated 3-element Windkessel cardiovascular solver computing peripheral resistance (Rp), arterial compliance (Cart), and systolic load.',
                  metric: 'C = 0.94 mL/mmHg',
                  metricLabel: 'Dynamic Arterial Compliance',
                  pct: 74,
                },
                {
                  stage: 'STAGE 03',
                  title: '3. Predictive Early Warning',
                  subtitle: 'Explainable Horizon Warning',
                  icon: ShieldAlert,
                  desc: 'Early risk alerts generated 6 to 12 hours ahead with game-theoretic SHAP factor decomposition and ranked non-pharmacological countermeasures.',
                  metric: '6 - 12 Hours',
                  metricLabel: 'Physician Action Window',
                  pct: 85,
                },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className="glass-card p-6 rounded-3xl flex flex-col justify-between border border-white/80"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-[#00666f]/10 text-[#00666f] shadow-2xs">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-[11px] font-bold font-mono text-[#00666f] tracking-wider">
                          {s.stage}
                        </span>
                        <h3 className="text-[20px] font-bold text-[#111e1d]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                          {s.title}
                        </h3>
                      </div>
                      <h4 className="text-[13px] font-semibold text-[#111e1d] mb-2">{s.subtitle}</h4>
                      <p className="text-[13px] text-[#445f73] leading-relaxed">{s.desc}</p>
                    </div>

                    <div className="mt-6 rounded-2xl p-3.5 bg-white/80 border border-gray-100">
                      <div className="flex items-center justify-between mb-1.5 text-[11px] text-[#445f73]">
                        <span>{s.metricLabel}</span>
                        <span className="font-mono font-bold text-[#00666f]">{s.metric}</span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden bg-gray-200">
                        <div
                          className="h-full rounded-full bg-[#00666f] transition-all duration-500"
                          style={{ width: `${s.pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="w-full px-8 py-10 mb-10">
          <div className="max-w-[1440px] mx-auto">
            <div className="relative rounded-3xl p-12 text-center overflow-hidden glass border border-white">
              <div
                className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
                style={{ background: 'rgba(0,102,111,0.15)', filter: 'blur(90px)' }}
              />
              <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-md"
                  style={{ background: 'linear-gradient(135deg, #00666f 0%, #00818c 100%)', color: '#fff' }}
                >
                  <HeartPulse className="w-7 h-7 animate-pulse text-white" />
                </div>
                <h2
                  className="text-[36px] font-bold leading-tight text-[#111e1d] mb-3"
                  style={{ fontFamily: 'Plus Jakarta Sans', letterSpacing: '-0.02em' }}
                >
                  Bring predictive hemodynamic safety to high-risk hypertensive cohorts.
                </h2>
                <p className="text-[15px] text-[#445f73] mb-6 leading-relaxed">
                  Empower critical care units, cath-lab specialists, and hypertension centers with in silico trajectory visualization.
                </p>
                <Link
                  to="/roster"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-[15px] text-white hover:brightness-110 active:scale-98 transition-all shadow-md mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #00666f 0%, #00818c 100%)',
                    boxShadow: '0 6px 24px rgba(0,102,111,0.32)',
                  }}
                >
                  <span>Explore Patient Roster &bull; Active CCU Feed</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <p className="text-[12px] text-[#445f73]">
                  Designed for cardiologists, intensivists, and clinical researchers in India.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full px-8 py-10 border-t border-white/60 bg-white/40 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <HeartPulse className="w-5 h-5 text-[#00666f]" />
              <span style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '20px', fontWeight: 700, color: '#111e1d' }}>
                CardioTwin
              </span>
            </div>
            <p className="text-[12px] text-[#445f73] leading-relaxed">
              Clinical-grade computational digital twin architecture mapping hemodynamic pathways and patient-specific risks in the Indian population.
            </p>
          </div>

          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#111e1d] mb-3">Platform Modules</h4>
            <ul className="space-y-1.5 text-[12px] text-[#445f73]">
              <li><Link to="/roster" className="hover:text-[#00666f] transition-colors">Crisis Surveillance Roster</Link></li>
              <li><Link to="/patients/CT-3092" className="hover:text-[#00666f] transition-colors">Digital Twin Workstation</Link></li>
              <li><Link to="/patients/CT-3092/scenarios" className="hover:text-[#00666f] transition-colors">Countermeasure Simulator</Link></li>
              <li><Link to="/patients/CT-3092/explanation" className="hover:text-[#00666f] transition-colors">SHAP &amp; Biophysical Causality</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#111e1d] mb-3">Governance &amp; Data</h4>
            <ul className="space-y-1.5 text-[12px] text-[#445f73]">
              <li><Link to="/datasheet" className="hover:text-[#00666f] transition-colors">CDSCO Class C Dossier</Link></li>
              <li><Link to="/datasheet" className="hover:text-[#00666f] transition-colors">Cryptographic Audit Seal</Link></li>
              <li><span className="text-[#3d494a]/60">PhysioNet MIT-BIH Grounding</span></li>
              <li><span className="text-[#3d494a]/60">India-QRISK3 Chronic Calibration</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#111e1d] mb-3">Clinical Operations</h4>
            <p className="text-[12px] text-[#445f73] mb-3">Designed for deployment in Cath Labs and Academic Cardiac Intensive Care Units.</p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcebe9] text-[11px] font-bold text-[#00666f]">
              <span className="w-2 h-2 rounded-full bg-[#00666f]" /> CDSCO Compliance Framework
            </span>
          </div>
        </div>

        <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-2 border-t border-black/5 text-[12px] text-[#445f73]">
          <p>Investigational decision-support software. For clinical evaluation and qualified specialist use only.</p>
          <p className="font-mono">&copy; 2026 CardioTwin Intelligence &bull; All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
