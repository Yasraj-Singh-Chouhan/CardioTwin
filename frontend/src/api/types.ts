export type RiskTier = 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MODERATE' | 'LOW';

export interface HealthResponse {
  status: string;
  version: string;
  engine_mode: string;
  uptime_seconds?: number;
  models_loaded?: Record<string, boolean>;
}

export interface PatientSummary {
  patient_id: string;
  name: string;
  initials: string;
  age: number;
  sex: string;
  city: string;
  risk_tier: RiskTier;
  fused_risk_score: number;
  crisis_prob_6h: number;
  crisis_prob_12h: number;
  days_to_risk: string;
  telemetry_sync: string;
  telemetry_mode: string;
}

export interface PatientListResponse {
  total_monitored: number;
  active_inflow_count: number;
  critical_alerts_count: number;
  high_alerts_count: number;
  avg_warning_window_hours: number;
  avg_drift_index: number;
  items: PatientSummary[];
}

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  adherence_score: number;
  last_taken_time: string;
  missed_doses_count: number;
  omission_interval_hours: number;
}

export interface PatientDetailResponse {
  patient_id: string;
  name: string;
  initials: string;
  age: number;
  sex: string;
  city: string;
  avatar_url?: string;
  primary_condition: string;
  secondary_conditions: string[];
  htn_stage: string;
  diabetes_type: string;
  diabetes_duration_years: number;
  htn_duration_years: number;
  prior_mi: boolean;
  prior_pci_cabg: boolean;
  family_history_premature_cvd: boolean;
  tobacco_chewing: boolean;
  smoking_status: string;
  dietary_pattern: string;
  bmi: number;
  bmi_flagged: boolean;
  waist_circumference_cm: number;
  risk_tier: RiskTier;
  fused_risk_score: number;
  medications: MedicationItem[];
}

export interface WindkesselParameters {
  r_peripheral: number;
  r_peripheral_shift_percent: number;
  c_arterial: number;
  z_characteristic: number;
  stroke_volume_ml: number;
  cardiac_output_l_min: number;
  biofit_tolerance_percent: number;
}

export interface TwinScaleMetrics {
  chronic_twin_score: number;
  chronic_twin_label: string;
  acute_twin_score: number;
  acute_twin_label: string;
  composite_stress_percent: number;
}

export interface MicrovascularState {
  augmentation_index: string;
  status: string;
}

export interface TwinStateResponse {
  patient_id: string;
  fused_risk_score: number;
  risk_tier: RiskTier;
  windkessel_params: WindkesselParameters;
  scales: TwinScaleMetrics;
  days_to_risk: string;
  delta_tdi: number;
  calibration_status: string;
  microvascular_state: MicrovascularState;
  last_calibrated_at: string;
  next_recalibration_estimate: string;
  disclaimer: string;
}

export interface TrajectoryPoint {
  offset_hours: number;
  timestamp: string;
  is_forecast: boolean;
  observed_sbp: number | null;
  observed_dbp: number | null;
  predicted_sbp: number;
  predicted_dbp: number;
  upper_envelope_sbp: number | null;
  lower_envelope_sbp: number | null;
}

export interface PredictionsResponse {
  patient_id: string;
  event_name: string;
  recorded_current_bp: string;
  crisis_prob_6h: number;
  crisis_prob_12h: number;
  crisis_eta_hours: number;
  forecast_peak_sbp: number;
  forecast_peak_dbp: number;
  forecast_peak_eta_text: string;
  crisis_threshold_sbp: number;
  crisis_threshold_dbp: number;
  rhythm_irregularity_detected: boolean;
  rhythm_irregularity_label: string;
  trajectory: TrajectoryPoint[];
}

export interface CascadeNode {
  node_index: number;
  node_tag: string;
  title: string;
  subtitle: string;
  metric_label: string;
  metric_value: string;
  phase_label: string;
  icon_name: string;
}

export interface ShapContribution {
  feature_name: string;
  contribution_value: number;
  direction: 'increases_risk' | 'decreases_risk';
  category: string;
}

export interface ExplanationResponse {
  patient_id: string;
  primary_alert_level: string;
  biophysical_synthesis: string;
  simulation_confidence_percent: number;
  windkessel_biofit_label: string;
  pathway_nature: string;
  cascade_nodes: CascadeNode[];
  shap_contributions: ShapContribution[];
}

export interface TrajectoryComparisonPoint {
  hour: number;
  baseline_sbp: number;
  scenario_sbp: number;
  baseline_dbp: number;
  scenario_dbp: number;
}

export interface ScenarioResponse {
  patient_id: string;
  scenario_type: string;
  scenario_title: string;
  state_label: string;
  baseline_peak_sbp: number;
  perturbed_peak_sbp: number;
  baseline_risk_score: number;
  perturbed_risk_score: number;
  risk_tier_before: RiskTier;
  risk_tier_after: RiskTier;
  eta_to_threshold_hours: number;
  trajectory_comparison: TrajectoryComparisonPoint[];
  plain_language_impact: string;
  disclaimer: string;
}

export interface ScenarioRequest {
  scenario_type: 'missed_dose' | 'acute_exertion' | 'sympathetic_surge' | 'medication_adjustment' | 'prescription_plan';
  duration_hours?: number;
  severity_level?: 'mild' | 'moderate' | 'severe';
  prescription_rank?: number;
  plan_title?: string;
}

export interface PrescriptionOption {
  rank: number;
  title: string;
  description: string;
  difficulty_cost: number;
  target_risk_tier: RiskTier;
  projected_risk_score: number;
  changes: Record<string, unknown>;
}

export interface PrescriptionsResponse {
  patient_id: string;
  current_risk_tier: RiskTier;
  target_risk_tier: RiskTier;
  ranked_options: PrescriptionOption[];
  disclaimer: string;
}

export interface DriftPoint {
  date: string;
  day_label: string;
  tdi_score: number;
  flag: string | null;
}

export interface DriftFactorContribution {
  factor_name: string;
  percentage: number;
  direction: string;
  baseline_value: string;
  observed_value: string;
  signal_snr: string;
  confidence: string;
}

export interface TwinDriftResponse {
  patient_id: string;
  current_tdi: number;
  nominal_threshold: number;
  alert_threshold: number;
  status: string;
  seven_day_trend: DriftPoint[];
  factor_contributions: DriftFactorContribution[];
}

export interface EnvironmentData {
  city: string;
  aqi: number;
  aqi_category: string;
  pm25_ug_m3: number;
  temperature_c: number;
  humidity_percent: number;
  heat_wave_flag: boolean;
  festival_flag: string | null;
  station_name: string;
}

export interface PatientEnvironmentResponse {
  patient_id: string;
  current_environment: EnvironmentData;
  recent_forecast: EnvironmentData[];
  biophysical_impact_summary: string;
}

export interface ClinicalAlert {
  id: string;
  patient_id: string;
  timestamp: string;
  tier: RiskTier;
  stage_label: string;
  primary_concern: string;
  crisis_prob_6h: number;
  crisis_prob_12h: number;
  warning_window_hours: number;
  eta_to_threshold: string;
  trigger_summary: string;
  recommended_action: string;
  status: string;
  escalation_protocol?: string;
  triage_unit?: string;
  acknowledged_at?: string;
  escalated_at?: string;
}

export interface CalibrationResponse {
  status: string;
  patient_id: string;
  calibrated_at: string;
  calibrated_rp: number;
  calibrated_c: number;
  calibrated_sbp: number;
  calibrated_dbp: number;
  new_tdi: number;
  status_label: string;
  disclaimer: string;
}

export interface AuditVerificationResponse {
  status: string;
  cohort_id: string;
  audit_hash: string;
  sha256_checksum: string;
  verified_at: string;
  integrity_status: string;
  records_verified: number;
  cdsco_sandbox_rule: string;
  validator_signature: string;
  details: {
    ks_test_divergence: string;
    demographic_alignment: string;
    synthetic_fidelity: string;
    provenance_fields_count: number;
  };
}

export interface WearableDataPoint {
  timestamp: string;
  heart_rate: number;
  hrv_rmssd: number;
  hrv_sdnn: number;
  hrv_lf_hf: number;
  systolic_bp: number;
  diastolic_bp: number;
  mean_arterial_pressure: number;
  spo2: number;
  step_count: number;
  active_minutes: number;
  sedentary_minutes: number;
  sleep_stage?: string | null;
}

export interface WearableSeriesResponse {
  patient_id: string;
  window_start: string;
  window_end: string;
  sampling_resolution: string;
  data_points: WearableDataPoint[];
}

export interface QuickSearchResult {
  patient_id: string;
  name: string;
  city: string;
  age: number;
  sex: string;
  risk_tier: RiskTier;
}

export interface AlertActionResponse {
  status: string;
  alert_id: string;
  patient_id: string;
  protocol?: string;
  triage_unit?: string;
  acknowledged_at?: string;
  escalated_at?: string;
  state?: string;
  message?: string;
}

export interface AlertsListResponse {
  patient_id: string;
  alerts: ClinicalAlert[];
}

export interface ProvenanceRow {
  field_name: string;
  status: 'Real-fitted' | 'Derived' | 'Assumed';
  source: string;
  biophysical_notes: string;
}

export interface KpiMetrics {
  in_silico_patients: number;
  cohort_id: string;
  parameterization_percent: number;
  longitudinal_window_days: number;
  epochs_per_subject: number;
  crisis_episode_prevalence_percent: number;
  crisis_cases_count: number;
  total_cases: number;
}

export interface DatasheetResponse {
  system_name: string;
  regulatory_framework: string;
  disclaimer: string;
  audit_hash: string;
  kpi: KpiMetrics;
  provenance_rows: ProvenanceRow[];
}

export interface NursingBedItem {
  bed_id: string;
  patient_id: string;
  patient_name: string;
  age_gender: string;
  admit_diagnosis: string;
  sbp: number;
  dbp: number;
  hr: number;
  spo2: number;
  alarm_state: 'NOMINAL' | 'WATCH' | 'CRITICAL' | 'ACKNOWLEDGED';
  acknowledged: boolean;
  acknowledged_by?: string | null;
  audio_silenced: boolean;
  iv_infusion: string;
  last_nurse_check: string;
}

export interface NursingDeskResponse {
  status: string;
  station_name: string;
  nurse_in_charge: string;
  attending_on_duty: string;
  timestamp: string;
  total_beds: number;
  occupied_beds: number;
  critical_alarms: number;
  beds: NursingBedItem[];
}

export interface CathLabQueueItem {
  triage_id: string;
  patient_id: string;
  patient_name: string;
  age_gender: string;
  priority: string;
  protocol: string;
  escalated_by: string;
  escalated_at: string;
  door_to_procedure_elapsed_mins: number;
  target_max_mins: number;
  sbp: number;
  dbp: number;
  map: number;
  target_room: string;
  status: string;
  prep_checklist: {
    dual_antiplatelet_loaded: boolean;
    creatinine_cleared: boolean;
    radial_access_prepped: boolean;
    consent_obtained: boolean;
  };
}

export interface CathLabRoomItem {
  room_id: string;
  equipment: string;
  status: string;
  on_duty_tech: string;
  scrub_nurse: string;
}

export interface CathLabQueueResponse {
  status: string;
  facility: string;
  director: string;
  rooms: CathLabRoomItem[];
  queue: CathLabQueueItem[];
}

export interface AuditTrailEvent {
  event_id: string;
  timestamp: string;
  patient_id: string;
  action: string;
  details: string;
  operator: string;
  cdsco_hash: string;
}

export interface AuditTrailResponse {
  status: string;
  standard: string;
  cryptographic_ledger: string;
  total_records: number;
  events: AuditTrailEvent[];
}

