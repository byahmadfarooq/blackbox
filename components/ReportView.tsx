import React from 'react';
import Link from 'next/link';
import { ReportData, PillarKey } from '@/lib/engine/types';
import { ScoreRing } from './ScoreRing';
import { PillarGrid } from './PillarGrid';
import { PriorityCards, AllChecks } from './Findings';
import { ShareBar } from './ShareBar';
import { Reveal } from './Reveal';

export function ReportView({ report, token }: { report: ReportData; token: string }) {
  const names = Object.fromEntries((Object.keys(report.pillars) as PillarKey[]).map((k) => [k, report.pillars[k].name]));
  const date = new Date(report.scannedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const unconfirmed = report.checks.filter((c) => c.status === 'unknown').length;
  return (
    <main className="pb-16 pt-6 sm:pt-10">
      <p className="text-sm text-muted">Landing page check · {date}</p>
      <h1 className="mt-1 break-words text-3xl font-semibold tracking-tight sm:text-4xl">{report.domain}</h1>
      <p className="mt-1 text-sm text-muted">
        Read as: {report.archetypeLabel}{report.manual ? ' (chosen by you)' : ' (detected)'}
      </p>

      <Reveal className="mt-8 flex flex-col items-center gap-8 rounded-3xl border border-line bg-card p-6 sm:flex-row sm:p-9">
        <ScoreRing score={report.score} />
        <div className="text-center sm:text-left">
          <p className="text-2xl font-semibold tracking-tight">{report.tierLabel}</p>
          <p className="mt-2 max-w-md leading-relaxed text-muted">{report.tierDescription}</p>
          <p className="mt-4 inline-block rounded-full bg-paper px-3 py-1 text-sm text-muted">
            Based on {report.coverage}% of the checklist{unconfirmed ? ` · ${unconfirmed} not confirmed` : ''}
          </p>
        </div>
      </Reveal>

      {report.limits.length > 0 && (
        <Reveal className="mt-4 rounded-2xl border border-warn/30 bg-warn/5 p-5">
          <p className="text-sm font-semibold text-warn">Read this first</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[15px] leading-relaxed">
            {report.limits.map((l) => <li key={l}>{l}</li>)}
          </ul>
        </Reveal>
      )}

      <section className="mt-14" aria-labelledby="start-h">
        <Reveal as="h2" className="text-2xl font-semibold tracking-tight"><span id="start-h">Start here</span></Reveal>
        <p className="mb-5 mt-1 text-muted">The biggest gains first. Fix these in order.</p>
        <PriorityCards items={report.priorities.slice(0, 5)} />
      </section>

      <section className="mt-14" aria-labelledby="areas-h">
        <Reveal as="h2" className="mb-5 text-2xl font-semibold tracking-tight"><span id="areas-h">By area</span></Reveal>
        <PillarGrid pillars={report.pillars} />
      </section>

      <section className="mt-14" aria-labelledby="all-h">
        <Reveal as="h2" className="mb-5 text-2xl font-semibold tracking-tight"><span id="all-h">Every check</span></Reveal>
        <AllChecks checks={report.checks} names={names} />
      </section>

      <ShareBar report={report} token={token} />

      <Reveal className="mt-14 rounded-2xl border border-line bg-card p-6 text-[15px] leading-relaxed text-muted">
        <p className="font-semibold text-ink">How this score works</p>
        <p className="mt-1.5">
          Rubric {report.version}: {report.checks.length} fixed checks in five areas, each with a set weight. The same page always gets the same score, with no AI guessing.
          Checks we cannot confirm from the page code are left out and shown as not confirmed, not as failures. This is a guide to what to improve, not a prediction of results.
        </p>
      </Reveal>

      <div className="no-print mt-10 text-center">
        <Link href="/" className="btn-primary inline-block rounded-full px-6 py-3 text-sm font-semibold">Check another page</Link>
      </div>
    </main>
  );
}
