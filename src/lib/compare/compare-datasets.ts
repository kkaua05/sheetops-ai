/**
 * Deterministic dataset comparison.
 *
 * Compares two datasets by a set of key columns, classifying each row as
 * added, removed, modified, or unchanged. Optional normalization (trim,
 * case-insensitivity, document/phone normalization) is applied only when
 * explicitly requested.
 */

import type { Dataset, DataRow } from "@/types/dataset";
import type { CompareDatasetsOperation } from "@/types/operations";
import type { ComparisonResult } from "@/types/results";
import { cellToKey, normalizeForCompare } from "@/lib/utils";
import { normalizeCpf } from "@/lib/validation/cpf";
import { normalizeCnpj } from "@/lib/validation/cnpj";
import { normalizePhoneBr } from "@/lib/validation/phone";

export interface CompareOptions {
  keyColumns: string[];
  normalize?: CompareDatasetsOperation["normalize"];
}

/** Build a stable key for a row from the configured key columns. */
function buildKey(
  dataset: Dataset,
  row: DataRow,
  keyColumns: string[],
  normalize?: CompareDatasetsOperation["normalize"],
): string {
  return keyColumns
    .map((columnId) => {
      const resolvedColumnId = dataset.columns.some((column) => column.id === columnId)
        ? columnId
        : dataset.columns.find(
            (column) => column.name.trim().toLowerCase() === columnId.trim().toLowerCase(),
          )?.id ?? columnId;
      const value = row[resolvedColumnId];
      let text = cellToKey(value);
      if (normalize?.trim) text = text.trim();
      if (normalize?.caseInsensitive) text = text.toLowerCase();
      if (normalize?.normalizeDocuments) {
        const cpf = normalizeCpf(text);
        const cnpj = normalizeCnpj(text);
        text = cpf.length > 0 ? cpf : cnpj.length > 0 ? cnpj : text;
      }
      if (normalize?.normalizePhone) {
        const phone = normalizePhoneBr(text);
        if (phone) text = phone;
      }
      return text;
    })
    .join("\u0000");
}

/** Compare two cell values for equality (with optional normalization). */
function valuesEqual(
  a: unknown,
  b: unknown,
  normalize?: CompareDatasetsOperation["normalize"],
): boolean {
  if (normalize?.caseInsensitive || normalize?.trim) {
    return normalizeForCompare(a) === normalizeForCompare(b);
  }
  return cellToKey(a) === cellToKey(b);
}

/**
 * Compare two datasets by key columns.
 */
export function compareDatasets(
  datasetA: Dataset,
  datasetB: Dataset,
  options: CompareOptions,
): ComparisonResult {
  const { keyColumns, normalize } = options;

  const indexA = new Map<string, DataRow[]>();
  const indexB = new Map<string, DataRow[]>();

  for (const row of datasetA.rows) {
    const key = buildKey(datasetA, row, keyColumns, normalize);
    const bucket = indexA.get(key) ?? [];
    bucket.push(row);
    indexA.set(key, bucket);
  }
  for (const row of datasetB.rows) {
    const key = buildKey(datasetB, row, keyColumns, normalize);
    const bucket = indexB.get(key) ?? [];
    bucket.push(row);
    indexB.set(key, bucket);
  }

  let onlyInA = 0;
  let onlyInB = 0;
  let changed = 0;
  let identical = 0;
  const differences: ComparisonResult["differences"] = [];

  const allKeys = new Set([...indexA.keys(), ...indexB.keys()]);

  for (const key of allKeys) {
    const rowsA = indexA.get(key) ?? [];
    const rowsB = indexB.get(key) ?? [];

    if (rowsA.length === 0) {
      onlyInB += rowsB.length;
      for (const row of rowsB) {
        differences.push({ key, status: "only_in_b", b: row });
      }
      continue;
    }
    if (rowsB.length === 0) {
      onlyInA += rowsA.length;
      for (const row of rowsA) {
        differences.push({ key, status: "only_in_a", a: row });
      }
      continue;
    }

    // Pair rows by position; compare the first pair for diff purposes.
    const a = rowsA[0];
    const b = rowsB[0];
    const allColumns = new Set([
      ...datasetA.columns.map((column) => column.name),
      ...datasetB.columns.map((column) => column.name),
    ]);

    let isChanged = false;
    for (const columnId of allColumns) {
      const columnA = datasetA.columns.find((column) => column.name === columnId)?.id ?? columnId;
      const columnB = datasetB.columns.find((column) => column.name === columnId)?.id ?? columnId;
      if (!valuesEqual(a[columnA], b[columnB], normalize)) {
        isChanged = true;
        break;
      }
    }

    if (isChanged) {
      changed += 1;
      differences.push({ key, status: "changed", a, b });
    } else {
      identical += 1;
    }
  }

  return { onlyInA, onlyInB, changed, identical, differences };
}