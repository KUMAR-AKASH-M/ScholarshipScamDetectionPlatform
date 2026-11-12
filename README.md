# Scholarship Scam Detection Platform

A scholarship verification portal that helps students check whether a scholarship is legitimate — before they apply, pay, or share personal details.

Paste a scholarship's name, URL, organisation and description, and the portal runs it through a rule-based detector and shows an explainable verdict: **Likely Legit**, **Suspicious**, or **Likely Scam**, with the exact reasons behind the score.

> ⚠️ Verdicts are risk signals, not accusations. A "Suspicious" result means *verify before applying* — never that a scholarship is definitely a scam.

## What it does

- **Browse scholarships** — searchable list, each with a risk badge.
- **Detail page per scholarship** — risk score (0–100), verdict band, and every signal that fired, with its reason.
- **Submit a scholarship for checking** — paste the details, run the detector, get a verdict.
- **API endpoint** — `POST /api/verify` runs the detector and returns the verdict as JSON.

## How the detector works

`lib/detector.ts` — pure TypeScript, rule-based, no ML in the MVP. Each check returns a signal with points and a reason; the score is the sum of points, capped at 0–100.

| Verdict | Score |
| --- | --- |
| Likely Legit | 0–30 |
| Suspicious | 31–60 |
| Likely Scam | 61–100 |

Checks:

- **Domain** — suspicious TLD or free-hosting patterns, lookalike of a known official domain (e.g. `scholarships.gov.in`, `buddy4study.com`), URL without HTTPS.
- **Payment demands** (highest weight) — asks for a processing fee, registration fee, refundable deposit, payment via UPI, or bank account details.
- **Fake organisation** — no verifiable organisation details, contact only via WhatsApp / Telegram / mobile, no official email.
- **Copied / generic content** — description very short or generic, or matching known template phrases.
- **Suspicious language** — urgency ("apply in 24 hours", "last chance") or guarantees ("guaranteed selection", "100% scholarship for everyone").
- **Contact mismatch** — contact email domain does not match the site domain, or only a free-mail address is given.

Every fired signal is shown in the UI with its reason, so the verdict is explainable.

## Seed data

9 sample scholarships in `lib/seed.ts`, clearly labelled in the UI as sample data — a mix of real ones (NSP Post-Matric, HDFC Parivartan, Chevening) and scam-like examples (e.g. a "PM Free Laptop ₹25,000" offer, a fake Buddy4Study cash award).

## Tech stack

- Next.js 16 (App Router) + React 19 + TypeScript (strict)
- Tailwind CSS 4
- Hand-drawn "Looseleaf" paper-style UI
- No web scraping, no external API keys — all data is local seed data for now

## Project structure

```
app/page.tsx                    — home: search + scholarship list
app/scholarships/[id]/page.tsx  — detail: score, verdict, signals
app/submit/page.tsx             — submit form
app/api/verify/route.ts         — POST: run the detector, return verdict as JSON
lib/detector.ts                 — the detector and scoring
lib/seed.ts                     — seed scholarship data
components/ScholarshipCard.tsx, components/RiskBadge.tsx, components/SignalList.tsx
```

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To verify a production build:

```bash
npm run build
```

## Roadmap

- **Phase 2** — ML text classifier for the language check, content-similarity check, domain-age lookup.
- **Later** — user reports, an admin review queue, scheduled re-scans of listed scholarships.

## Notes for contributors

- Never present a verdict as certain in the UI — "Suspicious — verify before applying", never "This is a scam".
- Only publicly available scholarship information is collected; respect sites' terms — prefer official listings plus user submissions over scraping.
