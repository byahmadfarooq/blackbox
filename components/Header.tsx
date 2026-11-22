import React from 'react';

export function Header({ onReset }: { onReset?: () => void }) {
  return (
    <header className="flex items-center justify-between py-5">
      <button onClick={onReset} className="flex items-center gap-2.5 text-left" aria-label="Blackbox home">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-ink text-paper text-sm font-semibold">B</span>
        <span className="text-[17px] font-semibold tracking-tight">Blackbox</span>
      </button>
      <a
        href="https://ahmadfarooq.vercel.app"
        className="text-sm text-muted hover:text-ink transition-colors"
      >
        By Ahmad Farooq
      </a>
    </header>
  );
}
