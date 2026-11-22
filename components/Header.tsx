import React from 'react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="no-print flex items-center justify-between py-5">
      <Link href="/" className="flex items-center gap-2.5" aria-label="Blackbox home">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-ink text-sm font-semibold text-paper">B</span>
        <span className="text-[17px] font-semibold tracking-tight">Blackbox</span>
      </Link>
      <a href="https://ahmadfarooq.vercel.app" className="text-sm text-muted transition-colors hover:text-ink">
        By Ahmad Farooq
      </a>
    </header>
  );
}
