/**
 * Normalize raw parsed rows into the canonical Dataset representation.
 *
 * This module is the single point where raw cell values (from ExcelJS or
 * PapaParse) are converted into `CellValue` and where columns are assigned
 * stable ids. It also enforces the configured row/column limits.
 */

import { LIMITS } from "@/config/limits";
import type {
  CellValue,
  DataRow,
  Dataset,
  DatasetColumn,
  DatasetMetadata,
  SourceType,
} from "@/types/dataset";
import { generateId } from "@/lib/utils";

/** A raw row as produced by the parsers (values keyed by header or index). */
export type RawRow = Record<string, unknown>;

export interface NormalizeOptions {
  fileName: string;
  fileSizeBytes: number;
  sourceType: SourceType;
  sheetName?: string;
  hasHeader: boolean;
}

/** Coerce an arbitrary raw value into a `CellValue`. */
export function coerceCellValue(value: unknown): CellValue {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "boolean") return value;
  // Dates and other objects are stringified deterministically.
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

/** Build a stable column id from a header name and index. */
export function buildColumnId(name: string, index: number): string {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
  return slug.length > 0 ? `col_${slug}_${index}` : `col_${index}`;
}

/**
 * Normalize raw rows into a Dataset, enforcing limits and deduplicating
 * column ids when headers collide.
 */
export function normalizeDataset(
  rawRows: RawRow[],
  headers: string[],
  options: NormalizeOptions,
): Dataset {
  if (rawRows.length > LIMITS.MAX_ROWS) {
    throw new Error(
      `File exceeds the maximum of ${LIMITS.MAX_ROWS.toLocaleString("pt-BR")} rows.`,
    );
  }
  if (headers.length > LIMITS.MAX_COLUMNS) {
    throw new Error(
      `File exceeds the maximum of ${LIMITS.MAX_COLUMNS} columns.`,
    );
  }

  const usedIds = new Set<string>();
  const columns: DatasetColumn[] = headers.map((name, index) => {
    let id = buildColumnId(name, index);
    // Guarantee uniqueness even when headers are duplicated.
    while (usedIds.has(id)) {
      id = `${id}_${index}`;
    }
    usedIds.add(id);
    return {
      id,
      name: name.length > 0 ? name : `Column ${index + 1}`,
      index,
      inferredType: "unknown",
    };
  });

  const rows: DataRow[] = rawRows.map((raw) => {
    const row: DataRow = {};
    for (const column of columns) {
      const rawValue = raw[column.name] ?? raw[String(column.index)];
      row[column.id] = coerceCellValue(rawValue);
    }
    return row;
  });

  const metadata: DatasetMetadata = {
    fileName: options.fileName,
    fileSizeBytes: options.fileSizeBytes,
    sourceType: options.sourceType,
    sheetName: options.sheetName,
    importedAt: new Date().toISOString(),
    hasHeader: options.hasHeader,
  };

  return {
    id: generateId("ds"),
    name: options.fileName,
    sourceType: options.sourceType,
    sheetName: options.sheetName,
    columns,
    rows,
    metadata,
  };
}

/** Create an empty dataset (used for edge cases and tests). */
export function createEmptyDataset(
  name: string,
  sourceType: SourceType,
): Dataset {
  return {
    id: generateId("ds"),
    name,
    sourceType,
    columns: [],
    rows: [],
    metadata: {
      fileName: name,
      fileSizeBytes: 0,
      sourceType,
      importedAt: new Date().toISOString(),
      hasHeader: true,
    },
  };
}