import React, { useEffect, useRef } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export function ScreenS2LiveRun({ events, onCompleteResult }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const latestDone = events.find(e => e.node === "Evidence packet ready" && e.packet);

  return (
    <div className="flex flex-col h-full bg-[#FBFAF6] p-4 space-y-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1F5C45] animate-pulse" />
          <h2 className="font-editorial text-2xl font-medium text-[#14231C]">Live Agent Trace</h2>
        </div>
        <p className="text-xs text-[#5E6A63] mt-0.5">LangGraph state graph stream & deterministic tools</p>
      </div>

      {/* Trace ledger container */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono-ledger text-xs"
      >
        {events.length === 0 && (
          <div className="p-4 text-center text-[#5E6A63] border border-dashed border-[#D8D3C3] rounded-[6px]">
            <Loader2 className="animate-spin mx-auto mb-2 text-[#1F5C45]" size={20} />
            <span>Initializing agent state graph and verifying endpoints...</span>
          </div>
        )}

        {events.map((ev, idx) => {
          const isFallback = ev.status === "fallback";
          return (
            <div
              key={idx}
              className={`p-2.5 rounded-[3px] border transition-all duration-200 ${
                isFallback
                  ? 'bg-[#F3DFCF] border-l-4 border-l-[#A44E17] border-[#D8D3C3] text-[#A44E17]'
                  : 'bg-[#F4F1E8] border-[#D8D3C3] text-[#14231C]'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1 font-medium text-[#4F5C54]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#5E6A63]">#{String(ev.step || idx + 1).padStart(2, '0')}</span>
                  <span className="font-semibold text-[#14231C]">{ev.node}</span>
                  {isFallback && (
                    <span className="px-1.5 py-0.2 bg-[#A44E17] text-[#FBF6EF] text-[9px] uppercase font-bold rounded">
                      FALLBACK TRIGGERED
                    </span>
                  )}
                </div>
                <span>{ev.duration_s ? `${ev.duration_s} s` : ''}</span>
              </div>
              <p className="text-xs leading-relaxed text-[#14231C]">{ev.message}</p>
            </div>
          );
        })}
      </div>

      {latestDone && (
        <button
          onClick={() => onCompleteResult(latestDone.packet)}
          className="w-full h-11 bg-[#1F5C45] hover:bg-[#184A38] text-[#F7F5EE] font-semibold text-sm rounded-[6px] shadow-sm flex items-center justify-center gap-2 mt-auto"
        >
          <span>View Verified Evidence Sheet</span>
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}
