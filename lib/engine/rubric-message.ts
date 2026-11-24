import type { CheckDef } from './rubric';
import { NO_SCRIPT, list, q } from './rubric';

export const MESSAGE_CHECKS: CheckDef[] = [
  {
    id: 'one-headline', pillar: 'message', title: 'One clear main headline', weight: 5,
    impact: 'The main headline is the first thing read. Without one, visitors cannot tell what the page is about.',
    fix: 'Use exactly one main headline (an H1) that states what you do.',
    run: (f) => {
      if (f.clientRendered) return { status: 'unknown', evidence: NO_SCRIPT };
      if (f.h1Texts.length === 1) return { status: 'pass', evidence: `Headline: ${q(f.h1Texts[0])}` };
      if (f.h1Texts.length === 0) return { status: 'fail', evidence: 'No main headline (H1) found.' };
      return { status: 'warn', evidence: `${f.h1Texts.length} main headlines compete: ${list(f.h1Texts.map((x) => q(x, 30)), 3)}` };
    },
  },
  {
    id: 'headline-length', pillar: 'message', title: 'A headline that is quick to read', weight: 3,
    impact: 'Long headlines get skimmed past, and very short ones can be too vague to mean anything.',
    fix: 'Aim for roughly 5 to 14 words that someone can take in at a glance.',
    run: (f) => {
      if (!f.h1Texts.length) return { status: 'unknown', evidence: 'No headline to measure.' };
      const w = f.h1Words;
      if (w >= 4 && w <= 14) return { status: 'pass', evidence: `${w} words.` };
      return { status: 'warn', evidence: `${w} words${w > 14 ? ', which is long' : ', which is very short'}.` };
    },
  },
  {
    id: 'headline-says-what', pillar: 'message', title: 'The headline says what you do', weight: 5,
    impact: 'A headline full of buzzwords or greetings leaves visitors guessing what you actually offer.',
    fix: 'Say what you do and for whom in plain words. Swap “solutions” and “innovative” for the real thing you deliver.',
    run: (f) => {
      if (!f.h1Texts.length) return { status: 'unknown', evidence: 'No headline to read.' };
      const h = f.h1Texts[0];
      if (/^(welcome|hello|hi\b|home\b|untitled)/i.test(h)) return { status: 'fail', evidence: `${q(h)} opens with a greeting, not an offer.` };
      if (f.buzzwordsFound.some((b) => h.toLowerCase().includes(b.toLowerCase()))) return { status: 'warn', evidence: `${q(h)} uses vague words.` };
      return { status: 'pass', evidence: q(h) };
    },
  },
  {
    id: 'who-its-for', pillar: 'message', title: 'It is clear who it is for', weight: 4, adjust: { PERSONAL_AUTHORITY: 2 },
    impact: 'Visitors decide in seconds whether a page is meant for them. Naming your audience helps the right ones stay.',
    fix: 'Add a short line near the headline naming who you help, such as “for local clinics” or “for B2B startups”.',
    run: (f) => {
      if (f.clientRendered) return { status: 'unknown', evidence: NO_SCRIPT };
      if (f.audienceHook) return { status: 'pass', evidence: `Opening text says: ${q(f.audienceHook, 60)}` };
      return { status: 'warn', evidence: 'The headline and intro do not name who the page is for.' };
    },
  },
  {
    id: 'reading-level', pillar: 'message', title: 'Easy reading level', weight: 3,
    impact: 'Text that is easy to read is understood faster by busy visitors.',
    fix: 'Use shorter sentences and everyday words. Aim for around school grade 8 to 9.',
    run: (f) => {
      if (f.visibleWords < 60) return { status: 'unknown', evidence: 'Not enough text to measure.' };
      const g = Math.round(f.gradeLevel);
      if (f.gradeLevel <= 9) return { status: 'pass', evidence: `About grade ${g}.` };
      if (f.gradeLevel <= 12) return { status: 'warn', evidence: `About grade ${g}.` };
      return { status: 'fail', evidence: `About grade ${g}, which is heavy for a landing page.` };
    },
  },
  {
    id: 'plain-words', pillar: 'message', title: 'Plain words, few buzzwords', weight: 2,
    impact: 'Buzzwords sound alike on every site and make claims harder to believe.',
    fix: 'Replace vague words with specifics: what you do, for whom, and what changes for them.',
    run: (f) => {
      if (f.visibleWords < 60) return { status: 'unknown', evidence: 'Not enough text to measure.' };
      const ev = f.buzzwordsFound.length ? `Found: ${list(f.buzzwordsFound)}` : 'No common buzzwords found.';
      if (f.buzzwordRatio <= 0.01) return { status: 'pass', evidence: ev };
      if (f.buzzwordRatio <= 0.025) return { status: 'warn', evidence: ev };
      return { status: 'fail', evidence: ev };
    },
  },
];
