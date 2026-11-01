# Technical Slide Specification: AI Reasoning & Agentic Architecture
**Project**: KhetSaakshi (Satellite Witness for PMFBY Claims)
**Theme**: Climate, Resource Infrastructure & Global Supply Resilience

---

### INSTRUCTIONS FOR CLAUDE:
Create a dedicated technical slide titled:
## "AI Reasoning & Agentic Execution: Built for Zero Hallucination"

Format this slide visually with clean architectural blocks, process flows, and comparison cards (not plain bulleted text) covering the following **4 Core Technical Pillars**:

---

## 1. Autonomous 10-Node State Graph (Multi-Step Tool Use)
- **Role**: Full workflow autonomy from raw farm polygon to verified evidence.
- **Visual Process Flow**:
  `[01 Geo Intake] -> [02 weather_tool (ERA5)] -> [03 stac_search (S2/S1)] -> [04 cloud_mask (SCL)] -> [05 Dual-Sensor Extraction] -> [06 control_matcher (Diff-in-Diff)] -> [07 consistency_tool] -> [08-10 scoring & packet_tool]`
- **Technical Detail**: Built on LangGraph state machine; sequentially coordinates multiple satellite and meteorological APIs without human intervention.

---

## 2. Dynamic Self-Correction & Sensor Failover (Workflow Resilience)
- **Problem**: Monsoonal cloud cover blinds optical satellites (Sentinel-2), causing standard AI pipelines to crash or report false zeros.
- **Visual Decision Fork (Self-Healing Intercept)**:
  - **Primary Route**: If Scene Classification (SCL) clear pixels $\ge 60\% \rightarrow$ Processes Sentinel-2 Optical Reflectance (Bands B02, B04, B08 $\rightarrow$ NDVI / EVI).
  - **Agentic Intercept (FALLBACK)**: If SCL clear pixels $< 60\% \rightarrow$ Agent autonomously intercepts execution and switches modality to **Sentinel-1 RTC Synthetic Aperture Radar (SAR)**.
- **Outcome**: Converts C-band VV backscatter power to decibels ($10 \cdot \log_{10}(\text{power})$) to penetrate 100% of cloud cover and map standing floodwater.

---

## 3. Deterministic Guardrails (Zero Hallucination Architecture)
- **Visual Comparison (Cognitive Planner vs Deterministic Calculator)**:
  - **Left Card [LLM Role — Planner & Narrator]**:
    - Handles multi-lingual free-text/voice intake (Hindi, Hinglish, English).
    - Plans state transitions and narrates farmer-language summaries.
    - **Strict Guardrail**: The LLM *NEVER calculates numbers* and is barred from inventing metrics.
  - **Right Card [Python Core — Deterministic Math Engine]**:
    - All mathematical computations run in audited Python libraries (`rasterio`, `numpy`, `scipy`).
    - Executes difference-in-differences against 30 matched controls in a 1–5 km ring:
      $$z = \frac{\Delta\text{Plot} - \overline{\Delta\text{Controls}}}{\sigma_{\text{Controls}}}$$
    - Calculates 500-iteration bootstrap 90% confidence intervals.

---

## 4. Verifiable Source Attribution & Provenance
- **Auditability**: Every number and triage verdict is cryptographically verifiable and anchored to raw source metadata:
  - **Optical Evidence**: Exact Sentinel-2 L2A STAC Scene IDs (`S2A_MSIL2A_...`).
  - **Radar Evidence**: Sentinel-1 RTC Scene IDs (`S1A_IW_GRDH_...`).
  - **Weather Ground Truth**: Open-Meteo ERA5 7-day cumulative rainfall and WMO convective codes (96/99).
  - **Tamper Evidence**: An immutable **SHA-256 cryptographic hash** is generated over the canonical evidence JSON and stamped onto the PDF evidence packet.

---

### Key Takeaway for Judges:
> *"The LLM plans and communicates; deterministic spatial math calculates. Full agentic autonomy with cloud-proof sensor failover, 100% reproducible math, and zero hallucination."*
