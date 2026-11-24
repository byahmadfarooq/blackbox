import type { CheckDef } from './rubric';
import { NO_SCRIPT, kb, list, q } from './rubric';

export const PROOF_CHECKS: CheckDef[] = [
  {
    id: 'real-results', pillar: 'proof', title: 'Real results with numbers', weight: 8, adjust: { PERSONAL_AUTHORITY: 5 },
    impact: 'Claims are easy to make. Specific results from real work are what people believe.',
    fix: 'Show real results you can stand behind: a named client outcome, a before-and-after, or a count of projects delivered. If you do not have numbers yet, show real work instead and never make figures up.',
    run: (f) => {
      if (f.clientRendered) return { status: 'unknown', evidence: NO_SCRIPT };
      const n = f.resultSnippets.length;
      if (n >= 3) return { status: 'pass', evidence: `Found ${n}, for example ${q(f.resultSnippets[0], 60)}` };
      if (n >= 1) return { status: 'warn', evidence: `Found ${n}: ${q(f.resultSnippets[0], 60)}` };
      return { status: 'fail', evidence: 'No measurable results found on the page.' };
    },
  },
  {
    id: 'testimonials', pillar: 'proof', title: 'Customer quotes with names', weight: 6, adjust: { PERSONAL_AUTHORITY: 3 },
    impact: 'A quote from a named person is proof. An anonymous one reads like marketing.',
    fix: 'Add two or three real quotes with the person’s name, role and company, with their permission.',
    run: (f) => {
      if (f.clientRendered) return { status: 'unknown', evidence: NO_SCRIPT };
      if (f.attributedTestimonials >= 2) return { status: 'pass', evidence: `${f.attributedTestimonials} quotes with a name or role.` };
      if (f.testimonialCount >= 1) return { status: 'warn', evidence: `${f.testimonialCount} quote(s) found, but few with a name or role.` };
      return { status: 'fail', evidence: 'No customer quotes found.' };
    },
  },
  {
    id: 'clients-or-work', pillar: 'proof', title: 'Client logos or real work to look at', weight: 5,
    impact: 'Seeing who you have worked with, or the work itself, lowers the risk of choosing you.',
    fix: 'Add a row of client logos you have permission to use, or link to two or three case studies.',
    run: (f) => {
      if (f.clientRendered) return { status: 'unknown', evidence: NO_SCRIPT };
      const logos = f.logoCount >= 3;
      const work = f.workLinks >= 2;
      if (logos || work) return { status: 'pass', evidence: [logos ? `${f.logoCount} logos` : '', f.workLinks ? `${f.workLinks} work or case-study links` : ''].filter(Boolean).join(', ') + '.' };
      if (f.logoCount || f.workLinks) return { status: 'warn', evidence: `${f.logoCount} logo(s), ${f.workLinks} work link(s).` };
      return { status: 'fail', evidence: 'No client logos or links to past work found.' };
    },
  },
  {
    id: 'trust-basics', pillar: 'proof', title: 'The basics that make a site feel real', weight: 3,
    impact: 'Privacy and terms pages, an about page and a way to reach a real person signal that a business is legitimate.',
    fix: 'Add links in the footer to your privacy policy, terms, about page and social profiles.',
    run: (f) => {
      if (f.clientRendered) return { status: 'unknown', evidence: NO_SCRIPT };
      const have = [f.trust.privacy && 'privacy', f.trust.terms && 'terms', f.trust.about && 'about', f.trust.social && 'social links', f.contactRoutes.length > 0 && 'contact'].filter(Boolean) as string[];
      if (have.length >= 4) return { status: 'pass', evidence: `Found: ${list(have, 5)}` };
      if (have.length >= 2) return { status: 'warn', evidence: `Found: ${list(have, 5)}` };
      return { status: 'fail', evidence: have.length ? `Only found: ${list(have)}` : 'None of privacy, terms, about, social or contact found.' };
    },
  },
  {
    id: 'light-page', pillar: 'speed', title: 'A light page', weight: 3,
    impact: 'Heavy pages load slowly, especially on phones, and slow pages lose visitors.',
    fix: 'Trim unused code and large embeds. Aim for a page that is simple to load.',
    run: (f) => {
      const ev = `Page code is ${kb(f.htmlBytes)} with ${f.domNodes} elements.`;
      if (f.htmlBytes <= 150 * 1024 && f.domNodes <= 1500) return { status: 'pass', evidence: ev };
      if (f.htmlBytes <= 400 * 1024 && f.domNodes <= 3000) return { status: 'warn', evidence: ev };
      return { status: 'fail', evidence: ev };
    },
  },
  {
    id: 'few-third-parties', pillar: 'speed', title: 'Few outside scripts', weight: 4,
    impact: 'Each outside service your page loads adds delay and another thing that can break or track visitors.',
    fix: 'Remove tools you no longer use and load the rest only where they are needed.',
    run: (f) => {
      const n = f.thirdPartyHosts.length;
      const ev = n ? `${n} outside hosts: ${list(f.thirdPartyHosts, 4)}` : 'No outside scripts or styles found.';
      if (n <= 3) return { status: 'pass', evidence: ev };
      if (n <= 6) return { status: 'warn', evidence: ev };
      return { status: 'fail', evidence: ev };
    },
  },
  {
    id: 'no-blocking-scripts', pillar: 'speed', title: 'Scripts do not hold up the page', weight: 3,
    impact: 'Scripts that load before the page is shown make visitors wait looking at a blank screen.',
    fix: 'Add “defer” or “async” to scripts in the page head, or move them to the end of the page.',
    run: (f) => {
      const n = f.blockingScripts;
      const ev = n ? `${n} script(s) in the head block the page from showing.` : 'No blocking scripts in the head.';
      if (n === 0) return { status: 'pass', evidence: ev };
      if (n <= 2) return { status: 'warn', evidence: ev };
      return { status: 'fail', evidence: ev };
    },
  },
  {
    id: 'images-sized', pillar: 'speed', title: 'Images have set sizes', weight: 2,
    impact: 'Images without a set size make the page jump around as it loads.',
    fix: 'Give every image a width and height so the browser can reserve space for it.',
    run: (f) => {
      if (f.imgCount === 0) return { status: 'na', evidence: '' };
      const r = f.imgsSized / f.imgCount;
      const ev = `${f.imgsSized} of ${f.imgCount} images have a set size.`;
      if (r >= 0.8) return { status: 'pass', evidence: ev };
      if (r >= 0.5) return { status: 'warn', evidence: ev };
      return { status: 'fail', evidence: ev };
    },
  },
  {
    id: 'compressed', pillar: 'speed', title: 'Page is compressed for sending', weight: 2,
    impact: 'Compression makes the page download several times smaller.',
    fix: 'Turn on gzip or Brotli compression on your host. Most hosts have a setting for it.',
    run: (f) => (f.compressed ? { status: 'pass', evidence: `Sent as ${kb(f.bytesOnWire)} on the wire.` } : { status: 'fail', evidence: 'The page was sent uncompressed.' }),
  },
];
