# AgroTrace - Plain-Language Walkthrough
Satellite Witness for Localized Crop-Loss Claims under PMFBY

## What Problem AgroTrace Solves
Under PMFBY (Pradhan Mantri Fasal Bima Yojana), localized calamities like hailstorms and inundations are assessed farm-by-farm. Farmers must report damage within 72 hours. With only a limited number of surveyors available, visits can take weeks, during which weather and rotting wash away physical evidence.
Existing satellite initiatives like YES-TECH estimate yield at the area (gram panchayat/block) level. AgroTrace fills the missing **hyper-local plot-level triage** gap.

## 10-Step Deterministic + Agentic Architecture
1. **Intake & Validation**: Clean polygon geometry, validates area <= 50 ha, validates claimed sowing and event dates.
2. **Event Verification**: Live weather reanalysis (Open-Meteo ERA5 & Climatology) checks whether 7-day precipitation or convective hail conditions occurred near the claimed date.
3. **Imagery Search (STAC)**: Searches Sentinel-2 L2A optical and Sentinel-1 RTC radar acquisitions over the farm polygon before and after the event.
4. **Cloud Masking**: Analyzes the Scene Classification Layer (SCL) to ensure at least 60% of plot pixels are clear. If cloudy, automatically switches or augments with radar.
5. **Vegetation & SAR Indices**: Computes NDVI and EVI with exact processing-baseline offsets. For radar, converts VV power to dB and detects standing water.
6. **Matched Controls & Difference-in-Differences**: Samples candidate cropland blocks from a 1-5 km ring using ESA WorldCover. Picks the 30 closest matching plots that share the exact crop cycle and seasonality. Calculates excess drop and z-score.
7. **Consistency & Fraud Checks**: Re-checks event date match (+/-2 days pass, +/-5 days warn), crop vegetation presence (mean NDVI > 0.3), area overlap, and distinctness vs neighbors.
8. **Scoring**: Computes multi-component confidence score (data quality, control separation, event agreement, crop consistency, spatial coverage).
9. **Triage Decision**:
   - `FAST_TRACK`: Event verified, damage >= 20%, distinct (z <= -2), high confidence (>= 75%).
   - `SURVEYOR_VISIT`: Moderate confidence or 10-20% damage or widespread pattern.
   - `REVIEW_FLAG`: Event mismatch, no crop signal, or low confidence.
10. **Evidence Packet**: Produces a tamper-evident PDF + JSON with SHA-256 fingerprint, along with a farmer summary in Hindi/English.
