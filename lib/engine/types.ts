export type PageArchetype = 'AGENCY_STUDIO' | 'PERSONAL_AUTHORITY' | 'B2B_SAAS_TOOL' | 'SINGLE_OFFER_FUNNEL';

/** pass/warn/fail are verdicts. unknown = we could not tell from the page code. na = does not apply to this page. */
export type CheckStatus = 'pass' | 'warn' | 'fail' | 'unknown' | 'na';

export type PillarKey = 'action' | 'message' | 'proof' | 'speed' | 'basics';

/** What is saved inside a share link. Text for each check is rebuilt from the rubric by id. */
export interface StoredCheck {
  id: string;
  s: CheckStatus;
  /** Short evidence: what we actually found on the page. */
  e?: string;
}

export interface StoredReport {
  version: string;
  url: string;
  domain: string;
  scannedAt: number;
  archetype: PageArchetype;
  manual: boolean;
  signals: string[];
  limits: string[];
  checks: StoredCheck[];
}

export interface CheckView {
  id: string;
  pillar: PillarKey;
  title: string;
  status: CheckStatus;
  evidence: string;
  impact: string;
  fix: string;
  weight: number;
  earned: number;
  /** Overall points this fix could add, rounded. 0 when passed or not checked. */
  gain: number;
}

export interface PillarScore {
  key: PillarKey;
  name: string;
  score: number;
  max: number;
  percentage: number;
  /** Share of this pillar's checks we could actually run. */
  coverage: number;
  tone: 'good' | 'mid' | 'poor';
  summary: string;
}

export interface ReportData {
  version: string;
  url: string;
  domain: string;
  scannedAt: number;
  archetype: PageArchetype;
  archetypeLabel: string;
  manual: boolean;
  signals: string[];
  limits: string[];
  score: number;
  tierLabel: string;
  tierDescription: string;
  /** Share of the rubric we could run on this page, 0-100. */
  coverage: number;
  pillars: Record<PillarKey, PillarScore>;
  checks: CheckView[];
  /** Failing or warning checks, biggest possible gain first. */
  priorities: CheckView[];
}
