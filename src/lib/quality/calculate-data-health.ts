/**
 * Data health score (0-100).
 *
 * A single, deterministic quality metric derived from detected issues and
 * dataset completeness.
 */

import type { Dataset } from "@/types/dataset";
import { detectIssues, summarizeIssues } from "@/lib/profiler/detect-issues";
import { isEmptyValue } from "@/lib/utils";

export interface DataHealth {
  score: number;
  label: "excellent" | "good" | "fair" | "poor";
  totalIssues: number;
  completeness: number;
}

function labelFor(score: number): DataHealth["label"] {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 50) return "fair";
  return "poor";
}

/**
 * Compute a 0-100 data health score for a dataset.
 */
export function calculateDataHealth(dataset: Dataset): DataHealth {
  const issues = detectIssues(dataset);
  const summary = summarizeIssues(issues);

  // Completeness: fraction of non-empty cells.
  const totalCells = dataset.rows.length * dataset.columns.length;
  const emptyCells = dataset.rows.reduce(
    (acc, row) =>
      acc + dataset.columns.filter((c) => isEmptyValue(row[c.id])).length,
    0,
  );
  const completeness = totalCells === 0 ? 1 : 1 - emptyCells / totalCells;

  // Penalize issues: errors weigh more than warnings, warnings more than info.
  const penalty =
    summary.bySeverity.error * 15 +
    summary.bySeverity.warning * 5 +
    summary.bySeverity.info * 1;

  const raw = completeness * 100 - penalty;
  const score = Math.round(Math.min(100, Math.max(0, raw)));

  return {
    score,
    label: labelFor(score),
    totalIssues: summary.total,
    completeness: Math.round(completeness * 100),
  };
}