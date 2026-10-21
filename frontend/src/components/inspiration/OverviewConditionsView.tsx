import { useState } from 'react';
import {
  Heart,
  Search,
  Phone,
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Activity,
  Droplet,
} from 'lucide-react';

interface OverviewConditionsViewProps {
  onConsultNow?: () => void;
  onSelectOrgan?: (organ: string) => void;
  heartRate?: number;
  sbp?: number;
  dbp?: number;
  glucose?: string;
  bloodCount?: string;
}

interface CardiacHotspot {
  id: string;
  label: string;
  coords: { x: number; y: number }; // percentage
  parameter: string;
  value: string;
  interpretation: string;
}

export function OverviewConditionsView({
  onConsultNow,
  onSelectOrgan,
  heartRate = 120,
  sbp = 116,
  dbp = 70,
  glucose = '230/ml',
  bloodCount = '80-90',
}: OverviewConditionsViewProps) {
  const [activeTab, setActiveTab] = useState<'diagnose' | 'heart'>('heart');
  const [activeHotspot, setActiveHotspot] = useState<CardiacHotspot | null>(null);
  const [selectedBodyOrgan, setSelectedBodyOrgan] = useState<string>('heart');
  const [currentDateIndex, setCurrentDateIndex] = useState<number>(0);
  const [showConsultModal, setShowConsultModal] = useState<boolean>(false);

  const dates = ['20-March-23', '21-March-23', '22-March-23', '23-March-23', '24-March-23'];

  const hotspots: CardiacHotspot[] = [
    {
      id: 'aorta',
      label: 'Ascending Aorta Arch',
      coords: { x: 50, y: 18 },
      parameter: 'Aortic Compliance (C_art)',
      value: '0.88 mL/mmHg',
      interpretation: 'Moderate elastic stiffening consistent with grade-2 vascular remodeling.',
    },
    {
      id: 'left_ventricle',
      label: 'Left Ventricle Chamber',
      coords: { x: 58, y: 58 },
      parameter: 'Estimated Ejection Fraction',
      value: '54%',
      interpretation: 'Borderline preserved systolic function with elevated wall stress.',
    },
    {
      id: 'coronary',
      label: 'Right Coronary Vessel',
      coords: { x: 38, y: 44 },
      parameter: 'Microvascular Resistance',
      value: '1.34 mmHg·s/mL',
      interpretation: 'Normal epicardial perfusion with compensated downstream microvascular tone.',
    },
    {
      id: 'apex',
      label: 'Cardiac Apex & Valve Zone',
      coords: { x: 48, y: 82 },
      parameter: 'Stroke Volume (SV)',
      value: '72 mL',
      interpretation: 'Normal stroke output with synchronized contractility.',
    },
  ];

  const bodyOrgans = [
    { id: 'liver', name: 'Liver', image: '/assets/inspiration/organ_liver.jpg' },
    { id: 'heart', name: 'My Heart', image: '/assets/inspiration/heart_3d.jpg', active: true },
    { id: 'blood', name: 'Blood Cells', image: '/assets/inspiration/organ_blood.jpg' },
    { id: 'lungs', name: 'Lungs', image: '/assets/inspiration/organ_lungs.jpg' },
    { id: 'kidneys', name: 'Kidneys', image: '/assets/inspiration/organ_kidneys.jpg' },
  ];

  const doctors = [
    { name: 'Dr. Hanzer Jon', specialty: 'Senior Cardiologist', avatar: '/assets/inspiration/doctor_will.jpg' },
    { name: 'Dr. Steve Alex', specialty: 'Electrophysiologist', avatar: '/assets/inspiration/doctor_hella.jpg' },
    { name: 'Dr. Johan Fraz', specialty: 'Interventionalist', avatar: '/assets/inspiration/doctor_will.jpg' },
  ];

  return (
    <div className="w-full bg-[#f1f4f8] text-[#1b2533] rounded-[36px] p-6 sm:p-8 shadow-[0_12px_45px_rgba(0,0,0,0.05)] border border-slate-200/70 relative select-none font-sans overflow-hidden">
      {/* ================= Top Bar Header ================= */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Left: Brand + Toggle Switch */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-white shadow-xs font-bold text-slate-800 text-[18px]">
            M<span className="text-[#1d5bf0] font-black">+</span>
          </div>

          {/* Diagnose / My Heart Pill Switch */}
          <div className="flex items-center bg-white/90 p-1.5 rounded-full shadow-xs border border-slate-200/60">
            <button
              type="button"
              onClick={() => setActiveTab('diagnose')}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
                activeTab === 'diagnose'
                  ? 'bg-slate-100 text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Diagnose
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('heart')}
              className={`px-4 py-1.5 rounded-full text-[13px] font-bold flex items-center gap-2 transition-all ${
                activeTab === 'heart'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#1d5bf0]" />
              My Heart
            </button>
          </div>
        </div>

        {/* Right: Search Pill + Call + Bell + Avatar */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Pill Search Input */}
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-white/90 rounded-full pl-4 pr-10 py-2 text-[13px] font-medium text-slate-700 placeholder-slate-400 border border-slate-200/70 focus:outline-none focus:ring-2 focus:ring-[#1d5bf0]/30 transition-all shadow-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
          </div>

          {/* Quick Call Button */}
          <button
            type="button"
            onClick={() => setShowConsultModal(true)}
            className="w-10 h-10 rounded-full bg-[#1d5bf0] text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-xs"
            title="Emergency Consultation"
          >
            <Phone className="w-4 h-4" />
          </button>

          {/* Notification Bell */}
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-white text-slate-600 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-xs relative border border-slate-200/60"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500" />
          </button>

          {/* Profile Avatar */}
          <img
            src="/assets/inspiration/patient_jacqueline.jpg"
            alt="User Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs hover:scale-105 transition-transform cursor-pointer"
          />
        </div>
      </div>

      {/* ================= Main Studio Layout ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT SECTION: Title + 3D Heart with Hotspots (5 cols) ================= */}
        <div className="lg:col-span-5 flex flex-col">
          {/* Bold Title */}
          <div className="mb-4">
            <h1 className="text-[34px] sm:text-[40px] font-black text-slate-900 leading-[1.08] tracking-tight">
              Overview <br />
              <span className="text-slate-800">Conditions</span>
            </h1>
          </div>

          {/* 3D Heart Visualizer Box with Glowing Hotspots */}
          <div className="relative bg-white/60 rounded-[32px] p-6 flex flex-col items-center justify-center min-h-[380px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-white/80">
            {/* Concentric Soft Circular Pedestal */}
            <div className="absolute w-72 h-72 rounded-full bg-slate-100/80 border border-slate-200/50 pointer-events-none" />
            <div className="absolute w-60 h-60 rounded-full bg-white/80 border border-slate-100 pointer-events-none" />

            {/* 3D Heart Image with Hotspots Overlay */}
            <div className="relative group w-64 h-64 flex items-center justify-center">
              <img
                src="/assets/inspiration/heart_3d.jpg"
                alt="Interactive 3D Heart"
                className="w-full h-full object-contain drop-shadow-[0_16px_30px_rgba(235,50,50,0.22)]"
                style={{ animation: 'cardiacBeat 1s infinite ease-in-out' }}
              />

              {/* Interactive Hotspot Markers */}
              {hotspots.map((spot) => (
                <button
                  key={spot.id}
                  type="button"
                  onClick={() => setActiveHotspot(spot)}
                  className="absolute z-20 group/marker"
                  style={{ top: `${spot.coords.y}%`, left: `${spot.coords.x}%` }}
                >
                  <span className="relative flex items-center justify-center w-5 h-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white border-2 border-[#1d5bf0] shadow-sm" />
                  </span>

                  {/* Hover tooltip */}
                  <span className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover/marker:flex flex-col bg-slate-900 text-white text-[10px] font-semibold px-2 py-1 rounded-md whitespace-nowrap z-30 shadow-lg">
                    {spot.label}
                  </span>
                </button>
              ))}

              {/* Floating Live Heart Rate ECG Overlay Card (Image 2 Replica) */}
              <div className="absolute -bottom-2 -left-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-slate-100 z-20 flex flex-col gap-1 w-36">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 fill-[#1d5bf0] text-[#1d5bf0]" />
                  <span className="text-[10px] font-semibold text-slate-400">Heart Rate</span>
                </div>
                <div className="font-bold text-[13px] text-slate-900 leading-none">
                  {heartRate} bpm
                </div>
                {/* Blue ECG waveform line */}
                <div className="w-full h-6 pt-1">
                  <svg viewBox="0 0 100 25" className="w-full h-full text-[#1d5bf0]">
                    <path
                      d="M 0 12 L 20 12 L 25 18 L 32 3 L 38 22 L 44 8 L 50 12 L 70 12 L 75 18 L 82 3 L 88 22 L 94 8 L 100 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Active Hotspot Inspector Banner */}
            {activeHotspot && (
              <div className="mt-4 w-full bg-white rounded-xl p-3 border border-blue-100 shadow-xs flex items-center justify-between text-[11px] animate-in fade-in">
                <div>
                  <span className="font-bold text-[#1d5bf0] block">{activeHotspot.label}</span>
                  <span className="text-slate-600 font-medium">
                    {activeHotspot.parameter}: <strong className="text-slate-900">{activeHotspot.value}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveHotspot(null)}
                  className="text-slate-400 hover:text-slate-700 text-[10px] font-bold px-2 py-1 rounded bg-slate-100"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT SECTION: Conditions Grid, Schedule & Body (7 cols) ================= */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Upper Row: 2x2 My Heart Condition Grid + My Schedule Panel */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* My Heart Condition (4-Card Grid) - 7 cols */}
            <div className="md:col-span-7 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1d5bf0]" />
                <h3 className="text-[14px] font-bold text-slate-900 tracking-tight">
                  My Heart Condition
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Card 1: Blood Status */}
                <div className="bg-white rounded-2xl p-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between h-[110px]">
                  <div className="flex items-center justify-between">
                    <Droplet className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] font-semibold text-slate-400">Blood Status</span>
                  </div>
                  <div className="font-bold text-[15px] text-slate-900">
                    {sbp}/{dbp}
                  </div>
                  {/* Vertical bar sparkline */}
                  <div className="flex items-end gap-1.5 h-6">
                    {[10, 16, 12, 20, 14, 18, 22].map((h, i) => (
                      <div
                        key={i}
                        className="w-1.5 rounded-full bg-slate-200"
                        style={{ height: `${h}px` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Card 2: Heart Rate (Active Blue Accent Card) */}
                <div className="bg-[#1d5bf0] text-white rounded-2xl p-3.5 shadow-[0_8px_20px_rgba(29,91,240,0.25)] flex flex-col justify-between h-[110px] relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <Heart className="w-3.5 h-3.5 fill-white" />
                    <span className="text-[11px] font-semibold text-white/80">Heart Rate</span>
                  </div>
                  <div className="font-bold text-[16px]">
                    {heartRate} <span className="text-[11px] font-normal">bpm</span>
                  </div>
                  {/* White ECG wave trace */}
                  <div className="w-full h-6">
                    <svg viewBox="0 0 100 25" className="w-full h-full text-white">
                      <path
                        d="M 0 12 L 20 12 L 25 18 L 32 3 L 38 22 L 44 8 L 50 12 L 70 12 L 75 18 L 82 3 L 88 22 L 94 8 L 100 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Card 3: Blood Count */}
                <div className="bg-white rounded-2xl p-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between h-[110px]">
                  <div className="flex items-center justify-between">
                    <Activity className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] font-semibold text-slate-400">Blood Count</span>
                  </div>
                  <div className="font-bold text-[15px] text-slate-900">
                    {bloodCount}
                  </div>
                  {/* Wave sparkline */}
                  <div className="w-full h-6">
                    <svg viewBox="0 0 100 25" className="w-full h-full text-slate-300">
                      <path
                        d="M 0 18 Q 25 6 50 14 T 100 10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Card 4: Glucose Level */}
                <div className="bg-white rounded-2xl p-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between h-[110px]">
                  <div className="flex items-center justify-between">
                    <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] font-semibold text-slate-400">Glucose Level</span>
                  </div>
                  <div className="font-bold text-[15px] text-slate-900">
                    {glucose}
                  </div>
                  {/* Subtle sparkline */}
                  <div className="w-full h-6">
                    <svg viewBox="0 0 100 25" className="w-full h-full text-slate-300">
                      <path
                        d="M 0 20 L 25 15 L 50 18 L 75 8 L 100 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* My Schedule (5 cols) */}
            <div className="md:col-span-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1d5bf0]" />
                <h3 className="text-[14px] font-bold text-slate-900 tracking-tight">
                  My Schedule
                </h3>
              </div>

              <div className="bg-white rounded-3xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between gap-3">
                {/* Next Checkup Pill */}
                <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Next Checkup</span>
                    <span className="text-[12px] font-bold text-slate-900">Fri, 24 Mar</span>
                  </div>
                </div>

                {/* Date Navigation Pill */}
                <div className="flex items-center justify-between bg-slate-50 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-slate-700">
                  <button
                    type="button"
                    onClick={() => setCurrentDateIndex((prev) => Math.max(0, prev - 1))}
                    className="hover:text-slate-900 p-0.5"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span>{dates[currentDateIndex]}</span>
                  <button
                    type="button"
                    onClick={() => setCurrentDateIndex((prev) => Math.min(dates.length - 1, prev + 1))}
                    className="hover:text-slate-900 p-0.5"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Doctor Consult Roster */}
                <div className="flex flex-col gap-2">
                  {doctors.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[12px]">
                      <img
                        src={doc.avatar}
                        alt={doc.name}
                        className="w-6 h-6 rounded-full object-cover border border-slate-200"
                      />
                      <span className="font-semibold text-slate-800 truncate">{doc.name}</span>
                    </div>
                  ))}
                </div>

                {/* Consult Now Blue Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowConsultModal(true);
                    onConsultNow?.();
                  }}
                  className="w-full py-2.5 rounded-2xl bg-[#1d5bf0] hover:bg-blue-700 text-white font-bold text-[12px] flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <span>Consult Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: • My Body Condition Organ Carousel */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1d5bf0]" />
                <h3 className="text-[14px] font-bold text-slate-900 tracking-tight">
                  My Body Condition
                </h3>
              </div>

              {/* Carousel Arrows */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="w-6 h-6 rounded-full bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center shadow-xs border border-slate-200 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="w-6 h-6 rounded-full bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center shadow-xs border border-slate-200 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Organ Carousel Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {bodyOrgans.map((organ) => {
                const isSelected = selectedBodyOrgan === organ.id;
                return (
                  <div
                    key={organ.id}
                    onClick={() => {
                      setSelectedBodyOrgan(organ.id);
                      onSelectOrgan?.(organ.id);
                    }}
                    className={`rounded-3xl p-3 flex flex-col items-center justify-between transition-all cursor-pointer relative h-[140px] ${
                      isSelected
                        ? 'bg-white shadow-[0_8px_24px_rgba(29,91,240,0.14)] ring-2 ring-[#1d5bf0]'
                        : 'bg-white/80 hover:bg-white shadow-xs border border-slate-100'
                    }`}
                  >
                    <div className="w-16 h-16 flex items-center justify-center">
                      <img
                        src={organ.image}
                        alt={organ.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    <div className="w-full flex items-center justify-between pt-1">
                      <span className="text-[12px] font-bold text-slate-800">
                        {organ.name}
                      </span>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-lg bg-[#1d5bf0] text-white flex items-center justify-center shadow-2xs">
                          <ArrowRight className="w-3.5 h-3.5 -rotate-45" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Booking / Consult Modal */}
      {showConsultModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/25 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-[16px]">
                Instant Doctor Consultation
              </h3>
              <button
                onClick={() => setShowConsultModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4 text-[12px] text-slate-700">
              <p className="font-bold text-slate-900 mb-1">
                Selected Date: {dates[currentDateIndex]}
              </p>
              Direct bridge to Dr. Hanzer Jon (Senior Cardiologist). Live biophysical telemetry and ECG oscilloscope will be shared automatically.
            </div>

            <button
              onClick={() => {
                alert('Teleconsultation session requested! Waiting for doctor confirmation.');
                setShowConsultModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-[#1d5bf0] hover:bg-blue-700 text-white font-bold text-[13px] flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              Confirm Appointment
            </button>
          </div>
        </div>
      )}

      {/* Cardiac animation */}
      <style>{`
        @keyframes cardiacBeat {
          0%, 100% {
            transform: scale(1);
          }
          15% {
            transform: scale(1.04);
          }
          30% {
            transform: scale(0.99);
          }
          45% {
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
}
