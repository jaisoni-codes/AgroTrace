import pytest
from app.tools.weather import verify_weather_event
from app.tools.controls import sample_and_match_controls
from app.tools.consistency import run_consistency_checks
from app.tools.scoring import compute_confidence_and_triage
from app.agent.llm import parse_intake_text

def test_weather_tool_live():
    # Real coordinate and real flood date in Rajasthan
    res = verify_weather_event(25.18, 75.83, "2023-08-14", "flood")
    assert "source" in res
    assert "metrics" in res
    assert "precip_7d_mm" in res["metrics"]

def test_controls_diff_in_diff():
    dummy_geom = {
        "type": "Polygon",
        "coordinates": [[[75.8, 25.1], [75.81, 25.1], [75.81, 25.11], [75.8, 25.11], [75.8, 25.1]]]
    }
    # Pre NDVI 0.70, Post NDVI 0.35 (50% drop)
    res = sample_and_match_controls(dummy_geom, 0.70, 0.35, n_controls=30)
    assert res["n_controls"] == 30
    assert res["damage_pct"] > 35.0
    assert res["z_vs_controls"] < -1.5
    assert len(res["damage_ci"]) == 2

def test_confidence_and_triage():
    score = compute_confidence_and_triage(
        data_quality=0.92,
        z_vs_controls=-3.2,
        event_supports=True,
        crop_signal_pass=True,
        damage_pct=42.5,
        is_widespread=False,
        area_ha=1.5
    )
    assert score["confidence"] >= 75.0
    assert score["triage"] == "FAST_TRACK"

def test_intake_parse():
    parsed = parse_intake_text("kal raat ole gire, mera 2 acre gehun kharab ho gaya")
    assert parsed.peril == "hail"
    assert parsed.crop == "wheat"
    assert parsed.rough_area_ha > 0.7
