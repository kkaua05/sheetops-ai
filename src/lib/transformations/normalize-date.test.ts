import { describe, it, expect } from "vitest";
import { applyNormalizeDate } from "./normalize-date";
import { makeDataset } from "@/tests/fixtures";

const columns = [{ id: "c_date", name: "Data" }];

describe("applyNormalizeDate", () => {
  it("normalizes DD/MM/YYYY to YYYY-MM-DD", () => {
    const dataset = makeDataset(columns, [{ c_date: "15/03/2024" }]);
    const { dataset: result } = applyNormalizeDate(dataset, {
      type: "NORMALIZE_DATE",
      columns: [{ columnId: "c_date", columnName: "Data" }],
      format: "YYYY-MM-DD",
    });
    expect(result.rows[0].c_date).toBe("2024-03-15");
  });

  it("normalizes MM/DD/YYYY to DD/MM/YYYY", () => {
    const dataset = makeDataset(columns, [{ c_date: "03/15/2024" }]);
    const { dataset: result } = applyNormalizeDate(dataset, {
      type: "NORMALIZE_DATE",
      columns: [{ columnId: "c_date", columnName: "Data" }],
      format: "DD/MM/YYYY",
    });
    expect(result.rows[0].c_date).toBe("15/03/2024");
  });

  it("leaves unparseable values unchanged", () => {
    const dataset = makeDataset(columns, [{ c_date: "not-a-date" }]);
    const { dataset: result, changes } = applyNormalizeDate(dataset, {
      type: "NORMALIZE_DATE",
      columns: [{ columnId: "c_date", columnName: "Data" }],
      format: "YYYY-MM-DD",
    });
    expect(result.rows[0].c_date).toBe("not-a-date");
    expect(changes).toHaveLength(0);
  });
});