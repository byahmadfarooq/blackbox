import { NextRequest, NextResponse } from 'next/server';
import { scanUrl } from '@/lib/engine/engine';
import { UnsafeUrlError, assertPublicUrl } from '@/lib/engine/safe-fetch';
import { rateLimit } from '@/lib/rate-limit';
import { encodeReport } from '@/lib/share';

const ARCHETYPES = ['AGENCY_STUDIO', 'PERSONAL_AUTHORITY', 'B2B_SAAS_TOOL', 'SINGLE_OFFER_FUNNEL'] as const;

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const limited = rateLimit(`scan:${ip}`, 8, 10 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { success: false, error: `You have run a lot of checks. Please try again in ${Math.ceil(limited.retryAfterSec / 60)} minute(s).` },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } }
    );
  }

  try {
    const body = await req.json();
    const { url, manualArchetype } = body ?? {};

    if (!url || typeof url !== 'string' || url.length > 2048) {
      return NextResponse.json({ success: false, error: 'Please enter a valid website address.' }, { status: 400 });
    }

    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) cleanUrl = `https://${cleanUrl}`;

    const archetype = ARCHETYPES.includes(manualArchetype) ? manualArchetype : undefined;

    await assertPublicUrl(cleanUrl);
    const stored = await scanUrl(cleanUrl, archetype);

    return NextResponse.json({ success: true, token: encodeReport(stored) });
  } catch (error: unknown) {
    if (error instanceof UnsafeUrlError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('Scan error:', error);
    if (error instanceof Error && /^The page returned an error \(\d+\)\.$/.test(error.message)) {
      return NextResponse.json({ success: false, error: `${error.message} Check that the page is public and loads in a browser.` }, { status: 502 });
    }
    return NextResponse.json(
      { success: false, error: 'We could not load that page. Check the address is public and try again.' },
      { status: 502 }
    );
  }
}
