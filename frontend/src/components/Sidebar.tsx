import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  LayoutGrid,
  Calendar,
  Stethoscope,
  ShieldAlert,
  FlaskConical,
  BrainCircuit,
  GitFork,
  ShieldCheck,
  Lock,
  Search,
  Bell,
  Volume2,
  VolumeX,
  X,
  ArrowRight,
  Activity,
  Sun,
  Moon,
} from 'lucide-react';
import { useAudioTelemetry } from '../hooks/useAudioTelemetry';
import { useTheme } from '../context/ThemeContext';
import { quickSearchPatients, getAlertsFeed } from '../api/client';
import type { QuickSearchResult, ClinicalAlert } from '../api/types';
import RiskBadge from './RiskBadge';

interface SidebarProps {
  activePatientId?: string;
}

export default function Sidebar({ activePatientId }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const patientId = activePatientId || 'CT-3092';
  const { isMuted, toggleMute } = useAudioTelemetry();
  const { isDark, toggleTheme } = useTheme();

  // Role Detection: Patient Portal vs Doctor CCU Command
  const isPatientMode =
    searchParams.get('role') === 'patient' ||
    (!searchParams.get('role') && location.pathname === `/patients/${patientId}`);

  // Search state
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<QuickSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Alerts state
  const [showAlertsPopover, setShowAlertsPopover] = useState(false);
  const [alerts, setAlerts] = useState<ClinicalAlert[]>([]);

  useEffect(() => {
    getAlertsFeed().then((feed) => {
      if (feed) setAlerts(feed);
    }).catch(() => {});
  }, []);

  // Keyboard shortcut Ctrl+K or / to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (showSearchModal) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [showSearchModal]);

  const handleSearchChange = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await quickSearchPatients(q);
      setSearchResults(res);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Nav items for Patient Portal (Minimal, Focused on Vitals, Care Team & Prescriptions)
  const patientNavItems = [
    {
      path: `/patients/${patientId}?role=patient`,
      icon: LayoutGrid,
      tooltip: 'My Cardiovascular Twin & Vitals',
      exact: true,
    },
    {
      path: `/patients/${patientId}/signals?role=patient`,
      icon: Activity,
      tooltip: 'Continuous Wearable Inflow (1 Hz)',
    },
    {
      path: '/roster',
      icon: Stethoscope,
      tooltip: 'Switch to Doctor CCU Portal',
    },
  ];

  // Nav items for Clinician CCU Portal (Full Clinical Command Center)
  const doctorNavItems = [
    {
      path: '/doctor/roster',
      icon: Calendar,
      tooltip: 'Crisis Surveillance Roster',
    },
    {
      path: `/doctor/patients/${patientId}`,
      icon: Activity,
      tooltip: 'Windkessel Biophysics ODE Model',
      exact: true,
    },
    {
      path: '/doctor/nursing-desk',
      icon: Stethoscope,
      tooltip: 'CCU Nursing Desk & Handover',
    },
    {
      path: '/doctor/cath-lab-triage',
      icon: ShieldAlert,
      tooltip: 'Cath Lab Triage Queue',
    },
    {
      path: `/doctor/patients/${patientId}/signals`,
      icon: FlaskConical,
      tooltip: 'Continuous Tonometry Signals',
    },
    {
      path: `/doctor/patients/${patientId}/explanation`,
      icon: BrainCircuit,
      tooltip: 'SHAP Feature Causality',
    },
    {
      path: `/doctor/patients/${patientId}/scenarios`,
      icon: GitFork,
      tooltip: 'Countermeasure Simulations',
    },
    {
      path: '/doctor/datasheet',
      icon: ShieldCheck,
      tooltip: 'CDSCO Regulatory Datasheet',
    },
    {
      path: '/doctor/audit-vault',
      icon: Lock,
      tooltip: 'CDSCO Immutable Audit Vault',
    },
  ];

  const navItems = isPatientMode ? patientNavItems : doctorNavItems;
  const activeAlertCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  return (
    <>
      {/* ========================================================================= */}
      {/* EXACT SLIM MINIMAL VERTICAL RAIL (MATCHING REFERENCE DESIGN)              */}
      {/* ========================================================================= */}
      <aside className="w-[74px] shrink-0 min-h-screen bg-white flex flex-col items-center justify-between py-4 border-r border-slate-200/70 shadow-[2px_0_20px_rgba(0,0,0,0.02)] z-40 fixed left-0 top-0 select-none font-sans">
        {/* Top: Caduceus Emblem + Role Badge + Search */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Medical Caduceus Emblem */}
          <Link
            to={isPatientMode ? `/patients/${patientId}?role=patient` : '/roster'}
            className="w-10 h-10 flex items-center justify-center text-[#1d5bf0] hover:scale-105 transition-transform"
            title="CardioTwin Home"
          >
            <svg viewBox="0 0 40 40" className="w-8 h-8 fill-current">
              <path d="M20 3 C19.2 3 18.5 3.7 18.5 4.5 L18.5 7.2 C15.8 7.5 13.5 9 12 11.2 C10.5 13.4 10.3 16.3 11.5 18.7 C12.2 20.1 13.5 21.2 15 21.8 L15 23 C13.2 23.8 11.8 25.3 11.2 27.2 C10.6 29.1 10.9 31.2 12.1 32.8 C13.3 34.4 15.2 35.4 17.2 35.7 L17.2 37 C17.2 37.8 17.9 38.5 18.7 38.5 C19.5 38.5 20.2 37.8 20.2 37 L20.2 35.7 C22.2 35.4 24.1 34.4 25.3 32.8 C26.5 31.2 26.8 29.1 26.2 27.2 C25.6 25.3 24.2 23.8 22.4 23 L22.4 21.8 C23.9 21.2 25.2 20.1 25.9 18.7 C27.1 16.3 26.9 13.4 25.4 11.2 C23.9 9 21.6 7.5 18.9 7.2 L18.9 4.5 C18.9 3.7 18.2 3 17.4 3 Z M17.4 9.2 C19.6 9.4 21.6 10.6 22.8 12.3 C24 14.1 24.1 16.3 23.2 18.2 C22.7 19.3 21.8 20.2 20.6 20.6 L17.4 20.6 C16.2 20.2 15.3 19.3 14.8 18.2 C13.9 16.3 14 14.1 15.2 12.3 C16.4 10.6 18.4 9.4 20.6 9.2 Z M18.5 24 L20.5 24 C22.1 24.3 23.5 25.4 24.1 26.9 C24.7 28.4 24.4 30.1 23.4 31.4 C22.4 32.7 20.8 33.5 19.2 33.7 L18.5 33.7 C16.9 33.5 15.3 32.7 14.3 31.4 C13.3 30.1 13 28.4 13.6 26.9 C14.2 25.4 15.6 24.3 17.2 24 Z" />
            </svg>
          </Link>

          {/* Role Indicator Pill */}
          <button
            type="button"
            onClick={() => {
              if (isPatientMode) {
                navigate('/roster');
              } else {
                navigate(`/patients/${patientId}?role=patient`);
              }
            }}
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all shadow-2xs hover:scale-105 cursor-pointer ${
              isPatientMode
                ? 'bg-blue-50 text-[#1d5bf0] border border-blue-200'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            }`}
            title={isPatientMode ? 'Active: Patient Portal. Click to switch to Doctor' : 'Active: Doctor CCU. Click to switch to Patient'}
          >
            {isPatientMode ? 'PATIENT' : 'DOCTOR'}
          </button>

          {/* Search Button in Soft Rounded Box */}
          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors border border-slate-200/50 shadow-2xs group relative"
            title="Search Patients (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
            <span className="absolute left-14 bg-slate-900 text-white text-[11px] font-medium px-2 py-1 rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
              Quick Search (Ctrl+K)
            </span>
          </button>
        </div>

        {/* Center: Clean Navigation Action Icons */}
        <div className="flex flex-col items-center gap-3 w-full my-auto py-2">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.path || (location.pathname + location.search) === item.path
              : location.pathname.startsWith(item.path.split('?')[0]);

            return (
              <NavLink
                key={idx}
                to={item.path}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all group relative ${
                  isActive
                    ? 'bg-[#e5efff] text-[#1d5bf0] shadow-xs scale-105 font-bold'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {/* Minimal Flyout Tooltip */}
                <span className="absolute left-14 bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                  {item.tooltip}
                </span>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom: Bell Notifications, Audio Toggle, Portal Avatar */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Notifications Bell */}
          <button
            type="button"
            onClick={() => setShowAlertsPopover((prev) => !prev)}
            className="w-10 h-10 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors relative group"
            title="Clinical Alerts"
          >
            <Bell className="w-4 h-4" />
            {activeAlertCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2.5 animate-pulse" />
            )}
            <span className="absolute left-14 bg-slate-900 text-white text-[11px] font-medium px-2 py-1 rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
              Alerts Feed ({activeAlertCount})
            </span>
          </button>

          {/* Audio Telemetry Mute Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors group relative ${
              isMuted
                ? 'text-slate-300 hover:bg-slate-50'
                : 'text-[#1d5bf0] bg-blue-50/80 shadow-2xs'
            }`}
            title={isMuted ? 'Telemetry Audio: Muted' : 'Telemetry Audio: Active'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="absolute left-14 bg-slate-900 text-white text-[11px] font-medium px-2 py-1 rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
              {isMuted ? 'Unmute Audio Beep' : 'Mute Audio Beep'}
            </span>
          </button>

          {/* Theme Toggle (Light / Dark) */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative ${
              isDark
                ? 'text-amber-400 hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 shadow-2xs'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="absolute left-14 bg-slate-900 text-white text-[11px] font-medium px-2 py-1 rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
              {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </span>
          </button>

          {/* Avatar (Click to switch portal or view profile) */}
          <div
            onClick={() => {
              if (isPatientMode) {
                navigate('/roster');
              } else {
                navigate(`/patients/${patientId}?role=patient`);
              }
            }}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-xs cursor-pointer hover:scale-105 transition-transform"
            title={
              isPatientMode
                ? 'Jacqueline Delaney (Patient) - Click to Switch to Doctor Portal'
                : 'Dr. Will Banner (Physician) - Click to Switch to Patient Portal'
            }
          >
            <img
              src={
                isPatientMode
                  ? '/assets/inspiration/patient_jacqueline.jpg'
                  : '/assets/inspiration/doctor_will.jpg'
              }
              alt="Profile Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* QUICK PATIENT SEARCH MODAL (CMD+K / SEARCH BUTTON)                         */}
      {/* ========================================================================= */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/25 backdrop-blur-xs flex items-start justify-center pt-24 p-4">
          <div className="bg-white rounded-3xl p-5 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-[14px]">
                <Search className="w-4 h-4 text-[#1d5bf0]" />
                <span>Search Patient Cohort &amp; Telemetry</span>
              </div>
              <button
                onClick={() => setShowSearchModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative mb-3">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Type patient name, ID (e.g. CT-3092), or condition..."
                className="w-full bg-slate-50 rounded-2xl pl-4 pr-10 py-3 text-[13px] font-medium text-slate-800 placeholder-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1d5bf0]/30 transition-all"
              />
              {isSearching && (
                <div className="w-4 h-4 border-2 border-[#1d5bf0] border-t-transparent rounded-full animate-spin absolute right-3.5 top-3.5" />
              )}
            </div>

            {/* Results List */}
            <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((p) => (
                  <div
                    key={p.patient_id}
                    onClick={() => {
                      navigate(`/doctor/patients/${p.patient_id}`);
                      setShowSearchModal(false);
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1d5bf0] font-bold text-[12px] flex items-center justify-center font-mono">
                        {p.patient_id.slice(-4)}
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-slate-900 leading-tight">
                          {p.name}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {p.age}y {p.sex} &bull; {p.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <RiskBadge tier={p.risk_tier} />
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                ))
              ) : searchQuery ? (
                <p className="text-center text-slate-400 text-[12px] py-4">
                  No patients matching &ldquo;{searchQuery}&rdquo;
                </p>
              ) : (
                <div className="py-2 text-[12px] text-slate-400 flex flex-col gap-1">
                  <span className="font-semibold text-slate-600">Featured CCU patients:</span>
                  <button
                    onClick={() => {
                      navigate('/doctor/patients/CT-0042');
                      setShowSearchModal(false);
                    }}
                    className="text-left text-[#1d5bf0] hover:underline"
                  >
                    &bull; CT-0042 &ndash; Ritu Mishra (Critical 98.0%)
                  </button>
                  <button
                    onClick={() => {
                      navigate('/doctor/patients/CT-0009');
                      setShowSearchModal(false);
                    }}
                    className="text-left text-[#1d5bf0] hover:underline"
                  >
                    &bull; CT-0009 &ndash; Ramesh Bhat (High 73.9%)
                  </button>
                  <button
                    onClick={() => {
                      navigate('/doctor/patients/CT-3092');
                      setShowSearchModal(false);
                    }}
                    className="text-left text-[#1d5bf0] hover:underline"
                  >
                    &bull; CT-3092 &ndash; Rajesh Verma (Elevated 58.0%)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ALERTS FEED FLYOUT POPOVER                                                */}
      {/* ========================================================================= */}
      {showAlertsPopover && (
        <div className="fixed left-20 bottom-12 z-50 bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 w-80 animate-in fade-in slide-in-from-left-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <span className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-[#1d5bf0]" />
              Physician Alerts
            </span>
            <button
              onClick={() => setShowAlertsPopover(false)}
              className="text-slate-400 hover:text-slate-700 text-[12px]"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            {alerts.length > 0 ? (
              alerts.slice(0, 4).map((alt) => (
                <div
                  key={alt.id}
                  className="bg-slate-50/80 rounded-2xl p-2.5 border border-slate-100 text-[11px]"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Patient {alt.patient_id} ({alt.stage_label})</span>
                    <span className="text-rose-600 font-mono text-[10px]">CRITICAL</span>
                  </div>
                  <p className="text-slate-600 text-[10px] mt-0.5 line-clamp-2">
                    {alt.primary_concern || alt.trigger_summary}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-4 text-[11px]">
                No active alerts in queue
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
