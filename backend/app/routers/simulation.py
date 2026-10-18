"""Simulation & Accelerated WebSocket Replay Engine.
Provides playback controls (1x, 10x, 60x, play/pause, scrub) and real-time WebSocket tick stream.
"""
import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from app.schemas.simulation import (
    PlaybackControlRequest, PlaybackControlResponse, TelemetryTick
)
from app.schemas.common import PlaybackSpeed
from app.services.data_loader import load_patient_wearable, load_patient_ehr

router = APIRouter(tags=["Simulation & WebSocket Replay"])

# Global playback state
_PLAYBACK_STATE: Dict[str, Any] = {
    "is_playing": True,
    "speed": PlaybackSpeed.TEN_X,
    "offset_seconds": 15120.0,
}


@router.post("/simulate/playback", response_model=PlaybackControlResponse, summary="Playback & Telemetry Scrubber Control")
async def control_playback(payload: PlaybackControlRequest):
    """Play, pause, change speed (1x, 10x, 60x), or scrub the simulation timeline."""
    global _PLAYBACK_STATE

    act = payload.action.lower()
    if act == "play":
        _PLAYBACK_STATE["is_playing"] = True
    elif act == "pause":
        _PLAYBACK_STATE["is_playing"] = False
    elif act == "toggle":
        _PLAYBACK_STATE["is_playing"] = not _PLAYBACK_STATE["is_playing"]
    elif act == "set_speed" and payload.speed:
        _PLAYBACK_STATE["speed"] = payload.speed
    elif act == "scrub" and payload.telemetry_offset_seconds is not None:
        _PLAYBACK_STATE["offset_seconds"] = payload.telemetry_offset_seconds

    if payload.speed:
        _PLAYBACK_STATE["speed"] = payload.speed

    hrs = int(_PLAYBACK_STATE["offset_seconds"] // 3600)
    mins = int((_PLAYBACK_STATE["offset_seconds"] % 3600) // 60)
    clock_str = f"T+{hrs:02d}:{mins:02d}:00 (Replay Active)"

    return PlaybackControlResponse(
        is_playing=_PLAYBACK_STATE["is_playing"],
        current_speed=_PLAYBACK_STATE["speed"],
        telemetry_clock=clock_str,
        elapsed_seconds=_PLAYBACK_STATE["offset_seconds"],
        buffer_window="30-day buffer",
        sim_live_status="Sim Live" if _PLAYBACK_STATE["is_playing"] else "Paused",
    )


@router.websocket("/ws/patients/{patient_id}")
async def patient_telemetry_websocket(
    websocket: WebSocket,
    patient_id: str
):
    """WebSocket stream emitting accelerated real-time telemetry ticks for the patient."""
    await websocket.accept()
    
    df = load_patient_wearable(patient_id)
    if df is None or len(df) == 0:
        # Fallback synthetic tick stream if no parquet found
        sbp_vals = [142.0]
        dbp_vals = [90.0]
        hr_vals = [72.0]
        rmssd_vals = [32.0]
    else:
        sbp_col = "systolic_bp" if "systolic_bp" in df.columns else "sbp"
        dbp_col = "diastolic_bp" if "diastolic_bp" in df.columns else "dbp"
        hr_col = "heart_rate" if "heart_rate" in df.columns else "hr"
        sbp_vals = df[sbp_col].values
        dbp_vals = df[dbp_col].values
        hr_vals = df[hr_col].values
        rmssd_vals = df["hrv_rmssd"].values if "hrv_rmssd" in df.columns else [32.0] * len(df)

    total_len = len(sbp_vals)
    current_idx = max(0, total_len - 100)

    try:
        while True:
            # Check for incoming control message without blocking indefinitely
            try:
                msg_text = await asyncio.wait_for(websocket.receive_text(), timeout=0.01)
                data = json.loads(msg_text)
                if "action" in data and data["action"] == "pause":
                    _PLAYBACK_STATE["is_playing"] = False
                elif "action" in data and data["action"] == "play":
                    _PLAYBACK_STATE["is_playing"] = True
                elif "speed" in data:
                    _PLAYBACK_STATE["speed"] = data["speed"]
            except (asyncio.TimeoutError, json.JSONDecodeError):
                pass

            if _PLAYBACK_STATE["is_playing"]:
                sbp = float(sbp_vals[current_idx % total_len])
                dbp = float(dbp_vals[current_idx % total_len])
                hr = float(hr_vals[current_idx % total_len])
                rmssd = float(rmssd_vals[current_idx % total_len])
                
                stress = min(100.0, max(10.0, (hr * sbp) / 180.0))
                risk = min(100.0, max(5.0, (sbp - 110.0) * 1.2))

                alert = None
                if sbp >= 180.0 or dbp >= 120.0:
                    alert = "CRISIS_THRESHOLD_BREACH"
                elif sbp >= 160.0:
                    alert = "ACCELERATED_ASCENT"

                tick = TelemetryTick(
                    patient_id=patient_id,
                    timestamp=datetime.utcnow(),
                    heart_rate=round(hr, 1),
                    systolic_bp=round(sbp, 1),
                    diastolic_bp=round(dbp, 1),
                    hrv_rmssd=round(rmssd, 1),
                    composite_stress_percent=round(stress, 1),
                    current_risk_score=round(risk, 1),
                    fused_risk_score=round(risk, 1),
                    alert_flag=alert,
                )

                await websocket.send_text(tick.model_dump_json())
                current_idx += 1

            # Sleep interval depends on playback speed
            spd = _PLAYBACK_STATE["speed"]
            delay = 0.5 if spd == PlaybackSpeed.SIXTY_X else (1.0 if spd == PlaybackSpeed.TEN_X else 2.0)
            await asyncio.sleep(delay)

    except WebSocketDisconnect:
        pass
    except Exception:
        pass
