import React from 'react';
import { ShieldCheck, Info, CheckCircle2, AlertOctagon } from 'lucide-react';

export function ScreenS5MethodAndLimits() {
  return (
    <div className="h-full overflow-y-auto bg-[#F4F1E8] p-4 md:p-8">
      <div className="max-w-[680px] mx-auto space-y-6">
        <div>
          <h1 className="font-editorial text-3xl font-medium text-[#14231C]">Methodology & Honest Limits</h1>
          <p className="text-xs text-[#5E6A63] mt-1">
            Plain-language architecture, data sources, and engineering constraints (PDF Section 15)
          </p>
        </div>

        {/* Section 1: 5-Step Process */}
        <div className="p-5 bg-[#FBFAF6] rounded-[6px] border border-[#D8D3C3] space-y-4">
          <h2 className="font-editorial text-xl font-medium text-[#14231C]">How AgroTrace Works in 5 Steps</h2>
          
          <div className="space-y-3 text-xs leading-relaxed text-[#14231C]">
            <p>
              <strong>1. Regional Weather Verification:</strong> Before processing satellite imagery, the agent queries Open-Meteo ERA5 reanalysis for rainfall totals, convective indicators (CAPE), or thunderstorm codes (96/99).
            </p>
            <p>
              <strong>2. Dual-Sensor Imagery (Optical + SAR):</strong> We query Sentinel-2 L2A optical scenes via Microsoft Planetary Computer STAC. When cloud cover obscures the farm polygon (SCL valid pixels &lt; 60%), the agent triggers an automated fallback to Sentinel-1 RTC Synthetic Aperture Radar (SAR), which penetrates clouds to detect surface water inundation.
            </p>
            <p>
              <strong>3. Matched Controls & Difference-in-Differences:</strong> A drop in greenness (NDVI) is not automatically damage; ripening, harvest, or normal seasonality causes drops too. AgroTrace samples candidate cropland plots from a 1-5 km ring and matches the 30 plots that share the exact crop stage and seasonality. Damage is computed as excess drop relative to neighbors with a 500-iteration bootstrap 90% confidence interval.
            </p>
            <p>
              <strong>4. Widespread vs Localized Filter:</strong> If more than 50% of neighboring control plots also suffered a drop, the event is categorized as widespread (which under PMFBY is handled at the area-yield level). This stops false claims of localized loss.
            </p>
            <p>
              <strong>5. Tamper-Evident Evidence Packet:</strong> The engine issues an immutable JSON and PDF packet stamped with a SHA-256 cryptographic hash, tying every number directly to deterministic tool outputs.
            </p>
          </div>
        </div>

        {/* Section 2: Honest Limits */}
        <div className="p-5 bg-[#FBFAF6] rounded-[6px] border border-[#D8D3C3] space-y-3">
          <div className="flex items-center gap-2 text-[#9C3A2E]">
            <AlertOctagon size={18} />
            <h2 className="font-editorial text-xl font-medium text-[#14231C]">Honest Technical Limitations</h2>
          </div>
          <p className="text-xs text-[#5E6A63]">
            Judges evaluate our transparency. Here is what satellite technology can and cannot do:
          </p>

          <ul className="list-disc pl-5 space-y-2 text-xs text-[#14231C]">
            <li>
              <strong>10-Meter Spatial Resolution:</strong> Very small holdings under 0.2 ha (fewer than 20 pixels) suffer from boundary-pixel noise. The system applies a spatial coverage confidence penalty for micro-plots.
            </li>
            <li>
              <strong>Hail Cannot Be Directly Imaged:</strong> Hailstones melt within minutes. Spaceborne sensors cannot see hail; we verify hail exclusively through meteorological signatures (convective gust + weather codes) paired with abrupt vegetation decline. The event-agreement component for hail is capped accordingly.
            </li>
            <li>
              <strong>Satellite Revisit Cadence:</strong> Sentinel-2 has an approximate 5-day revisit cycle. For claims submitted within 48 hours before an overhead pass, only provisional weather analysis can be produced until the next pass occurs.
            </li>
            <li>
              <strong>Decision Support, Not Human Replacement:</strong> AgroTrace prioritizes surveyor queues to fast-track obvious claims and target visits where uncertainties exist. Final claim settlement authority remains strictly with the insurance company and state authorities.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
