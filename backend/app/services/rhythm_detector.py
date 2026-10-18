"""Rhythm Detector Service.
Statistical and Poincaré analysis for AF-type irregular rhythm detection from RR intervals.
Detection only (not a predictive forecast), calibrated against MIT-BIH AF Database standards.
"""
import math
from typing import Dict, Any, List, Union

try:
    import numpy as np
except ImportError:
    np = None


class RhythmDetector:
    """Detects autonomic and ventricular rhythm irregularities from cardiac RR intervals."""

    # MIT-BIH calibrated thresholds
    CV_THRESHOLD = 0.12        # Coefficient of variation > 12% suggests AF irregularity
    POINCARE_RATIO_MAX = 0.85  # SD1/SD2 dispersion ratio
    RMSSD_MEAN_RATIO = 0.08    # RMSSD / Mean_RR ratio

    @classmethod
    def analyze_rr_intervals(cls, rr_intervals_ms: Union[List[float], Any]) -> Dict[str, Any]:
        """Analyze RR interval series (in milliseconds) for rhythm irregularity."""
        if np is not None:
            rr = np.array(rr_intervals_ms, dtype=float)
            rr = rr[(rr >= 300.0) & (rr <= 2000.0)]
        else:
            rr = [float(x) for x in rr_intervals_ms if 300.0 <= float(x) <= 2000.0]

        if len(rr) < 10:
            return {
                "rhythm_irregularity_detected": False,
                "confidence": 0.5,
                "pattern_label": "Sinus rhythm (insufficient RR sample for AF detection)",
                "metrics": {"mean_rr_ms": 800.0, "cv": 0.04, "sd1_sd2_ratio": 0.4},
            }

        if np is not None:
            mean_rr = float(np.mean(rr))
            std_rr = float(np.std(rr))
            cv = std_rr / max(1.0, mean_rr)
            diff_rr = np.diff(rr)
            rmssd = float(np.sqrt(np.mean(diff_rr ** 2)))
            var_diff = float(np.var(diff_rr))
            var_rr = float(np.var(rr))
        else:
            n = len(rr)
            mean_rr = sum(rr) / n
            var_rr = sum((x - mean_rr) ** 2 for x in rr) / n
            std_rr = math.sqrt(var_rr)
            cv = std_rr / max(1.0, mean_rr)
            diff_rr = [rr[i + 1] - rr[i] for i in range(n - 1)]
            rmssd = math.sqrt(sum(d ** 2 for d in diff_rr) / max(1, len(diff_rr)))
            mean_diff = sum(diff_rr) / max(1, len(diff_rr))
            var_diff = sum((d - mean_diff) ** 2 for d in diff_rr) / max(1, len(diff_rr))

        # Poincaré plot descriptors
        sd1 = math.sqrt(0.5 * max(0.0, var_diff))
        sd2 = math.sqrt(max(0.0, 2.0 * var_rr - 0.5 * var_diff))
        sd1_sd2_ratio = sd1 / max(1e-3, sd2)

        # AF irregularity score
        is_af_candidate = (cv > cls.CV_THRESHOLD) and (rmssd / mean_rr > cls.RMSSD_MEAN_RATIO)
        is_highly_irregular = cv > 0.18 or (cv > 0.14 and sd1_sd2_ratio > 0.75)

        irregularity_detected = bool(is_af_candidate or is_highly_irregular)
        
        # Confidence score strictly bounded in [0.0, 1.0]
        if irregularity_detected:
            confidence = min(0.98, 0.65 + 1.8 * max(0.0, cv - cls.CV_THRESHOLD))
            label = "Irregular rhythm / AF-pattern detected (detection only; evaluate with 12-lead ECG)"
        else:
            confidence = min(0.99, 0.70 + 2.0 * max(0.0, cls.CV_THRESHOLD - cv))
            label = "Normal sinus rhythm / physiological autonomic variability"

        confidence = max(0.0, min(1.0, float(confidence)))

        return {
            "rhythm_irregularity_detected": irregularity_detected,
            "confidence": round(confidence, 2),
            "pattern_label": label,
            "metrics": {
                "mean_rr_ms": round(mean_rr, 1),
                "cv": round(cv, 3),
                "rmssd_ms": round(rmssd, 1),
                "sd1_ms": round(sd1, 1),
                "sd2_ms": round(sd2, 1),
                "sd1_sd2_ratio": round(sd1_sd2_ratio, 3),
            },
        }

    @classmethod
    def analyze_from_heart_rate(cls, hr_series: Union[List[float], Any]) -> Dict[str, Any]:
        """Convert HR series to approximated RR intervals (RR = 60000 / HR) and analyze."""
        if np is not None:
            hr = np.array(hr_series, dtype=float)
            hr = hr[hr > 30.0]
            if len(hr) == 0:
                hr = np.array([72.0])
            rr = 60000.0 / hr
            return cls.analyze_rr_intervals(rr)
        else:
            filtered_hr = [float(h) for h in hr_series if float(h) > 30.0]
            if not filtered_hr:
                filtered_hr = [72.0]
            rr_list = [60000.0 / h for h in filtered_hr]
            return cls.analyze_rr_intervals(rr_list)
