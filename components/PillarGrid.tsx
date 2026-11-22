import React from 'react';
import { PillarScore } from '@/lib/engine/types';

interface Props {
  pillars: { architecture: PillarScore; messaging: PillarScore; proof: PillarScore; velocity: PillarScore };
}

const NAMES: Record<string, string> = {
  architecture: 'Getting visitors to act',
  messaging: 'Clear message',
  proof: 'Proof and trust',
  velocity: 'Speed and weight',
};

export function PillarGrid({ pillars }: Props) {
  const items = (Object.keys(NAMES) as (keyof Props['pillars'])[]).map((k) => ({ key: k, data: pillars[k] }));
  const bar = (s: PillarScore['status']) => (s === 'pass' ? 'bg-good' : s === 'amber' ? 'bg-warn' : 'bg-bad');
  const text = (s: PillarScore['status']) => (s === 'pass' ? 'text-good' : s === 'amber' ? 'text-warn' : 'text-bad');

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map(({ key, data }) => (
        <section key={key} className="rounded-2xl border border-line bg-card p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-[15px] font-semibold">{NAMES[key]}</h3>
            <span className={`text-sm font-semibold tabular-nums ${text(data.status)}`}>
              {data.score} / {data.maxScore}
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-paper">
            <div className={`h-full rounded-full ${bar(data.status)}`} style={{ width: `${data.percentage}%` }} />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">{data.summary}</p>
        </section>
      ))}
    </div>
  );
}
