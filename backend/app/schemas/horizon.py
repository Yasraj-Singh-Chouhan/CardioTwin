from typing import Optional
from pydantic import Field
from .common import BaseSchema, RiskTier


class HorizonResponse(BaseSchema):
    patient_id: str = Field(..., description="Patient identifier")
    estimated_days_to_target: float = Field(default=3.0, description="Estimated days until risk trajectory breaches target tier")
    range_min_days: float = Field(default=2.0, description="Lower bound of uncertainty range (days)")
    range_max_days: float = Field(default=5.0, description="Upper bound of uncertainty range (days)")
    target_tier: RiskTier = Field(default=RiskTier.HIGH, description="Target threshold risk tier (e.g. HIGH or CRITICAL)")
    urgency_chip_text: str = Field(
        default="Days-to-risk: ~3 days (range 2–5)",
        description="Formatted text for UI badge/chip"
    )
    trend_slope: float = Field(default=0.08, description="Recent trend slope of fused risk trajectory")
    confidence_interval_description: str = Field(
        default="80% Bayesian Credible Interval from autoregressive trajectory projection",
        description="Statistical characterization of estimate"
    )
    notes: Optional[str] = Field(
        default="Model-based estimate under our simulation assumptions. Not a clinical diagnosis.",
        description="Scope limitation note"
    )
