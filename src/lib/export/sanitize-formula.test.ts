import { describe, it, expect } from "vitest";
import {
  isFormulaInjectionRisk,
  sanitizeFormulaValue,
  sanitizeCell,
} from "./sanitize-formula";

describe("isFormulaInjectionRisk", () => {
  it("detects dangerous prefixes", () => {
    expect(isFormulaInjectionRisk("=SUM(A1)")).toBe(true);
    expect(isFormulaInjectionRisk("+1")).toBe(true);
    expect(isFormulaInjectionRisk("-1")).toBe(true);
    expect(isFormulaInjectionRisk("@cmd")).toBe(true);
  });

  it("ignores safe values", () => {
    expect(isFormulaInjectionRisk("hello")).toBe(false);
    expect(isFormulaInjectionRisk("")).toBe(false);
    expect(isFormulaInjectionRisk("1+1")).toBe(false);
  });
});

describe("sanitizeFormulaValue", () => {
  it("prefixes dangerous values with a quote", () => {
    expect(sanitizeFormulaValue("=SUM(A1)")).toBe("'=SUM(A1)");
  });

  it("leaves safe values unchanged", () => {
    expect(sanitizeFormulaValue("hello")).toBe("hello");
  });
});

describe("sanitizeCell", () => {
  it("protects a dangerous string and reports the change", () => {
    const result = sanitizeCell("=SUM(A1)", 0, "c_a", "A");
    expect(result.value).toBe("'=SUM(A1)");
    expect(result.protectedCell).toEqual({
      rowIndex: 0,
      columnId: "c_a",
      columnName: "A",
      original: "=SUM(A1)",
      sanitized: "'=SUM(A1)",
    });
  });

  it("passes through non-string values", () => {
    expect(sanitizeCell(42, 0, "c_a", "A").value).toBe("42");
    expect(sanitizeCell(null, 0, "c_a", "A").value).toBe("");
    expect(sanitizeCell(true, 0, "c_a", "A").value).toBe("true");
  });
});