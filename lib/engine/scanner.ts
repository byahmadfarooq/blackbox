import * as cheerio from 'cheerio';
import { RawTelemetryMetrics } from './types';
import { calculateReadability, detectBuzzwords } from './research-metrics';

export async function scanUrl(rawInputUrl: string): Promise<RawTelemetryMetrics> {
  let normalizedUrl = rawInputUrl.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  const parsedUrl = new URL(normalizedUrl);
  const domain = parsedUrl.hostname.replace(/^www\./, '');

  const startTime = Date.now();

  const response = await fetch(normalizedUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 (Blackbox Telemetry Probe; +https://blackbox-kaivex.vercel.app)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(10000),
  });

  const probeLatencyMs = Date.now() - startTime;
  const html = await response.text();
  const $ = cheerio.load(html);

  // Total DOM nodes count
  const totalDomNodes = $('*').length;

  // 1. H1 Analysis with <br> handling
  const h1Elements = $('h1');
  const h1Count = h1Elements.length;
  // Replace <br> tags with space so multi-line headlines don't concatenate words
  const clonedH1 = h1Elements.first().clone();
  clonedH1.find('br').replaceWith(' ');
  const primaryH1 = clonedH1.text().trim().replace(/\s+/g, ' ') || '';
  const h1WordCount = primaryH1 ? primaryH1.split(/\s+/).length : 0;

  // 2. ICP Qualifying Hook in Subhead / Hero
  const heroSubheads = $('h1 ~ p, h1 ~ h2, h2, header p, .hero p, [class*="hero"] p')
    .slice(0, 3)
    .text()
    .toLowerCase();

  const icpKeywordsList = [
    'for',
    'helps',
    'built for',
    'teams',
    'founders',
    'agencies',
    'b2b',
    'engineers',
    'operators',
    'startups',
    'companies',
    'enterprises',
    'businesses',
  ];

  const matchedIcpKeywords = icpKeywordsList.filter((kw) => heroSubheads.includes(kw));
  const hasIcpHook = matchedIcpKeywords.length > 0;

  // 3. CTA Buttons & Links (expanded for SaaS utilities and scan tools)
  const ctaRegex = /(book|demo|start|try|get|schedule|claim|talk|join|contact|hire|sign up|audit|scan|initiate|calculate|analyze|test|launch|explore|in touch)/i;
  let ctaCount = 0;
  let primaryCtaText = '';

  $('a, button, input[type="submit"]').each((_, el) => {
    const text = $(el).text().trim();
    const ariaLabel = $(el).attr('aria-label') || '';
    const val = $(el).attr('value') || '';
    const combined = `${text} ${ariaLabel} ${val}`;
    if (ctaRegex.test(combined)) {
      ctaCount++;
      if (!primaryCtaText && (text || val)) {
        primaryCtaText = (text || val).replace(/\s+/g, ' ').slice(0, 30);
      }
    }
  });

  // 4. Header Navigation: Filter out logo links and CTA buttons, counting only true navigation menu items
  let topLevelNavCount = 0;
  const headerLinks = $('header a, nav a, [role="banner"] a, .site-header a, .navbar a');

  const filteredNavLinks = headerLinks.filter((_, el) => {
    const $el = $(el);
    const href = $el.attr('href') || '';
    const text = $el.text().trim();
    const className = ($el.attr('class') || '') + ' ' + ($el.parent().attr('class') || '');
    const ariaLabel = $el.attr('aria-label') || '';

    // Ignore logo / home branding link
    const isLogo =
      /logo|brand/i.test(className) ||
      /logo/i.test(ariaLabel) ||
      ((href === '/' || href === '') && $el.find('svg, img').length > 0);
    if (isLogo) return false;

    // Ignore CTA action buttons located in header
    const isCtaButton =
      /btn|cta|button/i.test(className) ||
      ctaRegex.test(text);
    if (isCtaButton) return false;

    // Ignore hidden dropdown sub-items
    const parent = $el.parents();
    const isSubDropdown = parent.is('[class*="dropdown" i], [class*="submenu" i]');
    if (isSubDropdown) return false;

    // Must have readable text or title
    return text.length > 0;
  });

  if (filteredNavLinks.length > 0) {
    // Unique by text content
    const uniqueLinkTexts = new Set(filteredNavLinks.map((_, el) => $(el).text().trim().toLowerCase()).get());
    topLevelNavCount = uniqueLinkTexts.size;
  } else {
    // If no header links found, check fallback navigation items
    topLevelNavCount = 0;
  }

  // 5. Form Input Count & Interactive Tool Detection
  const formInputs = $(
    'form input:not([type="hidden"]):not([type="submit"]):not([type="checkbox"]), form select, form textarea'
  );
  const formInputCount = formInputs.length;

  const hasInteractiveTool =
    $('input[type="text"], input[type="url"], input[type="search"]').length > 0 &&
    /(scan|audit|search|calculate|check|generate|analyze|test)/i.test($('button, form').text());

  const hasGithubRepo = $('a[href*="github.com"]').length > 0;

  // Archetype classification
  const pageAllText = $('body').text().toLowerCase();
  let archetype: 'PRODUCT_SOFTWARE' | 'AGENCY_SERVICE' | 'GENERAL_B2B' = 'GENERAL_B2B';

  if (/(services|case-studies|portfolio|our work|hire us|client results)/i.test(pageAllText)) {
    archetype = 'AGENCY_SERVICE';
  } else if (hasInteractiveTool || hasGithubRepo || /(api|docs|pricing|sign up|dashboard|app|extension)/i.test(pageAllText)) {
    archetype = 'PRODUCT_SOFTWARE';
  }

  // 6. Persistent Navigation (Check classes, inline styles, embedded styles, and same-origin stylesheets)
  const headerHtml = $('header, nav, [role="banner"], .site-header, .navbar').prop('outerHTML') || '';
  const inlineStyles = $('header, nav, [role="banner"], .site-header, .navbar').attr('style') || '';
  let embeddedStyles = $('style').text();

  // Inspect up to 2 same-origin stylesheets for sticky/fixed header rules
  const stylesheets = $('link[rel="stylesheet"]')
    .map((_, el) => $(el).attr('href'))
    .get()
    .filter((h): h is string => Boolean(h && (!h.startsWith('http') || h.startsWith(parsedUrl.origin))))
    .slice(0, 2);

  for (const sheetHref of stylesheets) {
    try {
      const fullSheetUrl = new URL(sheetHref, parsedUrl.origin).toString();
      const cssRes = await fetch(fullSheetUrl, { signal: AbortSignal.timeout(1200) });
      const cssText = await cssRes.text();
      embeddedStyles += ' ' + cssText;
    } catch {
      // Non-critical stylesheet fetch timeout
    }
  }

  let hasPersistentNav =
    /fixed|sticky/i.test(headerHtml) ||
    /position:\s*(fixed|sticky)/i.test(inlineStyles) ||
    /(site-header|navbar|header|nav)\s*\{[^}]*position:\s*(fixed|sticky)/i.test(embeddedStyles) ||
    /fixed|sticky|backdrop-blur|top-0/i.test(headerHtml);

  // 7. Text analysis for Readability & Buzzwords
  // Clone body and remove non-content elements (scripts, styles, SVGs, code, pre, noscript)
  const contentBody = $('body').clone();
  contentBody.find('script, style, svg, noscript, iframe, code, pre').remove();

  // Add block boundary spacing so lists, headings, and paragraphs are evaluated with proper sentence cadence
  contentBody.find('p, li, h1, h2, h3, h4, h5, h6, dt, dd, td, th, blockquote, br').each((_, el) => {
    $(el).append('. ');
  });

  const pageBodyText = contentBody.text().replace(/\s+/g, ' ').trim();
  const readability = calculateReadability(pageBodyText);
  const buzzwords = detectBuzzwords(pageBodyText);

  // 8. Quantified Commercial Metrics Regex
  const metricRegex = /(\$[0-9]+(\.[0-9]+)?([kmbKMB])?|\b[0-9]+(\.[0-9]+)?%|\b[0-9]+(\.[0-9]+)?x\b|\b[0-9]{2,}\+)/g;
  const rawMetricMatches = pageBodyText.match(metricRegex) || [];
  const uniqueMetrics = Array.from(new Set(rawMetricMatches)).slice(0, 6);
  const hasSpecificNumbers = uniqueMetrics.some((m) => /\.[0-9]|,[0-9]{3}/.test(m));

  // 9. Client Logos, Partner Badges & Portfolio Assets
  let verifiedProofCount = 0;
  let portfolioCount = 0;

  $('img, svg').each((_, el) => {
    const src = $(el).attr('src') || '';
    const alt = $(el).attr('alt') || '';
    const parentContainer = $(el).closest(
      '[id*="partner" i], [id*="client" i], [id*="portfolio" i], [class*="partner" i], [class*="portfolio" i], [class*="client" i], [class*="logo" i], [class*="brand" i], [class*="trusted" i], [class*="case" i]'
    );

    const isClientProof =
      /partner|client|brand|customer|trusted|sponsor|logo/i.test(src) ||
      /partner|client|brand|customer|trusted|sponsor|logo/i.test(alt) ||
      parentContainer.length > 0;

    const isPortfolio = /portfolio|work|case-study|project/i.test(src) || /portfolio|case-study/i.test(alt);

    if (isClientProof) verifiedProofCount++;
    if (isPortfolio) portfolioCount++;
  });

  // 10. Video & Showreel Detection
  const hasShowreel =
    $('video').length > 0 ||
    $('iframe[src*="youtube" i], iframe[src*="vimeo" i], iframe[src*="wistia" i]').length > 0 ||
    $('[class*="showreel" i], [class*="reel" i], [id*="showreel" i]').length > 0;

  // 11. Testimonial / Review Evidence
  const testimonialElements = $(
    'blockquote, [class*="testimonial" i], [class*="review" i], [class*="quote" i], [id*="testimonial" i]'
  );
  const testimonialCount = testimonialElements.length;

  // 12. Third-Party Tracking Scripts
  const trackerSignatures: Record<string, RegExp> = {
    'Google Tag Manager': /googletagmanager\.com\/gtm\.js/i,
    'Google Analytics': /google-analytics\.com|googletagmanager\.com\/gtag\/js/i,
    Hotjar: /hotjar\.com|static\.hotjar\.com/i,
    Intercom: /widget\.intercom\.io/i,
    HubSpot: /js\.hs-scripts\.com|track\.hubspot\.com/i,
    'Meta Pixel': /connect\.facebook\.net/i,
    FullStory: /fullstory\.com/i,
    Segment: /cdn\.segment\.com/i,
    Amplitude: /cdn\.amplitude\.com/i,
    Mixpanel: /cdn\.mxpnl\.com/i,
    CrazyEgg: /crazyegg\.com/i,
    'Microsoft Clarity': /clarity\.ms/i,
  };

  const detectedTrackers: string[] = [];
  const scriptTags = $('script[src]');
  let externalScriptCount = 0;

  scriptTags.each((_, el) => {
    const src = $(el).attr('src') || '';
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
      externalScriptCount++;
      for (const [name, regex] of Object.entries(trackerSignatures)) {
        if (regex.test(src) && !detectedTrackers.includes(name)) {
          detectedTrackers.push(name);
        }
      }
    }
  });

  // 13. Viewport & OpenGraph
  const hasViewportMeta = $('meta[name="viewport"]').length > 0;
  const ogTitle = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
  const ogDescription =
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    '';
  const ogImage = $('meta[property="og:image"]').attr('content') || '';
  const hasOgImage = Boolean(ogImage && !ogImage.includes('default') && !ogImage.includes('placeholder'));

  return {
    targetUrl: normalizedUrl,
    domain,
    probeLatencyMs,
    statusCode: response.status,
    archetype,
    hasInteractiveTool,
    hasGithubRepo,
    h1Count,
    primaryH1,
    h1WordCount,
    hasIcpHook,
    icpHookKeywords: matchedIcpKeywords,
    ctaCount,
    primaryCtaText: primaryCtaText || 'Action Button',
    heroNavLinksCount: topLevelNavCount,
    formInputCount,
    hasPersistentNav,
    quantifiedMetricsFound: uniqueMetrics,
    hasSpecificNumbers,
    clientLogoCount: verifiedProofCount,
    portfolioItemCount: portfolioCount,
    hasShowreel,
    testimonialCount,
    thirdPartyScriptCount: externalScriptCount,
    detectedTrackers,
    totalDomNodes,
    hasViewportMeta,
    hasOgImage,
    ogTitle: ogTitle.slice(0, 70),
    ogDescription: ogDescription.slice(0, 150),
    readability,
    buzzwords,
  };
}
