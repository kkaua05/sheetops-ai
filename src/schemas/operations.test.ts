import { describe, it, expect } from "vitest";
import { operationSchema } from "./operations";

describe("operationSchema", () => {
  it("accepts a valid trim operation", () => {
    const result = operationSchema.safeParse({
      type: "TRIM_WHITESPACE",
      columns: [{ columnId: "c_a", columnName: "A" }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid normalize-case operation", () => {
    const result = operationSchema.safeParse({
      type: "NORMALIZE_CASE",
      columns: [{ columnId: "c_a", columnName: "A" }],
      mode: "UPPER",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown operation type", () => {
    const result = operationSchema.safeParse({
      type: "UNKNOWN_OP",
      columns: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a trim operation with empty columns", () => {
    const result = operationSchema.safeParse({
      type: "TRIM_WHITESPACE",
      columns: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid case mode", () => {
    const result = operationSchema.safeParse({
      type: "NORMALIZE_CASE",
      columns: [{ columnId: "c_a", columnName: "A" }],
      mode: "INVALID",
    });
    expect(result.success).toBe(false);
  });
});