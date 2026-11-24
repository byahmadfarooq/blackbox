'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Reveal } from '@/components/Reveal';
import { ScanDemo } from '@/components/ScanDemo';
import { PageArchetype } from '@/lib/engine/types';
import { BUSINESS_TYPES, EMAIL_RE } from '@/lib/leads';

const STEPS = [
  'Opening your page',
  'Reading the headline and buttons',
  'Looking for proof and trust signals',
  'Checking how heavy the page is',
  'Checking search and mobile basics',
  'Writing your report',
];

const KINDS = [
  { key: 'AUTO', label: 'Detect automatically' },
  { key: 'AGENCY_STUDIO', label: 'Agency or studio' },
  { key: 'PERSONAL_AUTHORITY', label: 'Personal site' },
  { key: 'B2B_SAAS_TOOL', label: 'Software product' },
  { key: 'SINGLE_OFFER_FUNNEL', label: 'Single offer' },
];

const AREAS = [
  ['Getting visitors to act', 'Is there one clear main button, a short menu, and an easy way to get in touch?'],
  ['Clear message', 'Can a new visitor tell what you offer and who it is for within a few seconds?'],
  ['Proof and trust', 'Are there real results, customer quotes, client names or work to back up the claims?'],
  ['Speed and weight', 'Is the page light enough that visitors do not give up waiting?'],
  ['Search and basics', 'Page title, description, mobile layout, link previews, image text and more.'],
];

const STEPS_HOW = [
  ['Paste your address', 'Any public landing page. Add your email and business type, no account needed.'],
  ['We read the page', 'Around 30 fixed checks, each one tied to something we can actually find in the page.'],
  ['You get a ranked report', 'The biggest fixes first, with what we found, why it matters and how many points it could add.'],
];

const FAQ = [
  ['Is it free?', 'Yes. You enter your email and business type, and the report is free. There is no account to create.'],
  ['Do you keep my page?', 'No. The page is read once to build the report. The report lives inside its own link, so only people with the link can open it.'],
  ['Is the score from an AI?', 'No. The same page always gets the same score. Every check is a fixed rule, and the report shows what each one found.'],
  ['What can it miss?', 'It reads the page code, not a live browser. Things that only appear after scripts run can be missed. Those checks are marked "not confirmed" and left out of the score instead of counted as failures.'],
  ['Does a high score mean more leads?', 'No. It means the page avoids common problems. Real results depend on your offer, traffic and market.'],
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
  const [email, setEmail] = useState('');
  const [bizType, setBizType] = useState('');
  const [consent, setConsent] = useState(false);
  const [trap, setTrap] = useState('');
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
      if (!EMAIL_RE.test(email.trim())) { setError('Please enter a valid email address.'); return; }
      if (!bizType) { setError('Please choose your type of business.'); return; }
      if (!consent) { setError('Please tick the box to receive your report.'); return; }
      setError(null);
      setLoading(true);
      try {
        const k = manual ?? kind;
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: target, manualArchetype: k === 'AUTO' ? undefined : k, email: email.trim(), businessType: bizType, consent, website: trap }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'The check failed. Please try again.');
        router.push(`/r/${data.token}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
        setLoading(false);
      }
    },
    [kind, router, email, bizType, consent, trap]
  );

  const onUrl = useCallback(
    (u: string) => {
      setUrlInput(u);
    },
    []
  );


  const scanForm = (id: string) => (
    <form onSubmit={(e) => { e.preventDefault(); run(urlInput); }} className="relative max-w-xl">
      <label htmlFor={id} className="mb-2 block text-sm font-medium">Website address</label>
      <div className="flex flex-col gap-2 rounded-2xl border border-line bg-card p-2 shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-2 focus-within:ring-accent/30 sm:flex-row">
        <input id={id} type="text" inputMode="url" autoComplete="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
          placeholder="yourcompany.com" className="min-h-12 flex-1 rounded-xl bg-transparent px-3 text-base placeholder:text-muted/70 focus-visible:outline-none" />
        <button type="submit" className="btn-primary min-h-12 rounded-xl px-6 text-base font-semibold">Check my page</button>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-email`} className="mb-1.5 block text-sm font-medium">Your email</label>
          <input id={`${id}-email`} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com"
            className="min-h-11 w-full rounded-xl border border-line bg-card px-3 text-base placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30" />
        </div>
        <div>
          <label htmlFor={`${id}-biz`} className="mb-1.5 block text-sm font-medium">Your business</label>
          <select id={`${id}-biz`} value={bizType} onChange={(e) => setBizType(e.target.value)}
            className="min-h-11 w-full rounded-xl border border-line bg-card px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30">
            <option value="">Choose one</option>
            {BUSINESS_TYPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
      </div>
      <input type="text" name="website" value={trap} onChange={(e) => setTrap(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <label className="mt-3 flex items-start gap-2.5 text-sm text-muted">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#c2410c]" />
        <span>Send me my report and occasional tips on improving my page. I can unsubscribe any time. <a href="/privacy" className="underline underline-offset-2 hover:text-ink">Privacy</a></span>
      </label>
      {error && <p role="alert" className="mt-3 text-sm text-bad">{error}</p>}
      <fieldset className="mt-4">
        <legend className="mb-2 text-sm text-muted">What kind of page is it?</legend>
        <div className="flex flex-wrap gap-2">
          {KINDS.map((o) => (
            <button key={o.key} type="button" aria-pressed={kind === o.key} onClick={() => setKind(o.key as 'AUTO' | PageArchetype)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${kind === o.key ? 'border-ink bg-ink text-paper' : 'border-line bg-card text-muted hover:border-ink hover:text-ink'}`}>
              {o.label}
            </button>
          ))}
        </div>
      </fieldset>
    </form>
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
                <span aria-hidden className={`h-2 w-2 rounded-full ${i <= step ? 'bg-accent' : 'bg-line'} ${i === step ? 'pulse-dot' : ''}`} />
                {s}
              </li>
            ))}
          </ul>
        </main>
      ) : (
        <main className="pb-12">
          <section className="grid items-center gap-12 pb-16 pt-8 sm:pt-14 lg:grid-cols-2">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-sm text-muted">
                <span className="pulse-dot h-2 w-2 rounded-full bg-accent" aria-hidden /> Free · no account · about 10 seconds
              </p>
              <h1 className="text-4xl font-semibold leading-[1.06] tracking-tight sm:text-6xl">
                Find what is stopping visitors from <span className="text-accent">contacting you</span>.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
                Paste a B2B landing page. Get a clear report with the fixes ranked by how many points they could add, plus a PDF you can send to your team.
              </p>
              <div className="mt-8">{scanForm('url')}</div>
            </div>
            <div className="hidden lg:block"><ScanDemo /></div>
          </section>

          <section id="areas" className="border-t border-line py-16" aria-labelledby="checks-h">
            <Reveal as="h2" className="text-3xl font-semibold tracking-tight"><span id="checks-h">Five areas, one clear score</span></Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {AREAS.map(([t, d], i) => (
                <Reveal key={t} delay={i * 70} className="rounded-2xl border border-line bg-card p-5 transition-transform hover:-translate-y-0.5">
                  <p className="text-sm font-semibold text-accent">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="mt-1 text-[17px] font-semibold">{t}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted">{d}</p>
                </Reveal>
              ))}
            </div>
          </section>

          <section id="how" className="border-t border-line py-16" aria-labelledby="how-h">
            <Reveal as="h2" className="text-3xl font-semibold tracking-tight"><span id="how-h">How it works</span></Reveal>
            <ol className="mt-8 grid gap-8 sm:grid-cols-3">
              {STEPS_HOW.map(([t, d], i) => (
                <Reveal as="li" key={t} delay={i * 100}>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent">{i + 1}</span>
                  <h3 className="mt-3 text-[17px] font-semibold">{t}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted">{d}</p>
                </Reveal>
              ))}
            </ol>
            <Reveal className="mt-10 rounded-2xl border border-line bg-card p-6">
              <p className="font-semibold">What it cannot see</p>
              <p className="mt-1.5 leading-relaxed text-muted">
                Blackbox reads page code. It does not run your page in a browser, judge your design, or know your market. Anything it cannot confirm is shown as not confirmed and left out of the score.
              </p>
            </Reveal>
          </section>

          <section id="faq" className="max-w-3xl border-t border-line py-16" aria-labelledby="faq-h">
            <Reveal as="h2" className="text-3xl font-semibold tracking-tight"><span id="faq-h">Questions</span></Reveal>
            <div className="mt-5 divide-y divide-line border-y border-line">
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

          <section className="rounded-3xl bg-ink px-6 py-12 text-paper sm:px-12" aria-labelledby="cta-h">
            <Reveal>
              <h2 id="cta-h" className="max-w-xl text-3xl font-semibold tracking-tight">See your page the way a first-time visitor does.</h2>
              <a href="#url" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); document.getElementById('url')?.focus({ preventScroll: true }); }}
                className="btn-primary mt-6 inline-block rounded-full px-6 py-3 text-sm font-semibold">Check my page</a>
            </Reveal>
          </section>
        </main>
      )}

      <footer className="no-print border-t border-line py-8 text-sm text-muted">
        <p>Blackbox is a free tool by <a className="underline underline-offset-2 hover:text-ink" href="https://ahmadfarooq.vercel.app">Ahmad Farooq</a>.</p>
      </footer>
    </div>
  );
}
