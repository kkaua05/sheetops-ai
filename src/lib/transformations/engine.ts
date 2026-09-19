/**
 * Deterministic transformation engine.
 *
 * Applies a sequence of operations to a Dataset, producing a new Dataset
 * (immutably) plus a list of cell-level changes for preview/undo.
 */

import type { Dataset } from "@/types/dataset";
import type { Operation, OperationPlan } from "@/types/operations";
import type {
  CellChange,
  ComparisonResult,
  ProcessingResult,
  ProcessingWarning,
  ReconciliationResult,
} from "@/types/results";
import { applyClean } from "./clean";
import { applyDeduplicate } from "./deduplicate";
import { applyNormalizePhone } from "./normalize-phone";
import { applyNormalizeDate } from "./normalize-date";
import { applyNormalizeText } from "./normalize-text";
import { mergeDatasets, type MergeResult } from "@/lib/merge/merge-datasets";
import { compareDatasets } from "@/lib/compare/compare-datasets";
import { reconcileDatasets } from "@/lib/reconcile/reconcile-datasets";

export interface EngineContext {
  /** Additional datasets available for multi-dataset operations. */
  datasets: Record<string, Dataset>;
}

/** Operations handled by the single-column clean module. */
const CLEAN_OPERATIONS = new Set<Operation["type"]>([
  "TRIM_WHITESPACE",
  "NORMALIZE_MULTIPLE_SPACES",
  "NORMALIZE_CASE",
  "NORMALIZE_DOCUMENT",
  "VALIDATE_EMAIL",
  "VALIDATE_CPF",
  "VALIDATE_CNPJ",
  "RENAME_COLUMN",
  "DROP_FULLY_EMPTY_ROWS",
  "FILTER_ROWS",
  "SORT_ROWS",
  "SPLIT_BY_VALUE",
]);

/**
 * Apply a single operation to a dataset, returning the new dataset and the
 * cell changes it produced.
 */
export function applyOperation(
  dataset: Dataset,
  operation: Operation,
): { dataset: Dataset; changes: CellChange[] } {
  if (CLEAN_OPERATIONS.has(operation.type)) {
    return applyClean(dataset, operation);
  }
  switch (operation.type) {
    case "REMOVE_DUPLICATES":
      return applyDeduplicate(dataset, operation);
    case "NORMALIZE_PHONE_BR":
      return applyNormalizePhone(dataset, operation);
    case "NORMALIZE_DATE":
      return applyNormalizeDate(dataset, operation);
    case "MAP_COLUMNS":
      return applyNormalizeText(dataset, operation);
    case "MERGE_DATASETS":
    case "COMPARE_DATASETS":
    case "RECONCILE_DATASETS":
      // Multi-dataset operations are handled by executeMultiDatasetOperation.
      throw new Error(
        `Operation "${operation.type}" requires multiple datasets and must be executed via executeMultiDatasetOperation.`,
      );
    default:
      return { dataset, changes: [] };
  }
}

/**
 * The result of a multi-dataset operation (merge, compare, reconcile).
 *
 * These operations do not fit the single-dataset `{ dataset, changes }` shape:
 * merge produces a new consolidated dataset, while compare and reconcile
 * produce analytical reports without mutating any dataset.
 */
export type MultiDatasetResult =
  | { kind: "merge"; result: MergeResult }
  | { kind: "compare"; result: ComparisonResult }
  | { kind: "reconcile"; result: ReconciliationResult };

/**
 * Execute a multi-dataset operation (MERGE_DATASETS, COMPARE_DATASETS,
 * RECONCILE_DATASETS) against the datasets available in the context.
 */
export function executeMultiDatasetOperation(
  operation: Operation,
  context: EngineContext,
): MultiDatasetResult {
  switch (operation.type) {
    case "MERGE_DATASETS": {
      const datasets = operation.datasetIds
        .map((id) => context.datasets[id])
        .filter((dataset): dataset is Dataset => dataset !== undefined);
      return { kind: "merge", result: mergeDatasets(datasets, operation) };
    }
    case "COMPARE_DATASETS": {
      const datasetA = context.datasets[operation.datasetAId];
      const datasetB = context.datasets[operation.datasetBId];
      if (!datasetA || !datasetB) {
        throw new Error("Both datasets must be present to compare.");
      }
      return {
        kind: "compare",
        result: compareDatasets(datasetA, datasetB, {
          keyColumns: operation.keyColumns,
          normalize: operation.normalize,
        }),
      };
    }
    case "RECONCILE_DATASETS": {
      const datasetA = context.datasets[operation.datasetAId];
      const datasetB = context.datasets[operation.datasetBId];
      if (!datasetA || !datasetB) {
        throw new Error("Both datasets must be present to reconcile.");
      }
      return {
        kind: "reconcile",
        result: reconcileDatasets(datasetA, datasetB, {
          keyColumns: operation.keyColumns,
          valueColumnA: operation.valueColumnA,
          valueColumnB: operation.valueColumnB,
          toleranceCents: operation.toleranceCents,
        }),
      };
    }
    default:
      throw new Error(
        `Operation "${operation.type}" is not a multi-dataset operation.`,
      );
  }
}

/**
 * Execute a full operation plan against a dataset.
 */
export function executePlan(
  dataset: Dataset,
  plan: OperationPlan,
): ProcessingResult {
  const warnings: ProcessingWarning[] = [];
  const changes: CellChange[] = [];
  let current = dataset;
  let rowsRemoved = 0;
  let rowsAdded = 0;

  for (const operation of plan.operations) {
    const beforeRowCount = current.rows.length;
    try {
      const result = applyOperation(current, operation);
      current = result.dataset;
      changes.push(...result.changes);
      const afterRowCount = current.rows.length;
      if (afterRowCount < beforeRowCount) rowsRemoved += beforeRowCount - afterRowCount;
      if (afterRowCount > beforeRowCount) rowsAdded += afterRowCount - beforeRowCount;
    } catch (error) {
      warnings.push({
        code: "OPERATION_FAILED",
        message: error instanceof Error ? error.message : "Operation failed.",
      });
    }
  }

  return {
    dataset: current,
    cellsChanged: changes.length,
    rowsRemoved,
    rowsAdded,
    warnings,
    changes,
    originalRowCount: dataset.rows.length,
    finalRowCount: current.rows.length,
  };
}