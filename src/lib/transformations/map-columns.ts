/**
 * Column mapping (rename) operation.
 *
 * Renames columns according to an explicit source-id -> target-name mapping.
 * This is a metadata-only change; cell values are untouched.
 */

import type { Dataset } from "@/types/dataset";
import type { MapColumnsOperation } from "@/types/operations";
import type { CellChange } from "@/types/results";

/**
 * Apply column mapping to a dataset.
 */
export function applyNormalizeText(
  dataset: Dataset,
  operation: MapColumnsOperation,
): { dataset: Dataset; changes: CellChange[] } {
  const mapping = new Map(
    operation.mappings.map((m) => [m.sourceColumnId, m.targetName]),
  );

  const columns = dataset.columns.map((col) => {
    const target = mapping.get(col.id);
    return target !== undefined ? { ...col, name: target } : col;
  });

  return { dataset: { ...dataset, columns }, changes: [] };
}