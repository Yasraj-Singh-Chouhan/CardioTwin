import type {
  HealthResponse,
  PatientListResponse,
  PatientDetailResponse,
  TwinStateResponse,
  PredictionsResponse,
  ExplanationResponse,
  ScenarioResponse,
  ScenarioRequest,
  PrescriptionsResponse,
  TwinDriftResponse,
  PatientEnvironmentResponse,
  AlertsListResponse,
  ClinicalAlert,
  DatasheetResponse,
  CalibrationResponse,
  AuditVerificationResponse,
  WearableSeriesResponse,
  QuickSearchResult,
  AlertActionResponse,
  RiskTier,
  NursingDeskResponse,
  CathLabQueueResponse,
  AuditTrailResponse,
} from './types';

// Import JSON mocks directly for instant offline serving
import mockHealth from '../mocks/health.json';
import mockPatients from '../mocks/patients.json';
import mockPatientDetail from '../mocks/patient_detail.json';
import mockPatientTwin from '../mocks/patient_twin.json';
import mockPredictions from '../mocks/patient_predictions.json';
import mockExplanation from '../mocks/patient_explanation.json';
import mockScenarioResult from '../mocks/patient_scenario_result.json';
import mockPrescriptions from '../mocks/patient_prescriptions.json';
import mockDrift from '../mocks/patient_drift.json';
import mockEnvironment from '../mocks/patient_environment.json';
import mockAlerts from '../mocks/patient_alerts.json';
import mockDatasheet from '../mocks/datasheet.json';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function fetchFromApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// 1. Health
export async function getHealth(): Promise<HealthResponse> {
  if (USE_MOCKS) return mockHealth as unknown as HealthResponse;
  return fetchFromApi<HealthResponse>('/api/health');
}

// 2. Patients list
export async function getPatients(params?: { tier?: RiskTier | 'all'; search?: string }): Promise<PatientListResponse> {
  if (USE_MOCKS) {
    const list = mockPatients as unknown as PatientListResponse;
    let filtered = [...list.items];

    if (params?.tier && params.tier !== 'all') {
      filtered = filtered.filter(p => p.risk_tier.toUpperCase() === params.tier?.toUpperCase());
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.patient_id.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q)
      );
    }

    return {
      ...list,
      items: filtered,
    };
  }

  const searchParams = new URLSearchParams();
  if (params?.tier && params.tier !== 'all') searchParams.set('tier', params.tier);
  if (params?.search) searchParams.set('search', params.search);

  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  return fetchFromApi<PatientListResponse>(`/api/patients${query}`);
}

// 3. Patient clinical detail
export async function getPatientDetail(patientId: string): Promise<PatientDetailResponse> {
  if (USE_MOCKS) {
    const detail = mockPatientDetail as unknown as PatientDetailResponse;
    return { ...detail, patient_id: patientId };
  }
  return fetchFromApi<PatientDetailResponse>(`/api/patients/${encodeURIComponent(patientId)}`);
}

// 4. Digital twin state
export async function getTwinState(patientId: string): Promise<TwinStateResponse> {
  if (USE_MOCKS) {
    const twin = mockPatientTwin as unknown as TwinStateResponse;
    return { ...twin, patient_id: patientId };
  }
  return fetchFromApi<TwinStateResponse>(`/api/patients/${encodeURIComponent(patientId)}/twin`);
}

// 5. Predictions & Trajectory
export async function getPredictions(patientId: string): Promise<PredictionsResponse> {
  if (USE_MOCKS) {
    const pred = mockPredictions as unknown as PredictionsResponse;
    return { ...pred, patient_id: patientId };
  }
  return fetchFromApi<PredictionsResponse>(`/api/patients/${encodeURIComponent(patientId)}/predictions`);
}

// 6. Biophysical Explanation & SHAP
export async function getExplanation(patientId: string): Promise<ExplanationResponse> {
  if (USE_MOCKS) {
    const exp = mockExplanation as unknown as ExplanationResponse;
    return { ...exp, patient_id: patientId };
  }
  return fetchFromApi<ExplanationResponse>(`/api/patients/${encodeURIComponent(patientId)}/explanation`);
}

// 7. Scenarios simulation
export async function runScenario(patientId: string, req?: ScenarioRequest): Promise<ScenarioResponse> {
  if (USE_MOCKS) {
    const res = mockScenarioResult as unknown as ScenarioResponse;
    return {
      ...res,
      patient_id: patientId,
      scenario_type: req?.scenario_type || 'missed_dose',
    };
  }
  return fetchFromApi<ScenarioResponse>(`/api/patients/${encodeURIComponent(patientId)}/scenarios`, {
    method: 'POST',
    body: JSON.stringify(req || { scenario_type: 'missed_dose' }),
  });
}

// 8. Ranked countermeasure prescriptions
export async function getPrescriptions(patientId: string): Promise<PrescriptionsResponse> {
  if (USE_MOCKS) {
    const rx = mockPrescriptions as unknown as PrescriptionsResponse;
    return { ...rx, patient_id: patientId };
  }
  return fetchFromApi<PrescriptionsResponse>(`/api/patients/${encodeURIComponent(patientId)}/prescriptions`, {
    method: 'POST',
  });
}

// 9. Twin Drift Index & factor breakdown
export async function getTwinDrift(patientId: string): Promise<TwinDriftResponse> {
  if (USE_MOCKS) {
    const drift = mockDrift as unknown as TwinDriftResponse;
    return { ...drift, patient_id: patientId };
  }
  return fetchFromApi<TwinDriftResponse>(`/api/patients/${encodeURIComponent(patientId)}/drift`);
}

// 10. Environment & Microclimate
export async function getPatientEnvironment(patientId: string): Promise<PatientEnvironmentResponse> {
  if (USE_MOCKS) {
    const env = mockEnvironment as unknown as PatientEnvironmentResponse;
    return { ...env, patient_id: patientId };
  }
  return fetchFromApi<PatientEnvironmentResponse>(`/api/patients/${encodeURIComponent(patientId)}/environment`);
}

// 11. Alerts list
export async function getPatientAlerts(patientId: string): Promise<AlertsListResponse> {
  if (USE_MOCKS) {
    const alt = mockAlerts as unknown as AlertsListResponse;
    return { ...alt, patient_id: patientId };
  }
  return fetchFromApi<AlertsListResponse>(`/api/patients/${encodeURIComponent(patientId)}/alerts`);
}

// 12. Datasheet & Provenance
export async function getDatasheet(): Promise<DatasheetResponse> {
  if (USE_MOCKS) {
    return mockDatasheet as unknown as DatasheetResponse;
  }
  return fetchFromApi<DatasheetResponse>('/api/datasheet');
}

// 13. Acknowledge alert
export async function acknowledgeAlert(patientId: string, alertId: string): Promise<AlertActionResponse> {
  if (USE_MOCKS) {
    return {
      status: 'success',
      alert_id: alertId,
      patient_id: patientId,
      acknowledged_at: new Date().toISOString(),
      state: 'ACKNOWLEDGED',
      message: `Alert ${alertId} acknowledged successfully.`
    };
  }
  return fetchFromApi<AlertActionResponse>(`/api/patients/${encodeURIComponent(patientId)}/alerts/${encodeURIComponent(alertId)}/acknowledge`, {
    method: 'POST',
  });
}

// 14. Escalate alert
export async function escalateAlert(patientId: string, alertId: string, protocol = "Stat CCU Triage & Continuous Tonometry"): Promise<AlertActionResponse> {
  if (USE_MOCKS) {
    return {
      status: 'escalated',
      alert_id: alertId,
      patient_id: patientId,
      protocol,
      triage_unit: 'Cath Lab / Coronary Care Unit (CCU)',
      escalated_at: new Date().toISOString(),
      message: `Patient ${patientId} successfully escalated under ${protocol}.`
    };
  }
  return fetchFromApi<AlertActionResponse>(`/api/patients/${encodeURIComponent(patientId)}/alerts/${encodeURIComponent(alertId)}/escalate?protocol=${encodeURIComponent(protocol)}`, {
    method: 'POST',
  });
}

// 15. Global alerts feed
export async function getAlertsFeed(): Promise<ClinicalAlert[]> {
  if (USE_MOCKS) {
    const list = mockAlerts as unknown as AlertsListResponse;
    return list.alerts;
  }
  return fetchFromApi<ClinicalAlert[]>('/api/patients/alerts/feed');
}

// 16. In Silico Calibration
export async function calibrateTwin(patientId: string): Promise<CalibrationResponse> {
  if (USE_MOCKS) {
    return {
      status: 'success',
      patient_id: patientId,
      calibrated_at: new Date().toISOString(),
      calibrated_rp: 1.12,
      calibrated_c: 0.98,
      calibrated_sbp: 134.5,
      calibrated_dbp: 84.0,
      new_tdi: 14.0,
      status_label: 'CALIBRATED (Aligned with live tonometry)',
      disclaimer: 'Physiological alignment complete.'
    };
  }
  return fetchFromApi<CalibrationResponse>(`/api/patients/${encodeURIComponent(patientId)}/calibrate`, {
    method: 'POST',
  });
}

// 17. Reset calibration
export async function resetCalibration(patientId: string): Promise<{ status: string; patient_id: string; message: string }> {
  if (USE_MOCKS) {
    return { status: 'reset', patient_id: patientId, message: 'Calibration reset.' };
  }
  return fetchFromApi<{ status: string; patient_id: string; message: string }>(`/api/patients/${encodeURIComponent(patientId)}/reset-calibration`, {
    method: 'POST',
  });
}

// 18. Export CDSCO Dossier
export async function exportDatasheetDossier(): Promise<any> {
  if (USE_MOCKS) {
    return {
      document_title: 'CardioTwin CDSCO Class B SaMD Exploratory Technical Dossier (Offline Mock)',
      generation_timestamp: new Date().toISOString(),
      datasheet: mockDatasheet,
    };
  }
  return fetchFromApi<any>('/api/datasheet/export');
}

// 19. Verify Audit Hash
export async function verifyAuditHash(): Promise<AuditVerificationResponse> {
  if (USE_MOCKS) {
    return {
      status: 'verified',
      cohort_id: 'CT-IND-V4',
      audit_hash: '0x9f7a62b14c3e88d04e5781a8b417c8033c2e1189d2a6e9f0',
      sha256_checksum: '9f7a62b14c3e88d04e5781a8b417c8033c2e1189d2a6e9f06bf2b5e1a3d90f28',
      verified_at: new Date().toISOString(),
      integrity_status: 'VALID_IMMUTABLE',
      records_verified: 1000,
      cdsco_sandbox_rule: 'CDSCO Class B SaMD Exploratory Sandbox',
      validator_signature: 'CardioTwin_Biophysical_Engine_Signer_v4.8b',
      details: {
        ks_test_divergence: 'D=0.018 (Passes 95% CI)',
        demographic_alignment: 'South Asian Phenotype (ICMR / NFHS-5)',
        synthetic_fidelity: '98.2% Wasserstein bio-fit',
        provenance_fields_count: 8,
      }
    };
  }
  return fetchFromApi<AuditVerificationResponse>('/api/datasheet/audit-verify');
}

// 20. Wearable series & telemetry raw
export async function getPatientWearable(patientId: string, windowHours = 24, limit = 100): Promise<WearableSeriesResponse> {
  if (USE_MOCKS) {
    const now = Date.now();
    const count = Math.min(limit, 24);
    const data_points = Array.from({ length: count }, (_, i) => {
      const t = new Date(now - (count - 1 - i) * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const phase = (i / count) * Math.PI * 2;
      const hr = Math.round(72 + Math.sin(phase) * 10);
      const sbp = Math.round(152 + Math.sin(phase) * 16 + (i > 14 ? 14 : 0));
      const dbp = Math.round(92 + Math.sin(phase) * 8 + (i > 14 ? 8 : 0));
      return {
        timestamp: t,
        heart_rate: hr,
        hrv_rmssd: Number((22 - Math.sin(phase) * 6).toFixed(1)),
        hrv_sdnn: Number((44 - Math.sin(phase) * 8).toFixed(1)),
        hrv_lf_hf: Number((2.4 + Math.sin(phase) * 0.5).toFixed(2)),
        systolic_bp: sbp,
        diastolic_bp: dbp,
        mean_arterial_pressure: Math.round(dbp + (sbp - dbp) / 3),
        spo2: Math.min(99, Math.round(96 + (i % 3))),
        step_count: 240 + Math.round(Math.abs(Math.sin(phase)) * 400),
        active_minutes: 15,
        sedentary_minutes: 45,
      };
    });
    return {
      patient_id: patientId,
      window_start: new Date(now - count * 3600000).toISOString(),
      window_end: new Date(now).toISOString(),
      sampling_resolution: '1-hour aggregated epoch',
      data_points,
    };
  }
  return fetchFromApi<WearableSeriesResponse>(`/api/patients/${encodeURIComponent(patientId)}/wearable?window_hours=${windowHours}&limit=${limit}`);
}

// 21. Quick search
export async function quickSearchPatients(query: string): Promise<QuickSearchResult[]> {
  if (USE_MOCKS) {
    const list = mockPatients as unknown as PatientListResponse;
    const q = query.toLowerCase();
    return list.items
      .filter(p => p.name.toLowerCase().includes(q) || p.patient_id.toLowerCase().includes(q) || p.city.toLowerCase().includes(q))
      .slice(0, 6)
      .map(p => ({
        patient_id: p.patient_id,
        name: p.name,
        city: p.city,
        age: p.age,
        sex: p.sex,
        risk_tier: p.risk_tier,
      }));
  }
  return fetchFromApi<QuickSearchResult[]>(`/api/patients/search/quick?q=${encodeURIComponent(query)}`);
}

// 22. Central Nursing Desk Status
export async function getNursingDeskStatus(): Promise<NursingDeskResponse> {
  if (USE_MOCKS) {
    return {
      status: 'active',
      station_name: 'Coronary Care Unit (CCU) — Central Telemetry Desk',
      nurse_in_charge: 'Staff Nurse Sunita Rao, RN',
      attending_on_duty: 'Dr. Arvind Swaminathan, MD, DM (Cardiology)',
      timestamp: new Date().toISOString(),
      total_beds: 8,
      occupied_beds: 7,
      critical_alarms: 2,
      beds: [
        {
          bed_id: 'CCU-01',
          patient_id: 'CT-3092',
          patient_name: 'Rajesh Verma',
          age_gender: '58M',
          admit_diagnosis: 'Accelerated Malignant HTN Surge & Autonomic Drift',
          sbp: 184,
          dbp: 116,
          hr: 94,
          spo2: 97,
          alarm_state: 'CRITICAL',
          acknowledged: false,
          audio_silenced: false,
          iv_infusion: 'IV Labetalol 2 mg/min titrating',
          last_nurse_check: '3 mins ago',
        },
        {
          bed_id: 'CCU-02',
          patient_id: 'CT-0114',
          patient_name: 'Priya Sharma',
          age_gender: '52F',
          admit_diagnosis: 'Hypertensive Urgency with Metabolic Dysregulation',
          sbp: 172,
          dbp: 104,
          hr: 86,
          spo2: 98,
          alarm_state: 'WATCH',
          acknowledged: true,
          acknowledged_by: 'Dr. Arvind Swaminathan',
          audio_silenced: false,
          iv_infusion: 'Oral Amlodipine 10mg + Telmisartan 80mg',
          last_nurse_check: '12 mins ago',
        },
        {
          bed_id: 'CCU-03',
          patient_id: 'CT-0042',
          patient_name: 'Amit Patel',
          age_gender: '64M',
          admit_diagnosis: 'Post-CABG Secondary Refractory HTN',
          sbp: 168,
          dbp: 98,
          hr: 82,
          spo2: 96,
          alarm_state: 'WATCH',
          acknowledged: true,
          audio_silenced: false,
          iv_infusion: 'Nitroglycerin patch 5mg/24h',
          last_nurse_check: '20 mins ago',
        },
        {
          bed_id: 'CCU-04',
          patient_id: 'CT-0002',
          patient_name: 'Vikram Joshi',
          age_gender: '61M',
          admit_diagnosis: 'Hypertensive Encephalopathy Risk Profile',
          sbp: 188,
          dbp: 118,
          hr: 102,
          spo2: 95,
          alarm_state: 'CRITICAL',
          acknowledged: false,
          audio_silenced: false,
          iv_infusion: 'IV Nicardipine infusion 5 mg/h',
          last_nurse_check: '1 min ago',
        },
      ],
    };
  }
  return fetchFromApi<NursingDeskResponse>('/api/patients/alerts/nursing-desk');
}

// 23. Cath Lab Triage Queue
export async function getCathLabQueue(): Promise<CathLabQueueResponse> {
  if (USE_MOCKS) {
    return {
      status: 'operational',
      facility: 'Apex Heart & Vascular Institute, Bengaluru',
      director: 'Prof. K. Venkatesh, MD, FACC',
      rooms: [
        {
          room_id: 'Cath Lab Suite 1',
          equipment: 'Siemens Artis Q Biplane',
          status: 'In Procedure (Door-to-Balloon active)',
          on_duty_tech: 'S. Raman',
          scrub_nurse: 'Sister Ancy',
        },
        {
          room_id: 'Cath Lab Suite 2',
          equipment: 'Philips Azurion 7',
          status: 'Standby / Ready for Stat Triage',
          on_duty_tech: 'M. Patil',
          scrub_nurse: 'Sister Mini',
        },
      ],
      queue: [
        {
          triage_id: 'TR-2026-081',
          patient_id: 'CT-3092',
          patient_name: 'Rajesh Verma',
          age_gender: '58M',
          priority: 'STAT (Within 60 mins)',
          protocol: 'Stat CCU Triage & Continuous Tonometry',
          escalated_by: 'CardioTwin Autonomous Warning Engine',
          escalated_at: new Date().toISOString(),
          door_to_procedure_elapsed_mins: 18,
          target_max_mins: 60,
          sbp: 184,
          dbp: 116,
          map: 138,
          target_room: 'Cath Lab Suite 2',
          status: 'Radial Prepped & Consent Verified',
          prep_checklist: {
            dual_antiplatelet_loaded: true,
            creatinine_cleared: true,
            radial_access_prepped: true,
            consent_obtained: true,
          },
        },
      ],
    };
  }
  return fetchFromApi<CathLabQueueResponse>('/api/patients/alerts/cath-lab-queue');
}

// 24. Audit Trail Cryptographic Ledger
export async function getAuditTrail(): Promise<AuditTrailResponse> {
  if (USE_MOCKS) {
    return {
      status: 'valid',
      standard: 'CDSCO Class B SaMD & 21 CFR Part 11 Regulatory Audit Trail',
      cryptographic_ledger: 'SHA-256 Merkle-Chained Ledger (Zero Tampering Detected)',
      total_records: 12,
      events: [
        {
          event_id: 'EVT-9041',
          timestamp: new Date().toISOString(),
          patient_id: 'CT-3092',
          action: 'CRISIS_TRAJECTORY_FLAGGED',
          details: 'Predicted SBP breach 182 mmHg within 4.2h. Autonomic uncoupling detected.',
          operator: 'FastTwinEngine_v4.2',
          cdsco_hash: '0x9f7a62b14c3e88d04e5781a8b417c8033c2e1189d2a6e9f0',
        },
        {
          event_id: 'EVT-9042',
          timestamp: new Date().toISOString(),
          patient_id: 'CT-3092',
          action: 'CLINICIAN_ALERT_ACKNOWLEDGED',
          details: 'Attending physician acknowledged crisis risk trajectory.',
          operator: 'Dr. Arvind Swaminathan (MD, DM)',
          cdsco_hash: '0x3c2e1189d2a6e9f06bf2b5e1a3d90f28b417c803',
        },
        {
          event_id: 'EVT-9043',
          timestamp: new Date().toISOString(),
          patient_id: 'CT-3092',
          action: 'CATH_LAB_STAT_ESCALATED',
          details: 'Coronary Care Unit bed reserved and Cath Lab Suite 2 placed on pre-op standby.',
          operator: 'Staff Nurse Sunita Rao, RN',
          cdsco_hash: '0x4e5781a8b417c8033c2e1189d2a6e9f09f7a62b1',
        },
      ],
    };
  }
  return fetchFromApi<AuditTrailResponse>('/api/patients/alerts/audit-trail');
}



