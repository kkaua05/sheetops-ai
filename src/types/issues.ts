/**
 * Issue types produced by the data profiler and validation operations.
 */

/** Severity of a detected issue. */
export type IssueSeverity = "info" | "warning" | "error";

/** Category of a detected issue. */
export type IssueCategory =
  | "missing_value"
  | "duplicate"
  | "invalid_format"
  | "outlier"
  | "type_mismatch"
  | "empty_row"
  | "empty_column"
  | "encoding"
  | "header";

/** A single detected data-quality issue. */
export interface DataIssue {
  /** Stable identifier. */
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  /** Column id, when the issue is column-scoped. */
  columnId?: string;
  columnName?: string;
  /** Zero-based row index, when the issue is row-scoped. */
  rowIndex?: number;
  /** Human-readable message. */
  message: string;
  /** Optional offending value (truncated for safety). */
  value?: string;
}

/** Aggregated issue counts for a dataset. */
export interface IssueSummary {
  total: number;
  bySeverity: Record<IssueSeverity, number>;
  byCategory: Record<IssueCategory, number>;
}