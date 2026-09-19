import { describe, it, expect } from "vitest";
import { applyDeduplicate } from "./deduplicate";
import { makeDataset } from "@/tests/fixtures";

const columns = [
  { id: "c_id", name: "ID" },
  { id: "c_name", name: "Nome" },
];

describe("applyDeduplicate", () => {
  const rows = [
    { c_id: "1", c_name: "João" },
    { c_id: "2", c_name: "Maria" },
    { c_id: "1", c_name: "João Atualizado" },
    { c_id: "3", c_name: "Pedro" },
  ];

  it("keeps the first occurrence with KEEP_FIRST", () => {
    const dataset = makeDataset(columns, rows);
    const { dataset: result } = applyDeduplicate(dataset, {
      type: "REMOVE_DUPLICATES",
      keyColumns: [{ columnId: "c_id", columnName: "ID" }],
      strategy: "KEEP_FIRST",
    });
    expect(result.rows).toHaveLength(3);
    expect(result.rows[0].c_name).toBe("João");
  });

  it("keeps the last occurrence with KEEP_LAST", () => {
    const dataset = makeDataset(columns, rows);
    const { dataset: result } = applyDeduplicate(dataset, {
      type: "REMOVE_DUPLICATES",
      keyColumns: [{ columnId: "c_id", columnName: "ID" }],
      strategy: "KEEP_LAST",
    });
    expect(result.rows).toHaveLength(3);
    // The kept row for id "1" should be the last occurrence.
    const kept = result.rows.find((r) => r.c_id === "1");
    expect(kept?.c_name).toBe("João Atualizado");
  });

  it("preserves order for KEEP_LAST", () => {
    const dataset = makeDataset(columns, rows);
    const { dataset: result } = applyDeduplicate(dataset, {
      type: "REMOVE_DUPLICATES",
      keyColumns: [{ columnId: "c_id", columnName: "ID" }],
      strategy: "KEEP_LAST",
    });
    expect(result.rows.map((r) => r.c_id)).toEqual(["2", "1", "3"]);
  });

  it("returns no changes", () => {
    const dataset = makeDataset(columns, rows);
    const { changes } = applyDeduplicate(dataset, {
      type: "REMOVE_DUPLICATES",
      keyColumns: [{ columnId: "c_id", columnName: "ID" }],
      strategy: "KEEP_FIRST",
    });
    expect(changes).toEqual([]);
  });
});