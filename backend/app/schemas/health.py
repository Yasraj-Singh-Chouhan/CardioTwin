from datetime import datetime
from typing import Dict
from pydantic import Field
from .common import BaseSchema, EngineMode


class HealthResponse(BaseSchema):
    status: str = Field(default="healthy", description="Current service health status")
    service: str = Field(default="CardioTwin API", description="Service name")
    version: str = Field(default="4.8b", description="CardioTwin platform version")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Current server UTC timestamp")
    engine_mode: EngineMode = Field(default=EngineMode.LIVE_TWIN, description="Active twin engine operation mode")
    models_loaded: Dict[str, str] = Field(
        default_factory=lambda: {
            "slow_twin_chronic_risk": "Loaded",
            "fast_twin_crisis_model": "Loaded",
            "windkessel_arterial_solver": "Ready",
            "af_rhythm_detector": "Loaded",
            "shap_explainer": "Ready"
        },
        description="Initialization status of underlying physiological and ML models"
    )
    database_connected: bool = Field(default=True, description="Database connection health")
    uptime_seconds: float = Field(default=1240.5, description="Server uptime in seconds")
