import { describe, it, expect } from "vitest";
import { reconcileDatasets } from "./reconcile-datasets";
import { makeDataset } from "@/tests/fixtures";

const columns = [
  { id: "c_id", name: "ID" },
  { id: "c_value", name: "Valor" },
];

describe("reconcileDatasets", () => {
  it("matches rows within tolerance", () => {
    const a = makeDataset(columns, [
      { c_id: "1", c_value: "100,00" },
      { c_id: "2", c_value: "50,00" },
    ]);
    const b = makeDataset(columns, [
      { c_id: "1", c_value: "100,05" },
      { c_id: "3", c_value: "20,00" },
    ]);

    const result = reconcileDatasets(a, b, {
      keyColumns: ["c_id"],
      valueColumnA: "c_value",
      valueColumnB: "c_value",
      toleranceCents: 10,
    });

    expect(result.matched).toBe(1);
    expect(result.withinTolerance).toBe(1);
    expect(result.onlyInA).toBe(1); // id 2
    expect(result.onlyInB).toBe(1); // id 3
  });

  it("flags differences outside tolerance", () => {
    const a = makeDataset(columns, [{ c_id: "1", c_value: "100,00" }]);
    const b = makeDataset(columns, [{ c_id: "1", c_value: "200,00" }]);

    const result = reconcileDatasets(a, b, {
      keyColumns: ["c_id"],
      valueColumnA: "c_value",
      valueColumnB: "c_value",
      toleranceCents: 0,
    });

    expect(result.outsideTolerance).toBe(1);
    expect(result.totalDifferenceCents).toBe(10000);
  });
});