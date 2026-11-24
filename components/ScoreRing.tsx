'use client';
import React, { useEffect, useState } from 'react';
import { CountUp } from './CountUp';

import { toneColor } from '@/lib/tone';

export function ScoreRing({ score, size = 190 }: { score: number; size?: number }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 80);
    return () => clearTimeout(t);
  }, []);
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`Score ${score} out of 100`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={toneColor(score)} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={on ? c * (1 - score / 100) : c}
          style={{ transition: 'stroke-dashoffset 1.3s cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-semibold tracking-tight" style={{ color: toneColor(score) }}><CountUp to={score} /></span>
        <span className="text-sm text-muted">out of 100</span>
      </div>
    </div>
  );
}
