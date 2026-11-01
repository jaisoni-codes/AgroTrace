from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class CaseGeometry(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[List[float]]]

class CaseCreateRequest(BaseModel):
    crop: str = Field(..., description="Crop name, e.g., wheat, rice, cotton")
    peril: str = Field(..., description="flood or hail")
    event_date: str = Field(..., description="YYYY-MM-DD")
    sowing_date: Optional[str] = Field(None, description="YYYY-MM-DD")
    geometry: CaseGeometry
    insured_area_ha: Optional[float] = None
    language: str = "en"

class IntakeParseRequest(BaseModel):
    text: str = Field(..., description="Farmer free text or voice transcript")
    language: Optional[str] = "hi"

class IntakeParseResponse(BaseModel):
    crop: Optional[str] = None
    peril: Optional[str] = None
    event_date: Optional[str] = None
    rough_area_ha: Optional[float] = None
    confidence: float = 1.0

class TraceEvent(BaseModel):
    step: int
    node: str
    message: str
    status: str = "running" # running, completed, fallback, failed
    duration_s: Optional[float] = None
    data: Optional[Dict[str, Any]] = None

class EvidencePacket(BaseModel):
    case_id: str
    peril: str
    claimed_event_date: str
    plot: Dict[str, Any]
    event_verification: Dict[str, Any]
    imagery: Dict[str, Any]
    analysis: Dict[str, Any]
    checks: Dict[str, Any]
    confidence: float
    triage: str # FAST_TRACK, SURVEYOR_VISIT, REVIEW_FLAG
    provenance: Dict[str, Any]
    farmer_summary: Dict[str, str]
