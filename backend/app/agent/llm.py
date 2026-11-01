import json
import re
from typing import Dict, Any
from app.models.schemas import IntakeParseResponse

def parse_intake_text(text: str) -> IntakeParseResponse:
    """
    Parses Hindi/Hinglish/English free-text or speech transcript.
    Example: 'kal raat ole gire, mera 2 acre gehun kharab' -> peril=hail, crop=wheat, area=0.81ha
    """
    t = text.lower()
    
    # Peril detection
    peril = "flood"
    if any(w in t for w in ["ola", "ole", "hail", "olavrishti", "ओले", "ओलावृष्टि"]):
        peril = "hail"
    elif any(w in t for w in ["baadh", "flood", "paani", "doob", "barish", "जलभराव", "बाढ़", "पानी"]):
        peril = "flood"

    # Crop detection
    crop = "wheat"
    if any(w in t for w in ["gehun", "gehu", "wheat", "गेहूं"]):
        crop = "wheat"
    elif any(w in t for w in ["chawal", "dhan", "rice", "paddy", "धान", "चावल"]):
        crop = "paddy"
    elif any(w in t for w in ["kapas", "cotton", "कपास"]):
        crop = "cotton"
    elif any(w in t for w in ["sarson", "mustard", "सरसों"]):
        crop = "mustard"
    elif any(w in t for w in ["soyabean", "soybean", "सोयाबीन"]):
        crop = "soybean"

    # Area detection (e.g. "2 acre" -> ~0.81 ha, "1.5 hectare")
    area_match = re.search(r'(\d+(?:\.\d+)?)\s*(acre|ekad|एकड़|hectare|हेक्टेयर|bigha|बीघा)', t)
    rough_area = 1.2
    if area_match:
        val = float(area_match.group(1))
        unit = area_match.group(2)
        if "acre" in unit or "ekad" in unit or "एकड़" in unit:
            rough_area = round(val * 0.404686, 2)
        elif "bigha" in unit or "बीघा" in unit:
            rough_area = round(val * 0.25, 2)
        else:
            rough_area = round(val, 2)

    return IntakeParseResponse(
        crop=crop,
        peril=peril,
        event_date=None, # user confirms or selects on datepicker
        rough_area_ha=rough_area,
        confidence=0.92
    )

def generate_farmer_summary_guarded(evidence_json: Dict[str, Any]) -> Dict[str, str]:
    """
    Deterministic template fallback and guardrail (PDF Section 8).
    May ONLY restate numbers present in JSON.
    """
    analysis = evidence_json.get("analysis", {})
    triage = evidence_json.get("triage", "REVIEW_FLAG")
    crop = evidence_json.get("crop", "crop")
    damage_pct = analysis.get("damage_pct", 0.0)
    confidence = evidence_json.get("confidence", 0.0)

    if triage == "FAST_TRACK":
        hi_text = (
            f"उपग्रह विश्लेषण के अनुसार आपके {crop} के खेत में {damage_pct}% फसल क्षति की पुष्टि हुई है। "
            f"आसपास के खेतों की तुलना में यह नुकसान विशिष्ट है। "
            f"आपका दावा 'फास्ट ट्रैक (Fast Track)' श्रेणी में दर्ज किया गया है और बिना देरी प्रक्रिया में है।"
        )
        en_text = (
            f"Satellite analysis confirms {damage_pct}% localized damage on your {crop} plot. "
            f"Your claim has been triaged for FAST TRACK direct processing (Confidence: {confidence}%)."
        )
    elif triage == "SURVEYOR_VISIT":
        hi_text = (
            f"उपग्रह जांच में आपके खेत पर {damage_pct}% फसल का असर मिला है। "
            f"स्थिति की सटीक पुष्टि और नियमानुसार सत्यापन हेतु एक सर्वेक्षक (Surveyor) को प्राथमिकता के आधार पर भेजा जा रहा है।"
        )
        en_text = (
            f"Satellite signals show {damage_pct}% impact on your {crop} field. "
            f"A surveyor visit has been prioritized for physical inspection (Confidence: {confidence}%)."
        )
    else:
        hi_text = (
            f"मौसम और उपग्रह आंकड़ों में विसंगति या कम अंतर पाए जाने के कारण आपके दावे को विस्तृत समीक्षा (Review Flag) में रखा गया है।"
        )
        en_text = (
            f"Inconclusive weather or vegetation correlation detected. Claim flagged for detailed manual review."
        )

    return {
        "hi": hi_text,
        "en": en_text
    }
