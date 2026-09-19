import { describe, it, expect } from "vitest";
import { onlyDigits, isValidCpf, formatCpf, normalizeCpf } from "./cpf";

describe("onlyDigits", () => {
  it("removes all non-digit characters", () => {
    expect(onlyDigits("123.456.789-09")).toBe("12345678909");
    expect(onlyDigits("abc123")).toBe("123");
    expect(onlyDigits("")).toBe("");
  });
});

describe("isValidCpf", () => {
  it("accepts a valid CPF", () => {
    // 529.982.247-25 is a well-known valid test CPF.
    expect(isValidCpf("52998224725")).toBe(true);
    expect(isValidCpf("529.982.247-25")).toBe(true);
  });

  it("rejects an invalid check digit", () => {
    expect(isValidCpf("52998224726")).toBe(false);
  });

  it("rejects wrong length", () => {
    expect(isValidCpf("123")).toBe(false);
    expect(isValidCpf("123456789012")).toBe(false);
  });

  it("rejects repeated digits", () => {
    expect(isValidCpf("11111111111")).toBe(false);
    expect(isValidCpf("00000000000")).toBe(false);
  });

  it("rejects empty and non-numeric input", () => {
    expect(isValidCpf("")).toBe(false);
    expect(isValidCpf("abcdefghijk")).toBe(false);
  });
});

describe("formatCpf", () => {
  it("formats an 11-digit string", () => {
    expect(formatCpf("52998224725")).toBe("529.982.247-25");
  });

  it("returns the original value when length is not 11", () => {
    expect(formatCpf("123")).toBe("123");
  });
});

describe("normalizeCpf", () => {
  it("normalizes a valid formatted CPF", () => {
    expect(normalizeCpf("529.982.247-25")).toBe("529.982.247-25");
  });

  it("normalizes a valid unformatted CPF", () => {
    expect(normalizeCpf("52998224725")).toBe("529.982.247-25");
  });

  it("returns the original value for an invalid CPF", () => {
    expect(normalizeCpf("52998224726")).toBe("52998224726");
  });
});