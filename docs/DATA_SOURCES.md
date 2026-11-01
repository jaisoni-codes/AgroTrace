# Verified Live Data Sources (AgroTrace)
Created as required by Phase 1 Task & PDF Section 5.

## 1. Optical Imagery (10 m)
- **Primary Source**: Microsoft Planetary Computer STAC
  - **Endpoint**: `https://planetarycomputer.microsoft.com/api/stac/v1`
  - **Collection**: `sentinel-2-l2a`
  - **Auth / Signing**: `planetary-computer` python client (`planetary_computer.sign_inplace` / `sign_url`)
  - **Bands**:
    - `B02` (Blue, 10m)
    - `B04` (Red, 10m)
    - `B08` (NIR, 10m)
    - `SCL` (Scene Classification Layer, 20m resampled nearest)
  - **Reflectance Math**: `(DN + offset) * scale` where baseline >= 04.00 uses offset -1000 and scale 0.0001 (0.0001 = 1/10000). Always dynamically read from item asset `raster:bands` or STAC metadata.
  - **Fallback Source**: Copernicus Data Space STAC (`https://catalogue.dataspace.copernicus.eu/stac`).

## 2. Radar (SAR, Cloud-Proof Flood / Inundation)
- **Primary Source**: Sentinel-1 RTC on Microsoft Planetary Computer
  - **Collection**: `sentinel-1-rtc`
  - **Polarization**: `vv` (primary) and `vh`
  - **Conversion**: Radiometric Terrain Corrected linear power converted to decibels: `10 * log10(power)`.
  - **Fallback Source**: Copernicus Data Space Sentinel-1 GRD.

## 3. Weather Archive & Recent
- **Primary Source**: Open-Meteo Historical Weather API & Forecast API with `past_days`
  - **Archive Endpoint**: `https://archive-api.open-meteo.com/v1/archive`
  - **Forecast Endpoint**: `https://api.open-meteo.com/v1/forecast`
  - **Parameters**: `precipitation_sum`, `temperature_2m_max`, `wind_gusts_10m_max`, `weather_code`, `hourly=cape`
  - **Codes**: 96 & 99 indicate Thunderstorm with Hail.
  - **Fallback Source**: NASA POWER Daily API (`https://power.larc.nasa.gov/api/temporal/daily/point`).

## 4. Cropland Mask
- **Primary Source**: ESA WorldCover 10 m
  - **Collection**: `esa-worldcover` on Planetary Computer
  - **Class**: Class 40 represents Cropland (used to pick matched control plots and verify farmer claim polygon).

## 5. Geocoding and Base Map
- **Provider**: OpenStreetMap Nominatim (`https://nominatim.openstreetmap.org/search`) with customized User-Agent and caching.
- **Tiles**: Carto Positron / OpenStreetMap standard tiles.
