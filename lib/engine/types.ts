import { BuzzwordMetrics, ReadabilityMetrics } from './research-metrics';

export type SurvivabilityTier = 
  | 'TIER_S_OPTIMAL'
  | 'TIER_A_ELEVATED'
  | 'TIER_B_SEVERE_DRAG'
  | 'FATAL_CRASH';

export type IncidentSeverity = 'FATAL_STALL' | 'FRICTION_WARN' | 'CLEARED';

export interface IncidentItem {
  id: string;
  pillar: 'architecture' | 'messaging' | 'proof' | 'velocity';
  pillarName: string;
  severity: IncidentSeverity;
  researchCitation?: string;
  headline: string;
  plainEnglishImpact: string;
  actionableFix: string;
  pointsDelta: number;
}

export interface PillarScore {
  name: string;
  code: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: 'pass' | 'amber' | 'crit';
  summary: string;
}

export type PageArchetype = 
  | 'AGENCY_STUDIO'
  | 'PERSONAL_AUTHORITY'
  | 'B2B_SAAS_TOOL'
  | 'SINGLE_OFFER_FUNNEL';

export interface ArchetypeCalibration {
  archetype: PageArchetype;
  label: string;
  benchmarkStandard: string;
  description: string;
  detectedSignals: string[];
  isManualOverride: boolean;
}

export interface RawTelemetryMetrics {
  targetUrl: string;
  domain: string;
  probeLatencyMs: number;
  statusCode: number;
  archetype: PageArchetype;
  archetypeCalibration: ArchetypeCalibration;
  hasInteractiveTool: boolean;
  hasGithubRepo: boolean;
  hasSubstackOrBlog: boolean;
  hasShippedProjects: boolean;
  hasDirectBooking: boolean;
  h1Count: number;
  primaryH1: string;
  h1WordCount: number;
  hasIcpHook: boolean;
  icpHookKeywords: string[];
  ctaCount: number;
  primaryCtaText: string;
  heroNavLinksCount: number;
  formInputCount: number;
  hasPersistentNav: boolean;
  quantifiedMetricsFound: string[];
  hasSpecificNumbers: boolean;
  clientLogoCount: number;
  portfolioItemCount: number;
  hasShowreel: boolean;
  testimonialCount: number;
  thirdPartyScriptCount: number;
  detectedTrackers: string[];
  totalDomNodes: number;
  hasViewportMeta: boolean;
  hasOgImage: boolean;
  ogTitle: string;
  ogDescription: string;
  readability: ReadabilityMetrics;
  buzzwords: BuzzwordMetrics;
}

export interface TelemetryResult {
  targetUrl: string;
  domain: string;
  timestamp: string;
  probeLatencyMs: number;
  overallScore: number;
  tier: SurvivabilityTier;
  tierLabel: string;
  tierDescription: string;
  archetypeCalibration: ArchetypeCalibration;
  pillars: {
    architecture: PillarScore;
    messaging: PillarScore;
    proof: PillarScore;
    velocity: PillarScore;
  };
  incidents: IncidentItem[];
  rawMetrics: RawTelemetryMetrics;
}
