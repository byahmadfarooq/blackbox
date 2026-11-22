'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { PageArchetype } from '@/lib/engine/types';

const STEPS = [
  'Opening your page',
  'Reading the headline and buttons',
  'Looking for proof and trust signals',
  'Checking how heavy the page is',
  'Writing your report',
];

const KINDS = [
  { key: 'AUTO', label: 'Detect automatically' },
  { key: 'AGENCY_STUDIO', label: 'Agency or studio' },
  { key: 'PERSONAL_AUTHORITY', label: 'Personal site' },
  { key: 'B2B_SAAS_TOOL', label: 'Software product' },
  { key: 'SINGLE_OFFER_FUNNEL', label: 'Single offer' },
];

const CHECKS = [
  ['Getting visitors to act', 'Is the main button easy to find, and is the path to it short?'],
  ['Clear message', 'Can a new visitor tell what you offer and who it is for within a few seconds?'],
  ['Proof and trust', 'Are there real customers, results or work to back up the claims?'],
  ['Speed and weight', 'Is the page light enough that visitors do not give up waiting?'],
];

const FAQ = [
  ['Is it free?', 'Yes. There is no sign-up and no email to enter.'],
  ['Do you keep my page?', 'No. The page is read once to build the report. The report itself lives in its link, so only people with the link can open it.'],
  ['Is a score from an AI?', 'No. The same page always gets the same score. There is no AI guessing in the checks.'],
  ['What can it miss?', 'It reads the page code, not a live browser. Things that only appear after scripts run, like a sticky header added by JavaScript, can be missed. Those checks are marked "not fully confirmed".'],
];

function QueryListener({ onUrl }: { onUrl: (u: string) => void }) {
  const sp = useSearchParams();
  useEffect(() => {
    const u = sp.get('url');
    if (u) onUrl(u);
  }, [sp, onUrl]);
  return null;
}

export default function Home() {
  const router = useRouter();
  const [urlInput, setUrlInput] = useState('');
  const [kind, setKind] = useState<'AUTO' | PageArchetype>('AUTO');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      setStep(0);
      return;
    }
    const t = setInterval(() => setStep((p) => (p < STEPS.length - 1 ? p + 1 : p)), 1100);
    return () => clearInterval(t);
  }, [loading]);

  const run = useCallback(
    async (target: string, manual?: 'AUTO' | PageArchetype) => {
      if (!target.trim()) {
        setError('Please enter a website address.');
        return;
      }
      setError(null);
      setLoading(true);
      try {
        const k = manual ?? kind;
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: target, manualArchetype: k === 'AUTO' ? undefined : k }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'The check failed. Please try again.');
        router.push(`/r/${data.token}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
        setLoading(false);
      }
    },
    [kind, router]
  );

  const onUrl = useCallback(
    (u: string) => {
      setUrlInput(u);
      run(u);
    },
    [run]
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
      <Suspense fallback={null}>
        <QueryListener onUrl={onUrl} />
      </Suspense>
      <Header />

      {loading ? (
        <main className="py-24" role="status" aria-live="polite">
          <p className="text-3xl font-semibold tracking-tight">Checking {urlInput.replace(/^https?:\/\//, '')}</p>
          <div className="mt-6 h-1.5 max-w-md overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-accent transition-all duration-1000" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
          <ul className="mt-6 space-y-2.5">
            {STEPS.map((s, i) => (
              <li key={s} className={`flex items-center gap-3 text-[15px] ${i < step ? 'text-muted' : i === step ? 'font-medium' : 'text-muted/40'}`}>
                <span aria-hidden className={`h-2 w-2 rounded-full ${i <= step ? 'bg-accent' : 'bg-line'}`} />
                {s}
              </li>
            ))}
          </ul>
        </main>
      ) : (
        <main className="pb-20 pt-10 sm:pt-16">
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
            Find what is stopping visitors from contacting you.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            Paste the address of a B2B landing page. You get a plain-English report with the fixes ranked, so you know what to change first.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); run(urlInput); }} className="mt-9 max-w-2xl">
            <label htmlFor="url" className="mb-2 block text-sm font-medium">Website address</label>
            <div className="flex flex-col gap-2 rounded-2xl border border-line bg-card p-2 shadow-sm sm:flex-row">
              <input
                id="url"
                type="text"
                inputMode="url"
                autoComplete="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="yourcompany.com"
                className="min-h-12 flex-1 rounded-xl bg-transparent px-3 text-base placeholder:text-muted/70 focus-visible:outline-none"
              />
              <button type="submit" className="min-h-12 rounded-xl bg-ink px-6 text-base font-semibold text-paper transition-colors hover:bg-accent">
                Check my page
              </button>
            </div>
            {error && <p role="alert" className="mt-3 text-sm text-bad">{error}</p>}

            <fieldset className="mt-5">
              <legend className="mb-2 text-sm text-muted">What kind of page is it?</legend>
              <div className="flex flex-wrap gap-2">
                {KINDS.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    aria-pressed={kind === o.key}
                    onClick={() => setKind(o.key as 'AUTO' | PageArchetype)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                      kind === o.key ? 'border-ink bg-ink text-paper' : 'border-line bg-card text-muted hover:border-ink hover:text-ink'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </form>

          <section className="mt-20" aria-labelledby="checks-h">
            <h2 id="checks-h" className="text-2xl font-semibold tracking-tight">What it checks</h2>
            <div className="mt-6 grid gap-x-10 gap-y-7 sm:grid-cols-2">
              {CHECKS.map(([t, d], i) => (
                <div key={t} className="border-t border-line pt-4">
                  <p className="text-sm font-semibold text-accent">{i + 1}</p>
                  <h3 className="mt-1 text-[17px] font-semibold">{t}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted">{d}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-20 max-w-3xl" aria-labelledby="faq-h">
            <h2 id="faq-h" className="text-2xl font-semibold tracking-tight">Questions</h2>
            <div className="mt-4 divide-y divide-line border-y border-line">
              {FAQ.map(([q, a]) => (
                <details key={q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-medium">
                    {q}
                    <span aria-hidden className="text-muted transition-transform group-open:rotate-180">▾</span>
                  </summary>
                  <p className="mt-2 leading-relaxed text-muted">{a}</p>
                </details>
              ))}
            </div>
          </section>
        </main>
      )}

      <footer className="no-print border-t border-line py-8 text-sm text-muted">
        <p>Blackbox is a free tool by <a className="underline underline-offset-2 hover:text-ink" href="https://ahmadfarooq.vercel.app">Ahmad Farooq</a>.</p>
      </footer>
    </div>
  );
}
