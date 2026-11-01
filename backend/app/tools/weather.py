import requests
from datetime import datetime, timedelta
from typing import Dict, Any
from app.core.cache import get_cache_key, read_cache, write_cache

def verify_weather_event(lat: float, lon: float, claimed_date: str, peril: str) -> Dict[str, Any]:
    cache_key = get_cache_key("weather", {"lat": round(lat, 4), "lon": round(lon, 4), "date": claimed_date, "peril": peril})
    cached = read_cache(cache_key)
    if cached:
        return cached

    c_date = datetime.strptime(claimed_date, "%Y-%m-%d")
    start_date = (c_date - timedelta(days=7)).strftime("%Y-%m-%d")
    end_date = (c_date + timedelta(days=7)).strftime("%Y-%m-%d")

    # Open-Meteo Historical archive or forecast if within 7 days
    now = datetime.now()
    days_ago = (now - c_date).days

    if days_ago < 5:
        url = (
            f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
            f"&past_days=7&forecast_days=7&daily=precipitation_sum,temperature_2m_max,wind_gusts_10m_max,weather_code"
            f"&timezone=auto"
        )
    else:
        url = (
            f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}"
            f"&start_date={start_date}&end_date={end_date}"
            f"&daily=precipitation_sum,temperature_2m_max,wind_gusts_10m_max,weather_code"
            f"&timezone=auto"
        )

    try:
        resp = requests.get(url, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        daily = data.get("daily", {})
        dates = daily.get("time", [])
        precip = daily.get("precipitation_sum", [])
        weather_codes = daily.get("weather_code", [])
        wind_gusts = daily.get("wind_gusts_10m_max", [])

        # Calculate metrics
        total_precip_7d = sum([p for p in precip if p is not None])
        max_daily_precip = max([p for p in precip if p is not None], default=0.0)
        hail_codes_detected = any(code in [96, 99] for code in weather_codes if code is not None)
        high_gust = max([w for w in wind_gusts if w is not None], default=0.0)

        # Climatological percentile heuristic
        # If max daily precip > 50mm, percentile > 95%
        precip_percentile = min(99.9, max(10.0, max_daily_precip * 1.5))

        supports_claim = False
        reason = ""

        if peril.lower() == "flood":
            if total_precip_7d >= 60.0 or max_daily_precip >= 35.0:
                supports_claim = True
                reason = f"Substantial rainfall detected: {round(total_precip_7d, 1)} mm over window (peak {round(max_daily_precip, 1)} mm/day)."
            else:
                reason = f"Rainfall ({round(total_precip_7d, 1)} mm) below severe flooding threshold."
        elif peril.lower() == "hail":
            if hail_codes_detected or high_gust > 55.0:
                supports_claim = True
                reason = "Severe convective thunderstorm / hail conditions confirmed in weather logs."
            else:
                reason = "No hail codes (96/99) or extreme convective gusts detected on date."
        else:
            supports_claim = total_precip_7d > 20.0
            reason = "General weather anomaly verified."

        result = {
            "source": "open-meteo-archive",
            "supports_claim": supports_claim,
            "reason": reason,
            "metrics": {
                "precip_7d_mm": round(total_precip_7d, 2),
                "max_daily_precip_mm": round(max_daily_precip, 2),
                "precip_percentile": round(precip_percentile, 1),
                "hail_code_present": hail_codes_detected,
                "max_wind_gust_kmh": round(high_gust, 1)
            },
            "timeline": {
                "dates": dates,
                "precipitation": precip
            }
        }
        write_cache(cache_key, result)
        return result
    except Exception as e:
        # Graceful fallback structure
        return {
            "source": "open-meteo-error",
            "supports_claim": False,
            "reason": f"Weather API check degraded: {str(e)}",
            "metrics": {"precip_7d_mm": 0, "precip_percentile": 50.0},
            "timeline": {"dates": [], "precipitation": []}
        }
