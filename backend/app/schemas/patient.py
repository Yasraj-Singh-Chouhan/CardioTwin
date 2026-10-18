from datetime import datetime
from typing import List, Optional
from pydantic import Field
from .common import BaseSchema, RiskTier


class MedicationItem(BaseSchema):
    id: str = Field(..., description="Unique medication identifier")
    name: str = Field(..., description="Drug name (e.g. Amlodipine, Telmisartan)")
    dosage: str = Field(..., description="Dose description (e.g. 5mg)")
    frequency: str = Field(..., description="Frequency (e.g. Once daily OD)")
    adherence_score: float = Field(..., description="Adherence fraction 0.0 to 1.0")
    last_taken_time: Optional[datetime] = Field(None, description="Timestamp of last confirmed ingestion")
    missed_doses_count: int = Field(default=0, description="Consecutive missed doses")
    omission_interval_hours: Optional[float] = Field(None, description="Hours lapsed since scheduled dose")


class PatientSummary(BaseSchema):
    patient_id: str = Field(..., description="CardioTwin identifier (e.g. CT-3092)")
    name: str = Field(..., description="Patient name")
    initials: str = Field(..., description="Initials avatar (e.g. RV)")
    age: int = Field(..., description="Age in years")
    sex: str = Field(..., description="Sex (M/F)")
    city: str = Field(..., description="City or region in India (e.g. Delhi NCR)")
    risk_tier: RiskTier = Field(..., description="Triage status: CRITICAL, HIGH, ELEVATED, MODERATE, LOW")
    fused_risk_score: float = Field(..., description="Fused CardioTwin risk score (0-100)")
    crisis_prob_6h: float = Field(..., description="Crisis-range BP episode probability within 6 hours (0-100%)")
    crisis_prob_12h: float = Field(..., description="Crisis-range BP episode probability within 12 hours (0-100%)")
    days_to_risk: str = Field(..., description="Days-to-risk display string (e.g. '0.2 d (4.8h)', '3.0 d')")
    telemetry_sync: str = Field(..., description="Relative time since last telemetry packet (e.g. '2m ago')")
    telemetry_mode: str = Field(..., description="Active sensor stream (e.g. 'Continuous PPG/BP')")


class PatientListResponse(BaseSchema):
    total_monitored: int = Field(default=142, description="Total patients in clinical monitoring cohort")
    active_inflow_count: int = Field(default=8, description="New admissions past 24h")
    critical_alerts_count: int = Field(default=4, description="Count of critical tier patients")
    high_alerts_count: int = Field(default=10, description="Count of high tier patients")
    avg_warning_window_hours: float = Field(default=8.2, description="Average early warning window in hours")
    avg_drift_index: float = Field(default=0.18, description="Average cohort Twin Drift Index")
    items: List[PatientSummary] = Field(..., description="List of patient summary items")


class PatientDetailResponse(BaseSchema):
    patient_id: str = Field(..., description="CardioTwin ID (e.g. CT-3092)")
    name: str = Field(..., description="Patient full name")
    initials: str = Field(..., description="Patient initials")
    age: int = Field(..., description="Age in years")
    sex: str = Field(..., description="Sex (M/F)")
    city: str = Field(..., description="Indian city/region")
    avatar_url: Optional[str] = Field(None, description="Profile avatar picture")
    
    # Clinical history & phenotype
    primary_condition: str = Field(..., description="e.g. Hypertension (Stage 2)")
    secondary_conditions: List[str] = Field(default_factory=list, description="e.g. ['T2 Diabetes', 'Dyslipidemia']")
    htn_stage: str = Field(default="Stage 2", description="Hypertension stage")
    diabetes_type: Optional[str] = Field(default="T2DM", description="Diabetes classification")
    diabetes_duration_years: Optional[float] = Field(default=6.5, description="Duration of diabetes in years")
    htn_duration_years: Optional[float] = Field(default=11.0, description="Duration of hypertension in years")
    prior_mi: bool = Field(default=False, description="Prior myocardial infarction")
    prior_pci_cabg: bool = Field(default=False, description="Prior PCI or CABG revascularization")
    family_history_premature_cvd: bool = Field(default=True, description="Family history of premature CVD")
    tobacco_chewing: bool = Field(default=False, description="Tobacco chewing status")
    smoking_status: str = Field(default="Non-smoker", description="Smoking habit")
    dietary_pattern: str = Field(default="Vegetarian", description="Dietary pattern")
    
    # Biometric baselines (Indian specific thresholds)
    bmi: float = Field(..., description="BMI (kg/m²), Indian cutoff ≥23 kg/m²")
    bmi_flagged: bool = Field(default=True, description="Flagged under Indian visceral adiposity criteria")
    waist_circumference_cm: float = Field(default=96.0, description="Waist circumference in cm")
    
    # Current status & medications
    risk_tier: RiskTier = Field(..., description="Current fused risk tier")
    fused_risk_score: float = Field(..., description="Current fused risk score (0-100)")
    medications: List[MedicationItem] = Field(default_factory=list, description="Prescribed cardiovascular medications")
    baseline_sbp: float = Field(default=142.0, description="Resting baseline SBP (mmHg)")
    baseline_dbp: float = Field(default=90.0, description="Resting baseline DBP (mmHg)")
    baseline_resting_hr: float = Field(default=64.0, description="Baseline resting HR (bpm)")
    baseline_rmssd: float = Field(default=38.0, description="Baseline HRV RMSSD (ms)")
    
    sync_status: str = Field(default="Continuous PPG/BP", description="Telemetry source")
    last_sync: str = Field(default="2m ago", description="Last sync elapsed time")
    notes: Optional[str] = Field(
        default="Decision support only. Not a diagnosis. Evaluated on semi-synthetic cohort.",
        description="Clinical disclaimer"
    )
