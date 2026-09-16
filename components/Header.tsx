import React from 'react';

interface HeaderProps {
  onReset?: () => void;
}

export function Header({ onReset }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-md flex justify-between items-center pb-4 pt-3 border-b border-[#1C1C20] mb-6">
      <div 
        onClick={onReset} 
        className="flex items-center gap-3.5 cursor-pointer select-none group"
      >
        <svg className="w-7 h-7 transition-transform group-hover:scale-105" viewBox="0 0 32 32" fill="none">
          <polygon points="16,2 30,10 16,18 2,10" stroke="#FF5500" stroke-width="2" fill="none" />
          <polygon points="2,10 16,18 16,30 2,22" stroke="#FF5500" stroke-width="2" fill="none" />
          <polygon points="30,10 16,18 16,30 30,22" stroke="#FF5500" stroke-width="2" fill="none" />
        </svg>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-wider text-white">BLACKBOX</span>
            <span className="hidden sm:inline font-mono text-[10px] tracking-widest text-[#FF5500] uppercase bg-[#FF5500]/10 border border-[#FF5500]/30 px-1.5 py-0.5 rounded">
              v1.0
            </span>
          </div>
          <div className="font-mono text-[11px] text-[#71717A] tracking-wider uppercase">
            B2B Flight Recorder // By Kaivex Systems
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2 bg-[#0E0E12] border border-[#27272A] px-3 py-1.5 rounded text-[11px] font-mono text-[#A1A1AA] tracking-wide">
          <span className="w-2 h-2 rounded-full bg-[#FF5500] shadow-[0_0_8px_#FF5500] animate-pulse"></span>
          <span className="hidden sm:inline">ENGINE STATUS:</span> ONLINE
        </div>
      </div>
    </header>
  );
}
