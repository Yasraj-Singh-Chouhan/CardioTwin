import { useState } from 'react';
import {
  Download,
  Plus,
  Minus,
  Phone,
  MessageSquare,
  Mail,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Star,
  Sparkles,
} from 'lucide-react';

interface FullBodyHeartViewProps {
  patientName?: string;
  heartRate?: number;
  sbp?: number;
  dbp?: number;
  glucose?: number;
  bloodSugar?: string;
  onOpenDoctorModal?: (doctor: DoctorInfo) => void;
  onOpenMedicationModal?: (med: MedicationInfo) => void;
}

export interface DoctorInfo {
  name: string;
  specialty: string;
  rating: number;
  availability: string;
  avatar: string;
  phone: string;
  email: string;
}

export interface MedicationInfo {
  name: string;
  generic: string;
  status: 'Adherent' | 'Not Adherent';
  startDate: string;
  dosage: string;
  frequency: string;
}

export function FullBodyHeartView({
  patientName: _patientName = 'Jacqueline Delaney',
  heartRate = 92,
  sbp = 124,
  dbp = 80,
  glucose = 230,
  bloodSugar = '120/160',
  onOpenDoctorModal,
  onOpenMedicationModal,
}: FullBodyHeartViewProps) {
  // Zoom state for 3D Heart
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedOrgan, setSelectedOrgan] = useState<'lungs' | 'heart' | 'blood' | 'kidneys'>('heart');
  const [medicationIndex, setMedicationIndex] = useState<number>(0);
  const [activeCallDoctor, setActiveCallDoctor] = useState<DoctorInfo | null>(null);

  const doctors: DoctorInfo[] = [
    {
      name: 'Dr. Hella Binny',
      specialty: 'Diabetologist',
      rating: 5.0,
      availability: 'Available From 1:30 PM - 8:30 PM',
      avatar: '/assets/inspiration/doctor_hella.jpg',
      phone: '+91 98450 12345',
      email: 'dr.binny@cardiotwin.ai',
    },
    {
      name: 'Dr. Will Banner',
      specialty: 'Heart Specialist',
      rating: 4.0,
      availability: 'Available From 3:30 PM - 8:30 PM',
      avatar: '/assets/inspiration/doctor_will.jpg',
      phone: '+91 98450 67890',
      email: 'dr.banner@cardiotwin.ai',
    },
  ];

  const medications: MedicationInfo[] = [
    {
      name: 'Amaryl 1 mg',
      generic: 'Glimepiride 1 mg',
      status: 'Not Adherent',
      startDate: '01/12/2024',
      dosage: '1 tablet with breakfast',
      frequency: 'Once Daily',
    },
    {
      name: 'Panadol 100 mg',
      generic: 'Vitacid 100 mg',
      status: 'Adherent',
      startDate: '01/12/2024',
      dosage: '100 mg PRN for mild distress',
      frequency: 'As Needed',
    },
    {
      name: 'Ramipril 5 mg',
      generic: 'ACE Inhibitor',
      status: 'Adherent',
      startDate: '15/11/2024',
      dosage: '5 mg orally at bedtime',
      frequency: 'Once Daily',
    },
  ];

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(1.5, Math.max(0.75, +(prev + delta).toFixed(2))));
  };

  const handleNextMed = () => {
    setMedicationIndex((prev) => (prev + 1) % medications.length);
  };

  const handlePrevMed = () => {
    setMedicationIndex((prev) => (prev - 1 + medications.length) % medications.length);
  };

  const currentMedSlice = [
    medications[medicationIndex],
    medications[(medicationIndex + 1) % medications.length],
  ];

  return (
    <div className="w-full bg-[#f4f7fb] text-[#1c2738] rounded-3xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-slate-200/80 relative overflow-hidden font-sans select-none transition-all duration-300">
      {/* Top Breadcrumb & Organ Selector Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative z-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[15px] font-medium">
          <button
            onClick={() => setSelectedOrgan('heart')}
            className="text-slate-500 hover:text-slate-800 transition-colors underline-offset-4 hover:underline"
          >
            Full Body
          </button>
          <span className="text-slate-400">/</span>
          <span className="font-bold text-[#1d5bf0] tracking-tight">Heart Details</span>
        </div>

        {/* Organ Selector Pills */}
        <div className="flex items-center gap-3">
          {/* Lungs */}
          <button
            type="button"
            onClick={() => setSelectedOrgan('lungs')}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center p-1.5 transition-all duration-200 ${
              selectedOrgan === 'lungs'
                ? 'bg-white shadow-[0_8px_20px_rgba(29,91,240,0.18)] ring-2 ring-[#1d5bf0] scale-105'
                : 'bg-white/80 hover:bg-white shadow-xs hover:shadow-sm border border-slate-200/60'
            }`}
            title="Lungs"
          >
            <img
              src="/assets/inspiration/organ_lungs.jpg"
              alt="Lungs"
              className="w-full h-full object-contain"
            />
          </button>

          {/* Heart (Active default) */}
          <button
            type="button"
            onClick={() => setSelectedOrgan('heart')}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center p-1.5 transition-all duration-200 relative ${
              selectedOrgan === 'heart'
                ? 'bg-white shadow-[0_8px_20px_rgba(29,91,240,0.22)] ring-2 ring-[#1d5bf0] scale-105'
                : 'bg-white/80 hover:bg-white shadow-xs hover:shadow-sm border border-slate-200/60'
            }`}
            title="Heart Details"
          >
            <img
              src="/assets/inspiration/heart_3d.jpg"
              alt="Heart"
              className="w-full h-full object-contain"
            />
            {selectedOrgan === 'heart' && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#1d5bf0] rounded-full border-2 border-white animate-pulse" />
            )}
          </button>

          {/* Blood */}
          <button
            type="button"
            onClick={() => setSelectedOrgan('blood')}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center p-1.5 transition-all duration-200 ${
              selectedOrgan === 'blood'
                ? 'bg-white shadow-[0_8px_20px_rgba(29,91,240,0.18)] ring-2 ring-[#1d5bf0] scale-105'
                : 'bg-white/80 hover:bg-white shadow-xs hover:shadow-sm border border-slate-200/60'
            }`}
            title="Blood Cells"
          >
            <img
              src="/assets/inspiration/organ_blood.jpg"
              alt="Blood Cells"
              className="w-full h-full object-contain"
            />
          </button>

          {/* Kidneys */}
          <button
            type="button"
            onClick={() => setSelectedOrgan('kidneys')}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center p-1.5 transition-all duration-200 ${
              selectedOrgan === 'kidneys'
                ? 'bg-white shadow-[0_8px_20px_rgba(29,91,240,0.18)] ring-2 ring-[#1d5bf0] scale-105'
                : 'bg-white/80 hover:bg-white shadow-xs hover:shadow-sm border border-slate-200/60'
            }`}
            title="Kidneys"
          >
            <img
              src="/assets/inspiration/organ_kidneys.jpg"
              alt="Kidneys"
              className="w-full h-full object-contain"
            />
          </button>
        </div>
      </div>

      {/* Main 3-Column Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative min-h-[580px]">
        {/* ================= LEFT COLUMN: Available Doctors & Medications ================= */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-5 z-20">
          {/* Available Doctors Section */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[15px] font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <span>Available Doctors</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </h3>

            <div className="flex flex-col gap-3">
              {doctors.map((doc, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-slate-100 hover:border-slate-300 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={doc.avatar}
                        alt={doc.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 group-hover:scale-105 transition-transform"
                      />
                      <div>
                        <h4 className="text-[14px] font-bold text-slate-900 leading-tight">
                          {doc.name}
                        </h4>
                        <p className="text-[12px] text-slate-500 font-medium">
                          {doc.specialty}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-[#257953] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                      <span>{doc.rating.toFixed(1)}</span>
                      <Star className="w-3 h-3 fill-current text-white" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {doc.availability}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCallDoctor(doc);
                          onOpenDoctorModal?.(doc);
                        }}
                        className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1d5bf0] flex items-center justify-center transition-colors shadow-2xs"
                        title="Voice Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCallDoctor(doc);
                          onOpenDoctorModal?.(doc);
                        }}
                        className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1d5bf0] flex items-center justify-center transition-colors shadow-2xs"
                        title="Chat Consultation"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCallDoctor(doc);
                          onOpenDoctorModal?.(doc);
                        }}
                        className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1d5bf0] flex items-center justify-center transition-colors shadow-2xs"
                        title="Email Telemetry Record"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medications Section */}
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-slate-800 tracking-tight">
                Medications
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMed}
                  className="w-6 h-6 rounded-full bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center shadow-xs border border-slate-200 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMed}
                  className="w-6 h-6 rounded-full bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center shadow-xs border border-slate-200 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {currentMedSlice.map((med, idx) => (
                <div
                  key={idx}
                  onClick={() => onOpenMedicationModal?.(med)}
                  className="bg-white rounded-2xl p-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center justify-between hover:border-slate-300 transition-all cursor-pointer"
                >
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900 leading-snug">
                      {med.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {med.generic}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[11px] font-bold block ${
                        med.status === 'Adherent'
                          ? 'text-[#257953]'
                          : 'text-rose-600'
                      }`}
                    >
                      Status: {med.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Start Date: {med.startDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= CENTER COLUMN: Anatomical Torso & 3D Heart ================= */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[460px] py-4">
          {/* Subtle Torso Silhouette Backdrop */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60">
            <img
              src="/assets/inspiration/torso_silhouette.jpg"
              alt="Anatomical Torso"
              className="w-full max-w-[500px] h-full max-h-[520px] object-contain mix-blend-multiply filter blur-[0.4px]"
            />
          </div>

          {/* Heart Mediastinum Container with Concentric Pulse Radii */}
          <div
            className="relative flex items-center justify-center z-10 transition-transform duration-300 ease-out"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Concentric Telemetry Ripple Rings */}
            <div
              className="absolute w-64 h-64 rounded-full border border-blue-400/30 pointer-events-none"
              style={{
                animation: 'sonicRipple 2.4s cubic-bezier(0.2, 0.8, 0.2, 1) infinite',
              }}
            />
            <div
              className="absolute w-72 h-72 rounded-full border border-blue-300/20 pointer-events-none"
              style={{
                animation: 'sonicRipple 2.4s cubic-bezier(0.2, 0.8, 0.2, 1) infinite 0.8s',
              }}
            />
            <div
              className="absolute w-80 h-80 rounded-full border border-blue-200/15 pointer-events-none"
              style={{
                animation: 'sonicRipple 2.4s cubic-bezier(0.2, 0.8, 0.2, 1) infinite 1.6s',
              }}
            />

            {/* Glowing Soft Backdrop Halo */}
            <div className="absolute w-56 h-56 rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />

            {/* Realistic 3D Anatomical Heart Image */}
            <div className="relative group cursor-pointer">
              <img
                src={
                  selectedOrgan === 'lungs'
                    ? '/assets/inspiration/organ_lungs.jpg'
                    : selectedOrgan === 'blood'
                    ? '/assets/inspiration/organ_blood.jpg'
                    : selectedOrgan === 'kidneys'
                    ? '/assets/inspiration/organ_kidneys.jpg'
                    : '/assets/inspiration/heart_3d.jpg'
                }
                alt="3D Heart Model"
                className="w-64 h-64 sm:w-72 sm:h-72 object-contain drop-shadow-[0_16px_32px_rgba(29,91,240,0.18)] transition-all duration-300 group-hover:scale-105"
                style={{
                  animation: 'cardiacPulse 1.2s ease-in-out infinite',
                }}
              />

              {/* Heartbeat Status Dot */}
              <div className="absolute top-8 right-6 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-200 shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[11px] font-bold text-slate-800">
                  {heartRate} bpm
                </span>
              </div>
            </div>
          </div>

          {/* Floating Zoom / Scale Controls at Bottom Center */}
          <div className="absolute bottom-2 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-slate-200/80 z-20">
            <button
              type="button"
              onClick={() => handleZoom(-0.1)}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors font-bold text-[14px]"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold text-slate-500 px-1">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => handleZoom(0.1)}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors font-bold text-[14px]"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: 4 Vitals Sparkline Cards ================= */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-3.5 z-20">
          {/* Card 1: Heart Rate */}
          <div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-slate-100 hover:border-slate-300 transition-all flex flex-col justify-between h-[125px]">
            <div className="flex items-start justify-between">
              <button
                type="button"
                className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
                title="Download Telemetry Series"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Heart Rate
                </span>
                <div className="flex items-center justify-end gap-1 font-bold text-[14px] text-slate-900">
                  <span>{heartRate} bpm</span>
                  <ArrowUp className="w-3.5 h-3.5 text-rose-500" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1">
              {/* Animated ECG wave SVG */}
              <div className="w-28 h-8">
                <svg viewBox="0 0 100 30" className="w-full h-full text-[#1d5bf0]">
                  <path
                    d="M 0 15 L 20 15 L 25 22 L 32 3 L 38 27 L 44 10 L 50 15 L 70 15 L 75 22 L 82 3 L 88 27 L 94 10 L 100 15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="bg-[#1d5bf0] text-white text-[11px] font-bold px-2 py-1.5 rounded-xl shadow-2xs leading-none">
                {heartRate} <span className="text-[9px] font-normal">bpm</span>
              </div>
            </div>
          </div>

          {/* Card 2: Blood Sugar */}
          <div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-slate-100 hover:border-slate-300 transition-all flex flex-col justify-between h-[125px]">
            <div className="flex items-start justify-between">
              <button
                type="button"
                className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
                title="Download Telemetry Series"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Blood Sugar
                </span>
                <div className="flex items-center justify-end gap-1 font-bold text-[14px] text-slate-900">
                  <span>{bloodSugar} mg/dL</span>
                  <ArrowDown className="w-3.5 h-3.5 text-rose-500" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1">
              {/* Smooth wave sparkline */}
              <div className="w-28 h-8">
                <svg viewBox="0 0 100 30" className="w-full h-full text-slate-200">
                  <path
                    d="M 0 20 Q 25 5 50 18 T 100 15 L 100 30 L 0 30 Z"
                    fill="currentColor"
                    opacity="0.5"
                  />
                  <path
                    d="M 0 20 Q 25 5 50 18 T 100 15"
                    fill="none"
                    stroke="#b4c0cf"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>

              <div className="bg-[#e9edf5] text-slate-700 text-[11px] font-bold px-2 py-1 rounded-xl leading-none text-center">
                92 <span className="text-[9px] font-normal block text-slate-500">mg/dL</span>
              </div>
            </div>
          </div>

          {/* Card 3: Blood Pressure */}
          <div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-slate-100 hover:border-slate-300 transition-all flex flex-col justify-between h-[125px]">
            <div className="flex items-start justify-between">
              <button
                type="button"
                className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
                title="Download Telemetry Series"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Blood Pressure
                </span>
                <div className="flex items-center justify-end gap-1 font-bold text-[14px] text-slate-900">
                  <span>{sbp}/{dbp}</span>
                  <ArrowUp className="w-3.5 h-3.5 text-rose-500" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1">
              {/* Bar sparkline bars */}
              <div className="flex items-end gap-1.5 h-7 pl-1">
                {[14, 18, 12, 22, 16, 20, 24, 19].map((height, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-slate-300/80"
                    style={{ height: `${height}px` }}
                  />
                ))}
              </div>

              <div className="bg-[#e9edf5] text-slate-800 text-[11px] font-bold px-2.5 py-1.5 rounded-xl leading-tight text-center">
                <span>{sbp}</span>
                <span className="text-slate-400 block text-[9px]">/{dbp}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Glucose Level */}
          <div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-slate-100 hover:border-slate-300 transition-all flex flex-col justify-between h-[125px]">
            <div className="flex items-start justify-between">
              <button
                type="button"
                className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
                title="Download Telemetry Series"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Glucose Level
                </span>
                <div className="flex items-center justify-end gap-1 font-bold text-[14px] text-slate-900">
                  <span>{glucose} mL</span>
                  <ArrowUp className="w-3.5 h-3.5 text-rose-500" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1">
              {/* Area sparkline */}
              <div className="w-28 h-8">
                <svg viewBox="0 0 100 30" className="w-full h-full text-slate-200">
                  <path
                    d="M 0 24 L 20 18 L 40 22 L 60 12 L 80 15 L 100 8 L 100 30 L 0 30 Z"
                    fill="currentColor"
                    opacity="0.5"
                  />
                  <path
                    d="M 0 24 L 20 18 L 40 22 L 60 12 L 80 15 L 100 8"
                    fill="none"
                    stroke="#b4c0cf"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>

              <div className="bg-[#e9edf5] text-slate-800 text-[11px] font-bold px-2 py-1 rounded-xl leading-none text-center">
                {glucose} <span className="text-[9px] font-normal block text-slate-500">mL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Consultation Modal when clicking call/chat */}
      {activeCallDoctor && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={activeCallDoctor.avatar}
                  alt={activeCallDoctor.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-[16px]">
                    {activeCallDoctor.name}
                  </h3>
                  <p className="text-[12px] text-slate-500">
                    {activeCallDoctor.specialty} • {activeCallDoctor.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveCallDoctor(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-100 mb-4 text-[12px] text-slate-700">
              <p className="font-bold text-[#1d5bf0] mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Telemedicine Session Ready
              </p>
              Direct encrypted audio/video channel bridged with real-time continuous arterial tonometry stream ({heartRate} bpm, {sbp}/{dbp} mmHg).
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  alert(`Initiating clinical audio line with ${activeCallDoctor.name}...`);
                  setActiveCallDoctor(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#1d5bf0] hover:bg-blue-700 text-white font-bold text-[13px] flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Phone className="w-4 h-4" /> Start Direct Call
              </button>
              <button
                onClick={() => {
                  alert(`Opening messaging channel with ${activeCallDoctor.name}...`);
                  setActiveCallDoctor(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[13px] flex items-center justify-center gap-1.5 transition-all"
              >
                <MessageSquare className="w-4 h-4" /> Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Concentric Ripple and Heart Pulse */}
      <style>{`
        @keyframes sonicRipple {
          0% {
            transform: scale(0.75);
            opacity: 0.8;
          }
          50% {
            opacity: 0.35;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        @keyframes cardiacPulse {
          0%, 100% {
            transform: scale(1);
          }
          15% {
            transform: scale(1.045);
          }
          28% {
            transform: scale(0.985);
          }
          40% {
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
}
