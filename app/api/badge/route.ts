import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scoreParam = parseInt(searchParams.get('score') || '85', 10);
  const score = Math.max(0, Math.min(100, isNaN(scoreParam) ? 85 : scoreParam));
  const badgeType = (searchParams.get('type') || 'circular').toLowerCase();

  const tierColor = score >= 90 ? '#00FF88' : score >= 75 ? '#FFB700' : '#FF5500';
  const tierShort = score >= 90 ? 'TIER S // OPTIMAL' : score >= 75 ? 'TIER A // VERIFIED' : 'TIER B // DRAG';

  let svgContent = '';

  if (badgeType === 'horizontal' || badgeType === 'pill') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="40" viewBox="0 0 260 40" fill="none">
  <rect width="260" height="40" rx="6" fill="#09090D" stroke="#222228" stroke-width="1.2"/>
  <g transform="translate(20, 20) scale(0.7)">
    <polygon points="0,-12 10,-6 0,0 -10,-6" stroke="#FF5500" stroke-width="2" fill="none"/>
    <polygon points="-10,-6 0,0 0,12 -10,6" stroke="#FF5500" stroke-width="2" fill="none"/>
    <polygon points="10,-6 0,0 0,12 10,6" stroke="#FF5500" stroke-width="2" fill="none"/>
  </g>
  <text x="38" y="24.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" fill="#FFFFFF" letter-spacing="0.08em">BLACKBOX</text>
  <line x1="120" y1="9" x2="120" y2="31" stroke="#22222A" stroke-width="1.2"/>
  <circle cx="135" cy="20" r="3.5" fill="${tierColor}"/>
  <text x="146" y="24" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" font-size="11.5" font-weight="800" fill="#FFFFFF">SCORE ${score}</text>
  <text x="210" y="24" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" font-size="9.5" fill="#71717A">/100</text>
</svg>`;
  } else {
    // Default: Circular Aerospace Medallion (136x136)
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="136" height="136" viewBox="0 0 136 136" fill="none">
  <circle cx="68" cy="68" r="66" fill="#07070A" stroke="#222228" stroke-width="2"/>
  <circle cx="68" cy="68" r="60" fill="none" stroke="${tierColor}" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.8"/>
  <circle cx="68" cy="68" r="54" fill="#0C0C12" stroke="#1C1C24" stroke-width="1"/>
  <g transform="translate(68, 28) scale(0.65)">
    <polygon points="0,-12 10,-6 0,0 -10,-6" stroke="#FF5500" stroke-width="2" fill="none"/>
    <polygon points="-10,-6 0,0 0,12 -10,6" stroke="#FF5500" stroke-width="2" fill="none"/>
    <polygon points="10,-6 0,0 0,12 10,6" stroke="#FF5500" stroke-width="2" fill="none"/>
  </g>
  <text x="68" y="69" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" fill="#FFFFFF" letter-spacing="-0.03em">${score}</text>
  <text x="68" y="81" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" font-size="8.5" font-weight="700" fill="#71717A" letter-spacing="0.14em">/ 100 INDEX</text>
  <rect x="23" y="88" width="90" height="19" rx="3.5" fill="${tierColor}18" stroke="${tierColor}" stroke-width="1"/>
  <text x="68" y="101" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" font-size="8" font-weight="800" fill="${tierColor}" letter-spacing="0.06em">${tierShort}</text>
  <text x="68" y="122" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" font-size="7" font-weight="700" fill="#52525B" letter-spacing="0.12em">KAIVEX SYSTEMS</text>
</svg>`;
  }

  return new NextResponse(svgContent, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
