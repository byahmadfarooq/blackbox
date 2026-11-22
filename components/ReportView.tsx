'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { SharedReport } from '@/lib/engine/types';
import { TelemetryGauge } from '@/components/TelemetryGauge';
import { PillarGrid } from '@/components/PillarGrid';
import { Findings } from '@/components/Findings';
import { ShareBar } from '@/components/ShareBar';

export function ReportView({ report, token }: { report: SharedReport; token: string }) {
  const [copied, setCopied] = useState(false);
  const top = report.incidents
    .filter((i) => i.severity === 'FATAL_STALL')
    .concat(report.incidents.filter((i) => i.severity === 'FRICTION_WARN'))
    .slice(0, 3);

  const prompt = [
    `Here is a conversion check of my landing page (${report.domain}). Fix these in order, keep my voice, and do not invent claims, numbers or testimonials I have not given you.`,
    ``,
    ...top.map((t, i) => `${i + 1}. ${t.headline}\n   Why: ${t.plainEnglishImpact}\n   Fix: ${t.actionableFix}`),
  ].join('\n');

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* ignore */
    }
  };

  const date = new Date(report.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <main className="pb-16 pt-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Landing page check · {date}</p>
          <h1 className="mt-1 break-all text-3xl font-semibold tracking-tight sm:text-4xl">{report.domain}</h1>
          <p className="mt-1 text-sm text-muted">
            Read as: {report.archetypeCalibration.label}
            {report.archetypeCalibration.isManualOverride ? ' (chosen by the person who ran it)' : ''}
          </p>
        </div>
        <Link href="/" className="no-print rounded-full border border-line bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-ink">
          Check another page
        </Link>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <TelemetryGauge score={report.overallScore} tier={report.tier} tierLabel={report.tierLabel} tierDescription={report.tierDescription} />
        </div>
        <div className="lg:col-span-3">
          <PillarGrid pillars={report.pillars} />
        </div>
      </div>

      <section className="mt-10" aria-labelledby="start-here">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="start-here" className="text-xl font-semibold tracking-tight">
            {top.length ? 'Start here' : 'Nothing urgent'}
          </h2>
          {top.length > 0 && (
            <button onClick={copyPrompt} className="no-print rounded-full border border-line bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-ink">
              {copied ? 'Copied' : 'Copy these as a to-do prompt'}
            </button>
          )}
        </div>
        {top.length === 0 ? (
          <p className="mt-3 text-muted">No blocking issues were found. The checks below show what passed.</p>
        ) : (
          <ol className="mt-4 grid gap-4 md:grid-cols-3">
            {top.map((t, i) => (
              <li key={t.id} className="rounded-2xl border border-line bg-card p-5">
                <p className="text-sm font-semibold text-accent">{i + 1}</p>
                <h3 className="mt-1 text-[15px] font-semibold leading-snug">{t.headline}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t.actionableFix}</p>
                {t.confidence === 'unconfirmed' && (
                  <p className="mt-3 text-xs text-muted">Not fully confirmed. Check it yourself first.</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      <Findings incidents={report.incidents} />

      <section className="mt-6 rounded-2xl bg-paper px-1 text-sm leading-relaxed text-muted">
        <p>
          How this was checked: Blackbox read the page the way a search engine does, from its code. The same page gets the same score, and no AI wrote this report.
          It can miss things that only appear after scripts run, so those checks are marked.
        </p>
      </section>

      <ShareBar report={report} token={token} />

      <section className="no-print mt-10 rounded-2xl border border-line bg-card p-6">
        <h2 className="text-lg font-semibold">Want a second pair of eyes?</h2>
        <p className="mt-1 text-[15px] leading-relaxed text-muted">
          I build and fix websites for small businesses. If you want help acting on this report, send me a message.
        </p>
        <a href="https://ahmadfarooq.vercel.app" className="mt-4 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-accent">
          Talk to Ahmad
        </a>
      </section>
    </main>
  );
}
