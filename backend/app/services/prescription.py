"""Minimum-Change Lifestyle Prescription Service.
Performs grid search to find the minimal behavioral intervention cost that de-escalates risk by one tier.
Respects environmental context (e.g. prioritizing indoor activity during Severe AQI).
"""
from typing import Dict, Any, List, Optional
from app.schemas.common import RiskTier


class PrescriptionService:
    """Finds lowest-friction lifestyle adjustments achieving target risk tier."""

    # Search space grid
    STEPS_OPTIONS = [0, 1000, 2000, 3000, 5000]
    SLEEP_DUR_OPTIONS = [0, 15, 30, 45, 60]       # minutes
    SLEEP_ONSET_OPTIONS = [0, 15, 30, 45, 60]     # minutes earlier
    STRESS_OPTIONS = [0, 5, 10, 15, 20]           # points reduction

    @classmethod
    def search_minimum_prescription(
        cls,
        current_fused_risk: float,
        target_tier: Optional[RiskTier] = None,
        aqi_category: str = "Moderate",
        current_steps: int = 5000,
        current_sleep_hours: float = 6.5,
    ) -> Dict[str, Any]:
        """Perform grid search for lowest behavioral cost perturbation."""
        # Determine target threshold
        if target_tier == RiskTier.LOW:
            target_risk = 0.19
        elif target_tier == RiskTier.MODERATE:
            target_risk = 0.38
        elif target_tier == RiskTier.ELEVATED:
            target_risk = 0.58
        else:
            # Default target: one tier lower than current
            if current_fused_risk >= 0.80:
                target_risk = 0.58  # aim for ELEVATED
            elif current_fused_risk >= 0.60:
                target_risk = 0.38  # aim for MODERATE
            elif current_fused_risk >= 0.40:
                target_risk = 0.19  # aim for LOW
            else:
                target_risk = max(0.05, current_fused_risk - 0.10)

        best_solution = None
        min_cost = float("inf")

        is_high_aqi = aqi_category in ("Poor", "Very Poor", "Severe")

        for d_steps in cls.STEPS_OPTIONS:
            for d_sleep in cls.SLEEP_DUR_OPTIONS:
                for d_onset in cls.SLEEP_ONSET_OPTIONS:
                    for d_stress in cls.STRESS_OPTIONS:
                        # Behavioral cost function (Blueprint 8.3)
                        cost = (
                            (d_steps / 1000.0) * (1.5 if is_high_aqi else 1.0)
                            + (d_sleep / 30.0) * 0.8
                            + (d_onset / 30.0) * 1.2
                            + (d_stress / 10.0) * 1.5
                        )

                        # Modeled risk delta
                        risk_reduction = (
                            (d_steps / 1000.0) * 0.025
                            + (d_sleep / 60.0) * 0.035
                            + (d_onset / 60.0) * 0.020
                            + (d_stress / 20.0) * 0.040
                        )

                        sim_risk = max(0.05, current_fused_risk - risk_reduction)

                        if sim_risk <= target_risk and cost > 0:
                            if cost < min_cost:
                                min_cost = cost
                                best_solution = {
                                    "delta_steps": d_steps,
                                    "delta_sleep_min": d_sleep,
                                    "bedtime_earlier_min": d_onset,
                                    "stress_reduction_points": d_stress,
                                    "predicted_risk_before": round(current_fused_risk, 3),
                                    "predicted_risk_after": round(sim_risk, 3),
                                    "risk_tier_before": "HIGH" if current_fused_risk >= 0.60 else "ELEVATED",
                                    "risk_tier_after": "MODERATE" if sim_risk <= 0.39 else "LOW",
                                    "relative_cost": round(cost, 2),
                                }

        if not best_solution:
            # Fallback if no lifestyle-only perturbation achieves the jump
            return {
                "achievable_by_lifestyle_only": False,
                "current_risk": round(current_fused_risk, 3),
                "target_risk": round(target_risk, 3),
                "summary": "No lifestyle-only modification is mathematically sufficient to cross the risk tier threshold. Regimen escalation and medication review recommended.",
                "prescription_cards": [],
                "disclaimer": "Model-based estimate under digital twin simulation assumptions; not causal proof.",
            }

        # Format prescription cards
        cards = []
        if best_solution["delta_steps"] > 0:
            activity_type = "Indoor brisk stepping / yoga" if is_high_aqi else "Brisk walking"
            cards.append({
                "title": f"Activity: +{best_solution['delta_steps']} daily steps",
                "recommendation": f"Add {best_solution['delta_steps']} steps daily via {activity_type} ({aqi_category} AQI environment).",
                "impact": f"-{round((best_solution['delta_steps']/1000.0)*2.5, 1)}% risk reduction",
            })
        if best_solution["delta_sleep_min"] > 0 or best_solution["bedtime_earlier_min"] > 0:
            tot_sleep = best_solution["delta_sleep_min"]
            earlier = best_solution["bedtime_earlier_min"]
            cards.append({
                "title": f"Sleep: +{tot_sleep} min duration, {earlier} min earlier bedtime",
                "recommendation": f"Shift bedtime {earlier} min earlier to extend restorative deep sleep and autonomic parasympathetic recovery.",
                "impact": "-4.5% risk reduction via nocturnal BP dipping normalization",
            })
        if best_solution["stress_reduction_points"] > 0:
            cards.append({
                "title": f"Autonomic Balance: -{best_solution['stress_reduction_points']} stress points",
                "recommendation": "15 minutes of slow paced diaphragmatic breathing (pranayama) twice daily to lower sympathetic tone.",
                "impact": "-3.8% risk reduction via peripheral vasodilation",
            })

        return {
            "achievable_by_lifestyle_only": True,
            "current_risk": round(current_fused_risk, 3),
            "simulated_target_risk": best_solution["predicted_risk_after"],
            "behavioral_effort_cost": best_solution["relative_cost"],
            "summary": f"Achieves target tier ({best_solution['risk_tier_after']}) with minimal lifestyle change (effort score {best_solution['relative_cost']}).",
            "prescription_cards": cards,
            "solution_details": best_solution,
            "disclaimer": "Model-based estimate under digital twin simulation assumptions; not causal proof.",
        }
