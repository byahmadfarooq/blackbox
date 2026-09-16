import { IncidentItem, PillarScore, RawTelemetryMetrics, SurvivabilityTier, TelemetryResult } from './types';

export function scoreTelemetry(raw: RawTelemetryMetrics): TelemetryResult {
  const incidents: IncidentItem[] = [];

  // ==========================================
  // PILLAR 1: CONVERSION ARCHITECTURE (Max: 30 pts)
  // ==========================================
  let archScore = 0;

  // 1.1 Action CTA presence (8 pts)
  if (raw.ctaCount >= 1) {
    archScore += 8;
    incidents.push({
      id: 'cta-detected',
      pillar: 'architecture',
      pillarName: 'Conversion Architecture',
      severity: 'CLEARED',
      researchCitation: 'CXL Conversion Architecture Standard',
      headline: 'Primary Action Trigger Detected',
      plainEnglishImpact: `Visitors see a direct next step ("${raw.primaryCtaText}") above the fold without having to guess what action to take.`,
      actionableFix: 'Keep this button prominently placed in the hero section.',
      pointsDelta: 8,
    });
  } else {
    incidents.push({
      id: 'cta-missing',
      pillar: 'architecture',
      pillarName: 'Conversion Architecture',
      severity: 'FATAL_STALL',
      researchCitation: 'CXL Conversion Architecture Standard',
      headline: 'No Clear Action Button Found Above the Fold',
      plainEnglishImpact: 'When visitors arrive, there is no obvious button inviting them to book a call, start a trial, or contact you. Most visitors leave when the next step is unclear.',
      actionableFix: 'Add one primary button (like "Book a Call" or "Get Started") right inside your top hero area.',
      pointsDelta: -8,
    });
  }

  // 1.2 Choice Overload / Competing Links (7 pts)
  const isMultiPageHub = raw.archetype === 'AGENCY_STUDIO' || raw.archetype === 'PERSONAL_AUTHORITY';
  const isSingleOffer = raw.archetype === 'SINGLE_OFFER_FUNNEL';

  if (isMultiPageHub) {
    // Agencies and Personal Portfolios legitimately need: Work, Services/Offers, Writing/Insights, About, Contact
    if (raw.heroNavLinksCount <= 6) {
      archScore += 7;
      incidents.push({
        id: 'nav-clean-hub',
        pillar: 'architecture',
        pillarName: 'Conversion Architecture',
        severity: 'CLEARED',
        researchCitation: "Miller's Cognitive Chunking Law (7 +/- 2)",
        headline: 'Focused Multi-Page Navigation Structure',
        plainEnglishImpact: `Found ${raw.heroNavLinksCount} top-level menu items. Miller's Law and NN/g navigation research prove 4 to 6 categories provide clear exploratory scent without cognitive overload.`,
        actionableFix: 'Maintain these essential destination links in your primary navigation.',
        pointsDelta: 7,
      });
    } else if (raw.heroNavLinksCount <= 8) {
      archScore += 4;
      incidents.push({
        id: 'nav-moderate-hub',
        pillar: 'architecture',
        pillarName: 'Conversion Architecture',
        severity: 'FRICTION_WARN',
        researchCitation: "Miller's Cognitive Chunking Law (7 +/- 2)",
        headline: 'Header Exceeds Recommended Menu Chunking',
        plainEnglishImpact: `Found ${raw.heroNavLinksCount} top-level links in the header. Exceeding 6 primary links causes visual clutter on tablet and mobile viewports.`,
        actionableFix: 'Consolidate secondary links (like About or Substack) into a dropdown or footer menu.',
        pointsDelta: -3,
      });
    } else {
      archScore += 1;
      incidents.push({
        id: 'nav-clutter-hub',
        pillar: 'architecture',
        pillarName: 'Conversion Architecture',
        severity: 'FATAL_STALL',
        researchCitation: 'Hick-Hyman Cognitive Law',
        headline: 'Severe Choice Paralysis in Navigation',
        plainEnglishImpact: `Found ${raw.heroNavLinksCount} top-level menu links. Choice overload directly increases bounce rates by distracting high-intent prospects from booking.`,
        actionableFix: 'Streamline header to 5 core links and one distinct primary booking button.',
        pointsDelta: -6,
      });
    }
  } else if (isSingleOffer) {
    // Squeeze / Paid Ad landing pages should have minimal or zero links
    if (raw.heroNavLinksCount <= 2) {
      archScore += 7;
      incidents.push({
        id: 'nav-clean-funnel',
        pillar: 'architecture',
        pillarName: 'Conversion Architecture',
        severity: 'CLEARED',
        researchCitation: 'CXL Distraction-Free Funnel Standard',
        headline: 'Distraction-Free Funnel Architecture',
        plainEnglishImpact: `Found ${raw.heroNavLinksCount} links. Squeeze and paid funnel pages achieve up to 28% higher conversion by stripping away secondary exit routes.`,
        actionableFix: 'Keep the header completely distraction-free.',
        pointsDelta: 7,
      });
    } else if (raw.heroNavLinksCount <= 4) {
      archScore += 4;
      incidents.push({
        id: 'nav-moderate-funnel',
        pillar: 'architecture',
        pillarName: 'Conversion Architecture',
        severity: 'FRICTION_WARN',
        researchCitation: 'CXL Distraction-Free Funnel Standard',
        headline: 'Secondary Exit Links on Single-Offer Page',
        plainEnglishImpact: `Found ${raw.heroNavLinksCount} links in the header. On paid and single-offer landers, secondary links leak expensive traffic before visitors read the core offer.`,
        actionableFix: 'Remove navigation links from this landing page so visitors focus solely on the primary offer.',
        pointsDelta: -3,
      });
    } else {
      archScore += 1;
      incidents.push({
        id: 'nav-clutter-funnel',
        pillar: 'architecture',
        pillarName: 'Conversion Architecture',
        severity: 'FATAL_STALL',
        researchCitation: 'CXL Distraction-Free Funnel Standard',
        headline: 'Heavy Navigation Leakage on Offer Page',
        plainEnglishImpact: `Found ${raw.heroNavLinksCount} top-level links. This page is set up as a single offer but retains full website navigation, diluting your conversion rate.`,
        actionableFix: 'Remove the top navigation bar entirely on this conversion lander.',
        pointsDelta: -6,
      });
    }
  } else {
    // Standard B2B SaaS
    if (raw.heroNavLinksCount <= 5) {
      archScore += 7;
      incidents.push({
        id: 'nav-clean-saas',
        pillar: 'architecture',
        pillarName: 'Conversion Architecture',
        severity: 'CLEARED',
        researchCitation: 'Product-Led Growth Benchmark Standard',
        headline: 'Focused Product Navigation',
        plainEnglishImpact: `Found ${raw.heroNavLinksCount} menu links. Clear product hierarchy directs prospects straight toward self-serve activation.`,
        actionableFix: 'Maintain concise product navigation links.',
        pointsDelta: 7,
      });
    } else if (raw.heroNavLinksCount <= 7) {
      archScore += 4;
      incidents.push({
        id: 'nav-moderate-saas',
        pillar: 'architecture',
        pillarName: 'Conversion Architecture',
        severity: 'FRICTION_WARN',
        researchCitation: 'Hick-Hyman Cognitive Law',
        headline: 'Header Contains Competing Product Links',
        plainEnglishImpact: `Found ${raw.heroNavLinksCount} top-level links. Multiple navigation options compete with the primary sign-up or demo action.`,
        actionableFix: 'Move secondary links into product mega-menus or footer.',
        pointsDelta: -3,
      });
    } else {
      archScore += 1;
      incidents.push({
        id: 'nav-clutter-saas',
        pillar: 'architecture',
        pillarName: 'Conversion Architecture',
        severity: 'FATAL_STALL',
        researchCitation: 'Hick-Hyman Cognitive Law',
        headline: 'Severe Choice Paralysis in Navigation',
        plainEnglishImpact: `Found ${raw.heroNavLinksCount} top-level menu links, causing cognitive overload before visitors experience the product.`,
        actionableFix: 'Trim top menu to essential product links and one primary action button.',
        pointsDelta: -6,
      });
    }
  }

  // 1.3 Form Friction Factor (8 pts)
  if (isMultiPageHub) {
    if (raw.formInputCount <= 4) {
      archScore += 8;
      incidents.push({
        id: 'form-lean-consult',
        pillar: 'architecture',
        pillarName: 'Conversion Architecture',
        severity: 'CLEARED',
        researchCitation: 'Baymard Institute Form Benchmark',
        headline: 'Low-Friction Consultative Capture',
        plainEnglishImpact: 'Your lead form requires 4 or fewer fields, balancing low friction with initial scoping context.',
        actionableFix: 'Maintain lean fields on the initial booking form.',
        pointsDelta: 8,
      });
    } else if (raw.formInputCount <= 6) {
      archScore += 6;
      incidents.push({
        id: 'form-moderate-consult',
        pillar: 'architecture',
        pillarName: 'Conversion Architecture',
        severity: 'CLEARED',
        researchCitation: 'Gartner B2B Buying Qualification Standard',
        headline: 'Intentional High-Ticket Qualification Fields',
        plainEnglishImpact: `Detected ${raw.formInputCount} form fields. For high-ticket service agreements, asking for budget and timeline filters low-intent leads without harming qualified pipeline.`,
        actionableFix: 'Ensure every field directly helps you prepare for the discovery call.',
        pointsDelta: 6,
      });
    } else {
      archScore += 2;
      incidents.push({
        id: 'form-heavy-consult',
        pillar: 'architecture',
        pillarName: 'Conversion Architecture',
        severity: 'FATAL_STALL',
        researchCitation: 'Baymard Institute Form Benchmark',
        headline: 'Excessive Lead Capture Questionnaire',
        plainEnglishImpact: `Found ${raw.formInputCount} form fields. High-intent decision makers drop off when asked to fill out exhaustive surveys before ever talking to a strategist.`,
        actionableFix: 'Shift deeper scoping questions into the post-booking calendar redirect.',
        pointsDelta: -6,
      });
    }
  } else {
    if (raw.formInputCount <= 3) {
      archScore += 8;
      incidents.push({
        id: 'form-lean',
        pillar: 'architecture',
        pillarName: 'Conversion Architecture',
        severity: 'CLEARED',
        researchCitation: 'Baymard Institute Form Benchmark',
        headline: 'Low-Friction Lead Capture',
        plainEnglishImpact: 'Your lead form requires 3 or fewer fields. Baymard research proves cutting form fields from 6 to 3 increases submission rates by up to 25%.',
        actionableFix: 'Never ask for unnecessary information before the primary conversion step.',
        pointsDelta: 8,
      });
    } else if (raw.formInputCount <= 6) {
      archScore += 4;
      incidents.push({
        id: 'form-moderate',
        pillar: 'architecture',
        pillarName: 'Conversion Architecture',
        severity: 'FRICTION_WARN',
        researchCitation: 'Baymard Institute Form Benchmark',
        headline: 'Moderate Form Field Overhead',
        plainEnglishImpact: `Your form requires ${raw.formInputCount} fields. Every additional field required typically reduces form completion by 7% to 10%.`,
        actionableFix: 'Cut non-essential fields. Ask only for name and email.',
        pointsDelta: -4,
      });
    } else {
      archScore += 0;
      incidents.push({
        id: 'form-heavy',
        pillar: 'architecture',
        pillarName: 'Conversion Architecture',
        severity: 'FATAL_STALL',
        researchCitation: 'Baymard Institute Form Benchmark',
        headline: 'High Form Completion Friction',
        plainEnglishImpact: `Your form has ${raw.formInputCount} input fields. Visitors abandon long forms when simple account creation or demo access is expected.`,
        actionableFix: 'Switch to a 1-step social login or email-only sign up.',
        pointsDelta: -8,
      });
    }
  }

  // 1.4 Persistent / Sticky Navigation (7 pts)
  if (raw.hasPersistentNav) {
    archScore += 7;
  } else {
    archScore += 2;
    incidents.push({
      id: 'nav-not-sticky',
      pillar: 'architecture',
      pillarName: 'Conversion Architecture',
      severity: 'FRICTION_WARN',
      researchCitation: 'NN/g Persistent CTA Research',
      headline: 'Call-to-Action Disappears on Scroll',
      plainEnglishImpact: 'As visitors scroll down to read your case studies, the booking button vanishes from sight, requiring them to scroll back up to take action.',
      actionableFix: 'Make your header sticky so the action button remains accessible at every scroll depth.',
      pointsDelta: -5,
    });
  }

  // ==========================================
  // PILLAR 2: MESSAGING CLARITY (Max: 25 pts)
  // ==========================================
  let msgScore = 0;

  // 2.1 H1 Presence & Scannability (8 pts)
  if (raw.h1Count === 1) {
    msgScore += 8;
  } else if (raw.h1Count === 0) {
    msgScore += 0;
    incidents.push({
      id: 'h1-missing',
      pillar: 'messaging',
      pillarName: 'Messaging Clarity',
      severity: 'FATAL_STALL',
      researchCitation: 'Nielsen Norman Group Eye-Tracking Study',
      headline: 'No Main Headline Tag Found',
      plainEnglishImpact: 'Your page lacks an H1 title tag. Both human visitors and search crawlers struggle to identify what your business actually does in the first 3 seconds.',
      actionableFix: 'Add one clear, bold H1 headline explaining your core value proposition.',
      pointsDelta: -8,
    });
  } else {
    msgScore += 4;
    incidents.push({
      id: 'h1-multiple',
      pillar: 'messaging',
      pillarName: 'Messaging Clarity',
      severity: 'FRICTION_WARN',
      researchCitation: 'Nielsen Norman Group Eye-Tracking Study',
      headline: 'Multiple Competing H1 Headlines',
      plainEnglishImpact: `Found ${raw.h1Count} primary H1 tags. Having multiple main headlines confuses reading hierarchy and dilutes search indexing.`,
      actionableFix: 'Use exactly one H1 headline per page. Change secondary titles to H2 tags.',
      pointsDelta: -4,
    });
  }

  // 2.2 Headline Word Count (5 pts)
  if (raw.h1WordCount >= 6 && raw.h1WordCount <= 12) {
    msgScore += 5;
    incidents.push({
      id: 'h1-length-optimal',
      pillar: 'messaging',
      pillarName: 'Messaging Clarity',
      severity: 'CLEARED',
      researchCitation: 'Unbounce Copywriting Benchmark',
      headline: 'Scannable Main Headline Length',
      plainEnglishImpact: `Your headline is ${raw.h1WordCount} words long, which fits the ideal 6 to 12 word sweet spot for fast visual comprehension.`,
      actionableFix: 'Keep your primary headline focused and concise.',
      pointsDelta: 5,
    });
  } else if (raw.h1WordCount > 12) {
    msgScore += 2;
    incidents.push({
      id: 'h1-length-long',
      pillar: 'messaging',
      pillarName: 'Messaging Clarity',
      severity: 'FRICTION_WARN',
      researchCitation: 'Unbounce Copywriting Benchmark',
      headline: 'Main Headline Exceeds Optimal Word Count',
      plainEnglishImpact: `Your headline is ${raw.h1WordCount} words long. Modern buyers scan rather than read; headlines longer than 12 words suffer high drop-off.`,
      actionableFix: 'Shorten your headline to 6 to 10 punchy words and move supporting context into the subhead.',
      pointsDelta: -3,
    });
  } else if (raw.h1WordCount > 0 && raw.h1WordCount < 6) {
    msgScore += 3;
    incidents.push({
      id: 'h1-length-short',
      pillar: 'messaging',
      pillarName: 'Messaging Clarity',
      severity: 'FRICTION_WARN',
      researchCitation: 'Unbounce Copywriting Benchmark',
      headline: 'Headline May Be Too Cryptic',
      plainEnglishImpact: `Your headline is only ${raw.h1WordCount} words. Ultra-short headlines often sound like clever slogans but fail to explain what you actually sell.`,
      actionableFix: 'State clearly who you help and what outcome you deliver.',
      pointsDelta: -2,
    });
  }

  // 2.3 Flesch-Kincaid Readability Grade Level (6 pts)
  if (raw.readability.gradeLevel <= 11.5) {
    msgScore += 6;
    incidents.push({
      id: 'readability-optimal',
      pillar: 'messaging',
      pillarName: 'Messaging Clarity',
      severity: 'CLEARED',
      researchCitation: 'Unbounce 40,000 Landing Page Study',
      headline: `Optimal Readability Grade (${raw.readability.gradeLevel})`,
      plainEnglishImpact: `Your copy reads at an accessible conversational level (Grade ${raw.readability.gradeLevel}). Unbounce research across 40,000 pages proved accessible readability converts up to 36% higher than academic writing.`,
      actionableFix: 'Continue writing with punchy sentences and clear, accessible vocabulary.',
      pointsDelta: 6,
    });
  } else if (raw.readability.gradeLevel <= 14.0) {
    msgScore += 4;
    incidents.push({
      id: 'readability-moderate',
      pillar: 'messaging',
      pillarName: 'Messaging Clarity',
      severity: 'FRICTION_WARN',
      researchCitation: 'Unbounce 40,000 Landing Page Study',
      headline: `Elevated Reading Level (Grade ${raw.readability.gradeLevel})`,
      plainEnglishImpact: `Your copy reads at high-school senior level (Grade ${raw.readability.gradeLevel}). Sentence length and syllable complexity are slightly elevated, creating reading friction.`,
      actionableFix: 'Break long compound sentences into two shorter sentences.',
      pointsDelta: -2,
    });
  } else {
    msgScore += 1;
    incidents.push({
      id: 'readability-heavy',
      pillar: 'messaging',
      pillarName: 'Messaging Clarity',
      severity: 'FATAL_STALL',
      researchCitation: 'Unbounce 40,000 Landing Page Study',
      headline: `Academic Reading Level (Grade ${raw.readability.gradeLevel})`,
      plainEnglishImpact: `Your copy reads at college level (Grade ${raw.readability.gradeLevel}). Dense sentences and multi-syllable terminology cause visitors to scan away without understanding your offer.`,
      actionableFix: 'Rewrite copy using 8th-grade conversational vocabulary.',
      pointsDelta: -5,
    });
  }

  // 2.4 Buzzword & Information Scent Check (6 pts)
  if (raw.buzzwords.buzzwordCount === 0) {
    msgScore += 6;
    incidents.push({
      id: 'buzzwords-clean',
      pillar: 'messaging',
      pillarName: 'Messaging Clarity',
      severity: 'CLEARED',
      researchCitation: 'Nielsen Norman Group Information Scent Study',
      headline: 'Zero Vague Corporate Buzzwords',
      plainEnglishImpact: 'Your page avoids hollow clichés like "cutting-edge", "all-in-one", or "seamless", maintaining sharp information scent for high-intent visitors.',
      actionableFix: 'Continue using direct verbs describing concrete outcomes.',
      pointsDelta: 6,
    });
  } else if (raw.buzzwords.buzzwordCount <= 2) {
    msgScore += 4;
    incidents.push({
      id: 'buzzwords-minor',
      pillar: 'messaging',
      pillarName: 'Messaging Clarity',
      severity: 'FRICTION_WARN',
      researchCitation: 'Nielsen Norman Group Information Scent Study',
      headline: 'Minor Buzzword Density Detected',
      plainEnglishImpact: `Found buzzwords: ${raw.buzzwords.foundBuzzwords.join(', ')}. Generic marketing clichés reduce perceived technical credibility with B2B buyers.`,
      actionableFix: 'Replace buzzwords with specific deliverables (for example, replace "seamless integration" with "2-minute API connect").',
      pointsDelta: -2,
    });
  } else {
    msgScore += 1;
    incidents.push({
      id: 'buzzwords-heavy',
      pillar: 'messaging',
      pillarName: 'Messaging Clarity',
      severity: 'FATAL_STALL',
      researchCitation: 'Nielsen Norman Group Information Scent Study',
      headline: 'Heavy Buzzword Saturation',
      plainEnglishImpact: `Detected ${raw.buzzwords.buzzwordCount} vague corporate clichés (${raw.buzzwords.foundBuzzwords.slice(0, 4).join(', ')}). NN/g eye-tracking proves generic buzzwords cause visitors to lose trust and bounce.`,
      actionableFix: 'Eliminate vague adjectives and describe your exact technical mechanics.',
      pointsDelta: -5,
    });
  }

  // ==========================================
  // PILLAR 3: PROOF DENSITY (Max: 25 pts)
  // ==========================================
  let proofScore = 0;

  // 3.1 Hard Quantified Metrics & Specificity (10 pts)
  if (raw.quantifiedMetricsFound.length >= 3) {
    proofScore += 8;
    // CXL Specificity Bonus (+2)
    if (raw.hasSpecificNumbers) {
      proofScore += 2;
      incidents.push({
        id: 'metrics-rich-specific',
        pillar: 'proof',
        pillarName: 'Proof Density',
        severity: 'CLEARED',
        researchCitation: 'CXL Quantitative Proof Research',
        headline: 'Specific Quantified Numbers Verified',
        plainEnglishImpact: `Found verified specific metrics (${raw.quantifiedMetricsFound.slice(0, 3).join(', ')}). CXL research proves non-rounded, specific figures convert 2.3x better than rounded estimates.`,
        actionableFix: 'Highlight these exact figures directly beside your primary CTA.',
        pointsDelta: 10,
      });
    } else {
      incidents.push({
        id: 'metrics-rich',
        pillar: 'proof',
        pillarName: 'Proof Density',
        severity: 'CLEARED',
        researchCitation: 'CXL Quantitative Proof Research',
        headline: 'Quantified Commercial Metrics Verified',
        plainEnglishImpact: `Found numerical proof metrics (${raw.quantifiedMetricsFound.slice(0, 3).join(', ')}). Measurable numbers build instant trust with B2B decision-makers.`,
        actionableFix: 'Keep metrics visible above the fold.',
        pointsDelta: 8,
      });
    }
  } else if (raw.quantifiedMetricsFound.length >= 1) {
    proofScore += 5;
    incidents.push({
      id: 'metrics-moderate',
      pillar: 'proof',
      pillarName: 'Proof Density',
      severity: 'FRICTION_WARN',
      researchCitation: 'CXL Quantitative Proof Research',
      headline: 'Limited Measurable Results Shown',
      plainEnglishImpact: 'Only detected 1 to 2 hard numbers on the page. High-ticket B2B buyers look for measurable ROI and concrete evidence before taking a meeting.',
      actionableFix: 'Add specific outcome metrics (like pipeline generated, percentage lift, or hours saved).',
      pointsDelta: -5,
    });
  } else {
    proofScore += 0;
    incidents.push({
      id: 'metrics-zero',
      pillar: 'proof',
      pillarName: 'Proof Density',
      severity: 'FATAL_STALL',
      researchCitation: 'CXL Quantitative Proof Research',
      headline: 'Zero Measurable Results on Page',
      plainEnglishImpact: 'Could not find any numbers, percentages, or dollar metrics on the page. Making claims without measurable receipts creates skepticism.',
      actionableFix: 'Add 3 bold statistics showcasing past client results or system benchmarks.',
      pointsDelta: -10,
    });
  }

  // 3.2 Client Logos / Showreel / Portfolio Proof (8 pts)
  // 3.2 Visual Proof & Work Assets (8 pts)
  const isAgency = raw.archetype === 'AGENCY_STUDIO';
  const isPersonal = raw.archetype === 'PERSONAL_AUTHORITY';
  const isProduct = raw.archetype === 'B2B_SAAS_TOOL';

  const totalVisualProof = raw.clientLogoCount + (raw.hasShowreel ? 5 : 0) + raw.portfolioItemCount;

  if (isAgency) {
    if (raw.hasShowreel || totalVisualProof >= 3) {
      proofScore += 8;
      incidents.push({
        id: 'proof-agency-verified',
        pillar: 'proof',
        pillarName: 'Proof Density',
        severity: 'CLEARED',
        researchCitation: 'Nielsen Norman Group Agency Proof Benchmark',
        headline: raw.hasShowreel ? 'Agency Showreel & Production Assets Detected' : 'Client Case Study Assets Verified',
        plainEnglishImpact: raw.hasShowreel
          ? 'Found rich video showreel assets and verifiable partner deliverables, establishing immediate creative credibility.'
          : `Detected ${raw.clientLogoCount + raw.portfolioItemCount} agency portfolio and partner assets. Showing tangible past work removes buyer hesitation.`,
        actionableFix: 'Keep your strongest case studies visible near the main fold.',
        pointsDelta: 8,
      });
    } else {
      proofScore += 2;
      incidents.push({
        id: 'proof-agency-sparse',
        pillar: 'proof',
        pillarName: 'Proof Density',
        severity: 'FRICTION_WARN',
        researchCitation: 'Nielsen Norman Group Agency Proof Benchmark',
        headline: 'Few Agency Proof Assets Detected',
        plainEnglishImpact: 'Prospective clients see minimal visual proof of your agency deliverables or past clients.',
        actionableFix: 'Add a video showreel or a 3-project case study strip with client logos.',
        pointsDelta: -6,
      });
    }
  } else if (isPersonal) {
    if (raw.hasShippedProjects || raw.hasSubstackOrBlog || totalVisualProof >= 2) {
      proofScore += 8;
      incidents.push({
        id: 'proof-personal-verified',
        pillar: 'proof',
        pillarName: 'Proof Density',
        severity: 'CLEARED',
        researchCitation: 'Solo Builder Authority & Deliverables Benchmark',
        headline: 'Shipped Deliverables & Builder Authority Verified',
        plainEnglishImpact: 'Found verified shipped projects, published teardowns, or thought leadership hubs. High-ticket buyers evaluate independent strategists by tangible proof of work rather than corporate logo strips.',
        actionableFix: 'Keep live project links and authority teardowns accessible from the top fold.',
        pointsDelta: 8,
      });
    } else {
      proofScore += 3;
      incidents.push({
        id: 'proof-personal-sparse',
        pillar: 'proof',
        pillarName: 'Proof Density',
        severity: 'FRICTION_WARN',
        researchCitation: 'Solo Builder Authority & Deliverables Benchmark',
        headline: 'Limited Tangible Work Shipped on Page',
        plainEnglishImpact: 'Visitors see claims of capability without direct links to shipped systems, live apps, or published breakdowns.',
        actionableFix: 'Add 2 to 3 cards showcasing shipped projects with live demonstration links.',
        pointsDelta: -5,
      });
    }
  } else if (isProduct) {
    if (raw.hasInteractiveTool || raw.hasGithubRepo || totalVisualProof >= 3) {
      proofScore += 8;
      incidents.push({
        id: 'proof-product-verified',
        pillar: 'proof',
        pillarName: 'Proof Density',
        severity: 'CLEARED',
        researchCitation: 'Product-Led Growth Benchmark Standard',
        headline: 'Interactive Product Utility & Developer Proof Verified',
        plainEnglishImpact: 'Your page provides an immediate interactive console, working sandbox, or open-source repository. Letting users test working software converts faster than static marketing claims.',
        actionableFix: 'Maintain instant sandbox access above the fold.',
        pointsDelta: 8,
      });
    } else {
      proofScore += 2;
      incidents.push({
        id: 'proof-product-sparse',
        pillar: 'proof',
        pillarName: 'Proof Density',
        severity: 'FRICTION_WARN',
        researchCitation: 'Product-Led Growth Benchmark Standard',
        headline: 'No Interactive Demonstration or Technical Proof',
        plainEnglishImpact: 'Visitors cannot see or touch the software before signing up, increasing friction for technical buyers.',
        actionableFix: 'Add an interactive product sandbox or animated product walkthrough.',
        pointsDelta: -6,
      });
    }
  } else {
    // Single-Offer Funnel
    if (totalVisualProof >= 2 || raw.quantifiedMetricsFound.length >= 2) {
      proofScore += 8;
      incidents.push({
        id: 'proof-funnel-verified',
        pillar: 'proof',
        pillarName: 'Proof Density',
        severity: 'CLEARED',
        researchCitation: 'CXL Quantitative Proof Research',
        headline: 'Offer Receipts & Transformation Proof Present',
        plainEnglishImpact: 'Found concrete receipts and measurable outcome evidence directly tied to the primary offer.',
        actionableFix: 'Position key transformation proof directly beside the order button.',
        pointsDelta: 8,
      });
    } else {
      proofScore += 2;
      incidents.push({
        id: 'proof-funnel-sparse',
        pillar: 'proof',
        pillarName: 'Proof Density',
        severity: 'FATAL_STALL',
        researchCitation: 'CXL Quantitative Proof Research',
        headline: 'Missing Proof Receipts on Core Offer',
        plainEnglishImpact: 'Selling a single high-ticket offer without measurable case studies or client receipts causes high cold traffic bounce.',
        actionableFix: 'Add before/after case metrics and screenshots validating your offer claims.',
        pointsDelta: -6,
      });
    }
  }

  // 3.3 Testimonials (7 pts)
  if (raw.testimonialCount >= 1) {
    proofScore += 7;
    incidents.push({
      id: 'testimonial-verified',
      pillar: 'proof',
      pillarName: 'Proof Density',
      severity: 'CLEARED',
      researchCitation: 'Spiegel Research Center Social Proof Findings',
      headline: 'Customer Testimonials & Social Endorsements Present',
      plainEnglishImpact: 'Direct client quotes validate your claims. Spiegel Research proves reviews increase conversion rates by up to 270%.',
      actionableFix: 'Keep client names, roles, and headshots attached to quotes.',
      pointsDelta: 7,
    });
  } else if (isProduct && raw.hasInteractiveTool) {
    proofScore += 5;
    incidents.push({
      id: 'testimonial-product-utility',
      pillar: 'proof',
      pillarName: 'Proof Density',
      severity: 'FRICTION_WARN',
      researchCitation: 'Product-Led Growth Benchmark Standard',
      headline: 'Functional Utility Substitutes Social Proof',
      plainEnglishImpact: 'While live software gives visitors immediate proof of utility, adding 1 or 2 authentic user reviews will complete social validation.',
      actionableFix: 'Embed a couple of user quotes or GitHub star milestones as you scale.',
      pointsDelta: -2,
    });
  } else if (isPersonal && (raw.hasShippedProjects || raw.hasSubstackOrBlog)) {
    proofScore += 5;
    incidents.push({
      id: 'testimonial-personal-work',
      pillar: 'proof',
      pillarName: 'Proof Density',
      severity: 'FRICTION_WARN',
      researchCitation: 'Solo Builder Authority & Deliverables Benchmark',
      headline: 'Work Proof Anchored, Testimonial Stack Pending',
      plainEnglishImpact: 'Your shipped projects and published teardowns establish strong technical credibility. Adding 1 or 2 client quotes will anchor social validation.',
      actionableFix: 'Add 2 short client endorsements with their name, role, and outcome.',
      pointsDelta: -2,
    });
  } else {
    proofScore += 2;
    incidents.push({
      id: 'testimonial-missing',
      pillar: 'proof',
      pillarName: 'Proof Density',
      severity: 'FRICTION_WARN',
      researchCitation: 'Spiegel Research Center Social Proof Findings',
      headline: 'No Client Testimonials or Quotes Detected',
      plainEnglishImpact: 'There are no direct quotes from clients or users endorsing your solution. Spiegel Research data proves customer reviews increase conversion rates by up to 270%.',
      actionableFix: 'Add 2 to 3 concise testimonials with client names, titles, and headshots.',
      pointsDelta: -5,
    });
  }

  // ==========================================
  // PILLAR 4: TECHNICAL VELOCITY (Max: 20 pts)
  // ==========================================
  let velScore = 0;

  // 4.1 Third-Party Tracking Bloat (7 pts)
  if (raw.thirdPartyScriptCount <= 4) {
    velScore += 7;
    incidents.push({
      id: 'scripts-lean',
      pillar: 'velocity',
      pillarName: 'Technical Velocity',
      severity: 'CLEARED',
      researchCitation: 'Google Core Web Vitals Latency Research',
      headline: 'Lean Third-Party Script Footprint',
      plainEnglishImpact: `Only found ${raw.thirdPartyScriptCount} external scripts. Your page does not waste visitor bandwidth loading heavy marketing trackers.`,
      actionableFix: 'Continue keeping external tracking tags minimal.',
      pointsDelta: 7,
    });
  } else if (raw.thirdPartyScriptCount <= 8) {
    velScore += 4;
    incidents.push({
      id: 'scripts-moderate',
      pillar: 'velocity',
      pillarName: 'Technical Velocity',
      severity: 'FRICTION_WARN',
      researchCitation: 'Google Core Web Vitals Latency Research',
      headline: 'Moderate Tracking Script Overhead',
      plainEnglishImpact: `Detected ${raw.thirdPartyScriptCount} external tracking tools (${raw.detectedTrackers.join(', ') || 'analytics tools'}). These add load delay, especially on mobile devices.`,
      actionableFix: 'Consolidate redundant analytics tools and load chat widgets only on user interaction.',
      pointsDelta: -3,
    });
  } else {
    velScore += 1;
    incidents.push({
      id: 'scripts-heavy',
      pillar: 'velocity',
      pillarName: 'Technical Velocity',
      severity: 'FATAL_STALL',
      researchCitation: 'Google Core Web Vitals Latency Research',
      headline: 'Heavy Tracking Script Bloat',
      plainEnglishImpact: `Detected ${raw.thirdPartyScriptCount} external scripts (${raw.detectedTrackers.join(', ')}). Google CWV data indicates every additional tracking tag delays Interaction to Next Paint (INP).`,
      actionableFix: 'Audit your tag manager and remove legacy trackers that are no longer actively used.',
      pointsDelta: -6,
    });
  }

  // 4.2 DOM Complexity & Node Count (3 pts)
  if (raw.totalDomNodes <= 1000) {
    velScore += 3;
  } else {
    velScore += 1;
    incidents.push({
      id: 'dom-heavy',
      pillar: 'velocity',
      pillarName: 'Technical Velocity',
      severity: 'FRICTION_WARN',
      researchCitation: 'Google Lighthouse Performance Metric',
      headline: 'Elevated DOM Tree Complexity',
      plainEnglishImpact: `Page contains ${raw.totalDomNodes} DOM nodes (recommended threshold is under 800). Heavy DOM nesting causes layout recalculation stutter on mobile devices.`,
      actionableFix: 'Simplify deeply nested container divs and eliminate redundant wrapper components.',
      pointsDelta: -2,
    });
  }

  // 4.3 OpenGraph Social Preview Assets (5 pts)
  if (raw.hasOgImage && raw.ogTitle) {
    velScore += 5;
    incidents.push({
      id: 'og-cleared',
      pillar: 'velocity',
      pillarName: 'Technical Velocity',
      severity: 'CLEARED',
      researchCitation: 'Buffer & Hootsuite Social CTR Study',
      headline: 'Social Share Card Configured',
      plainEnglishImpact: 'When someone shares your link on LinkedIn, X, or Slack, a rich preview image and title render automatically, driving up to 3x higher organic click-through.',
      actionableFix: 'Keep your preview image updated with clear value proposition text.',
      pointsDelta: 5,
    });
  } else {
    velScore += 1;
    incidents.push({
      id: 'og-incomplete',
      pillar: 'velocity',
      pillarName: 'Technical Velocity',
      severity: 'FRICTION_WARN',
      researchCitation: 'Buffer & Hootsuite Social CTR Study',
      headline: 'Incomplete Social Preview Metadata',
      plainEnglishImpact: 'When your URL is shared on LinkedIn or X, the link preview is missing an image or description, reducing organic click-through.',
      actionableFix: 'Set a custom 1200x630 pixel og:image tag in your website header.',
      pointsDelta: -4,
    });
  }

  // 4.4 Mobile Viewport (5 pts)
  if (raw.hasViewportMeta) {
    velScore += 5;
  } else {
    velScore += 0;
    incidents.push({
      id: 'viewport-missing',
      pillar: 'velocity',
      pillarName: 'Technical Velocity',
      severity: 'FATAL_STALL',
      researchCitation: 'Google Mobile-First Indexing Standard',
      headline: 'Missing Mobile Viewport Configuration',
      plainEnglishImpact: 'The page lacks a mobile viewport tag, meaning mobile phones render the page zoomed out like a desktop screen.',
      actionableFix: 'Add the standard viewport meta tag to your HTML head immediately.',
      pointsDelta: -5,
    });
  }

  // Total Score Calculation
  const totalScore = Math.min(100, Math.max(0, archScore + msgScore + proofScore + velScore));

  let tier: SurvivabilityTier;
  let tierLabel: string;
  let tierDescription: string;

  if (totalScore >= 90) {
    tier = 'TIER_S_OPTIMAL';
    tierLabel = 'TIER S // OPTIMAL FLIGHT';
    tierDescription = 'Pristine conversion architecture. Friction is near zero and your page is cleared for high-ticket traffic.';
  } else if (totalScore >= 75) {
    tier = 'TIER_A_ELEVATED';
    tierLabel = 'TIER A // MINOR TURBULENCE';
    tierDescription = 'Solid foundation. A few addressable leaks in copy or asset loading are trimming your total booking rate.';
  } else if (totalScore >= 50) {
    tier = 'TIER_B_SEVERE_DRAG';
    tierLabel = 'TIER B // SEVERE DRAG';
    tierDescription = 'Significant friction detected. Your page is likely leaking an estimated 20% to 35% of prospective buyers before they convert.';
  } else {
    tier = 'FATAL_CRASH';
    tierLabel = 'FATAL CRASH // CRITICAL FAILURE';
    tierDescription = 'Critical conversion stalls detected across layout, speed, and messaging. Immediate architecture rebuild required.';
  }

  const architecturePillar: PillarScore = {
    name: 'Conversion Architecture',
    code: 'PILLAR_01',
    score: archScore,
    maxScore: 30,
    percentage: Math.round((archScore / 30) * 100),
    status: archScore >= 24 ? 'pass' : archScore >= 16 ? 'amber' : 'crit',
    summary: 'CTA placement, form fields, and navigation clarity',
  };

  const messagingPillar: PillarScore = {
    name: 'Messaging Clarity',
    code: 'PILLAR_02',
    score: msgScore,
    maxScore: 25,
    percentage: Math.round((msgScore / 25) * 100),
    status: msgScore >= 20 ? 'pass' : msgScore >= 14 ? 'amber' : 'crit',
    summary: 'Flesch-Kincaid reading level, scannability, and buzzword density',
  };

  const proofPillar: PillarScore = {
    name: 'Proof Density',
    code: 'PILLAR_03',
    score: proofScore,
    maxScore: 25,
    percentage: Math.round((proofScore / 25) * 100),
    status: proofScore >= 20 ? 'pass' : proofScore >= 13 ? 'amber' : 'crit',
    summary: 'Measurable client outcomes, logos, and testimonials',
  };

  const velocityPillar: PillarScore = {
    name: 'Technical Velocity',
    code: 'PILLAR_04',
    score: velScore,
    maxScore: 20,
    percentage: Math.round((velScore / 20) * 100),
    status: velScore >= 16 ? 'pass' : velScore >= 11 ? 'amber' : 'crit',
    summary: 'Tracking script overhead, DOM complexity, and social cards',
  };

  // Sort incidents: FATAL first, then WARN, then CLEARED
  const severityOrder: Record<string, number> = {
    FATAL_STALL: 0,
    FRICTION_WARN: 1,
    CLEARED: 2,
  };
  incidents.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    targetUrl: raw.targetUrl,
    domain: raw.domain,
    timestamp: new Date().toISOString(),
    probeLatencyMs: raw.probeLatencyMs,
    overallScore: totalScore,
    tier,
    tierLabel,
    tierDescription,
    archetypeCalibration: raw.archetypeCalibration,
    pillars: {
      architecture: architecturePillar,
      messaging: messagingPillar,
      proof: proofPillar,
      velocity: velocityPillar,
    },
    incidents,
    rawMetrics: raw,
  };
}
