from datetime import datetime
from typing import Optional
from pydantic import Field
from .common import BaseSchema, PlaybackSpeed


class PlaybackControlRequest(BaseSchema):
    action: str = Field(..., description="Control action: 'play', 'pause', 'toggle', 'scrub', 'set_speed'")
    speed: Optional[PlaybackSpeed] = Field(None, description="Playback acceleration speed: '1x', '10x', '60x'")
    telemetry_offset_seconds: Optional[float] = Field(None, description="Timeline scrubber offset in seconds")


class PlaybackControlResponse(BaseSchema):
    is_playing: bool = Field(..., description="Current play/pause state")
    current_speed: PlaybackSpeed = Field(default=PlaybackSpeed.TEN_X, description="Active acceleration factor")
    telemetry_clock: str = Field(default="T+04:12:00 (Past 24h)", description="Telemetry clock display string")
    elapsed_seconds: float = Field(default=15120.0, description="Elapsed simulation seconds from start of window")
    buffer_window: str = Field(default="7-day buffer", description="Pre-generated telemetry cache window")
    sim_live_status: str = Field(default="Sim Live", description="Simulated live stream connection state")


class TelemetryTick(BaseSchema):
    patient_id: str = Field(..., description="Patient identifier")
    timestamp: datetime = Field(..., description="Telemetry sample timestamp")
    heart_rate: float = Field(..., description="BPM")
    systolic_bp: float = Field(..., description="mmHg")
    diastolic_bp: float = Field(..., description="mmHg")
    hrv_rmssd: float = Field(..., description="ms")
    composite_stress_percent: float = Field(..., description="Composite autonomic stress (0-100%)")
    current_risk_score: float = Field(..., description="Fused twin score (0-100)")
    fused_risk_score: Optional[float] = Field(None, description="Alias for current_risk_score for frontend replay consumers")
    alert_flag: Optional[str] = Field(None, description="Active alert trigger if elevated")

