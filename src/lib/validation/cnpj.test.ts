import { describe, it, expect } from "vitest";
import { isValidCnpj, formatCnpj, normalizeCnpj } from "./cnpj";

describe("isValidCnpj", () => {
  it("accepts a valid CNPJ", () => {
    // 11.222.333/0001-81 is a well-known valid test CNPJ.
    expect(isValidCnpj("11222333000181")).toBe(true);
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true);
  });

  it("rejects an invalid check digit", () => {
    expect(isValidCnpj("11222333000182")).toBe(false);
  });

  it("rejects wrong length", () => {
    expect(isValidCnpj("123")).toBe(false);
    expect(isValidCnpj("112223330001811")).toBe(false);
  });

  it("rejects repeated digits", () => {
    expect(isValidCnpj("00000000000000")).toBe(false);
    expect(isValidCnpj("11111111111111")).toBe(false);
  });

  it("rejects empty input", () => {
    expect(isValidCnpj("")).toBe(false);
  });
});

describe("formatCnpj", () => {
  it("formats a 14-digit string", () => {
    expect(formatCnpj("11222333000181")).toBe("11.222.333/0001-81");
  });

  it("returns the original value when length is not 14", () => {
    expect(formatCnpj("123")).toBe("123");
  });
});

describe("normalizeCnpj", () => {
  it("normalizes a valid unformatted CNPJ", () => {
    expect(normalizeCnpj("11222333000181")).toBe("11.222.333/0001-81");
  });

  it("returns the original value for an invalid CNPJ", () => {
    expect(normalizeCnpj("11222333000182")).toBe("11222333000182");
  });
});