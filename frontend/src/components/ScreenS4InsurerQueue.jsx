import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, MapPin, AlertTriangle, Layers, Navigation } from 'lucide-react';
import { TriageStamp } from './DesignPrimitives';

export function ScreenS4InsurerQueue({ onSelectCase, onNavigateToMap }) {
  const [data, setData] = useState({ total_claims: 0, buckets: {}, claims: [] });
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/batch')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = filter === 'ALL' 
    ? data.claims 
    : data.claims.filter(c => c.triage === filter);

  const handleExportCSV = () => {
    const headers = "Case ID,Location,Crop,Peril,Event Date,Damage %,Confidence,Verdict,Latitude,Longitude\n";
    const rows = data.claims.map(c => `${c.case_id},"${c.district}",${c.crop},${c.peril},${c.event_date},${c.damage_pct},${c.confidence},${c.triage},${c.lat},${c.lon}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "agrotrace_triage_batch.csv";
    a.click();
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F4F1E8] p-4 md:p-6 space-y-4 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D8D3C3] pb-3">
        <div>
          <h1 className="font-editorial text-2xl font-medium text-[#14231C]">Insurer Triage & Surveyor Queue</h1>
          <p className="text-xs text-[#5E6A63] font-mono-ledger">
            PMFBY Claims &bull; Prioritized Surveyor Dispatch & Direct Fast-Track Payouts
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-[#B9B29E] bg-[#FBFAF6] hover:bg-[#ECE8DB] text-[#14231C] text-xs font-semibold"
        >
          <Download size={14} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Persistent Surveyor Instruction Notice */}
      <div className="p-2.5 rounded-[4px] bg-[#DDEAF2] border border-[#2F6B8F] text-xs text-[#2F6B8F] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={15} />
          <span className="font-medium">
            Surveyor Dispatch Ledger: Click "View on Map" on any claim to fly directly to farm coordinates on satellite view.
          </span>
        </div>
        <span className="font-mono-ledger text-[11px] bg-[#FBFAF6] px-2 py-0.5 rounded text-[#2F6B8F]">
          Active Protocol
        </span>
      </div>

      {/* Filter Tabs / Buckets */}
      <div className="flex items-center gap-2 border-b border-[#D8D3C3] pb-2 text-xs">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-[4px] font-semibold font-mono-ledger ${filter === 'ALL' ? 'bg-[#1F5C45] text-[#F7F5EE]' : 'bg-[#FBFAF6] text-[#4F5C54] border border-[#D8D3C3]'}`}
        >
          All Claims ({data.total_claims})
        </button>
        <button
          onClick={() => setFilter('FAST_TRACK')}
          className={`px-3 py-1.5 rounded-[4px] font-semibold font-mono-ledger flex items-center gap-1.5 ${filter === 'FAST_TRACK' ? 'bg-[#1F6B45] text-[#F7F5EE]' : 'bg-[#E1EFE6] text-[#1F6B45] border border-[#1F6B45]'}`}
        >
          <CheckCircle2 size={13} />
          Fast Track ({data.buckets?.FAST_TRACK || 0})
        </button>
        <button
          onClick={() => setFilter('SURVEYOR_VISIT')}
          className={`px-3 py-1.5 rounded-[4px] font-semibold font-mono-ledger flex items-center gap-1.5 ${filter === 'SURVEYOR_VISIT' ? 'bg-[#8A5A00] text-[#F7F5EE]' : 'bg-[#F8ECCB] text-[#8A5A00] border border-[#8A5A00]'}`}
        >
          <MapPin size={13} />
          Surveyor Visit ({data.buckets?.SURVEYOR_VISIT || 0})
        </button>
        <button
          onClick={() => setFilter('REVIEW_FLAG')}
          className={`px-3 py-1.5 rounded-[4px] font-semibold font-mono-ledger flex items-center gap-1.5 ${filter === 'REVIEW_FLAG' ? 'bg-[#9C3A2E] text-[#F7F5EE]' : 'bg-[#F6DDD8] text-[#9C3A2E] border border-[#9C3A2E]'}`}
        >
          <AlertTriangle size={13} />
          Review Flag ({data.buckets?.REVIEW_FLAG || 0})
        </button>
      </div>

      {/* Table with View on Map action */}
      <div className="bg-[#FBFAF6] rounded-[4px] border border-[#D8D3C3] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#ECE8DB] text-[#5E6A63] uppercase tracking-wider font-semibold font-mono-ledger border-b border-[#D8D3C3]">
            <tr>
              <th className="p-3">Case ID</th>
              <th className="p-3">Village, District & State</th>
              <th className="p-3">Crop / Peril</th>
              <th className="p-3">Event Date</th>
              <th className="p-3 text-right">Damage %</th>
              <th className="p-3 text-right">Confidence</th>
              <th className="p-3 text-center">Triage Stamp</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D8D3C3]">
            {filtered.map(claim => (
              <tr key={claim.case_id} className="hover:bg-[#F4F1E8] transition-colors">
                <td className="p-3 font-mono-ledger font-medium text-[#14231C]">
                  {claim.case_id}
                </td>
                <td className="p-3 text-[#14231C]">
                  <span className="font-semibold block">{claim.district}</span>
                  <span className="text-[10px] text-[#5E6A63] font-mono-ledger">
                    {claim.area_ha} ha &bull; [{claim.lat?.toFixed(4)}, {claim.lon?.toFixed(4)}]
                  </span>
                </td>
                <td className="p-3 text-[#14231C]">
                  <span className="font-medium">{claim.crop}</span>
                  <span className="block text-[10px] uppercase font-mono-ledger text-[#5E6A63]">{claim.peril}</span>
                </td>
                <td className="p-3 font-mono-ledger text-[#4F5C54]">
                  {claim.event_date}
                </td>
                <td className="p-3 text-right font-semibold text-[#14231C]">
                  {claim.damage_pct} %
                  <span className="block text-[10px] font-mono-ledger text-[#5E6A63]">
                    [{claim.damage_ci?.[0]}-{claim.damage_ci?.[1]}]
                  </span>
                </td>
                <td className="p-3 text-right font-mono-ledger text-[#14231C]">
                  {claim.confidence}
                </td>
                <td className="p-3 text-center">
                  <TriageStamp verdict={claim.triage} />
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => onNavigateToMap && onNavigateToMap(claim)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FBFAF6] hover:bg-[#E1EFE6] text-[#1F5C45] border border-[#1F5C45] rounded-[3px] font-mono-ledger text-[11px] font-semibold transition-colors"
                    title="View exact farm polygon and surroundings on satellite map"
                  >
                    <Navigation size={12} />
                    <span>View on Map</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
