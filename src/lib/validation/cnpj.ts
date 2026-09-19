/**
 * Brazilian CNPJ validation and normalization.
 *
 * Implements the official check-digit algorithm (módulo 11) with the
 * CNPJ-specific weight tables.
 */

import { onlyDigits } from "./cpf";

/**
 * Validate a CNPJ using the official check-digit algorithm.
 * Accepts both formatted and unformatted input.
 */
export function isValidCnpj(value: string): boolean {
  const digits = onlyDigits(value);

  if (digits.length !== 14) return false;

  // Reject known-invalid sequences of repeated digits.
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const first = computeCnpjCheckDigit(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = computeCnpjCheckDigit(digits.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return first === Number(digits[12]) && second === Number(digits[13]);
}

/** Compute a CNPJ check digit using the provided weight table. */
function computeCnpjCheckDigit(base: string, weights: number[]): number {
  let sum = 0;
  for (let i = 0; i < base.length; i++) {
    sum += Number(base[i]) * weights[i];
  }
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

/** Format a valid 14-digit CNPJ as `00.000.000/0000-00`. */
export function formatCnpj(value: string): string {
  const digits = onlyDigits(value);
  if (digits.length !== 14) return value;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

/**
 * Normalize a CNPJ: strip formatting and, if valid, return the formatted form.
 * Returns the original value when it cannot be validated.
 */
export function normalizeCnpj(value: string): string {
  const digits = onlyDigits(value);
  if (digits.length !== 14 || !isValidCnpj(digits)) return value;
  return formatCnpj(digits);
}