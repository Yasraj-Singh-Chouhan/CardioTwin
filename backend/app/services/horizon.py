"""Days-to-Risk Horizon Service.
Estimates actionable clinical lead-time before risk threshold breach.
Provides point estimates with lower and upper confidence intervals.
"""
import math
from typing import Dict, Any, Optional


class HorizonService:
    """Estimates time horizon until patient transitions into HIGH or CRITICAL risk tiers."""

    @classmethod
    def estimate_horizon(
        cls,
        fused_risk: float,
        drift_rate_per_day: float = 0.04,
        acute_eta_hours: Optional[float] = None,
    ) -> Dict[str, Any]:
        """Compute estimated horizon in days (or hours if acute crisis imminent)."""
        # Edge case 1: Acute crisis threshold imminent (<12 hours)
        if acute_eta_hours is not None and acute_eta_hours <= 12.0:
            return {
                "horizon_text": f"Acute Crisis ETA: ~{acute_eta_hours:.1f} hours",
                "days_estimate": round(acute_eta_hours / 24.0, 2),
                "lower_bound_days": round(max(0.05, (acute_eta_hours - 1.5) / 24.0), 2),
                "upper_bound_days": round((acute_eta_hours + 2.0) / 24.0, 2),
                "urgency_level": "IMMEDIATE",
                "status": "ACUTE_EPISODE_IMMINENT",
                "advisory": f"Projected crisis-range BP threshold breach within ~{acute_eta_hours:.1f} hours. Urgent review recommended.",
            }

        # Edge case 2: Already above High tier (fused_risk >= 0.60)
        if fused_risk >= 0.80:
            return {
                "horizon_text": "Immediate: Currently in CRITICAL Tier (≥0.80)",
                "days_estimate": 0.0,
                "lower_bound_days": 0.0,
                "upper_bound_days": 0.5,
                "urgency_level": "CRITICAL",
                "status": "ALREADY_CRITICAL",
                "advisory": "Current patient state already exceeds critical threshold. Emergency clinical intervention required.",
            }
        elif fused_risk >= 0.60:
            return {
                "horizon_text": "Immediate: Currently in HIGH Tier (≥0.60)",
                "days_estimate": 0.5,
                "lower_bound_days": 0.0,
                "upper_bound_days": 1.0,
                "urgency_level": "HIGH",
                "status": "ALREADY_HIGH",
                "advisory": "Patient is in high risk tier. Contact physician within 2-4 hours to adjust antihypertensive regimen.",
            }

        # Projected horizon towards 0.60 threshold
        risk_gap = 0.60 - fused_risk
        effective_drift = max(0.005, drift_rate_per_day)
        proj_days = risk_gap / effective_drift

        if proj_days > 14.0:
            return {
                "horizon_text": "Stable (>14 days under current trajectory)",
                "days_estimate": 14.0,
                "lower_bound_days": 10.0,
                "upper_bound_days": 21.0,
                "urgency_level": "LOW",
                "status": "STABLE_EXTENDED",
                "advisory": "No high-tier threshold breach anticipated within 14-day window under stable baseline adherence.",
            }

        days_val = round(proj_days, 1)
        lower = max(0.5, round(days_val * 0.7, 1))
        upper = round(days_val * 1.4 + 0.5, 1)

        return {
            "horizon_text": f"Days-to-risk: ~{days_val} days (range {lower}–{upper})",
            "days_estimate": days_val,
            "lower_bound_days": lower,
            "upper_bound_days": upper,
            "urgency_level": "ELEVATED" if days_val < 4.0 else "MODERATE",
            "status": "DRIFT_PROJECTED",
            "advisory": f"Under current physiological drift, risk is projected to cross High tier threshold in ~{days_val} days.",
        }
