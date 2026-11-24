import { NextRequest, NextResponse } from 'next/server';
import { decodeReport } from '@/lib/share';
import { hydrate } from '@/lib/engine/engine';
import { buildReportPdf } from '@/lib/pdf/report-pdf';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(`pdf:${ip}`, 20, 10 * 60 * 1000).ok) {
    return NextResponse.json({ error: 'Too many downloads. Please try again in a few minutes.' }, { status: 429 });
  }
  const stored = decodeReport(req.nextUrl.searchParams.get('t') || '');
  if (!stored) return NextResponse.json({ error: 'Report not found.' }, { status: 404 });

  const report = hydrate(stored);
  const bytes = await buildReportPdf(report);
  const day = new Date(report.scannedAt).toISOString().slice(0, 10);
  const safeDomain = report.domain.replace(/[^a-z0-9.-]/gi, '');

  return new Response(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Blackbox Report - ${safeDomain} - ${day}.pdf"`,
      'Cache-Control': 'private, max-age=0, no-store',
    },
  });
}
