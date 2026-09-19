/**
 * CSV export with formula-injection protection.
 *
 * This module is client-only and must be dynamically imported where used so
 * that it is never bundled into the server bundle.
 */

import type { Dataset } from "@/types/dataset";
import type { ExportResult } from "@/types/results";
import { sanitizeCell, type SanitizedCell } from "@/lib/export/sanitize-formula";

export interface CsvExportOptions {
  /** Base name for the exported file (without extension). */
  baseName: string;
  /** Delimiter to use (defaults to comma). */
  delimiter?: string;
}

export interface CsvExportResult extends ExportResult {
  /** Cells that were protected against formula injection. */
  protectedCells: SanitizedCell[];
}

/** Escape a single CSV field per RFC 4180. */
function escapeField(value: string, delimiter: string): string {
  const needsQuoting =
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r");
  if (!needsQuoting) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Export a Dataset to a CSV Blob.
 *
 * Headers and column order are preserved. Every string cell is checked for
 * formula-injection risk and protected when necessary; protected cells are
 * reported so the export report can disclose the change.
 */
export function exportCsv(
  dataset: Dataset,
  options: CsvExportOptions,
): CsvExportResult {
  const delimiter = options.delimiter ?? ",";
  const protectedCells: SanitizedCell[] = [];

  const headerLine = dataset.columns
    .map((column) => escapeField(column.name, delimiter))
    .join(delimiter);

  const bodyLines = dataset.rows.map((row, rowIndex) =>
    dataset.columns
      .map((column) => {
        const { value, protectedCell } = sanitizeCell(
          row[column.id],
          rowIndex,
          column.id,
          column.name,
        );
        if (protectedCell) protectedCells.push(protectedCell);
        return escapeField(value, delimiter);
      })
      .join(delimiter),
  );

  const csv = [headerLine, ...bodyLines].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  return {
    fileName: `${options.baseName}.csv`,
    mimeType: "text/csv;charset=utf-8;",
    url: URL.createObjectURL(blob),
    rowCount: dataset.rows.length,
    protectedCells,
  };
}