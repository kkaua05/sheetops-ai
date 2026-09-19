/**
 * CSV formula injection protection.
 *
 * Spreadsheet applications interpret cells starting with `=`, `+`, `-` or `@`
 * as formulas. When exporting user-controlled data to CSV we must neutralize
 * these prefixes so the exported file cannot execute arbitrary formulas.
 *
 * The sanitization is NOT silent: every protected cell is reported so the
 * export report can disclose exactly what was changed.
 */

/** Characters that trigger formula interpretation in spreadsheet apps. */
const DANGEROUS_PREFIXES = ["=", "+", "-", "@"] as const;

/** A cell that was protected during export. */
export interface SanitizedCell {
  rowIndex: number;
  columnId: string;
  columnName: string;
  /** The original (dangerous) value. */
  original: string;
  /** The sanitized value written to the file. */
  sanitized: string;
}

/**
 * Determine whether a string value requires formula-injection protection.
 */
export function isFormulaInjectionRisk(value: string): boolean {
  if (value.length === 0) return false;
  return DANGEROUS_PREFIXES.some((prefix) => value.startsWith(prefix));
}

/**
 * Neutralize a dangerous value by prefixing it with a single quote.
 *
 * A leading apostrophe is the standard, least-destructive mitigation: it is
 * not displayed by most spreadsheet apps but prevents formula evaluation.
 */
export function sanitizeFormulaValue(value: string): string {
  if (!isFormulaInjectionRisk(value)) return value;
  return `'${value}`;
}

/**
 * Sanitize a single cell value for CSV export.
 *
 * Returns the sanitized string and, when protection was applied, a record of
 * the change so it can be disclosed in the export report.
 */
export function sanitizeCell(
  value: string | number | boolean | null,
  rowIndex: number,
  columnId: string,
  columnName: string,
): { value: string; protectedCell?: SanitizedCell } {
  if (typeof value !== "string") {
    return { value: value === null ? "" : String(value) };
  }
  if (!isFormulaInjectionRisk(value)) {
    return { value };
  }
  const sanitized = sanitizeFormulaValue(value);
  return {
    value: sanitized,
    protectedCell: { rowIndex, columnId, columnName, original: value, sanitized },
  };
}