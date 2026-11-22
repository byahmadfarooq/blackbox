import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blackboxcheck.vercel.app";

export const metadata: Metadata = {
  title: "Blackbox: find what is stopping visitors from contacting you",
  description:
    "Paste a landing page address and get a plain-English report on what makes it hard for visitors to understand, trust and act. Free, no sign-up.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Blackbox: find what is stopping visitors from contacting you",
    description: "A free, plain-English check of any B2B landing page, with the fixes ranked.",
    url: siteUrl,
    siteName: "Blackbox by Ahmad Farooq",
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Blackbox landing page check" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blackbox: find what is stopping visitors from contacting you",
    description: "A free, plain-English check of any B2B landing page.",
    images: ["/api/og"],
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
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col selection:bg-accent selection:text-white">
        {children}
      </body>
    </html>
  );
}
