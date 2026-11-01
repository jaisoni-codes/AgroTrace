import math
from typing import Dict, Any

def compute_confidence_and_triage(
    data_quality: float,
    z_vs_controls: float,
    event_supports: bool,
    crop_signal_pass: bool,
    damage_pct: float,
    is_widespread: bool,
    area_ha: float
) -> Dict[str, Any]:
    """
    Confidence score and Triage decision (Section 7.6 & 7.7)
    confidence = 100 * (0.30 data_quality + 0.25 control_separation + 0.20 event_agreement + 0.15 crop_consistency + 0.10 spatial_coverage)
    Triage:
    - FAST_TRACK: event verified AND damage >= 20% AND z <= -2.0 AND confidence >= 75
    - SURVEYOR_VISIT: confidence 40-75 OR damage 10-20% OR optical sparse/SAR-only OR widespread pattern
    - REVIEW_FLAG: event mismatch, crop not evident, damage same as neighbours, confidence < 40
    """
    c_data_quality = min(max(data_quality, 0.0), 1.0)
    c_control_sep = min(abs(z_vs_controls) / 3.0, 1.0) if z_vs_controls < 0 else 0.1
    c_event = 0.95 if event_supports else 0.40
    c_crop = 1.0 if crop_signal_pass else 0.20
    
    # Spatial coverage penalty if < 0.2 ha (20 pixels)
    if area_ha >= 0.5:
        c_spatial = 1.0
    elif area_ha >= 0.2:
        c_spatial = 0.8
    else:
        c_spatial = 0.5

    confidence = 100.0 * (
        0.30 * c_data_quality +
        0.25 * c_control_sep +
        0.20 * c_event +
        0.15 * c_crop +
        0.10 * c_spatial
    )
    confidence = round(confidence, 1)

    # Uncertainty range (hatched band)
    uncertainty_delta = round(max(3.0, (100.0 - confidence) * 0.25), 1)
    confidence_interval = [max(0.0, round(confidence - uncertainty_delta, 1)), min(100.0, round(confidence + uncertainty_delta, 1))]

    # Triage Rule Matrix
    triage = "REVIEW_FLAG"
    triage_reason = ""

    if not crop_signal_pass:
        triage = "REVIEW_FLAG"
        triage_reason = "No active vegetative crop signal identified before claimed event date."
    elif is_widespread:
        triage = "SURVEYOR_VISIT"
        triage_reason = "Widespread damage detected across >50% neighborhood controls. PMFBY area-approach applies."
    elif event_supports and damage_pct >= 20.0 and z_vs_controls <= -2.0 and confidence >= 75.0:
        triage = "FAST_TRACK"
        triage_reason = "Verified localized calamity with high statistical separation and confidence."
    elif (40.0 <= confidence < 75.0) or (10.0 <= damage_pct < 20.0):
        triage = "SURVEYOR_VISIT"
        triage_reason = "Moderate damage or statistical variance requires on-ground surveyor inspection."
    else:
        triage = "REVIEW_FLAG"
        triage_reason = "Discrepancy in weather support, marginal damage, or low confidence."

    return {
        "confidence": confidence,
        "confidence_interval": confidence_interval,
        "components": {
            "data_quality": round(c_data_quality, 2),
            "control_separation": round(c_control_sep, 2),
            "event_agreement": round(c_event, 2),
            "crop_consistency": round(c_crop, 2),
            "spatial_coverage": round(c_spatial, 2)
        },
        "triage": triage,
        "triage_reason": triage_reason
    }
