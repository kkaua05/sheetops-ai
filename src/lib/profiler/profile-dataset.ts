/**
 * Dataset profiling: enrich a Dataset with per-column statistics and
 * inferred types.
 */

import type { CellValue, Dataset, DatasetColumn } from "@/types/dataset";
import { inferColumnType } from "./infer-type";
import { isEmptyValue } from "@/lib/utils";

export interface ColumnProfile {
  columnId: string;
  name: string;
  inferredType: DatasetColumn["inferredType"];
  total: number;
  nonEmpty: number;
  empty: number;
  unique: number;
  min?: string | number;
  max?: string | number;
}

export interface DatasetProfile {
  datasetId: string;
  rowCount: number;
  columnCount: number;
  columns: ColumnProfile[];
}

function columnValues(dataset: Dataset, columnId: string): CellValue[] {
  return dataset.rows.map((row) => row[columnId] ?? null);
}

function numericMinMax(values: number[]): { min: number; max: number } | undefined {
  if (values.length === 0) return undefined;
  let min = values[0];
  let max = values[0];
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return { min, max };
}

function stringMinMax(values: string[]): { min: string; max: string } | undefined {
  if (values.length === 0) return undefined;
  const sorted = [...values].sort();
  return { min: sorted[0], max: sorted[sorted.length - 1] };
}

/**
 * Profile a dataset, computing statistics and inferred types for each column.
 */
export function profileDataset(dataset: Dataset): DatasetProfile {
  const columns: ColumnProfile[] = dataset.columns.map((column) => {
    const values = columnValues(dataset, column.id);
    const nonEmptyValues = values.filter((v) => !isEmptyValue(v));
    const unique = new Set(
      nonEmptyValues.map((v) => String(v).trim().toLowerCase()),
    ).size;

    const inferredType = inferColumnType(values);

    let min: string | number | undefined;
    let max: string | number | undefined;

    if (inferredType === "number") {
      const numbers = nonEmptyValues
        .map((v) => Number(String(v).replace(",", ".")))
        .filter((n) => Number.isFinite(n));
      const range = numericMinMax(numbers);
      min = range?.min;
      max = range?.max;
    } else {
      const strings = nonEmptyValues.map((v) => String(v));
      const range = stringMinMax(strings);
      min = range?.min;
      max = range?.max;
    }

    return {
      columnId: column.id,
      name: column.name,
      inferredType,
      total: values.length,
      nonEmpty: nonEmptyValues.length,
      empty: values.length - nonEmptyValues.length,
      unique,
      min,
      max,
    };
  });

  return {
    datasetId: dataset.id,
    rowCount: dataset.rows.length,
    columnCount: dataset.columns.length,
    columns,
  };
}