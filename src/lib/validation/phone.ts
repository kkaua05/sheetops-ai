/**
 * Brazilian phone number validation and normalization.
 *
 * Handles landlines (10 digits) and mobile (11 digits), with or without
 * country code (+55), DDD, and common formatting characters.
 */

import { onlyDigits } from "./cpf";

/** Valid Brazilian DDD codes (2 digits). */
const VALID_DDD = new Set([
  "11", "12", "13", "14", "15", "16", "17", "18", "19",
  "21", "22", "24", "27", "28",
  "31", "32", "33", "34", "35", "37", "38",
  "41", "42", "43", "44", "45", "46", "47", "48", "49",
  "51", "53", "54", "55",
  "61", "62", "63", "64", "65", "66", "67", "68", "69",
  "71", "73", "74", "75", "77", "79",
  "81", "82", "83", "84", "85", "86", "87", "88", "89",
  "91", "92", "93", "94", "95", "96", "97", "98", "99",
]);

/** Strip the Brazilian country code prefix when present. */
function stripCountryCode(digits: string): string {
  if (digits.startsWith("55") && digits.length >= 12) {
    return digits.slice(2);
  }
  return digits;
}

/**
 * Validate a Brazilian phone number.
 * Accepts 10-digit landlines and 11-digit mobiles, with optional +55.
 */
export function isValidPhoneBr(value: string): boolean {
  const digits = stripCountryCode(onlyDigits(value));

  if (digits.length !== 10 && digits.length !== 11) return false;

  const ddd = digits.slice(0, 2);
  if (!VALID_DDD.has(ddd)) return false;

  // Mobile numbers start with 9 and have 11 digits.
  if (digits.length === 11 && digits[2] !== "9") return false;

  // Landlines must not start with 0.
  if (digits.length === 10 && digits[2] === "0") return false;

  return true;
}

/**
 * Normalize a Brazilian phone number to `(DD) 9XXXX-XXXX` or
 * `(DD) XXXX-XXXX`. Returns the original value when invalid.
 */
export function normalizePhoneBr(value: string): string {
  const digits = stripCountryCode(onlyDigits(value));

  if (digits.length !== 10 && digits.length !== 11) return value;
  if (!VALID_DDD.has(digits.slice(0, 2))) return value;

  const ddd = digits.slice(0, 2);
  if (digits.length === 11) {
    return `(${ddd}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return `(${ddd}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
}