import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker } from 'react-leaflet';
import { ArrowLeft, ExternalLink, Download, MapPin, Calendar, Layers, ShieldCheck, AlertTriangle } from 'lucide-react';
import { TriageStamp } from './DesignPrimitives';

export function ScreenSurveyorInspectionMap({ claim, onBackToQueue }) {
  const [mapLayer, setMapLayer] = useState('SATELLITE');

  if (!claim) return null;

  const lat = claim.lat || 25.1867;
  const lon = claim.lon || 76.1908;
  const mapCenter = [lat, lon];

  // Exact ~1.2 ha rectangular farm parcel (110m x 110m = ~0.0010 deg)
  const dLat = 0.0006;
  const dLon = 0.0006;
  const polygonLatLngs = claim.geometry?.coordinates?.[0]?.map(pt => [pt[1], pt[0]]) || [
    [lat - dLat, lon - dLon],
    [lat - dLat, lon + dLon],
    [lat + dLat, lon + dLon],
    [lat + dLat, lon - dLon]
  ];

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-[#F4F1E8]">
      {/* Surveyor Field Dossier Sidebar */}
      <div className="w-full md:w-[420px] h-full shrink-0 border-r border-[#D8D3C3] bg-[#FBFAF6] p-4 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          {/* Header & Explicit Back Button */}
          <div className="flex items-center gap-2.5 border-b border-[#D8D3C3] pb-3">
            <button
              onClick={onBackToQueue}
              className="px-2.5 py-1 rounded-[4px] border border-[#B9B29E] bg-[#FBFAF6] hover:bg-[#ECE8DB] text-[#14231C] font-mono-ledger text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Return to Insurer Queue"
            >
              <ArrowLeft size={14} />
              <span>Back to Queue</span>
            </button>
            <div>
              <span className="text-[10px] font-mono-ledger uppercase tracking-wider text-[#1F5C45] font-semibold block">
                Field Inspection
              </span>
              <h2 className="font-editorial text-lg font-medium text-[#14231C] leading-tight">
                Farm Dossier
              </h2>
            </div>
          </div>

          {/* Case Dossier Card */}
          <div className="p-3.5 bg-[#F4F1E8] rounded-[4px] border border-[#D8D3C3] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono-ledger text-xs font-bold text-[#14231C]">{claim.case_id}</span>
              <TriageStamp verdict={claim.triage} />
            </div>

            <div>
              <span className="text-[10px] font-mono-ledger text-[#5E6A63] uppercase block">Village & District</span>
              <span className="text-xs font-semibold text-[#14231C] block">{claim.district}</span>
              <span className="text-[10px] font-mono-ledger text-[#5E6A63]">
                GPS: [{lat.toFixed(5)}, {lon.toFixed(5)}]
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#D8D3C3] text-xs">
              <div>
                <span className="text-[10px] font-mono-ledger text-[#5E6A63] uppercase block">Crop & Peril</span>
                <span className="font-medium text-[#14231C]">{claim.crop} ({claim.peril?.toUpperCase()})</span>
              </div>
              <div>
                <span className="text-[10px] font-mono-ledger text-[#5E6A63] uppercase block">Claim Date</span>
                <span className="font-mono-ledger text-[#14231C]">{claim.event_date}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#D8D3C3] text-xs">
              <div>
                <span className="text-[10px] font-mono-ledger text-[#5E6A63] uppercase block">Measured Damage</span>
                <span className="font-bold text-[#14231C] text-sm">{claim.damage_pct}%</span>
              </div>
              <div>
                <span className="text-[10px] font-mono-ledger text-[#5E6A63] uppercase block">Confidence</span>
                <span className="font-mono-ledger text-[#1F5C45] font-semibold">{claim.confidence} / 100</span>
              </div>
            </div>
          </div>

          {/* Surveyor Action Guidance */}
          <div className="p-3 rounded-[4px] bg-[#ECE8DB] border border-[#D8D3C3] text-xs text-[#4F5C54] space-y-1">
            <span className="font-semibold text-[#14231C] block">On-Ground Action:</span>
            <p className="text-[11px] leading-relaxed">
              {claim.triage === 'SURVEYOR_VISIT'
                ? "Physical inspection prioritized. Locate field parcel via GPS and verify crop root lodging, mud siltation, or flood watermark."
                : claim.triage === 'REVIEW_FLAG'
                ? "Flagged for detailed anomaly check. Verify actual agricultural cultivation vs non-cropland."
                : "Fast-Track claim verified by satellite diff-in-diff. Random sample audit only."}
            </p>
          </div>
        </div>

        {/* Action Buttons: Open in Google Maps Navigation */}
        <div className="space-y-2 pt-3 border-t border-[#D8D3C3]">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-10 bg-[#1F5C45] hover:bg-[#184A38] text-[#F7F5EE] rounded-[4px] font-mono-ledger text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <NavigationIcon size={14} />
            <span>Open GPS Route (Google Maps)</span>
          </a>

          <button
            onClick={onBackToQueue}
            className="w-full h-9 bg-[#FBFAF6] hover:bg-[#ECE8DB] text-[#14231C] border border-[#B9B29E] rounded-[4px] font-mono-ledger text-xs font-medium transition-colors"
          >
            &larr; Return to Insurer Queue
          </button>
        </div>
      </div>

      {/* Edge-to-Edge Dedicated Inspection Satellite Map */}
      <div className="flex-1 h-full relative">
        <MapContainer
          center={mapCenter}
          zoom={17}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          {mapLayer === 'SATELLITE' ? (
            <>
              <TileLayer
                attribution='Tiles &copy; Esri'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                opacity={0.9}
              />
            </>
          ) : (
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}

          {/* Inspected Farm Polygon */}
          <Polygon
            positions={polygonLatLngs}
            pathOptions={{
              color: '#A44E17',
              fillColor: '#A44E17',
              fillOpacity: 0.35,
              weight: 2.5
            }}
          />

          {/* Farm Centroid Marker */}
          <CircleMarker
            center={mapCenter}
            radius={5}
            pathOptions={{
              color: '#F4F1E8',
              fillColor: '#1F5C45',
              fillOpacity: 1,
              weight: 2
            }}
          />
        </MapContainer>

        {/* Map Layer Switcher */}
        <div className="absolute top-4 right-4 z-[400] bg-[#FBFAF6] border border-[#D8D3C3] rounded-[4px] shadow-sm flex items-center p-0.5 text-xs font-mono-ledger">
          <button
            onClick={() => setMapLayer('SATELLITE')}
            className={`px-2.5 py-1 rounded-[3px] font-semibold flex items-center gap-1.5 ${mapLayer === 'SATELLITE' ? 'bg-[#1F5C45] text-[#F7F5EE]' : 'text-[#4F5C54] hover:bg-[#ECE8DB]'}`}
          >
            <Layers size={13} />
            <span>Hybrid Satellite</span>
          </button>
          <button
            onClick={() => setMapLayer('STREET')}
            className={`px-2.5 py-1 rounded-[3px] font-semibold ${mapLayer === 'STREET' ? 'bg-[#1F5C45] text-[#F7F5EE]' : 'text-[#4F5C54] hover:bg-[#ECE8DB]'}`}
          >
            <span>Street Map</span>
          </button>
        </div>

        {/* Plot Info Overlay Tag */}
        <div className="absolute bottom-4 left-4 z-[400] bg-[#FBFAF6]/95 border border-[#D8D3C3] p-2.5 rounded-[4px] text-xs font-mono-ledger shadow-md space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#A44E17] rounded-sm inline-block" />
            <span className="font-bold text-[#14231C]">Target Cropland Parcel (~1.2 ha)</span>
          </div>
          <span className="text-[#5E6A63] text-[11px] block">{claim.district} &bull; GPS [{lat.toFixed(5)}, {lon.toFixed(5)}]</span>
        </div>
      </div>
    </div>
  );
}

function NavigationIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  );
}
