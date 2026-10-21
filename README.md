# 🫀 CardioTwin: AI-Powered Healthcare Digital Twin

> **AI-Powered Healthcare Digital Twin for Early Prediction of Chronic Cardiovascular Events**  
> Built for Indian urban healthcare challenges: Fusing static Electronic Health Records (EHR), continuous smartwatch telemetry (IoT), and ambient air pollution (PM2.5 / AQI) to predict acute cardiovascular crises 6 to 12 hours in advance.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.14-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/Frontend-React_19_TypeScript-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Bundler-Vite_8-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tests](https://img.shields.io/badge/Tests-17%2F17%20Passing-success.svg)](https://pytest.org)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)](#)

---

## 🌟 Key Highlights & Innovations

1. **Dual-Engine Architecture (Slow Twin + Fast Twin)**:
   - **Slow Twin (10-Year Horizon)**: Indian-calibrated **QRISK3 / SCORE** chronic risk model factoring in South Asian metabolic predisposition, premature CAD onset, and Lipoprotein(a).
   - **Fast Twin (6–12h Horizon)**: Real-time **LightGBM** acute crisis predictor running over rolling 5-minute telemetry epochs (detecting nocturnal non-dipping BP, sympathovagal surges, and loss of HRV).
2. **Biophysical ODE Simulation Core (3-Element Windkessel)**:
   - Evaluates systemic arterial hemodynamics using differential equations:
     $$\frac{dP}{dt} = \frac{I_{\text{heart}}(t) - \frac{P}{R_p}}{C}$$
   - Simulates real pulsatile arterial pressure waveforms, microvascular resistance ($R_p$), and aortic compliance ($C$).
3. **In-Silico Counterfactual "What-If" Simulation**:
   - Enables clinicians to test interventions (Amlodipine, Telmisartan, Beta-blockers, aerobic activity, pollution reduction) on the digital twin *before* prescribing.
4. **Tri-Modal Data Fusion**:
   - Seamlessly integrates **Hospital EHR** + **Smartwatch Telemetry** ($HR, HRV, BP, SpO_2$) + **Real-time Ambient Air Quality** ($PM_{2.5}, AQI$).
5. **Arrhythmia & Poincaré HRV Phase Plot**:
   - Beat-to-beat $RR_n$ vs $RR_{n+1}$ phase-space analysis with $SD_1$ and $SD_2$ metrics for paroxysmal Atrial Fibrillation (AFib) screening.
6. **Explainable AI (SHAP Biophysical Attribution)**:
   - Transparent waterfall plots breaking down exact clinical risk drivers (no black-box AI).
7. **Hospital-Grade Clinical Workflow**:
   - Patient Cohort Roster, Cath Lab Emergency Triage, Nursing Alarm Desk with One-Click Escalation, and Audit Vault.

---

## 🏗️ System Architecture

```
                       ┌──────────────────────────────────────────┐
                       │        Tri-Modal Data Ingestion          │
                       │  EHR (Static) + Wearable + CPCB AQI/Env  │
                       └────────────────────┬─────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
         ┌─────────────────────┐                         ┌─────────────────────┐
         │    THE SLOW TWIN    │                         │    THE FAST TWIN    │
         │  Longitudinal Risk  │                         │  Real-Time Crisis   │
         │  (10-Year Horizon)  │                         │   (6-12h Horizon)   │
         │  India-QRISK3 Score │                         │  LightGBM Telemetry │
         └──────────┬──────────┘                         └──────────┬──────────┘
                    │                                               │
                    └───────────────────────┬───────────────────────┘
                                            ▼
                           ┌─────────────────────────────────┐
                           │      BIOPHYSICAL SIMULATION     │
                           │   3-Element Windkessel Solver   │
                           │     dP/dt = (I(t) - P/Rp) / C   │
                           └────────────────┬────────────────┘
                                            ▼
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
         ┌───────────────────────┐                     ┌───────────────────────┐
         │  WHAT-IF COUNTERFACTUAL│                     │    EXPLAINABLE AI     │
         │ In-Silico Drug Trials │                     │ SHAP Risk Attribution │
         └───────────────────────┘                     └───────────────────────┘
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Python**: 3.11+ (Python 3.12 / 3.14 fully supported)
- **Node.js**: 18+ (Node 20 / 22 / 24 supported)

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional if using global python)
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend API server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* Backend API will run at **http://127.0.0.1:8000**
* Interactive Swagger Documentation: **http://127.0.0.1:8000/docs**

### 3. Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
* Open your browser at **http://localhost:5173**

### 4. Running Automated Tests
```bash
cd backend
pytest
```
* All 17 automated tests validate API schemas, simulation bounds, and triage logic.

---

## 📋 Available Routes & Dashboard Views

| Route | View Name | Description |
| :--- | :--- | :--- |
| `/` | **Landing Page** | Project mission, architecture diagram, and key capabilities. |
| `/roster` | **Patient Roster** | Triaged cohort list sorted by risk level (`CRITICAL`, `ELEVATED`, `STABLE`). |
| `/patients/:id` | **Living Twin** | Dual-engine risk gauges, 3-element Windkessel arterial waveforms, and biophysical cards. |
| `/patients/:id/explanation`| **Explainability Hub** | SHAP waterfall and biophysical attribution of positive/negative risk drivers. |
| `/patients/:id/scenarios` | **What-If Scenarios** | Interactive sliders for drug dosages (Amlodipine, Telmisartan) and environmental stressors. |
| `/patients/:id/signals` | **Multi-Signal Telemetry** | Continuous time series (HR, HRV, BP, SpO2, Sleep) + interactive Poincaré plot. |
| `/nursing-desk` | **Nursing Station** | Ward-level audio/visual alarm monitoring, acknowledgement, and cardiologist escalation. |
| `/cath-lab-triage` | **Cath Lab Triage** | Emergency prioritization queue for acute coronary intervention beds. |
| `/audit-vault` | **Audit Vault** | Tamper-evident ledger of clinical overrides, calibrations, and alert resolutions. |
| `/datasheet` | **Model Datasheet** | Standardized ethical model documentation (Gebru et al.) on Indian demographic calibration. |

---

## 👥 Built-In Clinical Patient Archetypes

* **CT-3092 (Ramesh Sharma, 58M)**: IT executive with Stage 2 Hypertension, poor sleep, and nocturnal non-dipping blood pressure. *Ideal for demonstrating 12h crisis prediction and Amlodipine in-silico simulation.*
* **CT-4105 (Priya Nair, 46F)**: Diabetic cardiomyopathy patient sensitive to urban air quality spikes ($PM_{2.5}$).
* **CT-1088 (Anand Kulkarni, 64M)**: Post-CABG patient with palpitations; demonstrates beat-to-beat Poincaré scatter dispersion for Paroxysmal Atrial Fibrillation.

---

## 🛠️ Tech Stack

* **Backend**: FastAPI, Uvicorn, Pydantic v2, NumPy, SciPy (ODE integration), LightGBM, SHAP.
* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts (time-series & scatter plots).
* **Protocols**: RESTful JSON API + WebSocket streaming for real-time telemetry replay (`/ws/replay/{patient_id}`).
* **Testing**: Pytest, FastAPI TestClient, Vitest/TypeScript compiler.

---

## 📄 License & Attribution
Developed for the Healthcare AI Hackathon (Bangalore).  
Adheres to the **Datasheets for Health Models** standard for algorithmic accountability.
