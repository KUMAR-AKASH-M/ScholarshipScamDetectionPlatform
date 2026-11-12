"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { RiskBadge } from "@/components/RiskBadge";
import { SignalList } from "@/components/SignalList";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Paper } from "@/components/ui/paper";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { DetectionResult, VerdictBand } from "@/lib/detector";
import type { ProgressTone } from "@/lib/ink/recipes/progress-ink";

interface FormState {
  name: string;
  url: string;
  organisation: string;
  contactEmail: string;
  description: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  url: "",
  organisation: "",
  contactEmail: "",
  description: "",
};

const PRESET_EXAMPLES: Record<"legit" | "suspicious" | "scam", FormState> = {
  legit: {
    name: "AICTE Pragati Scholarship for Girl Students",
    url: "https://www.aicte-india.org/schemes/students-development-schemes/Pragati",
    organisation: "All India Council for Technical Education (AICTE)",
    contactEmail: "pragati@aicte-india.org",
    description:
      "Scholarship scheme supporting girl students admitted to technical diploma and degree courses at AICTE-approved institutions. Family income from all sources should not exceed ₹8 lakh per annum. Selection is strictly on merit in the qualifying examination with no registration or processing fee.",
  },
  suspicious: {
    name: "National Youth Excellence Stipend 2026",
    url: "https://youth-stipend-2026.sites.google.com/view/apply",
    organisation: "Youth Scholarship Initiative",
    contactEmail: "youthstipend2026@gmail.com",
    description:
      "Open for undergraduate students seeking tuition support this semester. Last chance to submit your application before the portal closes.",
  },
  scam: {
    name: "NSP Instant Student Relief Grant",
    url: "http://scholarships-gov-in.xyz/claim",
    organisation: "Scholarship Admin Team",
    contactEmail: "",
    description:
      "Congratulations! You have been shortlisted for a ₹30,000 scholarship. Guaranteed selection for everyone! Apply in 24 hours. Pay a refundable processing fee of ₹499 via UPI and message us on WhatsApp +91 9811122334 with your bank account number and IFSC code.",
  },
};

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

export default function SubmitPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as DetectionResult & {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "Failed to analyze scholarship details.");
        setResult(null);
        return;
      }

      setResult(data);
    } catch {
      setError("Network error while running the detector. Please try again.");
      setResult(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  function loadPreset(presetKey: "legit" | "suspicious" | "scam") {
    setForm(PRESET_EXAMPLES[presetKey]);
    setResult(null);
    setError(null);
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-script text-3xl font-bold tracking-tight text-ink">
            Check a Scholarship Listing
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Paste the scholarship name, URL, organisation, and description to
            run our rule-based risk checks.
          </p>
        </div>

        <Button variant="ghost" size="sm" asChild>
          <Link href="/">← Browse sample directory</Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <Card
          stock="paper"
          tilt={false}
          seed="submit-form-card"
          className="gap-5 py-6 lg:col-span-7"
        >
          <CardHeader className="gap-3 px-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-pencil-text">
                Need test input? Load an example:
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="xs"
                  onClick={() => loadPreset("legit")}
                >
                  Legit Example
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => loadPreset("suspicious")}
                >
                  Suspicious Example
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="xs"
                  onClick={() => loadPreset("scam")}
                >
                  Scam-like Example
                </Button>
              </div>
            </div>
            <Separator variant="pencil" />
          </CardHeader>

          <CardContent className="px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" required>
                  Scholarship Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. National Merit Scholarship 2026"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="url" required>
                  Website / Application URL
                </Label>
                <Input
                  id="url"
                  name="url"
                  type="text"
                  required
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="e.g. https://scholarships.gov.in/..."
                  inputClassName="font-mono text-sm"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="organisation" required>
                    Organisation
                  </Label>
                  <Input
                    id="organisation"
                    name="organisation"
                    type="text"
                    required
                    value={form.organisation}
                    onChange={(e) =>
                      setForm({ ...form, organisation: e.target.value })
                    }
                    placeholder="e.g. Ministry of Education"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contactEmail">
                    Contact Email{" "}
                    <span className="text-xs font-normal text-pencil-text">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="text"
                    value={form.contactEmail}
                    onChange={(e) =>
                      setForm({ ...form, contactEmail: e.target.value })
                    }
                    placeholder="e.g. helpdesk@example.org"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" required>
                  Scholarship Description / Message Text
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={6}
                  ruled
                  showCount
                  required
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Paste eligibility details, payment/contact instructions, or the message you received..."
                />
              </div>

              {error && (
                <Alert variant="destructive" seed="submit-error">
                  <AlertTitle>Check could not run</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Running Detector..." : "Run Risk Check"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setForm(INITIAL_FORM);
                    setResult(null);
                    setError(null);
                  }}
                >
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <section
          aria-label="Detection verdict"
          className="space-y-4 lg:col-span-5"
        >
          {!result ? (
            <Paper stock="pad" tilt={false} className="p-6 text-sm text-ink-soft">
              <h2 className="font-script text-xl font-bold text-ink">
                Verdict &amp; Signal Breakdown
              </h2>
              <p className="mt-2 leading-relaxed">
                Submit a scholarship on the left (or load one of the quick
                examples) to see its 0–100 risk score, verdict band, and every
                rule that fired.
              </p>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-xs">
                <li>0–30: Likely Legit</li>
                <li>31–60: Suspicious — verify before applying</li>
                <li>61–100: Likely Scam</li>
              </ul>
            </Paper>
          ) : (
            <div className="space-y-4">
              <Card
                stock="index-card"
                tilt={false}
                seed="submit-verdict-card"
                className="gap-4 py-5"
              >
                <CardHeader className="px-6">
                  <div className="flex items-baseline justify-between">
                    <CardTitle className="font-hand text-xs font-bold uppercase tracking-wide text-pencil-text">
                      Risk Score
                    </CardTitle>
                    <span className="font-mono text-3xl font-bold text-ink">
                      {result.score}
                      <span className="text-sm font-normal text-pencil-text">
                        /100
                      </span>
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 px-6">
                  <Progress
                    value={result.score}
                    max={100}
                    size="lg"
                    tone={getProgressTone(result.verdict)}
                    aria-label="Scholarship risk score"
                  />

                  <RiskBadge verdict={result.verdict} showGuidanceLabel />

                  <Alert
                    variant={getAlertVariant(result.verdict)}
                    seed="submit-guidance"
                  >
                    <AlertTitle>Assessment Guidance</AlertTitle>
                    <AlertDescription>{result.guidance}</AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h2 className="font-script text-xl font-bold text-ink">
                  Fired Signals ({result.signals.length})
                </h2>
                <SignalList signals={result.signals} />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
