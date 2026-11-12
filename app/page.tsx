import Link from "next/link";
import { ScholarshipExplorer } from "@/components/ScholarshipExplorer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Fastener, Paper } from "@/components/ui/paper";
import { Ribbon } from "@/components/ui/ribbon";
import { SEED_SCHOLARSHIPS } from "@/lib/seed";

export default function HomePage() {
  return (
    <div className="space-y-7">
      <Paper
        as="section"
        stock="paper"
        tape="corner"
        fastener="clip"
        tilt={false}
        seed="home-hero"
        className="relative px-6 py-10 sm:px-10 sm:py-14"
      >
        <Fastener
          kind="clip"
          tone="sky"
          seed="hero-clip-sky"
          className="absolute -top-5 right-14 z-(--ll-z-prop) rotate-6 calm:hidden"
        />

        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Ribbon
            variant="banner"
            tone="tangerine"
            size="sm"
            seed="hero-ribbon"
          >
            Explainable Rule-Based Verification
          </Ribbon>

          <h1 className="mt-6 font-script text-4xl leading-[1.08] font-bold tracking-tight text-ink sm:text-6xl md:text-7xl">
            <span className="block">Check a scholarship,</span>
            <span className="block">before you apply.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-center text-base leading-relaxed text-ink-soft sm:text-lg">
            Inspect risk scores (0–100), verdict bands, and the exact rules that
            fired across domain trust, payment demands, organisation details,
            content quality, language, and contact consistency.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Button size="lg" asChild seed="hero-cta-paste">
              <Link href="/submit">Paste &amp; Verify a Listing →</Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              asChild
              seed="hero-cta-directory"
            >
              <Link href="#directory">Browse Sample Directory</Link>
            </Button>
          </div>

          <p className="mt-4 text-center text-sm text-pencil-text sm:text-[15px]">
            Free to use — 9 sample listings included.
          </p>
        </div>
      </Paper>

      <Alert variant="note" seed="sample-notice">
        <AlertTitle>
          Sample Data Notice — Local MVP Dataset ({SEED_SCHOLARSHIPS.length}{" "}
          Examples)
        </AlertTitle>
        <AlertDescription>
          The listings below are illustrative local records demonstrating
          Likely Legit, Suspicious, and Likely Scam signals.
        </AlertDescription>
      </Alert>

      <div id="directory">
        <ScholarshipExplorer scholarships={SEED_SCHOLARSHIPS} />
      </div>
    </div>
  );
}
