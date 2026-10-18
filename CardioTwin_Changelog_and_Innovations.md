# 🫀 CardioTwin: Project Evolution, Flaws Fixed & Unique Innovations

> **One-Line Summary**: CardioTwin is an AI-powered, biophysically grounded Digital Twin of a patient's cardiovascular system that combines static hospital records (EHR), wearable smartwatch sensors, and Indian urban air pollution (PM2.5) to predict acute heart events 6 to 12 hours in advance.

---

## 1. Where We Started: The Flaws & Broken Elements

When we first audited the project, it was plagued by structural breakages, runtime crashes, and language server errors:

| # | What Was Broken (Flaw) | Why It Happened | How We Fixed It |
|---|---|---|---|
| **1** | **Entire folder was red (IDE import errors everywhere)** | The bundled `.venv` was hardcoded to another developer's machine (`C:\Users\tejas\...`), meaning no Python packages could be resolved by the IDE. | Built a clean virtual environment at the workspace root, junctioned all installed scientific packages (`numpy`, `pandas`, `scipy`, `fastapi`, `lightgbm`), and configured `.vscode/settings.json` and `pyrightconfig.json`. |
| **2** | **Backend crashed on `GET /api/patients`** | `FastTwinEngine` was referenced in `patients.py` without being imported (`NameError`). | Added the missing import `from app.services.fast_twin import FastTwinEngine`. |
| **3** | **Backend crashed on `GET /api/patients/{id}/explanation`** | `RiskTier` enum was missing from imports in `predictions.py`. | Added `from app.schemas.common import RiskTier`. |
| **4** | **`Cannot find module numpy` on `windkessel.py`** | `windkessel.py` had an unnecessary `import numpy as np` that was never used (the ODE engine uses Python's built-in `math`). | Removed the unused import; the arterial ODE simulation now runs with zero external runtime dependencies. |
| **5** | **`pytest` failed on test collection** | Missing Python path configuration caused pytest to error with `ModuleNotFoundError: No module named 'app'`. | Created `pytest.ini` with `pythonpath = . app`. All 17 unit tests now pass with 100% success. |
| **6** | **Port 8000 Blocked (`[WinError 10013]` access denied)** | An orphaned test process was invisibly holding port 8000 open. | Detected and cleared the background process, unblocking port 8000. |
| **7** | **Frontend build crashed on `SignalsPage.tsx`** | An unescaped LaTeX-style text block (`\text{ ms}`) broke the JSX parser in Vite. | Cleaned up the JSX syntax to pure React text (`ms`). |
| **8** | **React Hook dependency warning in `useReplay.ts`** | `isConnected` was missing from the `useEffect` dependency array, creating stale WebSocket replay listeners. | Added `isConnected` to the dependency array. |
| **9** | **Impure Render Warning in `DatasheetPage.tsx`** | Directly called `Date.now()` during component rendering. | Replaced with stable, deterministic date string fallback. |
| **10**| **PowerShell script execution blocked for `npm`** | Windows default ExecutionPolicy prevented running `npm.ps1`. | Set up clean execution via `npm.cmd` and verified full build (`tsc -b && vite build`) passing in 1.51s. |

---

## 2. What Makes CardioTwin Unique: New & Standout Features

### 🫀 1. The Dual-Engine Digital Twin (Slow Twin + Fast Twin)
Most AI healthcare tools are either purely long-term calculators or single-metric alarms. CardioTwin runs two complementary engines simultaneously:
* **The Slow Twin (Longitudinal 10-Year Horizon)**: Uses an India-calibrated **QRISK3 / SCORE** model that factors in South Asian risk multipliers (early-onset CVD, metabolic syndrome, central obesity, elevated Lipoprotein(a)). It tells the doctor: *"This 52-year-old patient has the vascular heart age of a 66-year-old."*
* **The Fast Twin (Real-Time 6–12 Hour Horizon)**: Ingests 5-minute rolling telemetry and runs a **LightGBM engine** to detect acute impending events (e.g., nocturnal hypertensive crisis, acute heart failure decompensation). It tells the doctor: *"This patient's blood pressure will spike dangerously at 3:00 AM."*

---

### 🌊 2. 3-Element Windkessel Biophysical ODE Core
Instead of treating the human body as an arbitrary black-box neural network, CardioTwin simulates the actual physics of blood flow using differential equations:
$$\frac{dP}{dt} = \frac{I_{\text{heart}}(t) - \frac{P}{R_p}}{C}$$
* **$R_p$ (Peripheral Resistance)**: Measures how constricted or dilated the patient's small arteries are.
* **$C$ (Systemic Arterial Compliance)**: Measures how stiff or elastic the main aorta is.
* **$Z_c$ (Characteristic Impedance)** & **Stroke Volume**: Models cardiac ejection workload.
* **Result**: Generates real, pulsatile arterial pressure waveforms and Mean Arterial Pressure (MAP) on screen!

---

### 🧪 3. In-Silico "What-If" Counterfactual Simulation
Clinicians don't just want alerts; they want to test treatments before prescribing them. 
CardioTwin's **Scenarios Engine** allows interactive in-silico trials:
* **Drug Trials**: Move the slider to add *Amlodipine 5mg* or *Telmisartan 40mg* $\to$ peripheral resistance ($R_p$) drops by 22%, the pressure curve flattens, and the 12-hour crisis probability drops from **78% down to 14%**.
* **Lifestyle Interventions**: Simulate 30 minutes of daily aerobic exercise $\to$ arterial compliance ($C$) improves.
* **Environmental Stress**: Simulate high air pollution ($PM_{2.5} > 150\,\mu g/m^3$) $\to$ shows pollution-induced vasoconstriction and helps the doctor recommend an air purifier or medication timing adjustment.

---

### 📊 4. Multi-Modal Fusion (EHR + Smartwatch + Bangalore AQI)
CardioTwin links three data worlds together:
1. **Clinical EHR**: Lab reports, HbA1c, lipids, kidney function, and prescribed drugs.
2. **Wearable IoT Telemetry**: Continuous heart rate, HRV ($RMSSD$, $SDNN$, $LF/HF$ balance), blood pressure, blood oxygen ($SpO_2$), and sleep stages (REM, Deep, Light).
3. **Geospatial Environmental Data**: Live ambient air quality (AQI, $PM_{2.5}$, $PM_{10}$, temperature, humidity) calibrated for Indian cities.

---

### 🩺 5. Arrhythmia & Poincaré HRV Phase Plot
For patients with palpitations or post-bypass surgery:
* Continuously computes beat-to-beat ($RR$) intervals.
* Visualizes an interactive **Poincaré Scatter Plot** ($RR_n$ vs. $RR_{n+1}$) with calculated $SD_1$ (instantaneous beat variation) and $SD_2$ (long-term variability).
* Detects **Paroxysmal Atrial Fibrillation (AFib)**: When the regular ellipse breaks into a chaotic cloud, CardioTwin raises an urgent stroke-prevention alert.

---

### 🔍 6. Explainable AI with SHAP Biophysical Attribution
Doctors reject "black boxes." Every prediction in CardioTwin comes with an **interactive SHAP waterfall chart**:
* **+32% risk**: Nocturnal non-dipping blood pressure pattern.
* **+19% risk**: Ambient $PM_{2.5}$ pollution spike in Bangalore.
* **+14% risk**: Sympathetic stress surge ($LF/HF$ ratio spike).
* **-9% protection**: Adherence to prescribed Atorvastatin.

---

### 🏥 7. Hospital-Ready Clinical Workflow Suite
CardioTwin includes dedicated views for the entire clinical team:
* **Patient Cohort Roster (`/roster`)**: Triages patients by risk tier (`CRITICAL`, `ELEVATED`, `STABLE`).
* **Living Twin Core (`/patients/:id`)**: The primary dual-engine and arterial waveform view.
* **Nursing Desk (`/nursing-desk`)**: Audio-visual alarm station with **One-Click Acknowledge** and **Cardiologist Escalation** audit logging.
* **Cath Lab Triage (`/cath-lab-triage`)**: Real-time queue for emergency cardiac bed and catheterization prioritization.
* **Audit Vault (`/audit-vault`)**: Tamper-evident ledger of every alert, calibration, and clinical decision.
* **Model Datasheet (`/datasheet`)**: Standardized ethical documentation (Gebru et al.) showing Indian cohort calibration and model operating boundaries.

---

### 👤 8. Three Clinically Grounded Indian Patient Archetypes
To showcase the system during demonstrations:
* **CT-3092 (Ramesh Sharma, 58M)**: IT executive with Stage 2 Hypertension, poor sleep, and nocturnal non-dipping spikes. Perfect for the "What-If" crisis prevention demo.
* **CT-4105 (Priya Nair, 46F)**: Diabetic patient with microvascular stiffness sensitive to urban air pollution spikes.
* **CT-1088 (Anand Kulkarni, 64M)**: Post-bypass patient with intermittent palpitations; demonstrates the Poincaré plot and Atrial Fibrillation detection.

---

## 3. Summary of Project Health & Status

* **Backend Health**: All 17 endpoints return `200 OK`. Full test suite passes (`17 passed in 4.64s`).
* **Frontend Health**: Zero compilation errors. Builds cleanly in 1.51 seconds.
* **Real-Time Servers**:
  * Backend: [http://127.0.0.1:8000](http://127.0.0.1:8000) (Swagger Docs at `/docs`)
  * Frontend: [http://127.0.0.1:5173](http://127.0.0.1:5173)
* **Production Deliverable**: Updated and packaged at `cardioTwinCode.zip`.
