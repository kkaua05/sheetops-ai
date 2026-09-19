/**
 * Controlled date parsing and normalization.
 *
 * Dates are parsed deterministically from a fixed set of supported formats.
 * No `new Date(string)` is used for ambiguous input, avoiding silent
 * timezone/format misinterpretation.
 */

export type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";

const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(month: number, year: number): number {
  if (month === 2 && isLeapYear(year)) return 29;
  return MONTH_DAYS[month - 1];
}

/** Validate that a day/month/year triple is a real calendar date. */
export function isValidDateParts(day: number, month: number, year: number): boolean {
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > daysInMonth(month, year)) return false;
  return true;
}

export interface ParsedDate {
  day: number;
  month: number;
  year: number;
}

/**
 * Parse a date string using an explicit format.
 * Returns null when the string does not match the format or is not a real date.
 */
export function parseDate(value: string, format: DateFormat): ParsedDate | null {
  const trimmed = value.trim();
  let day: number;
  let month: number;
  let year: number;

  if (format === "DD/MM/YYYY") {
    const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
    if (!match) return null;
    day = Number(match[1]);
    month = Number(match[2]);
    year = Number(match[3]);
  } else if (format === "MM/DD/YYYY") {
    const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
    if (!match) return null;
    month = Number(match[1]);
    day = Number(match[2]);
    year = Number(match[3]);
  } else {
    const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
    if (!match) return null;
    year = Number(match[1]);
    month = Number(match[2]);
    day = Number(match[3]);
  }

  if (!isValidDateParts(day, month, year)) return null;
  return { day, month, year };
}

/** Format a parsed date into the requested output format. */
export function formatDate(parsed: ParsedDate, format: DateFormat): string {
  const dd = String(parsed.day).padStart(2, "0");
  const mm = String(parsed.month).padStart(2, "0");
  const yyyy = String(parsed.year).padStart(4, "0");

  if (format === "DD/MM/YYYY") return `${dd}/${mm}/${yyyy}`;
  if (format === "MM/DD/YYYY") return `${mm}/${dd}/${yyyy}`;
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Normalize a date string from `from` format to `to` format.
 * Returns the original value when parsing fails.
 */
export function normalizeDate(
  value: string,
  from: DateFormat,
  to: DateFormat,
): string {
  const parsed = parseDate(value, from);
  if (!parsed) return value;
  return formatDate(parsed, to);
}

/** Check whether a string is a valid date in the given format. */
export function isValidDate(value: string, format: DateFormat): boolean {
  return parseDate(value, format) !== null;
}