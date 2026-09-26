/**
 * Sanitization of AI context.
 *
 * No raw cell values or samples are ever sent to Groq. The AI never needs to
 * know the identity of individual records — only column names, inferred
 * types, and aggregate statistics (row/empty/unique counts).
 */

import type { Dataset } from "@/types/dataset";
import type { DatasetProfile } from "@/lib/profiler/profile-dataset";
import type { AiDatasetProfile } from "@/schemas/ai-plan";
import { LIMITS } from "@/config/limits";

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