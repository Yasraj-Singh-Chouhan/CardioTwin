"""3-Element Windkessel Arterial Hemodynamic Simulation Service.
Simulates systemic blood pressure waveform and response to physiological perturbations.

Governing equations:
dP/dt = (I_heart(t) - P/Rp) / C
where:
- Rp: Peripheral vascular resistance (mmHg·s/mL)
- C: Systemic arterial compliance (mL/mmHg)
- Zc: Aortic characteristic impedance (mmHg·s/mL)
- I_heart: Systolic inflow pulse from stroke volume SV
"""
import math
from typing import Dict, Any, Tuple, List, Optional


class WindkesselModel:
    """3-element Windkessel cardiovascular simulation engine."""

    # Physiological clamp boundaries
    MIN_SBP: float = 90.0
    MAX_SBP: float = 220.0
    MIN_DBP: float = 50.0
    MAX_DBP: float = 130.0

    def __init__(
        self,
        r_peripheral: float = 1.15,
        c_arterial: float = 1.05,
        z_characteristic: float = 0.06,
        stroke_volume: float = 72.0,
    ):
        self.rp = float(r_peripheral)
        self.c = float(c_arterial)
        self.zc = float(z_characteristic)
        self.sv = float(stroke_volume)
        self.nominal_rp = self.rp
        self.nominal_c = self.c

    @classmethod
    def from_patient_ehr(cls, ehr: Dict[str, Any]) -> "WindkesselModel":
        """Initialize patient-personalized Windkessel parameters from EHR profile."""
        age = float(ehr.get("age", 55))
        has_htn = bool(ehr.get("hypertension", 1))
        has_t2d = bool(ehr.get("diabetes", 0))
        egfr = float(ehr.get("egfr", 85.0) or 85.0)
        has_ckd = bool(ehr.get("ckd", 0)) or (egfr < 60.0)
        has_mi = bool(ehr.get("prior_mi", 0) or ehr.get("previous_mi", 0))
        
        # Base vascular parameters for Indian 45-70 cohort
        rp = float(ehr.get("windkessel_rp") or 1.05)
        c = float(ehr.get("windkessel_cart") or 1.15)
        sv = float(ehr.get("windkessel_sv") or 72.0)

        # Vascular remodeling adjustments if not pre-seeded from ehr.db
        if "windkessel_rp" not in ehr:
            age_delta = max(0.0, age - 45.0)
            rp *= (1.0 + 0.004 * age_delta)
            c *= max(0.4, 1.0 - 0.007 * age_delta)

            if has_htn:
                rp *= 1.35
                c *= 0.72
            if has_t2d:
                rp *= 1.12
                c *= 0.82
            if has_ckd:
                rp *= 1.20

        # Medication adherence effect
        medications = ehr.get("medications", [])
        adherence_scores = [m.get("adherence_score", 0.8) for m in medications if isinstance(m, dict)]
        mean_adherence = sum(adherence_scores) / len(adherence_scores) if adherence_scores else 0.85
        
        def med_matches(m: dict, keywords: list) -> bool:
            combined = (str(m.get("drug_class", "")) + " " + str(m.get("name", "")) + " " + str(m.get("drug_name", ""))).lower()
            return any(k in combined for k in keywords)

        has_bb = any(med_matches(m, ["beta", "lol"]) for m in medications if isinstance(m, dict))
        has_ace_arb = any(med_matches(m, ["ace", "arb", "sartan", "pril"]) for m in medications if isinstance(m, dict))
        has_ccb = any(med_matches(m, ["ccb", "dipine", "calcium"]) for m in medications if isinstance(m, dict))

        if has_ace_arb:
            rp *= (1.0 - 0.15 * mean_adherence)
        if has_ccb:
            rp *= (1.0 - 0.18 * mean_adherence)

        # Stroke volume adjustments
        if has_mi:
            sv *= 0.75
        if has_bb:
            sv *= 1.08

        zc = float(ehr.get("windkessel_zc") or (0.05 * rp))
        return cls(r_peripheral=rp, c_arterial=c, z_characteristic=zc, stroke_volume=sv)

    def simulate(
        self,
        hr: float,
        override_rp: Optional[float] = None,
        override_c: Optional[float] = None,
        override_sv: Optional[float] = None,
    ) -> Tuple[float, float]:
        """Simulate systolic and diastolic blood pressure given heart rate and parameters.
        
        Guaranteed to return SBP strictly within [90, 220] mmHg and DBP within [50, 130] mmHg.
        """
        hr = max(35.0, min(190.0, float(hr)))
        rp = float(override_rp) if override_rp is not None else self.rp
        c = max(0.3, float(override_c) if override_c is not None else self.c)
        sv = float(override_sv) if override_sv is not None else self.sv

        # Tachycardia filling time shortening
        if hr > 95.0:
            sv *= max(0.65, 1.0 - 0.0025 * (hr - 95.0))

        # Mean Cardiac Output in mL/s
        co_ml_per_sec = (hr * sv) / 60.0
        
        # Mean Arterial Pressure (MAP) = CO * Rp (accounting for characteristic impedance)
        map_val = co_ml_per_sec * (rp + self.zc * 0.5)

        # Pulse pressure (PP) ~ SV / C scaled by Windkessel compliance factor
        cycle_time = 60.0 / hr
        sys_fraction = 0.35
        dias_time = cycle_time * (1.0 - sys_fraction)
        decay_factor = math.exp(-min(5.0, dias_time / max(0.1, rp * c)))
        
        pulse_pressure = (sv / c) * (1.0 - 0.3 * decay_factor)
        
        # SBP and DBP from MAP and PP
        sbp = map_val + (2.0 / 3.0) * pulse_pressure
        dbp = map_val - (1.0 / 3.0) * pulse_pressure

        # Strict physiological boundary clamping (Windkessel SBP within 90-220 mmHg)
        sbp = max(self.MIN_SBP, min(self.MAX_SBP, float(sbp)))
        dbp = max(self.MIN_DBP, min(self.MAX_DBP, float(dbp)))

        # Ensure SBP is always higher than DBP by at least 18 mmHg
        if sbp <= dbp + 18.0:
            dbp = max(self.MIN_DBP, sbp - 25.0)

        return round(sbp, 1), round(dbp, 1)

    def calibrate(self, observed_sbp: float, observed_dbp: float, hr: float) -> Tuple[float, float]:
        """Calibrate Rp and C to minimize discrepancy with observed vitals."""
        target_map = (observed_sbp + 2.0 * observed_dbp) / 3.0
        target_pp = max(20.0, observed_sbp - observed_dbp)
        hr_clamped = max(40.0, min(160.0, hr))
        co_ml_per_sec = (hr_clamped * self.sv) / 60.0

        calibrated_rp = target_map / co_ml_per_sec
        calibrated_c = self.sv / target_pp

        self.rp = max(0.6, min(2.5, calibrated_rp))
        self.c = max(0.4, min(2.2, calibrated_c))
        return self.rp, self.c

    def forecast_trajectory(
        self,
        current_hr: float,
        current_sbp: float,
        current_dbp: float,
        hr_drift_rate_per_hour: float = 0.5,
        horizon_hours: int = 12,
        num_points: int = 12,
    ) -> List[Dict[str, Any]]:
        """Forecast hemodynamic trajectory over the projection window."""
        points = []
        step_hours = horizon_hours / max(1, num_points)
        
        for i in range(num_points + 1):
            offset = i * step_hours
            proj_hr = current_hr + hr_drift_rate_per_hour * offset
            # Circadian sinusoidal wave modulation
            circadian = 3.0 * math.sin(2 * math.pi * offset / 24.0)
            proj_hr += circadian

            sim_sbp, sim_dbp = self.simulate(proj_hr)
            # Continuity blend from current observed point
            blend = min(1.0, offset / 4.0)
            final_sbp = (1.0 - blend) * current_sbp + blend * sim_sbp
            final_dbp = (1.0 - blend) * current_dbp + blend * sim_dbp

            # Ensure bounds
            final_sbp = max(self.MIN_SBP, min(self.MAX_SBP, final_sbp))
            final_dbp = max(self.MIN_DBP, min(self.MAX_DBP, final_dbp))

            uncertainty = 2.5 * math.sqrt(offset + 0.1)
            upper_sbp = min(self.MAX_SBP, final_sbp + uncertainty)
            lower_sbp = max(self.MIN_SBP, final_sbp - uncertainty)

            points.append({
                "offset_hours": round(offset, 1),
                "predicted_sbp": round(final_sbp, 1),
                "predicted_dbp": round(final_dbp, 1),
                "upper_envelope_sbp": round(upper_sbp, 1),
                "lower_envelope_sbp": round(lower_sbp, 1),
                "is_forecast": True,
            })
        return points
