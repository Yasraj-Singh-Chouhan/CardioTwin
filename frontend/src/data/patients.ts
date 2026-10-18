// Hardcoded patient data for the demo
export type RiskTier = 'critical' | 'high' | 'elevated' | 'moderate' | 'low';

export interface Patient {
  id: string;
  name: string;
  initials: string;
  age: number;
  sex: string;
  city: string;
  riskTier: RiskTier;
  prob6h: number;  // percent
  prob12h: number; // percent
  daysToRisk: string;
  syncLabel: string;
  syncTime: string;
  conditions: string[];
}

export const PATIENTS: Patient[] = [
  {
    id: 'CT-3092',
    name: 'Rajesh Verma',
    initials: 'RV',
    age: 58,
    sex: 'M',
    city: 'Delhi NCR',
    riskTier: 'critical',
    prob6h: 84,
    prob12h: 92,
    daysToRisk: '0.2 d (4.8h)',
    syncLabel: 'Continuous PPG/BP',
    syncTime: '2m ago',
    conditions: ['Hypertension (Stage 2)', 'T2 Diabetes'],
  },
  {
    id: 'CT-0114',
    name: 'Anil Joshi',
    initials: 'AJ',
    age: 58,
    sex: 'M',
    city: 'Hyderabad',
    riskTier: 'critical',
    prob6h: 79,
    prob12h: 88,
    daysToRisk: '0.3 d (5.6h)',
    syncLabel: 'Continuous PPG/BP',
    syncTime: '5m ago',
    conditions: ['Hypertension (Stage 2)', 'T2 Diabetes'],
  },
  {
    id: 'CT-0042',
    name: 'Ritu Mishra',
    initials: 'RM',
    age: 63,
    sex: 'F',
    city: 'Mumbai',
    riskTier: 'high',
    prob6h: 68,
    prob12h: 77,
    daysToRisk: '0.5 d (10.2h)',
    syncLabel: 'Wearable Sync',
    syncTime: '8m ago',
    conditions: ['Hypertension (Stage 2)', 'T2 Diabetes'],
  },
  {
    id: 'CT-0002',
    name: 'Harish Bhat',
    initials: 'HB',
    age: 50,
    sex: 'M',
    city: 'Kolkata',
    riskTier: 'high',
    prob6h: 61,
    prob12h: 70,
    daysToRisk: '0.7 d (16.4h)',
    syncLabel: 'Continuous Tonometry',
    syncTime: '11m ago',
    conditions: ['Hypertension (Stage 2)', 'Dyslipidemia'],
  },
  {
    id: 'CT-0003',
    name: 'Usha Verma',
    initials: 'UV',
    age: 44,
    sex: 'F',
    city: 'Delhi NCR',
    riskTier: 'elevated',
    prob6h: 38,
    prob12h: 48,
    daysToRisk: '1.5 d',
    syncLabel: 'Wearable Sync',
    syncTime: '14m ago',
    conditions: ['Hypertension (Stage 2)', 'Tobacco Chewing'],
  },
  {
    id: 'CT-0001',
    name: 'Priya Joshi',
    initials: 'PJ',
    age: 41,
    sex: 'F',
    city: 'Bengaluru',
    riskTier: 'moderate',
    prob6h: 22,
    prob12h: 32,
    daysToRisk: '>14 d',
    syncLabel: 'Continuous PPG',
    syncTime: '18m ago',
    conditions: ['Normotensive', 'Dyslipidemia'],
  },
];

export const PATIENT_MAP = Object.fromEntries(PATIENTS.map(p => [p.id, p]));

export const RISK_TIER_CONFIG: Record<RiskTier, {
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
  ping: boolean;
  avatarBg: string;
  avatarText: string;
}> = {
  critical: {
    label: 'Critical',
    color: '#991B1F',
    bg: 'rgba(229,72,77,0.15)',
    border: 'rgba(229,72,77,0.40)',
    dot: '#E5484D',
    ping: true,
    avatarBg: 'rgba(186,26,26,0.10)',
    avatarText: '#ba1a1a',
  },
  high: {
    label: 'High',
    color: '#A3381B',
    bg: 'rgba(242,112,79,0.14)',
    border: 'rgba(242,112,79,0.35)',
    dot: '#F2704F',
    ping: false,
    avatarBg: 'rgba(242,112,79,0.10)',
    avatarText: '#A3381B',
  },
  elevated: {
    label: 'Elevated',
    color: '#8E6200',
    bg: 'rgba(245,184,61,0.14)',
    border: 'rgba(245,184,61,0.35)',
    dot: '#F5B83D',
    ping: false,
    avatarBg: 'rgba(245,184,61,0.15)',
    avatarText: '#8E6200',
  },
  moderate: {
    label: 'Moderate',
    color: '#00666F',
    bg: 'rgba(0,102,111,0.12)',
    border: 'rgba(0,102,111,0.30)',
    dot: '#00666F',
    ping: false,
    avatarBg: 'rgba(0,102,111,0.10)',
    avatarText: '#00666F',
  },
  low: {
    label: 'Low',
    color: '#196C57',
    bg: 'rgba(47,191,155,0.12)',
    border: 'rgba(47,191,155,0.30)',
    dot: '#2FBF9B',
    ping: false,
    avatarBg: 'rgba(47,191,155,0.10)',
    avatarText: '#196C57',
  },
};

export function getRiskTierConfig(tier?: string) {
  const key = (tier || 'low').toLowerCase() as RiskTier;
  return RISK_TIER_CONFIG[key] || RISK_TIER_CONFIG.low;
}
