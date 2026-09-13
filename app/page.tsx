'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { TelemetryGauge } from '@/components/TelemetryGauge';
import { PillarGrid } from '@/components/PillarGrid';
import { IncidentTerminal } from '@/components/IncidentTerminal';
import { KaivexBanner } from '@/components/KaivexBanner';
import { ShareBar } from '@/components/ShareBar';
import { TelemetryResult } from '@/lib/engine/types';

function UrlQueryListener({ onTargetUrl }: { onTargetUrl: (url: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const queryUrl = searchParams.get('url');
    if (queryUrl) {
      onTargetUrl(queryUrl);
    }
  }, [searchParams, onTargetUrl]);
  return null;
}

export default function Home() {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<TelemetryResult | null>(null);

  const loadingSequence = [
    'CONNECTING TO TARGET HOST VIA HTTPS...',
    'CAPTURING FULL-PAGE DOM & VIEWPORT NODES...',
    'AUDITING PRIMARY CTA DENSITY & NAV FRICTION...',
    'EVALUATING HEADLINE SCANNABILITY & ICP HOOK...',
    'CHECKING QUANTIFIED PROOFS & CLIENT ASSETS...',
    'CALCULATING THIRD-PARTY SCRIPT LATENCY TAX...',
    'FINALIZING FLIGHT TELEMETRY & INCIDENT MANIFEST...',
  ];

  const handleAutoScan = React.useCallback((targetUrl: string) => {
    if (targetUrl && !report && !loading) {
      setUrlInput(targetUrl);
      executeScan(targetUrl);
    }
  }, [report, loading]);

  // Loading animation stepper
  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSequence.length - 1 ? prev + 1 : prev));
    }, 450);

    return () => clearInterval(interval);
  }, [loading]);

  const executeScan = async (target: string) => {
    if (!target.trim()) {
      setError('Please enter a website URL.');
      return;
    }

    setError(null);
    setLoading(true);
    setReport(null);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to complete telemetry scan.');
      }

      setReport(data.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeScan(urlInput);
  };

  const resetFlightDeck = () => {
    setReport(null);
    setError(null);
    setUrlInput('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
      <Suspense fallback={null}>
        <UrlQueryListener onTargetUrl={handleAutoScan} />
      </Suspense>

      <Header onReset={resetFlightDeck} />

      {/* SCREEN 1: THE FLIGHT DECK (HOMEPAGE / INPUT) */}
      {!report && !loading && (
        <main className="py-12 sm:py-20 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#0E0E12] border border-[#27272A] px-3.5 py-1.5 rounded-full font-mono text-[11px] text-[#FF5500] tracking-widest uppercase mb-8 shadow-[0_0_15px_rgba(255,85,0,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-ping" />
            AUTONOMOUS CONVERSION TELEMETRY // ZERO AI FLUFF
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight uppercase max-w-4xl leading-[1.08] mb-6">
            WHAT WENT WRONG BEFORE THE LEAD BOUNCED?
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[#A1A1AA] max-w-2xl leading-relaxed mb-10">
            Instant, mathematical friction diagnostics for B2B landing pages. Detect hidden navigation stalls, tracking bloat, and messaging drag in 3.5 seconds.
          </p>

          {/* Input Console */}
          <form onSubmit={handleFormSubmit} className="w-full max-w-2xl mb-8">
            <div className="relative flex flex-col sm:flex-row gap-2 bg-[#0A0A0E] border border-[#1C1C24] p-2 rounded-lg focus-within:border-[#FF5500] focus-within:shadow-[0_0_25px_rgba(255,85,0,0.2)] transition-all">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter B2B landing page URL (e.g. stripe.com)"
                className="flex-1 bg-transparent px-4 py-3.5 text-sm sm:text-base text-white placeholder-[#52525B] focus:outline-none font-mono"
              />
              <button
                type="submit"
                className="bg-[#FF5500] hover:bg-[#FF6611] text-black font-extrabold text-xs sm:text-sm px-7 py-3.5 rounded tracking-wider uppercase transition-all shadow-[0_4px_16px_rgba(255,85,0,0.35)] shrink-0"
              >
                [ INITIATE FLIGHT SCAN ]
              </button>
            </div>
            {error && (
              <div className="mt-3 text-xs font-mono text-[#FF4455] text-left px-2">
                [ERROR]: {error}
              </div>
            )}
          </form>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-[#71717A] mb-16">
            <span className="text-[#52525B]">TEST TELEMETRY ON:</span>
            {['stripe.com', 'linear.app', 'supabase.com'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setUrlInput(preset);
                  executeScan(preset);
                }}
                className="bg-[#0E0E14] hover:bg-[#181822] text-[#D4D4D8] hover:text-white border border-[#27272A] px-2.5 py-1 rounded transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Live Telemetry Ticker */}
          <div className="w-full border-t border-[#1C1C22] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 font-mono text-[11px] text-[#52525B]">
            <div>RECENT SCANS:</div>
            <div className="flex flex-wrap gap-4 text-[#71717A]">
              <span>STRIPE.COM <strong className="text-[#00FF88]">91% CLEARED</strong></span>
              <span>•</span>
              <span>LINEAR.APP <strong className="text-[#FFB700]">77% TURBULENCE</strong></span>
              <span>•</span>
              <span>DATADOG.COM <strong className="text-[#00FF88]">94% OPTIMAL</strong></span>
            </div>
          </div>
        </main>
      )}

      {/* SCREEN 2: SCANNING HUD (LOADING STATE) */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 relative flex items-center justify-center mb-8">
            <div className="absolute inset-0 border-2 border-[#161620] border-t-[#FF5500] rounded-full animate-spin" />
            <div className="w-2 h-2 rounded-full bg-[#FF5500] shadow-[0_0_12px_#FF5500]" />
          </div>

          <div className="font-mono text-xs text-[#FF5500] tracking-widest uppercase mb-3">
            BLACKBOX TELEMETRY PROBE ACTIVE
          </div>

          <div className="bg-[#09090D] border border-[#1C1C24] p-6 rounded-lg font-mono text-xs max-w-lg w-full text-left space-y-2 shadow-2xl">
            {loadingSequence.slice(0, loadingStep + 1).map((step, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 ${
                  idx === loadingStep ? 'text-[#FF5500] font-bold' : 'text-[#71717A]'
                }`}
              >
                <span className="text-[#52525B]">&gt;</span>
                <span>{step}</span>
                {idx < loadingStep && <span className="text-[#00FF88] ml-auto">[OK]</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCREEN 3: FLIGHT INCIDENT REPORT (THE CORE PRODUCT) */}
      {report && (
        <main className="py-4 animate-in fade-in duration-500">
          {/* Top Telemetry Strip */}
          <div className="bg-[#0A0A0E] border border-[#1C1C22] rounded-lg p-3 sm:p-4 grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs mb-6">
            <div>
              <span className="text-[#52525B]">TARGET: </span>
              <span className="text-white font-semibold">{report.domain}</span>
            </div>
            <div>
              <span className="text-[#52525B]">LATENCY: </span>
              <span className="text-[#A1A1AA]">{report.probeLatencyMs}ms</span>
            </div>
            <div>
              <span className="text-[#52525B]">STATUS: </span>
              <span className="text-[#00FF88]">INCIDENT_LOG_GENERATED</span>
            </div>
            <div className="text-right">
              <button
                onClick={resetFlightDeck}
                className="text-[#FF5500] hover:text-[#FF6611] underline tracking-wider uppercase"
              >
                [ SCAN ANOTHER DOMAIN ]
              </button>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Gauge Centerpiece (5 cols) */}
            <div className="lg:col-span-5">
              <TelemetryGauge
                score={report.overallScore}
                tier={report.tier}
                tierLabel={report.tierLabel}
                tierDescription={report.tierDescription}
              />
            </div>

            {/* Right: 4 Tactical Pillars (7 cols) */}
            <div className="lg:col-span-7">
              <PillarGrid pillars={report.pillars} />
            </div>
          </div>

          {/* Incident Terminal */}
          <IncidentTerminal incidents={report.incidents} />

          {/* Share and Export Bar */}
          <ShareBar
            domain={report.domain}
            score={report.overallScore}
            tierLabel={report.tierLabel}
          />

          {/* Subtle Kaivex Systems Diagnostic Note */}
          <KaivexBanner score={report.overallScore} />
        </main>
      )}

      {/* Footer */}
      <footer className="mt-16 pt-6 border-t border-[#1C1C20] flex flex-col sm:flex-row justify-between items-center gap-3 font-mono text-[11px] text-[#52525B]">
        <div>BLACKBOX TELEMETRY ENGINE // BUILT BY KAIVEX SYSTEMS</div>
        <div>100% DETERMINISTIC HEURISTICS // ZERO AI TOKENS SPENT</div>
        <div>HOSTED AT BLACKBOX-KAIVEX.VERCEL.APP</div>
      </footer>
    </div>
  );
}

