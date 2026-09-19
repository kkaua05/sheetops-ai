/**
 * POST /api/ai/plan
 *
 * Generates an operation plan from a user prompt and sanitized dataset
 * profiles using Groq. This route is server-only: the `GROQ_API_KEY` is read
 * from the environment and never exposed to the client.
 *
 * The request body is validated with `aiPlanRequestSchema` and the Groq
 * response is validated with `operationPlanSchema` before being returned.
 */

import { NextResponse } from "next/server";
import { aiPlanRequestSchema } from "@/schemas/ai-plan";
import { generatePlan, AiNotConfiguredError } from "@/lib/ai/planner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const parsed = aiPlanRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await generatePlan(parsed.data.prompt, parsed.data.datasets);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }
    return NextResponse.json({ plan: result.plan }, { status: 200 });
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}