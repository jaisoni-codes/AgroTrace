import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, useMapEvents, useMap } from 'react-leaflet';
import { ScreenS1Intake } from './components/ScreenS1Intake';
import { ScreenS2LiveRun } from './components/ScreenS2LiveRun';
import { ScreenS3Result } from './components/ScreenS3Result';
import { ScreenS4InsurerQueue } from './components/ScreenS4InsurerQueue';
import { ScreenS5MethodAndLimits } from './components/ScreenS5MethodAndLimits';
import { ScreenSurveyorInspectionMap } from './components/ScreenSurveyorInspectionMap';
import { Layers } from 'lucide-react';

function MapPanController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2) {
      map.flyTo(center, 16, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

function MapClickHandler({ onPlotPlaced }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const dLat = 0.0006;
      const dLon = 0.0006;
      const coords = [
        [lng - dLon, lat - dLat],
        [lng + dLon, lat - dLat],
        [lng + dLon, lat + dLat],
        [lng - dLon, lat + dLat],
        [lng - dLon, lat - dLat]
      ];
      onPlotPlaced({
        type: "Polygon",
        coordinates: [coords]
      });
    }
  });
  return null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('VERIFICATION');
  const [stage, setStage] = useState('INTAKE');
  const [mapLayer, setMapLayer] = useState('SATELLITE');
  
  // Exact deep green open farmlands (800m East of Bamori Village)
  const [mapCenter, setMapCenter] = useState([25.1870, 76.1985]);
  const [selectedInspectionClaim, setSelectedInspectionClaim] = useState(null);

  // Pure open agricultural field pins dynamic for each region
  const SUGGESTED_PLOTS_BY_PRESET = {
    // 0: Kota Hadoti Deluge
    0: [
      { id: 'K1', title: 'Soybean Parcel A (Eastern Cropland Basin)', lat: 25.1870, lon: 76.1985 },
      { id: 'K2', title: 'Soybean Parcel B (South-East Farmland)', lat: 25.1830, lon: 76.2020 },
      { id: 'K3', title: 'Soybean Parcel C (North-East Cropland)', lat: 25.1915, lon: 76.1980 }
    ],
    // 1: Ujjain Hail Outbreak
    1: [
      { id: 'U1', title: 'Wheat Parcel A (Ujjain South Cropland)', lat: 23.1650, lon: 75.7950 },
      { id: 'U2', title: 'Wheat Parcel B (Open Agricultural Basin)', lat: 23.1610, lon: 75.7985 },
      { id: 'U3', title: 'Wheat Parcel C (East Farm Ridge)', lat: 23.1685, lon: 75.7920 }
    ],
    // 2: Bathinda Calm Baseline
    2: [
      { id: 'B1', title: 'Wheat Parcel A (Bathinda Green Basin)', lat: 30.2250, lon: 74.9550 },
      { id: 'B2', title: 'Wheat Parcel B (Canal Irrigated Plot)', lat: 30.2215, lon: 74.9590 },
      { id: 'B3', title: 'Wheat Parcel C (North Farmland)', lat: 30.2290, lon: 74.9520 }
    ]
  };

  const [activeBenchmarkIdx, setActiveBenchmarkIdx] = useState(0);
  const SUGGESTED_PLOTS = SUGGESTED_PLOTS_BY_PRESET[activeBenchmarkIdx] || SUGGESTED_PLOTS_BY_PRESET[0];

  const dLat = 0.0006;
  const dLon = 0.0006;
  const [plot, setPlot] = useState({
    type: "Polygon",
    coordinates: [[
      [76.1985 - dLon, 25.1870 - dLat],
      [76.1985 + dLon, 25.1870 - dLat],
      [76.1985 + dLon, 25.1870 + dLat],
      [76.1985 - dLon, 25.1870 + dLat],
      [76.1985 - dLon, 25.1870 - dLat]
    ]]
  });

  const [events, setEvents] = useState([]);
  const [resultPacket, setResultPacket] = useState(null);

  const handleStartVerification = async (caseData) => {
    setEvents([]);
    setResultPacket(null);
    setStage('LIVE_RUN');

    try {
      const resp = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(caseData)
      });
      const data = await resp.json();
      const caseId = data.case_id;

      const eventSource = new EventSource(`/api/cases/${caseId}/stream`);

      eventSource.onmessage = (e) => {
        const ev = JSON.parse(e.data);
        setEvents(prev => [...prev, ev]);
        if (ev.node === "Evidence packet ready" && ev.packet) {
          setResultPacket(ev.packet);
        }
      };

      eventSource.addEventListener('done', () => {
        eventSource.close();
      });

      eventSource.onerror = () => {
        eventSource.close();
      };
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectSuggestedPlot = (p) => {
    setMapCenter([p.lat, p.lon]);
    setPlot({
      type: "Polygon",
      coordinates: [[
        [p.lon - dLon, p.lat - dLat],
        [p.lon + dLon, p.lat - dLat],
        [p.lon + dLon, p.lat + dLat],
        [p.lon - dLon, p.lat + dLat],
        [p.lon - dLon, p.lat - dLat]
      ]]
    });
  };

  const handleOpenSurveyorInspection = (claim) => {
    setSelectedInspectionClaim(claim);
    setActiveTab('SURVEYOR_MAP');
  };

  const polygonLatLngs = plot.coordinates[0].map(pt => [pt[1], pt[0]]);
  const controlPoints = resultPacket?.analysis?.control_points || [];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F4F1E8]">
      {/* 52px Survey Ledger Top Bar */}
      <header className="h-[52px] bg-[#FBFAF6] border-b border-[#D8D3C3] px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1F5C45" strokeWidth="2">
              <polygon points="3 5 20 3 18 19 5 21" />
              <circle cx="5" cy="21" r="2.5" fill="#1F5C45" />
            </svg>
            <span className="font-editorial text-xl font-medium tracking-tight text-[#14231C]">
              KhetSaakshi
            </span>
          </div>

          <nav className="flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('VERIFICATION')}
              className={`px-3 py-1.5 rounded-[4px] transition-colors ${
                activeTab === 'VERIFICATION' 
                  ? 'bg-[#1F5C45] text-[#F7F5EE]' 
                  : 'text-[#4F5C54] hover:bg-[#ECE8DB]'
              }`}
            >
              Verification Ledger
            </button>
            <button
              onClick={() => setActiveTab('QUEUE')}
              className={`px-3 py-1.5 rounded-[4px] transition-colors ${
                activeTab === 'QUEUE' 
                  ? 'bg-[#1F5C45] text-[#F7F5EE]' 
                  : 'text-[#4F5C54] hover:bg-[#ECE8DB]'
              }`}
            >
              Insurer Queue (Batch)
            </button>
            <button
              onClick={() => setActiveTab('METHOD')}
              className={`px-3 py-1.5 rounded-[4px] transition-colors ${
                activeTab === 'METHOD' 
                  ? 'bg-[#1F5C45] text-[#F7F5EE]' 
                  : 'text-[#4F5C54] hover:bg-[#ECE8DB]'
              }`}
            >
              Method & Limits
            </button>
          </nav>
        </div>

        {/* Source Health Strip */}
        <div className="flex items-center gap-3 text-[11px] font-mono-ledger text-[#4F5C54]">
          <div className="flex items-center gap-1.5" title="Sentinel-2 L2A STAC">
            <span className="w-2 h-2 rounded-full bg-[#1F6B45]" />
            <span>S2</span>
          </div>
          <div className="flex items-center gap-1.5" title="Sentinel-1 RTC SAR">
            <span className="w-2 h-2 rounded-full bg-[#1F6B45]" />
            <span>S1</span>
          </div>
          <div className="flex items-center gap-1.5" title="Open-Meteo ERA5 Reanalysis">
            <span className="w-2 h-2 rounded-full bg-[#1F6B45]" />
            <span>Wx</span>
          </div>
          <div className="flex items-center gap-1.5" title="Guarded Deterministic Planner">
            <span className="w-2 h-2 rounded-full bg-[#1F6B45]" />
            <span>LLM</span>
          </div>
        </div>
      </header>

      {/* Main Screen Body */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'QUEUE' && (
          <ScreenS4InsurerQueue onNavigateToMap={handleOpenSurveyorInspection} />
        )}
        
        {activeTab === 'SURVEYOR_MAP' && (
          <ScreenSurveyorInspectionMap
            claim={selectedInspectionClaim}
            onBackToQueue={() => setActiveTab('QUEUE')}
          />
        )}

        {activeTab === 'METHOD' && <ScreenS5MethodAndLimits />}

        {activeTab === 'VERIFICATION' && (
          <div className="flex flex-col md:flex-row h-full w-full">
            {/* Docked Left Panel */}
            <div className="w-full md:w-[420px] h-full shrink-0 border-r border-[#D8D3C3] z-10 bg-[#FBFAF6]">
              {stage === 'INTAKE' && (
                <ScreenS1Intake
                  onStartVerification={handleStartVerification}
                  initialPlot={plot}
                  setPlot={setPlot}
                  onSelectPreset={(newCenter, presetIdx) => {
                    setMapCenter(newCenter);
                    if (typeof presetIdx === 'number') {
                      setActiveBenchmarkIdx(presetIdx);
                    }
                  }}
                />
              )}
              {stage === 'LIVE_RUN' && (
                <ScreenS2LiveRun
                  events={events}
                  onCompleteResult={(packet) => {
                    setResultPacket(packet);
                    setStage('RESULT');
                  }}
                />
              )}
              {stage === 'RESULT' && (
                <ScreenS3Result
                  packet={resultPacket}
                  onBackToIntake={() => setStage('INTAKE')}
                />
              )}
            </div>

            {/* Edge-to-Edge Hero Map */}
            <div className="flex-1 h-full relative">
              <MapContainer
                center={mapCenter}
                zoom={16}
                scrollWheelZoom={true}
                className="w-full h-full"
              >
                <MapPanController center={mapCenter} />

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

                <MapClickHandler onPlotPlaced={setPlot} />

                {/* Open Field Hotspot Pins */}
                {stage === 'INTAKE' && SUGGESTED_PLOTS.map(p => (
                  <CircleMarker
                    key={p.id}
                    center={[p.lat, p.lon]}
                    radius={7}
                    eventHandlers={{
                      click: () => handleSelectSuggestedPlot(p)
                    }}
                    pathOptions={{
                      color: '#F4F1E8',
                      fillColor: '#1F5C45',
                      fillOpacity: 1,
                      weight: 2
                    }}
                  />
                ))}

                {/* Selected Farm Polygon in Clay */}
                <Polygon
                  positions={polygonLatLngs}
                  pathOptions={{
                    color: '#A44E17',
                    fillColor: '#A44E17',
                    fillOpacity: 0.28,
                    weight: 2.5
                  }}
                />

                {/* Matched Controls Dots */}
                {controlPoints.map((cp, idx) => (
                  <CircleMarker
                    key={idx}
                    center={[cp.lat, cp.lon]}
                    radius={5}
                    pathOptions={{
                      color: '#F4F1E8',
                      fillColor: '#1F5C45',
                      fillOpacity: 0.85,
                      weight: 1.5
                    }}
                  />
                ))}
              </MapContainer>

              {/* Map Layer Toggle Button */}
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

              {/* Hotspot Farm Selector Hint Banner */}
              <div className="absolute top-4 left-4 z-[400] bg-[#FBFAF6]/95 border border-[#1F5C45] px-3 py-1.5 rounded-[4px] text-xs font-mono-ledger shadow-md flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1F5C45] animate-ping" />
                <span className="text-[#14231C]">
                  <strong>Green Farm Pins:</strong> Placed in open agricultural cropland. Click to snap plot!
                </span>
              </div>

              {/* Map overlay hint */}
              <div className="absolute bottom-4 right-4 z-[400] bg-[#FBFAF6]/90 backdrop-blur-sm border border-[#D8D3C3] px-3 py-1.5 rounded-[4px] text-xs font-mono-ledger text-[#4F5C54] shadow-sm">
                Click any farm on the map to place ~1.2 ha plot
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
