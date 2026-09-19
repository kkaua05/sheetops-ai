/**
 * Brazilian phone number normalization.
 *
 * Normalizes phone values to `(DD) 9XXXX-XXXX` (mobile) or
 * `(DD) XXXX-XXXX` (landline). Invalid values are left unchanged.
 */

import type { Dataset } from "@/types/dataset";
import type { NormalizePhoneBrOperation } from "@/types/operations";
import type { CellChange } from "@/types/results";
import { normalizePhoneBr } from "@/lib/validation/phone";

/**
 * Apply phone normalization to the configured columns.
 */
export function applyNormalizePhone(
  dataset: Dataset,
  operation: NormalizePhoneBrOperation,
): { dataset: Dataset; changes: CellChange[] } {
  const changes: CellChange[] = [];
  const rows = dataset.rows.map((row, rowIndex) => {
    let changed = false;
    const next = { ...row };
    for (const col of operation.columns) {
      const value = row[col.columnId];
      if (typeof value === "string") {
        const normalized = normalizePhoneBr(value);
        if (normalized !== value) {
          next[col.columnId] = normalized;
          changes.push({
            rowIndex,
            columnId: col.columnId,
            columnName: col.columnName,
            before: value,
            after: normalized,
          });
          changed = true;
        }
      }
    }
    return changed ? next : row;
  });
  return { dataset: { ...dataset, rows }, changes };
}