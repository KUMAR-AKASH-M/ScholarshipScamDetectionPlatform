import Link from "next/link";
import { notFound } from "next/navigation";
import { RiskBadge } from "@/components/RiskBadge";
import { SignalList } from "@/components/SignalList";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Paper } from "@/components/ui/paper";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Stamp } from "@/components/ui/stamp";
import type { VerdictBand } from "@/lib/detector";
import type { ProgressTone } from "@/lib/ink/recipes/progress-ink";
import { getSeedScholarshipById, SEED_SCHOLARSHIPS } from "@/lib/seed";

export function generateStaticParams() {
  return SEED_SCHOLARSHIPS.map((item) => ({ id: item.id }));
}

function getProgressTone(verdict: VerdictBand): ProgressTone {
  switch (verdict) {
    case "Likely Legit":
      return "green";
    case "Suspicious":
      return "hi";
    case "Likely Scam":
      return "marker";
  }
}

function getAlertVariant(
  verdict: VerdictBand
): "success" | "warning" | "destructive" {
  switch (verdict) {
    case "Likely Legit":
      return "success";
    case "Suspicious":
      return "warning";
    case "Likely Scam":
      return "destructive";
  }
}

function renderVerdictStamp(verdict: VerdictBand, seed: string) {
  switch (verdict) {
    case "Likely Legit":
      return (
        <Stamp
          text="LOW RISK"
          sub="VERIFY SOURCE"
          shape="rect"
          ink="green"
          size={92}
          tilt={-5}
          seed={seed}
        />
      );
    case "Suspicious":
      return (
        <Stamp
          text="VERIFY FIRST"
          sub="CAUTION"
          shape="rect"
          ink="ink-you"
          size={104}
          tilt={-4}
          seed={seed}
        />
      );
    case "Likely Scam":
      return (
        <Stamp
          text="HIGH RISK"
          sub="DO NOT PAY"
          shape="rect"
          ink="red"
          size={100}
          tilt={-6}
          seed={seed}
        />
      );
  }
}

export default async function ScholarshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scholarship = getSeedScholarshipById(id);

  if (!scholarship) {
    notFound();
  }

  const { detection } = scholarship;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">← Back to sample directory</Link>
        </Button>
        <Badge variant="secondary" seed={`detail-sample-${scholarship.id}`}>
          Sample Data Record
        </Badge>
      </div>

      <Paper
        as="section"
        stock="paper"
        fastener="clip"
        tilt={false}
        seed={`dossier-${scholarship.id}`}
        className="p-6 sm:p-8"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2 pr-4">
            <h1 className="font-script text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {scholarship.name}
            </h1>
            <p className="text-sm font-bold text-ink-soft">
              Organisation: {scholarship.organisation}
            </p>
            <p className="break-all font-mono text-xs text-pencil-text">
              URL: {scholarship.url}
            </p>
          </div>

          <Paper
            stock="index-card"
            tilt={false}
            shadow="hair"
            seed={`score-${scholarship.id}`}
            className="w-full shrink-0 p-4 lg:w-80"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wide text-pencil-text">
                  Risk Score
                </span>
                <div className="font-mono text-2xl font-bold text-ink">
                  {detection.score}
                  <span className="text-sm font-normal text-pencil-text">
                    /100
                  </span>
                </div>
              </div>
              {renderVerdictStamp(detection.verdict, `stamp-${scholarship.id}`)}
            </div>

            <div className="mt-3">
              <Progress
                value={detection.score}
                max={100}
                size="lg"
                tone={getProgressTone(detection.verdict)}
                aria-label="Scholarship risk score"
                seed={`prog-${scholarship.id}`}
              />
            </div>

            <div className="mt-3">
              <RiskBadge verdict={detection.verdict} showGuidanceLabel />
            </div>
          </Paper>
        </div>

        <div className="mt-6">
          <Alert
            variant={getAlertVariant(detection.verdict)}
            seed={`guidance-${scholarship.id}`}
          >
            <AlertTitle>Assessment Guidance</AlertTitle>
            <AlertDescription>{detection.guidance}</AlertDescription>
          </Alert>
        </div>

        <Separator className="my-6" variant="pencil" />

        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-pencil-text">
              Listed Award
            </dt>
            <dd className="mt-1 font-medium text-ink">{scholarship.amount}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-pencil-text">
              Stated Deadline
            </dt>
            <dd className="mt-1 font-medium text-ink">
              {scholarship.deadline}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-pencil-text">
              Contact Email
            </dt>
            <dd className="mt-1 font-mono text-xs text-ink">
              {scholarship.contactEmail ?? "Not provided in listing"}
            </dd>
          </div>
        </dl>

        <Separator className="my-6" variant="pencil" />

        <div>
          <h2 className="text-xs font-bold uppercase tracking-wide text-pencil-text">
            Submitted Listing Description
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
            {scholarship.description}
          </p>
        </div>
      </Paper>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-script text-2xl font-bold text-ink">
              Explainable Detection Signals ({detection.signals.length})
            </h2>
            <p className="text-xs text-ink-muted">
              Score is the sum of all fired rule weights, capped at 0–100 (0–30
              Likely Legit, 31–60 Suspicious, 61–100 Likely Scam).
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/submit">Test your own listing →</Link>
          </Button>
        </div>

        <SignalList signals={detection.signals} />
      </section>
    </div>
  );
}
