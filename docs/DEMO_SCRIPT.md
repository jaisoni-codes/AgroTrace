# AgroTrace - 3-Minute Live Demo Pitch Script
Matches PDF Section 9 & Section 14.

### 0:00 - 0:25 The Problem & Gap
- Under PMFBY, localized calamities (flood/hail) are assessed farm-by-farm within a 72-hour notification window.
- Surveyor queues create multi-week delays and mutual distrust.
- Government's YES-TECH operates at the area-yield level. AgroTrace fills the missing hyper-local plot-level triage layer.

### 0:25 - 1:35 Live Verification Run
- Select or click any farm polygon on the map.
- Voice / natural language intake automatically fills crop, peril and area.
- Watch the live agent trace stream:
  - Step 1: Geometry validated.
  - Step 2: Open-Meteo ERA5 weather verified.
  - Step 3: Sentinel-2 imagery retrieved.
  - Step 4: Cloud mask flags overcast skies -> FALLBACK to Sentinel-1 SAR radar.
  - Step 5-6: Diff-in-Diff executed against 30 matched neighbor controls in a 1-5km ring.
  - Step 7: Consistency audits pass.

### 1:35 - 2:15 The Evidence Sheet
- Triage verdict stamp: FAST TRACK.
- Before/after slider shows plot condition change.
- Multi-component confidence score with hatched uncertainty range.
- SHA-256 tamper-evident PDF & JSON downloads.
- Browser Text-to-Speech narrates the Hindi summary for the farmer.

### 2:15 - 3:00 Batch Queue & Honest Limits
- Insurer batch queue shows real sampled cropland plots across districts.
- Method & Limits screen explains honest physical constraints (10m resolution, revisit cycle).
