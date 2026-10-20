import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  Volume2,
  VolumeX,
  Clock,
  Loader2,
} from 'lucide-react';
import { quickSearchPatients, getAlertsFeed, acknowledgeAlert } from '../api/client';
import type { QuickSearchResult, ClinicalAlert } from '../api/types';
import RiskBadge from './RiskBadge';
import { useAudioTelemetry } from '../hooks/useAudioTelemetry';

interface TopBarProps {
  patientId?: string;
}

export default function TopBar({ patientId }: TopBarProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMuted, toggleMute, triggerCardiacBeep } = useAudioTelemetry();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<QuickSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Alerts state
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState<ClinicalAlert[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [ackLoadingId, setAckLoadingId] = useState<string | null>(null);
  const alertsContainerRef = useRef<HTMLDivElement>(null);

  // Live Clock state
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Global search shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch alerts
  const fetchAlerts = async () => {
    setIsLoadingAlerts(true);
    try {
      const feed = await getAlertsFeed();
      setAlerts(feed);
    } catch {
      // fallback
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (alertsContainerRef.current && !alertsContainerRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle live search debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const results = await quickSearchPatients(searchQuery.trim());
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSelectPatient = (pid: string) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    navigate(`/doctor/patients/${pid}`);
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    setAckLoadingId(alertId);
    try {
      await acknowledgeAlert(alertId, 'Attending Physician (Dr. Will Banner)');
      triggerCardiacBeep(120, 80);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' as const } : a))
      );
    } finally {
      setAckLoadingId(null);
    }
  };

  // Derive page label
  const getPageLabel = () => {
    const p = location.pathname;
    if (p.includes('/signals')) return 'Continuous Tonometry Signals';
    if (p.includes('/scenarios')) return 'What-If Countermeasure Sandbox';
    if (p.includes('/explanation')) return 'SHAP Causality & Guidance';
    if (p.includes('/roster')) return 'Crisis Surveillance Roster';
    if (p.includes('/datasheet')) return 'CDSCO Regulatory Datasheet';
    if (p.includes('/nursing-desk')) return 'CCU Nursing Desk & Handover';
    if (p.includes('/cath-lab-triage')) return 'Cath Lab Triage Queue';
    if (p.includes('/audit-vault')) return 'CDSCO Immutable Audit Vault';
    return 'Digital Twin Command Center';
  };

  const activeAlertsCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  return (
    <header className="fixed top-0 left-[74px] right-0 h-14 z-30 flex items-center px-6 justify-between gap-4 bg-white/85 backdrop-blur-md border-b border-slate-200/70 select-none font-sans text-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      {/* Left: Minimal Breadcrumb & Patient Context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500">
          <span className="font-semibold text-indigo-600">CardioTwin CCU</span>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-900 tracking-tight">{getPageLabel()}</span>
        </div>

        {patientId && (
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 text-[12px]">
            <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              {patientId}
            </span>
            <span className="text-slate-600 font-semibold truncate max-w-[140px]">
              Active CCU Subject
            </span>
          </div>
        )}
      </div>

      {/* Center: Clean Minimal Search Pill */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-md hidden md:block">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => {
              if (searchQuery.trim()) setShowSearchDropdown(true);
            }}
            placeholder="Search cohort by patient name or ID... (Ctrl+K)"
            className="w-full pl-9 pr-16 py-1.5 rounded-full text-[12px] bg-slate-50 border border-slate-200/80 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d5bf0]/30 focus:border-[#1d5bf0] transition-all"
          />
          {isSearching ? (
            <Loader2 className="w-3.5 h-3.5 text-[#1d5bf0] animate-spin absolute right-3" />
          ) : (
            <kbd className="absolute right-3 font-mono text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              Ctrl K
            </kbd>
          )}
        </div>

        {/* Dropdown Results */}
        {showSearchDropdown && searchResults.length > 0 && (
          <div className="absolute top-10 left-0 right-0 bg-white rounded-2xl p-2 shadow-xl border border-slate-100 z-50 animate-in fade-in max-h-64 overflow-y-auto">
            {searchResults.map((p) => (
              <div
                key={p.patient_id}
                onClick={() => handleSelectPatient(p.patient_id)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div>
                  <span className="font-bold text-[13px] text-slate-900">{p.name}</span>
                  <span className="font-mono text-[11px] text-[#1d5bf0] ml-2">({p.patient_id})</span>
                  <p className="text-[11px] text-slate-500">{p.age}y {p.sex} &bull; {p.city}</p>
                </div>
                <RiskBadge tier={p.risk_tier} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Live Telemetry Status, Clock & Actions */}
      <div className="flex items-center gap-4">
        {/* Live Stream Pulse Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-[#247953] text-[11px] font-bold border border-emerald-100/80">
          <span className="w-1.5 h-1.5 rounded-full bg-[#247953] animate-pulse" />
          <span>Stream Active 1 Hz</span>
        </div>

        {/* Live IST Clock */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/60">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentTime} IST</span>
        </div>

        {/* Notifications Popover Trigger */}
        <div ref={alertsContainerRef} className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications((prev) => !prev)}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors relative border border-slate-200/60"
            title="Clinical Alerts Feed"
          >
            <Bell className="w-3.5 h-3.5" />
            {activeAlertsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="font-bold text-[13px] text-slate-900">Physician Alerts</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold">
                  {isLoadingAlerts ? 'Updating...' : `${activeAlertsCount} Active`}
                </span>
              </div>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {alerts.length > 0 ? (
                  alerts.slice(0, 5).map((a) => (
                    <div
                      key={a.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px]"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>Patient {a.patient_id} ({a.stage_label})</span>
                        {a.status === 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() => handleAcknowledgeAlert(a.id)}
                            disabled={ackLoadingId === a.id}
                            className="text-[10px] text-[#1d5bf0] hover:underline"
                          >
                            Ack
                          </button>
                        )}
                      </div>
                      <p className="text-slate-600 text-[10px] mt-0.5">{a.primary_concern || a.trigger_summary}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 text-[11px] py-4">No active alerts</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Audio Beep Toggle */}
        <button
          type="button"
          onClick={toggleMute}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border ${
            isMuted
              ? 'bg-slate-50 text-slate-400 border-slate-200/60'
              : 'bg-blue-50 text-[#1d5bf0] border-blue-200 shadow-2xs'
          }`}
          title={isMuted ? 'Telemetry Audio: Muted' : 'Telemetry Audio: Active'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Doctor Persona Badge */}
        <div className="hidden sm:flex items-center gap-2 pl-2">
          <img
            src="/assets/inspiration/doctor_will.jpg"
            alt="Dr. Will Banner"
            className="w-7 h-7 rounded-full object-cover border border-slate-200"
          />
          <span className="text-[12px] font-bold text-slate-800">Dr. Will Banner</span>
        </div>
      </div>
    </header>
  );
}
