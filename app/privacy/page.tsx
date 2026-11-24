import type { Metadata } from 'next';
import { Header } from '@/components/Header';

export const metadata: Metadata = { title: 'Privacy | Blackbox' };

export default function Privacy() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
      <Header />
      <main className="max-w-2xl pb-20 pt-10 leading-relaxed">
        <h1 className="text-3xl font-semibold tracking-tight">Privacy</h1>
        <p className="mt-4 text-muted">Blackbox is a free tool by Ahmad Farooq. This page says what it collects and why.</p>
        <h2 className="mt-8 text-xl font-semibold">What we collect</h2>
        <p className="mt-2">When you run a check we save your email, your business type, the website you checked, the score it received and the time. We only keep your email if you tick the box agreeing to be emailed.</p>
        <h2 className="mt-8 text-xl font-semibold">What we do not keep</h2>
        <p className="mt-2">We do not store the page itself. The report lives inside its own link. Anyone with that link can open the report, so share it only with people you trust.</p>
        <h2 className="mt-8 text-xl font-semibold">How we use it</h2>
        <p className="mt-2">To send you your report and occasional tips on improving your page, and to understand what kinds of businesses use the tool. We do not sell your details.</p>
        <h2 className="mt-8 text-xl font-semibold">Unsubscribe or delete</h2>
        <p className="mt-2">Email byahmadfarooq@gmail.com and ask to be removed. We will delete your details.</p>
      </main>
    </div>
  );
}
