from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import Field
from .common import BaseSchema, RiskTier


class WindkesselParameters(BaseSchema):
    r_peripheral: float = Field(..., description="Peripheral vascular resistance (mmHg·s/mL, nominal ~1.0-1.4)")
    r_peripheral_shift_percent: float = Field(default=28.0, description="Percentage shift from baseline resistance")
    c_arterial: float = Field(..., description="Total systemic arterial compliance (mL/mmHg, nominal ~0.8-1.2)")
    z_characteristic: float = Field(default=0.06, description="Aortic characteristic impedance (mmHg·s/mL)")
    stroke_volume_ml: float = Field(default=72.0, description="Stroke volume in mL")
    cardiac_output_l_min: float = Field(default=5.4, description="Cardiac output in L/min")
    biofit_tolerance_percent: float = Field(default=94.0, description="Windkessel compliance agreement with observed waveform")


class TwinScaleMetrics(BaseSchema):
    chronic_twin_score: float = Field(..., description="Slow twin score (0-100), chronic disease progression")
    chronic_twin_label: str = Field(
        default="Vascular remodeling & aortic stiffening (Windkessel C_art = 0.88 mL/mmHg)",
        description="Biophysical interpretation of slow timescale"
    )
    acute_twin_score: float = Field(..., description="Fast twin score (0-100), acute autonomic and pressure drift")
    acute_twin_label: str = Field(
        default="Sympathetic surge & peripheral resistance escalation (R_p +28%)",
        description="Biophysical interpretation of fast timescale"
    )
    composite_stress_percent: float = Field(..., description="Autonomic and hemodynamic composite stress index (0-100%)")


class MicrovascularState(BaseSchema):
    augmentation_index: str = Field(default="+14%", description="Pulse wave augmentation index")
    status: str = Field(default="Borderline", description="Microvascular vascular stiffness status")


class TwinStateResponse(BaseSchema):
    patient_id: str = Field(..., description="CardioTwin patient ID")
    fused_risk_score: float = Field(..., description="Multiscale fused risk score (0-100)")
    risk_tier: RiskTier = Field(..., description="Current risk tier")
    windkessel_params: WindkesselParameters = Field(..., description="3-element Windkessel physiological state")
    scales: TwinScaleMetrics = Field(..., description="Slow vs Fast dual-timescale metrics")
    days_to_risk: str = Field(..., description="Trajectory time-to-event horizon (e.g. 'Days-to-risk: ~3 days (range 2–5)')")
    delta_tdi: float = Field(default=0.14, description="Current residual Twin Drift Index (nominal <0.20)")
    calibration_status: str = Field(default="CALIBRATED", description="Engine calibration status")
    microvascular_state: MicrovascularState = Field(default_factory=MicrovascularState, description="Microvascular indicators")
    last_calibrated_at: datetime = Field(default_factory=datetime.utcnow, description="Last parameter optimization time")
    next_recalibration_estimate: str = Field(default="T-18h", description="Scheduled recalibration time")
    disclaimer: str = Field(
        default="Decision support only. Not a diagnosis. Evaluated on semi-synthetic cohort.",
        description="Mandatory clinical disclaimer"
    )
