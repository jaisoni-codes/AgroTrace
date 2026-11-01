import json
import uuid
import asyncio
import urllib.request
from pathlib import Path
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from sse_starlette.sse import EventSourceResponse

from app.models.schemas import CaseCreateRequest, IntakeParseRequest, IntakeParseResponse
from app.agent.llm import parse_intake_text
from app.agent.graph import run_pipeline_graph, PACKETS_DIR

app = FastAPI(
    title="AgroTrace API",
    description="Satellite Witness for Localized Crop-Loss Claims under PMFBY",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CASES_DB: Dict[str, Dict[str, Any]] = {}
CASE_EVENTS: Dict[str, List[Dict[str, Any]]] = {}

def get_location_name_from_coords(lat: float, lon: float, fallback: str = "Agricultural Plot") -> str:
    """Reverse geocode coordinates to real village/tehsil/district/state."""
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json"
        req = urllib.request.Request(url, headers={'User-Agent': 'AgroTraceApp/1.0'})
        with urllib.request.urlopen(req, timeout=4) as response:
            data = json.loads(response.read().decode('utf-8'))
            address = data.get("address", {})
            village = address.get("village") or address.get("town") or address.get("suburb") or address.get("city") or ""
            district = address.get("state_district") or address.get("county") or ""
            state = address.get("state") or ""
            
            parts = [p for p in [village, district, state] if p]
            if parts:
                return ", ".join(parts)
            return data.get("display_name", "").split(",")[0] or fallback
    except Exception:
        return fallback

BATCH_CLAIMS: List[Dict[str, Any]] = [
    {
        "case_id": "c_rj8912",
        "district": "Bamori Village Cropland, Kota (Rajasthan)",
        "crop": "Soybean",
        "peril": "flood",
        "event_date": "2022-08-23",
        "damage_pct": 47.1,
        "damage_ci": [38.2, 53.4],
        "z_vs_controls": -3.4,
        "confidence": 84.0,
        "triage": "FAST_TRACK",
        "lat": 25.1867,
        "lon": 76.1908,
        "area_ha": 1.45,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[[76.175, 25.29], [76.18, 25.29], [76.18, 25.2945], [76.175, 25.2945], [76.175, 25.29]]]
        }
    },
    {
        "case_id": "c_mp4410",
        "district": "Ujjain Cropland (Madhya Pradesh)",
        "crop": "Wheat",
        "peril": "hail",
        "event_date": "2024-03-02",
        "damage_pct": 34.2,
        "damage_ci": [26.0, 41.5],
        "z_vs_controls": -2.8,
        "confidence": 78.5,
        "triage": "FAST_TRACK",
        "lat": 23.17,
        "lon": 75.78,
        "area_ha": 2.1,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[[75.78, 23.17], [75.785, 23.17], [75.785, 23.175], [75.78, 23.175], [75.78, 23.17]]]
        }
    },
    {
        "case_id": "c_mh7201",
        "district": "Amravati (Maharashtra)",
        "crop": "Cotton",
        "peril": "flood",
        "event_date": "2023-09-11",
        "damage_pct": 18.5,
        "damage_ci": [12.0, 24.2],
        "z_vs_controls": -1.6,
        "confidence": 62.0,
        "triage": "SURVEYOR_VISIT",
        "lat": 20.93,
        "lon": 77.75,
        "area_ha": 3.4,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[[77.75, 20.93], [77.755, 20.93], [77.755, 20.935], [77.75, 20.935], [77.75, 20.93]]]
        }
    },
    {
        "case_id": "c_up3189",
        "district": "Barabanki (Uttar Pradesh)",
        "crop": "Paddy",
        "peril": "flood",
        "event_date": "2023-08-25",
        "damage_pct": 42.0,
        "damage_ci": [35.0, 48.0],
        "z_vs_controls": -1.1,
        "confidence": 68.0,
        "triage": "SURVEYOR_VISIT",
        "lat": 26.92,
        "lon": 81.18,
        "area_ha": 1.1,
        "widespread": True,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[[81.18, 26.92], [81.185, 26.92], [81.185, 26.925], [81.18, 26.925], [81.18, 26.92]]]
        }
    },
    {
        "case_id": "c_pb1044",
        "district": "Bathinda Rural (Punjab)",
        "crop": "Wheat",
        "peril": "flood",
        "event_date": "2024-02-10",
        "damage_pct": 0.0,
        "damage_ci": [0.0, 0.0],
        "z_vs_controls": 0.0,
        "confidence": 88.0,
        "triage": "REVIEW_FLAG",
        "lat": 30.21,
        "lon": 74.94,
        "area_ha": 1.8,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[[74.94, 30.21], [74.945, 30.21], [74.945, 30.215], [74.94, 30.215], [74.94, 30.21]]]
        }
    }
]

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "AgroTrace", "version": "1.0.0"}

@app.get("/api/sources/status")
def get_sources_status():
    return {
        "sentinel2": {"status": "live", "provider": "Planetary Computer STAC", "latency_ms": 180},
        "sentinel1": {"status": "live", "provider": "Planetary Computer RTC", "latency_ms": 210},
        "weather": {"status": "live", "provider": "Open-Meteo ERA5 Reanalysis", "latency_ms": 95},
        "llm": {"status": "live", "provider": "Gemini / Guarded Deterministic", "latency_ms": 140}
    }

@app.post("/api/intake/parse", response_model=IntakeParseResponse)
def api_parse_intake(req: IntakeParseRequest):
    return parse_intake_text(req.text)

@app.post("/api/cases")
async def create_case(req: CaseCreateRequest, background_tasks: BackgroundTasks):
    case_id = f"c_{uuid.uuid4().hex[:6]}"
    case_data = req.dict()
    case_data["case_id"] = case_id
    case_data["created_at"] = time_now()

    CASES_DB[case_id] = {
        "status": "processing",
        "request": case_data,
        "packet": None
    }
    CASE_EVENTS[case_id] = []

    async def process():
        async for event in run_pipeline_graph(case_data):
            CASE_EVENTS[case_id].append(event)
            if event.get("node") == "Evidence packet ready" and "packet" in event:
                pkt = event["packet"]
                CASES_DB[case_id]["packet"] = pkt
                CASES_DB[case_id]["status"] = "completed"
                
                centroid = pkt.get("plot", {}).get("centroid", [25.29, 76.17])
                lat_c, lon_c = centroid[0], centroid[1]
                
                # Reverse geocode to get accurate real Village, District, State
                real_location = case_data.get("district")
                if not real_location or "Claimed" in real_location:
                    real_location = get_location_name_from_coords(lat_c, lon_c, "Agricultural Plot")
                
                pkt["district"] = real_location
                analysis = pkt.get("analysis", {})
                new_entry = {
                    "case_id": case_id,
                    "district": real_location,
                    "crop": pkt.get("crop", "Crop"),
                    "peril": pkt.get("peril", "flood"),
                    "event_date": pkt.get("claimed_event_date", "2023-08-14"),
                    "damage_pct": analysis.get("damage_pct", 0.0),
                    "damage_ci": analysis.get("damage_ci", [0.0, 0.0]),
                    "z_vs_controls": analysis.get("z_vs_controls", 0.0),
                    "confidence": pkt.get("confidence", 50.0),
                    "triage": pkt.get("triage", "REVIEW_FLAG"),
                    "lat": lat_c,
                    "lon": lon_c,
                    "area_ha": pkt.get("plot", {}).get("area_ha", 1.0),
                    "geometry": pkt.get("plot", {}).get("geometry")
                }
                BATCH_CLAIMS.insert(0, new_entry)

    background_tasks.add_task(process)
    return {"case_id": case_id, "status": "processing"}

@app.get("/api/cases/{case_id}/stream")
async def stream_case_events(case_id: str, request: Request):
    async def event_generator():
        sent_index = 0
        while True:
            if await request.is_disconnected():
                break

            events = CASE_EVENTS.get(case_id, [])
            while sent_index < len(events):
                ev = events[sent_index]
                sent_index += 1
                yield {
                    "event": "message",
                    "id": str(sent_index),
                    "data": json.dumps(ev)
                }

            if case_id in CASES_DB and CASES_DB[case_id]["status"] == "completed" and sent_index >= len(events):
                yield {
                    "event": "done",
                    "id": str(sent_index + 1),
                    "data": json.dumps({"status": "completed"})
                }
                break

            await asyncio.sleep(0.2)

    return EventSourceResponse(event_generator())

@app.get("/api/cases/{case_id}")
def get_case_result(case_id: str):
    if case_id not in CASES_DB:
        raise HTTPException(status_code=404, detail="Case not found")
    case = CASES_DB[case_id]
    if case["status"] == "processing":
        return {"case_id": case_id, "status": "processing"}
    return case["packet"]

@app.get("/api/cases/{case_id}/packet.json")
def download_packet_json(case_id: str):
    json_path = PACKETS_DIR / f"{case_id}_packet.json"
    if not json_path.exists():
        raise HTTPException(status_code=404, detail="Packet JSON not yet ready")
    return FileResponse(json_path, media_type="application/json", filename=f"{case_id}_evidence.json")

@app.get("/api/cases/{case_id}/packet.pdf")
def download_packet_pdf(case_id: str):
    pdf_path = PACKETS_DIR / f"{case_id}_packet.pdf"
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="Packet PDF not yet ready")
    return FileResponse(pdf_path, media_type="application/pdf", filename=f"{case_id}_evidence.pdf")

@app.get("/api/batch")
def get_batch_cases():
    return {
        "total_claims": len(BATCH_CLAIMS),
        "buckets": {
            "FAST_TRACK": sum(1 for c in BATCH_CLAIMS if c["triage"] == "FAST_TRACK"),
            "SURVEYOR_VISIT": sum(1 for c in BATCH_CLAIMS if c["triage"] == "SURVEYOR_VISIT"),
            "REVIEW_FLAG": sum(1 for c in BATCH_CLAIMS if c["triage"] == "REVIEW_FLAG")
        },
        "claims": BATCH_CLAIMS
    }

def time_now():
    from datetime import datetime
    return datetime.utcnow().isoformat() + "Z"
