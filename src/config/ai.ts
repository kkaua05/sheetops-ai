/**
 * Centralized AI configuration for SheetOps.
 *
 * The Groq model is never hard-coded across the codebase. It is read from the
 * `GROQ_MODEL` environment variable (server-side only) with a configurable
 * fallback. The API key is read exclusively from `GROQ_API_KEY` and is never
 * exposed to the browser.
 */

/** Fallback model used when `GROQ_MODEL` is not configured. */
export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";

/** Timeout (ms) for a single Groq request. */
export const GROQ_TIMEOUT_MS = 30_000;

/** Maximum number of output tokens requested from Groq. */
export const GROQ_MAX_TOKENS = 2_000;

/** Temperature used for planning requests (low for deterministic output). */
export const GROQ_TEMPERATURE = 0.1;

/**
 * Resolve the Groq model name from the environment with a safe fallback.
 * This function is only ever called on the server.
 */
export function resolveGroqModel(): string {
  const configured = process.env.GROQ_MODEL?.trim();
  return configured && configured.length > 0 ? configured : DEFAULT_GROQ_MODEL;
}

/**
 * Whether the Groq API key is configured. When false, the AI module is
 * disabled and the manual tools remain fully functional.
 */
export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}