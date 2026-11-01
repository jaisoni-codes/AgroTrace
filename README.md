# AgroTrace (खेत्साक्षी)
### Satellite Witness for Localized Crop-Loss Claims under PMFBY
Forge Gen AI Buildathon — Theme 2: Climate, Resource Infrastructure and Global Supply Resilience

---

## 1. Overview
AgroTrace is an autonomous agent that takes a single farm polygon, crop, and claimed calamity date, then:
- Verifies the extreme event from live weather reanalysis (Open-Meteo ERA5 / Forecast).
- Measures plot-level damage from Sentinel-2 optical and Sentinel-1 radar imagery against 30 matched neighboring cropland plots (Difference-in-Differences).
- Executes consistency and anti-fraud checks.
- Returns a confidence-scored triage decision (`FAST_TRACK`, `SURVEYOR_VISIT`, or `REVIEW_FLAG`) with a tamper-evident evidence packet (PDF + JSON + SHA-256) and a Hindi voice summary.

## 2. Architecture & Design
Follows the **Survey Ledger** design system (editorial typography, warm paper tone, hairline rules, hatched uncertainty bands, and docked map layout).
- **Frontend**: React + Vite + Leaflet + Recharts + Lucide Icons + Tailwind
- **Backend API**: FastAPI (REST + Server-Sent Events stream)
- **Geospatial & Statistics**: Rasterio, PySTAC Client, Planetary Computer, Shapely, PyProj, Scipy, Scikit-learn
- **Evidence Output**: ReportLab PDF generator with cryptographic SHA-256 fingerprinting

## 3. Quickstart (Run Locally)

### Backend:
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
Backend will be live at `http://127.0.0.1:8000` (Docs: `http://127.0.0.1:8000/docs`).

### Frontend:
```bash
cd frontend
npm run dev
```
Frontend will be live at `http://localhost:5173`.

### Run Test Suite:
```bash
cd backend
python -m pytest tests/test_tools.py -v
```

## 4. Documentation Links
- [EXPLAINER.md](docs/EXPLAINER.md) - Plain-language walkthrough of each stage.
- [DATA_SOURCES.md](docs/DATA_SOURCES.md) - Verified live endpoints and STAC collections.
- [VALIDATION.md](docs/VALIDATION.md) - Positive calamity and negative control accuracy logs.
- [DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) - 3-minute live demonstration flow.
