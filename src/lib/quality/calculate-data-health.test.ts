import { describe, it, expect } from "vitest";
import { calculateDataHealth } from "./calculate-data-health";
import { makeDataset } from "@/tests/fixtures";

const columns = [
  { id: "c_name", name: "Nome" },
  { id: "c_email", name: "Email" },
];

describe("calculateDataHealth", () => {
  it("returns a perfect score for a complete, clean dataset", () => {
    const dataset = makeDataset(columns, [
      { c_name: "João", c_email: "joao@example.com" },
      { c_name: "Maria", c_email: "maria@example.com" },
    ]);
    const health = calculateDataHealth(dataset);
    expect(health.score).toBe(100);
    expect(health.label).toBe("excellent");
    expect(health.completeness).toBe(100);
  });

  it("penalizes empty cells", () => {
    const dataset = makeDataset(columns, [
      { c_name: "João", c_email: null },
      { c_name: null, c_email: null },
    ]);
    const health = calculateDataHealth(dataset);
    expect(health.completeness).toBeLessThan(100);
    expect(health.score).toBeLessThan(100);
  });

  it("clamps score between 0 and 100", () => {
    const dataset = makeDataset(columns, [
      { c_name: null, c_email: null },
      { c_name: null, c_email: null },
    ]);
    const health = calculateDataHealth(dataset);
    expect(health.score).toBeGreaterThanOrEqual(0);
    expect(health.score).toBeLessThanOrEqual(100);
  });
});