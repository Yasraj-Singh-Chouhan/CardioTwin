"""Data loader service for CardioTwin.
Loads EHR SQLite database, patient wearable Parquet files, events, environment, and baselines.
Provides automatic normalization between PT-xxx and CT-xxxx identifiers.
"""
from pathlib import Path
import sqlite3
import json
import re
from typing import Optional, Dict, Any, List
try:
    import pandas as pd
except ImportError:
    pd = None
from app.config import settings

DATA_DIR = Path(settings.DATA_DIR)
EHR_DB_PATH = DATA_DIR / "ehr.db"
WEARABLE_DIR = DATA_DIR / "wearable"
ENV_DIR = DATA_DIR / "environment"
EVENTS_PATH = DATA_DIR / "events.parquet"
BASELINES_PATH = DATA_DIR / "baselines.json"

_BASELINES_CACHE: Optional[Dict[str, Any]] = None


LEGACY_ALIAS_MAP = {
    "CT-4105": "CT-0114",
    "CT-2884": "CT-0042",
    "CT-5219": "CT-0002",
    "CT-1940": "CT-0003",
    "CT-3771": "CT-0001",
}


def normalize_patient_id(pid: str) -> str:
    """Normalize patient ID between 'PT-001', 'CT-0001', and legacy mock aliases."""
    raw = pid.strip().upper()
    if raw in LEGACY_ALIAS_MAP:
        return LEGACY_ALIAS_MAP[raw]
    match = re.match(r"^(PT|CT)-?(\d+)$", raw)
    if match:
        num = int(match.group(2))
        res = f"CT-{num:04d}"
        return LEGACY_ALIAS_MAP.get(res, res)
    return raw


def get_db_connection() -> sqlite3.Connection:
    """Connect to SQLite EHR database."""
    conn = sqlite3.connect(str(EHR_DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def list_patient_ids() -> List[str]:
    """Retrieve all patient IDs."""
    if EHR_DB_PATH.exists():
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT patient_id FROM patients ORDER BY patient_id ASC")
            return [row["patient_id"] for row in cursor.fetchall()]
    elif WEARABLE_DIR.exists():
        return sorted([f.stem for f in WEARABLE_DIR.glob("*.parquet")])
    return []


_EHR_CACHE: Dict[str, Dict[str, Any]] = {}
_WEARABLE_CACHE: Dict[str, pd.DataFrame] = {}


def load_patient_ehr(patient_id: str) -> Optional[Dict[str, Any]]:
    """Load patient EHR profile including medications and vitals baseline."""
    norm_id = normalize_patient_id(patient_id)
    if norm_id in _EHR_CACHE:
        return _EHR_CACHE[norm_id]
    if not EHR_DB_PATH.exists():
        return None
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM patients WHERE patient_id = ? OR patient_id = ?", (patient_id, norm_id))
        patient_row = cursor.fetchone()
        if not patient_row:
            return None
        
        patient_dict = dict(patient_row)
        actual_id = patient_dict["patient_id"]
        cursor.execute("SELECT * FROM medications WHERE patient_id = ? OR patient_id = ?", (patient_id, actual_id))
        med_rows = cursor.fetchall()
        patient_dict["medications"] = [dict(m) for m in med_rows]
        _EHR_CACHE[norm_id] = patient_dict
        _EHR_CACHE[patient_id] = patient_dict
        return patient_dict


def load_patient_wearable(patient_id: str) -> Optional[pd.DataFrame]:
    """Load wearable telemetry time series for patient."""
    norm_id = normalize_patient_id(patient_id)
    if norm_id in _WEARABLE_CACHE:
        return _WEARABLE_CACHE[norm_id]
    candidates = [
        WEARABLE_DIR / f"{patient_id}.parquet",
        WEARABLE_DIR / f"{norm_id}.parquet",
    ]
    for p in candidates:
        if p.exists():
            df = pd.read_parquet(p)
            if "timestamp" in df.columns and not pd.api.types.is_datetime64_any_dtype(df["timestamp"]):
                df["timestamp"] = pd.to_datetime(df["timestamp"])
            _WEARABLE_CACHE[norm_id] = df
            _WEARABLE_CACHE[patient_id] = df
            return df
    return None


def load_events() -> Optional[pd.DataFrame]:
    """Load injected crisis episodes catalog."""
    if not EVENTS_PATH.exists():
        return None
    return pd.read_parquet(EVENTS_PATH)


def load_environment(city: str) -> Optional[pd.DataFrame]:
    """Load environmental time series for a given city."""
    slug = city.lower().replace(" ", "_").replace("-", "_")
    candidates = [
        ENV_DIR / f"{slug}.parquet",
        ENV_DIR / f"{slug.split('_')[0]}.parquet",
    ]
    for p in candidates:
        if p.exists():
            return pd.read_parquet(p)
    # Default to delhi if not found
    fallback = ENV_DIR / "delhi_ncr.parquet"
    if fallback.exists():
        return pd.read_parquet(fallback)
    return None


def load_baselines() -> Dict[str, Any]:
    """Load precomputed patient baselines (cached)."""
    global _BASELINES_CACHE
    if _BASELINES_CACHE is not None:
        return _BASELINES_CACHE
    if BASELINES_PATH.exists():
        with open(BASELINES_PATH, "r", encoding="utf-8") as f:
            _BASELINES_CACHE = json.load(f)
            return _BASELINES_CACHE
    return {}


def load_patient_baseline(patient_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve baseline calibration profile for a specific patient."""
    baselines = load_baselines()
    norm_id = normalize_patient_id(patient_id)
    return baselines.get(patient_id) or baselines.get(norm_id)
