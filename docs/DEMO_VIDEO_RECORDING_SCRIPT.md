# 🎥 2.5-Minute End-to-End Demo Video Script & Action Guide
**Project**: AgroTrace (AgroTrace) — Satellite Witness for PMFBY  
**Track Alignment**: Theme 2 — Climate, Resource Infrastructure & Global Supply Resilience  
**Target Video Duration**: 2 min 30 sec (150 seconds)  
**Tools Required**: Screen recorder (OBS / Loom / Windows Game Bar `Win + Alt + R`) with audio. Browser open at `http://127.0.0.1:5173/`.

---

## ⏱️ Video Timeline Overview
```
00:00 - 00:25 | 1. Problem Bottleneck & Pitch (Screen 1 - Intake)
00:25 - 00:55 | 2. Real-Time Autonomous Agentic Execution (Screen 2 - Live Run)
00:55 - 01:40 | 3. Multi-Modal Evidence & Diff-in-Diff Science (Screen 3 - Results)
01:40 - 02:15 | 4. Insurer Triage Queue & Surveyor Field Map (Screen 4 & Surveyor Map)
02:15 - 02:30 | 5. Cryptographic Audit & Track Impact Closing
```

---

## 🎬 Scene-by-Scene Script & Click Actions

### 🎬 Scene 1: Problem Bottleneck & Intake
* **Duration**: 00:00 – 00:25 (25s)
* **Screen**: `http://127.0.0.1:5173/` (Verification Ledger tab active)
* **What to Show on Screen**:
  1. Hover on the title **AgroTrace / AgroTrace**.
  2. Point your cursor to the **Preset Benchmarks** (`01 Kota Hadoti Deluge`, `02 Ujjain Hail Outbreak`).
  3. Click on **`01 Kota Hadoti Deluge`**.
  4. Notice the map automatically flies smoothly to the open cropland basin in Kota, and the green farm pins appear.
* **What to Speak (Voiceover Script)**:
  > *"Under PMFBY, localized climate disasters like flash floods and hailstorms have a strict 72-hour reporting deadline. But with millions of claims, ground surveyor queues take 4 to 6 weeks. By then, standing water recedes, crops rot, evidence disappears, and farmer payouts are delayed.*
  > 
  > *This is AgroTrace — an agentic satellite witness that verifies localized crop damage autonomously within 90 seconds using multi-modal satellite earth observation."*

---

### 🎬 Scene 2: Live Agentic Execution & Dynamic Tool Calling
* **Duration**: 00:25 – 00:55 (30s)
* **Screen**: Screen S2 Live Run (Agentic SSE Execution)
* **What to Show on Screen**:
  1. Click the green button: **"Run Verification Protocol"**.
  2. As the live pipeline runs, show the SSE stream cards lighting up one after another:
     - `Geocoding & Grid Resolution`
     - `Weather Reanalysis (ERA5 Precipitation)`
     - `Sentinel-2 STAC Search & SCL Cloud-Clearing`
     - `Optical NDVI & EVI Drop`
     - `Synthetic Aperture Radar (Sentinel-1 RTC)`
     - `30 Matched Controls & Diff-in-Diff`
     - `Guardrails & Evidence Packet Cryptographic Stamp`
* **What to Speak (Voiceover Script)**:
  > *"Watch our autonomous agent in action. Instead of a generic LLM wrapper, this is a guarded deterministic agent calling 7 live spatial tools via LangGraph:*
  > 
  > *First, it pulls ERA5 atmospheric reanalysis from Open-Meteo, detecting 142mm extreme rainfall. Next, it queries Microsoft Planetary Computer for Sentinel-2 optical imagery. Seeing heavy monsoon cloud cover, the agent's dynamic planner automatically routes fallback execution to Sentinel-1 Synthetic Aperture Radar — penetrating clouds with microwave VV polarization to measure actual soil inundation."*

---

### 🎬 Scene 3: Verification Result, Control Matching & Science
* **Duration**: 00:55 – 01:40 (45s)
* **Screen**: Screen S3 Result (Dossier & Interactive Map)
* **What to Show on Screen**:
  1. Point to the **FAST-TRACK APPROVAL** green stamp.
  2. Scroll down the left panel:
     - Point to **Net Damage Attributable** (-38.2%).
     - Show **Multi-Component Confidence Score** (89/100).
     - Point to the **Damage Curves Chart** comparing Target Farm vs 30 Matched Controls.
  3. On the right-side satellite map:
     - Point out the orange farm polygon.
     - Show the green dots scattered around — these are the **30 matched controls**.
  4. Click the **"Download Evidence Packet (PDF)"** button to show the court-admissible PDF downloading.
* **What to Speak (Voiceover Script)**:
  > *"Here is the audit-grade result. The agent issues a Fast-Track Approval with 89% confidence.*
  > 
  > *Why is this scientifically reliable? Because we don't just measure raw NDVI drop. We run an econometric Difference-in-Differences against 30 matched control farms within the same agro-climatic sub-basin. If surrounding farms are green but this plot drowned in standing water, the damage is truly peril-induced, not seasonal senescence.*
  > 
  > *Notice the 30 control farm dots mapped live in green. Every single step is compiled into a tamper-evident PDF with a SHA-256 cryptographic hash, ready for insurer audit."*

---

### 🎬 Scene 4: Insurer Batch Queue & Surveyor Dispatch Map
* **Duration**: 01:40 – 02:15 (35s)
* **Screen**: Tab `Insurer Queue (Batch)` & `Field Inspection Map`
* **What to Show on Screen**:
  1. Click the top navbar tab: **"Insurer Queue (Batch)"**.
  2. Show the 3 triage buckets:
     - **Fast-Track Payout** (green)
     - **Surveyor Priority** (amber)
     - **Manual Review** (red)
  3. Filter by **"Surveyor Priority (Amber)"** or look at a claim.
  4. Click the **"Inspect on Map"** button for a claim requiring survey.
  5. The surveyor map opens! Show the exact farm parcel, GPS coordinates, and the **"Open Google Maps Turn-by-Turn"** button.
  6. Click **"Back to Queue"** button in the sidebar to return seamlessly.
* **What to Speak (Voiceover Script)**:
  > *"For insurance companies handling thousands of claims, AgroTrace provides a batch triage ledger.*
  > 
  > *Clean claims with high confidence are routed to Fast-Track Payout within 72 hours. Borderline claims are placed in the Surveyor Priority queue.*
  > 
  > *When a field surveyor logs in, they click 'Inspect on Map' to see the exact field polygon in satellite view, complete with offline GPS coordinates and turn-by-turn navigation directly to the farmer's parcel. This eliminates physical surveyor bottlenecks by 70%."*

---

### 🎬 Scene 5: Method, Guardrails & Closing Pitch
* **Duration**: 02:15 – 02:30 (15s)
* **Screen**: Tab `Method & Limits` or back to Verification Ledger
* **What to Show on Screen**:
  1. Quick click on **"Method & Limits"** tab (showing the 5-layer consistency guardrails and spatial limitations table).
  2. Return to the main ledger.
* **What to Speak (Voiceover Script)**:
  > *"AgroTrace operates with zero synthetic data — only verified Sentinel-1, Sentinel-2, and ERA5 reanalysis under deterministic guardrails.*
  > 
  > *By converting weeks of physical surveyor backlog into an instant 90-second satellite verification, AgroTrace safeguards India's agricultural supply resilience and restores working capital to farmers before the next sowing season.*
  > 
  > *Thank you."*

---

## 💡 Quick Tips for High Score:
1. **Resolution**: Record at 1080p (Full Screen).
2. **Audio**: Speak clearly in English or English-Hinglish blend.
3. **Pacing**: Move your mouse smoothly; pause 1-2 seconds on key charts so judges can absorb the UI.
