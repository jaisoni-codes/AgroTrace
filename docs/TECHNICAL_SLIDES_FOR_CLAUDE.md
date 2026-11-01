# Technical Slides Specification: AI Reasoning & Agentic Architecture
**Theme**: Climate, Resource Infrastructure & Global Supply Resilience  
**Project**: AgroTrace (Autonomous Satellite Agent for PMFBY Claims)

---

### INSTRUCTIONS FOR CLAUDE:
Create **2 dedicated, highly detailed technical slides** in the pitch deck for our core solution. 
Follow the exact visual diagrams, flowchart blocks, comparative cards, and formulas below. Do not summarize or simplify them into generic bullet points.

---

# SLIDE 1: Autonomous Agent Architecture — 10-Node State Graph with Dynamic Failover

### Visual Component 1: Top-to-Bottom Autonomous Execution Pipeline
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

### Visual Component 2: Dedicated Highlight Box — "Self-Healing Agentic Resilience"
```
+---------------------------------------------------------------------------------------------------+
|  AGENT SELF-CORRECTION IN ACTION (Sensor Failover Protocol)                                       |
|                                                                                                   |
|  1. Optical Degradation Detected:                                                                 |
|     - SCL (Scene Classification Layer) reveals plot clear-pixel fraction = 34% (Monsoon overcast) |
|     - Optical NDVI/EVI cannot be trusted due to cloud scattering.                                 |
|                                                                                                   |
|  2. Autonomous Agentic Intercept:                                                                 |
|     - State Graph router catches degradation without human intervention.                          |
|     - Triggers automated failover: Switches STAC collection to 'sentinel-1-rtc'.                  |
|                                                                                                   |
|  3. Cloud-Penetrating Active SAR Radar Execution:                                                 |
|     - Microwave C-band penetrates 100% cloud cover and precipitation.                             |
|     - Converts VV linear power to Decibels: dB = 10 * log10(power).                               |
|     - Thresholds surface water: VV < -16 dB with Delta drop < -3 dB detects standing floodwater.  |
|                                                                                                   |
|  4. Trace Verification:                                                                           |
|     - Emitted in real-time SSE stream with dedicated [FALLBACK] badge and execution timestamp.   |
+---------------------------------------------------------------------------------------------------+
```

### Technical Stack Footnote:
`LangGraph State Graph` | `Microsoft Planetary Computer STAC` | `PySTAC Client` | `Open-Meteo ERA5 Reanalysis`

---

# SLIDE 2: Zero-Hallucination Architecture — Cognitive Planner vs Deterministic Calculator

### Visual Component 1: Split 2-Column High-Tech Architecture Comparison
```
+----------------------------------------------------+----------------------------------------------------+
|  COGNITIVE LAYER: THE AGENTIC PLANNER              |  DETERMINISTIC ENGINE: SPATIAL CALCULATOR          |
|  (LLM State Machine & Natural Language Interface)  |  (Python Audited Mathematical Core)                |
+----------------------------------------------------+----------------------------------------------------+
| 1. Multi-Lingual Dialect Parsing:                  | 1. Windowed COG Array Reads:                       |
|    - Free-text & speech recognition in Hindi,      |    - Fetches only farm polygon bounding box        |
|      Hinglish, and English.                        |      via rasterio windowed reads (sub-second).     |
|    - Maps informal farmer statements to strict     |    - Applies dynamic sensor offset/scale:          |
|      Pydantic schema (crop, peril, date, area).    |      Reflectance = (DN + offset) * 0.0001          |
|                                                    |                                                    |
| 2. Autonomous State Planning:                      | 2. Difference-in-Differences Econometric Engine:   |
|    - Sequentially directs tool calls across nodes. |    - Samples 200 candidate cropland blocks;        |
|    - Enforces retry budgets (max 3 per node).      |      matches 30 closest controls in 1-5 km ring.   |
|                                                    |    - Excess = (Delta_plot - Delta_controls)        |
| 3. Guarded Report Narrator:                        |                                                    |
|    - Emits plain-language farmer summary           | 3. Statistical Separation & Noise Floor:           |
|      with browser Text-to-Speech (TTS).            |    - z-score = Excess / std(control_changes)       |
|    - Strict Schema Lock: May ONLY read numbers     |    - 500-iteration bootstrap 90% confidence        |
|      already computed in verified JSON payload.    |      interval for empirical uncertainty bounds.    |
|                                                    |                                                    |
| STRICT GUARDRAIL:                                  | 4. Cryptographic Provenance & Auditability:        |
| The LLM NEVER calculates numbers. It is            |    - Canonical JSON serialized and hashed via      |
| mathematically barred from inventing metrics       |      SHA-256. Cryptographic fingerprint stamped    |
| or hallucinating damage percentages.               |      onto downloadable PDF evidence packet.        |
+----------------------------------------------------+----------------------------------------------------+
| Technology: LangGraph / Guarded Prompting          | Technology: rasterio, numpy, scipy, shapely, pyproj|
+----------------------------------------------------+----------------------------------------------------+
```

### Visual Component 2: Difference-in-Differences Mathematical Proof
Show this exact mathematical formulation on the slide to demonstrate analytical depth:

$$\text{Excess Damage} = (\text{NDVI}_{\text{post}} - \text{NDVI}_{\text{pre}}) - (\overline{\Delta \text{Controls}})$$

$$\text{Damage \%} = \text{clamp}\left(-\frac{\text{Excess Damage}}{\text{NDVI}_{\text{pre}}}, 0, 1\right) \times 100$$

$$z\text{-score} = \frac{\Delta \text{Plot} - \overline{\Delta \text{Controls}}}{\sigma_{\text{Controls}}}$$

$$\text{Confidence} = 100 \times \left(0.30 Q_{\text{data}} + 0.25 S_{\text{ctrl}} + 0.20 E_{\text{event}} + 0.15 C_{\text{crop}} + 0.10 A_{\text{spatial}}\right)$$

### Visual Component 3: Cryptographic Provenance Traceability
- **Optical Assets**: Sentinel-2 Scene IDs (`S2A_MSIL2A_...`) with B02, B04, B08 reflectance metadata.
- **Radar Assets**: Sentinel-1 RTC Scene IDs (`S1A_IW_GRDH_...`) with VV decibel values.
- **Meteorological Ground Truth**: Open-Meteo ERA5 7-day cumulative rainfall and convective CAPE codes.
- **Tamper Evidence**: Immutable `SHA-256` checksum verifiable by insurers and state authorities.

---

### Core Takeaway for Evaluators:
> *"The LLM plans and communicates; deterministic spatial math calculates. Full agentic autonomy with cloud-proof sensor failover, 100% reproducible math, and zero hallucination."*
