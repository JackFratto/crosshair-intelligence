import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Crosshair Intelligence — LLM & World Model Benchmarks",
    template: "%s · Crosshair Intelligence",
  },
  description:
    "An open benchmarking leaderboard for large language models — and, soon, world models like V-JEPA, Genie, and Cosmos. Transparent sources, clear methodology.",
  keywords: [
    "LLM benchmarks",
    "leaderboard",
    "world models",
    "JEPA",
    "AI evaluation",
    "GPQA",
    "SWE-bench",
  ],
  openGraph: {
    title: "Crosshair Intelligence",
    description:
      "An open benchmarking leaderboard for LLMs and world models.",
    url: siteUrl,
    siteName: "Crosshair Intelligence",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crosshair Intelligence",
    description:
      "An open benchmarking leaderboard for LLMs and world models.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
