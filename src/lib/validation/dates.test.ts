import { describe, it, expect } from "vitest";
import { parseDate, formatDate, isValidDateParts } from "./dates";

describe("isValidDateParts", () => {
  it("accepts a real date", () => {
    expect(isValidDateParts(15, 3, 2024)).toBe(true);
  });

  it("rejects an impossible date", () => {
    expect(isValidDateParts(31, 2, 2024)).toBe(false);
    expect(isValidDateParts(0, 1, 2024)).toBe(false);
    expect(isValidDateParts(1, 13, 2024)).toBe(false);
  });

  it("accepts Feb 29 in a leap year", () => {
    expect(isValidDateParts(29, 2, 2024)).toBe(true);
    expect(isValidDateParts(29, 2, 2023)).toBe(false);
  });
});

describe("parseDate", () => {
  it("parses DD/MM/YYYY", () => {
    expect(parseDate("15/03/2024", "DD/MM/YYYY")).toEqual({
      day: 15,
      month: 3,
      year: 2024,
    });
  });

  it("parses MM/DD/YYYY", () => {
    expect(parseDate("03/15/2024", "MM/DD/YYYY")).toEqual({
      day: 15,
      month: 3,
      year: 2024,
    });
  });

  it("parses YYYY-MM-DD", () => {
    expect(parseDate("2024-03-15", "YYYY-MM-DD")).toEqual({
      day: 15,
      month: 3,
      year: 2024,
    });
  });

  it("returns null for an invalid date", () => {
    expect(parseDate("31/02/2024", "DD/MM/YYYY")).toBeNull();
    expect(parseDate("not-a-date", "DD/MM/YYYY")).toBeNull();
  });
});

describe("formatDate", () => {
  const parsed = { day: 5, month: 3, year: 2024 };

  it("formats DD/MM/YYYY", () => {
    expect(formatDate(parsed, "DD/MM/YYYY")).toBe("05/03/2024");
  });

  it("formats MM/DD/YYYY", () => {
    expect(formatDate(parsed, "MM/DD/YYYY")).toBe("03/05/2024");
  });

  it("formats YYYY-MM-DD", () => {
    expect(formatDate(parsed, "YYYY-MM-DD")).toBe("2024-03-05");
  });
});