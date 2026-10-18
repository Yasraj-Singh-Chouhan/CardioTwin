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

  const resolvedNavItems = navItems.map((item) => ({
    ...item,
    resolvedPath: item.patientNav
      ? item.path.replace('CT-3092', patientId)
      : item.path,
  }));

  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 z-50 flex flex-col justify-between p-4 select-none border-r border-white/60"
      style={{
        background: 'rgba(255, 255, 255, 0.68)',
        backdropFilter: 'blur(28px) saturate(190%)',
        boxShadow: '4px 0 24px -4px rgba(11, 42, 60, 0.05), inset -1px 0 0 rgba(255, 255, 255, 0.8)',
      }}
    >
      <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-190px)] pr-1">
        {/* Logo Branding */}
        <Link to="/" className="flex items-center gap-3 px-2 pt-1.5 group no-underline">
          <div
            className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-transform group-hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #00666f 0%, #00818c 100%)',
              color: '#fff',
              boxShadow: '0 6px 20px rgba(0, 102, 111, 0.32), inset 0 1px 1px rgba(255,255,255,0.3)',
            }}
          >
            <HeartPulse className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#2FBF9B] border-2 border-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span
                className="text-[20px] font-bold leading-none tracking-tight text-[#111e1d]"
                style={{ fontFamily: 'Plus Jakarta Sans', letterSpacing: '-0.02em' }}
              >
                Cardio<span className="text-[#00666f]">Twin</span>
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#e0f1ef] text-[#00666f] font-bold">
                v4.8b
              </span>
            </div>
            <span
              className="text-[10px] font-semibold tracking-widest uppercase mt-1 text-[#3d494a]/80"
              style={{ fontFamily: 'Inter', letterSpacing: '0.06em' }}
            >
              Physiological AI Desk
            </span>
          </div>
        </Link>

        {/* Active Patient Pill Banner (if inside patient view) */}
        {activePatientId && (
          <div
            className="p-3 rounded-2xl border border-[#00666f]/15"
            style={{
              background: 'linear-gradient(135deg, rgba(226, 241, 239, 0.7) 0%, rgba(204, 226, 248, 0.4) 100%)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00666f] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00666f] animate-ping" />
                Active Subject
              </span>
              <span className="text-[10px] font-mono font-bold text-[#00666f] bg-white/80 px-1.5 py-0.5 rounded">
                {activePatientId}
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[#111e1d] truncate">
                {activePatientId === 'CT-3092' ? 'Vikram Malhotra' : activePatientId === 'CT-1001' ? 'Rajesh Sharma' : 'Cohort Patient'}
              </span>
              <Link
                to="/roster"
                className="text-[10px] font-semibold text-[#00666f] hover:underline flex items-center"
                title="Switch Subject"
              >
                Switch
              </Link>
            </div>
          </div>
        )}

        {/* Navigation Links: Clinical Modules */}
        <nav className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#3d494a]/60 px-3 pt-1">
            Clinical Modules
          </span>

          {resolvedNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.resolvedPath}
                to={item.resolvedPath}
                end={item.resolvedPath === '/roster' || item.resolvedPath === '/datasheet'}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between px-3 py-2 rounded-xl text-[12.5px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-white shadow-[0_6px_20px_rgba(0,102,111,0.28)]'
                      : 'text-[#3d494a] hover:text-[#111e1d] hover:bg-white/80'
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        background: 'linear-gradient(135deg, #00666f 0%, #00818c 100%)',
                        fontFamily: 'Inter',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }
                    : { fontFamily: 'Inter' }
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-[#00666f]'
                        }`}
                      />
                      <span className="font-medium tracking-tight">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wider uppercase font-mono ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[#e2f1ef] text-[#00666f]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Recipient Station Desks */}
        <nav className="flex flex-col gap-1 pt-2 border-t border-black/5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#3d494a]/60 px-3">
            Recipient Desks &amp; Stations
          </span>

          {recipientItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between px-3 py-2 rounded-xl text-[12.5px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-white shadow-[0_6px_20px_rgba(0,102,111,0.28)]'
                      : 'text-[#3d494a] hover:text-[#111e1d] hover:bg-white/80'
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        background: 'linear-gradient(135deg, #00666f 0%, #00818c 100%)',
                        fontFamily: 'Inter',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }
                    : { fontFamily: 'Inter' }
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-[#00666f]'
                        }`}
                      />
                      <span className="font-medium tracking-tight">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wider uppercase font-mono ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.path === '/cath-lab-triage'
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-[#e2f1ef] text-[#00666f]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
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
        className="p-3.5 rounded-2xl border border-white/80 flex flex-col gap-2.5"
        style={{
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 16px -2px rgba(11, 42, 60, 0.04), inset 0 1px 1px rgba(255,255,255,0.9)',
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-bold uppercase tracking-widest text-[#3d494a]"
            style={{ fontFamily: 'Inter', letterSpacing: '0.05em' }}
          >
            Engine Grounding
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2FBF9B]/15 text-[#196C57] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#196C57] animate-pulse" />
            LIVE TWIN
          </span>
        </div>

        {/* Real-time EKG animation SVG line */}
        <div className="w-full h-5 overflow-hidden rounded bg-[#00666f]/5 flex items-center px-1">
          <svg className="w-full h-full" viewBox="0 0 160 20" preserveAspectRatio="none">
            <path
              d="M 0 10 L 25 10 L 30 4 L 35 16 L 40 10 L 55 10 L 60 2 L 65 18 L 70 10 L 95 10 L 100 5 L 105 15 L 110 10 L 135 10 L 140 3 L 145 17 L 150 10 L 160 10"
              fill="none"
              stroke="#00666f"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-ecg"
            />
          </svg>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-black/5 text-[#445f73]">
          <span className="font-medium">Windkessel 3-Elem</span>
          <span className="font-mono text-[#00666f] font-bold">&lt; 38ms</span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#445f73]">
          <span className="font-medium">LightGBM Fast-Twin</span>
          <span className="font-mono text-[#196C57] font-bold">100% Fit</span>
        </div>
      </div>
    </aside>
  );
}
