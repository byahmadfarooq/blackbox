import { createHmac, timingSafeEqual } from 'node:crypto';
import { deflateRawSync, inflateRawSync } from 'node:zlib';
import { SharedReport } from '@/lib/engine/types';

// Reports are stored inside the link itself (compressed and signed), so no
// database is needed and a link always shows the report as it was scanned.
// Set REPORT_SECRET in the hosting environment so links cannot be forged.
const SECRET = process.env.REPORT_SECRET || 'blackbox-dev-secret-change-me';

const sign = (data: string) => createHmac('sha256', SECRET).update(data).digest('base64url').slice(0, 22);

export function encodeReport(report: SharedReport): string {
  const body = deflateRawSync(Buffer.from(JSON.stringify(report))).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function decodeReport(token: string): SharedReport | null {
  try {
    const [body, sig] = token.split('.');
    if (!body || !sig || body.length > 20000) return null;
    const expected = sign(body);
    if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const json = inflateRawSync(Buffer.from(body, 'base64url'), { maxOutputLength: 200000 }).toString();
    const r = JSON.parse(json) as SharedReport;
    if (typeof r.overallScore !== 'number' || typeof r.domain !== 'string' || !Array.isArray(r.incidents)) return null;
    return r;
  } catch {
    return null;
  }
}
