import { describe, it, expect } from "vitest";
import { toCents, formatCents, differenceCents } from "./money";

describe("toCents", () => {
  it("converts a pt-BR decimal string to cents", () => {
    expect(toCents("149,90")).toBe(14990);
  });

  it("converts a pt-BR formatted string with thousands separator", () => {
    expect(toCents("1.234,56")).toBe(123456);
  });

  it("converts a number", () => {
    expect(toCents(10.5)).toBe(1050);
  });

  it("handles negative values", () => {
    expect(toCents("-12,34")).toBe(-1234);
  });

  it("returns null for non-monetary values", () => {
    expect(toCents("abc")).toBeNull();
    expect(toCents(null)).toBeNull();
    expect(toCents(undefined)).toBeNull();
    expect(toCents(true)).toBeNull();
  });
});

describe("formatCents", () => {
  it("formats cents in pt-BR", () => {
    expect(formatCents(14990)).toBe("149,90");
    expect(formatCents(123456)).toBe("1.234,56");
    expect(formatCents(-1234)).toBe("-12,34");
  });
});

describe("differenceCents", () => {
  it("computes the difference in cents", () => {
    expect(differenceCents("150,00", "149,90")).toBe(10);
  });

  it("returns null when either value is non-monetary", () => {
    expect(differenceCents("abc", "10.00")).toBeNull();
  });
});