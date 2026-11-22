'use client';
import React, { useState } from 'react';
import { TelemetryResult } from '@/lib/engine/types';

export function ShareBar({ report }: { report: TelemetryResult }) {
  const { domain, overallScore: score, tierLabel, incidents, pillars } = report;
  const [notice, setNotice] = useState<string | null>(null);
  const [badgeOpen, setBadgeOpen] = useState(false);
  const [format, setFormat] = useState<'html' | 'markdown'>('html');

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${origin}/?url=${encodeURIComponent(domain)}`;
  const badgeUrl = `${origin}/api/badge?score=${score}`;

  const top = incidents.filter((i) => i.severity === 'FATAL_STALL').concat(incidents.filter((i) => i.severity === 'FRICTION_WARN')).slice(0, 3);

  const summary = [
    `Blackbox check for ${domain}: ${score}/100 (${tierLabel}).`,
    ``,
    `Getting visitors to act: ${pillars.architecture.score}/${pillars.architecture.maxScore}`,
    `Clear message: ${pillars.messaging.score}/${pillars.messaging.maxScore}`,
    `Proof and trust: ${pillars.proof.score}/${pillars.proof.maxScore}`,
    `Speed and weight: ${pillars.velocity.score}/${pillars.velocity.maxScore}`,
    ``,
    top.length ? `Top fixes:` : `No blocking issues found.`,
    ...top.map((t, i) => `${i + 1}. ${t.headline}: ${t.actionableFix}`),
    ``,
    shareUrl,
  ].join('\n');

  const prompt = [
    `Here is a conversion check of my landing page (${domain}). Fix these in order, keep my voice, and do not invent claims or numbers I have not given you.`,
    ``,
    ...top.map((t, i) => `${i + 1}. ${t.headline}\n   Why: ${t.plainEnglishImpact}\n   Fix: ${t.actionableFix}`),
  ].join('\n');

  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(msg);
    } catch {
      setNotice('Copy failed. Select the text and copy it manually.');
    }
    setTimeout(() => setNotice(null), 3000);
  };

  const snippet =
    format === 'html'
      ? `<a href="${shareUrl}"><img src="${badgeUrl}" alt="Blackbox score ${score}/100" height="28"></a>`
      : `[![Blackbox score ${score}/100](${badgeUrl})](${shareUrl})`;

  const btn =
    'rounded-full border border-line bg-card px-4 py-2 text-sm font-medium hover:border-ink transition-colors';

  return (
    <section className="mt-6 rounded-2xl border border-line bg-card p-5 sm:p-6" aria-label="Share this report">
      <h2 className="text-lg font-semibold">Share or use this report</h2>
      <p className="mt-1 text-sm text-muted">Everything here is plain text you can paste anywhere.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className={btn} onClick={() => copy(shareUrl, 'Link copied.')}>Copy link</button>
        <button className={btn} onClick={() => copy(summary, 'Summary copied.')}>Copy summary</button>
        <button className={btn} onClick={() => copy(prompt, 'Copied. Paste it into your AI tool or send it to your developer.')}>
          Copy fixes as a to-do prompt
        </button>
        <button className={btn} onClick={() => setBadgeOpen((v) => !v)} aria-expanded={badgeOpen}>
          Get a badge
        </button>
      </div>
      {badgeOpen && (
        <div className="mt-4 rounded-xl border border-line bg-paper p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/badge?score=${score}`} alt={`Blackbox score ${score}`} height={28} className="mb-3" />
          <div className="mb-2 flex gap-2 text-sm">
            {(['html', 'markdown'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                aria-pressed={format === f}
                className={`rounded-full px-3 py-1 ${format === f ? 'bg-ink text-paper' : 'text-muted'}`}
              >
                {f === 'html' ? 'HTML' : 'Markdown'}
              </button>
            ))}
          </div>
          <textarea readOnly value={snippet} rows={3} className="w-full rounded-lg border border-line bg-card p-3 text-sm" />
          <button className={`${btn} mt-2`} onClick={() => copy(snippet, 'Badge code copied.')}>Copy code</button>
        </div>
      )}
      <p className="mt-3 min-h-5 text-sm text-good" role="status">{notice}</p>
    </section>
  );
}
