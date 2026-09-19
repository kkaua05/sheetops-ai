/**
 * Column type inference for the data profiler.
 *
 * Inference is deterministic and conservative: a column is only assigned a
 * semantic type when a sufficient fraction of its non-empty values match.
 */

import type { CellValue, InferredType } from "@/types/dataset";
import { isValidEmail } from "@/lib/validation/email";
import { isValidCpf } from "@/lib/validation/cpf";
import { isValidCnpj } from "@/lib/validation/cnpj";
import { isValidPhoneBr } from "@/lib/validation/phone";
import { isValidDate } from "@/lib/validation/dates";

/** Minimum fraction of non-empty values that must match to infer a type. */
const MATCH_THRESHOLD = 0.8;

/** Minimum number of non-empty values required to infer a type. */
const MIN_SAMPLE = 3;

const NUMBER_REGEX = /^-?\d+(?:[.,]\d+)?$/;
const BOOLEAN_VALUES = new Set(["true", "false", "sim", "não", "nao", "yes", "no", "0", "1"]);

function isNumeric(value: string): boolean {
  return NUMBER_REGEX.test(value.trim());
}

function isBoolean(value: string): boolean {
  return BOOLEAN_VALUES.has(value.trim().toLowerCase());
}

function isDocument(value: string): boolean {
  return isValidCpf(value) || isValidCnpj(value);
}

/**
 * Infer the semantic type of a column from its non-empty values.
 */
export function inferColumnType(values: CellValue[]): InferredType {
  const nonEmpty = values.filter(
    (v): v is string | number | boolean => v !== null && v !== undefined,
  );

  if (nonEmpty.length < MIN_SAMPLE) return "unknown";

  const strings = nonEmpty.map((v) => String(v));

  const count = (predicate: (s: string) => boolean): number =>
    strings.reduce((acc, s) => acc + (predicate(s) ? 1 : 0), 0);

  const total = strings.length;

  if (count(isDocument) / total >= MATCH_THRESHOLD) return "document";
  if (count((s) => isValidEmail(s)) / total >= MATCH_THRESHOLD) return "email";
  if (count((s) => isValidPhoneBr(s)) / total >= MATCH_THRESHOLD) return "phone";
  if (count((s) => isValidDate(s, "DD/MM/YYYY") || isValidDate(s, "YYYY-MM-DD")) / total >= MATCH_THRESHOLD) {
    return "date";
  }
  if (count(isBoolean) / total >= MATCH_THRESHOLD) return "boolean";
  if (count(isNumeric) / total >= MATCH_THRESHOLD) return "number";

  return "string";
}