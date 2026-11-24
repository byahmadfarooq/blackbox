import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyze } from '../lib/engine/facts';
import { classify, hydrate } from '../lib/engine/engine';
import { CHECKS } from '../lib/engine/registry';
import { RUBRIC_VERSION } from '../lib/engine/rubric';
import type { StoredReport } from '../lib/engine/types';

const meta = (bytes: number, enc = 'gzip') => ({ finalUrl: 'https://example.test/', bytesOnWire: bytes / 3, bytesDecoded: bytes, contentEncoding: enc, ttfbMs: 200, redirects: 0 });

function run(file: string, enc = 'gzip'): StoredReport {
  const html = readFileSync(new URL(`./fixtures/${file}`, import.meta.url), 'utf8');
  const facts = analyze(html, meta(html.length, enc));
  const { archetype, signals } = classify(facts);
  return {
    version: RUBRIC_VERSION, url: 'https://example.test/', domain: 'example.test', scannedAt: 0, archetype, manual: false, signals, limits: [],
    checks: CHECKS.map((c) => { const v = c.run(facts, archetype); return { id: c.id, s: v.status, e: v.evidence }; }),
  };
}

test('same page always gives the same report', () => {
  assert.deepEqual(hydrate(run('strong.html')), hydrate(run('strong.html')));
});

test('strong page scores well and weak page scores poorly', () => {
  const strong = hydrate(run('strong.html'));
  const weak = hydrate(run('weak.html', ''));
  assert.ok(strong.score >= 80, `strong was ${strong.score}`);
  assert.ok(weak.score <= 50, `weak was ${weak.score}`);
  assert.ok(strong.score - weak.score >= 30);
});

test('evidence quotes what was found on the page', () => {
  const r = hydrate(run('strong.html'));
  const h = r.checks.find((c) => c.id === 'one-headline');
  assert.equal(h?.status, 'pass');
  assert.match(h?.evidence ?? '', /Websites for local clinics/);
  const a = r.checks.find((c) => c.id === 'primary-action');
  assert.match(a?.evidence ?? '', /Book a free call|Book a call/);
});

test('weak page problems are found with evidence', () => {
  const r = hydrate(run('weak.html', ''));
  const get = (id: string) => r.checks.find((c) => c.id === id);
  assert.equal(get('one-headline')?.status, 'warn');
  assert.equal(get('headline-says-what')?.status, 'fail');
  assert.equal(get('menu-size')?.status, 'fail');
  assert.equal(get('few-third-parties')?.status, 'warn');
  assert.equal(get('compressed')?.status, 'fail');
  assert.ok(r.priorities.length > 5);
});

test('script-built pages are marked unknown, not failed', () => {
  const r = hydrate(run('spa.html'));
  const get = (id: string) => r.checks.find((c) => c.id === id);
  for (const id of ['primary-action', 'real-results', 'testimonials', 'one-headline']) assert.equal(get(id)?.status, 'unknown', id);
  assert.ok(r.coverage < 70);
  assert.ok(r.limits.length > 0);
});

test('every check has text and a weight, and pillar totals match', () => {
  for (const c of CHECKS) {
    assert.ok(c.title && c.impact && c.fix && c.weight > 0, c.id);
    assert.doesNotMatch(c.fix, /\b(guarantee|proven)\b/i, c.id);
  }
  const sum = (p: string) => CHECKS.filter((c) => c.pillar === p).reduce((s, c) => s + c.weight, 0);
  assert.equal(sum('action'), 28);
  assert.equal(sum('message'), 22);
  assert.equal(sum('proof'), 22);
  assert.equal(sum('speed'), 14);
  assert.equal(sum('basics'), 14);
});
