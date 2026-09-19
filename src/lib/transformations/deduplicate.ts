/**
 * Duplicate row removal.
 *
 * Removes rows that share the same key-column values, keeping either the
 * first or last occurrence per the configured strategy.
 */

import type { Dataset } from "@/types/dataset";
import type { RemoveDuplicatesOperation } from "@/types/operations";
import type { CellChange } from "@/types/results";
import { cellToKey } from "@/lib/utils";

/**
 * Apply duplicate removal to a dataset.
 */
export function applyDeduplicate(
  dataset: Dataset,
  operation: RemoveDuplicatesOperation,
): { dataset: Dataset; changes: CellChange[] } {
  const keyIds = operation.keyColumns.map((c) => c.columnId);

  const buildKey = (row: Dataset["rows"][number]): string =>
    keyIds.map((id) => cellToKey(row[id])).join("\u0000");

  const seen = new Set<string>();
  const kept: Dataset["rows"] = [];

  if (operation.strategy === "KEEP_LAST") {
    // Iterate in reverse to keep the last occurrence, then restore order.
    const keptReverse: Dataset["rows"] = [];
    for (let i = dataset.rows.length - 1; i >= 0; i--) {
      const row = dataset.rows[i];
      const key = buildKey(row);
      if (seen.has(key)) continue;
      seen.add(key);
      keptReverse.push(row);
    }
    keptReverse.reverse();
    kept.push(...keptReverse);
  } else {
    for (const row of dataset.rows) {
      const key = buildKey(row);
      if (seen.has(key)) continue;
      seen.add(key);
      kept.push(row);
    }
  }

  return { dataset: { ...dataset, rows: kept }, changes: [] };
}