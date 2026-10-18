"""Multiscale Cardiovascular Risk Fusion Service.
Integrates chronic slow-twin risk, acute fast-twin crisis probability,
Windkessel hemodynamic state, Twin Drift Index, and environmental amplifiers.
Guarantees fused risk scores strictly in [0.0, 1.0].
"""
from typing import Dict, Any, Tuple
from app.schemas.common import RiskTier


class FusionEngine:
    """Fuses chronic epidemiological, acute ML, and biophysical model states."""

    @classmethod
    def classify_tier(cls, score_0_to_1: float) -> RiskTier:
        """Classify fused risk score into standardized clinical risk tier."""
        if score_0_to_1 >= 0.80:
            return RiskTier.CRITICAL
        elif score_0_to_1 >= 0.60:
            return RiskTier.HIGH
        elif score_0_to_1 >= 0.40:
            return RiskTier.ELEVATED
        elif score_0_to_1 >= 0.20:
            return RiskTier.MODERATE
        else:
            return RiskTier.LOW

    @classmethod
    def fuse_risks(
        cls,
        chronic_risk: float,
        acute_risk: float,
        medication_adherence: float = 0.85,
        recent_hospitalization: bool = False,
        env_multiplier: float = 1.0,
        tdi_score: float = 20.0,
    ) -> Tuple[float, RiskTier, Dict[str, Any]]:
        """Combine slow-scale and fast-scale risks into unified multiscale score.
        
        Formula:
        fused = 1 - (1 - chronic_risk) * (1 - acute_risk)
        multiplied by contextual amplifiers, strictly bounded to [0.0, 1.0].
        """
        c_risk = max(0.0, min(1.0, float(chronic_risk)))
        a_risk = max(0.0, min(1.0, float(acute_risk)))

        # Multiplicative survival model fusion
        base_fused = 1.0 - (1.0 - c_risk) * (1.0 - a_risk)

        # Contextual amplifiers
        multiplier = 1.0
        if medication_adherence < 0.50:
            multiplier *= 1.30
        elif medication_adherence < 0.75:
            multiplier *= 1.12

        if recent_hospitalization:
            multiplier *= 1.20

        if env_multiplier > 1.0:
            # Dampen environment effect on overall multiscale score
            multiplier *= (1.0 + (env_multiplier - 1.0) * 0.5)

        # Twin Drift contribution
        if tdi_score > 50.0:
            multiplier *= (1.0 + 0.15 * ((tdi_score - 50.0) / 50.0))

        final_fused = base_fused * multiplier

        # Strictly clamp fused risk score to [0.0, 1.0]
        final_fused = max(0.0, min(1.0, float(final_fused)))
        tier = cls.classify_tier(final_fused)

        breakdown = {
            "base_fused": round(base_fused, 4),
            "contextual_multiplier": round(multiplier, 2),
            "chronic_component": round(c_risk, 4),
            "acute_component": round(a_risk, 4),
            "adherence_factor": round(medication_adherence, 2),
            "env_multiplier": round(env_multiplier, 2),
            "tdi_score": round(tdi_score, 1),
        }
        return final_fused, tier, breakdown
