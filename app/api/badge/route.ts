import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scoreParam = parseInt(searchParams.get('score') || '85', 10);
  const score = Math.max(0, Math.min(100, isNaN(scoreParam) ? 85 : scoreParam));
  const badgeType = (searchParams.get('type') || 'circular').toLowerCase();

  const tierColor = score >= 90 ? '#00FF88' : score >= 75 ? '#FFB700' : score >= 50 ? '#FF8800' : '#FF3344';
  const tierShort = score >= 90 ? 'TIER S // OPTIMAL' : score >= 75 ? 'TIER A // VERIFIED' : score >= 50 ? 'TIER B // DRAG' : 'TIER C // CRITICAL';
  const tierLetter = score >= 90 ? 'S' : score >= 75 ? 'A' : score >= 50 ? 'B' : 'C';

  let svgContent = '';

  if (badgeType === 'horizontal' || badgeType === 'pill' || badgeType === 'capsule') {
    // 1. Modern Tactical Flight Capsule (240x36)
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="36" viewBox="0 0 240 36" fill="none">
  <defs>
    <linearGradient id="capBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0E0E14" />
      <stop offset="100%" stop-color="#060608" />
    </linearGradient>
    <linearGradient id="capBorder" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#2D2D3C" />
      <stop offset="50%" stop-color="#181822" />
      <stop offset="100%" stop-color="#2D2D3C" />
    </linearGradient>
  </defs>
  <rect width="240" height="36" rx="6" fill="url(#capBg)" stroke="url(#capBorder)" stroke-width="1.2" />
  <g transform="translate(16, 18) scale(0.6)">
    <polygon points="0,-10 9,-5 0,0 -9,-5" stroke="#FF5500" stroke-width="1.8" fill="#FF550025"/>
    <polygon points="-9,-5 0,0 0,10 -9,5" stroke="#FF5500" stroke-width="1.8" fill="#FF550015"/>
    <polygon points="9,-5 0,0 0,10 9,5" stroke="#FF5500" stroke-width="1.8" fill="#FF550035"/>
  </g>
  <text x="32" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#FFFFFF" letter-spacing="0.06em">BLACKBOX</text>
  <text x="96" y="21.5" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" font-size="8" font-weight="700" fill="#71717A" letter-spacing="0.08em">VERIFIED</text>
  <line x1="150" y1="8" x2="150" y2="28" stroke="#1F1F2B" stroke-width="1.2" />
  <circle cx="166" cy="18" r="3" fill="${tierColor}" />
  <text x="176" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" fill="#FFFFFF">${score}</text>
  <text x="193" y="21.5" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" font-size="8.5" font-weight="600" fill="#52525B">/100</text>
  <rect x="212" y="9.5" width="18" height="17" rx="3" fill="${tierColor}18" stroke="${tierColor}" stroke-width="1"/>
  <text x="221" y="21.5" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" font-size="8.5" font-weight="900" fill="${tierColor}">${tierLetter}</text>
</svg>`;
  } else if (badgeType === 'hud' || badgeType === 'card' || badgeType === 'plate') {
    // 2. Cockpit Flight Plate (220x68)
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="68" viewBox="0 0 220 68" fill="none">
  <rect width="220" height="68" rx="6" fill="#07070B" stroke="#1E1E2A" stroke-width="1.2"/>
  <path d="M 1 9 L 1 1 L 9 1" stroke="#FF5500" stroke-width="1.5" fill="none"/>
  <path d="M 219 9 L 219 1 L 211 1" stroke="#FF5500" stroke-width="1.5" fill="none"/>
  <path d="M 1 59 L 1 67 L 9 67" stroke="#FF5500" stroke-width="1.5" fill="none"/>
  <path d="M 219 59 L 219 67 L 211 67" stroke="#FF5500" stroke-width="1.5" fill="none"/>
  <text x="16" y="20" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" font-size="7.5" font-weight="800" fill="#71717A" letter-spacing="0.14em">BLACKBOX // FLIGHT TELEMETRY</text>
  <circle cx="198" cy="17" r="3" fill="${tierColor}" />
  <text x="16" y="49" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="900" fill="#FFFFFF" letter-spacing="-0.03em">${score}</text>
  <text x="53" y="47.5" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" font-size="9" font-weight="700" fill="#52525B">/ 100</text>
  <rect x="96" y="32" width="108" height="20" rx="3.5" fill="${tierColor}18" stroke="${tierColor}" stroke-width="1"/>
  <text x="150" y="45.5" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" font-size="8" font-weight="800" fill="${tierColor}" letter-spacing="0.06em">${tierShort}</text>
</svg>`;
  } else {
    // 3. Default: Aerospace Flight Seal (140x140)
    const activeArcLength = ((score / 100) * 226.2).toFixed(1);

    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140" fill="none">
  <defs>
    <radialGradient id="sealGrad" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#12121B" />
      <stop offset="70%" stop-color="#08080C" />
      <stop offset="100%" stop-color="#030305" />
    </radialGradient>
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3F3F50" />
      <stop offset="50%" stop-color="#1C1C24" />
      <stop offset="100%" stop-color="#2E2E3C" />
    </linearGradient>
    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="${tierColor}" flood-opacity="0.5" />
    </filter>
  </defs>
  <circle cx="70" cy="70" r="67" fill="url(#sealGrad)" stroke="url(#ringGrad)" stroke-width="1.8" />
  <circle cx="70" cy="70" r="62" fill="none" stroke="#161620" stroke-width="1" />
  <g stroke="#3A3A4A" stroke-width="1" opacity="0.7">
    <line x1="70" y1="9" x2="70" y2="13" />
    <line x1="70" y1="127" x2="70" y2="131" />
    <line x1="9" y1="70" x2="13" y2="70" />
    <line x1="127" y1="70" x2="131" y2="70" />
    <line x1="27" y1="27" x2="30" y2="30" />
    <line x1="113" y1="27" x2="110" y2="30" />
    <line x1="27" y1="113" x2="30" y2="110" />
    <line x1="113" y1="113" x2="110" y2="110" />
  </g>
  <line x1="70" y1="8" x2="70" y2="14" stroke="#FF5500" stroke-width="1.8" />
  <line x1="70" y1="126" x2="70" y2="132" stroke="#FF5500" stroke-width="1.8" />
  <circle cx="70" cy="70" r="48" fill="none" stroke="#14141E" stroke-width="2.5" stroke-dasharray="226.2 75.4" stroke-dashoffset="-37.7" stroke-linecap="round" />
  <circle cx="70" cy="70" r="48" fill="none" stroke="${tierColor}" stroke-width="2.5" stroke-dasharray="${activeArcLength} 301.6" stroke-dashoffset="-37.7" stroke-linecap="round" filter="url(#neonGlow)" />
  <g transform="translate(70, 31) scale(0.6)">
    <polygon points="0,-10 9,-5 0,0 -9,-5" stroke="#FF5500" stroke-width="1.8" fill="#FF550025"/>
    <polygon points="-9,-5 0,0 0,10 -9,5" stroke="#FF5500" stroke-width="1.8" fill="#FF550015"/>
    <polygon points="9,-5 0,0 0,10 9,5" stroke="#FF5500" stroke-width="1.8" fill="#FF550035"/>
  </g>
  <text x="70" y="65" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#FFFFFF" letter-spacing="-0.03em">${score}</text>
  <text x="70" y="77" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" font-size="8" font-weight="700" fill="#71717A" letter-spacing="0.12em">/ 100 SCORE</text>
  <rect x="33" y="85" width="74" height="17" rx="3.5" fill="${tierColor}18" stroke="${tierColor}" stroke-width="1" />
  <text x="70" y="96.5" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" font-size="7.5" font-weight="800" fill="${tierColor}" letter-spacing="0.08em">${tierShort}</text>
  <text x="70" y="117" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" font-size="6.5" font-weight="700" fill="#52525B" letter-spacing="0.16em">KAIVEX SYSTEMS</text>
</svg>`;
  }

  return new NextResponse(svgContent, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
