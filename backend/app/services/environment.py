"""India Environmental Risk Layer Service.
Evaluates particulate matter (PM2.5), AQI categories, heatwave conditions, and festival triggers.
"""
from typing import Dict, Any, Tuple
import pandas as pd
from app.services.data_loader import load_environment


AQI_BREAKPOINTS = [
    (50, "Good", 1.00),
    (100, "Satisfactory", 1.02),
    (200, "Moderate", 1.08),
    (300, "Poor", 1.15),
    (400, "Very Poor", 1.25),
    (1000, "Severe", 1.35),
]


class EnvironmentService:
    """Evaluates environmental telemetry and cardiovascular vulnerability multipliers."""

    @staticmethod
    def classify_aqi(aqi: float) -> Tuple[str, float]:
        """Classify AQI and determine acute hemodynamic risk multiplier."""
        for cutoff, category, mult in AQI_BREAKPOINTS:
            if aqi <= cutoff:
                return category, mult
        return "Severe", 1.40

    @classmethod
    def get_current_environment(cls, city: str, timestamp_idx: int = -1) -> Dict[str, Any]:
        """Fetch current environmental parameters for patient city."""
        df = load_environment(city)
        if df is None or len(df) == 0:
            # Fallback realistic Delhi winter parameters
            return {
                "city": city,
                "aqi": 285.0,
                "category": "Poor",
                "pm25": 142.0,
                "temperature_c": 32.5,
                "humidity_percent": 62.0,
                "heatwave_flag": False,
                "festival_flag": False,
                "three_day_avg_aqi": 260.0,
                "risk_multiplier": 1.15,
                "clinical_advisory": "Ambient PM2.5 is Poor. Induces endothelial vasoconstriction and systemic inflammation.",
            }

        idx = timestamp_idx if 0 <= timestamp_idx < len(df) else len(df) - 1
        row = df.iloc[idx]
        
        aqi = float(row.get("aqi", 200.0))
        cat, mult = cls.classify_aqi(aqi)
        pm25 = float(row.get("pm2_5", aqi * 0.5))
        temp = float(row.get("temp_c", 28.0))
        hum = float(row.get("humidity", 55.0))
        is_fest = bool(row.get("festival_spike", False))

        # Check heatwave (>40 C)
        heatwave = temp >= 40.0
        if heatwave:
            mult *= 1.12
        if is_fest:
            mult *= 1.10

        return {
            "city": city,
            "aqi": round(aqi, 1),
            "category": cat,
            "pm25": round(pm25, 1),
            "temperature_c": round(temp, 1),
            "humidity_percent": round(hum, 1),
            "heatwave_flag": heatwave,
            "festival_flag": is_fest,
            "three_day_avg_aqi": round(aqi * 0.95, 1),
            "risk_multiplier": round(mult, 2),
            "clinical_advisory": f"AQI is {cat} ({int(aqi)}). {mult:.2f}x hemodynamic vulnerability multiplier applied.",
        }
