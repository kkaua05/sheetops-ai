/**
 * Financial reconciliation.
 *
 * Matches rows between two datasets by key columns and compares monetary
 * value columns using exact integer-cent arithmetic. Never uses floating-point
 * equality for money.
 */

import type { Dataset, DataRow } from "@/types/dataset";
import type { ReconciliationResult } from "@/types/results";
import { cellToKey, normalizeForCompare } from "@/lib/utils";
import { toCents } from "./money";

export interface ReconcileOptions {
  keyColumns: string[];
  valueColumnA?: string;
  valueColumnB?: string;
  toleranceCents?: number;
}

/** Build a stable key for a row from the configured key columns. */
function resolveColumnId(dataset: Dataset, columnRef: string): string {
  if (dataset.columns.some((column) => column.id === columnRef)) return columnRef;
  return dataset.columns.find(
    (column) => column.name.trim().toLowerCase() === columnRef.trim().toLowerCase(),
  )?.id ?? columnRef;
}

function buildKey(dataset: Dataset, row: DataRow, keyColumns: string[]): string {
  return keyColumns
    .map((columnId) => cellToKey(row[resolveColumnId(dataset, columnId)]))
    .join("\u0000");
}

/**
 * Extract a monetary value as integer cents, or `null` when the value is not
 * monetary. The reconciliation result stores values in cents (integers) so
 * that money is never represented as a float.
 */
function extractCents(dataset: Dataset, row: DataRow, columnId?: string): number | null {
  if (!columnId) return null;
  return toCents(row[resolveColumnId(dataset, columnId)]);
}

/**
 * Reconcile two datasets by key columns and monetary value columns.
 */
export function reconcileDatasets(
  datasetA: Dataset,
  datasetB: Dataset,
  options: ReconcileOptions,
): ReconciliationResult {
  const { keyColumns, valueColumnA, valueColumnB, toleranceCents = 0 } = options;

  const indexA = new Map<string, DataRow[]>();
  const indexB = new Map<string, DataRow[]>();

  for (const row of datasetA.rows) {
    const key = buildKey(datasetA, row, keyColumns);
    const bucket = indexA.get(key) ?? [];
    bucket.push(row);
    indexA.set(key, bucket);
  }
  for (const row of datasetB.rows) {
    const key = buildKey(datasetB, row, keyColumns);
    const bucket = indexB.get(key) ?? [];
    bucket.push(row);
    indexB.set(key, bucket);
  }

  let matched = 0;
  let onlyInA = 0;
  let onlyInB = 0;
  let withinTolerance = 0;
  let outsideTolerance = 0;
  let totalDifferenceCents = 0;
  const rows: ReconciliationResult["rows"] = [];

  const allKeys = new Set([...indexA.keys(), ...indexB.keys()]);

  for (const key of allKeys) {
    const rowsA = indexA.get(key) ?? [];
    const rowsB = indexB.get(key) ?? [];

    if (rowsA.length === 0) {
      onlyInB += rowsB.length;
      for (const row of rowsB) {
        rows.push({ key, status: "only_in_b", valueB: extractCents(datasetB, row, valueColumnB) ?? undefined });
      }
      continue;
    }
    if (rowsB.length === 0) {
      onlyInA += rowsA.length;
      for (const row of rowsA) {
        rows.push({ key, status: "only_in_a", valueA: extractCents(datasetA, row, valueColumnA) ?? undefined });
      }
      continue;
    }

    // Duplicate keys on both sides are ambiguous.
    if (rowsA.length > 1 || rowsB.length > 1) {
      for (const row of rowsA) {
        rows.push({ key, status: "only_in_a", valueA: extractCents(datasetA, row, valueColumnA) ?? undefined });
      }
      for (const row of rowsB) {
        rows.push({ key, status: "only_in_b", valueB: extractCents(datasetB, row, valueColumnB) ?? undefined });
      }
      onlyInA += rowsA.length;
      onlyInB += rowsB.length;
      continue;
    }

    const a = rowsA[0];
    const b = rowsB[0];
    const centsA = extractCents(datasetA, a, valueColumnA);
    const centsB = extractCents(datasetB, b, valueColumnB);

    if (centsA === null || centsB === null) {
      // Non-monetary values: treat as matched if equal, else difference.
      const rawA = valueColumnA ? a[valueColumnA] : null;
      const rawB = valueColumnB ? b[valueColumnB] : null;
      if (normalizeForCompare(rawA) === normalizeForCompare(rawB)) {
        matched += 1;
        rows.push({ key, status: "matched" });
      } else {
        outsideTolerance += 1;
        rows.push({ key, status: "difference" });
      }
      continue;
    }

    const diff = centsA - centsB;
    const absoluteDiff = Math.abs(diff);
    totalDifferenceCents += absoluteDiff;

    if (absoluteDiff <= toleranceCents) {
      withinTolerance += 1;
      matched += 1;
      rows.push({
        key,
        status: "matched",
        valueA: centsA,
        valueB: centsB,
        differenceCents: diff,
      });
    } else {
      outsideTolerance += 1;
      rows.push({
        key,
        status: "difference",
        valueA: centsA,
        valueB: centsB,
        differenceCents: diff,
      });
    }
  }

  return {
    matched,
    onlyInA,
    onlyInB,
    withinTolerance,
    outsideTolerance,
    totalDifferenceCents,
    rows,
  };
}