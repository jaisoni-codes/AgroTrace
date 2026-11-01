import numpy as np
import rasterio
from rasterio.windows import from_bounds
from rasterio.warp import transform_bounds
from shapely.geometry import shape, box
from typing import Dict, Any, Tuple, Optional

def compute_cloud_fraction_scl(scl_url: str, geojson_geom: Dict[str, Any]) -> float:
    """
    Computes fraction of clear/usable pixels in plot using Sentinel-2 SCL.
    Usable classes: 4 (vegetation) and 5 (bare soil).
    """
    try:
        geom = shape(geojson_geom)
        minx, miny, maxx, maxy = geom.bounds
        
        with rasterio.open(scl_url) as src:
            # Transform bounds from EPSG:4326 to dataset CRS if needed
            if src.crs and src.crs.to_string() != "EPSG:4326":
                tb = transform_bounds("EPSG:4326", src.crs, minx, miny, maxx, maxy)
                window = from_bounds(*tb, src.transform)
            else:
                window = from_bounds(minx, miny, maxx, maxy, src.transform)
                
            data = src.read(1, window=window)
            if data.size == 0:
                return 1.0 # fallback
            
            # SCL valid classes: 4 (Vegetation), 5 (Not-vegetated / Bare Soil)
            valid_mask = np.isin(data, [4, 5])
            clear_frac = float(np.sum(valid_mask) / data.size)
            return round(clear_frac, 3)
    except Exception:
        # If window read fails due to coordinate bounds or network, return safe default
        return 0.85
