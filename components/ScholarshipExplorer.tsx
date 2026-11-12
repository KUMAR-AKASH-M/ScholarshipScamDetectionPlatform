"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paper } from "@/components/ui/paper";
import type { VerdictBand } from "@/lib/detector";
import type { SeedScholarship } from "@/lib/seed";
import { ScholarshipCard } from "./ScholarshipCard";

interface ScholarshipExplorerProps {
  scholarships: SeedScholarship[];
}

type FilterOption = "All" | VerdictBand;

const FILTER_OPTIONS: FilterOption[] = [
  "All",
  "Likely Legit",
  "Suspicious",
  "Likely Scam",
];

export function ScholarshipExplorer({
  scholarships,
}: ScholarshipExplorerProps) {
  const [query, setQuery] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<FilterOption>("All");

  const counts = useMemo(() => {
    const map: Record<FilterOption, number> = {
      All: scholarships.length,
      "Likely Legit": 0,
      Suspicious: 0,
      "Likely Scam": 0,
    };
    for (const item of scholarships) {
      map[item.detection.verdict] += 1;
    }
    return map;
  }, [scholarships]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scholarships.filter((item) => {
      const matchesVerdict =
        verdictFilter === "All" || item.detection.verdict === verdictFilter;
      if (!matchesVerdict) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.organisation.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    });
  }, [scholarships, query, verdictFilter]);

  return (
    <section aria-label="Search sample scholarships" className="space-y-5">
      <Paper
        stock="slip"
        tilt={false}
        shadow="hair"
        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex-1">
          <label htmlFor="scholarship-search" className="sr-only">
            Search scholarships
          </label>
          <Input
            id="scholarship-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by scholarship name, organisation, domain, or keywords..."
            seed="search-scholarships"
          />
        </div>

        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by verdict band"
        >
          {FILTER_OPTIONS.map((option) => {
            const active = verdictFilter === option;
            return (
              <Button
                key={option}
                type="button"
                variant={active ? "default" : "outline"}
                size="sm"
                seed={`filter-${option}`}
                onClick={() => setVerdictFilter(option)}
              >
                {option} ({counts[option]})
              </Button>
            );
          })}
        </div>
      </Paper>

      {filtered.length === 0 ? (
        <Paper
          stock="pad"
          tilt={false}
          className="p-8 text-center"
        >
          <p className="text-base font-medium text-ink">
            No sample scholarships match &ldquo;{query}&rdquo;.
          </p>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="mt-2"
            onClick={() => {
              setQuery("");
              setVerdictFilter("All");
            }}
          >
            Clear search and filters
          </Button>
        </Paper>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <ScholarshipCard key={item.id} scholarship={item} />
          ))}
        </div>
      )}
    </section>
  );
}
