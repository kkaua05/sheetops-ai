/**
 * Monetary utilities for safe financial comparison.
 *
 * Floating-point equality is never used for money. Values are converted to
 * integer cents so comparisons and arithmetic are exact.
 */

/**
 * Convert a monetary value to integer cents.
 *
 * Accepts numbers or numeric strings (e.g. "149.90"). Uses string-based
 * rounding to avoid floating-point drift. Returns `null` when the value cannot
 * be interpreted as a monetary amount.
 */
export function toCents(value: string | number | boolean | null | undefined): number | null {
  if (value === null || value === undefined || typeof value === "boolean") return null;

  // A JS number is already a precise decimal amount (e.g. 10.5 = 10,50).
  // Round to the nearest cent to avoid floating-point drift.
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return Math.round(value * 100);
  }

  const text = value.trim().replace(/\./g, "").replace(",", ".");
  if (text.length === 0) return null;

  // Only accept a plain decimal number (optionally signed).
  if (!/^-?\d+(\.\d+)?$/.test(text)) return null;

  const [whole, fraction = ""] = text.split(".");
  const cents = Number.parseInt(whole, 10) * 100;
  const fractionCents = Number.parseInt((fraction + "00").slice(0, 2), 10);
  const sign = text.startsWith("-") ? -1 : 1;

  return sign * (Math.abs(cents) + fractionCents);
}

/**
 * Convert integer cents back to a display string (pt-BR format).
 */
export function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(cents);
  const whole = Math.floor(absolute / 100);
  const fraction = (absolute % 100).toString().padStart(2, "0");
  return `${sign}${whole.toLocaleString("pt-BR")},${fraction}`;
}

/**
 * Compute the absolute difference in cents between two monetary values.
 * Returns `null` when either value is not monetary.
 */
export function differenceCents(
  a: string | number | boolean | null | undefined,
  b: string | number | boolean | null | undefined,
): number | null {
  const centsA = toCents(a);
  const centsB = toCents(b);
  if (centsA === null || centsB === null) return null;
  return centsA - centsB;
}