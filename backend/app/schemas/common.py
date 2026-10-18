from enum import Enum
from pydantic import BaseModel, ConfigDict


class RiskTier(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    ELEVATED = "ELEVATED"
    MODERATE = "MODERATE"
    LOW = "LOW"


class EngineMode(str, Enum):
    LIVE_TWIN = "LIVE_TWIN"
    REPLAY = "REPLAY"
    SIMULATED = "SIMULATED"


class PlaybackSpeed(str, Enum):
    ONE_X = "1x"
    TEN_X = "10x"
    SIXTY_X = "60x"


class ProvenanceStatus(str, Enum):
    REAL_FITTED = "Real-fitted"
    DERIVED = "Derived"
    ASSUMED = "Assumed"


class AqiCategory(str, Enum):
    GOOD = "Good"
    SATISFACTORY = "Satisfactory"
    MODERATE = "Moderate"
    POOR = "Poor"
    VERY_POOR = "Very Poor"
    SEVERE = "Severe"


class ScenarioType(str, Enum):
    MISSED_DOSE = "missed_dose"
    ACUTE_EXERTION = "acute_exertion"
    SYMPATHETIC_SURGE = "sympathetic_surge"
    MEDICATION_ADJUSTMENT = "medication_adjustment"
    PRESCRIPTION_PLAN = "prescription_plan"


class AlertStatus(str, Enum):
    ACTIVE = "ACTIVE"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    ESCALATED = "ESCALATED"
    RESOLVED = "RESOLVED"


class BaseSchema(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        use_enum_values=True,
        arbitrary_types_allowed=True,
    )
