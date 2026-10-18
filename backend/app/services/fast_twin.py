"""Fast Twin Service: Acute Hypertensive Crisis Prediction Engine.
Predicts the probability of crisis-range BP episodes (SBP ≥ 180 or DBP ≥ 120 mmHg)
at 6-hour and 12-hour horizons using LightGBM models + rolling biometrics.
Guarantees probability scores strictly in [0.0, 1.0].
"""
import math
from pathlib import Path
import pickle
from typing import Dict, Any, Tuple, Optional
try:
    import numpy as np
except ImportError:
    np = None

try:
    import pandas as pd
except ImportError:
    pd = None
from app.config import settings
from app.services.windkessel import WindkesselModel

MODELS_DIR = Path(settings.DATA_DIR).parent / "models"
if not MODELS_DIR.exists():
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

MODEL_6H_PATH = MODELS_DIR / "lgbm_crisis_6h.pkl"
MODEL_12H_PATH = MODELS_DIR / "lgbm_crisis_12h.pkl"

_MODEL_6H = None
_MODEL_12H = None


def get_models():
    """Load or cache trained LightGBM model instances."""
    global _MODEL_6H, _MODEL_12H
    if _MODEL_6H is None and MODEL_6H_PATH.exists():
        try:
            with open(MODEL_6H_PATH, "rb") as f:
                _MODEL_6H = pickle.load(f)
        except Exception:
            _MODEL_6H = None
    if _MODEL_12H is None and MODEL_12H_PATH.exists():
        try:
            with open(MODEL_12H_PATH, "rb") as f:
                _MODEL_12H = pickle.load(f)
        except Exception:
            _MODEL_12H = None
    return _MODEL_6H, _MODEL_12H


class FastTwinEngine:
    """Predicts acute hemodynamic crisis risk and ETA to threshold breach."""

    @classmethod
    def extract_4h_features(cls, df_wearable: pd.DataFrame, end_idx: Optional[int] = None) -> Dict[str, float]:
        """Extract rolling 4-hour (48 epochs of 5-min) wearable biometric features."""
        if df_wearable is None or len(df_wearable) == 0:
            return {
                "sbp_mean": 135.0, "sbp_max": 145.0, "sbp_trend": 0.5,
                "dbp_mean": 88.0, "hr_mean": 74.0, "hr_trend": 0.4,
                "sdnn_mean": 38.0, "rmssd_mean": 24.0, "rpp": 10000.0,
            }

        idx = end_idx if end_idx is not None else len(df_wearable)
        start_idx = max(0, idx - 48)
        window = df_wearable.iloc[start_idx:idx]

        sbp_col = "systolic_bp" if "systolic_bp" in window.columns else ("sbp" if "sbp" in window.columns else None)
        dbp_col = "diastolic_bp" if "diastolic_bp" in window.columns else ("dbp" if "dbp" in window.columns else None)
        hr_col = "heart_rate" if "heart_rate" in window.columns else ("hr" if "hr" in window.columns else None)

        sbp = window[sbp_col].values if sbp_col else np.array([135.0])
        dbp = window[dbp_col].values if dbp_col else np.array([88.0])
        hr = window[hr_col].values if hr_col else np.array([75.0])
        sdnn = window["hrv_sdnn"].values if "hrv_sdnn" in window.columns else np.array([40.0])
        rmssd = window["hrv_rmssd"].values if "hrv_rmssd" in window.columns else np.array([25.0])

        sbp_mean = float(np.mean(sbp))
        sbp_max = float(np.max(sbp))
        sbp_trend = float((sbp[-1] - sbp[0]) / max(1, len(sbp))) if len(sbp) > 1 else 0.0

        dbp_mean = float(np.mean(dbp))
        hr_mean = float(np.mean(hr))
        hr_trend = float((hr[-1] - hr[0]) / max(1, len(hr))) if len(hr) > 1 else 0.0

        sdnn_mean = float(np.mean(sdnn))
        rmssd_mean = float(np.mean(rmssd))
        rpp = hr_mean * sbp_mean  # Rate-Pressure Product

        return {
            "sbp_mean": sbp_mean,
            "sbp_max": sbp_max,
            "sbp_trend": sbp_trend,
            "dbp_mean": dbp_mean,
            "hr_mean": hr_mean,
            "hr_trend": hr_trend,
            "sdnn_mean": sdnn_mean,
            "rmssd_mean": rmssd_mean,
            "rpp": rpp,
        }

    @classmethod
    def predict_crisis_probabilities(
        cls,
        patient_ehr: Dict[str, Any],
        wearable_features: Dict[str, float],
        windkessel: Optional[WindkesselModel] = None,
        env_multiplier: float = 1.0,
    ) -> Tuple[float, float, float, float, Optional[float]]:
        """Predict crisis probability at 6h and 12h horizons, plus projected peak SBP/DBP and ETA.
        
        Guarantees:
        0.0 <= prob_6h <= 1.0
        0.0 <= prob_12h <= 1.0
        Windkessel SBP within [90, 220] mmHg
        """
        model_6h, model_12h = get_models()

        # Build feature vector
        feat_vector = np.array([[
            wearable_features.get("sbp_mean", 135.0),
            wearable_features.get("sbp_max", 145.0),
            wearable_features.get("sbp_trend", 0.0),
            wearable_features.get("dbp_mean", 88.0),
            wearable_features.get("hr_mean", 75.0),
            wearable_features.get("hr_trend", 0.0),
            wearable_features.get("sdnn_mean", 38.0),
            wearable_features.get("rmssd_mean", 24.0),
            wearable_features.get("rpp", 10000.0),
            float(patient_ehr.get("age", 55)),
            float(patient_ehr.get("hypertension", 1)),
            float(patient_ehr.get("diabetes", 0)),
            float(patient_ehr.get("baseline_sbp", 130.0) or 130.0),
            float(env_multiplier),
        ]], dtype=float)

        prob_6h = None
        prob_12h = None

        if model_6h is not None and hasattr(model_6h, "predict_proba"):
            try:
                preds_6h = model_6h.predict_proba(feat_vector)
                prob_6h = float(preds_6h[0][1])
            except Exception:
                prob_6h = None

        if model_12h is not None and hasattr(model_12h, "predict_proba"):
            try:
                preds_12h = model_12h.predict_proba(feat_vector)
                prob_12h = float(preds_12h[0][1])
            except Exception:
                prob_12h = None

        # Fallback calibrated biophysical logistic response if ML models not yet loaded
        if prob_6h is None:
            sbp_max = wearable_features.get("sbp_max", 135.0)
            sbp_trend = wearable_features.get("sbp_trend", 0.0)
            sdnn = wearable_features.get("sdnn_mean", 40.0)
            
            # Logistic score
            z_6h = -3.8 + 0.045 * (sbp_max - 130.0) + 1.2 * sbp_trend - 0.03 * (sdnn - 35.0)
            z_6h *= env_multiplier
            prob_6h = 1.0 / (1.0 + math.exp(-z_6h))

        if prob_12h is None:
            # 12-hour cumulative risk accumulates further
            prob_12h = min(1.0, prob_6h * 1.35 + 0.05)

        # Windkessel forward simulation for peak and ETA
        if windkessel is None:
            windkessel = WindkesselModel.from_patient_ehr(patient_ehr)

        curr_hr = wearable_features.get("hr_mean", 75.0)
        curr_trend = wearable_features.get("hr_trend", 0.0)
        
        sim_sbp, sim_dbp = windkessel.simulate(curr_hr + 6.0 * curr_trend)
        # Apply environment resistance bump if high AQI
        if env_multiplier > 1.1:
            sim_sbp, sim_dbp = windkessel.simulate(curr_hr + 8.0 * curr_trend, override_rp=windkessel.rp * 1.08)

        # Ensure Windkessel bounds 90 - 220 mmHg
        peak_sbp = max(90.0, min(220.0, float(sim_sbp)))
        peak_dbp = max(50.0, min(130.0, float(sim_dbp)))

        # Crisis ETA estimate
        eta_hours = None
        if prob_6h >= 0.40 or peak_sbp >= 170.0:
            deficit_to_180 = max(0.0, 180.0 - wearable_features.get("sbp_mean", 140.0))
            hourly_rate = max(1.5, wearable_features.get("sbp_trend", 0.5) * 12.0)
            eta_hours = round(min(12.0, max(0.5, deficit_to_180 / hourly_rate)), 1)

        # Guaranteed strict clamp to [0.0, 1.0]
        prob_6h = max(0.0, min(1.0, float(prob_6h)))
        prob_12h = max(0.0, min(1.0, float(prob_12h)))

        return prob_6h, prob_12h, peak_sbp, peak_dbp, eta_hours
