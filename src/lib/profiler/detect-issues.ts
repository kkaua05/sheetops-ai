/**
 * Data quality issue detection.
 *
 * Scans a dataset for common problems: empty cells, duplicates, invalid
 * emails/CPFs/CNPJs/phones/dates, and inconsistent types.
 */

import type { Dataset } from "@/types/dataset";
import type { DataIssue, IssueCategory, IssueSeverity, IssueSummary } from "@/types/issues";
import { inferColumnType } from "./infer-type";
import { isEmptyValue } from "@/lib/utils";
import { isValidEmail } from "@/lib/validation/email";
import { isValidCpf } from "@/lib/validation/cpf";
import { isValidCnpj } from "@/lib/validation/cnpj";
import { isValidPhoneBr } from "@/lib/validation/phone";
import { isValidDate } from "@/lib/validation/dates";

function severityFor(category: IssueCategory): IssueSeverity {
  switch (category) {
    case "invalid_format":
    case "duplicate":
      return "error";
    case "missing_value":
    case "type_mismatch":
      return "warning";
    default:
      return "info";
  }
}

/**
 * Detect data quality issues across the dataset.
 */
export function detectIssues(dataset: Dataset): DataIssue[] {
  const issues: DataIssue[] = [];

  for (const column of dataset.columns) {
    const values = dataset.rows.map((row) => row[column.id] ?? null);
    const inferredType = inferColumnType(values);

    // Missing values.
    const missingCount = values.filter((v) => isEmptyValue(v)).length;
    if (missingCount > 0) {
      issues.push({
        id: `missing_${column.id}`,
        category: "missing_value",
        severity: severityFor("missing_value"),
        columnId: column.id,
        columnName: column.name,
        message: `${missingCount} missing value(s) in "${column.name}".`,
        value: String(missingCount),
      });
    }

    // Invalid values based on inferred type.
    if (inferredType === "email") {
      const invalid = values.filter(
        (v) => !isEmptyValue(v) && !isValidEmail(String(v)),
      ).length;
      if (invalid > 0) {
        issues.push({
          id: `invalid_email_${column.id}`,
          category: "invalid_format",
          severity: severityFor("invalid_format"),
          columnId: column.id,
          columnName: column.name,
          message: `${invalid} invalid email(s) in "${column.name}".`,
          value: String(invalid),
        });
      }
    } else if (inferredType === "document") {
      const invalid = values.filter(
        (v) =>
          !isEmptyValue(v) &&
          !isValidCpf(String(v)) &&
          !isValidCnpj(String(v)),
      ).length;
      if (invalid > 0) {
        issues.push({
          id: `invalid_document_${column.id}`,
          category: "invalid_format",
          severity: severityFor("invalid_format"),
          columnId: column.id,
          columnName: column.name,
          message: `${invalid} invalid document(s) in "${column.name}".`,
          value: String(invalid),
        });
      }
    } else if (inferredType === "phone") {
      const invalid = values.filter(
        (v) => !isEmptyValue(v) && !isValidPhoneBr(String(v)),
      ).length;
      if (invalid > 0) {
        issues.push({
          id: `invalid_phone_${column.id}`,
          category: "invalid_format",
          severity: severityFor("invalid_format"),
          columnId: column.id,
          columnName: column.name,
          message: `${invalid} invalid phone number(s) in "${column.name}".`,
          value: String(invalid),
        });
      }
    } else if (inferredType === "date") {
      const invalid = values.filter(
        (v) =>
          !isEmptyValue(v) &&
          !isValidDate(String(v), "DD/MM/YYYY") &&
          !isValidDate(String(v), "YYYY-MM-DD"),
      ).length;
      if (invalid > 0) {
        issues.push({
          id: `invalid_date_${column.id}`,
          category: "invalid_format",
          severity: severityFor("invalid_format"),
          columnId: column.id,
          columnName: column.name,
          message: `${invalid} invalid date(s) in "${column.name}".`,
          value: String(invalid),
        });
      }
    }
  }

  // Duplicate rows.
  const seen = new Set<string>();
  const duplicateRows: number[] = [];
  dataset.rows.forEach((row, index) => {
    const key = dataset.columns
      .map((c) => String(row[c.id] ?? ""))
      .join("|");
    if (seen.has(key)) duplicateRows.push(index);
    else seen.add(key);
  });

  if (duplicateRows.length > 0) {
    issues.push({
      id: "duplicate_rows",
      category: "duplicate",
      severity: severityFor("duplicate"),
      message: `${duplicateRows.length} duplicate row(s) detected.`,
      value: String(duplicateRows.length),
    });
  }

  return issues;
}

/** Summarize a list of issues into counts by severity. */
export function summarizeIssues(issues: DataIssue[]): IssueSummary {
  const bySeverity: IssueSummary["bySeverity"] = {
    error: 0,
    warning: 0,
    info: 0,
  };
  const byCategory: IssueSummary["byCategory"] = {
    missing_value: 0,
    duplicate: 0,
    invalid_format: 0,
    outlier: 0,
    type_mismatch: 0,
    empty_row: 0,
    empty_column: 0,
    encoding: 0,
    header: 0,
  };

  for (const issue of issues) {
    bySeverity[issue.severity] += 1;
    byCategory[issue.category] += 1;
  }

  return {
    total: issues.length,
    bySeverity,
    byCategory,
  };
}