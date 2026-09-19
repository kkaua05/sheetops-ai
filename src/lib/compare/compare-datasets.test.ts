import { describe, it, expect } from "vitest";
import { compareDatasets } from "./compare-datasets";
import { makeDataset } from "@/tests/fixtures";

const columns = [
  { id: "c_id", name: "ID" },
  { id: "c_name", name: "Nome" },
];

describe("compareDatasets", () => {
  it("detects only-in-A, only-in-B, changed, and identical rows", () => {
    const a = makeDataset(columns, [
      { c_id: "1", c_name: "João" },
      { c_id: "2", c_name: "Maria" },
      { c_id: "3", c_name: "Pedro" },
    ]);
    const b = makeDataset(columns, [
      { c_id: "1", c_name: "João" },
      { c_id: "2", c_name: "Maria Silva" },
      { c_id: "4", c_name: "Ana" },
    ]);

    const result = compareDatasets(a, b, { keyColumns: ["c_id"] });

    expect(result.onlyInA).toBe(1); // id 3
    expect(result.onlyInB).toBe(1); // id 4
    expect(result.changed).toBe(1); // id 2
    expect(result.identical).toBe(1); // id 1
  });

  it("applies case-insensitive normalization", () => {
    const a = makeDataset(columns, [{ c_id: "1", c_name: "João" }]);
    const b = makeDataset(columns, [{ c_id: "1", c_name: "JOÃO" }]);

    const result = compareDatasets(a, b, {
      keyColumns: ["c_id"],
      normalize: { caseInsensitive: true },
    });
    expect(result.identical).toBe(1);
    expect(result.changed).toBe(0);
  });

  it("treats case differences as changes without normalization", () => {
    const a = makeDataset(columns, [{ c_id: "1", c_name: "João" }]);
    const b = makeDataset(columns, [{ c_id: "1", c_name: "JOÃO" }]);

    const result = compareDatasets(a, b, { keyColumns: ["c_id"] });
    expect(result.changed).toBe(1);
  });
});