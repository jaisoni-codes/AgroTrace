import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';

export function ScreenS1Intake({ onStartVerification, initialPlot, setPlot, onSelectPreset }) {
  const [nlText, setNlText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [crop, setCrop] = useState('soybean');
  const [peril, setPeril] = useState('flood');
  const [eventDate, setEventDate] = useState('2022-08-23');
  const [sowingDate, setSowingDate] = useState('2022-06-20');
  const [declaredArea, setDeclaredArea] = useState('1.45');
  const [searchLocation, setSearchLocation] = useState('Bamori Open Farmlands, Kota, Rajasthan');
  const [activePreset, setActivePreset] = useState(0);

  // Autocomplete suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Fast & reliable geocoding via Open-Meteo Geocoding API
  useEffect(() => {
    if (!searchLocation || searchLocation.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingLocation(true);
      try {
        const query = encodeURIComponent(searchLocation.trim());
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=6&language=en&format=json`);
        const data = await res.json();
        const results = data.results || [];
        setSuggestions(results);
        if (results.length > 0) {
          setShowDropdown(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setSearchingLocation(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchLocation]);

  const handleSelectLocation = (place) => {
    const lat = place.latitude;
    const lon = place.longitude;
    const placeName = `${place.name}, ${place.admin1 || place.country || ''}`;
    setSearchLocation(placeName);
    setShowDropdown(false);
    setActivePreset(null);

    // Tight 1.2 ha parcel (0.0006 deg)
    const dLat = 0.0006;
    const dLon = 0.0006;
    const coords = [
      [lon - dLon, lat - dLat],
      [lon + dLon, lat - dLat],
      [lon + dLon, lat + dLat],
      [lon - dLon, lat + dLat],
      [lon - dLon, lat - dLat]
    ];
    setPlot({
      type: 'Polygon',
      coordinates: [coords]
    });

    if (onSelectPreset) {
      onSelectPreset([lat, lon]);
    }
  };

  const dLat = 0.0006;
  const dLon = 0.0006;

  // Pure open agricultural cropland coordinates (strictly 800m outside residential settlement clusters)
  const BENCHMARKS = [
    {
      code: '01',
      title: 'Kota Hadoti Deluge',
      sub: 'Flood · 23 Aug 2022',
      badge: 'FLOOD',
      location: 'Bamori Open Farmlands, Kota, Rajasthan',
      crop: 'soybean',
      peril: 'flood',
      eventDate: '2022-08-23',
      sowingDate: '2022-06-20',
      area: '1.45',
      center: [25.1870, 76.1985], // Deep green agricultural fields east of settlement
      coords: [
        [76.1985 - dLon, 25.1870 - dLat],
        [76.1985 + dLon, 25.1870 - dLat],
        [76.1985 + dLon, 25.1870 + dLat],
        [76.1985 - dLon, 25.1870 + dLat],
        [76.1985 - dLon, 25.1870 - dLat]
      ]
    },
    {
      code: '02',
      title: 'Ujjain Hail Outbreak',
      sub: 'Hail (W99) · 02 Mar 2024',
      badge: 'HAIL',
      location: 'Ujjain Rural Cropland, Madhya Pradesh',
      crop: 'wheat',
      peril: 'hail',
      eventDate: '2024-03-02',
      sowingDate: '2023-11-15',
      area: '2.10',
      center: [23.1650, 75.7950], // Clear open fields southeast of Ujjain
      coords: [
        [75.7950 - dLon, 23.1650 - dLat],
        [75.7950 + dLon, 23.1650 - dLat],
        [75.7950 + dLon, 23.1650 + dLat],
        [75.7950 - dLon, 23.1650 + dLat],
        [75.7950 - dLon, 23.1650 - dLat]
      ]
    },
    {
      code: '03',
      title: 'Bathinda Calm Baseline',
      sub: 'No Event · Control Plot',
      badge: 'CONTROL',
      location: 'Bathinda Agricultural Basin, Punjab',
      crop: 'wheat',
      peril: 'flood',
      eventDate: '2024-02-10',
      sowingDate: '2023-11-10',
      area: '1.80',
      center: [30.2250, 74.9550], // Wide open green agricultural parcels in Punjab
      coords: [
        [74.9550 - dLon, 30.2250 - dLat],
        [74.9550 + dLon, 30.2250 - dLat],
        [74.9550 + dLon, 30.2250 + dLat],
        [74.9550 - dLon, 30.2250 + dLat],
        [74.9550 - dLon, 30.2250 - dLat]
      ]
    }
  ];

  const handleApplyBenchmark = (index) => {
    const b = BENCHMARKS[index];
    setActivePreset(index);
    setCrop(b.crop);
    setPeril(b.peril);
    setEventDate(b.eventDate);
    setSowingDate(b.sowingDate);
    setDeclaredArea(b.area);
    setSearchLocation(b.location);

    setPlot({
      type: 'Polygon',
      coordinates: [b.coords]
    });
    if (onSelectPreset) {
      onSelectPreset(b.center, index);
    }
  };

  const handleParseNl = async () => {
    if (!nlText.trim()) return;
    setParsing(true);
    try {
      const res = await fetch('/api/intake/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: nlText, language: 'hi' })
      });
      const data = await res.json();
      if (data.crop) setCrop(data.crop);
      if (data.peril) setPeril(data.peril);
      if (data.rough_area_ha) setDeclaredArea(String(data.rough_area_ha));
    } catch (err) {
      console.error(err);
    } finally {
      setParsing(false);
    }
  };

  const handleStart = () => {
    const caseData = {
      crop,
      peril,
      event_date: eventDate,
      sowing_date: sowingDate,
      insured_area_ha: parseFloat(declaredArea) || 1.2,
      district: searchLocation,
      geometry: initialPlot || {
        type: 'Polygon',
        coordinates: [BENCHMARKS[0].coords]
      }
    };
    onStartVerification(caseData);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 bg-[#FBFAF6]">
      <div className="border-b border-[#D8D3C3] pb-3">
        <h2 className="font-editorial text-2xl font-medium tracking-tight text-[#14231C]">
          Claim Intake Ledger
        </h2>
        <p className="text-[12px] text-[#5E6A63] mt-0.5 font-mono-ledger">
          PMFBY &bull; 72-Hour Verification Protocol
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono-ledger text-[#5E6A63] uppercase tracking-wider">
          <span>Documented Benchmarks</span>
          <span>Click to Load</span>
        </div>
        <div className="border border-[#D8D3C3] rounded-[4px] divide-y divide-[#D8D3C3] bg-[#FBFAF6] overflow-hidden">
          {BENCHMARKS.map((item, idx) => {
            const isSelected = activePreset === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyBenchmark(idx)}
                className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                  isSelected ? 'bg-[#ECE8DB]' : 'hover:bg-[#F4F1E8]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono-ledger text-[11px] text-[#5E6A63]">{item.code}</span>
                  <div>
                    <div className="text-[13px] font-medium text-[#14231C] leading-snug">{item.title}</div>
                    <div className="text-[11px] font-mono-ledger text-[#5E6A63]">{item.sub}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-mono-ledger px-1.5 py-0.5 rounded-[2px] uppercase ${
                  item.badge === 'CONTROL' 
                    ? 'bg-[#DDEAF2] text-[#2F6B8F]' 
                    : 'bg-[#F3DFCF] text-[#A44E17]'
                }`}>
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] font-mono-ledger text-[#5E6A63] uppercase tracking-wider">
          <span>Farmer Statement</span>
          <span className="text-[10px] lowercase text-[#4F5C54]">hi / en / hinglish</span>
        </div>
        <textarea
          value={nlText}
          onChange={(e) => setNlText(e.target.value)}
          placeholder="e.g. kal raat baadh aayi mera 2 acre dhan doob gaya..."
          rows={2}
          className="w-full text-xs p-2.5 rounded-[4px] border border-[#B9B29E] bg-[#FBFAF6] text-[#14231C] focus:outline-none focus:ring-1 focus:ring-[#1F5C45] leading-relaxed resize-none"
        />
        {nlText.trim() && (
          <div className="flex justify-end">
            <button
              onClick={handleParseNl}
              disabled={parsing}
              className="px-2.5 py-1 bg-[#1F5C45] text-[#F7F5EE] text-[11px] font-mono-ledger rounded-[3px] hover:bg-[#184A38] disabled:opacity-50"
            >
              {parsing ? 'Extracting...' : 'Parse to Ledger'}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 pt-1 border-t border-[#D8D3C3]">
        <div className="relative">
          <label className="text-[11px] font-mono-ledger text-[#5E6A63] uppercase tracking-wider block mb-1">
            Plot Location
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              placeholder="Search tehsil, village..."
              className="w-full h-9 px-3 pl-8 text-xs rounded-[4px] border border-[#B9B29E] bg-[#FBFAF6] text-[#14231C] focus:outline-none focus:ring-1 focus:ring-[#1F5C45]"
            />
            {searchingLocation ? (
              <Loader2 size={14} className="absolute left-2.5 top-2.5 text-[#1F5C45] animate-spin" />
            ) : (
              <Search size={14} className="absolute left-2.5 top-2.5 text-[#5E6A63]" />
            )}
          </div>

          {showDropdown && suggestions.length > 0 && (
            <div 
              ref={dropdownRef}
              className="absolute left-0 right-0 mt-1 bg-[#FBFAF6] border border-[#B9B29E] rounded-[4px] shadow-md max-h-48 overflow-y-auto z-50 divide-y divide-[#D8D3C3]"
            >
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectLocation(item)}
                  className="p-2 hover:bg-[#ECE8DB] cursor-pointer text-xs transition-colors"
                >
                  <span className="font-medium text-[#14231C] block">{item.name}</span>
                  <span className="text-[10px] text-[#5E6A63] font-mono-ledger">
                    {[item.admin1, item.country].filter(Boolean).join(', ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-[11px] font-mono-ledger text-[#5E6A63] uppercase tracking-wider block mb-1">
              Crop
            </label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full h-9 px-2 text-xs rounded-[4px] border border-[#B9B29E] bg-[#FBFAF6] text-[#14231C] focus:outline-none focus:ring-1 focus:ring-[#1F5C45]"
            >
              <option value="soybean">Soybean (सोयाबीन)</option>
              <option value="wheat">Wheat (गेहूं)</option>
              <option value="paddy">Paddy / Rice (धान)</option>
              <option value="cotton">Cotton (कपास)</option>
              <option value="mustard">Mustard (सरसों)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono-ledger text-[#5E6A63] uppercase tracking-wider block mb-1">
              Peril
            </label>
            <div className="grid grid-cols-2 gap-1 h-9">
              <button
                type="button"
                onClick={() => setPeril('flood')}
                className={`text-xs font-mono-ledger font-semibold rounded-[3px] border ${
                  peril === 'flood'
                    ? 'bg-[#1F5C45] text-[#F7F5EE] border-[#1F5C45]'
                    : 'bg-[#FBFAF6] border-[#B9B29E] text-[#4F5C54]'
                }`}
              >
                Flood
              </button>
              <button
                type="button"
                onClick={() => setPeril('hail')}
                className={`text-xs font-mono-ledger font-semibold rounded-[3px] border ${
                  peril === 'hail'
                    ? 'bg-[#1F5C45] text-[#F7F5EE] border-[#1F5C45]'
                    : 'bg-[#FBFAF6] border-[#B9B29E] text-[#4F5C54]'
                }`}
              >
                Hail
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-[11px] font-mono-ledger text-[#5E6A63] uppercase tracking-wider block mb-1">
              Calamity Date
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full h-9 px-2 text-xs font-mono-ledger rounded-[4px] border border-[#B9B29E] bg-[#FBFAF6] text-[#14231C] focus:outline-none focus:ring-1 focus:ring-[#1F5C45]"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono-ledger text-[#5E6A63] uppercase tracking-wider block mb-1">
              Sowing Date
            </label>
            <input
              type="date"
              value={sowingDate}
              onChange={(e) => setSowingDate(e.target.value)}
              className="w-full h-9 px-2 text-xs font-mono-ledger rounded-[4px] border border-[#B9B29E] bg-[#FBFAF6] text-[#14231C] focus:outline-none focus:ring-1 focus:ring-[#1F5C45]"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-mono-ledger text-[#5E6A63] uppercase tracking-wider block mb-1">
            Declared Policy Area (ha)
          </label>
          <input
            type="number"
            step="0.05"
            value={declaredArea}
            onChange={(e) => setDeclaredArea(e.target.value)}
            className="w-full h-9 px-3 text-xs font-mono-ledger rounded-[4px] border border-[#B9B29E] bg-[#FBFAF6] text-[#14231C] focus:outline-none focus:ring-1 focus:ring-[#1F5C45]"
          />
        </div>
      </div>

      <div className="pt-2 mt-auto">
        <button
          onClick={handleStart}
          className="w-full h-10 bg-[#1F5C45] hover:bg-[#184A38] text-[#F7F5EE] font-medium text-xs tracking-wider uppercase rounded-[4px] transition-colors flex items-center justify-center gap-2"
        >
          <span>Run Verification &bull; S2 / S1</span>
        </button>
      </div>
    </div>
  );
}
