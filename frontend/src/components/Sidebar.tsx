import { NavLink, Link } from 'react-router-dom';
import {
  Users,
  HeartPulse,
  GitFork,
  Activity,
  BrainCircuit,
  ShieldCheck,
  Stethoscope,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  activePatientId?: string;
}

const navItems = [
  { path: '/roster', label: 'Crisis Roster', icon: Users, badge: 'Surveillance' },
  { path: '/patients/CT-3092', label: 'Digital Twin', icon: HeartPulse, patientNav: true },
  { path: '/patients/CT-3092/scenarios', label: 'Countermeasures', icon: GitFork, patientNav: true },
  { path: '/patients/CT-3092/signals', label: 'Live Telemetry', icon: Activity, patientNav: true },
  { path: '/patients/CT-3092/explanation', label: 'SHAP & Causality', icon: BrainCircuit, patientNav: true },
  { path: '/datasheet', label: 'CDSCO Datasheet', icon: ShieldCheck, badge: 'Class C' },
];

const recipientItems = [
  { path: '/nursing-desk', label: 'CCU Nursing Desk', icon: Stethoscope, badge: 'Unit 4B' },
  { path: '/cath-lab-triage', label: 'Cath Lab Triage', icon: ShieldAlert, badge: 'Queue' },
  { path: '/audit-vault', label: 'CDSCO Audit Vault', icon: Lock, badge: 'Ledger' },
];

export default function Sidebar({ activePatientId }: SidebarProps) {
  const patientId = activePatientId || 'CT-3092';
  const { isDark } = useTheme();

  const resolvedNavItems = navItems.map((item) => ({
    ...item,
    resolvedPath: item.patientNav
      ? item.path.replace('CT-3092', patientId)
      : item.path,
  }));

  return (
    <aside
      className={`fixed left-0 top-0 h-full w-64 z-50 flex flex-col justify-between p-4 select-none border-r transition-colors duration-300 ${
        isDark
          ? 'bg-[#0b111c]/85 border-white/[0.08] text-slate-200 shadow-[4px_0_30px_rgba(0,0,0,0.5)]'
          : 'bg-white/70 border-white/60 text-[#111e1d] shadow-[4px_0_24px_-4px_rgba(11,42,60,0.05)]'
      }`}
      style={{
        backdropFilter: 'blur(28px) saturate(190%)',
      }}
    >
      <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-190px)] pr-1">
        {/* Logo Branding */}
        <Link to="/" className="flex items-center gap-3 px-2 pt-1.5 group no-underline">
          <div
            className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-transform group-hover:scale-105 shadow-lg ${
              isDark
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-500/25'
                : 'bg-gradient-to-br from-[#00666f] to-[#00818c] shadow-[#00666f]/30'
            }`}
          >
            <HeartPulse className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0b111c]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[20px] font-bold leading-none tracking-tight ${
                  isDark ? 'text-white' : 'text-[#111e1d]'
                }`}
                style={{ fontFamily: 'Plus Jakarta Sans', letterSpacing: '-0.02em' }}
              >
                Cardio<span className={isDark ? 'text-cyan-400' : 'text-[#00666f]'}>Twin</span>
              </span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                  isDark ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-[#e0f1ef] text-[#00666f]'
                }`}
              >
                v4.8b
              </span>
            </div>
            <span
              className={`text-[10px] font-semibold tracking-widest uppercase mt-1 ${
                isDark ? 'text-slate-400' : 'text-[#3d494a]/80'
              }`}
              style={{ fontFamily: 'Inter', letterSpacing: '0.06em' }}
            >
              Physiological AI Desk
            </span>
          </div>
        </Link>

        {/* Active Patient Pill Banner */}
        {activePatientId && (
          <div
            className={`p-3 rounded-2xl border transition-all ${
              isDark
                ? 'bg-[#0f192b]/80 border-cyan-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                : 'bg-gradient-to-br from-[#e2f1ef]/70 to-[#cce2f8]/40 border-[#00666f]/15'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDark ? 'text-cyan-400' : 'text-[#00666f]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full animate-ping ${
                    isDark ? 'bg-cyan-400' : 'bg-[#00666f]'
                  }`}
                />
                Active Subject
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/80 text-[#00666f]'
                }`}
              >
                {activePatientId}
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className={`font-semibold truncate ${isDark ? 'text-white' : 'text-[#111e1d]'}`}>
                {activePatientId === 'CT-3092' ? 'Ramesh Sharma' : activePatientId === 'CT-4105' ? 'Priya Nair' : activePatientId === 'CT-1088' ? 'Anand Kulkarni' : 'Cohort Patient'}
              </span>
              <Link
                to="/roster"
                className={`text-[11px] font-medium transition-colors ${
                  isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-[#00666f] hover:underline'
                }`}
              >
                Switch
              </Link>
            </div>
          </div>
        )}

        {/* Navigation Section 1: Patient Core */}
        <nav className="flex flex-col gap-1">
          <div className="px-3 pt-2 pb-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-[#3d494a]/80'
              }`}
            >
              Diagnostic Vectors
            </span>
          </div>

          {resolvedNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.resolvedPath}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all group ${
                    isActive
                      ? isDark
                        ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-white border border-cyan-400/35 shadow-[0_4px_16px_rgba(0,242,254,0.15)]'
                        : 'bg-[#00666f] text-white shadow-md'
                      : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                      : 'text-[#3d494a] hover:text-[#111e1d] hover:bg-black/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive
                            ? 'text-cyan-300'
                            : isDark
                            ? 'text-slate-400 group-hover:text-cyan-300'
                            : 'text-[#00666f]'
                        }`}
                      />
                      <span className="tracking-tight">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wider uppercase font-mono ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : isDark
                            ? 'bg-slate-800 text-slate-300 border border-white/5'
                            : 'bg-[#e2f1ef] text-[#00666f]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F2FE]" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Navigation Section 2: Clinical Workflow */}
        <nav className="flex flex-col gap-1 pt-2 border-t border-white/[0.08]">
          <div className="px-3 pt-1 pb-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-[#3d494a]/80'
              }`}
            >
              Action Stations
            </span>
          </div>

          {recipientItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all group ${
                    isActive
                      ? isDark
                        ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-white border border-cyan-400/35 shadow-[0_4px_16px_rgba(0,242,254,0.15)]'
                        : 'bg-[#00666f] text-white shadow-md'
                      : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                      : 'text-[#3d494a] hover:text-[#111e1d] hover:bg-black/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive
                            ? 'text-cyan-300'
                            : isDark
                            ? 'text-slate-400 group-hover:text-cyan-300'
                            : 'text-[#00666f]'
                        }`}
                      />
                      <span className="tracking-tight">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wider uppercase font-mono ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.path === '/cath-lab-triage'
                            ? isDark
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-purple-100 text-purple-900'
                            : isDark
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-[#e2f1ef] text-[#00666f]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F2FE]" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Workstation Engine Telemetry Card */}
      <div
        className={`p-3.5 rounded-2xl border flex flex-col gap-2.5 transition-all ${
          isDark
            ? 'bg-[#0f192b]/80 border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.4)]'
            : 'bg-white/65 border-white/80 shadow-[0_4px_16px_rgba(11,42,60,0.04)]'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-[10px] font-bold uppercase tracking-widest ${
              isDark ? 'text-slate-400' : 'text-[#3d494a]'
            }`}
          >
            Engine Grounding
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
              isDark
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-[#2FBF9B]/15 text-[#196C57]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE TWIN
          </span>
        </div>

        {/* Real-time EKG animation SVG line */}
        <div
          className={`w-full h-5 overflow-hidden rounded flex items-center px-1 ${
            isDark ? 'bg-cyan-500/10' : 'bg-[#00666f]/5'
          }`}
        >
          <svg className="w-full h-full" viewBox="0 0 160 20" preserveAspectRatio="none">
            <path
              d="M 0 10 L 25 10 L 30 4 L 35 16 L 40 10 L 55 10 L 60 2 L 65 18 L 70 10 L 95 10 L 100 5 L 105 15 L 110 10 L 135 10 L 140 3 L 145 17 L 150 10 L 160 10"
              fill="none"
              stroke={isDark ? '#00F2FE' : '#00666f'}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-ecg"
            />
          </svg>
        </div>

        <div
          className={`flex items-center justify-between text-[11px] pt-1 border-t ${
            isDark ? 'border-white/[0.08] text-slate-300' : 'border-black/5 text-[#445f73]'
          }`}
        >
          <span className="font-medium">Windkessel 3-Elem</span>
          <span className={`font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-[#00666f]'}`}>
            &lt; 38ms
          </span>
        </div>

        <div
          className={`flex items-center justify-between text-[11px] ${
            isDark ? 'text-slate-300' : 'text-[#445f73]'
          }`}
        >
          <span className="font-medium">LightGBM Fast-Twin</span>
          <span className="font-mono text-emerald-400 font-bold">100% Fit</span>
        </div>
      </div>
    </aside>
  );
}
