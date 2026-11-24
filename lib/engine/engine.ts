import { safeFetchPage } from './safe-fetch';
import { analyze, type PageFacts } from './facts';
import { CHECKS, CHECK_BY_ID, weightFor } from './registry';
import { PILLARS, RUBRIC_VERSION } from './rubric';
import type { CheckStatus, CheckView, PageArchetype, PillarKey, PillarScore, ReportData, StoredReport } from './types';

const UA = 'Mozilla/5.0 (compatible; BlackboxScanner/2.0; +https://blackboxcheck.vercel.app)';

export const ARCHETYPE_LABEL: Record<PageArchetype, string> = {
  AGENCY_STUDIO: 'Agency or studio',
  PERSONAL_AUTHORITY: 'Personal site',
  B2B_SAAS_TOOL: 'Software product',
  SINGLE_OFFER_FUNNEL: 'Single offer page',
};

export function classify(f: PageFacts): { archetype: PageArchetype; signals: string[] } {
  const signals: string[] = [];
  const hay = `${f.title} ${f.heroText}`.toLowerCase();
  const labels = f.navLabels.join(' ');
  const acts = f.actions.map((a) => a.text.toLowerCase()).join(' ');
  if (/(pricing|integrations|docs|changelog)/.test(labels) || /(sign up|free trial|try (it )?for free|get started)/.test(acts)) {
    signals.push('Pricing, docs or sign-up found');
    return { archetype: 'B2B_SAAS_TOOL', signals };
  }
  if (/\b(i help|i['’]m |i build|my work|i design|hi, i)\b/.test(hay)) {
    signals.push('First-person introduction');
    return { archetype: 'PERSONAL_AUTHORITY', signals };
  }
  if (f.navLabels.length <= 2 && f.formCount > 0) {
    signals.push('Few links and a form');
    return { archetype: 'SINGLE_OFFER_FUNNEL', signals };
  }
  signals.push('Services and contact pages');
  return { archetype: 'AGENCY_STUDIO', signals };
}

export async function scanUrl(rawUrl: string, manual?: PageArchetype): Promise<StoredReport> {
  const page = await safeFetchPage(rawUrl, { timeoutMs: 12000, userAgent: UA });
  if (page.status >= 400) throw new Error(`The page returned an error (${page.status}).`);

  const facts = analyze(page.text, page);
  const detected = classify(facts);
  const archetype = manual ?? detected.archetype;

  const checks = CHECKS.map((c) => {
    const v = c.run(facts, archetype);
    return { id: c.id, s: v.status, e: v.evidence ? v.evidence.slice(0, 220) : undefined };
  });

  const limits: string[] = [];
  if (facts.clientRendered) limits.push('This page builds itself with scripts after it loads, so most content checks could not run. A browser-based check is planned.');
  if (page.redirects > 0) limits.push(`The address redirected, so we checked ${new URL(page.finalUrl).hostname}.`);

  return {
    version: RUBRIC_VERSION,
    url: page.finalUrl,
    domain: new URL(page.finalUrl).hostname.replace(/^www\./, ''),
    scannedAt: Date.now(),
    archetype,
    manual: Boolean(manual),
    signals: manual ? ['Chosen by the person who ran it'] : detected.signals,
    limits,
    checks,
  };
}

const VALUE: Record<CheckStatus, number | null> = { pass: 1, warn: 0.5, fail: 0, unknown: null, na: null };

function tone(pct: number): PillarScore['tone'] {
  return pct >= 75 ? 'good' : pct >= 50 ? 'mid' : 'poor';
}

/** Turn a stored report into everything the UI and PDF show. Pure and deterministic. */
export function hydrate(r: StoredReport): ReportData {
  const views: CheckView[] = [];
  const known: Record<PillarKey, { w: number; e: number; total: number }> = {
    action: { w: 0, e: 0, total: 0 }, message: { w: 0, e: 0, total: 0 }, proof: { w: 0, e: 0, total: 0 },
    speed: { w: 0, e: 0, total: 0 }, basics: { w: 0, e: 0, total: 0 },
  };

  for (const sc of r.checks) {
    const def = CHECK_BY_ID.get(sc.id);
    if (!def) continue;
    const weight = weightFor(def, r.archetype);
    const val = VALUE[sc.s];
    const p = known[def.pillar];
    if (sc.s !== 'na') p.total += weight;
    if (val !== null) {
      p.w += weight;
      p.e += weight * val;
    }
    views.push({
      id: def.id, pillar: def.pillar, title: def.title, status: sc.s, evidence: sc.e || '',
      impact: def.impact, fix: def.fix, weight, earned: val === null ? 0 : weight * val, gain: 0,
    });
  }

  const totalKnownWeight = Object.values(known).reduce((s, p) => s + p.w, 0) || 1;
  for (const v of views) {
    const val = VALUE[v.status];
    if (val !== null && val < 1) v.gain = Math.max(1, Math.round(((v.weight * (1 - val)) / totalKnownWeight) * 100));
  }

  const pillars = {} as Record<PillarKey, PillarScore>;
  let num = 0;
  let den = 0;
  (Object.keys(PILLARS) as PillarKey[]).forEach((k) => {
    const p = known[k];
    const ratio = p.w > 0 ? p.e / p.w : 0;
    const pct = Math.round(ratio * 100);
    const cov = p.total > 0 ? Math.round((p.w / p.total) * 100) : 0;
    if (p.w > 0) {
      num += PILLARS[k].max * ratio;
      den += PILLARS[k].max;
    }
    const fails = views.filter((v) => v.pillar === k && (v.status === 'fail' || v.status === 'warn')).length;
    pillars[k] = {
      key: k, name: PILLARS[k].name, max: PILLARS[k].max,
      score: Math.round(PILLARS[k].max * ratio), percentage: pct, coverage: cov, tone: tone(pct),
      summary: p.w === 0 ? 'We could not check this area on this page.' : fails === 0 ? 'Everything we could check here looks good.' : `${fails} thing${fails > 1 ? 's' : ''} to improve here.`,
    };
  });

  const score = den ? Math.round((num / den) * 100) : 0;
  const totalWeight = Object.values(known).reduce((s, p) => s + p.total, 0) || 1;
  const coverage = Math.round((totalKnownWeight / totalWeight) * 100);

  const [tierLabel, tierDescription] =
    score >= 85 ? ['Strong', 'The page is clear, easy to act on and well backed up. Only small fixes are left.']
    : score >= 70 ? ['Good, with gaps', 'A solid base. A few fixable issues are making it harder for visitors to act.']
    : score >= 50 ? ['Needs work', 'Several things are getting in the way of a visitor understanding the offer and taking the next step.']
    : ['Needs a rebuild', 'Serious problems with message, proof or layout. Fix the top items before sending traffic here.'];

  const limits = [...r.limits];
  if (coverage < 70 && !limits.length) limits.push(`We could only check ${coverage}% of the rubric on this page, so treat the score as partial.`);

  const priorities = views.filter((v) => v.status === 'fail' || v.status === 'warn').sort((a, b) => b.gain - a.gain || b.weight - a.weight);

  return {
    version: r.version, url: r.url, domain: r.domain, scannedAt: r.scannedAt,
    archetype: r.archetype, archetypeLabel: ARCHETYPE_LABEL[r.archetype], manual: r.manual,
    signals: r.signals, limits, score, tierLabel, tierDescription, coverage, pillars, checks: views, priorities,
  };
}
