'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { TelemetryGauge } from '@/components/TelemetryGauge';
import { PillarGrid } from '@/components/PillarGrid';
import { Findings } from '@/components/Findings';
import { ShareBar } from '@/components/ShareBar';
import { PageArchetype, TelemetryResult } from '@/lib/engine/types';

function UrlQueryListener({ onTargetUrl }: { onTargetUrl: (url: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const queryUrl = searchParams.get('url');
    if (queryUrl) {
      onTargetUrl(queryUrl);
    }
  }, [searchParams, onTargetUrl]);
  return null;
}

export default function Home() {
  const [urlInput, setUrlInput] = useState('');
  const [selectedArchetype, setSelectedArchetype] = useState<'AUTO' | PageArchetype>('AUTO');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<TelemetryResult | null>(null);

  const loadingSequence = [
    'Opening your page',
    'Reading the headline and buttons',
    'Looking for proof and trust signals',
    'Checking how heavy the page is',
    'Writing your report',
  ];

  const handleAutoScan = React.useCallback((targetUrl: string) => {
    if (targetUrl && !report && !loading) {
      setUrlInput(targetUrl);
      executeScan(targetUrl);
    }
  }, [report, loading]);

  // Loading animation stepper
  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSequence.length - 1 ? prev + 1 : prev));
    }, 900);

    return () => clearInterval(interval);
  }, [loading]);

  const executeScan = async (target: string, overrideArchetype?: PageArchetype) => {
    if (!target.trim()) {
      setError('Please enter a website address.');
      return;
    }

    setError(null);
    setLoading(true);
    setReport(null);

    try {
      const manualType = overrideArchetype || (selectedArchetype === 'AUTO' ? undefined : selectedArchetype);
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target, manualArchetype: manualType }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to complete telemetry scan.');
      }

      setReport(data.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeScan(urlInput);
  };

  const resetFlightDeck = () => {
    setReport(null);
    setError(null);
    setUrlInput('');
  };

  const archetypes = [
    { key: 'AUTO', label: 'Detect automatically' },
    { key: 'AGENCY_STUDIO', label: 'Agency or studio' },
    { key: 'PERSONAL_AUTHORITY', label: 'Personal site' },
    { key: 'B2B_SAAS_TOOL', label: 'Software product' },
    { key: 'SINGLE_OFFER_FUNNEL', label: 'Single offer' },
  ];

  const steps = [
    ['Getting visitors to act', 'Is the main button easy to find, and is the path to it short?'],
    ['Clear message', 'Can a new visitor tell what you offer and who it is for within a few seconds?'],
    ['Proof and trust', 'Are there real customers, results or work to back up the claims?'],
    ['Speed and weight', 'Is the page light enough that visitors do not give up waiting?'],
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
      <Suspense fallback={null}>
        <UrlQueryListener onTargetUrl={handleAutoScan} />
      </Suspense>

      <Header onReset={resetFlightDeck} />

      {!report && !loading && (
        <main className="pb-16 pt-10 sm:pt-16">
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            Find what is stopping visitors from contacting you.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            Paste the address of a B2B landing page. You get a plain-English report with the fixes ranked, so you know what to change first.
          </p>

          <form onSubmit={handleFormSubmit} className="mt-9 max-w-2xl">
            <label htmlFor="url" className="mb-2 block text-sm font-medium">Website address</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="url"
                type="text"
                inputMode="url"
                autoComplete="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="yourcompany.com"
                className="min-h-12 flex-1 rounded-xl border border-line bg-card px-4 text-base placeholder:text-muted/70"
              />
              <button
                type="submit"
                className="min-h-12 rounded-xl bg-ink px-6 text-base font-semibold text-paper transition-colors hover:bg-accent"
              >
                Check my page
              </button>
            </div>
            {error && <p role="alert" className="mt-3 text-sm text-bad">{error}</p>}

            <fieldset className="mt-5">
              <legend className="mb-2 text-sm text-muted">What kind of page is it?</legend>
              <div className="flex flex-wrap gap-2">
                {archetypes.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    aria-pressed={selectedArchetype === opt.key}
                    onClick={() => setSelectedArchetype(opt.key as 'AUTO' | PageArchetype)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                      selectedArchetype === opt.key
                        ? 'border-ink bg-ink text-paper'
                        : 'border-line bg-card text-muted hover:border-ink hover:text-ink'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </form>

          <section className="mt-16" aria-labelledby="how">
            <h2 id="how" className="text-xl font-semibold">What it checks</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {steps.map(([t, d], i) => (
                <div key={t} className="rounded-2xl border border-line bg-card p-5">
                  <p className="text-sm text-accent">{i + 1}</p>
                  <h3 className="mt-1 text-[15px] font-semibold">{t}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{d}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">
              Blackbox reads the page's code the way a search engine would. The same page always gets the same score, and no AI writes your report. It cannot see
              what only appears after the page runs scripts, so treat the result as a strong first pass, not a verdict.
            </p>
          </section>
        </main>
      )}

      {loading && (
        <div className="py-24" role="status" aria-live="polite">
          <p className="text-2xl font-semibold tracking-tight">Checking your page</p>
          <ul className="mt-6 space-y-2.5">
            {loadingSequence.map((step, idx) => (
              <li
                key={step}
                className={`flex items-center gap-3 text-[15px] ${
                  idx < loadingStep ? 'text-muted' : idx === loadingStep ? 'font-medium text-ink' : 'text-muted/40'
                }`}
              >
                <span aria-hidden className={`h-2 w-2 rounded-full ${idx <= loadingStep ? 'bg-accent' : 'bg-line'}`} />
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report && (
        <main className="pb-16 pt-4">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Report for</p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{report.domain}</h1>
              <p className="mt-1 text-sm text-muted">
                Read as: {report.archetypeCalibration.label}
                {report.archetypeCalibration.isManualOverride ? ' (you chose this)' : ''}
              </p>
            </div>
            <button onClick={resetFlightDeck} className="rounded-full border border-line bg-card px-4 py-2 text-sm font-medium hover:border-ink">
              Check another page
            </button>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <TelemetryGauge
                score={report.overallScore}
                tier={report.tier}
                tierLabel={report.tierLabel}
                tierDescription={report.tierDescription}
              />
            </div>
            <div className="lg:col-span-3">
              <PillarGrid pillars={report.pillars} />
            </div>
          </div>

          <Findings incidents={report.incidents} />
          <ShareBar report={report} />

          <section className="mt-6 rounded-2xl border border-line bg-card p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Want a second pair of eyes?</h2>
            <p className="mt-1 text-[15px] leading-relaxed text-muted">
              I build and fix websites for small businesses. If you want help acting on this report, send me a message.
            </p>
            <a
              href="https://ahmadfarooq.vercel.app"
              className="mt-4 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-accent"
            >
              Talk to Ahmad
            </a>
          </section>
        </main>
      )}

      <footer className="border-t border-line py-8 text-sm text-muted">
        <p>Blackbox is a free tool by <a className="underline underline-offset-2 hover:text-ink" href="https://ahmadfarooq.vercel.app">Ahmad Farooq</a>. Pages are fetched once to produce the report and are not stored.</p>
      </footer>
    </div>
  );
}
