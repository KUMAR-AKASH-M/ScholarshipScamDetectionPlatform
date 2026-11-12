import Link from "next/link";
import { ScholarshipExplorer } from "@/components/ScholarshipExplorer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Paper } from "@/components/ui/paper";
import { SEED_SCHOLARSHIPS } from "@/lib/seed";

export default function HomePage() {
  return (
    <div className="space-y-7">
      <Paper
        as="section"
        stock="paper"
        tape="corner"
        tilt={false}
        seed="home-hero"
        className="p-6 sm:p-8"
      >
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl space-y-3">
            <Badge variant="secondary" seed="hero-tag">
              Explainable Rule-Based Verification
            </Badge>
            <h1 className="font-script text-3xl leading-tight font-bold tracking-tight text-ink sm:text-4xl">
              Check if a scholarship looks legitimate before you apply
            </h1>
            <p className="text-base leading-relaxed text-ink-soft">
              Inspect risk scores (0–100), verdict bands, and the exact rules
              that fired across domain trust, payment demands, organisation
              details, content quality, language, and contact consistency.
            </p>
          </div>

          <div className="shrink-0">
            <Button size="lg" asChild seed="hero-cta">
              <Link href="/submit">Paste &amp; Verify a Listing →</Link>
            </Button>
          </div>
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

      <ScholarshipExplorer scholarships={SEED_SCHOLARSHIPS} />
    </div>
  );
}
