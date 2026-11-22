'use client';
import React, { useState } from 'react';
import { SharedReport } from '@/lib/engine/types';

export function ShareBar({ report, token }: { report: SharedReport; token: string }) {
  const { domain, overallScore: score, tierLabel, incidents, pillars } = report;
  const [notice, setNotice] = useState<string | null>(null);
  const [badgeOpen, setBadgeOpen] = useState(false);
  const [format, setFormat] = useState<'html' | 'markdown'>('html');

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${origin}/r/${token}`;
  const imgPath = `/api/og?t=${token}`;
  const badgeUrl = `${origin}/api/badge?score=${score}`;
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const top = incidents
    .filter((i) => i.severity === 'FATAL_STALL')
    .concat(incidents.filter((i) => i.severity === 'FRICTION_WARN'))
    .slice(0, 3);

  const postText = `I ran ${domain} through Blackbox, a free landing page check. It scored ${score}/100 (${tierLabel}).${
    top[0] ? ` Top fix: ${top[0].headline}.` : ''
  }`;

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

  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(msg);
    } catch {
      setNotice('Copy failed. Select the text and copy it manually.');
    }
    setTimeout(() => setNotice(null), 3000);
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: `${domain} on Blackbox`, text: postText, url: shareUrl });
    } catch {
      /* user closed the share sheet */
    }
  };

  const savePdf = () => {
    // The browser uses the page title as the PDF file name, so set a clean one while printing.
    const original = document.title;
    const day = new Date(report.timestamp).toISOString().slice(0, 10);
    document.title = `Blackbox Report - ${domain} - ${day}`;
    const restore = () => {
      document.title = original;
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
    window.print();
  };

  const snippet =
    format === 'html'
      ? `<a href="${shareUrl}"><img src="${badgeUrl}" alt="Blackbox score ${score}/100" height="28"></a>`
      : `[![Blackbox score ${score}/100](${badgeUrl})](${shareUrl})`;

  const enc = encodeURIComponent;
  const btn = 'inline-flex items-center rounded-full border border-line bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-ink';
  const primary = 'inline-flex items-center rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-accent';

  return (
    <section className="no-print mt-10" aria-labelledby="share-h">
      <h2 id="share-h" className="text-xl font-semibold tracking-tight">Share this report</h2>
      <p className="mt-1 text-sm text-muted">The link opens this exact report. It never changes and costs the viewer nothing.</p>

      <div className="mt-5 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgPath} alt={`Score card for ${domain}: ${score} out of 100`} width={1200} height={630} className="w-full rounded-2xl border border-line" />
          <div className="mt-3 flex flex-wrap gap-2">
            <a className={btn} href={`${imgPath}&download=1`} download>Download image</a>
            <a className={btn} href={`${imgPath}&size=square&download=1`} download>Square image</a>
          </div>
        </div>

        <div className="space-y-3 lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            {canNativeShare && <button className={primary} onClick={nativeShare}>Share…</button>}
            <button className={canNativeShare ? btn : primary} onClick={() => copy(shareUrl, 'Link copied.')}>Copy link</button>
          </div>
          <div className="flex flex-wrap gap-2">
            <a className={btn} target="_blank" rel="noopener noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}`}>LinkedIn</a>
            <a className={btn} target="_blank" rel="noopener noreferrer" href={`https://twitter.com/intent/tweet?text=${enc(postText)}&url=${enc(shareUrl)}`}>X</a>
            <a className={btn} target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${enc(`${postText} ${shareUrl}`)}`}>WhatsApp</a>
            <a className={btn} href={`mailto:?subject=${enc(`Landing page check: ${domain}`)}&body=${enc(summary)}`}>Email</a>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className={btn} onClick={() => copy(summary, 'Summary copied.')}>Copy summary</button>
            <button className={btn} onClick={savePdf}>Save as PDF</button>
            <button className={btn} onClick={() => setBadgeOpen((v) => !v)} aria-expanded={badgeOpen}>Badge</button>
          </div>
          <p className="min-h-5 text-sm text-good" role="status">{notice}</p>
        </div>
      </div>

      {badgeOpen && (
        <div className="mt-2 rounded-2xl border border-line bg-card p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/badge?score=${score}`} alt={`Blackbox score ${score}`} height={28} className="mb-3" />
          <div className="mb-2 flex gap-2 text-sm" role="group" aria-label="Badge format">
            {(['html', 'markdown'] as const).map((f) => (
              <button key={f} onClick={() => setFormat(f)} aria-pressed={format === f}
                className={`rounded-full px-3 py-1 ${format === f ? 'bg-ink text-paper' : 'text-muted'}`}>
                {f === 'html' ? 'HTML' : 'Markdown'}
              </button>
            ))}
          </div>
          <textarea readOnly value={snippet} rows={3} className="w-full rounded-lg border border-line bg-paper p-3 text-sm" aria-label="Badge code" />
          <button className={`${btn} mt-2`} onClick={() => copy(snippet, 'Badge code copied.')}>Copy code</button>
        </div>
      )}
    </section>
  );
}
