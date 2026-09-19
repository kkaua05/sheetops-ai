/**
 * Core dataset types for SheetOps AI.
 *
 * The normalized dataset is the single internal representation used across
 * parsing, profiling, transformation, comparison and export. Business rules
 * are never coupled directly to ExcelJS or PapaParse.
 */

/** The source format of an imported file. */
export type SourceType = "xlsx" | "csv";

/** Inferred semantic type of a column. */
export type InferredType =
  | "string"
  | "number"
  | "date"
  | "boolean"
  | "email"
  | "phone"
  | "document"
  | "unknown";

/** A single cell value. `null` represents an empty cell. */
export type CellValue = string | number | boolean | null;

/** A single data row keyed by column id. */
export type DataRow = Record<string, CellValue>;

/** A column in the normalized dataset. */
export interface DatasetColumn {
  /** Stable internal identifier (never derived from the header text). */
  id: string;
  /** Original header name as it appeared in the file. */
  name: string;
  /** Zero-based position in the source file. */
  index: number;
  /** Inferred semantic type. */
  inferredType: InferredType;
}

/** Metadata describing the source and shape of a dataset. */
export interface DatasetMetadata {
  /** Original file name (without path). */
  fileName: string;
  /** Size of the source file in bytes. */
  fileSizeBytes: number;
  /** Source format. */
  sourceType: SourceType;
  /** Sheet name for XLSX sources (undefined for CSV). */
  sheetName?: string;
  /** ISO timestamp of when the file was imported. */
  importedAt: string;
  /** Whether the source had a detectable header row. */
  hasHeader: boolean;
}

/** The normalized dataset. */
export interface Dataset {
  id: string;
  name: string;
  sourceType: SourceType;
  sheetName?: string;
  columns: DatasetColumn[];
  rows: DataRow[];
  metadata: DatasetMetadata;
}

/** A column reference used by operations (by id or by name). */
export interface ColumnRef {
  columnId: string;
  columnName: string;
}