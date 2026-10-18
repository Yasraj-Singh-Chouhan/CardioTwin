"""PyTest Suite for CardioTwin Digital Twin Core Invariants.
Validates:
1. Windkessel SBP strictly stays within [90, 220] mmHg under all physiological regimes.
2. All risk scores (chronic, acute, fused) are strictly bounded in [0.0, 1.0].
3. All drift scores (component and aggregate TDI) are strictly bounded in [0.0, 100.0].
"""
import pytest
import numpy as np
from app.services.windkessel import WindkesselModel
from app.services.slow_twin import SlowTwinEngine
from app.services.fast_twin import FastTwinEngine
from app.services.fusion import FusionEngine
from app.services.drift_index import DriftIndexEngine


class TestWindkesselBounds:
    """Verifies that Windkessel hemodynamics strictly respect physiological boundaries."""

    def test_windkessel_sbp_stays_within_90_220_under_hr_sweep(self):
        """Test SBP remains in [90, 220] across heart rates from 30 to 220 bpm."""
        model = WindkesselModel()
        for hr in np.linspace(30.0, 220.0, 50):
            sbp, dbp = model.simulate(hr)
            assert 90.0 <= sbp <= 220.0, f"Windkessel SBP {sbp} out of [90, 220] bounds at HR={hr}"
            assert 50.0 <= dbp <= 130.0, f"Windkessel DBP {dbp} out of [50, 130] bounds at HR={hr}"
            assert sbp > dbp, f"SBP {sbp} must exceed DBP {dbp}"

    def test_windkessel_sbp_stays_within_90_220_under_parameter_extremes(self):
        """Test SBP remains bounded under extreme vascular resistance and compliance permutations."""
        model = WindkesselModel()
        extreme_rps = [0.1, 0.5, 1.0, 2.0, 3.5, 6.0]
        extreme_cs = [0.1, 0.4, 1.0, 2.0, 4.0]
        extreme_svs = [15.0, 40.0, 75.0, 120.0, 160.0]

        for rp in extreme_rps:
            for c in extreme_cs:
                for sv in extreme_svs:
                    for hr in [45.0, 75.0, 120.0, 175.0]:
                        sbp, dbp = model.simulate(hr, override_rp=rp, override_c=c, override_sv=sv)
                        assert 90.0 <= sbp <= 220.0, (
                            f"Windkessel SBP {sbp} breached [90, 220] with rp={rp}, c={c}, sv={sv}, hr={hr}"
                        )
                        assert 50.0 <= dbp <= 130.0

    def test_windkessel_sbp_stays_within_90_220_across_patient_ehr_archetypes(self):
        """Test SBP remains in [90, 220] across diverse clinical archetypes."""
        archetypes = [
            {"age": 45, "hypertension": 0, "diabetes": 0, "ckd": 0, "previous_mi": 0},
            {"age": 70, "hypertension": 1, "diabetes": 1, "ckd": 1, "previous_mi": 1},
            {"age": 60, "hypertension": 1, "diabetes": 0, "ckd": 0, "previous_mi": 0},
            {"age": 52, "hypertension": 0, "diabetes": 1, "ckd": 0, "previous_mi": 0},
        ]
        for ehr in archetypes:
            wk = WindkesselModel.from_patient_ehr(ehr)
            for hr in [50, 70, 95, 130, 160]:
                sbp, dbp = wk.simulate(hr)
                assert 90.0 <= sbp <= 220.0
                assert 50.0 <= dbp <= 130.0

    def test_windkessel_trajectory_forecast_sbp_bounds(self):
        """Test forecast trajectory envelopes all stay within [90, 220] mmHg."""
        wk = WindkesselModel()
        trajectory = wk.forecast_trajectory(current_hr=75.0, current_sbp=140.0, current_dbp=90.0, hr_drift_rate_per_hour=1.2)
        for pt in trajectory:
            assert 90.0 <= pt["predicted_sbp"] <= 220.0
            assert 90.0 <= pt["upper_envelope_sbp"] <= 220.0
            assert 90.0 <= pt["lower_envelope_sbp"] <= 220.0


class TestRiskScoresBounds:
    """Verifies that all risk models produce scores strictly in [0.0, 1.0]."""

    def test_slow_twin_risk_scores_in_0_1(self):
        """Test chronic CVD risk scores are always in [0.0, 1.0]."""
        test_profiles = [
            {"age": 45, "sex": "F", "baseline_sbp": 115, "cholesterol_total": 160, "cholesterol_hdl": 60, "hypertension": 0, "diabetes": 0},
            {"age": 70, "sex": "M", "baseline_sbp": 185, "cholesterol_total": 290, "cholesterol_hdl": 30, "hypertension": 1, "diabetes": 1, "ckd": 1, "previous_mi": 1, "tobacco_chewing": 1},
            {"age": 55, "sex": "M", "baseline_sbp": 140, "cholesterol_total": 210, "cholesterol_hdl": 45, "hypertension": 1, "diabetes": 0},
            {"age": 62, "sex": "F", "baseline_sbp": 150, "cholesterol_total": 240, "cholesterol_hdl": 40, "hypertension": 1, "diabetes": 1, "lp_a": 75.0},
        ]
        for ehr in test_profiles:
            risk, _ = SlowTwinEngine.compute_chronic_risk(ehr)
            assert 0.0 <= risk <= 1.0, f"Slow twin risk {risk} out of [0, 1] for profile: {ehr}"

    def test_fast_twin_risk_scores_in_0_1(self):
        """Test acute crisis probabilities (6h, 12h) are always in [0.0, 1.0]."""
        test_wearables = [
            {"sbp_mean": 118.0, "sbp_max": 125.0, "sbp_trend": -0.2, "dbp_mean": 75.0, "hr_mean": 65.0, "hr_trend": -0.1, "sdnn_mean": 52.0, "rmssd_mean": 38.0, "rpp": 7670.0},
            {"sbp_mean": 178.0, "sbp_max": 192.0, "sbp_trend": 1.8, "dbp_mean": 115.0, "hr_mean": 105.0, "hr_trend": 1.2, "sdnn_mean": 16.0, "rmssd_mean": 11.0, "rpp": 18690.0},
            {"sbp_mean": 145.0, "sbp_max": 158.0, "sbp_trend": 0.4, "dbp_mean": 92.0, "hr_mean": 78.0, "hr_trend": 0.3, "sdnn_mean": 34.0, "rmssd_mean": 22.0, "rpp": 11310.0},
        ]
        ehr = {"age": 60, "hypertension": 1, "diabetes": 0, "baseline_sbp": 138.0}
        
        for feat in test_wearables:
            p6, p12, peak_sbp, peak_dbp, _ = FastTwinEngine.predict_crisis_probabilities(ehr, feat, env_multiplier=1.2)
            assert 0.0 <= p6 <= 1.0, f"Crisis 6h prob {p6} out of [0, 1]"
            assert 0.0 <= p12 <= 1.0, f"Crisis 12h prob {p12} out of [0, 1]"
            assert 90.0 <= peak_sbp <= 220.0
            assert 50.0 <= peak_dbp <= 130.0

    def test_fused_risk_scores_in_0_1(self):
        """Test multiscale fused risk scores are always strictly in [0.0, 1.0]."""
        chronic_vals = [0.0, 0.1, 0.35, 0.7, 0.95, 1.0]
        acute_vals = [0.0, 0.05, 0.4, 0.8, 1.0]
        adherences = [0.1, 0.5, 0.9]
        env_mults = [1.0, 1.2, 1.4]
        tdis = [5.0, 45.0, 85.0]

        for c in chronic_vals:
            for a in acute_vals:
                for adh in adherences:
                    for em in env_mults:
                        for tdi in tdis:
                            fused, tier, _ = FusionEngine.fuse_risks(
                                chronic_risk=c,
                                acute_risk=a,
                                medication_adherence=adh,
                                recent_hospitalization=(c > 0.6),
                                env_multiplier=em,
                                tdi_score=tdi,
                            )
                            assert 0.0 <= fused <= 1.0, (
                                f"Fused risk {fused} out of [0, 1] with c={c}, a={a}, adh={adh}, env={em}, tdi={tdi}"
                            )


class TestDriftScoresBounds:
    """Verifies that all drift scores (component and TDI) strictly stay within [0.0, 100.0]."""

    def test_component_drift_scores_in_0_100(self):
        """Test exponential saturating transfer function maps any z to [0, 100]."""
        test_z_scores = [-15.0, -5.0, 0.0, 0.25, 1.0, 2.5, 5.0, 10.0, 50.0, 100.0]
        for z in test_z_scores:
            score = DriftIndexEngine.compute_component_drift(z)
            assert 0.0 <= score <= 100.0, f"Component drift score {score} out of [0, 100] for z={z}"

    def test_patient_tdi_aggregate_in_0_100(self):
        """Test overall TDI aggregate score is strictly in [0.0, 100.0]."""
        scenarios = [
            # Ideal baseline match
            {"resting_heart_rate": 68.0, "hrv_sdnn": 45.0, "nocturnal_dip_percent": 12.0, "daily_steps": 6500.0, "sleep_duration_hours": 7.5},
            # Catastrophic drift / decompensation
            {"resting_heart_rate": 120.0, "hrv_sdnn": 10.0, "nocturnal_dip_percent": -2.0, "daily_steps": 400.0, "sleep_duration_hours": 2.5},
            # Moderate drift
            {"resting_heart_rate": 82.0, "hrv_sdnn": 28.0, "nocturnal_dip_percent": 6.0, "daily_steps": 3800.0, "sleep_duration_hours": 5.4},
        ]
        base = {
            "resting_heart_rate": {"mean": 68.0, "std": 5.0},
            "hrv_sdnn": {"mean": 42.0, "std": 8.0},
            "nocturnal_dip_percent": {"mean": 12.0, "std": 3.0},
            "daily_steps": {"mean": 6500.0, "std": 1200.0},
            "sleep_duration_hours": {"mean": 7.2, "std": 0.8},
        }

        for metrics in scenarios:
            tdi, factors, status = DriftIndexEngine.compute_patient_drift("CT-0001", metrics, base)
            assert 0.0 <= tdi <= 100.0, f"Overall TDI {tdi} out of [0, 100] for metrics: {metrics}"
            for f in factors:
                assert 0.0 <= f["percentage"] <= 100.0

    def test_seven_day_trend_points_in_0_100(self):
        """Test 7-day trend longitudinal scores are all within [0.0, 100.0]."""
        for tdi in [0.0, 15.0, 42.5, 78.0, 100.0]:
            trend = DriftIndexEngine.generate_seven_day_trend(tdi)
            assert len(trend) == 7
            for pt in trend:
                assert 0.0 <= pt["tdi_score"] <= 100.0, f"Drift point {pt['tdi_score']} out of [0, 100]"
