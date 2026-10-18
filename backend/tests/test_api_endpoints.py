import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["service"] == "CardioTwin API"
    assert "models_loaded" in data

def test_patients_quick_search():
    res = client.get("/api/patients/search/quick?q=CT")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "patient_id" in data[0]

def test_alerts_acknowledge_and_escalate():
    pid = "CT-3092"
    alt_id = f"ALT-{pid}-01"
    
    # Acknowledge
    ack_res = client.post(f"/api/patients/{pid}/alerts/{alt_id}/acknowledge")
    assert ack_res.status_code == 200
    assert ack_res.json()["status"] == "success"
    assert ack_res.json()["state"] == "ACKNOWLEDGED"

    # Verify status in patient alerts
    alerts_res = client.get(f"/api/patients/{pid}/alerts")
    assert alerts_res.status_code == 200
    p_alerts = alerts_res.json()["alerts"]
    matched = [a for a in p_alerts if a["id"] == alt_id]
    if matched:
        assert matched[0]["status"] == "ACKNOWLEDGED"

    # Escalate
    esc_res = client.post(f"/api/patients/{pid}/alerts/{alt_id}/escalate?protocol=Stat+CCU+Triage")
    assert esc_res.status_code == 200
    assert esc_res.json()["status"] == "escalated"
    assert "protocol" in esc_res.json()

    # Verify status in feed
    feed_res = client.get("/api/patients/alerts/feed")
    assert feed_res.status_code == 200

def test_calibration_and_reset():
    pid = "CT-3092"
    # Calibrate
    cal_res = client.post(f"/api/patients/{pid}/calibrate")
    assert cal_res.status_code == 200
    cal_data = cal_res.json()
    assert cal_data["status"] == "success"
    assert cal_data["new_tdi"] == 14.0
    assert "calibrated_rp" in cal_data
    assert "calibrated_c" in cal_data

    # Check twin state reflects calibration
    twin_res = client.get(f"/api/patients/{pid}/twin")
    assert twin_res.status_code == 200
    twin_data = twin_res.json()
    assert "CALIBRATED" in twin_data["calibration_status"]
    assert twin_data["delta_tdi"] == 0.14

    # Reset calibration
    reset_res = client.post(f"/api/patients/{pid}/reset-calibration")
    assert reset_res.status_code == 200

def test_prescription_plan_simulation():
    pid = "CT-3092"
    req_payload = {
        "scenario_type": "prescription_plan",
        "prescription_rank": 1,
        "plan_title": "Optimized Sleep Recovery + Diaphragmatic Breathwork",
        "duration_hours": 12
    }
    sim_res = client.post(f"/api/patients/{pid}/scenarios", json=req_payload)
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert "Plan Simulated" in sim_data["state_label"] or "Countermeasure" in sim_data["scenario_title"]
    assert len(sim_data["trajectory_comparison"]) == 13

def test_datasheet_export_and_audit():
    # Export
    exp_res = client.get("/api/datasheet/export")
    assert exp_res.status_code == 200
    assert "CDSCO" in exp_res.json()["document_title"]

    # Audit verify
    audit_res = client.get("/api/datasheet/audit-verify")
    assert audit_res.status_code == 200
    assert audit_res.json()["status"] == "verified"
    assert audit_res.json()["integrity_status"] == "VALID_IMMUTABLE"

def test_wearable_export_csv():
    pid = "CT-3092"
    csv_res = client.get(f"/api/patients/{pid}/wearable/export-csv")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "systolic_bp" in csv_res.text or "heart_rate" in csv_res.text
