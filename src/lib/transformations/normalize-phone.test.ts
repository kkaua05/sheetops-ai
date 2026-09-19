import { describe, it, expect } from "vitest";
import { applyNormalizePhone } from "./normalize-phone";
import { makeDataset } from "@/tests/fixtures";

const columns = [{ id: "c_phone", name: "Telefone" }];

describe("applyNormalizePhone", () => {
  it("normalizes a mobile number", () => {
    const dataset = makeDataset(columns, [{ c_phone: "11912345678" }]);
    const { dataset: result } = applyNormalizePhone(dataset, {
      type: "NORMALIZE_PHONE_BR",
      columns: [{ columnId: "c_phone", columnName: "Telefone" }],
    });
    expect(result.rows[0].c_phone).toBe("(11) 91234-5678");
  });

  it("leaves invalid values unchanged", () => {
    const dataset = makeDataset(columns, [{ c_phone: "123" }]);
    const { dataset: result, changes } = applyNormalizePhone(dataset, {
      type: "NORMALIZE_PHONE_BR",
      columns: [{ columnId: "c_phone", columnName: "Telefone" }],
    });
    expect(result.rows[0].c_phone).toBe("123");
    expect(changes).toHaveLength(0);
  });
});