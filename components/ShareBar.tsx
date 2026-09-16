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

  // 1. AEROSPACE FLIGHT SEAL (150x150) - Precision Dial with Curved Radial Telemetry
  const circumference = 395.84;
  const activeArc = ((score / 100) * circumference).toFixed(1);

  const circularSvgCode = `<a href="${shareUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;text-decoration:none;">
  <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150" fill="none">
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
  </svg>
</a>`;

  // 2. TACTICAL DUAL-COMPARTMENT CAPSULE (290x38)
  const horizontalSvgCode = `<a href="${shareUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;text-decoration:none;">
  <svg xmlns="http://www.w3.org/2000/svg" width="290" height="38" viewBox="0 0 290 38" fill="none">
    <defs>
      <linearGradient id="capBorderShare" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3A3A4C" />
        <stop offset="50%" stop-color="#181822" />
        <stop offset="100%" stop-color="#2D2D3C" />
      </linearGradient>
      <linearGradient id="capBgLShare" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#121218" />
        <stop offset="100%" stop-color="#09090D" />
      </linearGradient>
    </defs>
    <rect width="290" height="38" rx="6" fill="#060609" stroke="url(#capBorderShare)" stroke-width="1.2" />
    <path d="M 0 6 Q 0 0 6 0 L 152 0 L 152 38 L 6 38 Q 0 38 0 32 Z" fill="url(#capBgLShare)" />
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
  </svg>
</a>`;

  // 3. COCKPIT FLIGHT PLAQUE (260x76 HUD)
  const hudPlateSvgCode = `<a href="${shareUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;text-decoration:none;">
  <svg xmlns="http://www.w3.org/2000/svg" width="260" height="76" viewBox="0 0 260 76" fill="none">
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
