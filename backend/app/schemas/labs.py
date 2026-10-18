from datetime import datetime
from typing import List, Dict, Optional
from pydantic import Field
from .common import BaseSchema


class LabRecord(BaseSchema):
    test_name: str = Field(..., description="Laboratory analyte (e.g. HbA1c, LDL, eGFR, hs-CRP, Lp(a))")
    value: float = Field(..., description="Observed numeric laboratory value")
    unit: str = Field(..., description="Measurement unit (e.g. %, mg/dL, mL/min/1.73m²)")
    reference_range: str = Field(..., description="Clinical target or normal reference interval")
    is_abnormal: bool = Field(..., description="True if value breaches reference threshold")
    timestamp: datetime = Field(..., description="Collection/result timestamp")


class LabHistoryResponse(BaseSchema):
    patient_id: str = Field(..., description="Patient identifier")
    latest_labs: List[LabRecord] = Field(..., description="Most recent lab panel")
    historical_panels: List[LabRecord] = Field(default_factory=list, description="Longitudinal lab panel measurements")
    slopes_6m: Dict[str, float] = Field(
        default_factory=lambda: {
            "hba1c_slope_6m": 0.25,
            "egfr_decline_rate_annual": -1.8,
            "ldl_target_attainment": 0.0
        },
        description="Calculated laboratory trajectory trends"
    )
