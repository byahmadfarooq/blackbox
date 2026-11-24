import type { CheckStatus, PageArchetype, PillarKey } from './types';
import type { PageFacts } from './facts';

export const RUBRIC_VERSION = '2.0';

export const PILLARS: Record<PillarKey, { name: string; max: number }> = {
  action: { name: 'Getting visitors to act', max: 28 },
  message: { name: 'Clear message', max: 22 },
  proof: { name: 'Proof and trust', max: 22 },
  speed: { name: 'Speed and weight', max: 14 },
  basics: { name: 'Basics and accessibility', max: 14 },
};

export interface Verdict {
  status: CheckStatus;
  evidence: string;
}

export interface CheckDef {
  id: string;
  pillar: PillarKey;
  title: string;
  weight: number;
  /** Per page-type weight overrides. */
  adjust?: Partial<Record<PageArchetype, number>>;
  impact: string;
  fix: string;
  run: (f: PageFacts, a: PageArchetype) => Verdict;
}

export const q = (s: string, n = 70) => `“${s.length > n ? s.slice(0, n - 1) + '…' : s}”`;
export const NO_SCRIPT = 'This page builds itself with scripts, so we could not read it.';
export const list = (xs: string[], n = 4) => xs.slice(0, n).join(', ') + (xs.length > n ? `, +${xs.length - n} more` : '');
export const kb = (b: number) => `${Math.round(b / 1024)} KB`;

const top = (f: PageFacts) => f.actions.filter((a) => a.where === 'hero' || a.where === 'header');
const distinctTop = (f: PageFacts) => {
  const keys = new Map<string, string>();
  for (const a of top(f)) {
    const k = a.href && a.href !== '#' ? a.href.replace(/[?#].*$/, '').replace(/\/$/, '') : a.text.toLowerCase();
    if (!keys.has(k)) keys.set(k, a.text);
  }
  return [...keys.values()];
};

export const ACTION_CHECKS: CheckDef[] = [
  {
    id: 'primary-action', pillar: 'action', title: 'A clear main button near the top', weight: 7,
    impact: 'Visitors who are ready to act need an obvious next step. When there is none, most simply leave.',
    fix: 'Put one primary button in the top section of the page, worded as the action itself, such as “Book a call”.',
    run: (f) => {
      if (f.clientRendered) return { status: 'unknown', evidence: NO_SCRIPT };
      const t = top(f);
      if (t.length) return { status: 'pass', evidence: `Main button: ${q(t[0].text)}` };
      if (f.actions.length) return { status: 'warn', evidence: `Found ${q(f.actions[0].text)} but only lower down the page.` };
      return { status: 'fail', evidence: 'No action button found in the header or opening section.' };
    },
  },
  {
    id: 'one-main-action', pillar: 'action', title: 'One main action, not many', weight: 5,
    impact: 'Several competing buttons make visitors stop and choose, and some choose nothing.',
    fix: 'Pick the one action you want most and make it stand out. Turn the others into plain text links.',
    run: (f) => {
      if (f.clientRendered) return { status: 'unknown', evidence: NO_SCRIPT };
      const d = distinctTop(f);
      if (d.length === 0) return { status: 'unknown', evidence: 'No buttons found to compare.' };
      const ev = `Top-of-page actions: ${list(d.map((x) => q(x, 30)))}`;
      if (d.length <= 2) return { status: 'pass', evidence: ev };
      if (d.length <= 4) return { status: 'warn', evidence: `${d.length} different actions at the top. ${ev}` };
      return { status: 'fail', evidence: `${d.length} different actions at the top. ${ev}` };
    },
  },
  {
    id: 'button-wording', pillar: 'action', title: 'Buttons say what happens next', weight: 3,
    impact: 'Words like “Submit” or “Learn more” do not tell visitors what they will get.',
    fix: 'Reword vague buttons as the outcome, for example “Get my free audit” or “See pricing”.',
    run: (f) => {
      if (f.clientRendered) return { status: 'unknown', evidence: NO_SCRIPT };
      if (f.genericActions.length && !f.actions.length) return { status: 'fail', evidence: `Vague buttons only: ${list(f.genericActions.map((x) => q(x, 24)))}` };
      if (f.genericActions.length) return { status: 'warn', evidence: `Some vague buttons: ${list(f.genericActions.map((x) => q(x, 24)))}` };
      if (!f.actions.length) return { status: 'unknown', evidence: 'No buttons found to judge.' };
      return { status: 'pass', evidence: 'Buttons use clear action words.' };
    },
  },
  {
    id: 'menu-size', pillar: 'action', title: 'A short, focused menu', weight: 4,
    impact: 'Every extra menu item is another place for a visitor to wander off before acting.',
    fix: 'Keep the main menu to the few pages that matter most and move the rest to the footer.',
    run: (f, a) => {
      if (f.clientRendered) return { status: 'unknown', evidence: NO_SCRIPT };
      const n = f.navLabels.length;
      const [ok, mid] = a === 'SINGLE_OFFER_FUNNEL' ? [2, 4] : [6, 8];
      if (n === 0 && a !== 'SINGLE_OFFER_FUNNEL') return { status: 'warn', evidence: 'No menu found in the header.' };
      if (n <= ok) return { status: 'pass', evidence: n ? `${n} menu items: ${list(f.navLabels)}` : 'No menu, which suits a single-offer page.' };
      if (n <= mid) return { status: 'warn', evidence: `${n} menu items: ${list(f.navLabels)}` };
      return { status: 'fail', evidence: `${n} menu items: ${list(f.navLabels)}` };
    },
  },
  {
    id: 'contact-route', pillar: 'action', title: 'An easy way to get in touch', weight: 5,
    impact: 'People who want to talk should be able to do it in a click, without hunting for a way.',
    fix: 'Add a booking link or short contact form near the top, and keep an email or phone number visible too.',
    run: (f) => {
      if (f.clientRendered) return { status: 'unknown', evidence: NO_SCRIPT };
      const r = f.contactRoutes;
      if (r.includes('booking') || r.includes('form') || r.includes('phone')) return { status: 'pass', evidence: `Ways to reach you: ${list(r)}` };
      if (r.length) return { status: 'warn', evidence: `Only: ${list(r)}. A booking link or form lets visitors act without leaving the page.` };
      return { status: 'fail', evidence: 'No booking link, form, phone number or email found.' };
    },
  },
  {
    id: 'short-forms', pillar: 'action', title: 'Forms ask for as little as possible', weight: 4,
    impact: 'Each extra field you ask for costs you some of the people who started to fill it in.',
    fix: 'Ask only for what you need to reply, usually name, email and one open question.',
    run: (f) => {
      if (f.clientRendered || f.formCount === 0 || f.maxFormFields === 0) return { status: 'na', evidence: '' };
      const ev = `Longest form has ${f.maxFormFields} fields.`;
      if (f.maxFormFields <= 3) return { status: 'pass', evidence: ev };
      if (f.maxFormFields <= 5) return { status: 'warn', evidence: ev };
      return { status: 'fail', evidence: ev };
    },
  },
];
