from typing import List, Dict, Any, Optional
from pydantic import Field
from .common import BaseSchema, ScenarioType, RiskTier


class ScenarioRequest(BaseSchema):
    scenario_type: ScenarioType = Field(..., description="Scenario type: missed_dose, acute_exertion, sympathetic_surge, medication_adjustment, prescription_plan")
    perturbation_value: float = Field(default=24.0, description="Perturbation magnitude (e.g. 24 hours missed, or intensity factor)")
    duration_hours: Optional[float] = Field(default=None, description="Duration in hours for scenario")
    severity_level: Optional[str] = Field(default=None, description="Severity: mild, moderate, severe")
    prescription_rank: Optional[int] = Field(default=None, description="Prescription rank to simulate (1, 2, 3)")
    plan_title: Optional[str] = Field(default=None, description="Title of the countermeasure plan being simulated")
    custom_parameters: Optional[Dict[str, Any]] = Field(default=None, description="Optional overrides for Windkessel simulation")


class TrajectoryComparisonPoint(BaseSchema):
    hour: float = Field(..., description="Hour offset relative to scenario start")
    baseline_sbp: float = Field(..., description="Unperturbed simulated SBP")
    scenario_sbp: float = Field(..., description="Perturbed simulated SBP")
    baseline_dbp: float = Field(..., description="Unperturbed simulated DBP")
    scenario_dbp: float = Field(..., description="Perturbed simulated DBP")


class ScenarioResponse(BaseSchema):
    patient_id: str = Field(..., description="Patient identifier")
    scenario_type: ScenarioType = Field(..., description="Executed scenario")
    scenario_title: str = Field(..., description="Scenario display name (e.g. 'Missed Dose: Amlodipine 5mg +24h')")
    state_label: str = Field(default="State: Perturbed", description="Execution status")
    baseline_peak_sbp: float = Field(..., description="Baseline forecast peak SBP (mmHg)")
    perturbed_peak_sbp: float = Field(..., description="Perturbed forecast peak SBP (mmHg)")
    baseline_risk_score: float = Field(..., description="Baseline risk score (0-100)")
    perturbed_risk_score: float = Field(..., description="Perturbed risk score (0-100)")
    risk_tier_before: RiskTier = Field(..., description="Triage tier prior to perturbation")
    risk_tier_after: RiskTier = Field(..., description="Triage tier post perturbation")
    eta_to_threshold_hours: Optional[float] = Field(None, description="Estimated hours until 180 mmHg breach")
    trajectory_comparison: List[TrajectoryComparisonPoint] = Field(..., description="Comparative hourly BP trajectories")
    plain_language_impact: str = Field(..., description="Synthesized clinical consequence of perturbation")
    disclaimer: str = Field(
        default="Model-based estimate under our simulation assumptions. Not clinical proof. Decision support only.",
        description="Disclaimer"
    )


class PrescriptionOption(BaseSchema):
    rank: int = Field(..., description="Priority rank (1=lowest burden/cost)")
    title: str = Field(..., description="Prescription title (e.g. 'Earlier Bedtime + Mild Rest')")
    description: str = Field(..., description="Plain language actionable guidance")
    difficulty_cost: float = Field(..., description="Behavioral adherence resistance score (lower is easier)")
    target_risk_tier: RiskTier = Field(..., description="Projected tier achieved")
    projected_risk_score: float = Field(..., description="Estimated new fused risk score")
    changes: Dict[str, Any] = Field(..., description="Adjusted lifestyle parameters")


class PrescriptionsResponse(BaseSchema):
    patient_id: str = Field(..., description="Patient identifier")
    current_risk_tier: RiskTier = Field(..., description="Current tier before optimization")
    target_risk_tier: RiskTier = Field(..., description="Desired lower risk tier")
    ranked_options: List[PrescriptionOption] = Field(..., description="Cheapest behavioral adjustments meeting target")
    disclaimer: str = Field(
        default="Model-based estimate under our simulation assumptions. Prescriptions are non-pharmacological behavioral suggestions for clinical evaluation.",
        description="Prescription disclaimer"
    )
