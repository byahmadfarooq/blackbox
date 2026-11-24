import React from 'react';
import { PillarScore, PillarKey } from '@/lib/engine/types';
import { Reveal } from './Reveal';
import { toneColor } from '@/lib/tone';

const ORDER: PillarKey[] = ['action', 'message', 'proof', 'speed', 'basics'];

export function PillarGrid({ pillars }: { pillars: Record<PillarKey, PillarScore> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {ORDER.map((k, i) => {
        const p = pillars[k];
        const unknown = p.coverage === 0;
        return (
          <Reveal key={k} delay={i * 70} className="rounded-2xl border border-line bg-card p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-[16px] font-semibold">{p.name}</h3>
              <p className="text-sm text-muted tabular-nums">{unknown ? 'Not checked' : `${p.score} / ${p.max}`}</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
              <div className="bar-fill h-full rounded-full" style={{ width: `${unknown ? 0 : p.percentage}%`, background: toneColor(p.percentage), ['--d' as string]: `${200 + i * 90}ms` }} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{p.summary}</p>
          </Reveal>
        );
      })}
    </div>
  );
}
