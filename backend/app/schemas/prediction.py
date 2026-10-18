from datetime import datetime
from typing import List, Optional
from pydantic import Field
from .common import BaseSchema


class TrajectoryPoint(BaseSchema):
    offset_hours: float = Field(..., description="Time relative to current telemetry sync (-12 to +12)")
    timestamp: datetime = Field(..., description="Timestamp of point")
    is_forecast: bool = Field(..., description="True if in future projection window")
    observed_sbp: Optional[float] = Field(None, description="Recorded systolic BP for historic points")
    observed_dbp: Optional[float] = Field(None, description="Recorded diastolic BP for historic points")
    predicted_sbp: float = Field(..., description="Continuous simulated/predicted systolic BP (mmHg)")
    predicted_dbp: float = Field(..., description="Continuous simulated/predicted diastolic BP (mmHg)")
    upper_envelope_sbp: Optional[float] = Field(None, description="Forecast upper confidence band envelope")
    lower_envelope_sbp: Optional[float] = Field(None, description="Forecast lower confidence band envelope")


class PredictionsResponse(BaseSchema):
    patient_id: str = Field(..., description="CardioTwin identifier")
    event_name: str = Field(
        default="crisis-range BP episode",
        description="Standardized hero event term (SBP ≥ 180 or DBP ≥ 120 mmHg)"
    )
    recorded_current_bp: str = Field(default="154/98 mmHg", description="Most recent recorded vitals")
    crisis_prob_6h: float = Field(default=31.0, description="Probability of crisis-range BP episode within 6h (0-100%)")
    crisis_prob_12h: float = Field(default=48.0, description="Probability of crisis-range BP episode within 12h (0-100%)")
    crisis_eta_hours: Optional[float] = Field(default=5.4, description="Projected hours until crisis threshold breach")
    forecast_peak_sbp: float = Field(default=184.0, description="Projected peak systolic blood pressure (mmHg)")
    forecast_peak_dbp: float = Field(default=112.0, description="Projected peak diastolic blood pressure (mmHg)")
    forecast_peak_eta_text: str = Field(
        default="Forecast Peak: 184/112 mmHg @ T+5.4h",
        description="Formatted callout string"
    )
    crisis_threshold_sbp: float = Field(default=180.0, description="Crisis threshold line SBP (mmHg)")
    crisis_threshold_dbp: float = Field(default=120.0, description="Crisis threshold line DBP (mmHg)")
    
    # Supporting capability: rhythm irregularity detection (from RR intervals)
    rhythm_irregularity_detected: bool = Field(default=False, description="AF-type rhythm irregularity flag")
    rhythm_irregularity_label: str = Field(
        default="Sinus rhythm / normal autonomic modulation (detection only)",
        description="Validated on MIT-BIH Atrial Fibrillation Database"
    )
    
    trajectory: List[TrajectoryPoint] = Field(..., description="Observed and forecast BP trajectory waveform")
    disclaimer: str = Field(
        default="Evaluated on a semi-synthetic cohort with held-out patients; not clinically validated. Hero event is crisis-range BP episode, not a medical diagnosis.",
        description="Mandatory disclaimer"
    )
