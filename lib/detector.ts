export type VerdictBand = "Likely Legit" | "Suspicious" | "Likely Scam";

export type SignalCategory =
  | "domain"
  | "payment"
  | "organisation"
  | "content"
  | "language"
  | "contact";

export interface Signal {
  signal: string;
  category: SignalCategory;
  points: number;
  reason: string;
}

export interface ScholarshipInput {
  name: string;
  url: string;
  organisation: string;
  description: string;
  contactEmail?: string;
}

export interface DetectionResult {
  score: number;
  verdict: VerdictBand;
  guidance: string;
  signals: Signal[];
}

const OFFICIAL_DOMAINS = [
  "scholarships.gov.in",
  "nsp.gov.in",
  "buddy4study.com",
  "ugc.gov.in",
  "aicte-india.org",
  "education.gov.in",
  "chevening.org",
  "fulbrightonline.org",
  "daad.de",
  "scholarships.com",
];

const SUSPICIOUS_TLDS = [
  ".xyz",
  ".top",
  ".click",
  ".tk",
  ".ml",
  ".ga",
  ".cf",
  ".gq",
  ".buzz",
  ".work",
  ".icu",
  ".vip",
  ".club",
  ".online",
  ".site",
  ".loan",
  ".win",
  ".bid",
];

const FREE_HOSTING_DOMAINS = [
  "blogspot.com",
  "wordpress.com",
  "wixsite.com",
  "weebly.com",
  "sites.google.com",
  "docs.google.com",
  "forms.gle",
  "netlify.app",
  "vercel.app",
  "github.io",
  "000webhostapp.com",
  "herokuapp.com",
  "web.app",
  "firebaseapp.com",
  "carrd.co",
  "notion.site",
  "glitch.me",
];

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "yahoo.in",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "rediffmail.com",
  "protonmail.com",
  "proton.me",
  "icloud.com",
  "mail.com",
  "yandex.com",
  "aol.com",
]);

const GENERIC_ORG_NAMES = new Set([
  "admin",
  "administration",
  "scholarship team",
  "scholarship cell",
  "scholarship desk",
  "scholarship admin team",
  "reward desk",
  "helpdesk",
  "support",
  "support team",
  "unknown",
  "n/a",
  "na",
  "none",
  "team",
  "india scholarship",
  "govt",
  "government",
  "student welfare helpdesk",
]);

interface ParsedUrlInfo {
  hostname: string | null;
  protocol: string | null;
  isValid: boolean;
}

function parseUrlSafely(rawUrl: string): ParsedUrlInfo {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { hostname: null, protocol: null, isValid: false };
  }

  try {
    const parsed = new URL(trimmed);
    return {
      hostname: parsed.hostname.toLowerCase(),
      protocol: parsed.protocol.toLowerCase(),
      isValid: Boolean(parsed.hostname && parsed.hostname.includes(".")),
    };
  } catch {
    if (!/^https?:\/\//i.test(trimmed) && trimmed.includes(".")) {
      try {
        const parsed = new URL(`https://${trimmed}`);
        return {
          hostname: parsed.hostname.toLowerCase(),
          protocol: null,
          isValid: Boolean(parsed.hostname && parsed.hostname.includes(".")),
        };
      } catch {
        return { hostname: null, protocol: null, isValid: false };
      }
    }
    return { hostname: null, protocol: null, isValid: false };
  }
}

/** Extract a coarse registrable domain (handles common two-part ccSLDs like .gov.in or .co.uk). */
function getBaseDomain(hostname: string): string {
  const clean = hostname.toLowerCase().replace(/^www\./, "");
  const parts = clean.split(".").filter(Boolean);
  if (parts.length <= 2) return clean;
  const lastTwo = parts.slice(-2).join(".");
  const multiPartTlds = new Set([
    "gov.in",
    "nic.in",
    "ac.in",
    "edu.in",
    "org.in",
    "co.in",
    "co.uk",
    "gov.uk",
    "ac.uk",
    "org.uk",
    "edu.au",
    "gov.au",
  ]);
  if (multiPartTlds.has(lastTwo) && parts.length >= 3) {
    return parts.slice(-3).join(".");
  }
  return lastTwo;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array<number>(n + 1).fill(0)
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function findLookalikeDomain(hostname: string): string | null {
  const cleanHost = hostname.replace(/^www\./, "");
  const isOfficial = OFFICIAL_DOMAINS.some(
    (official) => cleanHost === official || cleanHost.endsWith(`.${official}`)
  );
  if (isOfficial) return null;

  const deLeet = (s: string) =>
    s.replace(/0/g, "o").replace(/1/g, "i").replace(/3/g, "e").replace(/5/g, "s");
  const normalizedHost = deLeet(cleanHost);
  const compactHost = normalizedHost.replace(/[-.]/g, "");

  for (const official of OFFICIAL_DOMAINS) {
    const officialBrand = official.split(".")[0];
    const compactOfficial = official.replace(/[-.]/g, "");

    if (
      compactHost.includes(compactOfficial) ||
      (officialBrand.length >= 6 && normalizedHost.includes(officialBrand))
    ) {
      return official;
    }

    if (levenshtein(normalizedHost, official) <= 2) {
      return official;
    }

    const hostBase = getBaseDomain(normalizedHost);
    if (levenshtein(hostBase, official) <= 2) {
      return official;
    }
  }

  return null;
}

/** Match regex while ignoring matches preceded closely by negation words (e.g. "no registration fee"). */
function findUnnegatedMatch(text: string, regex: RegExp): string | null {
  const flags = regex.flags.includes("g") ? regex.flags : `${regex.flags}g`;
  const globalRegex = new RegExp(regex.source, flags);
  for (const match of text.matchAll(globalRegex)) {
    const idx = match.index ?? 0;
    const prefix = text.slice(Math.max(0, idx - 32), idx).toLowerCase();
    const isNegated = /\b(no|zero|without|never|not|free of|exempt from)\s+[^.!?\n]*$/.test(
      prefix
    );
    if (!isNegated) {
      return match[0];
    }
  }
  return null;
}

function extractEmails(text: string): string[] {
  const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((e) => e.toLowerCase())));
}

function checkDomain(rawUrl: string): Signal[] {
  const signals: Signal[] = [];
  const { hostname, protocol, isValid } = parseUrlSafely(rawUrl);

  if (!isValid || !hostname) {
    signals.push({
      signal: "Invalid or Missing Website URL",
      category: "domain",
      points: 20,
      reason:
        "No valid website domain was provided, making it difficult to verify the scholarship source.",
    });
    return signals;
  }

  if (protocol === "http:") {
    signals.push({
      signal: "Insecure URL (No HTTPS)",
      category: "domain",
      points: 15,
      reason: `The link "${rawUrl.trim()}" uses unencrypted HTTP instead of HTTPS.`,
    });
  } else if (protocol === null) {
    signals.push({
      signal: "URL Missing HTTPS Scheme",
      category: "domain",
      points: 10,
      reason: `The URL "${rawUrl.trim()}" does not specify HTTPS explicitly.`,
    });
  }

  const matchedTld = SUSPICIOUS_TLDS.find((tld) => hostname.endsWith(tld));
  if (matchedTld) {
    signals.push({
      signal: "Suspicious Top-Level Domain",
      category: "domain",
      points: 20,
      reason: `Domain "${hostname}" uses "${matchedTld}", a low-cost TLD frequently seen in short-lived phishing portals.`,
    });
  }

  const matchedFreeHost = FREE_HOSTING_DOMAINS.find(
    (host) => hostname === host || hostname.endsWith(`.${host}`)
  );
  if (matchedFreeHost) {
    signals.push({
      signal: "Free Hosting / Form-Builder Domain",
      category: "domain",
      points: 20,
      reason: `Hosted on "${matchedFreeHost}", whereas accredited scholarship bodies normally operate on their own official domain.`,
    });
  }

  const lookalikeOf = findLookalikeDomain(hostname);
  if (lookalikeOf) {
    signals.push({
      signal: "Lookalike of Known Official Domain",
      category: "domain",
      points: 30,
      reason: `Domain "${hostname}" closely mimics the official domain "${lookalikeOf}", a common impersonation tactic.`,
    });
  }

  return signals;
}

function checkPaymentDemands(fullText: string): Signal[] {
  const signals: Signal[] = [];

  const feeMatch = findUnnegatedMatch(
    fullText,
    /\b(?:processing|registration|verification|documentation|security|admin(?:istrative)?|form|application|portal|caution|refundable)\s+(?:fee|fees|charge|charges|deposit)\b|\b(?:pay|send|transfer|deposit)\s+(?:a\s+)?(?:fee|rs\.?|inr|₹|\$|usd)\s*\d+/i
  );
  if (feeMatch) {
    signals.push({
      signal: "Upfront Fee or Deposit Demand",
      category: "payment",
      points: 35,
      reason: `Listing mentions "${feeMatch}". Legitimate scholarships do not require students to pay processing fees or refundable deposits to receive aid.`,
    });
  }

  const upiMatch = findUnnegatedMatch(
    fullText,
    /\b(?:upi|gpay|google\s*pay|phonepe|paytm|bhim|qr\s*code)\b|[a-z0-9._-]+@(?:okicici|okaxis|oksbi|okhdfcbank|ybl|paytm|ibl|axl|upi)\b/i
  );
  if (upiMatch) {
    signals.push({
      signal: "UPI / Wallet Payment Request",
      category: "payment",
      points: 30,
      reason: `Detected wallet or UPI payment reference ("${upiMatch}"), which is a strong indicator of direct-transfer scholarship scams.`,
    });
  }

  const bankMatch = findUnnegatedMatch(
    fullText,
    /\b(?:share|send|submit|enter|provide|verify|update)\s+(?:your\s+)?(?:bank\s+account(?:\s+details)?|account\s+number|ifsc|debit\s+card|credit\s+card|cvv|atm\s+pin|upi\s+pin|otp)\b|\b(?:ifsc\s+code|account\s+number\s+and\s+ifsc|cvv|upi\s+pin)\b/i
  );
  if (bankMatch) {
    signals.push({
      signal: "Bank Account or Sensitive Credential Request",
      category: "payment",
      points: 25,
      reason: `Text asks for sensitive financial details ("${bankMatch}") upfront instead of verifying through an accredited disbursement portal.`,
    });
  }

  return signals;
}

function checkOrganisation(
  organisation: string,
  fullText: string,
  emails: string[]
): Signal[] {
  const signals: Signal[] = [];
  const trimmedOrg = organisation.trim();
  const normalizedOrg = trimmedOrg.toLowerCase();

  if (
    trimmedOrg.length < 3 ||
    GENERIC_ORG_NAMES.has(normalizedOrg) ||
    /\b(admin team|reward desk|claim desk|scholarship cell)\b/i.test(trimmedOrg)
  ) {
    signals.push({
      signal: "Unverifiable or Generic Organisation",
      category: "organisation",
      points: 20,
      reason: trimmedOrg
        ? `Organisation name "${trimmedOrg}" is too generic to identify a registered ministry, university, or foundation.`
        : "No sponsoring organisation name was provided.",
    });
  }

  const messengerMatch = fullText.match(
    /\b(?:whatsapp|wa\.me|telegram|t\.me)\b|@[a-z0-9_]+bot\b|\b(?:dm|message|contact)\s+(?:us\s+)?(?:on|at)\s*\+?\d{10,}/i
  );
  if (messengerMatch) {
    signals.push({
      signal: "Messaging-App / Personal Mobile Contact",
      category: "organisation",
      points: 20,
      reason: `Application or support relies on informal messaging channels ("${messengerMatch[0]}") rather than an official institutional portal.`,
    });
  }

  if (emails.length === 0) {
    signals.push({
      signal: "No Official Contact Email Provided",
      category: "organisation",
      points: 10,
      reason:
        "No official institutional email address was found in the listing; verify contact details directly on the sponsor's main website.",
    });
  }

  return signals;
}

function checkContent(description: string): Signal[] {
  const signals: Signal[] = [];
  const trimmed = description.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);

  if (trimmed.length < 80 || words.length < 15) {
    signals.push({
      signal: "Very Short or Sparse Description",
      category: "content",
      points: 15,
      reason: `Description has only ${words.length} word${words.length === 1 ? "" : "s"}, lacking transparent eligibility criteria, disbursement schedule, or terms.`,
    });
  }

  const templateMatch = trimmed.match(
    /\b(?:congratulations[!,\s]+you\s+have\s+been\s+(?:selected|shortlisted)|dear\s+student[,\s]+you\s+(?:are|have\s+been)\s+shortlisted|you\s+have\s+won\s+a?\s*scholarship|claim\s+your\s+scholarship|click\s+the\s+link\s+below|forward\s+this\s+message|share\s+(?:this\s+)?with\s+\d+\s+(?:friends|groups)|pm\s+modi\s+free|free\s+laptop\s+yojana|free\s+smartphone|instant\s+cash\s+award|lucky\s+winner)\b/i
  );
  if (templateMatch) {
    signals.push({
      signal: "Known Scam Template Phrasing",
      category: "content",
      points: 20,
      reason: `Contains common viral/phishing template phrasing ("${templateMatch[0]}").`,
    });
  }

  const hasConcreteDetails =
    /\b(?:eligibility|merit|income|cgpa|gpa|marks|percentage|undergraduate|postgraduate|diploma|degree|tuition|stipend|fellowship|deadline|documents|criteria|guidelines|tuition)\b/i.test(
      trimmed
    );
  if (trimmed.length >= 80 && trimmed.length < 200 && !hasConcreteDetails) {
    signals.push({
      signal: "Generic Content Without Criteria",
      category: "content",
      points: 10,
      reason:
        "Description reads generically and omits concrete academic eligibility, required documents, or award terms.",
    });
  }

  return signals;
}

function checkSuspiciousLanguage(fullText: string): Signal[] {
  const signals: Signal[] = [];

  const urgencyMatch = fullText.match(
    /\b(?:apply\s+(?:in|within)\s+\d+\s+hours?|within\s+\d+\s+hours?|last\s+chance|today\s+only|expires\s+(?:tonight|today|soon)|act\s+now|urgent\s+notice|hurry\s+up|offer\s+ends\s+today|immediate\s+action|spots\s+filling\s+fast|limited\s+slots)\b/i
  );
  if (urgencyMatch) {
    signals.push({
      signal: "High-Pressure Urgency Language",
      category: "language",
      points: 15,
      reason: `Uses artificial urgency ("${urgencyMatch[0]}") to pressure students into acting before verifying the offer.`,
    });
  }

  const guaranteeMatch = fullText.match(
    /\b(?:guaranteed\s+selection|100%\s+scholarship\s+for\s+everyone|100%\s+guaranteed|guaranteed\s+approval|no\s+eligibility\s+required|everyone\s+will\s+get|every\s+student\s+(?:will\s+)?gets?|no\s+merit\s+required|zero\s+rejection|instant\s+approval|assured\s+selection)\b/i
  );
  if (guaranteeMatch) {
    signals.push({
      signal: "Unrealistic Guarantee Claim",
      category: "language",
      points: 20,
      reason: `Promises guaranteed outcomes ("${guaranteeMatch[0]}"). Legitimate scholarships always evaluate eligibility or merit.`,
    });
  }

  return signals;
}

function checkContactMismatch(rawUrl: string, emails: string[]): Signal[] {
  const signals: Signal[] = [];
  if (emails.length === 0) return signals;

  const freeEmail = emails.find((email) => {
    const domain = email.split("@")[1];
    return domain ? FREE_EMAIL_DOMAINS.has(domain) : false;
  });

  if (freeEmail) {
    signals.push({
      signal: "Free-Mail Contact Address",
      category: "contact",
      points: 20,
      reason: `Contact uses a free webmail address (${freeEmail}) rather than an official organisational email domain.`,
    });
    return signals;
  }

  const { hostname, isValid } = parseUrlSafely(rawUrl);
  if (!isValid || !hostname) return signals;

  const siteBase = getBaseDomain(hostname);
  for (const email of emails) {
    const emailDomain = email.split("@")[1];
    if (!emailDomain) continue;
    const emailBase = getBaseDomain(emailDomain);
    if (emailBase !== siteBase) {
      signals.push({
        signal: "Contact Email & Website Domain Mismatch",
        category: "contact",
        points: 20,
        reason: `Contact email domain (${emailDomain}) does not match the scholarship website domain (${hostname}).`,
      });
      break;
    }
  }

  return signals;
}

export function getVerdictBand(score: number): VerdictBand {
  if (score <= 30) return "Likely Legit";
  if (score <= 60) return "Suspicious";
  return "Likely Scam";
}

export function getVerdictGuidance(verdict: VerdictBand): string {
  switch (verdict) {
    case "Likely Legit":
      return "Low risk indicators detected — still confirm deadlines and forms on the official organisation website.";
    case "Suspicious":
      return "Suspicious — verify before applying. Cross-check the domain and sponsoring body independently.";
    case "Likely Scam":
      return "Likely Scam — high risk signals detected. Verify independently and never pay fees or share bank/UPI details.";
  }
}

/**
 * Evaluate a scholarship listing using transparent, rule-based checks.
 * Returns a capped 0-100 risk score, verdict band, cautious guidance, and every fired signal.
 */
export function analyzeScholarship(input: ScholarshipInput): DetectionResult {
  const combinedText = [
    input.name,
    input.organisation,
    input.description,
    input.contactEmail ?? "",
  ]
    .filter(Boolean)
    .join("\n");

  const emails = extractEmails(
    [input.contactEmail ?? "", input.organisation, input.description].join(" ")
  );

  const signals: Signal[] = [
    ...checkDomain(input.url),
    ...checkPaymentDemands(combinedText),
    ...checkOrganisation(input.organisation, combinedText, emails),
    ...checkContent(input.description),
    ...checkSuspiciousLanguage(combinedText),
    ...checkContactMismatch(input.url, emails),
  ];

  const rawScore = signals.reduce((sum, item) => sum + item.points, 0);
  const score = Math.max(0, Math.min(100, rawScore));
  const verdict = getVerdictBand(score);

  return {
    score,
    verdict,
    guidance: getVerdictGuidance(verdict),
    signals,
  };
}

