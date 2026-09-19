/**
 * XLSX export using ExcelJS.
 *
 * This module is client-only and must be dynamically imported where used so
 * that it is never bundled into the server bundle.
 */

import ExcelJS from "exceljs";
import type { Dataset } from "@/types/dataset";
import type { ExportResult } from "@/types/results";

export interface XlsxExportOptions {
  /** Base name for the exported file (without extension). */
  baseName: string;
}

/**
 * Export a Dataset to an XLSX Blob.
 *
 * Headers and column order are preserved. Cell values are written as their
 * native types where possible. Existing formulas are never evaluated; string
 * values are written as strings so they are not reinterpreted as formulas.
 */
export async function exportXlsx(
  dataset: Dataset,
  options: XlsxExportOptions,
): Promise<ExportResult> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(dataset.sheetName ?? "Sheet1");

  worksheet.columns = dataset.columns.map((column) => ({
    header: column.name,
    key: column.id,
    width: Math.max(12, column.name.length + 4),
  }));

  for (const row of dataset.rows) {
    const values = dataset.columns.map((column) => {
      const value = row[column.id];
      // Write strings as strings so they are never interpreted as formulas.
      return value === null ? "" : value;
    });
    worksheet.addRow(values);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  return {
    fileName: `${options.baseName}.xlsx`,
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    url: URL.createObjectURL(blob),
    rowCount: dataset.rows.length,
  };
}