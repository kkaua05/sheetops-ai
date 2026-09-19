/**
 * Small, dependency-free utility helpers shared across the codebase.
 */

/** Generate a unique id (crypto-backed when available). */
export function generateId(prefix = "id"): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `${prefix}_${random}`;
}

/** Truncate a string for safe display/logging. */
export function truncate(value: string, maxLength = 200): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}…`;
}

/** Convert an arbitrary cell value to a stable string key. */
export function cellToKey(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

/** Normalize a string for case-insensitive comparison. */
export function normalizeForCompare(value: unknown): string {
  return cellToKey(value).trim().toLowerCase();
}

/** Check whether a value is "empty" (null, undefined, or whitespace-only). */
export function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  return false;
}

/** Clamp an integer between min and max (inclusive). */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Format a byte count into a human-readable string. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Format an integer with thousands separators (pt-BR style). */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}