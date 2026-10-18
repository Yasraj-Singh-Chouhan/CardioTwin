from typing import List, Optional
from pydantic import Field
from .common import BaseSchema


class DriftPoint(BaseSchema):
    date: str = Field(..., description="Calendar date label (e.g. 'Nov 07')")
    day_label: str = Field(..., description="Relative day label (e.g. 'Day -6', 'Today (Day 0)')")
    tdi_score: float = Field(..., description="Twin Drift Index score (0-100)")
    flag: Optional[str] = Field(None, description="Event annotation (e.g. Nocturnal PPG noise)")


class DriftFactorContribution(BaseSchema):
    factor_name: str = Field(..., description="Biometric signal name (e.g. Resting Heart Rate)")
    percentage: float = Field(..., description="Decomposition contribution fraction (0-100%)")
    direction: str = Field(..., description="Direction of change: 'up' or 'down'")
    baseline_value: str = Field(..., description="Patient 14-28 day baseline reference (e.g. '64 bpm')")
    observed_value: str = Field(..., description="Recent observed telemetry value (e.g. '78 bpm')")
    signal_snr: str = Field(..., description="Signal signal-to-noise ratio or quality tag")
    confidence: str = Field(..., description="Quality verification tag")


class TwinDriftResponse(BaseSchema):
    patient_id: str = Field(..., description="Patient identifier")
    current_tdi: float = Field(default=41.0, description="Latest calculated Twin Drift Index (0-100)")
    nominal_threshold: float = Field(default=25.0, description="Nominal in silico fidelity threshold")
    alert_threshold: float = Field(default=50.0, description="Divergence alert threshold")
    status: str = Field(default="Elevated Divergence", description="Fidelity status classification")
    seven_day_trend: List[DriftPoint] = Field(..., description="7-day longitudinal TDI series")
    factor_contributions: List[DriftFactorContribution] = Field(..., description="Biometric parameter variance breakdown")
    recommendation: str = Field(
        default="Physiological Re-alignment Recommended: Twin drift has crossed the 40-point nominal threshold due to acute autonomic fatigue and atmospheric covariates.",
        description="Clinical calibration advisory"
    )
