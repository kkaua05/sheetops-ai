/**
 * Zod schemas for the operation whitelist.
 *
 * These schemas validate both AI-generated operation plans and any
 * client-submitted plans. They mirror the TypeScript types in
 * `@/types/operations` and are the single source of truth for runtime
 * validation of untrusted input.
 */

import { z } from "zod";

/** A column target referenced by id and name. */
export const columnTargetSchema = z.object({
  columnId: z.string().min(1),
  columnName: z.string().min(1),
});

/** Case normalization modes. */
export const caseModeSchema = z.enum(["UPPER", "LOWER", "TITLE"]);

/** Duplicate removal strategy. */
export const duplicateStrategySchema = z.enum(["KEEP_FIRST", "KEEP_LAST"]);

/** Sort direction. */
export const sortDirectionSchema = z.enum(["ASC", "DESC"]);

/** Shared optional description field. */
const baseOperationSchema = z.object({
  description: z.string().max(500).optional(),
});

export const trimWhitespaceSchema = baseOperationSchema.extend({
  type: z.literal("TRIM_WHITESPACE"),
  columns: z.array(columnTargetSchema).min(1).max(100),
});

export const normalizeMultipleSpacesSchema = baseOperationSchema.extend({
  type: z.literal("NORMALIZE_MULTIPLE_SPACES"),
  columns: z.array(columnTargetSchema).min(1).max(100),
});

export const normalizeCaseSchema = baseOperationSchema.extend({
  type: z.literal("NORMALIZE_CASE"),
  columns: z.array(columnTargetSchema).min(1).max(100),
  mode: caseModeSchema,
});

export const normalizePhoneBrSchema = baseOperationSchema.extend({
  type: z.literal("NORMALIZE_PHONE_BR"),
  columns: z.array(columnTargetSchema).min(1).max(100),
});

export const normalizeDateSchema = baseOperationSchema.extend({
  type: z.literal("NORMALIZE_DATE"),
  columns: z.array(columnTargetSchema).min(1).max(100),
  format: z.string().min(1).max(50),
});

export const normalizeDocumentSchema = baseOperationSchema.extend({
  type: z.literal("NORMALIZE_DOCUMENT"),
  columns: z.array(columnTargetSchema).min(1).max(100),
});

export const validateEmailSchema = baseOperationSchema.extend({
  type: z.literal("VALIDATE_EMAIL"),
  columns: z.array(columnTargetSchema).min(1).max(100),
});

export const validateCpfSchema = baseOperationSchema.extend({
  type: z.literal("VALIDATE_CPF"),
  columns: z.array(columnTargetSchema).min(1).max(100),
});

export const validateCnpjSchema = baseOperationSchema.extend({
  type: z.literal("VALIDATE_CNPJ"),
  columns: z.array(columnTargetSchema).min(1).max(100),
});

export const removeDuplicatesSchema = baseOperationSchema.extend({
  type: z.literal("REMOVE_DUPLICATES"),
  keyColumns: z.array(columnTargetSchema).min(1).max(100),
  strategy: duplicateStrategySchema,
});

export const dropFullyEmptyRowsSchema = baseOperationSchema.extend({
  type: z.literal("DROP_FULLY_EMPTY_ROWS"),
});

export const renameColumnSchema = baseOperationSchema.extend({
  type: z.literal("RENAME_COLUMN"),
  columnId: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
});

export const filterRowsSchema = baseOperationSchema.extend({
  type: z.literal("FILTER_ROWS"),
  columnId: z.string().min(1),
  columnName: z.string().min(1),
  equals: z.string(),
});

export const sortRowsSchema = baseOperationSchema.extend({
  type: z.literal("SORT_ROWS"),
  columnId: z.string().min(1),
  columnName: z.string().min(1),
  direction: sortDirectionSchema,
});

export const splitByValueSchema = baseOperationSchema.extend({
  type: z.literal("SPLIT_BY_VALUE"),
  columnId: z.string().min(1),
  columnName: z.string().min(1),
  delimiter: z.string().min(1).max(10),
});

export const mapColumnsSchema = baseOperationSchema.extend({
  type: z.literal("MAP_COLUMNS"),
  mappings: z
    .array(
      z.object({
        sourceColumnId: z.string().min(1),
        targetName: z.string().min(1),
      }),
    )
    .min(1)
    .max(100),
});

export const mergeDatasetsSchema = baseOperationSchema.extend({
  type: z.literal("MERGE_DATASETS"),
  datasetIds: z.array(z.string().min(1)).min(2).max(10),
  columnMappings: z
    .record(z.string(), z.record(z.string(), z.string()))
    .optional(),
  addSourceColumn: z.boolean(),
});

export const compareDatasetsSchema = baseOperationSchema.extend({
  type: z.literal("COMPARE_DATASETS"),
  datasetAId: z.string().min(1),
  datasetBId: z.string().min(1),
  keyColumns: z.array(z.string().min(1)).min(1).max(100),
  normalize: z
    .object({
      trim: z.boolean().optional(),
      caseInsensitive: z.boolean().optional(),
      normalizeDocuments: z.boolean().optional(),
      normalizePhone: z.boolean().optional(),
    })
    .optional(),
});

export const reconcileDatasetsSchema = baseOperationSchema.extend({
  type: z.literal("RECONCILE_DATASETS"),
  datasetAId: z.string().min(1),
  datasetBId: z.string().min(1),
  keyColumns: z.array(z.string().min(1)).min(1).max(100),
  valueColumnA: z.string().min(1).optional(),
  valueColumnB: z.string().min(1).optional(),
  toleranceCents: z.number().int().min(0),
});

/** The discriminated union of all supported operations. */
export const operationSchema = z.discriminatedUnion("type", [
  trimWhitespaceSchema,
  normalizeMultipleSpacesSchema,
  normalizeCaseSchema,
  normalizePhoneBrSchema,
  normalizeDateSchema,
  normalizeDocumentSchema,
  validateEmailSchema,
  validateCpfSchema,
  validateCnpjSchema,
  removeDuplicatesSchema,
  dropFullyEmptyRowsSchema,
  renameColumnSchema,
  filterRowsSchema,
  sortRowsSchema,
  splitByValueSchema,
  mapColumnsSchema,
  mergeDatasetsSchema,
  compareDatasetsSchema,
  reconcileDatasetsSchema,
]);

export type OperationSchema = z.infer<typeof operationSchema>;