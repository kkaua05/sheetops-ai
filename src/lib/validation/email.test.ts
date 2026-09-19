import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail } from "./email";

describe("isValidEmail", () => {
  it("accepts a valid email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("first.last+tag@sub.domain.com.br")).toBe(true);
  });

  it("rejects an email without @", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
  });

  it("rejects an email without domain", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  it("rejects an email with spaces", () => {
    expect(isValidEmail("user @example.com")).toBe(false);
  });

  it("rejects empty input", () => {
    expect(isValidEmail("")).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("trims and lowercases the domain", () => {
    expect(normalizeEmail("  User@Example.COM  ")).toBe("User@example.com");
  });

  it("returns the original value when there is no @", () => {
    expect(normalizeEmail("userexample.com")).toBe("userexample.com");
  });
});