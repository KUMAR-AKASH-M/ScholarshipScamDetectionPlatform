import type { Metadata } from "next";
import Link from "next/link";
import { LooseleafProvider } from "@/components/LooseleafProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Paper } from "@/components/ui/paper";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scholarship Scam Detection Platform",
  description:
    "Rule-based, explainable scholarship verification portal for students.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-desk text-ink">
        <LooseleafProvider>
          <header className="px-4 pt-4 sm:px-6">
            <Paper
              as="div"
              stock="paper"
              tilt={false}
              shadow="hair"
              className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-3.5"
            >
              <Link
                href="/"
                className="flex items-center gap-3 text-ink no-underline"
              >
                <Badge variant="default" tone="marker" size="lg" seed="brand">
                  SS
                </Badge>
                <span className="font-script text-xl font-bold tracking-tight sm:text-2xl">
                  Scholarship Scam Detector
                </span>
              </Link>

              <nav
                className="flex items-center gap-2 sm:gap-3"
                aria-label="Main"
              >
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/">Sample Directory</Link>
                </Button>
                <Button variant="default" size="sm" asChild>
                  <Link href="/submit">Check a Scholarship</Link>
                </Button>
              </nav>
            </Paper>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 sm:px-6">
            {children}
          </main>

          <footer className="px-4 pb-5 sm:px-6">
            <Paper
              as="div"
              stock="slip"
              tilt={false}
              shadow="hair"
              className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-3.5 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between"
            >
              <p>
                Scholarship Scam Detection Platform (MVP) — Rule-based,
                explainable checks with no external scraping.
              </p>
              <p>
                Note: Verdicts are automated risk indicators, not definitive
                proof. Always verify directly on official portals.
              </p>
            </Paper>
          </footer>
        </LooseleafProvider>
      </body>
    </html>
  );
}
