import { describe, it, expect } from "vitest";
import { isValidPhoneBr, normalizePhoneBr } from "./phone";

describe("isValidPhoneBr", () => {
  it("accepts a valid mobile number", () => {
    expect(isValidPhoneBr("(11) 91234-5678")).toBe(true);
    expect(isValidPhoneBr("11912345678")).toBe(true);
  });

  it("accepts a valid landline", () => {
    expect(isValidPhoneBr("(11) 3456-7890")).toBe(true);
    expect(isValidPhoneBr("1134567890")).toBe(true);
  });

  it("accepts a number with country code", () => {
    expect(isValidPhoneBr("+55 11 91234-5678")).toBe(true);
  });

  it("rejects an invalid DDD", () => {
    expect(isValidPhoneBr("00912345678")).toBe(false);
  });

  it("rejects a mobile that does not start with 9", () => {
    expect(isValidPhoneBr("11812345678")).toBe(false);
  });

  it("rejects wrong length", () => {
    expect(isValidPhoneBr("123")).toBe(false);
    expect(isValidPhoneBr("119123456789")).toBe(false);
  });

  it("rejects empty input", () => {
    expect(isValidPhoneBr("")).toBe(false);
  });
});

describe("normalizePhoneBr", () => {
  it("normalizes a mobile number", () => {
    expect(normalizePhoneBr("11912345678")).toBe("(11) 91234-5678");
  });

  it("normalizes a landline", () => {
    expect(normalizePhoneBr("1134567890")).toBe("(11) 3456-7890");
  });

  it("strips the country code", () => {
    expect(normalizePhoneBr("+55 11 91234-5678")).toBe("(11) 91234-5678");
  });

  it("returns the original value for an invalid number", () => {
    expect(normalizePhoneBr("123")).toBe("123");
  });
});