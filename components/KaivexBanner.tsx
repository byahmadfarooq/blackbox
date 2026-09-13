import React from 'react';

interface KaivexBannerProps {
  score: number;
}

export function KaivexBanner({ score }: KaivexBannerProps) {
  return (
    <div className="bg-[#0A0A0E] border border-[#FF5500]/70 rounded-lg p-6 sm:p-8 relative overflow-hidden shadow-[0_0_35px_rgba(255,85,0,0.12)] my-8">
      {/* Background Accent Gradient */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#FF5500]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="font-mono text-[11px] font-bold text-[#FF5500] tracking-widest uppercase mb-2">
            CONVERSION ARCHITECTURE // KAIVEX SYSTEMS
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
            Eliminate Friction Stalls in 14 Days
          </h3>

          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
            Diagnosing bottlenecks is step one. Kaivex Systems engineers bespoke, sub-second digital front doors with zero template bloat, built to turn qualified B2B traffic into booked pipeline.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
          <a
            href="https://cal.com/ahmadfarooq"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FF5500] hover:bg-[#FF6611] text-black font-bold text-xs sm:text-sm px-6 py-3 rounded tracking-wide uppercase text-center transition-all shadow-[0_4px_20px_rgba(255,85,0,0.3)] hover:shadow-[0_6px_25px_rgba(255,85,0,0.45)] hover:-translate-y-0.5"
          >
            Book 15-Min Architecture Triage
          </a>
          <span className="font-mono text-[11px] text-[#71717A] text-center">
            Direct review with Ahmad Farooq
          </span>
        </div>
      </div>
    </div>
  );
}
