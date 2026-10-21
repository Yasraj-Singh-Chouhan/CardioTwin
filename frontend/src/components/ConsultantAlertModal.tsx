import { useState } from 'react';
import { MessageSquare, Copy, Check, X, ShieldAlert, PhoneCall } from 'lucide-react';
import type { PatientDetailResponse, TwinStateResponse, ClinicalAlert } from '../api/types';

interface ConsultantAlertModalProps {
  patient: PatientDetailResponse;
  twin: TwinStateResponse;
  alerts: ClinicalAlert[];
  currentSbp: number;
  currentDbp: number;
  currentHr: number;
  onClose: () => void;
}

export function ConsultantAlertModal({
  patient,
  twin,
  alerts,
  currentSbp,
  currentDbp,
  currentHr,
  onClose,
}: ConsultantAlertModalProps) {
  const [copied, setCopied] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');

  const currentMap = Math.round(currentDbp + (currentSbp - currentDbp) / 3);

  const messageText = `🚨 *URGENT CARDIAC CCU ALERT • CardioTwin*
Patient: *${patient.name}* (ID: ${patient.patient_id})
Age/Sex: ${patient.age}y ${patient.sex} | City: ${patient.city}

📊 *Current Hemodynamics:*
• Aortic BP: *${currentSbp}/${currentDbp} mmHg* (MAP: ${currentMap} mmHg)
• Heart Rate: *${currentHr} bpm*
• Biophysical Risk Score: *${twin.fused_risk_score}%* (${twin.risk_tier})
• Horizon Warning: *${twin.days_to_risk}*

⚠️ *Active Concern:*
${alerts[0]?.primary_concern || 'Accelerated Hypertensive Surge'}

🔬 *Windkessel 3-Element ODE Fit:*
• Aortic Compliance (C_art): ${twin.windkessel_params.c_arterial} mL/mmHg
• Peripheral Resistance (R_p): ${twin.windkessel_params.r_peripheral} (+${twin.windkessel_params.r_peripheral_shift_percent}%)

👉 *Review Live Digital Twin:*
${window.location.origin}/patients/${patient.patient_id}

Attending CCU Resident requesting immediate consult.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-white flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-[#111e1d]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                Dispatch Rapid Code to On-Call Consultant
              </h3>
              <p className="text-[12px] text-[#445f73]">
                Instant Tele-Cardiology Escalation via WhatsApp / SMS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-[#445f73]"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Doctor Contact Selector */}
        <div>
          <label className="text-[11px] font-bold text-[#111e1d] block mb-1">
            On-Call Senior Consultant / HOD Contact:
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <PhoneCall className="w-4 h-4 text-[#00666f] absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#00666f] font-mono"
                placeholder="+91 98765 43210"
              />
            </div>
            <span className="text-[11px] font-semibold text-[#00666f] bg-[#e2f1ef] px-2.5 py-2 rounded-xl">
              Dr. B. K. Sen, HOD
            </span>
          </div>
        </div>

        {/* Message Preview */}
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 font-mono text-[11px] text-[#111e1d] whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed select-all">
          {messageText}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#445f73] hover:bg-gray-100 transition-colors"
            type="button"
          >
            Cancel
          </button>

          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-[#111e1d] font-semibold text-[13px] flex items-center gap-1.5 shadow-2xs transition-colors"
            type="button"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13px] shadow-sm flex items-center gap-1.5 transition-all active:scale-98"
            type="button"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
