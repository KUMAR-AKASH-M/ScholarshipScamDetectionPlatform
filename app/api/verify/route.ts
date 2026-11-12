import { NextResponse } from "next/server";
import { analyzeScholarship } from "@/lib/detector";

interface VerifyRequestBody {
  name?: unknown;
  url?: unknown;
  organisation?: unknown;
  description?: unknown;
  contactEmail?: unknown;
}

export async function POST(request: Request) {
  let body: VerifyRequestBody;

  try {
    body = (await request.json()) as VerifyRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const url = typeof body.url === "string" ? body.url.trim() : "";
  const organisation =
    typeof body.organisation === "string" ? body.organisation.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const contactEmail =
    typeof body.contactEmail === "string" ? body.contactEmail.trim() : undefined;

  if (!name || !url || !organisation || !description) {
    return NextResponse.json(
      {
        error:
          "Please provide scholarship name, URL, organisation, and description.",
      },
      { status: 400 }
    );
  }

  const result = analyzeScholarship({
    name,
    url,
    organisation,
    description,
    contactEmail: contactEmail || undefined,
  });

  return NextResponse.json(result, { status: 200 });
}

