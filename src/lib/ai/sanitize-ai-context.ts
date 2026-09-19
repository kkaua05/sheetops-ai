/**
 * Sanitization of AI context.
 *
 * Before any sample or profile is sent to Groq, sensitive values are masked
 * and the payload is minimized. The AI never needs to know the identity of
 * individual records — only column names, inferred types, and aggregate
 * statistics.
 */

import type { Dataset } from "@/types/dataset";
import type { DatasetProfile } from "@/lib/profiler/profile-dataset";
import type { AiDatasetProfile } from "@/schemas/ai-plan";
import { onlyDigits } from "@/lib/validation/cpf";
import { LIMITS } from "@/config/limits";

/** Mask a CPF/CNPJ-like digit sequence, keeping the first 3 digits. */
function maskDigits(value: string): string {
  const digits = onlyDigits(value);
  if (digits.length < 6) return "***";
  return `${digits.slice(0, 3)}${"*".repeat(Math.max(3, digits.length - 3))}`;
}

/** Mask an email address, keeping the first character of the local part. */
function maskEmail(value: string): string {
  const trimmed = value.trim();
  const atIndex = trimmed.lastIndexOf("@");
  if (atIndex === -1) return "***";
  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  const first = local.length > 0 ? local[0] : "*";
  return `${first}***@${domain}`;
}

/** Mask a phone number, keeping the DDD. */
function maskPhone(value: string): string {
  const digits = onlyDigits(value);
  if (digits.length < 4) return "***";
  return `${digits.slice(0, 2)}${"*".repeat(Math.max(3, digits.length - 2))}`;
}

/**
 * Mask a single cell value based on its inferred type.
 * Returns `null` when the value should be omitted entirely.
 */
export function maskValue(
  value: string | number | boolean | null,
  inferredType: string,
): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (str.length === 0) return null;

  switch (inferredType) {
    case "email":
      return maskEmail(str);
    case "phone":
      return maskPhone(str);
    case "document":
      return maskDigits(str);
    default:
      // Never forward arbitrary cell content; the AI only needs aggregates.
      return null;
  }
}

/**
 * Build a minimized, sanitized dataset profile for the AI.
 *
 * Only column names, inferred types, and aggregate statistics are sent.
 * No raw cell values are included.
 */
export function sanitizeDatasetProfile(
  profile: DatasetProfile,
  dataset: Dataset,
): AiDatasetProfile {
  const columns = profile.columns
    .slice(0, LIMITS.MAX_AI_COLUMNS)
    .map((column) => ({
      columnId: column.columnId,
      name: column.name,
      inferredType: column.inferredType,
      nonEmpty: column.nonEmpty,
      empty: column.empty,
      unique: column.unique,
    }));

  return {
    datasetId: profile.datasetId,
    name: dataset.name,
    rowCount: profile.rowCount,
    columnCount: profile.columnCount,
    columns,
  };
}

/**
 * Sanitize a list of dataset profiles for the AI, enforcing the dataset limit.
 */
export function sanitizeDatasetProfiles(
  profiles: Array<{ profile: DatasetProfile; dataset: Dataset }>,
): AiDatasetProfile[] {
  return profiles
    .slice(0, LIMITS.MAX_AI_DATASETS)
    .map(({ profile, dataset }) => sanitizeDatasetProfile(profile, dataset));
}