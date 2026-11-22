'use client';
import React, { useState } from 'react';
import { IncidentItem, IncidentSeverity } from '@/lib/engine/types';

const LABEL: Record<IncidentSeverity, string> = {
  FATAL_STALL: 'Fix first',
  FRICTION_WARN: 'Worth fixing',
  CLEARED: 'Passed',
};
const CHIP: Record<IncidentSeverity, string> = {
  FATAL_STALL: 'bg-bad/10 text-bad',
  FRICTION_WARN: 'bg-warn/10 text-warn',
  CLEARED: 'bg-good/10 text-good',
};

export function Findings({ incidents }: { incidents: IncidentItem[] }) {
  const [filter, setFilter] = useState<'ALL' | IncidentSeverity>('ALL');
  const count = (s: IncidentSeverity) => incidents.filter((i) => i.severity === s).length;
  const tabs: { key: 'ALL' | IncidentSeverity; label: string; n: number }[] = [
    { key: 'ALL', label: 'All', n: incidents.length },
    { key: 'FATAL_STALL', label: 'Fix first', n: count('FATAL_STALL') },
    { key: 'FRICTION_WARN', label: 'Worth fixing', n: count('FRICTION_WARN') },
    { key: 'CLEARED', label: 'Passed', n: count('CLEARED') },
  ];
  const order: Record<IncidentSeverity, number> = { FATAL_STALL: 0, FRICTION_WARN: 1, CLEARED: 2 };
  const shown = incidents
    .filter((i) => filter === 'ALL' || i.severity === filter)
    .sort((a, b) => order[a.severity] - order[b.severity]);

  return (
    <section className="mt-6 rounded-2xl border border-line bg-card" aria-label="Findings">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="text-lg font-semibold">What we found</h2>
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              aria-pressed={filter === t.key}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                filter === t.key ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
              }`}
            >
              {t.label} ({t.n})
            </button>
          ))}
        </div>
      </div>
      <ul className="divide-y divide-line">
        {shown.length === 0 && <li className="p-8 text-center text-muted">Nothing in this group.</li>}
        {shown.map((inc) => (
          <li key={inc.id} className="px-5 py-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CHIP[inc.severity]}`}>
                {LABEL[inc.severity]}
              </span>
              <h3 className="text-[15px] font-semibold">{inc.headline}</h3>
            </div>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{inc.plainEnglishImpact}</p>
            {inc.severity !== 'CLEARED' && (
              <p className="mt-2 text-[15px] leading-relaxed">
                <span className="font-semibold">What to do: </span>
                {inc.actionableFix}
              </p>
            )}
            {inc.researchCitation && (
              <p className="mt-2 text-xs text-muted">Based on: {inc.researchCitation}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
