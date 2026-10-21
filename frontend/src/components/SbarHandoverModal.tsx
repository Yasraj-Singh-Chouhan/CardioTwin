import { useState } from 'react';
import { FileText, Copy, Check, Printer, X, Download, Stethoscope } from 'lucide-react';
import type { PatientDetailResponse, TwinStateResponse, ClinicalAlert, MedicationItem } from '../api/types';

interface SbarHandoverModalProps {
  patient: PatientDetailResponse;
  twin: TwinStateResponse;
  alerts: ClinicalAlert[];
  currentSbp: number;
  currentDbp: number;
  currentHr: number;
  onClose: () => void;
}

export function SbarHandoverModal({
  patient,
  twin,
  alerts,
  currentSbp,
  currentDbp,
  currentHr,
  onClose,
}: SbarHandoverModalProps) {
  const [copied, setCopied] = useState(false);

  const currentMap = Math.round(currentDbp + (currentSbp - currentDbp) / 3);
  const nowStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  // Generate standard clinical SBAR text
  const sbarText = `==========================================================
CLINICAL SBAR HANDOVER REPORT • CARDIOTWIN CCU
Generated: ${nowStr} IST
Attending: Dr. A. Sharma, MD, DM (Cardiology)
==========================================================

[S] SITUATION:
- Patient: ${patient.name} (${patient.patient_id}), ${patient.age}y ${patient.sex}, ${patient.city}
- Active Concern: ${alerts[0]?.primary_concern || 'Stage 2 Hypertension Under Continuous Surveillance'}
- Current Telemetry: Aortic BP ${currentSbp}/${currentDbp} mmHg | MAP ${currentMap} mmHg | Pulse ${currentHr} bpm
- Windkessel Fused Risk Score: ${twin.fused_risk_score}% (${twin.risk_tier} TIER)
- Forecast Crisis Horizon: ${twin.days_to_risk}

[B] BACKGROUND:
- Primary Diagnosis: ${patient.primary_condition} (BMI: ${patient.bmi})
- Pharmacotherapy:
${patient.medications
  .map(
    (m: MedicationItem) =>
      `  * ${m.name} ${m.dosage} (${m.frequency}) - Adherence: ${Math.round(m.adherence_score * 100)}%`
  )
  .join('\n')}
- South Asian Calibration: Calibrated for nocturnal non-dipping & elevated arterial stiffness.

[A] ASSESSMENT:
- Biophysical Status (3-Element Windkessel ODE):
  * Aortic Compliance (C_art): ${twin.windkessel_params.c_arterial} mL/mmHg (Elastic reserve compromised)
  * Peripheral Resistance (R_p): ${twin.windkessel_params.r_peripheral} mmHg·s/mL (+${twin.windkessel_params.r_peripheral_shift_percent}% vasoconstrictive tone)
  * Cardiac Output (Q_co): ${twin.windkessel_params.cardiac_output_l_min} L/min
- Twin Decompensation State:
  * Fast-Twin (Acute Stress): ${twin.scales.acute_twin_score}% (${twin.scales.acute_twin_label})
  * Slow-Twin (Chronic Stiffening): ${twin.scales.chronic_twin_score}%

[R] RECOMMENDATION:
- Immediate Action: ${alerts[0]?.recommended_action || 'Continue continuous tonometry surveillance'}
- Safeguard Target: Lower MAP by no more than 20-25% over the first hour to preserve cerebral autoregulation.
- Shift Follow-up: Re-check in silico calibration in 2 hours; titrate vasodilator if SBP remains > 160 mmHg.

Signed: ___________________________ (Attending Cardiologist)
==========================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sbarText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([sbarText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SBAR_${patient.patient_id}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-white flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00666f]/10 text-[#00666f] flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-[#111e1d]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                Clinical SBAR Shift Handover Note
              </h3>
              <p className="text-[12px] text-[#445f73]">
                Standardized Physician-to-Physician Transfer Dossier
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

        {/* Formatted Code Block */}
        <div className="bg-[#f8fcfa] border border-[#00666f]/15 rounded-2xl p-4 font-mono text-[11px] leading-relaxed text-[#111e1d] overflow-x-auto whitespace-pre-wrap select-all">
          {sbarText}
        </div>

        {/* Doctor Verification Row */}
        <div className="p-3 rounded-xl bg-[#e2f1ef]/60 text-[12px] text-[#00666f] flex items-center justify-between border border-[#00666f]/15">
          <span className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4" />
            <span>Ready for hospital EHR / WhatsApp dispatch &bull; <strong>CDSCO Class C SaMD</strong></span>
          </span>
          <span className="text-[11px] font-mono font-bold">{nowStr}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#445f73] hover:bg-gray-100 transition-colors"
            type="button"
          >
            Close
          </button>

          <button
            onClick={handleDownload}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-[#111e1d] text-[12px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            type="button"
          >
            <Download className="w-4 h-4 text-[#445f73]" />
            <span>Download .txt</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-[#111e1d] text-[12px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            type="button"
          >
            <Printer className="w-4 h-4 text-[#445f73]" />
            <span>Print</span>
          </button>

          <button
            onClick={handleCopy}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00666f] to-[#00818c] text-white font-bold text-[13px] shadow-sm flex items-center gap-1.5 hover:brightness-110 active:scale-98 transition-all"
            type="button"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy SBAR Note'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
