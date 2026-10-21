import { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Phone,
  MessageSquare,
  Download,
  Heart,
  Activity,
  Thermometer,
  Droplet,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface PatientPathologyViewProps {
  onBack?: () => void;
  onScheduleVisit?: () => void;
}

export function PatientPathologyView({
  onBack,
  onScheduleVisit,
}: PatientPathologyViewProps) {
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [highlightAorta, setHighlightAorta] = useState<boolean>(true);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);

  const handlePrevAngle = () => {
    setRotationAngle((prev) => (prev - 45 + 360) % 360);
  };

  const handleNextAngle = () => {
    setRotationAngle((prev) => (prev + 45) % 360);
  };

  return (
    <div className="w-full bg-[#f4f7fa] text-[#1b2533] rounded-[36px] p-6 sm:p-8 shadow-[0_12px_45px_rgba(0,0,0,0.05)] border border-slate-200/70 relative select-none font-sans overflow-hidden">
      {/* ================= Header Bar ================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Back Link + Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 shadow-xs border border-slate-200/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">
            Patient Details
          </h2>
        </div>

        {/* Right Meta + Schedule a Visit Button */}
        <div className="flex items-center gap-4">
          <span className="text-[12px] text-slate-400 italic">
            Last updated on 08-12-2023
          </span>
          <button
            type="button"
            onClick={() => {
              setShowScheduleModal(true);
              onScheduleVisit?.();
            }}
            className="px-5 py-2.5 rounded-full bg-[#0c1524] hover:bg-[#18263d] text-white text-[12px] font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule a Visit</span>
          </button>
        </div>
      </div>

      {/* ================= Top Patient Profile Card ================= */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Patient Info & Contact Actions (5 cols) */}
          <div className="lg:col-span-5 flex items-center gap-5">
            <img
              src="/assets/inspiration/patient_jacqueline.jpg"
              alt="Jacqueline Delaney"
              className="w-20 h-20 rounded-full object-cover border-2 border-slate-100 shadow-sm"
            />
            <div>
              <h3 className="text-[20px] font-bold text-slate-900 leading-tight">
                Jacqueline Delaney
              </h3>
              <p className="text-[13px] text-slate-500 font-medium mt-0.5">
                Female, 1975 (68 years)
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 mt-3">
                {/* Green Phone Button */}
                <button
                  type="button"
                  onClick={() => alert('Dialing Jacqueline Delaney (+1 555-0192)...')}
                  className="w-8 h-8 rounded-xl bg-[#22c55e] hover:bg-emerald-600 text-white flex items-center justify-center shadow-xs transition-colors"
                  title="Phone Patient"
                >
                  <Phone className="w-4 h-4" />
                </button>

                {/* Message Bubble Button */}
                <button
                  type="button"
                  onClick={() => alert('Opening patient SMS/WhatsApp channel...')}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center shadow-xs transition-colors border border-slate-200/60"
                  title="Message Patient"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>

                {/* Download Record Pill Button */}
                <button
                  type="button"
                  onClick={() => alert('Downloading FHIR CCDA record...')}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] border border-slate-200 shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3 h-3 text-slate-500" />
                  <span>Download Record</span>
                </button>
              </div>
            </div>
          </div>

          {/* Categorized Disorders Tags (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-2.5 pl-0 lg:pl-6 lg:border-l lg:border-slate-100">
            <span className="text-[12px] font-bold text-slate-800 tracking-wide uppercase">
              Disorders
            </span>

            <div className="flex flex-col gap-1.5 text-[12px]">
              {/* Row 1: Cardiomyopathies */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-500 font-medium w-36">Cardiomyopathies:</span>
                <span className="px-3 py-1 rounded-full bg-[#f0f4fd] text-[#345fe8] font-bold text-[11px] border border-[#d8e4fc]">
                  Dilated Cardiomyopathy
                </span>
              </div>

              {/* Row 2: Arrhythmias */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-500 font-medium w-36">Arrhythmias:</span>
                <span className="px-3 py-1 rounded-full bg-[#f0f4fd] text-[#345fe8] font-bold text-[11px] border border-[#d8e4fc]">
                  Atrial Fibrillation
                </span>
                <span className="px-3 py-1 rounded-full bg-[#f0f4fd] text-[#345fe8] font-bold text-[11px] border border-[#d8e4fc]">
                  Bradycardia
                </span>
              </div>

              {/* Row 3: Aortic Diseases */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-500 font-medium w-36">Aortic Diseases:</span>
                <span className="px-3 py-1 rounded-full bg-[#f0f4fd] text-[#345fe8] font-bold text-[11px] border border-[#d8e4fc]">
                  Aortic Aneurysm
                </span>
                <span className="px-3 py-1 rounded-full bg-[#f0f4fd] text-[#345fe8] font-bold text-[11px] border border-[#d8e4fc]">
                  Aortic Dissection
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Bottom Grid: Heart Status + Blood Sugar + Vital Signs ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* ================= LEFT BIG PANEL: Heart Status with 3D Pathology (8 cols) ================= */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">
              Heart Status
            </h3>

            {/* Toggle pathology highlight button */}
            <button
              type="button"
              onClick={() => setHighlightAorta((prev) => !prev)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                highlightAorta
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {highlightAorta ? 'Pathology Highlight: Aorta (Active)' : 'Pathology Highlight: Off'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left Vitals Column (4 cols) */}
            <div className="md:col-span-4 flex flex-col gap-4">
              {/* Heart Rate Card */}
              <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold">Heart Rate</span>
                </div>
                <div className="font-bold text-[15px] text-slate-900 pl-1">
                  74 bpm
                </div>
                {/* Thin clean ECG line */}
                <div className="w-full h-5 pt-0.5">
                  <svg viewBox="0 0 100 20" className="w-full h-full text-slate-400">
                    <path
                      d="M 0 10 L 25 10 L 30 15 L 35 2 L 40 18 L 45 7 L 50 10 L 100 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
              </div>

              {/* Blood Count */}
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Blood Count</span>
                <span className="text-[14px] font-bold text-slate-900">80-90</span>
              </div>

              {/* Cholesterol */}
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Cholesterol</span>
                <span className="text-[14px] font-bold text-slate-900">225 <span className="text-[11px] font-normal text-slate-500">mg/dL</span></span>
              </div>

              {/* Blood Glucose Level */}
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Blood Glucose Level</span>
                <span className="text-[14px] font-bold text-slate-900">85 <span className="text-[11px] font-normal text-slate-500">mg/dL</span></span>
              </div>

              {/* Saturation */}
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Saturation</span>
                <span className="text-[14px] font-bold text-slate-900">83 <span className="text-[11px] font-normal text-slate-500">%</span></span>
              </div>
            </div>

            {/* Center 3D Heart with Aortic Highlight & Rotation Arc (8 cols) */}
            <div className="md:col-span-8 flex flex-col items-center justify-center relative min-h-[300px]">
              <div
                className="relative group w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center transition-transform duration-500"
                style={{ transform: `rotate(${rotationAngle}deg)` }}
              >
                <img
                  src={
                    highlightAorta
                      ? '/assets/inspiration/pathology_heart_aorta.jpg'
                      : '/assets/inspiration/heart_3d.jpg'
                  }
                  alt="Pathology Heart 3D"
                  className="w-full h-full object-contain drop-shadow-[0_16px_36px_rgba(235,50,50,0.25)]"
                />
              </div>

              {/* Rotation Arc Slider Controls (< >) */}
              <div className="flex flex-col items-center mt-3">
                {/* Arc SVG curve */}
                <div className="w-36 h-4 relative">
                  <svg viewBox="0 0 100 20" className="w-full h-full text-slate-300">
                    <path
                      d="M 5 5 Q 50 18 95 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Arrow navigation buttons */}
                <div className="flex items-center gap-2 -mt-1 bg-white px-2 py-0.5 rounded-full shadow-2xs border border-slate-200">
                  <button
                    type="button"
                    onClick={handlePrevAngle}
                    className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                    title="Rotate Counter-Clockwise"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[9px] font-mono text-slate-400">{rotationAngle}°</span>
                  <button
                    type="button"
                    onClick={handleNextAngle}
                    className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                    title="Rotate Clockwise"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT PANELS: Blood Sugar Donut & Vital Signs (4 cols) ================= */}
        <div className="lg:col-span-4 flex flex-col gap-6 justify-between">
          {/* Blood Sugar Donut Gauge Card */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between">
            <h3 className="text-[15px] font-bold text-slate-900 tracking-tight mb-2">
              Blood Sugar
            </h3>

            <div className="flex flex-col items-center justify-center py-2">
              {/* Circular Gauge Ring */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  {/* Background Track */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="12"
                  />
                  {/* Amber Progress Arc (e.g. 70% of perimeter) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={(2 * Math.PI * 48) * (1 - 0.7)}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Center Value */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-[28px] font-extrabold text-slate-900 leading-none">
                    126
                  </span>
                  <span className="text-[12px] font-semibold text-slate-600 mt-0.5">
                    mg/dL
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    (2 days ago)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Vital Signs Card */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between">
            <h3 className="text-[15px] font-bold text-slate-900 tracking-tight mb-3">
              Vital Signs
            </h3>

            <div className="flex flex-col gap-3.5">
              {/* Blood Pressure */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-2xs">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Blood Pressure</span>
                  <span className="text-[13px] font-bold text-slate-900">
                    120/80 <span className="text-[10px] font-normal text-slate-500">mmHg</span>
                  </span>
                </div>
              </div>

              {/* Body Temperature */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 shadow-2xs">
                  <Thermometer className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Body Temperature</span>
                  <span className="text-[13px] font-bold text-slate-900">
                    36.6 <span className="text-[10px] font-normal text-slate-500">°C</span>
                  </span>
                </div>
              </div>

              {/* Oxygen Saturation */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-2xs">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Oxygen Saturation (SpO2)</span>
                  <span className="text-[13px] font-bold text-slate-900">
                    97 <span className="text-[10px] font-normal text-slate-500">%</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule a Visit Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/25 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-[16px]">
                Schedule Clinic Visit for Jacqueline
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-[12px] text-slate-600 mb-4">
              Select available slot with Jacqueline Delaney&apos;s primary care cardiologist (Dr. Will Banner, Heart Specialist):
            </p>

            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <button
                type="button"
                className="p-2.5 rounded-xl border border-[#1d5bf0] bg-blue-50/50 text-[12px] font-bold text-[#1d5bf0] text-center"
              >
                Tomorrow • 10:30 AM
              </button>
              <button
                type="button"
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-[12px] font-medium text-slate-700 text-center"
              >
                Thu, 24 Oct • 2:00 PM
              </button>
            </div>

            <button
              onClick={() => {
                alert('Visit booked and appointment confirmation sent to patient!');
                setShowScheduleModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-[#1d5bf0] hover:bg-blue-700 text-white font-bold text-[13px] flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              Confirm Clinic Appointment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
