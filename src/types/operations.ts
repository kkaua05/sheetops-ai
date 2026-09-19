/**
 * Operation types for the deterministic transformation engine.
 *
 * The AI planner may only select operations from the whitelist defined here.
 * Every operation is a discriminated union keyed by `type`.
 */

/** The complete whitelist of supported operation types. */
export const OPERATION_TYPES = [
  "TRIM_WHITESPACE",
  "NORMALIZE_MULTIPLE_SPACES",
  "NORMALIZE_CASE",
  "NORMALIZE_PHONE_BR",
  "NORMALIZE_DATE",
  "NORMALIZE_DOCUMENT",
  "VALIDATE_EMAIL",
  "VALIDATE_CPF",
  "VALIDATE_CNPJ",
  "REMOVE_DUPLICATES",
  "DROP_FULLY_EMPTY_ROWS",
  "RENAME_COLUMN",
  "FILTER_ROWS",
  "SORT_ROWS",
  "SPLIT_BY_VALUE",
  "MAP_COLUMNS",
  "MERGE_DATASETS",
  "COMPARE_DATASETS",
  "RECONCILE_DATASETS",
] as const;

export type OperationType = (typeof OPERATION_TYPES)[number];

/** Case normalization modes. */
export type CaseMode = "UPPER" | "LOWER" | "TITLE";

/** Duplicate removal strategy. */
export type DuplicateStrategy = "KEEP_FIRST" | "KEEP_LAST";

/** Sort direction. */
export type SortDirection = "ASC" | "DESC";

/** A single column target for a column-scoped operation. */
export interface ColumnTarget {
  columnId: string;
  columnName: string;
}

/** Base fields shared by all operations. */
interface BaseOperation {
  /** Human-readable description shown in the plan and preview. */
  description?: string;
}

export interface TrimWhitespaceOperation extends BaseOperation {
  type: "TRIM_WHITESPACE";
  columns: ColumnTarget[];
}

export interface NormalizeMultipleSpacesOperation extends BaseOperation {
  type: "NORMALIZE_MULTIPLE_SPACES";
  columns: ColumnTarget[];
}

export interface NormalizeCaseOperation extends BaseOperation {
  type: "NORMALIZE_CASE";
  columns: ColumnTarget[];
  mode: CaseMode;
}

export interface NormalizePhoneBrOperation extends BaseOperation {
  type: "NORMALIZE_PHONE_BR";
  columns: ColumnTarget[];
}

export interface NormalizeDateOperation extends BaseOperation {
  type: "NORMALIZE_DATE";
  columns: ColumnTarget[];
  /** Output format, e.g. "DD/MM/YYYY". */
  format: string;
}

export interface NormalizeDocumentOperation extends BaseOperation {
  type: "NORMALIZE_DOCUMENT";
  columns: ColumnTarget[];
}

export interface ValidateEmailOperation extends BaseOperation {
  type: "VALIDATE_EMAIL";
  columns: ColumnTarget[];
}

export interface ValidateCpfOperation extends BaseOperation {
  type: "VALIDATE_CPF";
  columns: ColumnTarget[];
}

export interface ValidateCnpjOperation extends BaseOperation {
  type: "VALIDATE_CNPJ";
  columns: ColumnTarget[];
}

export interface RemoveDuplicatesOperation extends BaseOperation {
  type: "REMOVE_DUPLICATES";
  /** Columns used as the deduplication key. */
  keyColumns: ColumnTarget[];
  strategy: DuplicateStrategy;
}

export interface DropFullyEmptyRowsOperation extends BaseOperation {
  type: "DROP_FULLY_EMPTY_ROWS";
}

export interface RenameColumnOperation extends BaseOperation {
  type: "RENAME_COLUMN";
  columnId: string;
  from: string;
  to: string;
}

export interface FilterRowsOperation extends BaseOperation {
  type: "FILTER_ROWS";
  columnId: string;
  columnName: string;
  /** Keep rows whose value equals this (case-sensitive). */
  equals: string;
}

export interface SortRowsOperation extends BaseOperation {
  type: "SORT_ROWS";
  columnId: string;
  columnName: string;
  direction: SortDirection;
}

export interface SplitByValueOperation extends BaseOperation {
  type: "SPLIT_BY_VALUE";
  columnId: string;
  columnName: string;
  /** Delimiter used to split the value. */
  delimiter: string;
}

export interface MapColumnsOperation extends BaseOperation {
  type: "MAP_COLUMNS";
  /** Source column id -> target column name. */
  mappings: Array<{ sourceColumnId: string; targetName: string }>;
}

export interface MergeDatasetsOperation extends BaseOperation {
  type: "MERGE_DATASETS";
  /** Dataset ids to merge (in order). */
  datasetIds: string[];
  /** Optional column mappings keyed by dataset id. */
  columnMappings?: Record<string, Record<string, string>>;
  /** Whether to add a `_source_file` column for traceability. */
  addSourceColumn: boolean;
}

export interface CompareDatasetsOperation extends BaseOperation {
  type: "COMPARE_DATASETS";
  datasetAId: string;
  datasetBId: string;
  keyColumns: string[];
  /** Optional normalization flags applied before comparison. */
  normalize?: {
    trim?: boolean;
    caseInsensitive?: boolean;
    normalizeDocuments?: boolean;
    normalizePhone?: boolean;
  };
}

export interface ReconcileDatasetsOperation extends BaseOperation {
  type: "RECONCILE_DATASETS";
  datasetAId: string;
  datasetBId: string;
  keyColumns: string[];
  valueColumnA?: string;
  valueColumnB?: string;
  /** Monetary tolerance in cents (integer). */
  toleranceCents: number;
}

/** The discriminated union of all supported operations. */
export type Operation =
  | TrimWhitespaceOperation
  | NormalizeMultipleSpacesOperation
  | NormalizeCaseOperation
  | NormalizePhoneBrOperation
  | NormalizeDateOperation
  | NormalizeDocumentOperation
  | ValidateEmailOperation
  | ValidateCpfOperation
  | ValidateCnpjOperation
  | RemoveDuplicatesOperation
  | DropFullyEmptyRowsOperation
  | RenameColumnOperation
  | FilterRowsOperation
  | SortRowsOperation
  | SplitByValueOperation
  | MapColumnsOperation
  | MergeDatasetsOperation
  | CompareDatasetsOperation
  | ReconcileDatasetsOperation;

/** A validated, structured plan produced by the AI planner. */
export interface OperationPlan {
  version: 1;
  summary: string;
  operations: Operation[];
  warnings: string[];
}