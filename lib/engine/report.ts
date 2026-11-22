import { IncidentItem, SharedReport, TelemetryResult } from './types';

// Findings that depend on things a script can build after the page loads.
// We read the page code only, so these can be wrong and are labelled that way.
const UNCONFIRMED = /^(nav-not-sticky|cta-missing|h1-missing|metrics-zero|metrics-moderate|testimonial-missing|proof-.*-sparse)$/;

export function finalizeResult(result: TelemetryResult): TelemetryResult {
  const incidents: IncidentItem[] = result.incidents.map((i) => ({
    ...i,
    confidence: i.severity !== 'CLEARED' && UNCONFIRMED.test(i.id) ? 'unconfirmed' : 'confirmed',
  }));
  return { ...result, incidents };
}

export function toShared(result: TelemetryResult): SharedReport {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { rawMetrics, ...rest } = result;
  return {
    ...rest,
    incidents: rest.incidents.map((i) => ({ ...i, researchCitation: undefined })),
  };
}
