/**
 * Result types returned by the transformation engine and export pipeline.
 */

/** A single cell change recorded during a transformation. */
export interface CellChange {
  rowIndex: number;
  columnId: string;
  columnName: string;
  before: string | number | boolean | null;
  after: string | number | boolean | null;
}

/** A warning emitted during processing. */
export interface ProcessingWarning {
  code: string;
  message: string;
  rowIndex?: number;
  columnId?: string;
}

/** The result of applying an operation plan to a dataset. */
export interface ProcessingResult {
  /** The transformed dataset. */
  dataset: import("./dataset").Dataset;
  /** Number of cells changed. */
  cellsChanged: number;
  /** Number of rows removed. */
  rowsRemoved: number;
  /** Number of rows added (e.g. merge). */
  rowsAdded: number;
  /** Warnings emitted during processing. */
  warnings: ProcessingWarning[];
  /** Detailed cell changes (bounded for memory safety). */
  changes: CellChange[];
  /** Original row count before processing. */
  originalRowCount: number;
  /** Final row count after processing. */
  finalRowCount: number;
}

/** The result of a comparison between two datasets. */
export interface ComparisonResult {
  onlyInA: number;
  onlyInB: number;
  changed: number;
  identical: number;
  /** Detailed row-level differences (bounded). */
  differences: Array<{
    key: string;
    status: "only_in_a" | "only_in_b" | "changed";
    a?: Record<string, string | number | boolean | null>;
    b?: Record<string, string | number | boolean | null>;
  }>;
}

/** The result of a reconciliation between two datasets. */
export interface ReconciliationResult {
  matched: number;
  onlyInA: number;
  onlyInB: number;
  withinTolerance: number;
  outsideTolerance: number;
  /** Total difference in cents across all matched rows. */
  totalDifferenceCents: number;
  /** Detailed row-level reconciliation (bounded). */
  rows: Array<{
    key: string;
    status: "matched" | "only_in_a" | "only_in_b" | "difference";
    valueA?: number;
    valueB?: number;
    differenceCents?: number;
  }>;
}

/** The result of an export operation. */
export interface ExportResult {
  fileName: string;
  mimeType: string;
  /** Blob URL for download (client-side only). */
  url: string;
  /** Number of rows exported. */
  rowCount: number;
}