import { useState } from 'react';
import { AlertTriangle, ShieldCheck, X, Calculator } from 'lucide-react';

interface DrugTitrationCalculatorModalProps {
  currentSbp: number;
  currentDbp: number;
  onClose: () => void;
}

export function DrugTitrationCalculatorModal({
  currentSbp,
  currentDbp,
  onClose,
}: DrugTitrationCalculatorModalProps) {
  const [selectedDrug, setSelectedDrug] = useState<'nicardipine' | 'labetalol' | 'nitroglycerin'>('nicardipine');
  const targetSbp = 140;

  const currentMap = Math.round(currentDbp + (currentSbp - currentDbp) / 3);

  // Clinical safety constraint: Lower MAP by at most 20-25% in the first hour
  const safeMinMap = Math.round(currentMap * 0.75); // 25% drop limit
  const safeTargetMap = Math.max(95, safeMinMap);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl border border-white flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-[#111e1d]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                CCU Antihypertensive Titration Assistant
              </h3>
              <p className="text-[12px] text-[#445f73]">
                Safe In Silico Vasodilator Dosing &amp; MAP Floor Safeguard
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

        {/* Current Hemodynamic Baseline */}
        <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#e2f1ef]/50 border border-[#00666f]/15 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#445f73]">Current Aortic BP</span>
            <p className="font-mono font-bold text-lg text-[#ba1a1a]">{currentSbp}/{currentDbp} <span className="text-xs font-normal">mmHg</span></p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#445f73]">Current MAP</span>
            <p className="font-mono font-bold text-lg text-[#111e1d]">{currentMap} <span className="text-xs font-normal">mmHg</span></p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#00666f]">Max Safe 1h MAP Floor</span>
            <p className="font-mono font-bold text-lg text-[#00666f]">{safeTargetMap} <span className="text-xs font-normal">mmHg</span></p>
          </div>
        </div>

        {/* Clinical Safeguard Alert */}
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-[11px] text-amber-900 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>AHA/ACC &amp; CSI Guideline Rule:</strong> Avoid rapid pressure drops &gt; 25% within the first 60 minutes to protect against watershed cerebral hypoperfusion and myocardial ischemia.
          </div>
        </div>

        {/* Drug Selector Tabs */}
        <div>
          <span className="text-[11px] font-bold text-[#111e1d] mb-1.5 block">Select First-Line Inpatient Agent:</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'nicardipine', name: 'IV Nicardipine', sub: 'DHP CCB Vasodilator' },
              { id: 'labetalol', name: 'IV Labetalol', sub: 'Alpha/Beta Blocker' },
              { id: 'nitroglycerin', name: 'IV Nitroglycerin', sub: 'Venodilator (Ischemia)' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDrug(d.id as typeof selectedDrug)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedDrug === d.id
                    ? 'border-[#00666f] bg-[#e2f1ef] text-[#00666f] shadow-2xs'
                    : 'border-gray-200 hover:bg-gray-50 text-[#445f73]'
                }`}
              >
                <div className="font-bold text-xs">{d.name}</div>
                <div className="text-[10px] opacity-75">{d.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Drug Protocol Step Guidance */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col gap-2.5 text-xs">
          {selectedDrug === 'nicardipine' && (
            <>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#111e1d]">Nicardipine Continuous Infusion (25mg / 250mL D5W):</span>
                <span className="font-mono text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Target SBP: &le; {targetSbp} mmHg
                </span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-[#445f73] leading-relaxed">
                <li>• <strong>Starting Rate:</strong> 5.0 mg/hr (50 mL/hr) IV infusion.</li>
                <li>• <strong>Titration Step:</strong> Increase by 2.5 mg/hr (25 mL/hr) every 15 minutes as needed.</li>
                <li>• <strong>Ceiling Dose:</strong> Maximum 15.0 mg/hr (150 mL/hr).</li>
                <li>• <strong>Maintenance:</strong> Once target BP reached, down-titrate to 3.0 mg/hr.</li>
              </ul>
            </>
          )}

          {selectedDrug === 'labetalol' && (
            <>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#111e1d]">Labetalol Intermittent Bolus or Continuous:</span>
                <span className="font-mono text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Target SBP: &le; {targetSbp} mmHg
                </span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-[#445f73] leading-relaxed">
                <li>• <strong>Initial Bolus:</strong> 20 mg slow IV push over 2 minutes.</li>
                <li>• <strong>Repeat Dosing:</strong> 40 to 80 mg every 10 minutes until goal is met.</li>
                <li>• <strong>Maximum Cumulative:</strong> 300 mg total bolus dose.</li>
                <li>• <strong>Alternative Infusion:</strong> 0.5 to 2.0 mg/min (titrate every 30 min).</li>
              </ul>
            </>
          )}

          {selectedDrug === 'nitroglycerin' && (
            <>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#111e1d]">Nitroglycerin Infusion (50mg / 250mL):</span>
                <span className="font-mono text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Ideal for CAD / Pulmonary Congestion
                </span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-[#445f73] leading-relaxed">
                <li>• <strong>Initial Rate:</strong> 5 mcg/min (1.5 mL/hr).</li>
                <li>• <strong>Titration:</strong> Increase by 5 mcg/min every 3 to 5 minutes.</li>
                <li>• <strong>Maintenance Range:</strong> 10 to 100 mcg/min.</li>
                <li>• <strong>Contraindication:</strong> SBP &lt; 90 mmHg or PDE-5 inhibitor in last 24h.</li>
              </ul>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-[11px] text-[#445f73] flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-[#00666f]" />
            CDSCO Class C SaMD Protocol Reference
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00666f] to-[#00818c] text-white font-bold text-[13px] shadow-sm hover:brightness-110 active:scale-98 transition-all"
            type="button"
          >
            Acknowledge Protocol
          </button>
        </div>
      </div>
    </div>
  );
}
