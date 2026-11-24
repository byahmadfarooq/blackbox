import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const raw = parseInt(new URL(req.url).searchParams.get('score') || '0', 10);
  const score = Math.max(0, Math.min(100, Number.isNaN(raw) ? 0 : raw));
  const color = score >= 75 ? '#2f7d4f' : score >= 50 ? '#a86a0c' : '#b42318';
  // Text widths are fixed with textLength so the label and score can never overlap, whatever font is used.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="196" height="28" viewBox="0 0 196 28" role="img" aria-label="Blackbox score ${score} out of 100">
  <rect x="0.5" y="0.5" width="195" height="27" rx="13.5" fill="#ffffff" stroke="#e4e2da"/>
  <rect x="4" y="4" width="20" height="20" rx="5" fill="#17171a"/>
  <text x="14" y="18.5" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="#f7f6f2">B</text>
  <text x="33" y="18.5" textLength="88" lengthAdjust="spacingAndGlyphs" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="600" fill="#17171a">Blackbox check</text>
  <line x1="130" y1="7" x2="130" y2="21" stroke="#e4e2da"/>
  <text x="139" y="18.5" textLength="46" lengthAdjust="spacingAndGlyphs" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="${color}">${score}/100</text>
</svg>`;
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=3600' },
  });
}
