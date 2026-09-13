import React, { useState } from 'react';

interface ShareBarProps {
  domain: string;
  score: number;
  tierLabel: string;
}

export function ShareBar({ domain, score, tierLabel }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [badgeType, setBadgeType] = useState<'CIRCULAR' | 'HORIZONTAL'>('CIRCULAR');
  const [codeFormat, setCodeFormat] = useState<'HTML' | 'MARKDOWN'>('HTML');
  const [badgeCopied, setBadgeCopied] = useState(false);

  const shareUrl = `https://blackbox-kaivex.vercel.app/?url=${encodeURIComponent(domain)}`;

  const tierColor = score >= 90 ? '#00FF88' : score >= 75 ? '#FFB700' : '#FF5500';
  const tierShort = score >= 90 ? 'TIER S // OPTIMAL' : score >= 75 ? 'TIER A // VERIFIED' : 'TIER B // DRAG';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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

  // 1. CIRCULAR AEROSPACE MEDALLION (130x130)
  const circularSvgCode = `<a href="${shareUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;text-decoration:none;">
  <svg xmlns="http://www.w3.org/2000/svg" width="130" height="130" viewBox="0 0 130 130" fill="none">
    <circle cx="65" cy="65" r="63" fill="#07070A" stroke="#222228" stroke-width="2"/>
    <circle cx="65" cy="65" r="57" fill="none" stroke="#FF5500" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.85"/>
    <circle cx="65" cy="65" r="51" fill="#0C0C12" stroke="#1C1C24" stroke-width="1"/>
    <!-- Cube Icon -->
    <g transform="translate(65, 26) scale(0.65)">
      <polygon points="0,-12 10,-6 0,0 -10,-6" stroke="#FF5500" stroke-width="2" fill="none"/>
      <polygon points="-10,-6 0,0 0,12 -10,6" stroke="#FF5500" stroke-width="2" fill="none"/>
      <polygon points="10,-6 0,0 0,12 10,6" stroke="#FF5500" stroke-width="2" fill="none"/>
    </g>
    <!-- Score Readout -->
    <text x="65" y="66" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="32" font-weight="900" fill="#FFFFFF" letter-spacing="-0.03em">${score}</text>
    <text x="65" y="78" text-anchor="middle" font-family="ui-monospace, monospace" font-size="8.5" font-weight="700" fill="#71717A" letter-spacing="0.14em">/ 100 INDEX</text>
    <!-- Tier Tag -->
    <rect x="22" y="85" width="86" height="18" rx="3" fill="${tierColor}18" stroke="${tierColor}" stroke-width="1"/>
    <text x="65" y="97.5" text-anchor="middle" font-family="ui-monospace, monospace" font-size="8" font-weight="800" fill="${tierColor}" letter-spacing="0.06em">${tierShort}</text>
    <!-- Kaivex Systems attribution -->
    <text x="65" y="117" text-anchor="middle" font-family="ui-monospace, monospace" font-size="7" font-weight="600" fill="#52525B" letter-spacing="0.12em">KAIVEX SYSTEMS</text>
  </svg>
</a>`;

  // 2. HORIZONTAL PRECISION CAPSULE (250x38)
  const horizontalSvgCode = `<a href="${shareUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;text-decoration:none;">
  <svg xmlns="http://www.w3.org/2000/svg" width="250" height="38" viewBox="0 0 250 38" fill="none">
    <rect width="250" height="38" rx="6" fill="#09090D" stroke="#222228" stroke-width="1"/>
    <!-- Cube Icon -->
    <g transform="translate(18, 19) scale(0.65)">
      <polygon points="0,-12 10,-6 0,0 -10,-6" stroke="#FF5500" stroke-width="2" fill="none"/>
      <polygon points="-10,-6 0,0 0,12 -10,6" stroke="#FF5500" stroke-width="2" fill="none"/>
      <polygon points="10,-6 0,0 0,12 10,6" stroke="#FF5500" stroke-width="2" fill="none"/>
    </g>
    <text x="35" y="23.5" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11.5" font-weight="900" fill="#FFFFFF" letter-spacing="0.08em">BLACKBOX</text>
    <!-- Hairline Divider -->
    <line x1="112" y1="8" x2="112" y2="30" stroke="#1E1E26" stroke-width="1"/>
    <!-- Status Dot -->
    <circle cx="126" cy="19" r="3.5" fill="${tierColor}"/>
    <text x="136" y="23" font-family="ui-monospace, monospace" font-size="11" font-weight="800" fill="#FFFFFF">SCORE ${score}</text>
    <text x="195" y="23" font-family="ui-monospace, monospace" font-size="9.5" fill="#71717A">/100</text>
  </svg>
</a>`;

  const activeCode = badgeType === 'CIRCULAR' ? circularSvgCode : horizontalSvgCode;
  const markdownCode = `[![Blackbox Telemetry Badge](${shareUrl})](${shareUrl})`;
  const codeToCopy = codeFormat === 'HTML' ? activeCode : markdownCode;

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

  const handleLinkedInShare = async () => {
    const postCopy = `Curious how your landing page holds up before visitors bounce?

Just put ${domain} through Blackbox (the conversion flight recorder by Kaivex Systems) to recover our flight data.

Score: ${score}/100 (${tierLabel})

It runs instant mathematical checks on navigation friction, reading level, proof density, and third-party script lag in about 3 seconds.

Curious to see what your site scores? Drop your link in here:
${shareUrl}`;

    try {
      await navigator.clipboard.writeText(postCopy);
      showToast('✓ Friendly post copy copied to clipboard! Paste it directly into your LinkedIn post.');
    } catch {
      // Fallback
    }

    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  const handleXShare = () => {
    const tweetText = `Curious what happens before visitors bounce on your landing page?

Put ${domain} through Blackbox: scored ${score}/100 (${tierLabel}).

Run your site through the flight recorder:
${shareUrl}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0E0E14] border border-[#FF5500] text-white px-4 py-3 rounded-lg shadow-2xl font-mono text-xs flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Share Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 px-2 border-t border-[#1C1C24] my-4 font-mono text-xs text-[#71717A]">
        <div className="flex items-center gap-2">
          <span className="text-[#52525B]">PERMALINK:</span>
          <span className="text-[#E4E4E7] select-all">blackbox-kaivex.vercel.app/?url={domain}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleLinkedInShare}
            className="bg-[#0E0E14] hover:bg-[#161620] text-[#D4D4D8] hover:text-[#FF5500] border border-[#27272A] hover:border-[#FF5500]/60 px-3 py-1.5 rounded transition-colors uppercase tracking-wider"
          >
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

      {/* Modern Badge Modal */}
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
                className={`flex-1 py-2 px-3 rounded border transition-colors ${
                  badgeType === 'CIRCULAR'
                    ? 'border-[#FF5500] bg-[#FF5500]/10 text-white font-bold'
                    : 'border-[#1C1C24] text-[#71717A] hover:text-white'
                }`}
              >
                Circular Medallion (Seal)
              </button>
              <button
                onClick={() => setBadgeType('HORIZONTAL')}
                className={`flex-1 py-2 px-3 rounded border transition-colors ${
                  badgeType === 'HORIZONTAL'
                    ? 'border-[#FF5500] bg-[#FF5500]/10 text-white font-bold'
                    : 'border-[#1C1C24] text-[#71717A] hover:text-white'
                }`}
              >
                Tactical Capsule (Pill)
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
