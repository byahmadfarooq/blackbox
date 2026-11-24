import React from 'react';

/** A wireframe page being read. Purely illustrative: no scores or numbers. */
export function ScanDemo() {
  const mark = (label: string, style: React.CSSProperties, t: string) => (
    <div className="mark pointer-events-none absolute rounded-md border-2 border-accent bg-accent/5" style={{ ...style, ['--t' as string]: t }}>
      <span className="absolute -top-3 left-2 rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-white">{label}</span>
    </div>
  );
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden>
      <div className="relative overflow-hidden rounded-2xl border border-line bg-card p-4 shadow-[0_24px_60px_-30px_rgba(23,23,26,.35)]">
        <div className="mb-3 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-line" /><span className="h-2.5 w-2.5 rounded-full bg-line" /><span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="ml-3 h-4 flex-1 rounded-full bg-paper" />
        </div>
        <div className="relative h-[330px]">
          {/* nav */}
          <div className="flex items-center justify-between"><div className="h-3 w-16 rounded bg-ink/80" /><div className="flex gap-2"><div className="h-2 w-8 rounded bg-line" /><div className="h-2 w-8 rounded bg-line" /><div className="h-2 w-8 rounded bg-line" /></div></div>
          {/* hero */}
          <div className="mt-8 space-y-2.5"><div className="h-5 w-4/5 rounded bg-ink/85" /><div className="h-5 w-3/5 rounded bg-ink/85" /></div>
          <div className="mt-4 space-y-2"><div className="h-2.5 w-full rounded bg-line" /><div className="h-2.5 w-5/6 rounded bg-line" /></div>
          <div className="mt-5 h-9 w-32 rounded-full bg-accent/90" />
          {/* proof */}
          <div className="mt-8 flex gap-3"><div className="h-8 w-16 rounded bg-paper" /><div className="h-8 w-16 rounded bg-paper" /><div className="h-8 w-16 rounded bg-paper" /><div className="h-8 w-16 rounded bg-paper" /></div>
          <div className="mt-5 grid grid-cols-2 gap-3"><div className="h-16 rounded-lg bg-paper" /><div className="h-16 rounded-lg bg-paper" /></div>

          {mark('Headline', { left: -6, top: 66, width: '88%', height: 62 }, '0.4s')}
          {mark('Main button', { left: -6, top: 164, width: 148, height: 46 }, '1.4s')}
          {mark('Proof', { left: -6, top: 224, width: '96%', height: 52 }, '2.6s')}
          {mark('Menu', { left: -6, top: -6, width: '100%', height: 30 }, '3.7s')}
          <div className="scan-line absolute inset-x-0 h-0.5 bg-accent shadow-[0_0_14px_2px_rgba(194,65,12,.45)]" />
        </div>
      </div>
    </div>
  );
}
