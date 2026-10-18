import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Volume2,
  VolumeX,
  Clock,
  Activity,
  Check,
  CheckCheck,
  RefreshCw,
  AlertTriangle,
  X,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Stethoscope,
  UserCheck,
  Building2,
  Lock,
  ChevronDown,
} from 'lucide-react';
import { quickSearchPatients, getAlertsFeed, acknowledgeAlert } from '../api/client';
import type { QuickSearchResult, ClinicalAlert } from '../api/types';
import RiskBadge from './RiskBadge';
import { useAudioTelemetry } from '../hooks/useAudioTelemetry';

interface TopBarProps {
  patientId?: string;
}

export default function TopBar({ patientId: _patientId }: TopBarProps = {}) {
  const navigate = useNavigate();
  const { isMuted, toggleMute, triggerCardiacBeep } = useAudioTelemetry();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<QuickSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Alerts state
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState<ClinicalAlert[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [ackLoadingId, setAckLoadingId] = useState<string | null>(null);
  const alertsContainerRef = useRef<HTMLDivElement>(null);

  // Live IST Clock state
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

  // Global keyboard shortcut (⌘K or /) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch alerts on mount and periodically
  const fetchAlerts = async () => {
    setIsLoadingAlerts(true);
    try {
      const feed = await getAlertsFeed();
      setAlerts(feed);
    } catch {
      // Fallback empty
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await quickSearchPatients(searchQuery.trim());
        setSearchResults(results);
        setShowSearchDropdown(true);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for search and alerts
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
      if (
        alertsContainerRef.current &&
        !alertsContainerRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        roleMenuRef.current &&
        !roleMenuRef.current.contains(event.target as Node)
      ) {
        setShowRoleMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/roster?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectPatient = (patient: QuickSearchResult) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    navigate(`/patients/${patient.patient_id}`);
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    setAckLoadingId(alertId);
    try {
      await acknowledgeAlert(alertId, 'Acknowledged via TopBar alert desk');
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? { ...a, status: 'ACKNOWLEDGED' as const, acknowledged_at: new Date().toISOString() }
            : a
        )
      );
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    } finally {
      setAckLoadingId(null);
    }
  };

  const handleAcknowledgeAll = async () => {
    const unacked = alerts.filter((a) => a.status !== 'ACKNOWLEDGED');
    for (const a of unacked) {
      await handleAcknowledgeAlert(a.id);
    }
  };

  const activeAlertsCount = alerts.filter((a) => a.status !== 'ACKNOWLEDGED').length;

  return (
    <header
      className="fixed top-0 left-64 right-0 h-16 z-40 flex items-center px-6 justify-between gap-4 border-b border-white/60 select-none"
      style={{
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(28px) saturate(190%)',
        boxShadow: '0 4px 20px -2px rgba(11,42,60,0.04), inset 0 1px 0 rgba(255,255,255,0.85)',
      }}
    >
      {/* Search Input with Autocomplete */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-xl">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <div className="absolute left-3.5 pointer-events-none text-[#00666f]">
            {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </div>
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
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowSearchDropdown(false);
            }}
            className="w-full pl-10 pr-20 py-2 rounded-xl text-[13px] focus:outline-none transition-all placeholder:text-[#3d494a]/50"
            style={{
              background: 'rgba(255, 255, 255, 0.90)',
              boxShadow: 'inset 0 1px 2px rgba(11,42,60,0.04), 0 2px 6px rgba(11,42,60,0.02)',
              fontFamily: 'Inter',
              color: '#111e1d',
              border: showSearchDropdown && searchQuery.trim() ? '1.5px solid #00666f' : '1px solid rgba(0, 102, 111, 0.12)',
            }}
            placeholder="Search patients by ID (e.g. CT-1001), name, or city..."
            type="text"
          />

          {/* Shortcut pill or Clear button */}
          <div className="absolute right-3 flex items-center gap-1.5">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowSearchDropdown(false);
                }}
                className="text-[#3d494a]/60 hover:text-[#111e1d] p-0.5 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#3d494a]/20 text-[#3d494a]/60 bg-white/70">
                ⌘K
              </span>
            )}
          </div>
        </form>

        {/* Search Results Dropdown */}
        {showSearchDropdown && searchQuery.trim().length > 0 && (
          <div
            className="absolute left-0 right-0 top-12 mt-1 rounded-2xl overflow-hidden z-50 transition-all border border-[#00666f]/15"
            style={{
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(28px)',
              boxShadow: '0 20px 48px -8px rgba(11,42,60,0.18), 0 2px 10px rgba(11,42,60,0.06)',
            }}
          >
            <div className="px-4 py-2.5 bg-gradient-to-r from-[#eef7f6] to-[#e4f3f1] border-b border-[#00666f]/10 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00666f] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                Patient Surveillance Directory
              </span>
              <span className="text-[11px] font-mono text-[#00666f] font-semibold bg-white/80 px-2 py-0.5 rounded-full">
                {searchResults.length} match{searchResults.length === 1 ? '' : 'es'}
              </span>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
              {searchResults.length > 0 ? (
                searchResults.map((patient) => (
                  <button
                    key={patient.patient_id}
                    onClick={() => handleSelectPatient(patient)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-[#eaf4f3] transition-colors group"
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#00666f]/10 text-[#00666f] font-bold text-[12px] flex items-center justify-center font-mono group-hover:bg-[#00666f] group-hover:text-white transition-colors">
                        {patient.patient_id.replace('CT-', '')}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[13px] text-[#111e1d] group-hover:text-[#00666f] transition-colors">
                            {patient.name}
                          </span>
                          <span className="text-[11px] font-mono font-semibold text-[#00666f] bg-[#e0f1ef] px-1.5 py-0.5 rounded">
                            {patient.patient_id}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#445f73]">
                          {patient.age}y {patient.sex} • <strong className="text-[#111e1d]">{patient.city}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <RiskBadge tier={patient.risk_tier} size="sm" />
                      <ChevronRight className="w-4 h-4 text-[#3d494a]/40 group-hover:text-[#00666f] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-6 text-center text-[#445f73]">
                  <AlertTriangle className="w-7 h-7 mx-auto mb-1 text-[#3d494a]/40" />
                  <p className="text-[13px] font-medium">No patients found for &ldquo;{searchQuery}&rdquo;</p>
                  <p className="text-[11px] text-[#3d494a]/60 mt-0.5">Try searching by ID (e.g. CT-1001) or city (e.g. Mumbai)</p>
                </div>
              )}
            </div>

            <button
              onClick={() => handleSearchSubmit()}
              type="button"
              className="w-full text-center py-2.5 bg-white hover:bg-[#f6fbfa] border-t border-gray-100 text-[12px] font-medium text-[#00666f] flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View all results in Hypertensive Crisis Roster</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Center/Right: Live CCU IST Clock */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/70 border border-white/90 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-[#2FBF9B] animate-pulse" />
        <Clock className="w-3.5 h-3.5 text-[#00666f]" />
        <span className="text-[11px] font-mono font-bold text-[#111e1d] tabular-nums">
          {currentTime || '15:40:00'} IST
        </span>
        <span className="text-[#bcc9cb]">•</span>
        <span className="text-[10px] font-semibold text-[#00666f] uppercase tracking-wider">
          CCU Stream Live
        </span>
      </div>

      {/* Right actions: Audio Mute, Alerts, Doctor Pill */}
      <div className="flex items-center gap-2">
        {/* Audio Telemetry Chime Toggle */}
        <button
          onClick={() => {
            toggleMute();
            if (isMuted) triggerCardiacBeep(120, 20);
          }}
          className={`px-2.5 py-1.5 rounded-xl transition-all border flex items-center gap-1.5 shadow-2xs ${
            !isMuted
              ? 'bg-[#e0f1ef] border-[#00666f]/30 text-[#00666f]'
              : 'bg-white/80 border-gray-200 text-gray-500 hover:text-gray-900'
          }`}
          title={isMuted ? 'Turn Audio Telemetry Chime ON' : 'Mute Cardiac Telemetry'}
          type="button"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#00666f] animate-pulse" />}
          <span className="text-[10px] font-mono font-bold hidden sm:inline">
            {isMuted ? 'MUTED' : 'CHIME'}
          </span>
        </button>

        {/* Notification Bell with Active Alerts Drawer Popover */}
        <div ref={alertsContainerRef} className="relative">
          <button
            onClick={() => {
              setShowNotifications((prev) => !prev);
              if (!showNotifications) fetchAlerts();
            }}
            className="relative p-2 rounded-xl transition-all hover:bg-white active:scale-95 border border-transparent hover:border-[#00666f]/15"
            style={{ color: '#3d494a' }}
            aria-label="Clinical Alerts Feed"
            type="button"
            title="Clinical Alerts Surveillance"
          >
            <Bell className="w-4 h-4" />
            {activeAlertsCount > 0 ? (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-sm animate-pulse"
                style={{ background: '#ba1a1a' }}
              >
                {activeAlertsCount}
              </span>
            ) : (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: '#2FBF9B' }} />
            )}
          </button>

          {/* Notifications Dropdown Popover */}
          {showNotifications && (
            <div
              className="absolute right-0 top-12 mt-2 w-96 rounded-2xl overflow-hidden z-50 transition-all border border-[#00666f]/15"
              style={{
                background: 'rgba(255, 255, 255, 0.96)',
                backdropFilter: 'blur(28px)',
                boxShadow: '0 20px 48px -8px rgba(11,42,60,0.22), 0 4px 16px rgba(11,42,60,0.06)',
              }}
            >
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-[#00666f] to-[#00818c] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-white" />
                  <div>
                    <h3 className="text-[13px] font-bold leading-tight">Clinical Alerts Surveillance</h3>
                    <p className="text-[10px] text-white/80">Active CCU &amp; Hemodynamic Triggers</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {activeAlertsCount > 1 && (
                    <button
                      onClick={handleAcknowledgeAll}
                      className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-[10px] font-semibold text-white transition-colors mr-1"
                      title="Acknowledge All Alerts"
                      type="button"
                    >
                      Ack All
                    </button>
                  )}
                  <button
                    onClick={fetchAlerts}
                    disabled={isLoadingAlerts}
                    className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white"
                    title="Refresh alerts feed"
                    type="button"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAlerts ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white"
                    title="Close popover"
                    type="button"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Alerts List */}
              <div className="max-h-80 overflow-y-auto p-3 flex flex-col gap-2.5">
                {alerts.length > 0 ? (
                  alerts.map((alert) => {
                    const isAck = alert.status === 'ACKNOWLEDGED';
                    const isEscalated = alert.status === 'ESCALATED';

                    return (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isAck
                            ? 'bg-gray-50/80 border-gray-200 opacity-75'
                            : alert.tier === 'CRITICAL'
                            ? 'bg-red-50/90 border-red-200 shadow-2xs'
                            : 'bg-amber-50/80 border-amber-200 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase font-mono ${
                                alert.tier === 'CRITICAL' ? 'bg-[#ba1a1a] text-white' : 'bg-[#b25e00] text-white'
                              }`}
                            >
                              {alert.tier}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-[#111e1d]">{alert.patient_id}</span>
                          </div>

                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              isAck
                                ? 'bg-emerald-100 text-emerald-800'
                                : isEscalated
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {alert.status}
                          </span>
                        </div>

                        <p className="text-[12px] font-bold text-[#111e1d] leading-snug">{alert.primary_concern}</p>
                        <p className="text-[11px] text-[#445f73] mt-1 line-clamp-2 leading-relaxed">
                          {alert.recommended_action}
                        </p>

                        <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              setShowNotifications(false);
                              navigate(`/patients/${alert.patient_id}`);
                            }}
                            className="text-[11px] font-semibold text-[#00666f] hover:underline flex items-center gap-0.5"
                            type="button"
                          >
                            <span>Open Twin</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          {!isAck && (
                            <button
                              onClick={() => handleAcknowledgeAlert(alert.id)}
                              disabled={ackLoadingId === alert.id}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 transition-colors flex items-center gap-1 shadow-2xs"
                              type="button"
                            >
                              {ackLoadingId === alert.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                              <span>Acknowledge</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-[#445f73]">
                    <CheckCheck className="w-7 h-7 mx-auto mb-1 text-emerald-600" />
                    <p className="text-[13px] font-bold text-[#111e1d]">All Patients Stabilized</p>
                    <p className="text-[11px] text-[#445f73] mt-0.5">No unacknowledged acute crisis triggers active</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Doctor Profile & Recipient Station Switcher */}
        <div className="relative pl-2 border-l border-gray-200" ref={roleMenuRef}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-black/5 transition-all text-left group"
            title="Switch Station / Duty Role"
            type="button"
          >
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[13px] font-semibold leading-none text-[#111e1d] flex items-center justify-end gap-1" style={{ fontFamily: 'Inter' }}>
                Dr. A. Sharma
                <ChevronDown className="w-3 h-3 text-[#445f73] transition-transform group-hover:translate-y-0.5" />
              </span>
              <span className="text-[10px] mt-0.5 text-[#00666f] font-semibold" style={{ fontFamily: 'Inter', letterSpacing: '0.04em' }}>
                Cath Lab &bull; Chief Attending
              </span>
            </div>
            <div className="relative">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs"
                style={{ background: 'linear-gradient(135deg, #00666f 0%, #00818c 100%)' }}
              >
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <span
                className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
                style={{ background: '#2FBF9B' }}
                title="Online Active"
              />
            </div>
          </button>

          {/* Station Switcher Popover */}
          {showRoleMenu && (
            <div
              className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-white/80 p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(28px)',
                boxShadow: '0 16px 40px -8px rgba(11, 42, 60, 0.16)',
              }}
            >
              <div className="px-2 pb-2 mb-2 border-b border-black/5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#445f73]">Switch Station / Viewpoint</span>
                <p className="text-[11px] text-[#00666f] font-semibold mt-0.5">Apex Heart &amp; Vascular Institute</p>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setShowRoleMenu(false);
                    navigate('/patients/CT-3092');
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-[#e0f1ef]/60 flex items-center gap-2.5 text-left transition-colors bg-teal-50/50 border border-teal-100"
                  type="button"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#00666f] text-white flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-[#111e1d] flex items-center justify-between">
                      <span>Dr. A. Sharma</span>
                      <span className="text-[9px] bg-[#00666f] text-white px-1.5 py-0.5 rounded font-mono">ACTIVE</span>
                    </p>
                    <p className="text-[10px] text-[#445f73] truncate">Cath Lab • Chief Attending (Twin View)</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowRoleMenu(false);
                    navigate('/nursing-desk');
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-emerald-50 flex items-center gap-2.5 text-left transition-colors"
                  type="button"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-[#111e1d]">Sister Mary (Nursing Desk)</p>
                    <p className="text-[10px] text-[#445f73] truncate">CCU Unit 4B • Telemetry &amp; Alarm Silencing</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowRoleMenu(false);
                    navigate('/cath-lab-triage');
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-purple-50 flex items-center gap-2.5 text-left transition-colors"
                  type="button"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-[#111e1d]">Cath Lab Emergency Triage</p>
                    <p className="text-[10px] text-[#445f73] truncate">Stat Escalation Queue &amp; Suite Allocation</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowRoleMenu(false);
                    navigate('/audit-vault');
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-gray-100 flex items-center gap-2.5 text-left transition-colors"
                  type="button"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 text-[#445f73] flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-[#111e1d]">CDSCO Audit Officer</p>
                    <p className="text-[10px] text-[#445f73] truncate">Cryptographic Regulatory Ledger</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
