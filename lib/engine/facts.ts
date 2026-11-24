import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';
import { calculateReadability, detectBuzzwords } from './research-metrics';

export interface Action {
  text: string;
  href: string;
  where: 'header' | 'hero' | 'body' | 'footer';
}

export interface FetchMeta {
  finalUrl: string;
  bytesOnWire: number;
  bytesDecoded: number;
  contentEncoding: string;
  ttfbMs: number;
  redirects: number;
}

export interface PageFacts {
  // page
  finalUrl: string;
  https: boolean;
  clientRendered: boolean;
  visibleWords: number;
  // headline and copy
  h1Texts: string[];
  h1Words: number;
  heroText: string;
  audienceHook: string;
  gradeLevel: number;
  buzzwordRatio: number;
  buzzwordsFound: string[];
  // actions
  actions: Action[];
  genericActions: string[];
  contactRoutes: string[];
  navLabels: string[];
  stickyHeader: 'yes' | 'unknown';
  formCount: number;
  maxFormFields: number;
  // proof
  resultSnippets: string[];
  testimonialCount: number;
  attributedTestimonials: number;
  logoCount: number;
  workLinks: number;
  hasRating: boolean;
  trust: { privacy: boolean; terms: boolean; about: boolean; social: boolean };
  // basics
  title: string;
  metaDescription: string;
  hasViewport: boolean;
  lang: string;
  noindex: boolean;
  canonical: boolean;
  ogImage: boolean;
  ogTitle: boolean;
  imgCount: number;
  imgsMissingAlt: number;
  unnamedControls: number;
  // speed
  htmlBytes: number;
  bytesOnWire: number;
  compressed: boolean;
  domNodes: number;
  scriptCount: number;
  blockingScripts: number;
  thirdPartyHosts: string[];
  imgsSized: number;
  ttfbMs: number;
}

const clean = (s?: string) => (s || '').replace(/\s+/g, ' ').trim();

const STRONG_ACTION =
  /\b(book (a |your |my |an? )?(free |quick |short )?(\d+[- ]?min\w* )?(call|demo|meeting|consult\w*|strategy|audit|intro|chat)|schedule (a |your |an? )?\w*\s?(call|demo|meeting|consult\w*)|get (a |your |my )?(free )?(quote|estimate|audit|demo|proposal|started|in touch|review)|request (a |your )?(free )?(quote|demo|proposal|audit|call|review)|start (a |your |my )?(free )?(trial|project|now|today)|try (it )?(for )?free|sign up|talk to (us|sales|an? \w+)|contact( us| me| sales)?|(message|email|call|text|dm) (us|me)\b|reach out|send (us|me) an? (message|email)|say (hi|hello)|let'?s (talk|chat|work)|work with (us|me)|hire (us|me)|free (audit|review|scan|consult\w*|trial|quote|check)|check (my|your) \w+|scan (my|your) \w+|get in touch|join (the )?(waitlist|now)|apply (now|today)?)\b/i;

const GENERIC_ACTION = /^(submit|learn more|read more|click here|more|go|send|continue|see more|find out more)$/i;

const AUDIENCE_HOOK =
  /\b(for|helps?|helping|built for|designed for|made for|serving)\s+(\w+\s){0,3}(teams?|founders?|agenc(?:y|ies)|startups?|business(?:es)?|owners?|clinics?|restaurants?|developers?|marketers?|brands?|compan(?:y|ies)|enterprises?|sellers?|stores?|shops?|professionals?|freelancers?|coaches|consultants?|b2b|saas|e-?commerce|dentists?|lawyers?|firms?|operators?|engineers?|creators?|customers?)\b/i;

const RESULT_CONTEXT =
  /(revenue|growth|grew|increase[ds]?|conversion|leads?|roi|saved|reduc\w+|clients?|customers?|users?|projects?|years?|booked|pipeline|traffic|sales|faster|more|orders?|calls?|downloads?|rating|retention|uptime|delivered|launched|shipped)/i;

export function analyze(html: string, meta: FetchMeta): PageFacts {
  const $ = cheerio.load(html);
  const hostOf = (u: string) => {
    try {
      return new URL(u).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  };
  const siteHost = hostOf(meta.finalUrl);
  const apex = siteHost.split('.').slice(-2).join('.');

  // ---------- scripts and styles (before we strip them) ----------
  const scripts = $('script').toArray();
  const hosts = new Set<string>();
  let blockingScripts = 0;
  for (const el of scripts) {
    const src = $(el).attr('src');
    if (!src) continue;
    const h = hostOf(new URL(src, meta.finalUrl).toString());
    if (h && !(h === siteHost || h.endsWith(`.${apex}`) || h === apex)) hosts.add(h);
    const inHead = $(el).parents('head').length > 0;
    if (inHead && !$(el).attr('async') && !$(el).attr('defer') && $(el).attr('type') !== 'module') blockingScripts++;
  }
  $('link[rel="stylesheet"][href]').each((_, el) => {
    const h = hostOf(new URL($(el).attr('href') as string, meta.finalUrl).toString());
    if (h && !(h === siteHost || h.endsWith(`.${apex}`) || h === apex)) hosts.add(h);
  });
  const inlineCss = $('style').text();
  const jsonLd = $('script[type="application/ld+json"]').text();
  const chatWidget = /(intercom|drift\.com|crisp\.chat|tawk\.to|livechat|tidio|hs-scripts|hubspot)/i.test($('script').toArray().map((e) => $(e).attr('src') || '').join(' '));

  const title = clean($('title').first().text());
  const metaDescription = clean($('meta[name="description"]').attr('content'));

  $('script, style, noscript, template, svg').remove();

  const bodyText = clean($('body').text());
  const visibleWords = bodyText ? bodyText.split(' ').length : 0;
  const emptyRoot = ['#root', '#app', '#__next', '#__nuxt'].some((s) => $(s).length > 0 && clean($(s).text()).length < 40);
  const clientRendered = visibleWords < 60 && (scripts.length >= 2 || emptyRoot);

  // ---------- regions ----------
  const headerEl = $('header, [role="banner"]').first();
  const footerEl = $('footer, [role="contentinfo"]').first();
  const h1El = $('h1').first();
  let heroEl: cheerio.Cheerio<AnyNode> = h1El;
  for (let i = 0; i < 3 && heroEl.length; i++) {
    const p = heroEl.parent();
    if (!p.length || p.is('body, main, html')) break;
    heroEl = p;
  }
  const where = (el: AnyNode): Action['where'] => {
    const $el = $(el);
    if (footerEl.length && $el.closest(footerEl).length) return 'footer';
    if (headerEl.length && $el.closest(headerEl).length) return 'header';
    if (heroEl.length && heroEl.is('div, section, header') && $el.closest(heroEl as never).length) return 'hero';
    return 'body';
  };

  // ---------- headline and hero copy ----------
  const h1Texts = $('h1').toArray().map((e) => {
    const c = $(e).clone();
    c.find('br').replaceWith(' ');
    return clean(c.text());
  }).filter(Boolean);
  const heroText = clean([h1Texts[0] || '', heroEl.find('p, h2').slice(0, 3).text()].join(' ')).slice(0, 600);
  const audienceHook = (heroText.match(AUDIENCE_HOOK) || [''])[0];

  const mainText = clean(($('main').length ? $('main') : $('body')).text()).slice(0, 2500);
  const readability = calculateReadability(mainText);
  const buzz = detectBuzzwords(mainText);

  // ---------- actions ----------
  const actions: Action[] = [];
  const genericActions: string[] = [];
  $('a[href], button, input[type="submit"]').each((_, el) => {
    const $el = $(el);
    const text = clean($el.text() || $el.attr('aria-label') || $el.attr('value') || '');
    if (!text || text.length > 60) return;
    const href = $el.attr('href') || '';
    const isButtonLike = $el.is('button, input') || /btn|button|cta/i.test($el.attr('class') || '') || $el.attr('role') === 'button';
    if (STRONG_ACTION.test(text)) actions.push({ text, href, where: where(el) });
    else if (isButtonLike && GENERIC_ACTION.test(text)) genericActions.push(text);
  });

  // ---------- contact routes ----------
  const routes = new Set<string>();
  if ($('a[href^="tel:"]').length) routes.add('phone');
  if ($('a[href^="mailto:"]').length) routes.add('email');
  if ($('a[href*="cal.com"], a[href*="calendly.com"], a[href*="tidycal.com"], a[href*="savvycal.com"], a[href*="/book"], a[href*="/schedule"], a[href*="meetings.hubspot.com"]').length) routes.add('booking');
  if ($('a[href*="wa.me"], a[href*="api.whatsapp.com"]').length) routes.add('whatsapp');
  if (chatWidget) routes.add('chat');

  // ---------- forms ----------
  const forms = $('form').toArray().filter((f) => $(f).attr('role') !== 'search');
  let maxFormFields = 0;
  let unlabeledFields = 0;
  for (const f of forms) {
    const fields = $(f).find('input, select, textarea').filter((_, i) => {
      const t = ($(i).attr('type') || 'text').toLowerCase();
      return !['hidden', 'submit', 'button', 'checkbox', 'radio', 'image'].includes(t);
    });
    maxFormFields = Math.max(maxFormFields, fields.length);
    fields.each((_, i) => {
      const $i = $(i);
      const id = $i.attr('id');
      const labeled = $i.attr('aria-label') || $i.attr('aria-labelledby') || $i.attr('title') || $i.closest('label').length || (id && $(`label[for="${id}"]`).length);
      if (!labeled) unlabeledFields++;
    });
  }
  if (forms.length && maxFormFields >= 1) routes.add('form');

  // ---------- navigation ----------
  const navRoot = ($('header nav').length ? $('header nav') : $('header').length ? $('header') : $('nav')).first();
  const navSet = new Set<string>();
  navRoot.find('a[href]').each((_, el) => {
    const $el = $(el);
    const text = clean($el.text());
    if (!text || STRONG_ACTION.test(text)) return;
    if ($el.find('img, svg').length && !text) return;
    if (/logo|brand/i.test($el.attr('class') || '')) return;
    if ($el.parents('[class*="dropdown" i], [class*="submenu" i], [class*="mega" i]').length) return;
    navSet.add(text.toLowerCase());
  });
  const navLabels = [...navSet].slice(0, 20);

  // ---------- sticky header hints (class names, inline style, inline css). We never claim "no". ----------
  const stickyClass = (headerEl.add(navRoot)).toArray().some((e) => /(^|\s)(sticky|fixed)(\s|$)/.test($(e).attr('class') || '') || /position:\s*(sticky|fixed)/i.test($(e).attr('style') || ''));
  const stickyCss = /(header|nav)[^{}]*\{[^}]*position:\s*(sticky|fixed)/i.test(inlineCss);
  const stickyHeader: PageFacts['stickyHeader'] = stickyClass || stickyCss ? 'yes' : 'unknown';

  // ---------- proof ----------
  const snippets: string[] = [];
  const resultRe = /(\$\s?\d[\d,.]*\s?(?:k|m|b|million|billion)?|\d[\d,.]*\s?(?:%|x\b|k\+?|m\+?|\+))/gi;
  const textForResults = mainText + ' ' + clean($('footer').text()).slice(0, 0);
  let m: RegExpExecArray | null;
  while ((m = resultRe.exec(textForResults)) && snippets.length < 8) {
    const around = textForResults.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40);
    if (RESULT_CONTEXT.test(around) && !/\/\s?(mo|month|yr|year)\b/i.test(around)) {
      snippets.push(clean(around).slice(0, 90));
    }
  }
  const resultSnippets = [...new Set(snippets)].slice(0, 6);

  const tBlocks = $('blockquote, [class*="testimonial" i], [itemprop="review"], [class*="review" i]').toArray()
    .filter((e) => clean($(e).text()).length >= 40);
  const testimonialCount = Math.min(tBlocks.length, 12);
  const attributedTestimonials = tBlocks.filter((e) => {
    const $e = $(e);
    return $e.find('cite, figcaption, footer').length > 0 || /[—–-]\s?[A-Z][a-z]+ [A-Z]/.test($e.text()) || /\b(ceo|founder|director|manager|head of|owner|cto|cmo|vp)\b/i.test($e.text());
  }).length;

  let logoCount = 0;
  $('[class*="logo" i], [class*="client" i], [class*="trusted" i], [class*="partner" i], [class*="customer" i], [id*="logos" i], [id*="clients" i]').each((_, el) => {
    const n = $(el).find('img').length;
    if (n >= 2 && n <= 24) logoCount = Math.max(logoCount, n);
  });
  const workLinks = $('a[href]').toArray().filter((e) => /(case[- ]stud|our work|portfolio|success stor|\/work\b|\/results)/i.test(`${$(e).attr('href')} ${$(e).text()}`)).length;
  const hasRating = /aggregateRating/.test(jsonLd) || /\b[1-5](\.\d)?\s?\/\s?5\b|★{3,}/.test(bodyText);

  const linkTexts = $('a[href]').toArray().map((e) => `${$(e).attr('href')} ${clean($(e).text())}`);
  const hasLink = (re: RegExp) => linkTexts.some((t) => re.test(t));
  const trust = {
    privacy: hasLink(/privacy/i),
    terms: hasLink(/terms|conditions/i),
    about: hasLink(/\babout\b|\bteam\b|our story/i),
    social: hasLink(/linkedin\.com|twitter\.com|x\.com\/|instagram\.com|github\.com|youtube\.com/i),
  };

  // ---------- basics and accessibility ----------
  const imgs = $('img').toArray();
  const imgsMissingAlt = imgs.filter((e) => $(e).attr('alt') === undefined && $(e).attr('role') !== 'presentation' && $(e).attr('aria-hidden') !== 'true').length;
  const imgsSized = imgs.filter((e) => ($(e).attr('width') && $(e).attr('height')) || /aspect-ratio|width:|height:/i.test($(e).attr('style') || '')).length;
  const unnamedLinks = $('a[href]').toArray().filter((e) => !clean($(e).text()) && !$(e).attr('aria-label') && !$(e).attr('title') && !$(e).find('img[alt]:not([alt=""])').length).length;
  const unnamedButtons = $('button').toArray().filter((e) => !clean($(e).text()) && !$(e).attr('aria-label') && !$(e).attr('title')).length;

  return {
    finalUrl: meta.finalUrl,
    https: meta.finalUrl.startsWith('https:'),
    clientRendered,
    visibleWords,
    h1Texts,
    h1Words: h1Texts[0] ? h1Texts[0].split(' ').length : 0,
    heroText,
    audienceHook,
    gradeLevel: readability.gradeLevel,
    buzzwordRatio: buzz.buzzwordRatio,
    buzzwordsFound: buzz.foundBuzzwords.slice(0, 6),
    actions,
    genericActions: [...new Set(genericActions)].slice(0, 4),
    contactRoutes: [...routes],
    navLabels,
    stickyHeader,
    formCount: forms.length,
    maxFormFields,
    resultSnippets,
    testimonialCount,
    attributedTestimonials,
    logoCount,
    workLinks,
    hasRating,
    trust,
    title,
    metaDescription,
    hasViewport: $('meta[name="viewport"]').length > 0,
    lang: clean($('html').attr('lang')),
    noindex: /noindex/i.test($('meta[name="robots"]').attr('content') || ''),
    canonical: $('link[rel="canonical"]').length > 0,
    ogImage: $('meta[property="og:image"]').length > 0,
    ogTitle: $('meta[property="og:title"]').length > 0,
    imgCount: imgs.length,
    imgsMissingAlt,
    unnamedControls: unnamedLinks + unnamedButtons + unlabeledFields,
    htmlBytes: meta.bytesDecoded,
    bytesOnWire: meta.bytesOnWire,
    compressed: /gzip|br|deflate/.test(meta.contentEncoding),
    domNodes: $('*').length,
    scriptCount: scripts.length,
    blockingScripts,
    thirdPartyHosts: [...hosts].slice(0, 12),
    imgsSized,
    ttfbMs: meta.ttfbMs,
  };
}
