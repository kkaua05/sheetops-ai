/**
 * Dataset merge (consolidation).
 *
 * Merges multiple datasets into a single dataset using an optional column
 * mapping. The first dataset defines the canonical schema; subsequent
 * datasets are mapped onto it.
 */

import type { Dataset, DatasetColumn, DataRow } from "@/types/dataset";
import type { MergeDatasetsOperation } from "@/types/operations";
import { generateId } from "@/lib/utils";

export interface MergeResult {
  dataset: Dataset;
  /** Number of rows consolidated. */
  totalRows: number;
  /** Number of rows that could not be mapped (missing columns). */
  warningRows: number;
  /** Warnings describing unmapped columns. */
  warnings: string[];
}

/**
 * Merge the datasets referenced by the operation into a single dataset.
 */
export function mergeDatasets(
  datasets: Dataset[],
  operation: MergeDatasetsOperation,
): MergeResult {
  if (datasets.length === 0) {
    throw new Error("At least one dataset is required to merge.");
  }

  const base = datasets[0];
  const warnings: string[] = [];
  let warningRows = 0;

  // The base dataset defines the canonical schema.
  const columns: DatasetColumn[] = base.columns.map((column) => ({ ...column }));

  if (operation.addSourceColumn) {
    columns.push({
      id: generateId("col"),
      name: "_source_file",
      index: columns.length,
      inferredType: "string",
    });
  }

  const rows: DataRow[] = [];

  for (const dataset of datasets) {
    const mapping = operation.columnMappings?.[dataset.id];
    for (const sourceRow of dataset.rows) {
      const row: DataRow = {};
      let hasMissing = false;

      for (const targetColumn of base.columns) {
        const sourceColumn = dataset.columns.find(
          (column) => column.name.toLowerCase() === targetColumn.name.toLowerCase(),
        );
        if (sourceColumn) {
          row[targetColumn.id] = sourceRow[sourceColumn.id] ?? null;
        } else {
          // Try the mapping to find a differently-named source column.
          const mappedSource = dataset.columns.find(
            (column) =>
              mapping?.[column.name]?.toLowerCase() === targetColumn.name.toLowerCase(),
          );
          if (mappedSource) {
            row[targetColumn.id] = sourceRow[mappedSource.id] ?? null;
          } else {
            row[targetColumn.id] = null;
            hasMissing = true;
          }
        }
      }

      if (operation.addSourceColumn) {
        const sourceColumn = columns[columns.length - 1];
        row[sourceColumn.id] = dataset.name;
      }

      if (hasMissing) warningRows += 1;
      rows.push(row);
    }
  }

  if (warningRows > 0) {
    warnings.push(
      `${warningRows} row(s) had columns that could not be mapped and were left empty.`,
    );
  }

  const merged: Dataset = {
    id: generateId("dataset"),
    name: `Merged (${datasets.length} files)`,
    sourceType: base.sourceType,
    columns,
    rows,
    metadata: {
      ...base.metadata,
      fileName: `merged-${datasets.length}-files`,
      importedAt: new Date().toISOString(),
    },
  };

  return { dataset: merged, totalRows: rows.length, warningRows, warnings };
}