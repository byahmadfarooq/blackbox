import React, { useState } from 'react';
import { TelemetryResult } from '@/lib/engine/types';

interface ShareBarProps {
  report: TelemetryResult;
}

export function ShareBar({ report }: ShareBarProps) {
  const { domain, overallScore: score, tierLabel, archetypeCalibration, pillars, incidents, rawMetrics } = report;

  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [linkedInCopyFormat, setLinkedInCopyFormat] = useState<'FOUNDER' | 'TEARDOWN' | 'METRICS'>('FOUNDER');
  const [copyingImage, setCopyingImage] = useState(false);
  const [badgeType, setBadgeType] = useState<'CIRCULAR' | 'HORIZONTAL' | 'HUD_PLATE'>('CIRCULAR');
  const [codeFormat, setCodeFormat] = useState<'HTML' | 'MARKDOWN'>('HTML');
  const [badgeCopied, setBadgeCopied] = useState(false);

  const shareUrl = `https://blackbox-kaivex.vercel.app/?url=${encodeURIComponent(domain)}`;
  const ogImageUrl = `/api/og?domain=${encodeURIComponent(domain)}&score=${score}&tier=${encodeURIComponent(tierLabel)}`;

  const tierColor = score >= 90 ? '#00FF88' : score >= 75 ? '#FFB700' : score >= 50 ? '#FF8800' : '#FF3344';
  const tierShort = score >= 90 ? 'TIER S // OPTIMAL' : score >= 75 ? 'TIER A // VERIFIED' : score >= 50 ? 'TIER B // DRAG' : 'TIER C // CRITICAL';
  const tierLetter = score >= 90 ? 'S' : score >= 75 ? 'A' : score >= 50 ? 'B' : 'C';
  const activeArcLength = ((score / 100) * 226.2).toFixed(1);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast('✓ Shareable report link copied to clipboard.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  // LinkedIn Post Copies (Human, Builder-to-Builder tone)
  const topFriction = incidents.find((i) => i.severity === 'FATAL_STALL') || incidents.find((i) => i.severity === 'FRICTION_WARN');

  const postCopies = {
    FOUNDER: `Curious what cold traffic actually experiences before bouncing?

Just put ${domain} through Blackbox (the conversion flight recorder by Kaivex Systems) to recover our flight data.

Diagnostic readout: ${score}/100 (${tierLabel})
Architecture archetype: ${archetypeCalibration.label}

Pillar breakdown:
• Conversion Architecture: ${pillars.architecture.score}/30
• Messaging Clarity: ${pillars.messaging.score}/25
• Proof Density: ${pillars.proof.score}/25
• Technical Velocity: ${pillars.velocity.score}/20
${topFriction ? `\nTop takeaway: ${topFriction.plainEnglishImpact}` : ''}

Curious what your site scores? Drop your URL in the recorder (100% free, zero AI fluff):
${shareUrl}`,

    TEARDOWN: `Most B2B landing pages leak high-intent leads without ever knowing why.

Ran a flight diagnostic on ${domain} via Blackbox:
Score: ${score}/100 (${tierLabel})
Benchmark standard: ${archetypeCalibration.benchmarkStandard}

Key friction points detected:
${incidents
  .filter((i) => i.severity !== 'CLEARED')
  .slice(0, 3)
  .map((i) => `→ ${i.headline}: ${i.plainEnglishImpact}`)
  .join('\n\n')}

Audit your own landing page in 3.5 seconds:
${shareUrl}`,

    METRICS: `Conversion flight telemetry for ${domain}:

Score: ${score}/100
Status: ${tierLabel}
Archetype: ${archetypeCalibration.label}
Readability: Grade ${rawMetrics.readability.gradeLevel}
Top Navigation: ${rawMetrics.heroNavLinksCount} links
Third-Party Scripts: ${rawMetrics.thirdPartyScriptCount} trackers

Recover your page's flight data:
${shareUrl}`,
  };

  const activePostCopy = postCopies[linkedInCopyFormat];

  const copyPostCopy = async () => {
    try {
      await navigator.clipboard.writeText(activePostCopy);
      showToast('✓ Post text copied to clipboard! Paste it into LinkedIn.');
    } catch {
      // Fallback
    }
  };

  const copyImageToClipboard = async () => {
    setCopyingImage(true);
    try {
      const res = await fetch(ogImageUrl);
      const blob = await res.blob();
      if (typeof ClipboardItem !== 'undefined') {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        showToast('✓ High-res PNG card copied to clipboard! You can now press CTRL+V directly in LinkedIn.');
      } else {
        throw new Error('ClipboardItem not supported');
      }
    } catch {
      await downloadImage();
      showToast('Downloaded PNG card (Direct clipboard image copy fell back to download).');
    } finally {
      setCopyingImage(false);
    }
  };

  const downloadImage = async () => {
    try {
      const res = await fetch(ogImageUrl);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `${domain}-blackbox-flight-card.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
      showToast(`✓ Saved ${domain}-blackbox-flight-card.png`);
    } catch {
      // Fallback
    }
  };

  const launchLinkedInComposer = () => {
    window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank', 'noopener,noreferrer');
  };

  const handleXShare = () => {
    const tweetText = `Curious what happens before visitors bounce on your landing page?

Put ${domain} through Blackbox: scored ${score}/100 (${tierLabel}).
Calibrated for: ${archetypeCalibration.label}

Run your site through the flight recorder:
${shareUrl}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
  };

  // 1. AEROSPACE FLIGHT SEAL (140x140)
  const circularSvgCode = `<a href="${shareUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;text-decoration:none;">
  <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140" fill="none">
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
  </svg>
</a>`;

  // 2. TACTICAL FLIGHT CAPSULE (240x36)
  const horizontalSvgCode = `<a href="${shareUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;text-decoration:none;">
  <svg xmlns="http://www.w3.org/2000/svg" width="240" height="36" viewBox="0 0 240 36" fill="none">
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
  </svg>
</a>`;

  // 3. COCKPIT FLIGHT PLATE (220x68)
  const hudPlateSvgCode = `<a href="${shareUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;text-decoration:none;">
  <svg xmlns="http://www.w3.org/2000/svg" width="220" height="68" viewBox="0 0 220 68" fill="none">
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
  </svg>
</a>`;

  const badgeTypeParam = badgeType === 'CIRCULAR' ? 'circular' : badgeType === 'HORIZONTAL' ? 'capsule' : 'hud';
  const badgeImageUrl = `https://blackbox-kaivex.vercel.app/api/badge?score=${score}&type=${badgeTypeParam}`;

  const activeCode = badgeType === 'CIRCULAR' ? circularSvgCode : badgeType === 'HORIZONTAL' ? horizontalSvgCode : hudPlateSvgCode;
  const markdownCode = `[![Blackbox Telemetry Badge (${score}/100)](${badgeImageUrl})](${shareUrl})`;
  const htmlEmbedCode = `<a href="${shareUrl}" target="_blank" rel="noopener noreferrer"><img src="${badgeImageUrl}" alt="Blackbox Telemetry Seal - ${score}/100" /></a>`;
  const codeToCopy = codeFormat === 'HTML' ? htmlEmbedCode : markdownCode;

  const copyBadgeSnippet = async () => {
    try {
      await navigator.clipboard.writeText(codeToCopy);
      setBadgeCopied(true);
      showToast(`✓ ${badgeType} badge (${codeFormat}) copied to clipboard.`);
      setTimeout(() => setBadgeCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0E0E14] border border-[#FF5500] text-white px-4 py-3 rounded-lg shadow-2xl font-mono text-xs flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-md">
          <span className="w-2 h-2 rounded-full bg-[#FF5500] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Share Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 px-2 border-t border-[#1C1C24] my-4 font-mono text-xs text-[#71717A]">
        <div className="flex items-center gap-2">
          <span className="text-[#52525B]">PERMALINK:</span>
          <span className="text-[#E4E4E7] select-all">blackbox-kaivex.vercel.app/?url={domain}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowLinkedInModal(true)}
            className="bg-[#0E0E14] hover:bg-[#161620] text-[#D4D4D8] hover:text-[#FF5500] border border-[#27272A] hover:border-[#FF5500]/60 px-3.5 py-1.5 rounded transition-colors uppercase tracking-wider flex items-center gap-2 font-semibold"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
            Broadcast on LinkedIn
          </button>

          <button
            onClick={handleXShare}
            className="bg-[#0E0E14] hover:bg-[#161620] text-[#D4D4D8] hover:text-[#FF5500] border border-[#27272A] hover:border-[#FF5500]/60 px-3 py-1.5 rounded transition-colors uppercase tracking-wider"
          >
            Share on X
          </button>

          <button
            onClick={copyLink}
            className="bg-[#0E0E14] hover:bg-[#161620] text-[#D4D4D8] hover:text-white border border-[#27272A] px-3 py-1.5 rounded transition-colors uppercase tracking-wider"
          >
            {copied ? '✓ Link Copied' : 'Copy Link'}
          </button>

          <button
            onClick={() => setShowBadgeModal(true)}
            className="bg-[#FF5500]/10 hover:bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/40 px-3.5 py-1.5 rounded transition-colors uppercase tracking-wider font-semibold"
          >
            Get Verified Badge
          </button>
        </div>
      </div>

      {/* MODAL 1: LINKEDIN BROADCAST COMMAND CENTER */}
      {showLinkedInModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#09090D] border border-[#1F1F28] rounded-xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-5 border-b border-[#1C1C24] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                  <span className="font-mono text-[10px] text-[#00FF88] tracking-widest uppercase">
                    LINKEDIN BROADCAST SUITE
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Share Telemetry Report for {domain}
                </h3>
                <p className="text-xs text-[#71717A] mt-0.5">
                  1-Click workflow: Copy high-resolution visual card and human-written post copy.
                </p>
              </div>
              <button
                onClick={() => setShowLinkedInModal(false)}
                className="text-[#71717A] hover:text-white font-mono text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Step 1: Visual Card Preview & Clipboard Copy */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-xs font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#FF5500]/20 text-[#FF5500] flex items-center justify-center text-[10px] font-bold">1</span>
                  VISUAL TELEMETRY CARD (1200x630)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={copyImageToClipboard}
                    disabled={copyingImage}
                    className="bg-[#FF5500] hover:bg-[#FF6611] text-black font-bold font-mono text-xs px-3.5 py-1.5 rounded transition-all shadow-[0_2px_10px_rgba(255,85,0,0.3)] flex items-center gap-1.5"
                  >
                    {copyingImage ? 'Generating...' : 'Copy Image to Clipboard'}
                  </button>
                  <button
                    onClick={downloadImage}
                    className="bg-[#161620] hover:bg-[#20202E] text-[#D4D4D8] border border-[#2A2A38] font-mono text-xs px-3 py-1.5 rounded transition-colors"
                  >
                    Download PNG
                  </button>
                </div>
              </div>

              <div className="rounded-lg overflow-hidden border border-[#1F1F28] bg-[#050508] relative group">
                <img
                  src={ogImageUrl}
                  alt={`${domain} Blackbox Telemetry Card`}
                  className="w-full h-auto object-cover max-h-56"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 font-mono text-[10px] text-[#A1A1AA] flex justify-between items-center">
                  <span>READY FOR DIRECT CTRL+V INTO LINKEDIN</span>
                  <span className="text-[#00FF88]">1200x630 RETINA ASSET</span>
                </div>
              </div>
            </div>

            {/* Step 2: Post Copy Voice Selection */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-xs font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#FF5500]/20 text-[#FF5500] flex items-center justify-center text-[10px] font-bold">2</span>
                  SELECT POST VOICE (HUMAN-WRITTEN)
                </span>
                <div className="flex gap-1 font-mono text-[11px]">
                  {(['FOUNDER', 'TEARDOWN', 'METRICS'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setLinkedInCopyFormat(fmt)}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        linkedInCopyFormat === fmt
                          ? 'bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/40 font-bold'
                          : 'text-[#71717A] hover:text-white border border-transparent'
                      }`}
                    >
                      {fmt === 'FOUNDER' ? 'Founder Take' : fmt === 'TEARDOWN' ? 'Teardown' : 'Data Points'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable Post Copy Box */}
              <div className="relative bg-[#050508] border border-[#1F1F28] rounded-lg p-3.5 font-mono text-xs text-[#D4D4D8] whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto select-all">
                {activePostCopy}
              </div>

              <div className="flex justify-between items-center mt-2.5 font-mono text-[11px]">
                <span className="text-[#52525B]">CALIBRATED FOR: {archetypeCalibration.label}</span>
                <button
                  onClick={copyPostCopy}
                  className="bg-[#181824] hover:bg-[#222234] text-white border border-[#2E2E40] px-4 py-1.5 rounded transition-colors font-semibold"
                >
                  Copy Post Text
                </button>
              </div>
            </div>

            {/* Step 3: Launch LinkedIn Composer */}
            <div className="pt-4 border-t border-[#1C1C24] flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="font-mono text-[11px] text-[#71717A]">
                Workflow: 1. Copy Image &gt; 2. Copy Text &gt; 3. Paste into LinkedIn Composer
              </div>
              <div className="flex gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => setShowLinkedInModal(false)}
                  className="flex-1 sm:flex-initial font-mono text-xs text-[#71717A] hover:text-white px-3 py-2"
                >
                  Close
                </button>
                <button
                  onClick={launchLinkedInComposer}
                  className="flex-1 sm:flex-initial bg-[#0A66C2] hover:bg-[#004182] text-white font-bold font-mono text-xs px-5 py-2.5 rounded transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  Launch LinkedIn Composer →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: OFFICIAL VERIFIED BADGES */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0A0E] border border-[#1C1C24] rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-base font-bold text-white tracking-tight">
                  Official Blackbox Verified Badge
                </h4>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Display your official conversion architecture verification seal on your site.
                </p>
              </div>
              <button
                onClick={() => setShowBadgeModal(false)}
                className="text-[#71717A] hover:text-white font-mono text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Badge Style Toggles */}
            <div className="flex gap-2 my-3 font-mono text-xs">
              <button
                onClick={() => setBadgeType('CIRCULAR')}
                className={`flex-1 py-2 px-2.5 rounded border transition-colors ${
                  badgeType === 'CIRCULAR'
                    ? 'border-[#FF5500] bg-[#FF5500]/10 text-white font-bold'
                    : 'border-[#1C1C24] text-[#71717A] hover:text-white'
                }`}
              >
                Flight Seal (Round)
              </button>
              <button
                onClick={() => setBadgeType('HORIZONTAL')}
                className={`flex-1 py-2 px-2.5 rounded border transition-colors ${
                  badgeType === 'HORIZONTAL'
                    ? 'border-[#FF5500] bg-[#FF5500]/10 text-white font-bold'
                    : 'border-[#1C1C24] text-[#71717A] hover:text-white'
                }`}
              >
                Developer Pill (Capsule)
              </button>
              <button
                onClick={() => setBadgeType('HUD_PLATE')}
                className={`flex-1 py-2 px-2.5 rounded border transition-colors ${
                  badgeType === 'HUD_PLATE'
                    ? 'border-[#FF5500] bg-[#FF5500]/10 text-white font-bold'
                    : 'border-[#1C1C24] text-[#71717A] hover:text-white'
                }`}
              >
                Cockpit Plate (HUD)
              </button>
            </div>

            {/* Live Badge Preview Box */}
            <div className="bg-[#050505] border border-[#1C1C22] rounded-lg p-6 flex flex-col items-center justify-center gap-3 my-3 min-h-[160px]">
              <span className="font-mono text-[9px] text-[#52525B] tracking-widest uppercase">
                LIVE RETINA PREVIEW
              </span>
              <div dangerouslySetInnerHTML={{ __html: activeCode }} />
            </div>

            {/* Code Format Toggles */}
            <div className="flex gap-2 mb-2">
              {(['HTML', 'MARKDOWN'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setCodeFormat(fmt)}
                  className={`font-mono text-[10.5px] px-3 py-1 rounded transition-colors ${
                    codeFormat === fmt
                      ? 'bg-[#1C1C24] text-white font-bold'
                      : 'text-[#71717A] hover:text-[#D4D4D8]'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Code Box */}
            <div className="bg-[#050508] border border-[#1C1C22] rounded p-3 font-mono text-[10.5px] text-[#A1A1AA] overflow-x-auto max-h-24 mb-4 select-all">
              {codeToCopy}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBadgeModal(false)}
                className="font-mono text-xs text-[#71717A] hover:text-white px-4 py-2"
              >
                Close
              </button>
              <button
                onClick={copyBadgeSnippet}
                className="bg-[#FF5500] hover:bg-[#FF6611] text-black font-bold font-mono text-xs px-5 py-2 rounded transition-all shadow-[0_2px_12px_rgba(255,85,0,0.3)]"
              >
                {badgeCopied ? '✓ Copied to Clipboard' : 'Copy Badge Code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
