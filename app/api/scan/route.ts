import { NextRequest, NextResponse } from 'next/server';
import { scanUrl } from '@/lib/engine/scanner';
import { scoreTelemetry } from '@/lib/engine/scorer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid website URL.' },
        { status: 400 }
      );
    }

    // Clean and validate URL structure
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    try {
      new URL(cleanUrl);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format. Please enter a valid domain (e.g. stripe.com).' },
        { status: 400 }
      );
    }

    // Run deterministic scan and scoring
    const rawMetrics = await scanUrl(cleanUrl);
    const telemetryResult = scoreTelemetry(rawMetrics);

    return NextResponse.json({
      success: true,
      data: telemetryResult,
    });
  } catch (error: unknown) {
    console.error('Scan error:', error);
    const message = error instanceof Error ? error.message : 'Unknown scan error';
    return NextResponse.json(
      {
        success: false,
        error: `Unable to probe target website (${message}). Please verify the domain is reachable.`,
      },
      { status: 500 }
    );
  }
}
