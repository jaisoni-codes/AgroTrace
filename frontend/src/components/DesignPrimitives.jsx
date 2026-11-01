import React from 'react';
import { Copy, Check, CheckCircle2, MapPin, AlertTriangle } from 'lucide-react';

export function TriageStamp({ verdict }) {
  const v = verdict || 'REVIEW_FLAG';
  
  if (v === 'FAST_TRACK') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] border border-[#1F6B45] bg-[#E1EFE6] text-[#1F6B45] text-xs font-semibold tracking-wider uppercase">
        <CheckCircle2 size={15} />
        <span>FAST TRACK</span>
      </div>
    );
  }
  if (v === 'SURVEYOR_VISIT') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] border border-[#8A5A00] bg-[#F8ECCB] text-[#8A5A00] text-xs font-semibold tracking-wider uppercase">
        <MapPin size={15} />
        <span>SURVEYOR VISIT</span>
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] border border-[#9C3A2E] bg-[#F6DDD8] text-[#9C3A2E] text-xs font-semibold tracking-wider uppercase">
      <AlertTriangle size={15} />
      <span>REVIEW FLAG</span>
    </div>
  );
}

export function ProvenanceChip({ label, value, copyable = true }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className="inline-flex items-center gap-1 bg-[#ECE8DB] text-[#4F5C54] font-mono-ledger text-xs px-2 py-0.5 rounded-[3px] border border-[#D8D3C3]">
      {label && <span className="text-[#5E6A63]">{label}:</span>}
      <span className="truncate max-w-[140px]" title={value}>{value}</span>
      {copyable && (
        <button onClick={handleCopy} className="hover:text-[#14231C] ml-0.5" title="Copy">
          {copied ? <Check size={12} className="text-[#1F5C45]" /> : <Copy size={12} />}
        </button>
      )}
    </span>
  );
}

export function ConfidenceBar({ confidence = 0, interval = [0, 100] }) {
  const score = Math.max(0, Math.min(100, confidence));
  const low = Math.max(0, interval[0] || score - 5);
  const high = Math.min(100, interval[1] || score + 5);

  return (
    <div className="w-full space-y-1">
      <div className="relative h-2.5 w-full bg-[#ECE8DB] rounded-[3px] overflow-hidden border border-[#D8D3C3]">
        {/* Hatched Uncertainty Band */}
        <div 
          className="absolute top-0 bottom-0 bg-hatched border-x border-[#B9B29E]"
          style={{ left: `${low}%`, width: `${Math.max(1, high - low)}%` }}
        />
        {/* Triage Threshold Ticks (40 and 75) */}
        <div className="absolute top-0 bottom-0 w-[1px] bg-[#5E6A63]" style={{ left: '40%' }} title="Surveyor Threshold (40%)" />
        <div className="absolute top-0 bottom-0 w-[1px] bg-[#5E6A63]" style={{ left: '75%' }} title="Fast Track Threshold (75%)" />
        {/* Current Score Indicator */}
        <div 
          className="absolute top-0 bottom-0 w-1.5 bg-[#1F5C45] rounded-full -ml-[3px]"
          style={{ left: `${score}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-mono-ledger text-[#5E6A63] leading-none pt-0.5">
        <span>0</span>
        <span className="text-[#8A5A00]">40 (Surv)</span>
        <span className="text-[#1F6B45]">75 (Fast)</span>
        <span>100</span>
      </div>
    </div>
  );
}
