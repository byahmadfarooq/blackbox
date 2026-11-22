import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const raw = parseInt(new URL(req.url).searchParams.get('score') || '0', 10);
  const score = Math.max(0, Math.min(100, Number.isNaN(raw) ? 0 : raw));
  const color = score >= 75 ? '#2f7d4f' : score >= 50 ? '#a86a0c' : '#b42318';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="168" height="28" viewBox="0 0 168 28" role="img" aria-label="Blackbox score ${score} out of 100">
  <rect width="168" height="28" rx="14" fill="#ffffff" stroke="#e4e2da"/>
  <rect x="4" y="4" width="20" height="20" rx="5" fill="#17171a"/>
  <text x="14" y="18.5" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="#f7f6f2">B</text>
  <text x="32" y="18.5" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="600" fill="#17171a">Blackbox check</text>
  <text x="156" y="18.5" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="${color}">${score}/100</text>
</svg>`;
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=3600' },
  });
}
