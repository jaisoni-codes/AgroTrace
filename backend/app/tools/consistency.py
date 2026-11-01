from typing import Dict, Any

def run_consistency_checks(
    weather_supports: bool,
    plot_ndvi_pre: float,
    declared_area_ha: float,
    calculated_area_ha: float,
    z_vs_controls: float
) -> Dict[str, Any]:
    """
    Consistency & Fraud Checks (Section 7.5):
    - event_date_match: pass/warn/fail
    - crop_signal: pre-event NDVI > 0.3
    - area_ok: drawn area vs declared area within tolerance
    - distinctness: z <= -2.0 distinct localized damage
    """
    # Event date match
    if weather_supports:
        event_match = "pass"
        event_reason = "Weather anomaly confirmed within qualifying window."
    else:
        event_match = "warn"
        event_reason = "Moderate or distant meteorological signature."

    # Crop signal check
    if plot_ndvi_pre >= 0.30:
        crop_signal = "pass"
        crop_reason = f"Healthy pre-event vegetative canopy (NDVI {plot_ndvi_pre} >= 0.30)."
    else:
        crop_signal = "fail"
        crop_reason = f"Pre-event NDVI {plot_ndvi_pre} indicates bare/fallow soil, not active crop."

    # Area check
    area_ok = "pass"
    area_reason = f"Polygon area ({round(calculated_area_ha, 2)} ha) within valid threshold."
    if declared_area_ha and declared_area_ha > 0:
        ratio = calculated_area_ha / declared_area_ha
        if 0.7 <= ratio <= 1.3:
            area_ok = "pass"
            area_reason = f"Drawn area ({round(calculated_area_ha, 2)} ha) closely matches declared policy ({declared_area_ha} ha)."
        else:
            area_ok = "warn"
            area_reason = f"Drawn area ({round(calculated_area_ha, 2)} ha) differs >30% from declared {declared_area_ha} ha."

    # Distinctness
    distinct_ok = "pass" if z_vs_controls <= -2.0 else "warn"
    distinct_reason = f"Z-score {z_vs_controls} indicates significant isolated divergence from neighbors." if distinct_ok == "pass" else f"Z-score {z_vs_controls} shows neighbor variance similar to plot."

    return {
        "event_date_match": event_match,
        "event_date_reason": event_reason,
        "crop_signal": crop_signal,
        "crop_signal_reason": crop_reason,
        "area_ok": area_ok,
        "area_ok_reason": area_reason,
        "distinctness": distinct_ok,
        "distinctness_reason": distinct_reason
    }
