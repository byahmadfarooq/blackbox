'use client';
import React, { useState } from 'react';
import { IncidentItem, IncidentSeverity } from '@/lib/engine/types';

const LABEL: Record<IncidentSeverity, string> = {
  FATAL_STALL: 'Fix first',
  FRICTION_WARN: 'Worth fixing',
  CLEARED: 'Passed',
};
const DOT: Record<IncidentSeverity, string> = {
  FATAL_STALL: 'bg-bad',
  FRICTION_WARN: 'bg-warn',
  CLEARED: 'bg-good',
};
const order: Record<IncidentSeverity, number> = { FATAL_STALL: 0, FRICTION_WARN: 1, CLEARED: 2 };

export function Findings({ incidents }: { incidents: IncidentItem[] }) {
  const [filter, setFilter] = useState<'ALL' | IncidentSeverity>('ALL');
  const [open, setOpen] = useState<string | null>(null);
  const count = (s: IncidentSeverity) => incidents.filter((i) => i.severity === s).length;
  const tabs: { key: 'ALL' | IncidentSeverity; label: string; n: number }[] = [
    { key: 'ALL', label: 'All', n: incidents.length },
    { key: 'FATAL_STALL', label: 'Fix first', n: count('FATAL_STALL') },
    { key: 'FRICTION_WARN', label: 'Worth fixing', n: count('FRICTION_WARN') },
    { key: 'CLEARED', label: 'Passed', n: count('CLEARED') },
  ];
  const shown = incidents
    .filter((i) => filter === 'ALL' || i.severity === filter)
    .sort((a, b) => order[a.severity] - order[b.severity]);

  return (
    <section className="mt-10" aria-labelledby="all-findings">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="all-findings" className="text-xl font-semibold tracking-tight">All checks</h2>
        <div className="no-print flex flex-wrap gap-1.5" role="group" aria-label="Filter checks">
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

      <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
        {shown.length === 0 && <li className="p-8 text-center text-muted">Nothing in this group.</li>}
        {shown.map((inc) => {
          const isOpen = open === inc.id;
          return (
            <li key={inc.id}>
              <button
                onClick={() => setOpen(isOpen ? null : inc.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-paper/60"
              >
                <span aria-hidden className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT[inc.severity]}`} />
                <span className="flex-1">
                  <span className="block text-[15px] font-medium">{inc.headline}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {LABEL[inc.severity]}
                    {inc.confidence === 'unconfirmed' ? ' · Not fully confirmed' : ''}
                  </span>
                </span>
                <span aria-hidden className={`text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {(isOpen) && (
                <div className="space-y-2.5 px-5 pb-5 pl-[2.6rem] text-[15px] leading-relaxed">
                  <p className="text-muted">{inc.plainEnglishImpact}</p>
                  {inc.severity !== 'CLEARED' && (
                    <p><span className="font-semibold">What to do: </span>{inc.actionableFix}</p>
                  )}
                  {inc.confidence === 'unconfirmed' && (
                    <p className="rounded-lg bg-paper px-3 py-2 text-sm text-muted">
                      Blackbox reads the page code, not a live browser. Something built by scripts after the page loads can be missed, so check this one yourself before acting.
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
