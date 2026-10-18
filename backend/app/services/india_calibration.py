"""India-specific cardiovascular calibration factors and cutoffs.
Reflects epidemiology from ICMR-INDIAB, NFHS-5, and South Asian cardiology guidelines.
"""
from typing import Dict, Any, Tuple


# Asian-specific thresholds (WHO / ICMR)
ASIAN_BMI_OVERWEIGHT = 23.0
ASIAN_BMI_OBESE = 27.5
ASIAN_WAIST_MALE = 90.0    # cm
ASIAN_WAIST_FEMALE = 80.0  # cm

# South Asian epidemiological multipliers
SOUTH_ASIAN_RISK_MULTIPLIER = 1.40
TOBACCO_CHEWING_MULTIPLIER = 1.35
ELEVATED_LPA_THRESHOLD = 50.0  # mg/dL
ELEVATED_LPA_MULTIPLIER = 1.25
RHEUMATIC_HEART_MULTIPLIER = 1.30
VEGETARIAN_HOMOCYSTEINE_MULTIPLIER = 1.10


def classify_asian_bmi(bmi: float) -> Tuple[str, str]:
    """Classify BMI using Asian-specific thresholds."""
    if bmi < 18.5:
        return "Underweight", "Underweight"
    elif bmi < ASIAN_BMI_OVERWEIGHT:
        return "Normal", "Healthy range"
    elif bmi < ASIAN_BMI_OBESE:
        return "Overweight", f"Above Asian cutoff (≥{ASIAN_BMI_OVERWEIGHT} kg/m²)"
    else:
        return "Obese", f"Asian obesity threshold (≥{ASIAN_BMI_OBESE} kg/m²)"


def check_asian_central_obesity(sex: str, waist_cm: float) -> Tuple[bool, str]:
    """Check central adiposity using ICMR Asian waist guidelines."""
    cutoff = ASIAN_WAIST_MALE if sex.upper().startswith("M") else ASIAN_WAIST_FEMALE
    is_obese = waist_cm >= cutoff
    return is_obese, f"{'Exceeds' if is_obese else 'Within'} Asian cutoff of {cutoff} cm"


def compute_india_risk_multiplier(patient_ehr: Dict[str, Any]) -> float:
    """Compute composite India epidemiological risk multiplier."""
    mult = SOUTH_ASIAN_RISK_MULTIPLIER

    # Tobacco chewing (gutkha / khaini / zarda)
    if patient_ehr.get("tobacco_chewing") in (1, True, "1", "yes") or str(patient_ehr.get("tobacco_chewing", "")).lower() == "yes":
        mult *= TOBACCO_CHEWING_MULTIPLIER
    elif patient_ehr.get("smoking") in (1, True, "1") or str(patient_ehr.get("smoking_status", "")).lower() in ("smoker", "current"):
        mult *= 1.30

    # Lipoprotein(a)
    lpa = float(patient_ehr.get("lipoprotein_a_mg_dl") or patient_ehr.get("lp_a", 0.0) or 0.0)
    if lpa >= ELEVATED_LPA_THRESHOLD:
        mult *= ELEVATED_LPA_MULTIPLIER

    # Rheumatic heart disease history
    if patient_ehr.get("rheumatic_heart_disease") or "rhd" in str(patient_ehr.get("medical_history", "")).lower():
        mult *= RHEUMATIC_HEART_MULTIPLIER

    # Vegetarian diet with elevated homocysteine
    diet = str(patient_ehr.get("diet_type", "")).lower()
    if "veg" in diet:
        mult *= VEGETARIAN_HOMOCYSTEINE_MULTIPLIER

    # Asian central adiposity check
    sex = str(patient_ehr.get("sex", "M"))
    waist = float(patient_ehr.get("waist_circumference_cm") or patient_ehr.get("waist_circumference", 0.0) or 0.0)
    if waist > 0:
        is_central_obese, _ = check_asian_central_obesity(sex, waist)
        if is_central_obese:
            mult *= 1.15

    return mult
