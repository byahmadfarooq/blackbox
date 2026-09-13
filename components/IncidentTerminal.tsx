import React, { useState } from 'react';
import { IncidentItem, IncidentSeverity } from '@/lib/engine/types';

interface IncidentTerminalProps {
  incidents: IncidentItem[];
}

export function IncidentTerminal({ incidents }: IncidentTerminalProps) {
  const [filter, setFilter] = useState<'ALL' | IncidentSeverity>('ALL');

  const filteredIncidents = incidents.filter((inc) => {
    if (filter === 'ALL') return true;
    return inc.severity === filter;
  });

  const counts = {
    ALL: incidents.length,
    FATAL_STALL: incidents.filter((i) => i.severity === 'FATAL_STALL').length,
    FRICTION_WARN: incidents.filter((i) => i.severity === 'FRICTION_WARN').length,
    CLEARED: incidents.filter((i) => i.severity === 'CLEARED').length,
  };

  const getSeverityBadge = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'FATAL_STALL':
        return (
          <span className="bg-[#FF4455]/15 text-[#FF4455] border border-[#FF4455]/40 font-mono text-[10px] font-bold px-2 py-0.5 rounded tracking-wide shrink-0">
            [!] FATAL STALL
          </span>
        );
      case 'FRICTION_WARN':
        return (
          <span className="bg-[#FFB700]/15 text-[#FFB700] border border-[#FFB700]/40 font-mono text-[10px] font-bold px-2 py-0.5 rounded tracking-wide shrink-0">
            [~] FRICTION WARN
          </span>
        );
      case 'CLEARED':
        return (
          <span className="bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/40 font-mono text-[10px] font-bold px-2 py-0.5 rounded tracking-wide shrink-0">
            [✓] CLEARED
          </span>
        );
    }
  };

  return (
    <div className="bg-[#09090D] border border-[#1C1C24] rounded-lg overflow-hidden my-6">
      {/* Terminal Header */}
      <div className="bg-[#0F0F16] border-b border-[#1C1C24] px-5 py-3 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2 font-mono text-xs text-[#71717A] tracking-wider uppercase">
          <div className="flex gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#27272A]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27272A]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27272A]" />
          </div>
          <span>INCIDENT TELEMETRY LOG</span>
          <span className="text-[#52525B]">//</span>
          <span className="text-[#FF5500]">CONVERSION BOTTLENECK ANALYSIS</span>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-[#09090D] p-1 rounded border border-[#1C1C22]">
          {(['ALL', 'FATAL_STALL', 'FRICTION_WARN', 'CLEARED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`font-mono text-[10.5px] px-2.5 py-1 rounded transition-colors uppercase tracking-wider ${
                filter === tab
                  ? 'bg-[#1C1C24] text-white font-semibold'
                  : 'text-[#71717A] hover:text-[#D4D4D8]'
              }`}
            >
              {tab === 'ALL'
                ? `ALL (${counts.ALL})`
                : tab === 'FATAL_STALL'
                ? `STALLS (${counts.FATAL_STALL})`
                : tab === 'FRICTION_WARN'
                ? `WARNS (${counts.FRICTION_WARN})`
                : `CLEARED (${counts.CLEARED})`}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Log Items */}
      <div className="divide-y divide-[#16161E]">
        {filteredIncidents.length === 0 ? (
          <div className="p-8 text-center text-sm font-mono text-[#71717A]">
            NO INCIDENTS IN THIS SEVERITY CATEGORY.
          </div>
        ) : (
          filteredIncidents.map((inc) => (
            <div key={inc.id} className="p-5 hover:bg-[#0D0D14] transition-colors">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  {getSeverityBadge(inc.severity)}
                  <span className="font-mono text-[11px] text-[#71717A] uppercase tracking-wider">
                    {inc.pillarName}
                  </span>
                  <span className="text-sm font-bold text-white tracking-tight">
                    {inc.headline}
                  </span>
                  {inc.researchCitation && (
                    <span className="font-mono text-[9.5px] text-[#FF5500]/90 bg-[#FF5500]/10 border border-[#FF5500]/25 px-2 py-0.5 rounded tracking-wider uppercase">
                      {inc.researchCitation}
                    </span>
                  )}
                </div>

                <span
                  className={`font-mono text-xs font-bold shrink-0 ${
                    inc.pointsDelta > 0 ? 'text-[#00FF88]' : 'text-[#FF5500]'
                  }`}
                >
                  {inc.pointsDelta > 0 ? `+${inc.pointsDelta} PTS` : `${inc.pointsDelta} PTS`}
                </span>
              </div>

              {/* Plain-English Breakdown */}
              <div className="ml-1 sm:ml-2 pl-3 border-l-2 border-[#1E1E28] space-y-1.5 mt-3 text-xs leading-relaxed">
                <p className="text-[#C4C4C8]">
                  <span className="font-semibold text-white">Why this matters: </span>
                  {inc.plainEnglishImpact}
                </p>
                <p className="text-[#A1A1AA]">
                  <span className="font-semibold text-[#FFB700]">The Fix: </span>
                  {inc.actionableFix}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
