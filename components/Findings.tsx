'use client';
import React, { useState } from 'react';
import { CheckView, CheckStatus } from '@/lib/engine/types';
import { Reveal } from './Reveal';

const LABEL: Record<CheckStatus, string> = { pass: 'Good', warn: 'Could be better', fail: 'Needs fixing', unknown: 'Not confirmed', na: 'Not relevant' };
const DOT: Record<CheckStatus, string> = { pass: 'bg-good', warn: 'bg-warn', fail: 'bg-bad', unknown: 'bg-muted/50', na: 'bg-line' };

export function PriorityCards({ items }: { items: CheckView[] }) {
  if (!items.length) {
    return <p className="rounded-2xl border border-line bg-card p-6 text-muted">Nothing needs fixing from what we could check. Nice work.</p>;
  }
  return (
    <ol className="space-y-3">
      {items.map((c, i) => (
        <Reveal as="li" key={c.id} delay={i * 80} className="rounded-2xl border border-line bg-card p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h3 className="text-[17px] font-semibold">{c.title}</h3>
                {c.gain > 0 && <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">up to +{c.gain} points</span>}
              </div>
              {c.evidence && <p className="mt-1.5 text-sm text-muted">We found: {c.evidence}</p>}
              <p className="mt-3 leading-relaxed">{c.impact}</p>
              <p className="mt-3 rounded-xl bg-paper p-3.5 text-[15px] leading-relaxed"><span className="font-semibold">Fix: </span>{c.fix}</p>
            </div>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}

export function AllChecks({ checks, names }: { checks: CheckView[]; names: Record<string, string> }) {
  const groups = Object.keys(names).map((k) => ({ k, name: names[k], items: checks.filter((c) => c.pillar === k) })).filter((g) => g.items.length);
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <Reveal key={g.k}>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{g.name}</h3>
          <ul className="divide-y divide-line rounded-2xl border border-line bg-card">
            {g.items.map((c) => {
              const isOpen = open === c.id;
              return (
                <li key={c.id}>
                  <button type="button" onClick={() => setOpen(isOpen ? null : c.id)} aria-expanded={isOpen}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-paper/70">
                    <span aria-hidden className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT[c.status]}`} />
                    <span className="flex-1 text-[15px] font-medium">{c.title}</span>
                    <span className="text-sm text-muted">{LABEL[c.status]}</span>
                    <span aria-hidden className={`text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                  </button>
                  {isOpen && (
                    <div className="space-y-2 px-4 pb-4 pl-9 text-[15px] leading-relaxed">
                      {c.evidence && <p className="text-muted">We found: {c.evidence}</p>}
                      {c.status !== 'pass' && c.status !== 'na' && <p>{c.impact}</p>}
                      {(c.status === 'fail' || c.status === 'warn') && <p><span className="font-semibold">Fix: </span>{c.fix}</p>}
                      {c.status === 'unknown' && <p className="text-muted">We could not confirm this from the page code, so it is left out of the score.</p>}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Reveal>
      ))}
    </div>
  );
}
