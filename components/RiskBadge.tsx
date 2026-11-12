import { Badge } from "@/components/ui/badge";
import type { VerdictBand } from "@/lib/detector";
import type { BadgeTone, BadgeVariant } from "@/lib/ink/recipes/badge-ink";

interface RiskBadgeProps {
  verdict: VerdictBand;
  score?: number;
  showGuidanceLabel?: boolean;
  size?: "sm" | "default" | "lg";
}

const BADGE_CONFIG: Record<
  VerdictBand,
  { variant: BadgeVariant; tone?: BadgeTone; label: string }
> = {
  "Likely Legit": {
    variant: "default",
    tone: "grass",
    label: "Likely Legit — verify on official portal",
  },
  Suspicious: {
    variant: "default",
    tone: "hi",
    label: "Suspicious — verify before applying",
  },
  "Likely Scam": {
    variant: "destructive",
    label: "Likely Scam — high risk, verify independently",
  },
};

export function RiskBadge({
  verdict,
  score,
  showGuidanceLabel = false,
  size = "default",
}: RiskBadgeProps) {
  const cfg = BADGE_CONFIG[verdict];
  const displayLabel = showGuidanceLabel ? cfg.label : verdict;

  return (
    <Badge
      variant={cfg.variant}
      tone={cfg.tone}
      size={size}
      seed={`risk-${verdict}`}
      className="max-w-full whitespace-normal text-left leading-tight"
    >
      <span>{displayLabel}</span>
      {typeof score === "number" && (
        <span className="ml-0.5 font-mono text-[11px] opacity-90">
          ({score}/100)
        </span>
      )}
    </Badge>
  );
}
