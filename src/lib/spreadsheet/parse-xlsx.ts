/**
 * XLSX parsing using ExcelJS.
 *
 * This module is client-only and must be dynamically imported where used so
 * that it is never bundled into the server bundle.
 */

import ExcelJS from "exceljs";
import type { Dataset } from "@/types/dataset";
import { normalizeDataset, type RawRow } from "./normalize-dataset";

export interface XlsxParseOptions {
  fileName: string;
  fileSizeBytes: number;
  /** Zero-based sheet index to parse (defaults to 0). */
  sheetIndex?: number;
}

/**
 * Parse an XLSX ArrayBuffer into a normalized Dataset.
 *
 * Only the first (or requested) worksheet is read. The first non-empty row is
 * treated as the header row.
 */
export async function parseXlsx(
  buffer: ArrayBuffer,
  options: XlsxParseOptions,
): Promise<Dataset> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet =
    workbook.worksheets[options.sheetIndex ?? 0] ?? workbook.worksheets[0];

  if (!worksheet) {
    throw new Error("The XLSX file does not contain any worksheets.");
  }

  const rawRows: RawRow[] = [];
  let headers: string[] = [];

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const values = row.values as unknown[];
    // ExcelJS uses 1-based indexing; index 0 is always undefined.
    const cells = values.slice(1);

    if (rowNumber === 1) {
      headers = cells.map((cell, index) => {
        const text = cell === null || cell === undefined ? "" : String(cell);
        return text.trim().length > 0 ? text.trim() : `Column ${index + 1}`;
      });
      return;
    }

    const raw: RawRow = {};
    headers.forEach((header, index) => {
      raw[header] = cells[index] ?? null;
    });
    rawRows.push(raw);
  });

  if (headers.length === 0) {
    throw new Error("The XLSX file does not contain a header row.");
  }

  return normalizeDataset(rawRows, headers, {
    fileName: options.fileName,
    fileSizeBytes: options.fileSizeBytes,
    sourceType: "xlsx",
    sheetName: worksheet.name,
    hasHeader: true,
  });
}