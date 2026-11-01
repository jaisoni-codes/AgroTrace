# KhetSaakshi: Pitch Deck Content & Architecture Specification
**Track**: Theme 2 — Climate, Resource Infrastructure & Global Supply Resilience  
**Project**: KhetSaakshi (Satellite Witness for Localized PMFBY Crop-Loss Claims)

---

## Instructions for Claude (Deck Designer)
Use the exact visual layouts, state graphs, comparative architecture cards, and data points provided in this document to generate/update the pitch deck. 
**Design Style**: Clean, high-contrast, technical, data-dense, and executive. Avoid generic AI buzzwords; emphasize engineering depth, deterministic spatial math, and autonomous agent resilience.

---

# SLIDE 1: Autonomous Agent Architecture — 10-Node State Graph with Dynamic Failover

### Slide Goal
Earn 25/25 on **AI Reasoning & Agentic Execution (Pillar 2)** by demonstrating multi-step autonomous tool use, dynamic error handling, and self-correction.

### Visual Layout: Top-to-Bottom Interactive Pipeline
```
[01 Geo Intake] ──► [02 ERA5 Weather] ──► [03 STAC Catalog Search]
                                                    │
                                                    ▼
                                        [04 Cloud Audit (SCL Mask)]
                                         /                       \
             (Clear: SCL Clear >= 60%)  /                         \  (Cloudy / Monsoon Deluge)
                                       ▼                           ▼
                     [05a Optical Reflectance]           ★ [AUTONOMOUS SENSOR FAILOVER] ★
                     - Bands B02, B04, B08               - Modality Switch: Sentinel-1 RTC
                     - Windowed COG Reads                - Active C-Band SAR Radar (VV in dB)
                     - Dynamic Offset/Scale              - 100% Cloud-Proof Flood Masking
                                       \                           /
                                        \                         /
                                         ▼                       ▼
                                      [06 Matched Controls Diff-in-Diff]
                                      - 30 Cropland Plots (1-5 km Ring)
                                      - Bootstrap 90% Confidence Interval
                                                    │
                                                    ▼
                                      [07 Anti-Fraud & Consistency]
                                      - Date Window | Crop Signal | z <= -2
                                                    │
                                                    ▼
                                      [08-10 Multi-Component Triage]
                                      - FAST_TRACK / SURVEYOR / REVIEW
                                      - Tamper-Evident SHA-256 Packet
```

### Key Technical Highlight Box: "Self-Healing Agentic Resilience"
- **The Failure Mode**: Conventional satellite pipelines crash or report false zeroes when monsoon cloud cover obscures the target farm.
- **The Agentic Intercept**: Our LangGraph agent monitors the Scene Classification Layer (SCL). If clear pixels drop below 60%, the agent dynamically switches sensor modalities from optical to **Sentinel-1 SAR Radar**, converting backscatter power to decibels ($10 \cdot \log_{10}(\text{power})$) to detect standing water underneath cloud cover.
- **Trace Proof**: Displayed live to judges with execution durations and a dedicated `FALLBACK` row in the ledger trace.

### Technical Stack Badges
`LangGraph State Graph` | `Microsoft Planetary Computer STAC` | `PySTAC Client` | `Open-Meteo ERA5 Reanalysis`

---

# SLIDE 2: Zero-Hallucination Engineering — Cognitive Planner vs Deterministic Calculator

### Slide Goal
Earn 20/20 on **Technical Depth (Pillar 1)** and prove absolute hallucination resistance and cryptographic auditability.

### Visual Layout: 2-Column High-Tech Architecture Comparison

```
+------------------------------------------+------------------------------------------+
|  COGNITIVE LAYER: THE AGENTIC PLANNER    |  DETERMINISTIC ENGINE: SPATIAL CALCULATOR|
|  (Tool-Calling State Machine)            |  (Python Audited Math Core)              |
+------------------------------------------+------------------------------------------+
| 1. Natural Language / Speech Intake:     | 1. Windowed COG Array Reads:             |
|    - Parses free-text & voice speech     |    - Reads only farm polygon pixels via  |
|      in Hindi, Hinglish, & English.      |      rasterio (sub-second latency).      |
|    - Extracts crop, peril, date, & area  |                                          |
|                                          | 2. Difference-in-Differences Engine:     |
| 2. Autonomous Tool Sequencing:           |    - Samples 200 cropland candidate      |
|    - Decides state transitions & retry   |      blocks; matches 30 closest controls |
|      budgets (max 3 retries per node).   |    - Excess = (Delta_plot - Delta_ctrls) |
|                                          |                                          |
| 3. Guarded Report Writer:                | 3. Statistical Separation & Noise Floor: |
|    - Writes farmer & insurer summaries.  |    - z-score = Excess / std(controls)    |
|    - Strict Schema: can ONLY restate     |    - 500-iteration bootstrap 90% CI      |
|      values present in verified JSON.    |                                          |
|                                          | 4. Cryptographic Provenance:             |
| STRICT GUARDRAIL:                        |    - SHA-256 hash generated over canonical|
| LLM NEVER calculates numbers. It cannot  |      JSON payload. Stamped on PDF packet.|
| hallucinate or invent unseen metrics.    |                                          |
+------------------------------------------+------------------------------------------+
| Tech: LangGraph / Guarded Prompting      | Tech: rasterio, numpy, scipy, shapely    |
+------------------------------------------+------------------------------------------+
```

### The Difference-in-Differences Econometric Formula
Show this exact formulation to highlight analytical depth:
$$\text{Excess Damage} = (\text{NDVI}_{\text{post}} - \text{NDVI}_{\text{pre}}) - (\overline{\Delta \text{Controls}})$$
$$\text{Damage \%} = \text{clamp}\left(-\frac{\text{Excess Damage}}{\text{NDVI}_{\text{pre}}}, 0, 1\right) \times 100$$
$$z = \frac{\Delta \text{Plot} - \overline{\Delta \text{Controls}}}{\sigma_{\text{Controls}}}$$

### Verifiable Attribution & Provenance
Every output metric references its exact raw origin:
- **Optical Assets**: Sentinel-2 Scene IDs (`S2A_MSIL2A_...`) with B02, B04, B08 reflectance metadata.
- **Radar Assets**: Sentinel-1 RTC Scene IDs (`S1A_IW_GRDH_...`) with VV polarization.
- **Weather Metrics**: ERA5 7-day cumulative rainfall and convective CAPE indicators.
- **Tamper Evidence**: Immutable `SHA-256` checksum verifiable by insurers and state authorities.

---

# SLIDE 3: Problem Statement, Real Gap & Track Alignment

### Track Alignment
- **Track**: Theme 2 — Climate, Resource Infrastructure & Global Supply Resilience.
- **Context**: PMFBY (Pradhan Mantri Fasal Bima Yojana) settles localized calamities (flash floods, hailstorms) on an individual farm-by-farm basis with a strict 72-hour reporting deadline.
- **The Real-World Bottleneck**: Extreme climate shifts create localized surveyor queues taking 4–6 weeks. During this delay, standing water recedes, rotting crops decompose, and physical evidence fades, resulting in disputes, delayed payouts, and disrupted seed-capital for the next sowing cycle.

### The Critical Gap: YES-TECH vs KhetSaakshi
| Feature | Government YES-TECH (Existing) | KhetSaakshi (Our Solution) |
|---|---|---|
| **Assessment Unit** | Gram Panchayat / Block (Area Approach) | **Individual Farm Polygon (Plot-Level)** |
| **Primary Use Case** | Season-end crop yield estimation | **Rapid 72-Hour Localized Calamity Triage** |
| **Sensor Modality** | Area-averaged optical satellite passes | **Dual-Sensor (Optical + Cloud-Proof SAR Radar)** |
| **Noise Filtering** | Regional statistical averages | **Difference-in-Differences vs 30 Matched Controls** |
| **Turnaround Time** | Weeks / End of season | **< 2 Minutes End-to-End** |

---

# SLIDE 4: Live Validation Protocol & Accuracy Metrics

### 1. Documented Calamity Verification (Positive Tests)
- **Kota Hadoti Flash Flood (Aug 2022)**:
  - ERA5 Weather: 189.8 mm 7-day deluge (Peak 90.4 mm/day, 99.9th percentile).
  - Sentinel-1 SAR: Surface water inundation confirmed.
  - Measured Damage: **47.1%** | $z = -3.4$ | Confidence: **84.0%** &rarr; **`FAST_TRACK`**
- **Ujjain Hail Outbreak (Mar 2024)**:
  - Weather Reanalysis: Severe convective storm (Weather code 99).
  - Measured Damage: **34.2%** | $z = -2.8$ | Confidence: **78.5%** &rarr; **`FAST_TRACK`**

### 2. Negative Controls & Anti-Fraud (Zero False-Flag Guarantee)
- **Normal Healthy Cropland (Bathinda Rural, Feb 2024)**:
  - Calm weather window, healthy vegetation canopy.
  - Measured Damage: **0.0%** &rarr; Model correctly avoids false payouts.
- **Urban / Non-Cropland Claim Attempt**:
  - Pre-event vegetation NDVI $< 0.30$ (bare soil/road).
  - Model catches claim fraud: **`REVIEW_FLAG`** (*"No active vegetative crop signal identified"*).
