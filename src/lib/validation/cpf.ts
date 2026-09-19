/**
 * Brazilian CPF validation and normalization.
 *
 * Implements the official check-digit algorithm (módulo 11).
 */

/** Remove all non-digit characters from a CPF string. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Validate a CPF using the official check-digit algorithm.
 * Accepts both formatted and unformatted input.
 */
export function isValidCpf(value: string): boolean {
  const digits = onlyDigits(value);

  if (digits.length !== 11) return false;

  // Reject known-invalid sequences of repeated digits.
  if (/^(\d)\1{10}$/.test(digits)) return false;

  return checkDigits(digits);
}

/** Compute and verify the two check digits of an 11-digit CPF. */
function checkDigits(digits: string): boolean {
  const first = computeCheckDigit(digits.slice(0, 9), 10);
  const second = computeCheckDigit(digits.slice(0, 10), 11);
  return first === Number(digits[9]) && second === Number(digits[10]);
}

/** Compute a single CPF/CNPJ check digit using módulo 11. */
function computeCheckDigit(base: string, weightStart: number): number {
  let sum = 0;
  for (let i = 0; i < base.length; i++) {
    sum += Number(base[i]) * (weightStart - i);
  }
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

/** Format a valid 11-digit CPF as `000.000.000-00`. */
export function formatCpf(value: string): string {
  const digits = onlyDigits(value);
  if (digits.length !== 11) return value;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/**
 * Normalize a CPF: strip formatting and, if valid, return the formatted form.
 * Returns the original value when it cannot be validated.
 */
export function normalizeCpf(value: string): string {
  const digits = onlyDigits(value);
  if (digits.length !== 11 || !isValidCpf(digits)) return value;
  return formatCpf(digits);
}