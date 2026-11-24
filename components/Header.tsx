'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <header className={`no-print sticky top-0 z-40 -mx-5 px-5 transition-all sm:-mx-8 sm:px-8 ${scrolled ? 'border-b border-line bg-paper/85 backdrop-blur-md' : 'border-b border-transparent'}`}>
      <div className="flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Blackbox home">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-ink text-sm font-semibold text-paper">B</span>
          <span className="text-[17px] font-semibold tracking-tight">Blackbox</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <a href="/#how" className="hidden text-muted transition-colors hover:text-ink sm:inline">How it works</a>
          <a href="/#faq" className="hidden text-muted transition-colors hover:text-ink sm:inline">Questions</a>
          <a href="https://ahmadfarooq.vercel.app" className="text-muted transition-colors hover:text-ink">By Ahmad Farooq</a>
        </nav>
      </div>
    </header>
  );
}
