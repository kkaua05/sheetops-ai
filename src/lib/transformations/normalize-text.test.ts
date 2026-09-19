import { describe, it, expect } from "vitest";
import { applyNormalizeText } from "./normalize-text";
import { makeDataset } from "@/tests/fixtures";

const columns = [
  { id: "c_a", name: "A" },
  { id: "c_b", name: "B" },
];

describe("applyNormalizeText (MAP_COLUMNS)", () => {
  it("renames mapped columns", () => {
    const dataset = makeDataset(columns, [{ c_a: "x", c_b: "y" }]);
    const { dataset: result } = applyNormalizeText(dataset, {
      type: "MAP_COLUMNS",
      mappings: [
        { sourceColumnId: "c_a", targetName: "Primeiro" },
        { sourceColumnId: "c_b", targetName: "Segundo" },
      ],
    });
    expect(result.columns.find((c) => c.id === "c_a")?.name).toBe("Primeiro");
    expect(result.columns.find((c) => c.id === "c_b")?.name).toBe("Segundo");
  });

  it("leaves unmapped columns unchanged", () => {
    const dataset = makeDataset(columns, [{ c_a: "x", c_b: "y" }]);
    const { dataset: result } = applyNormalizeText(dataset, {
      type: "MAP_COLUMNS",
      mappings: [{ sourceColumnId: "c_a", targetName: "Primeiro" }],
    });
    expect(result.columns.find((c) => c.id === "c_b")?.name).toBe("B");
  });

  it("does not change cell values", () => {
    const dataset = makeDataset(columns, [{ c_a: "x", c_b: "y" }]);
    const { dataset: result, changes } = applyNormalizeText(dataset, {
      type: "MAP_COLUMNS",
      mappings: [{ sourceColumnId: "c_a", targetName: "Primeiro" }],
    });
    expect(result.rows[0].c_a).toBe("x");
    expect(changes).toEqual([]);
  });
});