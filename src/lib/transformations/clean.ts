/**
 * Single-column cleaning operations.
 *
 * Handles the deterministic, column-scoped operations: trim, multiple-space
 * collapse, case normalization, document normalization, email/CPF/CNPJ
 * validation, rename, drop-empty-rows, filter, sort, and split.
 */

import type { Dataset, DataRow } from "@/types/dataset";
import type {
  Operation,
  TrimWhitespaceOperation,
  NormalizeMultipleSpacesOperation,
  NormalizeCaseOperation,
  NormalizeDocumentOperation,
  ValidateEmailOperation,
  ValidateCpfOperation,
  ValidateCnpjOperation,
  RenameColumnOperation,
  FilterRowsOperation,
  SortRowsOperation,
  SplitByValueOperation,
} from "@/types/operations";
import type { CellChange } from "@/types/results";
import { isEmptyValue, cellToKey } from "@/lib/utils";
import { normalizeCpf } from "@/lib/validation/cpf";
import { normalizeCnpj } from "@/lib/validation/cnpj";
import { isValidEmail } from "@/lib/validation/email";

/** Build a new dataset with the same identity but new rows/columns. */
function withRows(dataset: Dataset, rows: DataRow[]): Dataset {
  return { ...dataset, rows };
}

function withColumns(dataset: Dataset, columns: Dataset["columns"]): Dataset {
  return { ...dataset, columns };
}

function applyTrim(dataset: Dataset, op: TrimWhitespaceOperation) {
  const changes: CellChange[] = [];
  const rows = dataset.rows.map((row, rowIndex) => {
    let changed = false;
    const next = { ...row };
    for (const col of op.columns) {
      const value = row[col.columnId];
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed !== value) {
          next[col.columnId] = trimmed;
          changes.push({
            rowIndex,
            columnId: col.columnId,
            columnName: col.columnName,
            before: value,
            after: trimmed,
          });
          changed = true;
        }
      }
    }
    return changed ? next : row;
  });
  return { dataset: withRows(dataset, rows), changes };
}

function applyMultipleSpaces(dataset: Dataset, op: NormalizeMultipleSpacesOperation) {
  const changes: CellChange[] = [];
  const rows = dataset.rows.map((row, rowIndex) => {
    let changed = false;
    const next = { ...row };
    for (const col of op.columns) {
      const value = row[col.columnId];
      if (typeof value === "string") {
        const collapsed = value.replace(/\s+/g, " ").trim();
        if (collapsed !== value) {
          next[col.columnId] = collapsed;
          changes.push({
            rowIndex,
            columnId: col.columnId,
            columnName: col.columnName,
            before: value,
            after: collapsed,
          });
          changed = true;
        }
      }
    }
    return changed ? next : row;
  });
  return { dataset: withRows(dataset, rows), changes };
}

function applyCase(dataset: Dataset, op: NormalizeCaseOperation) {
  const changes: CellChange[] = [];
  const rows = dataset.rows.map((row, rowIndex) => {
    let changed = false;
    const next = { ...row };
    for (const col of op.columns) {
      const value = row[col.columnId];
      if (typeof value === "string") {
        let normalized: string;
        if (op.mode === "UPPER") normalized = value.toUpperCase();
        else if (op.mode === "LOWER") normalized = value.toLowerCase();
        else normalized = value.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
        if (normalized !== value) {
          next[col.columnId] = normalized;
          changes.push({
            rowIndex,
            columnId: col.columnId,
            columnName: col.columnName,
            before: value,
            after: normalized,
          });
          changed = true;
        }
      }
    }
    return changed ? next : row;
  });
  return { dataset: withRows(dataset, rows), changes };
}

function applyDocument(dataset: Dataset, op: NormalizeDocumentOperation) {
  const changes: CellChange[] = [];
  const rows = dataset.rows.map((row, rowIndex) => {
    let changed = false;
    const next = { ...row };
    for (const col of op.columns) {
      const value = row[col.columnId];
      if (typeof value === "string") {
        const digits = value.replace(/\D/g, "");
        let normalized: string | null = null;
        if (digits.length === 11) normalized = normalizeCpf(value);
        else if (digits.length === 14) normalized = normalizeCnpj(value);
        if (normalized !== null && normalized !== value) {
          next[col.columnId] = normalized;
          changes.push({
            rowIndex,
            columnId: col.columnId,
            columnName: col.columnName,
            before: value,
            after: normalized,
          });
          changed = true;
        }
      }
    }
    return changed ? next : row;
  });
  return { dataset: withRows(dataset, rows), changes };
}

function applyValidateEmail(dataset: Dataset, op: ValidateEmailOperation) {
  const changes: CellChange[] = [];
  const rows = dataset.rows.map((row, rowIndex) => {
    let changed = false;
    const next = { ...row };
    for (const col of op.columns) {
      const value = row[col.columnId];
      if (typeof value === "string" && !isEmptyValue(value)) {
        const valid = isValidEmail(value);
        const after = valid ? value : null;
        if (after !== value) {
          next[col.columnId] = after;
          changes.push({
            rowIndex,
            columnId: col.columnId,
            columnName: col.columnName,
            before: value,
            after,
          });
          changed = true;
        }
      }
    }
    return changed ? next : row;
  });
  return { dataset: withRows(dataset, rows), changes };
}

function applyValidateCpf(dataset: Dataset, op: ValidateCpfOperation) {
  const changes: CellChange[] = [];
  const rows = dataset.rows.map((row, rowIndex) => {
    let changed = false;
    const next = { ...row };
    for (const col of op.columns) {
      const value = row[col.columnId];
      if (typeof value === "string" && !isEmptyValue(value)) {
        const normalized = normalizeCpf(value);
        const after = normalized === value ? value : normalized;
        if (after !== value) {
          next[col.columnId] = after;
          changes.push({
            rowIndex,
            columnId: col.columnId,
            columnName: col.columnName,
            before: value,
            after,
          });
          changed = true;
        }
      }
    }
    return changed ? next : row;
  });
  return { dataset: withRows(dataset, rows), changes };
}

function applyValidateCnpj(dataset: Dataset, op: ValidateCnpjOperation) {
  const changes: CellChange[] = [];
  const rows = dataset.rows.map((row, rowIndex) => {
    let changed = false;
    const next = { ...row };
    for (const col of op.columns) {
      const value = row[col.columnId];
      if (typeof value === "string" && !isEmptyValue(value)) {
        const normalized = normalizeCnpj(value);
        const after = normalized === value ? value : normalized;
        if (after !== value) {
          next[col.columnId] = after;
          changes.push({
            rowIndex,
            columnId: col.columnId,
            columnName: col.columnName,
            before: value,
            after,
          });
          changed = true;
        }
      }
    }
    return changed ? next : row;
  });
  return { dataset: withRows(dataset, rows), changes };
}

function applyRenameColumn(dataset: Dataset, op: RenameColumnOperation) {
  const columns = dataset.columns.map((col) =>
    col.id === op.columnId ? { ...col, name: op.to } : col,
  );
  return { dataset: withColumns(dataset, columns), changes: [] };
}

function applyDropFullyEmptyRows(dataset: Dataset) {
  const rows = dataset.rows.filter((row) =>
    dataset.columns.some((col) => !isEmptyValue(row[col.id])),
  );
  return { dataset: withRows(dataset, rows), changes: [] };
}

function applyFilterRows(dataset: Dataset, op: FilterRowsOperation) {
  const rows = dataset.rows.filter((row) => cellToKey(row[op.columnId]) === op.equals);
  return { dataset: withRows(dataset, rows), changes: [] };
}

function applySortRows(dataset: Dataset, op: SortRowsOperation) {
  const rows = [...dataset.rows].sort((a, b) => {
    const av = cellToKey(a[op.columnId]);
    const bv = cellToKey(b[op.columnId]);
    const cmp = av.localeCompare(bv, "pt-BR", { numeric: true });
    return op.direction === "ASC" ? cmp : -cmp;
  });
  return { dataset: withRows(dataset, rows), changes: [] };
}

function applySplitByValue(dataset: Dataset, op: SplitByValueOperation) {
  const changes: CellChange[] = [];
  const rows = dataset.rows.map((row, rowIndex) => {
    const value = row[op.columnId];
    if (typeof value !== "string" || !value.includes(op.delimiter)) return row;
    const parts = value.split(op.delimiter).map((p) => p.trim());
    const after = parts.join(", ");
    changes.push({
      rowIndex,
      columnId: op.columnId,
      columnName: op.columnName,
      before: value,
      after,
    });
    return { ...row, [op.columnId]: after };
  });
  return { dataset: withRows(dataset, rows), changes };
}

/**
 * Dispatch a single-column cleaning operation.
 */
export function applyClean(
  dataset: Dataset,
  operation: Operation,
): { dataset: Dataset; changes: CellChange[] } {
  switch (operation.type) {
    case "TRIM_WHITESPACE":
      return applyTrim(dataset, operation);
    case "NORMALIZE_MULTIPLE_SPACES":
      return applyMultipleSpaces(dataset, operation);
    case "NORMALIZE_CASE":
      return applyCase(dataset, operation);
    case "NORMALIZE_DOCUMENT":
      return applyDocument(dataset, operation);
    case "VALIDATE_EMAIL":
      return applyValidateEmail(dataset, operation);
    case "VALIDATE_CPF":
      return applyValidateCpf(dataset, operation);
    case "VALIDATE_CNPJ":
      return applyValidateCnpj(dataset, operation);
    case "RENAME_COLUMN":
      return applyRenameColumn(dataset, operation);
    case "DROP_FULLY_EMPTY_ROWS":
      return applyDropFullyEmptyRows(dataset);
    case "FILTER_ROWS":
      return applyFilterRows(dataset, operation);
    case "SORT_ROWS":
      return applySortRows(dataset, operation);
    case "SPLIT_BY_VALUE":
      return applySplitByValue(dataset, operation);
    default:
      return { dataset, changes: [] };
  }
}