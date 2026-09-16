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
    // 1. Tactical Dual-Compartment Capsule (290x38) - Flawless Typography & Spacing
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="290" height="38" viewBox="0 0 290 38" fill="none">
  <defs>
    <linearGradient id="capBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3A3A4C" />
      <stop offset="50%" stop-color="#181822" />
      <stop offset="100%" stop-color="#2D2D3C" />
    </linearGradient>
    <linearGradient id="capBgL" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#121218" />
      <stop offset="100%" stop-color="#09090D" />
    </linearGradient>
  </defs>
  <rect width="290" height="38" rx="6" fill="#060609" stroke="url(#capBorder)" stroke-width="1.2" />
  <path d="M 0 6 Q 0 0 6 0 L 152 0 L 152 38 L 6 38 Q 0 38 0 32 Z" fill="url(#capBgL)" />
  <g transform="translate(15, 19) scale(0.6)">
    <polygon points="0,-10 9,-5 0,0 -9,-5" stroke="#FF5500" stroke-width="1.8" fill="#FF550025"/>
    <polygon points="-9,-5 0,0 0,10 -9,5" stroke="#FF5500" stroke-width="1.8" fill="#FF550015"/>
    <polygon points="9,-5 0,0 0,10 9,5" stroke="#FF5500" stroke-width="1.8" fill="#FF550035"/>
  </g>
  <text x="33" y="23.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#FFFFFF" letter-spacing="0.06em">
    BLACKBOX <tspan font-family="ui-monospace, monospace" font-size="7.5" font-weight="800" fill="#A1A1AA" letter-spacing="0.08em" dx="4">VERIFIED</tspan>
  </text>
  <line x1="152" y1="0" x2="152" y2="38" stroke="#1E1E2A" stroke-width="1.2" />
  <circle cx="168" cy="19" r="3" fill="${tierColor}" />
  <text x="178" y="23.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" fill="#FFFFFF">
    ${score}<tspan font-family="ui-monospace, monospace" font-size="8.5" font-weight="600" fill="#71717A" dx="3">/100</tspan>
  </text>
  <rect x="232" y="9.5" width="48" height="19" rx="3.5" fill="${tierColor}18" stroke="${tierColor}" stroke-width="1"/>
  <text x="256" y="22.5" text-anchor="middle" font-family="ui-monospace, monospace" font-size="8.5" font-weight="900" fill="${tierColor}" letter-spacing="0.04em">TIER ${tierLetter}</text>
</svg>`;
  } else if (badgeType === 'hud' || badgeType === 'card' || badgeType === 'plate') {
    // 2. Cockpit Flight Plaque (260x76 HUD)
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="76" viewBox="0 0 260 76" fill="none">
  <rect width="260" height="76" rx="8" fill="#08080C" stroke="#1E1E2A" stroke-width="1.2" />
  <path d="M 2 12 L 2 2 L 12 2" stroke="#FF5500" stroke-width="1.8" fill="none" />
  <path d="M 258 12 L 258 2 L 248 2" stroke="#FF5500" stroke-width="1.8" fill="none" />
  <path d="M 2 64 L 2 74 L 12 74" stroke="#FF5500" stroke-width="1.8" fill="none" />
  <path d="M 258 64 L 258 74 L 248 74" stroke="#FF5500" stroke-width="1.8" fill="none" />
  <g transform="translate(18, 19) scale(0.55)">
    <polygon points="0,-10 9,-5 0,0 -9,-5" stroke="#FF5500" stroke-width="1.8" fill="#FF550025"/>
    <polygon points="-9,-5 0,0 0,10 -9,5" stroke="#FF5500" stroke-width="1.8" fill="#FF550015"/>
    <polygon points="9,-5 0,0 0,10 9,5" stroke="#FF5500" stroke-width="1.8" fill="#FF550035"/>
  </g>
  <text x="32" y="21" font-family="ui-monospace, monospace" font-size="8" font-weight="900" fill="#A1A1AA" letter-spacing="0.14em">BLACKBOX // FLIGHT TELEMETRY</text>
  <circle cx="242" cy="18" r="3.5" fill="${tierColor}" />
  <text x="18" y="53" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#FFFFFF" letter-spacing="-0.03em">
    ${score}<tspan font-family="ui-monospace, monospace" font-size="10" font-weight="700" fill="#71717A" dx="4">/ 100</tspan>
  </text>
  <rect x="124" y="34" width="118" height="23" rx="4" fill="${tierColor}18" stroke="${tierColor}" stroke-width="1.2" />
  <text x="183" y="49.5" text-anchor="middle" font-family="ui-monospace, monospace" font-size="8.5" font-weight="900" fill="${tierColor}" letter-spacing="0.08em">${tierShort}</text>
  <line x1="18" y1="64" x2="242" y2="64" stroke="#181822" stroke-width="1" />
  <text x="18" y="70.5" font-family="ui-monospace, monospace" font-size="6.5" font-weight="700" fill="#52525B" letter-spacing="0.14em">VERIFIED CONVERSION ARCHITECTURE // KAIVEX</text>
</svg>`;
  } else {
    // 3. Default: Aerospace Flight Seal (150x150 Dial) - Perfectly Centered, Zero Inversion
    const circumference = 395.84;
    const activeArc = ((score / 100) * circumference).toFixed(1);

    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150" fill="none">
  <defs>
    <radialGradient id="dialGrad" cx="50%" cy="38%" r="62%">
      <stop offset="0%" stop-color="#14141E" />
      <stop offset="65%" stop-color="#08080C" />
      <stop offset="100%" stop-color="#020204" />
    </radialGradient>
    <linearGradient id="ringStroke" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3A3A4C" />
      <stop offset="50%" stop-color="#161622" />
      <stop offset="100%" stop-color="#2D2D3E" />
    </linearGradient>
    <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="${tierColor}" flood-opacity="0.65" />
    </filter>
  </defs>
  <circle cx="75" cy="75" r="72" fill="url(#dialGrad)" stroke="url(#ringStroke)" stroke-width="2" />
  <circle cx="75" cy="75" r="63" fill="none" stroke="#12121A" stroke-width="4" />
  <circle cx="75" cy="75" r="63" fill="none" stroke="${tierColor}" stroke-width="4" stroke-dasharray="${activeArc} 395.84" stroke-linecap="round" transform="rotate(-90 75 75)" filter="url(#arcGlow)" />
  <circle cx="75" cy="75" r="54" fill="#06060A" stroke="#181824" stroke-width="1.2" />
  <g transform="translate(75, 36) scale(0.55)">
    <polygon points="0,-10 9,-5 0,0 -9,-5" stroke="#FF5500" stroke-width="1.8" fill="#FF550025"/>
    <polygon points="-9,-5 0,0 0,10 -9,5" stroke="#FF5500" stroke-width="1.8" fill="#FF550015"/>
    <polygon points="9,-5 0,0 0,10 9,5" stroke="#FF5500" stroke-width="1.8" fill="#FF550035"/>
  </g>
  <text x="75" y="49" text-anchor="middle" font-family="ui-monospace, monospace" font-size="7" font-weight="900" fill="#A1A1AA" letter-spacing="0.16em">BLACKBOX VERIFIED</text>
  <text x="75" y="74" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="900" fill="#FFFFFF" letter-spacing="-0.03em">${score}</text>
  <text x="75" y="85" text-anchor="middle" font-family="ui-monospace, monospace" font-size="7.5" font-weight="700" fill="#71717A" letter-spacing="0.1em">/ 100 SCORE</text>
  <rect x="33" y="93" width="84" height="16" rx="3.5" fill="${tierColor}18" stroke="${tierColor}" stroke-width="1.1" />
  <text x="75" y="104.5" text-anchor="middle" font-family="ui-monospace, monospace" font-size="7.5" font-weight="900" fill="${tierColor}" letter-spacing="0.06em">${tierShort}</text>
  <text x="75" y="120" text-anchor="middle" font-family="ui-monospace, monospace" font-size="6.5" font-weight="700" fill="#52525B" letter-spacing="0.18em">KAIVEX SYSTEMS</text>
</svg>`;
  }

  return new NextResponse(svgContent, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
