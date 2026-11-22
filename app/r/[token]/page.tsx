import type { Metadata } from 'next';
import Link from 'next/link';
import { decodeReport } from '@/lib/share';
import { ReportView } from '@/components/ReportView';
import { Header } from '@/components/Header';

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const report = decodeReport(token);
  if (!report) return { title: 'Report not found | Blackbox', robots: { index: false } };
  const title = `${report.domain} scored ${report.overallScore}/100 | Blackbox`;
  const description = `Landing page check for ${report.domain}: ${report.tierLabel}. See what to fix first.`;
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: 'article', images: [{ url: `/api/og?t=${token}`, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description, images: [`/api/og?t=${token}`] },
  };
}

export default async function ReportPage({ params }: Props) {
  const { token } = await params;
  const report = decodeReport(token);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
      <Header />
      {report ? (
        <ReportView report={report} token={token} />
      ) : (
        <main className="py-24">
          <h1 className="text-3xl font-semibold tracking-tight">We could not open this report</h1>
          <p className="mt-3 max-w-xl text-muted">The link may be cut off or edited. Run the check again to get a fresh report.</p>
          <Link href="/" className="mt-6 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-accent">Check a page</Link>
        </main>
      )}
    </div>
  );
}
