from datetime import datetime
from typing import List, Optional
from pydantic import Field
from .common import BaseSchema


class WearableDataPoint(BaseSchema):
    timestamp: datetime = Field(..., description="Sample timestamp")
    heart_rate: float = Field(..., description="Heart rate in beats per minute (bpm)")
    hrv_rmssd: float = Field(..., description="Root mean square of successive RR differences (ms)")
    hrv_sdnn: float = Field(..., description="Standard deviation of NN intervals (ms)")
    hrv_lf_hf: float = Field(..., description="Low frequency to high frequency autonomic balance ratio")
    systolic_bp: float = Field(..., description="Systolic blood pressure (mmHg)")
    diastolic_bp: float = Field(..., description="Diastolic blood pressure (mmHg)")
    mean_arterial_pressure: float = Field(..., description="MAP in mmHg")
    spo2: float = Field(default=98.0, description="Blood oxygen saturation (%)")
    step_count: int = Field(default=0, description="Cumulative or epoch step count")
    active_minutes: int = Field(default=0, description="Physical activity duration")
    sedentary_minutes: int = Field(default=5, description="Sedentary epoch duration")
    sleep_stage: Optional[str] = Field(None, description="Sleep classification: deep, rem, light, awake")


class WearableMetricsSummary(BaseSchema):
    resting_hr_bpm: float = Field(..., description="Calculated resting heart rate")
    nocturnal_dip_percent: float = Field(..., description="Nocturnal blood pressure dip percentage")
    morning_surge_mmhg: float = Field(..., description="Morning BP surge in mmHg")
    hrv_rmssd_mean: float = Field(..., description="Mean HRV RMSSD over window")
    hypertensive_burden_percent: float = Field(..., description="Percentage of readings with SBP ≥ 140 or DBP ≥ 90")
    tachycardia_burden_percent: float = Field(..., description="Percentage of readings with HR > 100 bpm")


class WearableSeriesResponse(BaseSchema):
    patient_id: str = Field(..., description="Patient identifier")
    window_start: datetime = Field(..., description="Start of requested telemetry buffer")
    window_end: datetime = Field(..., description="End of requested telemetry buffer")
    sampling_resolution: str = Field(default="5-minute windows", description="Resampled telemetry resolution")
    data_points: List[WearableDataPoint] = Field(..., description="Series of resampled telemetry records")
    summary: WearableMetricsSummary = Field(..., description="Aggregated telemetry biomarkers")
