from datetime import datetime
from typing import List, Optional
from pydantic import Field
from .common import BaseSchema, RiskTier, AlertStatus


class ClinicalAlert(BaseSchema):
    id: str = Field(..., description="Unique alert identifier")
    patient_id: str = Field(..., description="Patient identifier")
    timestamp: datetime = Field(..., description="Alert generation timestamp")
    tier: RiskTier = Field(..., description="Triage priority level")
    stage_label: str = Field(default="Stage 3 Crisis Risk", description="Clinical stage label")
    primary_concern: str = Field(default="Crisis-range BP episode", description="Event name (never diagnosis)")
    crisis_prob_6h: float = Field(..., description="Estimated probability of event within 6h (0-100%)")
    crisis_prob_12h: float = Field(..., description="Estimated probability of event within 12h (0-100%)")
    warning_window_hours: float = Field(default=8.2, description="Calculated lead time warning window")
    eta_to_threshold: str = Field(default="T+5.4h", description="Estimated time of threshold crossing")
    trigger_summary: str = Field(..., description="Physiological trigger description")
    recommended_action: str = Field(..., description="Decision support recommended clinical action")
    status: AlertStatus = Field(default=AlertStatus.ACTIVE, description="Alert state")
    escalation_protocol: Optional[str] = Field(default=None, description="Active emergency protocol if escalated")
    triage_unit: Optional[str] = Field(default=None, description="Assigned clinical triage unit")
    acknowledged_at: Optional[datetime] = Field(default=None, description="Timestamp when physician acknowledged")
    escalated_at: Optional[datetime] = Field(default=None, description="Timestamp when escalated to CCU/Cath Lab")


class AlertsListResponse(BaseSchema):
    patient_id: str = Field(..., description="Patient identifier")
    alerts: List[ClinicalAlert] = Field(..., description="Chronological log of alerts")
