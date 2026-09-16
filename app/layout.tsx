import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BLACKBOX // B2B Funnel Flight Recorder",
  description: "Instant, deterministic conversion friction telemetry for B2B landing pages. Detect hidden conversion stalls, tracking bloat, and messaging drag in 3.5 seconds.",
  metadataBase: new URL("https://blackbox-kaivex.vercel.app"),
  openGraph: {
    title: "BLACKBOX // B2B Funnel Flight Recorder",
    description: "What went wrong before the lead bounced? Run instant, mathematical conversion friction telemetry on any B2B landing page.",
    url: "https://blackbox-kaivex.vercel.app",
    siteName: "Blackbox by Kaivex Systems",
    images: [
      {
        url: "https://blackbox-kaivex.vercel.app/api/og?url=blackbox-kaivex.vercel.app&score=100&tier=TIER_S_OPTIMAL",
        width: 1200,
        height: 630,
        alt: "Blackbox Conversion Flight Recorder",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BLACKBOX // B2B Funnel Flight Recorder",
    description: "What went wrong before the lead bounced? Instant B2B landing page friction telemetry.",
    images: ["https://blackbox-kaivex.vercel.app/api/og?url=blackbox-kaivex.vercel.app&score=100&tier=TIER_S_OPTIMAL"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#050505] text-[#F4F4F5] selection:bg-[#FF5500] selection:text-black">
        {children}
      </body>
    </html>
  );
}
