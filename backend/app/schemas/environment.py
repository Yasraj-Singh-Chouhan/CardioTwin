from typing import List, Optional
from pydantic import Field
from .common import BaseSchema, AqiCategory


class EnvironmentData(BaseSchema):
    city: str = Field(..., description="City or monitoring locale (e.g. 'Delhi NCR', 'Mumbai')")
    aqi: int = Field(..., description="Air Quality Index numeric value")
    aqi_category: AqiCategory = Field(..., description="CPCB category: Good, Satisfactory, Moderate, Poor, Very Poor, Severe")
    pm25_ug_m3: float = Field(..., description="Fine particulate matter concentration in µg/m³")
    temperature_c: float = Field(..., description="Ambient temperature in degrees Celsius")
    humidity_percent: float = Field(..., description="Relative humidity percentage")
    heat_wave_flag: bool = Field(default=False, description="Flag indicating extreme ambient heat warning")
    festival_flag: Optional[str] = Field(None, description="Active cultural or environmental event (e.g. 'Diwali peak marker', 'Winter smog')")
    station_name: str = Field(default="CPCB Central Sensor Station", description="Telemetry sensor source")


class PatientEnvironmentResponse(BaseSchema):
    patient_id: str = Field(..., description="Patient identifier")
    current_environment: EnvironmentData = Field(..., description="Live environmental readings aligned with telemetry clock")
    recent_forecast: List[EnvironmentData] = Field(default_factory=list, description="Recent 3-7 day historical and forecast microclimate series")
    biophysical_impact_summary: str = Field(
        default="Correlates particulate density (PM2.5), nocturnal ambient chill, and autonomic tone fluctuations. PM2.5 elevation promotes systemic vasoconstriction and microvascular endothelial tone elevation.",
        description="Clinical rationale for environmental integration"
    )
