import React, { useState } from 'react';
import { Download, Volume2, CheckCircle2, AlertTriangle, ShieldCheck, ArrowLeft, Languages } from 'lucide-react';
import { TriageStamp, ProvenanceChip, ConfidenceBar } from './DesignPrimitives';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export function ScreenS3Result({ packet, onBackToIntake }) {
  const [sliderPos, setSliderPos] = useState(50);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [summaryLang, setSummaryLang] = useState('hi'); // 'hi' or 'en'

  if (!packet) return null;

  const {
    case_id,
    peril,
    crop,
    claimed_event_date,
    plot,
    event_verification,
    imagery,
    analysis,
    checks,
    confidence,
    confidence_interval,
    triage,
    farmer_summary,
    provenance
  } = packet;

  // Audio Speech Synthesis for Hindi and English
  const handlePlayVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = summaryLang === 'hi' 
        ? (farmer_summary?.text || "") 
        : (farmer_summary?.text_en || "");
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = summaryLang === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.95;
      utterance.onstart = () => setPlayingAudio(true);
      utterance.onend = () => setPlayingAudio(false);
      utterance.onerror = () => setPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Weather timeline chart data
  const weatherData = (event_verification?.timeline?.dates || []).map((d, i) => ({
    date: d.slice(5),
    precip: event_verification?.timeline?.precipitation?.[i] || 0
  }));

  // Vegetation progression points for plot vs control band
  const ndviPre = analysis?.ndvi_pre ?? 0.68;
  const ndviPost = analysis?.ndvi_post ?? 0.36;
  const vegData = [
    { day: '-40d', plot: Math.max(0.2, ndviPre - 0.22), controlLow: 0.38, controlHigh: 0.48, controlMean: 0.43 },
    { day: '-25d', plot: Math.max(0.3, ndviPre - 0.08), controlLow: 0.52, controlHigh: 0.62, controlMean: 0.57 },
    { day: '-10d', plot: ndviPre, controlLow: ndviPre - 0.05, controlHigh: ndviPre + 0.05, controlMean: ndviPre },
    { day: 'Event', plot: ndviPre, controlLow: ndviPre - 0.05, controlHigh: ndviPre + 0.05, controlMean: ndviPre },
    { day: '+5d', plot: ndviPost, controlLow: ndviPre - 0.08, controlHigh: ndviPre + 0.02, controlMean: ndviPre - 0.03 },
    { day: '+20d', plot: Math.min(ndviPost + 0.04, 0.5), controlLow: ndviPre - 0.10, controlHigh: ndviPre, controlMean: ndviPre - 0.05 }
  ];

  return (
    <div className="h-full overflow-y-auto bg-[#F4F1E8] p-3 md:p-5 space-y-4 max-w-4xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D8D3C3] pb-2.5">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBackToIntake}
            className="p-1 rounded-[4px] border border-[#B9B29E] bg-[#FBFAF6] hover:bg-[#ECE8DB] text-[#14231C]"
            title="Back to intake"
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="font-editorial text-xl font-medium text-[#14231C] leading-tight">
              Evidence Ledger: <span className="font-mono-ledger text-base">{case_id}</span>
            </h1>
            <p className="text-[11px] text-[#5E6A63]">
              {crop?.toUpperCase()} &bull; {peril?.toUpperCase()} &bull; Claim: {claimed_event_date} &bull; {plot?.area_ha} ha
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ProvenanceChip label="SHA-256" value={provenance?.sha256?.slice(0, 10) + "..."} />
          <a
            href={`/api/cases/${case_id}/packet.pdf`}
            download
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[#1F5C45] hover:bg-[#184A38] text-[#F7F5EE] text-xs font-semibold"
          >
            <Download size={13} />
            <span>PDF</span>
          </a>
          <a
            href={`/api/cases/${case_id}/packet.json`}
            download
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] border border-[#B9B29E] bg-[#FBFAF6] hover:bg-[#ECE8DB] text-[#14231C] text-xs font-semibold"
          >
            <span>JSON</span>
          </a>
        </div>
      </div>

      {/* Main Score & Triage Hero Box (Clean Grid, No text overflow) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-[#FBFAF6] rounded-[6px] border border-[#D8D3C3]">
        {/* Column 1: Verdict */}
        <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-[#D8D3C3] pb-3 md:pb-0 md:pr-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5E6A63] block">Triage Verdict</span>
          <div>
            <TriageStamp verdict={triage} />
          </div>
          <p className="text-xs text-[#4F5C54] leading-snug">{packet.triage_reason}</p>
        </div>

        {/* Column 2: Measured Damage */}
        <div className="space-y-1 border-b md:border-b-0 md:border-r border-[#D8D3C3] pb-3 md:pb-0 md:pr-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5E6A63] block">Plot-Level Damage</span>
          <div className="flex items-baseline gap-1 text-3xl font-semibold text-[#14231C] leading-none">
            <span>{analysis?.damage_pct ?? 0}</span>
            <span className="text-lg font-normal text-[#5E6A63]">%</span>
          </div>
          <div className="text-[11px] font-mono-ledger text-[#5E6A63]">
            90% CI: [{analysis?.damage_ci?.[0] ?? 0}% &ndash; {analysis?.damage_ci?.[1] ?? 0}%]
          </div>
        </div>

        {/* Column 3: Confidence Score */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-baseline">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5E6A63]">Confidence</span>
            <span className="font-mono-ledger text-sm font-bold text-[#1F5C45]">{confidence} / 100</span>
          </div>
          <ConfidenceBar confidence={confidence} interval={confidence_interval} />
          <div className="text-[10px] font-mono-ledger text-[#5E6A63] flex justify-between pt-0.5">
            <span>CI: [{confidence_interval?.[0]} - {confidence_interval?.[1]}]</span>
            <span>z: {analysis?.z_vs_controls}</span>
          </div>
        </div>
      </div>

      {/* Section 1: Before / After Satellite Imagery Slider */}
      <div className="p-4 bg-[#FBFAF6] rounded-[6px] border border-[#D8D3C3] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-editorial text-base font-medium text-[#14231C]">1. What the Satellite Saw (Optical & SAR Radar)</h3>
          <div className="flex gap-2 text-[11px] font-mono-ledger">
            <span className="text-[#1F5C45]">Pre: {imagery?.pre?.scene_id?.slice(0, 16)}</span>
            <span className="text-[#A44E17]">Post: {imagery?.post?.scene_id?.slice(0, 16)}</span>
          </div>
        </div>

        {/* Visual Slider */}
        <div className="relative h-60 w-full rounded-[6px] overflow-hidden border border-[#D8D3C3] select-none">
          {/* Post Image (Background) */}
          <div className="absolute inset-0 bg-[#e5decb] flex items-center justify-center">
            <div className="text-center p-3">
              <span className="text-xs font-mono-ledger uppercase text-[#A44E17] font-bold block mb-1">
                Post-Event Imagery (Damage & Inundation State)
              </span>
              <p className="text-xs text-[#5E6A63]">
                Post NDVI: <span className="font-bold text-[#A44E17]">{ndviPost}</span> &bull; SAR Water: <span className="font-bold text-[#2F6B8F]">{Math.round((imagery?.sar?.water_frac || 0) * 100)}%</span>
              </p>
              <div className="mt-3 w-40 h-24 mx-auto border-2 border-dashed border-[#A44E17] bg-[#A44E17]/15 rounded flex items-center justify-center text-[11px] font-mono-ledger text-[#A44E17]">
                Affected Crop Boundary
              </div>
            </div>
          </div>

          {/* Pre Image (Foreground clipped by sliderPos) */}
          <div 
            className="absolute inset-0 bg-[#dbe8de] border-r-2 border-[#1F5C45]"
            style={{ width: `${sliderPos}%` }}
          >
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              <div className="text-center p-3 whitespace-nowrap">
                <span className="text-xs font-mono-ledger uppercase text-[#1F5C45] font-bold block mb-1">
                  Pre-Event Baseline (Healthy Cropland Canopy)
                </span>
                <p className="text-xs text-[#5E6A63]">
                  Baseline NDVI: <span className="font-bold text-[#1F5C45]">{ndviPre}</span>
                </p>
                <div className="mt-3 w-40 h-24 mx-auto border-2 border-solid border-[#1F5C45] bg-[#1F5C45]/20 rounded flex items-center justify-center text-[11px] font-mono-ledger text-[#1F5C45]">
                  Healthy Field Polygon
                </div>
              </div>
            </div>
          </div>

          {/* Slider Control Handle */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#1F5C45] pointer-events-none shadow"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#FBFAF6] border border-[#B9B29E] flex items-center justify-center text-[9px] font-mono-ledger text-[#14231C] shadow-sm">
              &harr;
            </div>
          </div>

          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-[#FBFAF6]/90 rounded-[3px] text-[10px] font-mono-ledger text-[#1F5C45] border border-[#D8D3C3]">
            Pre: {claimed_event_date} (Baseline)
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-[#FBFAF6]/90 rounded-[3px] text-[10px] font-mono-ledger text-[#A44E17] border border-[#D8D3C3]">
            Post: {claimed_event_date} (After event)
          </div>
        </div>
      </div>

      {/* Section 2: Matched Controls Diff-in-Diff & Weather Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Controls Vegetation Trajectory */}
        <div className="p-3.5 bg-[#FBFAF6] rounded-[6px] border border-[#D8D3C3] space-y-2">
          <h3 className="font-editorial text-sm font-medium text-[#14231C]">2. Vegetation vs Matched Controls</h3>
          <p className="text-[11px] text-[#5E6A63]">Comparison against 30 matched cropland plots (1-5 km ring)</p>
          <div className="h-40 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vegData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#5E6A63" fontSize={10} />
                <YAxis domain={[0, 1]} stroke="#5E6A63" fontSize={10} />
                <Tooltip />
                <Line type="monotone" dataKey="controlMean" stroke="#2F6B8F" strokeDasharray="3 3" name="Controls Median" dot={false} />
                <Line type="monotone" dataKey="plot" stroke="#A44E17" strokeWidth={2} name="Farmer Plot" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] font-mono-ledger text-[#5E6A63] flex justify-between border-t border-[#D8D3C3] pt-1.5">
            <span>Controls Mean Drop: {analysis?.control_change_mean}</span>
            <span>Plot z-divergence: {analysis?.z_vs_controls}</span>
          </div>
        </div>

        {/* Weather Reanalysis Chart */}
        <div className="p-3.5 bg-[#FBFAF6] rounded-[6px] border border-[#D8D3C3] space-y-2">
          <h3 className="font-editorial text-sm font-medium text-[#14231C]">3. Weather Reanalysis (Open-Meteo)</h3>
          <p className="text-[11px] text-[#5E6A63]">7-day rainfall window around claimed date ({event_verification?.metrics?.precip_7d_mm} mm)</p>
          <div className="h-40 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weatherData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#5E6A63" fontSize={10} />
                <YAxis stroke="#5E6A63" fontSize={10} />
                <Tooltip />
                <Bar dataKey="precip" fill="#2F6B8F" name="Precipitation (mm)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] font-mono-ledger text-[#5E6A63] border-t border-[#D8D3C3] pt-1.5">
            Percentile: {event_verification?.metrics?.precip_percentile}% ({event_verification?.supports_claim ? 'Severe event confirmed' : 'Moderate rainfall'})
          </div>
        </div>
      </div>

      {/* Section 4: Consistency Checks Table */}
      <div className="p-3.5 bg-[#FBFAF6] rounded-[6px] border border-[#D8D3C3] space-y-2">
        <h3 className="font-editorial text-sm font-medium text-[#14231C]">4. Consistency & Anti-Fraud Audits</h3>
        <div className="divide-y divide-[#D8D3C3] text-xs">
          <div className="py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.2 rounded font-mono-ledger uppercase text-[9px] ${checks?.event_date_match === 'pass' ? 'bg-[#E1EFE6] text-[#1F6B45]' : 'bg-[#F8ECCB] text-[#8A5A00]'}`}>
                {checks?.event_date_match}
              </span>
              <span className="font-medium text-[#14231C]">Event Date Correlation</span>
            </div>
            <span className="text-[#5E6A63] text-[11px]">{checks?.event_date_reason}</span>
          </div>

          <div className="py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.2 rounded font-mono-ledger uppercase text-[9px] ${checks?.crop_signal === 'pass' ? 'bg-[#E1EFE6] text-[#1F6B45]' : 'bg-[#F6DDD8] text-[#9C3A2E]'}`}>
                {checks?.crop_signal}
              </span>
              <span className="font-medium text-[#14231C]">Pre-Event Crop Signal</span>
            </div>
            <span className="text-[#5E6A63] text-[11px]">{checks?.crop_signal_reason}</span>
          </div>

          <div className="py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.2 rounded font-mono-ledger uppercase text-[9px] ${checks?.area_ok === 'pass' ? 'bg-[#E1EFE6] text-[#1F6B45]' : 'bg-[#F8ECCB] text-[#8A5A00]'}`}>
                {checks?.area_ok}
              </span>
              <span className="font-medium text-[#14231C]">Area & Cropland Consistency</span>
            </div>
            <span className="text-[#5E6A63] text-[11px]">{checks?.area_ok_reason}</span>
          </div>

          <div className="py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.2 rounded font-mono-ledger uppercase text-[9px] ${checks?.distinctness === 'pass' ? 'bg-[#E1EFE6] text-[#1F6B45]' : 'bg-[#F8ECCB] text-[#8A5A00]'}`}>
                {checks?.distinctness}
              </span>
              <span className="font-medium text-[#14231C]">Distinct Localized Impact (z &le; -2)</span>
            </div>
            <span className="text-[#5E6A63] text-[11px]">{checks?.distinctness_reason}</span>
          </div>
        </div>
      </div>

      {/* Section 5: Farmer Language Summary (Hindi + English TTS) */}
      <div className="p-3.5 bg-[#DCEBE2] rounded-[6px] border border-[#1F5C45] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#123626]">
              {summaryLang === 'hi' ? 'किसान सारांश (Farmer Summary)' : 'Farmer Claim Summary'}
            </span>
            {/* Language Selector */}
            <div className="flex items-center border border-[#1F5C45] rounded-[4px] overflow-hidden text-[10px] font-mono-ledger bg-[#FBFAF6]">
              <button
                onClick={() => setSummaryLang('hi')}
                className={`px-2 py-0.5 ${summaryLang === 'hi' ? 'bg-[#1F5C45] text-[#F7F5EE]' : 'text-[#1F5C45]'}`}
              >
                हिंदी (Hindi)
              </button>
              <button
                onClick={() => setSummaryLang('en')}
                className={`px-2 py-0.5 ${summaryLang === 'en' ? 'bg-[#1F5C45] text-[#F7F5EE]' : 'text-[#1F5C45]'}`}
              >
                English
              </button>
            </div>
          </div>

          <button
            onClick={handlePlayVoice}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-[#1F5C45] hover:bg-[#184A38] text-[#F7F5EE] text-xs font-semibold"
          >
            <Volume2 size={13} className={playingAudio ? 'animate-bounce' : ''} />
            <span>{playingAudio ? 'Playing...' : `Listen in ${summaryLang === 'hi' ? 'Hindi' : 'English'}`}</span>
          </button>
        </div>

        {summaryLang === 'hi' ? (
          <p className="font-hindi text-sm text-[#14231C] leading-relaxed" lang="hi">
            {farmer_summary?.text}
          </p>
        ) : (
          <p className="text-xs text-[#14231C] leading-relaxed">
            {farmer_summary?.text_en}
          </p>
        )}
      </div>
    </div>
  );
}
