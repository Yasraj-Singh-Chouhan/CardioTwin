import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Download,
  Phone,
  MessageSquare,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Users,
  ChevronDown,
} from 'lucide-react';

interface PatientProfile {
  id: string;
  name: string;
  age: number;
  sex: string;
  city: string;
  condition: string;
  heartRate: number;
  sbp: number;
  dbp: number;
  bloodSugar: string;
  glucoseLevel: number;
}

const DEMO_PATIENTS: PatientProfile[] = [
  {
    id: 'CT-3092',
    name: 'Jacqueline Delaney',
    age: 58,
    sex: 'Female',
    city: 'Bengaluru',
    condition: 'Continuous Heart Twin Active',
    heartRate: 78,
    sbp: 124,
    dbp: 80,
    bloodSugar: '120/160',
    glucoseLevel: 230,
  },
  {
    id: 'CT-0042',
    name: 'Ritu Mishra',
    age: 59,
    sex: 'Female',
    city: 'Delhi NCR',
    condition: 'Cardiovascular Remodeling Active',
    heartRate: 86,
    sbp: 158,
    dbp: 96,
    bloodSugar: '140/190',
    glucoseLevel: 265,
  },
  {
    id: 'CT-0001',
    name: 'Priya Joshi',
    age: 52,
    sex: 'Female',
    city: 'Mumbai',
    condition: 'Hypertension Stage 1 Monitoring',
    heartRate: 72,
    sbp: 130,
    dbp: 84,
    bloodSugar: '110/145',
    glucoseLevel: 195,
  },
  {
    id: 'CT-0009',
    name: 'Ramesh Bhat',
    age: 66,
    sex: 'Male',
    city: 'Chennai',
    condition: 'Post-PCI Secondary Surveillance',
    heartRate: 82,
    sbp: 152,
    dbp: 92,
    bloodSugar: '135/175',
    glucoseLevel: 240,
  },
  {
    id: 'CT-0016',
    name: 'Arvind Mishra',
    age: 63,
    sex: 'Male',
    city: 'Hyderabad',
    condition: 'Lifestyle Glycemic Optimization',
    heartRate: 68,
    sbp: 122,
    dbp: 78,
    bloodSugar: '105/135',
    glucoseLevel: 180,
  },
];

export default function PatientPortalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patientId = id || 'CT-3092';

  const currentPatient =
    DEMO_PATIENTS.find((p) => p.id === patientId) || DEMO_PATIENTS[0];

  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [medicationPage, setMedicationPage] = useState<number>(0);
  const [activeDoctorModal, setActiveDoctorModal] = useState<{
    name: string;
    specialty: string;
    avatar: string;
    time: string;
  } | null>(null);
  const [showMedModal, setShowMedModal] = useState<any | null>(null);

  const medications = [
    {
      name: 'Amaryl 1 mg',
      subtitle: 'Amaryl 1 mg',
      status: 'Not Adherent',
      startDate: '01/12/2024',
      dosage: '1 mg oral once daily with breakfast',
      indications: 'Type 2 Diabetes Mellitus glycemic control',
    },
    {
      name: 'Panadol 100 mg',
      subtitle: 'Vitacid 100 mg',
      status: 'Adherent',
      startDate: '01/12/2024',
      dosage: '100 mg oral as needed for mild discomfort',
      indications: 'Cardiopulmonary comfort and mild analgesia',
    },
    {
      name: 'Ramipril 5 mg',
      subtitle: 'Cardioprotective ACE-I',
      status: 'Adherent',
      startDate: '15/11/2024',
      dosage: '5 mg oral daily at bedtime',
      indications: 'Arterial hypertension and post-infarct remodeling',
    },
    {
      name: 'Atorvastatin 20 mg',
      subtitle: 'Lipid-lowering HMG-CoA',
      status: 'Adherent',
      startDate: '20/10/2024',
      dosage: '20 mg oral daily',
      indications: 'Atherosclerosis and plaque stabilization',
    },
  ];

  const handleNextMed = () => {
    setMedicationPage((prev) => (prev + 2) % medications.length);
  };

  const handlePrevMed = () => {
    setMedicationPage((prev) => (prev - 2 + medications.length) % medications.length);
  };

  const currentMeds = [
    medications[medicationPage % medications.length],
    medications[(medicationPage + 1) % medications.length],
  ];

  return (
    <div
      className="w-full min-h-screen relative flex flex-col justify-between p-6 sm:p-8 lg:p-10 select-none font-sans overflow-hidden antialiased text-slate-800"
      style={{
        backgroundColor: '#edf2f8',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* ======================================================================= */}
      {/* CENTER BACKGROUND: SMOOTH CLAY TORSO WITH RHYTHMIC BEATING HEART        */}
      {/* ======================================================================= */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="relative w-full max-w-[980px] h-full max-h-[720px] flex items-center justify-center">
          <img
            src="/assets/inspiration/torso_with_heart_exact.jpg"
            alt="Anatomical Male Torso with Heart"
            className="w-full h-full object-contain filter drop-shadow-[0_20px_45px_rgba(0,0,0,0.06)]"
          />

          {/* Concentric Electro-Acoustic Heartwave Rings */}
          <div className="absolute top-[46%] left-[63%] w-56 h-56 rounded-full border border-[#1d5bf0]/60 pointer-events-none animate-heartwave-1" />
          <div className="absolute top-[46%] left-[63%] w-72 h-72 rounded-full border border-blue-400/40 pointer-events-none animate-heartwave-2" />
          <div className="absolute top-[46%] left-[63%] w-88 h-88 rounded-full border border-sky-300/30 pointer-events-none animate-heartwave-3" />

          {/* Cardiac Systole/Diastole Contraction */}
          <div className="absolute top-[46%] left-[63%] -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full pointer-events-none animate-cardiac-pulse flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#1d5bf0]/20 via-rose-500/15 to-transparent blur-lg" />
          </div>

          {/* Telemetry BPM Badge */}
          <div className="absolute top-[37%] left-[68%] z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-slate-200/80 text-[11px] font-mono font-bold text-slate-800 animate-cardiac-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>{currentPatient.heartRate} bpm</span>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* TOP HEADER: PATIENT IDENTIFIER & DEMO PROFILE SWITCHER                  */}
      {/* ======================================================================= */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-slate-900 tracking-tight">
              Patient Portal
            </span>
            <span className="text-slate-400">/</span>
            <span className="font-bold text-[#1d5bf0] text-[15px] tracking-tight">
              {currentPatient.name}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1d5bf0] text-[10px] font-bold font-mono border border-blue-100 ml-1">
              {currentPatient.id}
            </span>
          </div>
          <p className="text-[12px] text-slate-500 font-medium mt-0.5 flex items-center gap-2">
            <span>{currentPatient.age}y {currentPatient.sex}</span>
            <span>&bull;</span>
            <span>{currentPatient.city}</span>
            <span>&bull;</span>
            <span className="text-slate-700 font-semibold">{currentPatient.condition}</span>
          </p>
        </div>

        {/* Right Header: Profile Switcher & Telemetry Badge */}
        <div className="flex items-center gap-3">
          {/* Profile Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileSwitcher((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] shadow-xs border border-slate-200/80 transition-all cursor-pointer"
              type="button"
            >
              <Users className="w-3.5 h-3.5 text-[#1d5bf0]" />
              <span>Switch Profile</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showProfileSwitcher && (
              <div className="absolute right-0 top-9 w-64 bg-white rounded-2xl p-2 shadow-xl border border-slate-100 z-50 animate-in fade-in">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 font-mono block">
                  Select Demo Patient Account:
                </span>
                <div className="flex flex-col gap-1 mt-1">
                  {DEMO_PATIENTS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setShowProfileSwitcher(false);
                        navigate(`/patient/${p.id}`);
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer w-full ${
                        p.id === currentPatient.id
                          ? 'bg-blue-50 text-[#1d5bf0] font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                      type="button"
                    >
                      <div>
                        <div className="text-[12px] font-bold">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {p.id} &bull; {p.age}y {p.sex} &bull; {p.city}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#1d5bf0] font-bold">
                        {p.heartRate} bpm
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 shadow-2xs border border-slate-200/80 text-[11px] font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Wearable Live &bull; 1 Hz Telemetry Sync</span>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* MAIN BODY ROW: LEFT DOCTORS/MEDS, CENTER TORSO, RIGHT VITALS            */}
      {/* ======================================================================= */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start my-auto py-2">
        {/* ================= LEFT OVERLAY COLUMN (4 COLS) ================= */}
        <div className="lg:col-span-4 flex flex-col gap-6 max-w-[360px]">
          {/* Section 1: Available Doctors */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[14px] font-bold text-slate-800 tracking-tight">
              Available Doctors
            </h3>

            <div className="flex flex-col gap-3">
              {/* Doctor 1: Dr. Hella Binny */}
              <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/90 hover:border-slate-200 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/inspiration/doctor_hella.jpg"
                      alt="Dr. Hella Binny"
                      className="w-11 h-11 rounded-xl object-cover border border-slate-100 shadow-2xs"
                    />
                    <div>
                      <h4 className="text-[13px] font-bold text-slate-900 leading-tight">
                        Dr. Hella Binny
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Diabetologist
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#247953] text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                    <span>5.0</span>
                    <span>★</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-400 font-medium">
                    Available From 1:30 PM - 8:30 PM
                  </span>

                  <div className="flex items-center gap-2 text-[#1d5bf0]">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDoctorModal({
                          name: 'Dr. Hella Binny',
                          specialty: 'Diabetologist',
                          avatar: '/assets/inspiration/doctor_hella.jpg',
                          time: 'Available From 1:30 PM - 8:30 PM',
                        })
                      }
                      className="hover:scale-110 transition-transform"
                      title="Voice Call"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDoctorModal({
                          name: 'Dr. Hella Binny',
                          specialty: 'Diabetologist',
                          avatar: '/assets/inspiration/doctor_hella.jpg',
                          time: 'Available From 1:30 PM - 8:30 PM',
                        })
                      }
                      className="hover:scale-110 transition-transform"
                      title="Chat Message"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDoctorModal({
                          name: 'Dr. Hella Binny',
                          specialty: 'Diabetologist',
                          avatar: '/assets/inspiration/doctor_hella.jpg',
                          time: 'Available From 1:30 PM - 8:30 PM',
                        })
                      }
                      className="hover:scale-110 transition-transform"
                      title="Email Patient Record"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Doctor 2: Dr. Will Banner */}
              <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/90 hover:border-slate-200 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/inspiration/doctor_will.jpg"
                      alt="Dr. Will Banner"
                      className="w-11 h-11 rounded-xl object-cover border border-slate-100 shadow-2xs"
                    />
                    <div>
                      <h4 className="text-[13px] font-bold text-slate-900 leading-tight">
                        Dr. Will Banner
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Heart Specialist
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#247953] text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                    <span>4.0</span>
                    <span>★</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-400 font-medium">
                    Available From 3:30 PM - 8:30 PM
                  </span>

                  <div className="flex items-center gap-2 text-[#1d5bf0]">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDoctorModal({
                          name: 'Dr. Will Banner',
                          specialty: 'Heart Specialist',
                          avatar: '/assets/inspiration/doctor_will.jpg',
                          time: 'Available From 3:30 PM - 8:30 PM',
                        })
                      }
                      className="hover:scale-110 transition-transform"
                      title="Voice Call"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDoctorModal({
                          name: 'Dr. Will Banner',
                          specialty: 'Heart Specialist',
                          avatar: '/assets/inspiration/doctor_will.jpg',
                          time: 'Available From 3:30 PM - 8:30 PM',
                        })
                      }
                      className="hover:scale-110 transition-transform"
                      title="Chat Message"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDoctorModal({
                          name: 'Dr. Will Banner',
                          specialty: 'Heart Specialist',
                          avatar: '/assets/inspiration/doctor_will.jpg',
                          time: 'Available From 3:30 PM - 8:30 PM',
                        })
                      }
                      className="hover:scale-110 transition-transform"
                      title="Email Patient Record"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Medications */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-slate-800 tracking-tight">
                Medications
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMed}
                  className="w-6 h-6 rounded-full bg-white hover:bg-slate-100 text-slate-500 flex items-center justify-center shadow-xs border border-slate-200/80 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMed}
                  className="w-6 h-6 rounded-full bg-white hover:bg-slate-100 text-slate-500 flex items-center justify-center shadow-xs border border-slate-200/80 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {currentMeds.map((med, idx) => (
                <div
                  key={idx}
                  onClick={() => setShowMedModal(med)}
                  className="bg-white rounded-2xl p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/90 hover:border-slate-200 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900 leading-tight">
                      {med.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      {med.subtitle}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      Status: {med.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                      Start Date: {med.startDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Spacer for Center Torso */}
        <div className="lg:col-span-5 pointer-events-none" />

        {/* ================= RIGHT VITAL METRIC CARDS (3 COLS) ================= */}
        <div className="lg:col-span-3 flex flex-col gap-3 max-w-[240px] ml-auto">
          {/* Card 1: Heart Rate */}
          <div className="bg-white rounded-2xl p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between h-[120px]">
            <div className="flex items-start justify-between">
              <button
                type="button"
                className="w-6 h-6 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
                title="Export Metric"
              >
                <Download className="w-3 h-3" />
              </button>
              <div className="text-right">
                <span className="text-[10px] font-semibold text-slate-400 block">
                  Heart Rate
                </span>
                <div className="flex items-center justify-end gap-1 font-bold text-[13px] text-slate-900">
                  <span>{currentPatient.heartRate} bpm</span>
                  <span className="text-rose-500 text-[10px]">▲</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1">
              <div className="w-24 h-7">
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

              <div className="bg-[#1d5bf0] text-white text-[11px] font-bold px-2 py-1 rounded-xl shadow-2xs leading-none">
                {currentPatient.heartRate} <span className="text-[9px] font-normal">bpm</span>
              </div>
            </div>
          </div>

          {/* Card 2: Blood Sugar */}
          <div className="bg-white rounded-2xl p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between h-[120px]">
            <div className="flex items-start justify-between">
              <button
                type="button"
                className="w-6 h-6 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
                title="Export Metric"
              >
                <Download className="w-3 h-3" />
              </button>
              <div className="text-right">
                <span className="text-[10px] font-semibold text-slate-400 block">
                  Blood Sugar
                </span>
                <div className="flex items-center justify-end gap-1 font-bold text-[13px] text-slate-900">
                  <span>{currentPatient.bloodSugar} mg/dL</span>
                  <span className="text-rose-500 text-[10px]">▼</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1">
              <div className="w-24 h-7">
                <svg viewBox="0 0 100 25" className="w-full h-full text-slate-200">
                  <path
                    d="M 0 18 Q 25 4 50 15 T 100 12 L 100 25 L 0 25 Z"
                    fill="currentColor"
                  />
                  <path
                    d="M 0 18 Q 25 4 50 15 T 100 12"
                    fill="none"
                    stroke="#c8d2df"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>

              <div className="bg-[#e9edf5] text-slate-700 text-[11px] font-bold px-2 py-1 rounded-xl leading-none text-center">
                92 <span className="text-[9px] font-normal block text-slate-400">mg/dL</span>
              </div>
            </div>
          </div>

          {/* Card 3: Blood Pressure */}
          <div className="bg-white rounded-2xl p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between h-[120px]">
            <div className="flex items-start justify-between">
              <button
                type="button"
                className="w-6 h-6 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
                title="Export Metric"
              >
                <Download className="w-3 h-3" />
              </button>
              <div className="text-right">
                <span className="text-[10px] font-semibold text-slate-400 block">
                  Blood Pressure
                </span>
                <div className="flex items-center justify-end gap-1 font-bold text-[13px] text-slate-900">
                  <span>{currentPatient.sbp}/{currentPatient.dbp}</span>
                  <span className="text-rose-500 text-[10px]">▲</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1">
              <div className="flex items-end gap-1 h-6 pl-1">
                {[12, 16, 10, 20, 14, 18, 22, 15].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-slate-200"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>

              <div className="bg-[#e9edf5] text-slate-800 text-[11px] font-bold px-2 py-1 rounded-xl leading-tight text-center">
                <span>{currentPatient.sbp}</span>
                <span className="text-slate-400 block text-[9px]">/{currentPatient.dbp}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Glucose Level */}
          <div className="bg-white rounded-2xl p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between h-[120px]">
            <div className="flex items-start justify-between">
              <button
                type="button"
                className="w-6 h-6 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
                title="Export Metric"
              >
                <Download className="w-3 h-3" />
              </button>
              <div className="text-right">
                <span className="text-[10px] font-semibold text-slate-400 block">
                  Glucose Level
                </span>
                <div className="flex items-center justify-end gap-1 font-bold text-[13px] text-slate-900">
                  <span>{currentPatient.glucoseLevel} mL</span>
                  <span className="text-rose-500 text-[10px]">▲</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1">
              <div className="w-24 h-7">
                <svg viewBox="0 0 100 25" className="w-full h-full text-slate-200">
                  <path
                    d="M 0 20 L 20 15 L 40 18 L 60 10 L 80 14 L 100 6 L 100 25 L 0 25 Z"
                    fill="currentColor"
                  />
                  <path
                    d="M 0 20 L 20 15 L 40 18 L 60 10 L 80 14 L 100 6"
                    fill="none"
                    stroke="#c8d2df"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>

              <div className="bg-[#e9edf5] text-slate-800 text-[11px] font-bold px-2 py-1 rounded-xl leading-none text-center">
                {currentPatient.glucoseLevel} <span className="text-[9px] font-normal block text-slate-400">mL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Consultation Modal */}
      {activeDoctorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/25 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={activeDoctorModal.avatar}
                  alt={activeDoctorModal.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-[15px]">
                    {activeDoctorModal.name}
                  </h3>
                  <p className="text-[12px] text-slate-500">
                    {activeDoctorModal.specialty}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveDoctorModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
                type="button"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100 mb-4 text-[11px] text-slate-700">
              <p className="font-bold text-[#1d5bf0] mb-0.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> {activeDoctorModal.time}
              </p>
              Direct consultation line connected with continuous arterial telemetry ({currentPatient.heartRate} bpm, {currentPatient.sbp}/{currentPatient.dbp} mmHg).
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  alert(`Connecting voice call to ${activeDoctorModal.name}...`);
                  setActiveDoctorModal(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#1d5bf0] hover:bg-blue-700 text-white font-bold text-[12px] flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                type="button"
              >
                <Phone className="w-3.5 h-3.5" /> Call Doctor
              </button>
              <button
                onClick={() => {
                  alert(`Message sent to ${activeDoctorModal.name}.`);
                  setActiveDoctorModal(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[12px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                type="button"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Medication Details Modal */}
      {showMedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/25 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-[16px]">
                {showMedModal.name}
              </h3>
              <button
                onClick={() => setShowMedModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
                type="button"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 text-[12px] text-slate-700 mb-4">
              <div className="flex justify-between border-b pb-1 border-slate-100">
                <span className="text-slate-400 font-medium">Compliance:</span>
                <span className="font-bold text-slate-900">{showMedModal.status}</span>
              </div>
              <div className="flex justify-between border-b pb-1 border-slate-100">
                <span className="text-slate-400 font-medium">Regimen:</span>
                <span className="font-semibold text-slate-900">{showMedModal.dosage}</span>
              </div>
              <div className="flex justify-between border-b pb-1 border-slate-100">
                <span className="text-slate-400 font-medium">Indication:</span>
                <span className="font-semibold text-slate-900">{showMedModal.indications}</span>
              </div>
            </div>

            <button
              onClick={() => setShowMedModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[12px] transition-colors cursor-pointer"
              type="button"
            >
              Close Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
