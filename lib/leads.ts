export const BUSINESS_TYPES = [
  ['roofing-home-services', 'Roofing or home services'],
  ['agency', 'Marketing or creative agency'],
  ['consultant', 'Consultant or coach'],
  ['b2b-software', 'B2B software'],
  ['ecommerce', 'E-commerce'],
  ['other', 'Something else'],
] as const;

export const BUSINESS_KEYS: string[] = BUSINESS_TYPES.map((b) => b[0]);

export const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

export interface Lead {
  email: string;
  businessType: string;
  domain: string;
  score: number;
  archetype: string;
  at: string;
}

/**
 * Sends a lead to LEADS_WEBHOOK_URL (for example a Google Apps Script that appends to a Sheet).
 * Without a webhook the lead is written to the server log. Never throws, so a lead problem cannot break a scan.
 */
export async function saveLead(lead: Lead): Promise<void> {
  const url = process.env.LEADS_WEBHOOK_URL;
  if (!url) {
    console.log('LEAD', JSON.stringify(lead));
    return;
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead), signal: ctrl.signal });
    clearTimeout(t);
  } catch (e) {
    console.error('Lead webhook failed', e);
    console.log('LEAD', JSON.stringify(lead));
  }
}
