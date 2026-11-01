import pystac_client
import planetary_computer
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from app.core.cache import get_cache_key, read_cache, write_cache

STAC_API_URL = "https://planetarycomputer.microsoft.com/api/stac/v1"

def search_stac_scenes(
    bbox: List[float],
    event_date: str,
    days_before: int = 45,
    days_after: int = 30,
    collection: str = "sentinel-2-l2a"
) -> Dict[str, Any]:
    cache_key = get_cache_key("stac_scenes", {
        "bbox": [round(b, 4) for b in bbox],
        "event_date": event_date,
        "collection": collection,
        "before": days_before,
        "after": days_after
    })
    cached = read_cache(cache_key)
    if cached:
        return cached

    e_dt = datetime.strptime(event_date, "%Y-%m-%d")
    start_str = (e_dt - timedelta(days=days_before)).strftime("%Y-%m-%d")
    end_str = (e_dt + timedelta(days=days_after)).strftime("%Y-%m-%d")
    date_range = f"{start_str}/{end_str}"

    try:
        catalog = pystac_client.Client.open(
            STAC_API_URL,
            modifier=planetary_computer.sign_inplace
        )
        search = catalog.search(
            collections=[collection],
            bbox=bbox,
            datetime=date_range,
            max_items=25
        )
        items = list(search.items())
        
        pre_items = []
        post_items = []

        for item in items:
            item_date = item.datetime.strftime("%Y-%m-%d") if item.datetime else item.properties.get("datetime", "")[:10]
            cloud_cover = item.properties.get("eo:cloud_cover", 0.0)
            
            entry = {
                "id": item.id,
                "date": item_date,
                "cloud_cover": round(float(cloud_cover), 2),
                "collection": collection,
                "assets": {k: {"href": v.href} for k, v in item.assets.items() if k in ["B02", "B04", "B08", "SCL", "visual", "vv", "vh"]}
            }
            if item_date < event_date:
                pre_items.append(entry)
            else:
                post_items.append(entry)

        # Sort pre by date descending (closest before event), post by date ascending (closest after)
        pre_items.sort(key=lambda x: x["date"], reverse=True)
        post_items.sort(key=lambda x: x["date"])

        result = {
            "collection": collection,
            "total_found": len(items),
            "pre_scenes": pre_items,
            "post_scenes": post_items,
            "date_range": date_range
        }
        write_cache(cache_key, result)
        return result
    except Exception as e:
        return {
            "collection": collection,
            "total_found": 0,
            "pre_scenes": [],
            "post_scenes": [],
            "error": str(e)
        }
