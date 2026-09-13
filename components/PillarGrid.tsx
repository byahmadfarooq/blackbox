import React from 'react';
import { PillarScore } from '@/lib/engine/types';

interface PillarGridProps {
  pillars: {
    architecture: PillarScore;
    messaging: PillarScore;
    proof: PillarScore;
    velocity: PillarScore;
  };
}

export function PillarGrid({ pillars }: PillarGridProps) {
  const items = [
    { key: 'architecture', data: pillars.architecture },
    { key: 'messaging', data: pillars.messaging },
    { key: 'proof', data: pillars.proof },
    { key: 'velocity', data: pillars.velocity },
  ];

  const getStatusColor = (status: 'pass' | 'amber' | 'crit') => {
    switch (status) {
      case 'pass':
        return 'text-[#00FF88]';
      case 'amber':
        return 'text-[#FFB700]';
      case 'crit':
        return 'text-[#FF4455]';
    }
  };

  const getProgressBarColor = (status: 'pass' | 'amber' | 'crit') => {
    switch (status) {
      case 'pass':
        return 'bg-[#00FF88]';
      case 'amber':
        return 'bg-[#FFB700]';
      case 'crit':
        return 'bg-[#FF4455]';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map(({ key, data }) => (
        <div
          key={key}
          className="bg-[#0D0D12] border border-[#1C1C24] hover:border-[#2E2E38] transition-colors rounded-lg p-5 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono text-[10px] tracking-wider uppercase text-[#71717A]">
                {data.code}
              </span>
              <span className="font-mono text-xs text-[#A1A1AA]">
                {data.score} / {data.maxScore} PTS
              </span>
            </div>

            <h4 className="text-sm font-semibold text-[#E4E4E7] tracking-tight mb-2">
              {data.name}
            </h4>

            <div className="flex items-baseline gap-2 mb-3">
              <span className={`text-4xl font-extrabold tracking-tight ${getStatusColor(data.status)}`}>
                {data.percentage}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-[#16161D] rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-700 ${getProgressBarColor(data.status)}`}
                style={{ width: `${data.percentage}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-[#71717A] leading-relaxed">
            {data.summary}
          </p>
        </div>
      ))}
    </div>
  );
}
