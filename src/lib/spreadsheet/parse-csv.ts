/**
 * CSV parsing using PapaParse.
 *
 * This module is client-only and must be dynamically imported where used so
 * that it is never bundled into the server bundle.
 */

import Papa from "papaparse";
import type { Dataset } from "@/types/dataset";
import { normalizeDataset, type RawRow } from "./normalize-dataset";

export interface CsvParseOptions {
  fileName: string;
  fileSizeBytes: number;
  /** Explicit delimiter; when omitted, PapaParse auto-detects. */
  delimiter?: string;
  hasHeader: boolean;
}

/**
 * Parse CSV text into a normalized Dataset.
 *
 * PapaParse handles quoted fields, embedded commas, embedded newlines and
 * UTF-8 (including BOM) transparently.
 */
export function parseCsv(text: string, options: CsvParseOptions): Dataset {
  const result = Papa.parse<Record<string, unknown>>(text, {
    header: options.hasHeader,
    skipEmptyLines: "greedy",
    delimiter: options.delimiter,
    transformHeader: (header) => header.trim(),
  });

  if (result.errors.length > 0) {
    // PapaParse is lenient; surface the first error as a warning rather than
    // failing the whole import.
    const first = result.errors[0];
    if (first && first.type === "Quotes") {
      throw new Error(
        `CSV parsing error at row ${first.row ?? "unknown"}: ${first.message}`,
      );
    }
  }

  const rawRows = result.data as RawRow[];
  const headers = result.meta.fields ?? [];

  if (headers.length === 0) {
    throw new Error("The CSV file does not contain a header row.");
  }

  return normalizeDataset(rawRows, headers, {
    fileName: options.fileName,
    fileSizeBytes: options.fileSizeBytes,
    sourceType: "csv",
    hasHeader: options.hasHeader,
  });
}

/**
 * Detect the most likely delimiter from a CSV sample.
 * Returns "," or ";" based on which appears more frequently outside quotes.
 */
export function detectDelimiter(sample: string): string {
  const comma = (sample.match(/,/g) ?? []).length;
  const semicolon = (sample.match(/;/g) ?? []).length;
  return semicolon > comma ? ";" : ",";
}