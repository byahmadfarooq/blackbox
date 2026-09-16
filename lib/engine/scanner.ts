import * as cheerio from 'cheerio';
import { ArchetypeCalibration, PageArchetype, RawTelemetryMetrics } from './types';
import { calculateReadability, detectBuzzwords } from './research-metrics';

export async function scanUrl(rawInputUrl: string, manualArchetype?: PageArchetype): Promise<RawTelemetryMetrics> {
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

  // Extended asset indicators
  const hasSubstackOrBlog = $('a[href*="substack.com"], a[href*="medium.com"], a[href*="/blog"], a[href*="/insights"], a[href*="/writing"], a[href*="/teardowns"], a[href*="/behind-the-build"]').length > 0;
  const hasShippedProjects = $('a[href*="github.com"], a[href*="#projects"], [class*="project" i], [class*="portfolio" i], [id*="project" i]').length > 0 || /view live project|live demo|view project|case study/i.test($('a, button').text());
  const hasDirectBooking = $('a[href*="/book"], a[href*="cal.com"], a[href*="calendly.com"], a[href*="tidycal.com"]').length > 0 || /book a call|book a strategy call|schedule a call/i.test($('a, button').text());


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

  // 14. Deterministic Multi-Archetype Fingerprinting
  const pageAllText = $('body').text().toLowerCase();
  const metaContent = `${$('title').text()} ${$('meta[name="description"]').attr('content') || ''}`.toLowerCase();
  const fullCorpus = `${metaContent} ${pageAllText}`;

  const detectedSignals: string[] = [];
  let agencyScore = 0;
  let personalScore = 0;
  let saasScore = 0;
  let funnelScore = 0;

  const hasSubstack = $('a[href*="substack.com"], a[href*="medium.com"]').length > 0;

  // Personal Authority indicators (First-person singular voice)
  const hasPersonalVoice = /\b(i am|i build|i help|about me|solo builder|solo founder|full-stack builder|my work|my projects|my writings|behind the build|independent consultant|fractional cto|portfolio of)\b/i.test(fullCorpus);
  const hasPersonalBio =
    $('img[src*="profile" i], img[src*="avatar" i], [class*="bio" i], [class*="author" i]').length > 0 ||
    /\b(about me|who i am|solo builder|solo founder)\b/i.test(fullCorpus);

  if (hasPersonalVoice) {
    personalScore += 6;
    detectedSignals.push('Solo Builder / Personal Voice');
  }
  if (hasPersonalBio) {
    personalScore += 3;
    detectedSignals.push('Personal Founder Identity Verified');
  }
  if (hasSubstack) {
    personalScore += 3;
    detectedSignals.push('Independent Publishing & Substack Hub');
  }
  if (hasShippedProjects && hasDirectBooking && hasPersonalVoice) {
    personalScore += 3;
    detectedSignals.push('Shipped Deliverables & Direct Consultative Path');
  }

  // Agency & Studio indicators (First-person plural voice & studio assets)
  const hasAgencyVoice = /\b(our team|we build|we design|our services|digital agency|software development agency|creative studio|our clients|hire us|client partners|our work|request a quote|who we are|what we do|client results)\b/i.test(fullCorpus);

  if (hasAgencyVoice) {
    agencyScore += 6;
    detectedSignals.push('Agency & Studio Service Structure');
  }
  if (hasShowreel) {
    agencyScore += 4;
    detectedSignals.push('Video Showreel / Production Assets');
  }
  if (verifiedProofCount >= 3) {
    agencyScore += 4;
    detectedSignals.push('Multiple Partner Proof Assets');
  }
  if (portfolioCount >= 2) {
    agencyScore += 3;
    detectedSignals.push('Client Case Study Portfolio');
  }

  // B2B SaaS indicators
  if (hasInteractiveTool) {
    saasScore += 8;
    detectedSignals.push('Interactive Functional Utility / Sandbox');
  }
  if (/(sign up free|start free trial|get started free|pricing|docs|documentation|api reference|dashboard|integrations|install )/i.test(fullCorpus)) {
    saasScore += 4;
    detectedSignals.push('Self-Serve Software & Developer Architecture');
  }
  if (hasGithubRepo) {
    saasScore += 3;
    detectedSignals.push('Public Codebase & Open-Source Receipts');
  }

  // Single-Offer Funnel indicators
  if (topLevelNavCount <= 2 && ctaCount >= 1) {
    funnelScore += 3;
    detectedSignals.push('Distraction-Free Direct Action Flow');
  }
  if (/(limited spots|guarantee|one-time investment|special offer|claim your spot|order now|reserve now|money-back)/i.test(fullCorpus)) {
    funnelScore += 4;
    detectedSignals.push('Single High-Ticket Offer Anchors');
  }
  if ($('form').length === 1 && topLevelNavCount <= 1 && !hasInteractiveTool) {
    funnelScore += 3;
    detectedSignals.push('Singular Lead Squeeze Architecture');
  }

  let computedArchetype: PageArchetype = 'B2B_SAAS_TOOL';

  if (manualArchetype) {
    computedArchetype = manualArchetype;
  } else {
    if (hasInteractiveTool && saasScore >= 8) {
      computedArchetype = 'B2B_SAAS_TOOL';
    } else if (agencyScore > personalScore && agencyScore >= 6) {
      computedArchetype = 'AGENCY_STUDIO';
    } else if (personalScore > agencyScore && personalScore >= 6) {
      computedArchetype = 'PERSONAL_AUTHORITY';
    } else if (funnelScore >= 6 && funnelScore > saasScore) {
      computedArchetype = 'SINGLE_OFFER_FUNNEL';
    } else if (saasScore >= 5) {
      computedArchetype = 'B2B_SAAS_TOOL';
    } else if (agencyScore >= 5) {
      computedArchetype = 'AGENCY_STUDIO';
    } else if (personalScore >= 5) {
      computedArchetype = 'PERSONAL_AUTHORITY';
    } else if (funnelScore >= 5) {
      computedArchetype = 'SINGLE_OFFER_FUNNEL';
    } else {
      const candidates = [
        { type: 'AGENCY_STUDIO' as PageArchetype, score: agencyScore },
        { type: 'PERSONAL_AUTHORITY' as PageArchetype, score: personalScore },
        { type: 'B2B_SAAS_TOOL' as PageArchetype, score: saasScore },
        { type: 'SINGLE_OFFER_FUNNEL' as PageArchetype, score: funnelScore },
      ];
      candidates.sort((a, b) => b.score - a.score);
      computedArchetype = candidates[0].score > 0 ? candidates[0].type : 'B2B_SAAS_TOOL';
    }
  }

  const calibrationConfigs: Record<PageArchetype, { label: string; benchmarkStandard: string; description: string }> = {
    AGENCY_STUDIO: {
      label: 'AGENCY & STUDIO HUB',
      benchmarkStandard: "Miller's Cognitive Chunking Law (7 +/- 2) & NN/g B2B Service Hierarchy",
      description: 'Calibrated for multi-service consultative agencies. Evaluates work portfolios, showreels, client outcomes, and consultative booking paths.',
    },
    PERSONAL_AUTHORITY: {
      label: 'PERSONAL BRAND & BUILDER PORTFOLIO',
      benchmarkStandard: 'Solo Builder Authority & Shipped Deliverables Benchmark',
      description: 'Calibrated for independent founders, fractional strategists, and technical consultants. Evaluates shipped projects, thought leadership, and high-trust advisory paths.',
    },
    B2B_SAAS_TOOL: {
      label: 'B2B SAAS & PRODUCT UTILITY',
      benchmarkStandard: 'Product-Led Growth (PLG) & Developer Self-Serve Benchmark',
      description: 'Calibrated for software applications and web utilities. Evaluates immediate interactive sandboxes, friction-free trial access, and technical documentation.',
    },
    SINGLE_OFFER_FUNNEL: {
      label: 'SINGLE-OFFER CONVERSION FUNNEL',
      benchmarkStandard: 'CXL Distraction-Free Paid Funnel Standard',
      description: 'Calibrated for dedicated paid ad landing pages and single high-ticket offers. Evaluates zero-leak navigation, immediate message-match, and singular CTA focus.',
    },
  };

  const currentConfig = calibrationConfigs[computedArchetype];
  const archetypeCalibration: ArchetypeCalibration = {
    archetype: computedArchetype,
    label: currentConfig.label,
    benchmarkStandard: currentConfig.benchmarkStandard,
    description: currentConfig.description,
    detectedSignals: detectedSignals.slice(0, 4),
    isManualOverride: Boolean(manualArchetype),
  };

  return {
    targetUrl: normalizedUrl,
    domain,
    probeLatencyMs,
    statusCode: response.status,
    archetype: computedArchetype,
    archetypeCalibration,
    hasInteractiveTool,
    hasGithubRepo,
    hasSubstackOrBlog,
    hasShippedProjects,
    hasDirectBooking,
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
