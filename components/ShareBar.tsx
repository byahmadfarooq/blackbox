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
  const [badgeFormat, setBadgeFormat] = useState<'HTML' | 'MARKDOWN'>('HTML');
  const [badgeCopied, setBadgeCopied] = useState(false);

  const shareUrl = `https://blackbox.kaivex.vercel.app/?url=${encodeURIComponent(domain)}`;

  const tierColor = score >= 90 ? '#00FF88' : score >= 75 ? '#FFB700' : '#FF5500';

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

  // Ultra-sleek SVG Badge Snippet
  const svgBadgeCode = `<a href="${shareUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;text-decoration:none;">
  <svg xmlns="http://www.w3.org/2000/svg" width="220" height="34" viewBox="0 0 220 34" fill="none">
    <rect width="220" height="34" rx="6" fill="#0A0A0E" stroke="#27272A" stroke-width="1"/>
    <!-- Blackbox Cube -->
    <polygon points="17,10 24,14 17,18 10,14" stroke="#FF5500" stroke-width="1.4" fill="none"/>
    <polygon points="10,14 17,18 17,25 10,21" stroke="#FF5500" stroke-width="1.4" fill="none"/>
    <polygon points="24,14 17,18 17,25 24,21" stroke="#FF5500" stroke-width="1.4" fill="none"/>
    <text x="32" y="21.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" fill="#FFFFFF" letter-spacing="0.06em">BLACKBOX</text>
    <!-- Divider -->
    <line x1="102" y1="8" x2="102" y2="26" stroke="#27272A" stroke-width="1"/>
    <!-- Status Dot -->
    <circle cx="116" cy="17" r="3.5" fill="${tierColor}"/>
    <text x="126" y="21" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="11" font-weight="700" fill="#E4E4E7">SCORE ${score}</text>
    <text x="180" y="21" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="9" fill="#71717A">/100</text>
  </svg>
</a>`;

  const markdownBadgeCode = `[![Blackbox Telemetry Score](${shareUrl})](${shareUrl})`;

  const copyBadgeSnippet = async () => {
    const code = badgeFormat === 'HTML' ? svgBadgeCode : markdownBadgeCode;
    try {
      await navigator.clipboard.writeText(code);
      setBadgeCopied(true);
      showToast(`✓ ${badgeFormat} badge snippet copied to clipboard.`);
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
          <span className="text-[#E4E4E7] select-all">blackbox.kaivex.vercel.app/?url={domain}</span>
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
            className="bg-[#FF5500]/10 hover:bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/40 px-3 py-1.5 rounded transition-colors uppercase tracking-wider font-semibold"
          >
            Embed Badge
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
                  Blackbox Verified Telemetry Badge
                </h4>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Display your official conversion architecture score on your site or README.
                </p>
              </div>
              <button
                onClick={() => setShowBadgeModal(false)}
                className="text-[#71717A] hover:text-white font-mono text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Live Badge Preview */}
            <div className="bg-[#050505] border border-[#1C1C22] rounded-lg p-6 flex flex-col items-center justify-center gap-3 my-4">
              <span className="font-mono text-[10px] text-[#52525B] tracking-wider uppercase">
                PREVIEW
              </span>
              <div dangerouslySetInnerHTML={{ __html: svgBadgeCode }} />
            </div>

            {/* Code Format Toggles */}
            <div className="flex gap-2 mb-3">
              {(['HTML', 'MARKDOWN'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setBadgeFormat(fmt)}
                  className={`font-mono text-[11px] px-3 py-1 rounded transition-colors ${
                    badgeFormat === fmt
                      ? 'bg-[#1C1C24] text-white font-bold'
                      : 'text-[#71717A] hover:text-[#D4D4D8]'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Code Box */}
            <div className="bg-[#050508] border border-[#1C1C22] rounded p-3 font-mono text-[11px] text-[#A1A1AA] overflow-x-auto max-h-28 mb-5 select-all">
              {badgeFormat === 'HTML' ? svgBadgeCode : markdownBadgeCode}
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
                {badgeCopied ? '✓ Copied to Clipboard' : 'Copy Snippet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
