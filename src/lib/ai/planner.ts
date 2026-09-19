/**
 * The AI planner.
 *
 * This module is the single place where SheetOps talks to Groq. It turns a
 * user prompt plus sanitized dataset profiles into a validated operation plan.
 *
 * Security model:
 * - The API key is read server-side only and never leaves this module.
 * - The request is built from sanitized profiles (no raw cell values).
 * - The response is parsed as JSON and validated with `operationPlanSchema`
 *   before it is ever returned. Anything that fails validation is rejected.
 * - When Groq is not configured, planning is disabled and a clear result is
 *   returned so the manual tools remain fully functional.
 */

import Groq from "groq-sdk";
import { operationPlanSchema, type OperationPlanSchema } from "@/schemas/ai-plan";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import {
  GROQ_MAX_TOKENS,
  GROQ_TEMPERATURE,
  GROQ_TIMEOUT_MS,
  isGroqConfigured,
  resolveGroqModel,
} from "@/config/ai";
import type { AiDatasetProfile } from "@/schemas/ai-plan";

/** Result of a planning attempt. */
export type PlanResult =
  | { ok: true; plan: OperationPlanSchema }
  | { ok: false; error: string };

/** Error thrown when Groq is not configured. */
export class AiNotConfiguredError extends Error {
  constructor() {
    super("AI planning is disabled: GROQ_API_KEY is not configured.");
    this.name = "AiNotConfiguredError";
  }
}

/** Error thrown when the Groq response cannot be parsed or validated. */
export class AiResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiResponseError";
  }
}

/**
 * Build the user message sent to Groq.
 *
 * The dataset profiles are serialized as JSON so the model sees the exact
 * structure it must reference (columnId, name, inferredType, aggregates).
 */
function buildUserMessage(
  prompt: string,
  datasets: AiDatasetProfile[],
): string {
  return [
    "User instruction:",
    prompt,
    "",
    "Dataset profiles (sanitized, no raw values):",
    JSON.stringify(datasets),
    "",
    "Produce the operation plan as a single JSON object.",
  ].join("\n");
}

/**
 * Parse and validate the raw Groq completion content.
 *
 * Groq may wrap the JSON in markdown fences or emit leading/trailing prose;
 * this extracts the first balanced JSON object and validates it.
 */
function parsePlanContent(content: string): OperationPlanSchema {
  const trimmed = content.trim();

  // Strip markdown code fences if present.
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;

  // Find the first balanced JSON object.
  const start = candidate.indexOf("{");
  if (start === -1) {
    throw new AiResponseError("Groq response did not contain a JSON object.");
  }

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < candidate.length; i++) {
    const char = candidate[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
    } else if (char === "{") {
      depth++;
    } else if (char === "}") {
      depth--;
      if (depth === 0) {
        const jsonText = candidate.slice(start, i + 1);
        let parsed: unknown;
        try {
          parsed = JSON.parse(jsonText);
        } catch {
          throw new AiResponseError("Groq response contained invalid JSON.");
        }
        const result = operationPlanSchema.safeParse(parsed);
        if (!result.success) {
          throw new AiResponseError(
            `Groq response failed validation: ${result.error.message}`,
          );
        }
        return result.data;
      }
    }
  }

  throw new AiResponseError("Groq response contained unbalanced JSON.");
}

/**
 * Generate an operation plan from a user prompt and sanitized dataset profiles.
 *
 * Returns a discriminated result rather than throwing, so callers can surface
 * a friendly message to the user. Throws only on programmer error (missing
 * configuration), which the API route converts to a 503.
 */
export async function generatePlan(
  prompt: string,
  datasets: AiDatasetProfile[],
): Promise<PlanResult> {
  if (!isGroqConfigured()) {
    throw new AiNotConfiguredError();
  }

  const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
    timeout: GROQ_TIMEOUT_MS,
    maxRetries: 1,
  });

  try {
    const completion = await client.chat.completions.create({
      model: resolveGroqModel(),
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildUserMessage(prompt, datasets) },
      ],
      temperature: GROQ_TEMPERATURE,
      max_completion_tokens: GROQ_MAX_TOKENS,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content || content.trim().length === 0) {
      return { ok: false, error: "Groq returned an empty response." };
    }

    const plan = parsePlanContent(content);
    return { ok: true, plan };
  } catch (error) {
    if (error instanceof AiResponseError) {
      return { ok: false, error: error.message };
    }
    const message =
      error instanceof Error ? error.message : "Unknown Groq error.";
    return { ok: false, error: `Groq request failed: ${message}` };
  }
}