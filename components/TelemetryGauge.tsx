import React from 'react';
import { SurvivabilityTier } from '@/lib/engine/types';

interface Props {
  score: number;
  tier: SurvivabilityTier;
  tierLabel: string;
  tierDescription: string;
}

export function TelemetryGauge({ score, tierLabel, tierDescription }: Props) {
  const tone = score >= 90 ? 'text-good' : score >= 75 ? 'text-good' : score >= 50 ? 'text-warn' : 'text-bad';
  const bar = score >= 75 ? 'bg-good' : score >= 50 ? 'bg-warn' : 'bg-bad';
  return (
    <section className="rounded-2xl border border-line bg-card p-6 sm:p-8" aria-label="Overall score">
      <p className="text-sm text-muted">Overall score</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-7xl font-semibold tracking-tight tabular-nums">{score}</span>
        <span className="text-xl text-muted">/ 100</span>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-paper" role="img" aria-label={`${score} out of 100`}>
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${score}%` }} />
      </div>
      <p className={`mt-5 text-lg font-semibold ${tone}`}>{tierLabel}</p>
      <p className="mt-1 text-[15px] leading-relaxed text-muted">{tierDescription}</p>
    </section>
  );
}
