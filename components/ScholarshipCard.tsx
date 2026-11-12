import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SeedScholarship } from "@/lib/seed";
import { RiskBadge } from "./RiskBadge";

interface ScholarshipCardProps {
  scholarship: SeedScholarship;
}

export function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
  const { detection } = scholarship;
  const signalCount = detection.signals.length;

  return (
    <Card
      as="article"
      stock="index-card"
      tilt={false}
      seed={scholarship.id}
      className="justify-between gap-4 py-5 transition-transform duration-150 hover:-translate-y-0.5"
    >
      <div className="space-y-3">
        <CardHeader className="gap-2.5 px-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <Badge variant="secondary" size="sm" seed={`sample-${scholarship.id}`}>
              Sample Data
            </Badge>
            <RiskBadge
              verdict={detection.verdict}
              score={detection.score}
              size="sm"
            />
          </div>

          <CardTitle className="pt-1 font-hand text-lg leading-snug font-bold">
            <Link
              href={`/scholarships/${scholarship.id}`}
              className="text-ink hover:text-link-hover hover:underline"
            >
              {scholarship.name}
            </Link>
          </CardTitle>

          <CardDescription className="text-xs font-medium text-ink-soft">
            {scholarship.organisation}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2.5 px-5">
          <p className="truncate font-mono text-xs text-pencil-text">
            {scholarship.url}
          </p>
          <p className="line-clamp-3 text-sm leading-relaxed text-ink-soft">
            {scholarship.description}
          </p>
        </CardContent>
      </div>

      <CardFooter
        rule="pencil"
        className="justify-between border-t px-5 pt-3.5 text-xs"
      >
        <span className="text-pencil-text">
          {signalCount === 0
            ? "0 risk signals fired"
            : `${signalCount} risk signal${signalCount === 1 ? "" : "s"} fired`}
        </span>
        <Button variant="link" size="xs" asChild>
          <Link href={`/scholarships/${scholarship.id}`}>View details →</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
