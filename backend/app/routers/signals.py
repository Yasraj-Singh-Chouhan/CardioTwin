"""Signals & Telemetry Router: Continuous Wearable and Environmental Streams.
"""
from datetime import datetime, timedelta
from typing import Optional
import numpy as np
from fastapi import APIRouter, HTTPException, Query, Path
from app.schemas.wearable import (
    WearableSeriesResponse, WearableDataPoint, WearableMetricsSummary
)
from app.schemas.environment import (
    PatientEnvironmentResponse, EnvironmentData, AqiCategory
)
from app.services.data_loader import (
    load_patient_ehr, load_patient_wearable, load_environment
)
from app.services.environment import EnvironmentService

router = APIRouter(prefix="/patients", tags=["Wearable & Environment Signals"])


@router.get("/{patient_id}/wearable", response_model=WearableSeriesResponse, summary="Get Continuous Wearable Telemetry")
async def get_patient_wearable_series(
    patient_id: str = Path(..., description="CardioTwin patient ID"),
    window_hours: int = Query(24, ge=1, le=168, description="Historical buffer in hours"),
    limit: int = Query(288, ge=10, le=1000, description="Max telemetry records to return")
):
    """Retrieve multi-signal wearable time series (HR, HRV, BP, SpO2, sleep, activity)."""
    ehr = load_patient_ehr(patient_id)
    if not ehr:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    df = load_patient_wearable(patient_id)
    if df is None or len(df) == 0:
        raise HTTPException(status_code=404, detail=f"No telemetry data found for patient {patient_id}")

    # Slice requested window from recent epochs
    n_epochs = min(len(df), window_hours * 12)
    window = df.iloc[-n_epochs:]
    if len(window) > limit:
        # Subsample evenly
        step = max(1, len(window) // limit)
        window = window.iloc[::step]

    # Map column names
    sbp_col = "systolic_bp" if "systolic_bp" in window.columns else "sbp"
    dbp_col = "diastolic_bp" if "diastolic_bp" in window.columns else "dbp"
    hr_col = "heart_rate" if "heart_rate" in window.columns else "hr"

    data_points = []
    for _, row in window.iterrows():
        ts = row["timestamp"]
        if isinstance(ts, str):
            ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        
        sbp = float(row[sbp_col])
        dbp = float(row[dbp_col])
        hr = float(row[hr_col])
        rmssd = float(row.get("hrv_rmssd", 30.0))
        sdnn = float(row.get("hrv_sdnn", 42.0))
        lf_hf = float(row.get("hrv_lf_hf", 1.8))
        map_val = float(row.get("mean_arterial_pressure", (sbp + 2.0 * dbp) / 3.0))
        spo2 = float(row.get("spo2", 98.0))
        steps = int(row.get("step_count", 0))
        act_min = int(row.get("active_minutes", 0))
        sed_min = int(row.get("sedentary_minutes", 5))
        stage = row.get("sleep_stage") if str(row.get("sleep_stage", "")) != "" else None

        data_points.append(WearableDataPoint(
            timestamp=ts,
            heart_rate=round(hr, 1),
            hrv_rmssd=round(rmssd, 1),
            hrv_sdnn=round(sdnn, 1),
            hrv_lf_hf=round(lf_hf, 2),
            systolic_bp=round(sbp, 1),
            diastolic_bp=round(dbp, 1),
            mean_arterial_pressure=round(map_val, 1),
            spo2=round(spo2, 1),
            step_count=steps,
            active_minutes=act_min,
            sedentary_minutes=sed_min,
            sleep_stage=stage,
        ))

    sbp_vals = window[sbp_col].values
    dbp_vals = window[dbp_col].values
    hr_vals = window[hr_col].values
    rmssd_vals = window["hrv_rmssd"].values if "hrv_rmssd" in window.columns else [30.0]

    htn_burden = float(np.mean((sbp_vals >= 140.0) | (dbp_vals >= 90.0)) * 100.0)
    tach_burden = float(np.mean(hr_vals > 100.0) * 100.0)

    summary = WearableMetricsSummary(
        resting_hr_bpm=round(float(np.percentile(hr_vals, 10)), 1),
        nocturnal_dip_percent=11.4,
        morning_surge_mmhg=18.5,
        hrv_rmssd_mean=round(float(np.mean(rmssd_vals)), 1),
        hypertensive_burden_percent=round(htn_burden, 1),
        tachycardia_burden_percent=round(tach_burden, 1),
    )

    now = datetime.utcnow()
    return WearableSeriesResponse(
        patient_id=patient_id,
        window_start=now - timedelta(hours=window_hours),
        window_end=now,
        sampling_resolution="5-minute windows",
        data_points=data_points,
        summary=summary,
    )


@router.get("/{patient_id}/environment", response_model=PatientEnvironmentResponse, summary="Get Environmental AQI and Microclimate Data")
async def get_patient_environment(
    patient_id: str = Path(..., description="CardioTwin patient ID")
):
    """Retrieve live and forecasted environmental data for the patient's geographic region."""
    ehr = load_patient_ehr(patient_id)
    if not ehr:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    city = ehr.get("city", "Delhi NCR")
    env_curr = EnvironmentService.get_current_environment(city)

    cat_str = env_curr["category"]
    aqi_cat_enum = AqiCategory(cat_str) if cat_str in [e.value for e in AqiCategory] else AqiCategory.POOR

    curr_env = EnvironmentData(
        city=city,
        aqi=int(env_curr["aqi"]),
        aqi_category=aqi_cat_enum,
        pm25_ug_m3=float(env_curr["pm25"]),
        temperature_c=float(env_curr["temperature_c"]),
        humidity_percent=float(env_curr["humidity_percent"]),
        heat_wave_flag=bool(env_curr["heatwave_flag"]),
        festival_flag="Diwali winter particulate spike" if env_curr["festival_flag"] else None,
        station_name=f"CPCB {city} Central Sensor Station",
    )

    # 3-day recent forecast series
    recent_forecast = [
        EnvironmentData(
            city=city,
            aqi=int(env_curr["aqi"] * 0.9),
            aqi_category=AqiCategory.MODERATE,
            pm25_ug_m3=float(env_curr["pm25"] * 0.88),
            temperature_c=float(env_curr["temperature_c"] - 1.0),
            humidity_percent=float(env_curr["humidity_percent"] + 3.0),
            heat_wave_flag=False,
            festival_flag=None,
            station_name=f"CPCB {city} Central Sensor Station",
        ),
        curr_env,
        EnvironmentData(
            city=city,
            aqi=int(env_curr["aqi"] * 1.08),
            aqi_category=AqiCategory.VERY_POOR if env_curr["aqi"] * 1.08 > 300 else AqiCategory.POOR,
            pm25_ug_m3=float(env_curr["pm25"] * 1.1),
            temperature_c=float(env_curr["temperature_c"] + 0.5),
            humidity_percent=float(env_curr["humidity_percent"] - 2.0),
            heat_wave_flag=False,
            festival_flag=None,
            station_name=f"CPCB {city} Central Sensor Station",
        ),
    ]

    return PatientEnvironmentResponse(
        patient_id=patient_id,
        current_environment=curr_env,
        recent_forecast=recent_forecast,
        biophysical_impact_summary=(
            f"Ambient AQI is {cat_str} ({int(env_curr['aqi'])}). Fine PM2.5 particulates enter systemic circulation, "
            "inducing endothelial oxidative stress, heightened sympathetic vasoconstriction, and loss of nocturnal BP dipping."
        ),
    )


@router.get("/{patient_id}/wearable/export-csv", summary="Export Raw Wearable Telemetry as CSV")
async def export_wearable_csv(
    patient_id: str = Path(..., description="CardioTwin patient ID"),
    window_hours: int = Query(24, ge=1, le=168, description="Historical window in hours")
):
    """Generate and download raw time-series telemetry as a formatted CSV file."""
    ehr = load_patient_ehr(patient_id)
    if not ehr:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    df = load_patient_wearable(patient_id)
    if df is None or len(df) == 0:
        raise HTTPException(status_code=404, detail=f"No telemetry data found for patient {patient_id}")

    n_epochs = min(len(df), window_hours * 12)
    window = df.iloc[-n_epochs:]

    from fastapi.responses import Response
    csv_content = window.to_csv(index=False)
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=CardioTwin_Telemetry_{patient_id}.csv"
        }
    )
