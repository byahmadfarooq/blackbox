import type { CheckDef } from './rubric';
import { q } from './rubric';

export const BASICS_CHECKS: CheckDef[] = [
  {
    id: 'title-tag', pillar: 'basics', title: 'A clear page title', weight: 3,
    impact: 'The title is what people see in search results and browser tabs.',
    fix: 'Write a title of about 30 to 60 characters that says what you do and your name.',
    run: (f) => {
      if (!f.title) return { status: 'fail', evidence: 'No page title.' };
      const n = f.title.length;
      if (n >= 20 && n <= 65) return { status: 'pass', evidence: q(f.title) };
      return { status: 'warn', evidence: `${q(f.title)} is ${n} characters.` };
    },
  },
  {
    id: 'meta-description', pillar: 'basics', title: 'A search description', weight: 2,
    impact: 'This is the summary shown under your link in search results.',
    fix: 'Write one or two sentences of about 70 to 160 characters describing the page.',
    run: (f) => {
      if (!f.metaDescription) return { status: 'fail', evidence: 'No description set.' };
      const n = f.metaDescription.length;
      if (n >= 70 && n <= 170) return { status: 'pass', evidence: `${n} characters.` };
      return { status: 'warn', evidence: `${n} characters.` };
    },
  },
  {
    id: 'mobile-ready', pillar: 'basics', title: 'Set up for phones', weight: 2,
    impact: 'Without this setting, phones show a shrunken desktop page.',
    fix: 'Add the viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1">.',
    run: (f) => (f.hasViewport ? { status: 'pass', evidence: 'Viewport setting found.' } : { status: 'fail', evidence: 'No viewport setting found.' }),
  },
  {
    id: 'social-preview', pillar: 'basics', title: 'A good link preview when shared', weight: 2,
    impact: 'When your link is shared, this controls the picture and title people see.',
    fix: 'Add Open Graph tags (og:title, og:image) so shared links show a proper card.',
    run: (f) => {
      if (f.ogImage && f.ogTitle) return { status: 'pass', evidence: 'Share image and title found.' };
      if (f.ogImage || f.ogTitle) return { status: 'warn', evidence: f.ogImage ? 'Image set, title missing.' : 'Title set, image missing.' };
      return { status: 'fail', evidence: 'No share preview set.' };
    },
  },
  {
    id: 'image-alt', pillar: 'basics', title: 'Images have descriptions', weight: 2,
    impact: 'Screen readers and search engines rely on image descriptions.',
    fix: 'Add a short alt description to each meaningful image. Use an empty alt for pure decoration.',
    run: (f) => {
      if (f.imgCount === 0) return { status: 'na', evidence: '' };
      const r = f.imgsMissingAlt / f.imgCount;
      const ev = `${f.imgsMissingAlt} of ${f.imgCount} images have no alt text.`;
      if (f.imgsMissingAlt === 0) return { status: 'pass', evidence: ev };
      if (r <= 0.2) return { status: 'warn', evidence: ev };
      return { status: 'fail', evidence: ev };
    },
  },
  {
    id: 'page-language', pillar: 'basics', title: 'Page language is set', weight: 1,
    impact: 'Screen readers use this to pronounce the page correctly.',
    fix: 'Add a lang attribute to the page, for example <html lang="en">.',
    run: (f) => (f.lang ? { status: 'pass', evidence: `Language: ${f.lang}` } : { status: 'warn', evidence: 'No language set.' }),
  },
  {
    id: 'indexable', pillar: 'basics', title: 'Search engines may list the page', weight: 1,
    impact: 'A noindex tag tells search engines to leave the page out of results.',
    fix: 'Remove the noindex tag if you want this page to be found in search.',
    run: (f) => (f.noindex ? { status: 'fail', evidence: 'The page tells search engines not to list it.' } : { status: 'pass', evidence: f.canonical ? 'Open to search, with a canonical address.' : 'Open to search.' }),
  },
  {
    id: 'accessible-names', pillar: 'basics', title: 'Links, buttons and fields have names', weight: 1,
    impact: 'Controls without a name cannot be used with a screen reader.',
    fix: 'Give icon-only links and buttons an aria-label, and label every form field.',
    run: (f) => {
      if (f.unnamedControls === 0) return { status: 'pass', evidence: 'Every link, button and field has a name.' };
      if (f.unnamedControls <= 3) return { status: 'warn', evidence: `${f.unnamedControls} without a name.` };
      return { status: 'fail', evidence: `${f.unnamedControls} without a name.` };
    },
  },
];
