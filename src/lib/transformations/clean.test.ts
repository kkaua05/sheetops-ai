import { describe, it, expect } from "vitest";
import { applyClean } from "./clean";
import { makeDataset } from "@/tests/fixtures";

const columns = [
  { id: "c_name", name: "Nome" },
  { id: "c_email", name: "Email" },
  { id: "c_cpf", name: "CPF" },
  { id: "c_cnpj", name: "CNPJ" },
  { id: "c_tags", name: "Tags" },
];

describe("applyClean - TRIM_WHITESPACE", () => {
  it("trims leading/trailing whitespace", () => {
    const dataset = makeDataset(columns, [
      { c_name: "  João  ", c_email: "a@b.com", c_cpf: "", c_cnpj: "", c_tags: "" },
    ]);
    const { dataset: result, changes } = applyClean(dataset, {
      type: "TRIM_WHITESPACE",
      columns: [{ columnId: "c_name", columnName: "Nome" }],
    });
    expect(result.rows[0].c_name).toBe("João");
    expect(changes).toHaveLength(1);
    expect(changes[0].before).toBe("  João  ");
    expect(changes[0].after).toBe("João");
  });

  it("leaves already-trimmed values unchanged", () => {
    const dataset = makeDataset(columns, [
      { c_name: "João", c_email: "a@b.com", c_cpf: "", c_cnpj: "", c_tags: "" },
    ]);
    const { changes } = applyClean(dataset, {
      type: "TRIM_WHITESPACE",
      columns: [{ columnId: "c_name", columnName: "Nome" }],
    });
    expect(changes).toHaveLength(0);
  });
});

describe("applyClean - NORMALIZE_MULTIPLE_SPACES", () => {
  it("collapses multiple spaces", () => {
    const dataset = makeDataset(columns, [
      { c_name: "João   da   Silva", c_email: "a@b.com", c_cpf: "", c_cnpj: "", c_tags: "" },
    ]);
    const { dataset: result } = applyClean(dataset, {
      type: "NORMALIZE_MULTIPLE_SPACES",
      columns: [{ columnId: "c_name", columnName: "Nome" }],
    });
    expect(result.rows[0].c_name).toBe("João da Silva");
  });
});

describe("applyClean - NORMALIZE_CASE", () => {
  it("uppercases", () => {
    const dataset = makeDataset(columns, [
      { c_name: "joão", c_email: "a@b.com", c_cpf: "", c_cnpj: "", c_tags: "" },
    ]);
    const { dataset: result } = applyClean(dataset, {
      type: "NORMALIZE_CASE",
      mode: "UPPER",
      columns: [{ columnId: "c_name", columnName: "Nome" }],
    });
    expect(result.rows[0].c_name).toBe("JOÃO");
  });

  it("lowercases", () => {
    const dataset = makeDataset(columns, [
      { c_name: "JOÃO", c_email: "a@b.com", c_cpf: "", c_cnpj: "", c_tags: "" },
    ]);
    const { dataset: result } = applyClean(dataset, {
      type: "NORMALIZE_CASE",
      mode: "LOWER",
      columns: [{ columnId: "c_name", columnName: "Nome" }],
    });
    expect(result.rows[0].c_name).toBe("joão");
  });

  it("title-cases", () => {
    const dataset = makeDataset(columns, [
      { c_name: "joão da silva", c_email: "a@b.com", c_cpf: "", c_cnpj: "", c_tags: "" },
    ]);
    const { dataset: result } = applyClean(dataset, {
      type: "NORMALIZE_CASE",
      mode: "TITLE",
      columns: [{ columnId: "c_name", columnName: "Nome" }],
    });
    expect(result.rows[0].c_name).toBe("João Da Silva");
  });
});

describe("applyClean - NORMALIZE_DOCUMENT", () => {
  it("normalizes a CPF", () => {
    const dataset = makeDataset(columns, [
      { c_name: "", c_email: "", c_cpf: "52998224725", c_cnpj: "", c_tags: "" },
    ]);
    const { dataset: result } = applyClean(dataset, {
      type: "NORMALIZE_DOCUMENT",
      columns: [{ columnId: "c_cpf", columnName: "CPF" }],
    });
    expect(result.rows[0].c_cpf).toBe("529.982.247-25");
  });

  it("normalizes a CNPJ", () => {
    const dataset = makeDataset(columns, [
      { c_name: "", c_email: "", c_cpf: "", c_cnpj: "11222333000181", c_tags: "" },
    ]);
    const { dataset: result } = applyClean(dataset, {
      type: "NORMALIZE_DOCUMENT",
      columns: [{ columnId: "c_cnpj", columnName: "CNPJ" }],
    });
    expect(result.rows[0].c_cnpj).toBe("11.222.333/0001-81");
  });
});

describe("applyClean - VALIDATE_EMAIL", () => {
  it("nulls out an invalid email", () => {
    const dataset = makeDataset(columns, [
      { c_name: "", c_email: "not-an-email", c_cpf: "", c_cnpj: "", c_tags: "" },
    ]);
    const { dataset: result } = applyClean(dataset, {
      type: "VALIDATE_EMAIL",
      columns: [{ columnId: "c_email", columnName: "Email" }],
    });
    expect(result.rows[0].c_email).toBeNull();
  });

  it("keeps a valid email", () => {
    const dataset = makeDataset(columns, [
      { c_name: "", c_email: "user@example.com", c_cpf: "", c_cnpj: "", c_tags: "" },
    ]);
    const { dataset: result } = applyClean(dataset, {
      type: "VALIDATE_EMAIL",
      columns: [{ columnId: "c_email", columnName: "Email" }],
    });
    expect(result.rows[0].c_email).toBe("user@example.com");
  });
});

describe("applyClean - RENAME_COLUMN", () => {
  it("renames a column", () => {
    const dataset = makeDataset(columns, []);
    const { dataset: result } = applyClean(dataset, {
      type: "RENAME_COLUMN",
      columnId: "c_name",
      from: "Nome",
      to: "Nome Completo",
    });
    expect(result.columns.find((c) => c.id === "c_name")?.name).toBe("Nome Completo");
  });
});

describe("applyClean - DROP_FULLY_EMPTY_ROWS", () => {
  it("drops rows where every cell is empty", () => {
    const dataset = makeDataset(columns, [
      { c_name: "João", c_email: "a@b.com", c_cpf: "", c_cnpj: "", c_tags: "" },
      { c_name: "", c_email: "", c_cpf: "", c_cnpj: "", c_tags: "" },
    ]);
    const { dataset: result } = applyClean(dataset, { type: "DROP_FULLY_EMPTY_ROWS" });
    expect(result.rows).toHaveLength(1);
  });
});

describe("applyClean - FILTER_ROWS", () => {
  it("keeps only rows matching the value", () => {
    const dataset = makeDataset(columns, [
      { c_name: "João", c_email: "a@b.com", c_cpf: "", c_cnpj: "", c_tags: "" },
      { c_name: "Maria", c_email: "c@d.com", c_cpf: "", c_cnpj: "", c_tags: "" },
    ]);
    const { dataset: result } = applyClean(dataset, {
      type: "FILTER_ROWS",
      columnId: "c_name",
      columnName: "Nome",
      equals: "João",
    });
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].c_name).toBe("João");
  });
});

describe("applyClean - SORT_ROWS", () => {
  it("sorts ascending", () => {
    const dataset = makeDataset(columns, [
      { c_name: "Maria", c_email: "c@d.com", c_cpf: "", c_cnpj: "", c_tags: "" },
      { c_name: "João", c_email: "a@b.com", c_cpf: "", c_cnpj: "", c_tags: "" },
    ]);
    const { dataset: result } = applyClean(dataset, {
      type: "SORT_ROWS",
      columnId: "c_name",
      columnName: "Nome",
      direction: "ASC",
    });
    expect(result.rows[0].c_name).toBe("João");
    expect(result.rows[1].c_name).toBe("Maria");
  });

  it("sorts descending", () => {
    const dataset = makeDataset(columns, [
      { c_name: "João", c_email: "a@b.com", c_cpf: "", c_cnpj: "", c_tags: "" },
      { c_name: "Maria", c_email: "c@d.com", c_cpf: "", c_cnpj: "", c_tags: "" },
    ]);
    const { dataset: result } = applyClean(dataset, {
      type: "SORT_ROWS",
      columnId: "c_name",
      columnName: "Nome",
      direction: "DESC",
    });
    expect(result.rows[0].c_name).toBe("Maria");
  });
});

describe("applyClean - SPLIT_BY_VALUE", () => {
  it("splits a delimited value into a comma-separated list", () => {
    const dataset = makeDataset(columns, [
      { c_name: "", c_email: "", c_cpf: "", c_cnpj: "", c_tags: "a;b;c" },
    ]);
    const { dataset: result } = applyClean(dataset, {
      type: "SPLIT_BY_VALUE",
      columnId: "c_tags",
      columnName: "Tags",
      delimiter: ";",
    });
    expect(result.rows[0].c_tags).toBe("a, b, c");
  });
});