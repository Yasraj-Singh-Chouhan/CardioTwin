"""Slow Twin Service: Chronic Cardiovascular Risk Engine.
Implements India-calibrated 10-year CVD risk modeling based on ICMR-INDIAB and QRISK adaptations.
Guarantees risk score strictly in [0.0, 1.0].
"""
import math
from typing import Dict, Any, Tuple
from app.services.india_calibration import compute_india_risk_multiplier


class SlowTwinEngine:
    """Engine for computing chronic cardiovascular risk and vascular aging."""

    @staticmethod
    def compute_chronic_risk(ehr: Dict[str, Any]) -> Tuple[float, Dict[str, Any]]:
        """Compute chronic CVD risk score.
        
        Returns:
            Tuple of (risk_score_0_to_1, details_dict)
            Guaranteed: 0.0 <= risk_score <= 1.0
        """
        age = float(ehr.get("age", 55))
        sex = str(ehr.get("sex", "M")).upper()
        sbp = float(ehr.get("baseline_sbp", 130.0) or 130.0)
        tot_chol = float(ehr.get("total_cholesterol_mg_dl") or ehr.get("cholesterol_total") or 200.0)
        hdl = float(ehr.get("hdl_mg_dl") or ehr.get("cholesterol_hdl") or 45.0)
        hba1c = float(ehr.get("hba1c") or 5.8)
        egfr = float(ehr.get("egfr") or 85.0)
        
        has_htn = bool(ehr.get("hypertension", 0))
        has_t2d = bool(ehr.get("diabetes", 0))
        has_ckd = bool(ehr.get("ckd", 0)) or (egfr < 60.0)
        has_prev_mi = bool(ehr.get("prior_mi", 0) or ehr.get("previous_mi", 0))
        has_prev_stroke = bool(ehr.get("prior_stroke", 0) or ehr.get("previous_stroke", 0))

        # Base Framingham / QRISK linear predictor
        lp = -8.5
        # Age effect
        lp += 0.065 * (age - 45.0)
        # Sex effect (higher baseline male risk)
        if sex.startswith("M"):
            lp += 0.35
        # SBP effect
        lp += 0.015 * (sbp - 120.0)
        # Lipid ratio (Total / HDL)
        chol_ratio = tot_chol / max(15.0, hdl)
        lp += 0.18 * (chol_ratio - 3.5)
        
        # Diabetes & Glycemia
        if has_t2d:
            lp += 0.65
        if hba1c > 6.5:
            lp += 0.15 * (hba1c - 6.5)

        # Renal impairment
        if has_ckd or egfr < 60.0:
            lp += 0.45
            if egfr < 45.0:
                lp += 0.30

        # Prior cardiovascular events
        if has_prev_mi:
            lp += 0.85
        if has_prev_stroke:
            lp += 0.70

        # Base 10-year risk via logistic sigmoid
        base_risk = 1.0 / (1.0 + math.exp(-lp))

        # Apply South Asian epidemiological multiplier
        india_multiplier = compute_india_risk_multiplier(ehr)
        adjusted_risk = base_risk * (india_multiplier / 1.4)  # normalized to base South Asian

        # Medication adherence mitigation
        medications = ehr.get("medications", [])
        adherence_scores = [m.get("adherence_score", 0.8) for m in medications if isinstance(m, dict)]
        mean_adherence = sum(adherence_scores) / len(adherence_scores) if adherence_scores else 0.8
        
        if len(medications) > 0:
            # Active treatment mitigates risk by up to 25% if adherent
            treatment_benefit = 0.25 * mean_adherence
            adjusted_risk *= (1.0 - treatment_benefit)

        # Guaranteed strict clamp to [0.0, 1.0]
        final_risk = max(0.0, min(1.0, float(adjusted_risk)))

        details = {
            "base_risk": round(base_risk, 4),
            "india_multiplier": round(india_multiplier, 2),
            "mean_adherence": round(mean_adherence, 2),
            "chol_hdl_ratio": round(chol_ratio, 2),
            "charlson_score": int(has_htn) + int(has_t2d)*2 + int(has_ckd)*2 + int(has_prev_mi)*2 + int(has_prev_stroke)*2,
        }
        return final_risk, details
