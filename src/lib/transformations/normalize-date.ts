/**
 * Date normalization.
 *
 * Converts date strings between supported formats deterministically.
 * Values that do not parse in the source format are left unchanged.
 */

import type { Dataset } from "@/types/dataset";
import type { NormalizeDateOperation } from "@/types/operations";
import type { CellChange } from "@/types/results";
import { parseDate, formatDate, type DateFormat } from "@/lib/validation/dates";

const SOURCE_FORMATS: DateFormat[] = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];

/**
 * Apply date normalization to the configured columns.
 *
 * Each value is parsed by attempting every supported source format; the first
 * format that yields a valid calendar date is used, and the value is then
 * reformatted to the operation's target format. Unparseable values are left
 * unchanged.
 */
export function applyNormalizeDate(
  dataset: Dataset,
  operation: NormalizeDateOperation,
): { dataset: Dataset; changes: CellChange[] } {
  const targetFormat = operation.format as DateFormat;
  const changes: CellChange[] = [];
  const rows = dataset.rows.map((row, rowIndex) => {
    let changed = false;
    const next = { ...row };
    for (const col of operation.columns) {
      const value = row[col.columnId];
      if (typeof value === "string") {
        const parsed = SOURCE_FORMATS
          .map((format) => parseDate(value, format))
          .find((result) => result !== null);
        if (parsed) {
          const normalized = formatDate(parsed, targetFormat);
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
    }
    return changed ? next : row;
  });
  return { dataset: { ...dataset, rows }, changes };
}