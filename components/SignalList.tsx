import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Signal, SignalCategory } from "@/lib/detector";

interface SignalListProps {
  signals: Signal[];
}

const CATEGORY_LABELS: Record<SignalCategory, string> = {
  domain: "Domain",
  payment: "Payment Demand",
  organisation: "Organisation",
  content: "Content",
  language: "Language",
  contact: "Contact",
};

export function SignalList({ signals }: SignalListProps) {
  if (signals.length === 0) {
    return (
      <Alert variant="success" seed="no-signals">
        <AlertTitle>No risk signals triggered</AlertTitle>
        <AlertDescription>
          No rule-based risk flags fired on this listing. Even with a low risk
          score, always verify application deadlines and forms directly on the
          official organisation website.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <ul className="space-y-3" aria-label="Fired risk signals">
      {signals.map((item, idx) => (
        <li key={`${item.signal}-${idx}`}>
          <Card
            stock="slip"
            tilt={false}
            shadow="hair"
            seed={`signal-${idx}-${item.category}`}
            className="gap-2 py-4"
          >
            <CardContent className="space-y-2 px-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" size="sm" seed={`cat-${idx}`}>
                    {CATEGORY_LABELS[item.category]}
                  </Badge>
                  <h3 className="text-base font-bold text-ink">
                    {item.signal}
                  </h3>
                </div>
                <Badge
                  variant={item.points >= 25 ? "destructive" : "default"}
                  tone={item.points >= 15 ? "tangerine" : "hi"}
                  size="sm"
                  seed={`pts-${idx}`}
                  className="font-mono"
                >
                  +{item.points} pts
                </Badge>
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">
                {item.reason}
              </p>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
