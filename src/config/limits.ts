/**
 * Centralized, configurable safety and performance limits for SheetOps AI.
 *
 * These values are intentionally kept in a single module so that no magic
 * numbers are scattered across the codebase. They are used both on the client
 * (file parsing) and the server (AI request validation).
 */

export const LIMITS = {
  /** Maximum accepted file size, in megabytes. */
  MAX_FILE_SIZE_MB: 15,

  /** Maximum number of data rows accepted per file. */
  MAX_ROWS: 50_000,

  /** Maximum number of columns accepted per file. */
  MAX_COLUMNS: 100,

  /** Maximum number of files accepted per multi-file operation (merge). */
  MAX_FILES_PER_OPERATION: 10,

  /** Maximum number of operations allowed in a single AI operation plan. */
  MAX_OPERATIONS_PER_PLAN: 20,

  /** Maximum length (in characters) of a user's natural-language prompt. */
  MAX_PROMPT_LENGTH: 2_000,

  /** Maximum number of datasets sent to the AI planner in one request. */
  MAX_AI_DATASETS: 10,

  /** Maximum number of columns sent to the AI planner per dataset. */
  MAX_AI_COLUMNS: 100,

  /** Maximum number of sample rows sent to the AI planner per dataset. */
  MAX_AI_SAMPLE_ROWS: 5,

  /** Maximum number of rows rendered in the data preview table at once. */
  PREVIEW_PAGE_SIZE: 50,

  /** Maximum number of undo steps retained in the session history. */
  MAX_UNDO_HISTORY: 20,
} as const;

/** Maximum accepted file size, in bytes. */
export const MAX_FILE_SIZE_BYTES = LIMITS.MAX_FILE_SIZE_MB * 1024 * 1024;

/** Supported file extensions for V1. */
export const SUPPORTED_EXTENSIONS = [".xlsx", ".csv"] as const;

export type SupportedExtension = (typeof SUPPORTED_EXTENSIONS)[number];

/** Rejected file extensions that should produce a clear, specific message. */
export const REJECTED_EXTENSIONS = [
  ".xls",
  ".xlsm",
  ".xlsb",
  ".ods",
  ".exe",
  ".zip",
] as const;