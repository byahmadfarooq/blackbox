import React from 'react';
import { SurvivabilityTier } from '@/lib/engine/types';

interface TelemetryGaugeProps {
  score: number;
  tier: SurvivabilityTier;
  tierLabel: string;
  tierDescription: string;
}

export function TelemetryGauge({ score, tier, tierLabel, tierDescription }: TelemetryGaugeProps) {
  const radius = 95;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Tier color mapping
  const tierColor =
    score >= 90
      ? 'border-[#00FF88] text-[#00FF88] bg-[#00FF88]/10'
      : score >= 75
      ? 'border-[#FFB700] text-[#FFB700] bg-[#FFB700]/10'
      : score >= 50
      ? 'border-[#FF5500] text-[#FF5500] bg-[#FF5500]/10'
      : 'border-[#FF4455] text-[#FF4455] bg-[#FF4455]/10';

  const gaugeGradientColor =
    score >= 90
      ? { start: '#00FF88', end: '#00B359' }
      : score >= 75
      ? { start: '#FFB700', end: '#FF8800' }
      : score >= 50
      ? { start: '#FF7700', end: '#FF3300' }
      : { start: '#FF4455', end: '#B30018' };

  return (
    <div className="bg-[#0A0A0E] border border-[#1C1C22] rounded-lg p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
      <div className="relative w-64 h-64 flex items-center justify-center mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gaugeGradientColor.start} />
              <stop offset="100%" stopColor={gaugeGradientColor.end} />
            </linearGradient>
          </defs>
          {/* Background Track */}
          <circle
            className="fill-none stroke-[#16161D]"
            strokeWidth="14"
            cx="120"
            cy="120"
            r={radius}
          />
          {/* Active Meter */}
          <circle
            className="fill-none transition-all duration-1000 ease-out"
            stroke="url(#gaugeGradient)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              filter: `drop-shadow(0 0 16px ${score >= 75 ? 'rgba(255,183,0,0.4)' : 'rgba(255,85,0,0.5)'})`,
            }}
            cx="120"
            cy="120"
            r={radius}
          />
        </svg>

        {/* Readout */}
        <div className="absolute z-10 flex flex-col items-center">
          <span className="text-7xl font-black tracking-tighter text-white leading-none">
            {score}
          </span>
          <span className="font-mono text-xs text-[#71717A] tracking-widest uppercase mt-2">
            / 100 INDEX
          </span>
        </div>
      </div>

      <div className={`font-mono text-xs font-bold px-4 py-1.5 rounded tracking-wider uppercase border mb-3 ${tierColor}`}>
        {tierLabel}
      </div>

      <p className="text-xs text-[#A1A1AA] max-w-xs leading-relaxed">
        {tierDescription}
      </p>
    </div>
  );
}
