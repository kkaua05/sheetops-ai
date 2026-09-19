import { describe, it, expect } from "vitest";
import { operationPlanSchema } from "@/schemas/ai-plan";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";

describe("operationPlanSchema", () => {
  it("accepts a valid plan", () => {
    const result = operationPlanSchema.safeParse({
      version: 1,
      summary: "Limpar dados",
      operations: [
        {
          type: "TRIM_WHITESPACE",
          columns: [{ columnId: "c_a", columnName: "A" }],
        },
      ],
      warnings: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a plan with too many operations", () => {
    const operations = Array.from({ length: 21 }, (_, i) => ({
      type: "TRIM_WHITESPACE" as const,
      columns: [{ columnId: `c_${i}`, columnName: `C${i}` }],
    }));
    const result = operationPlanSchema.safeParse({
      version: 1,
      summary: "Muitas operações",
      operations,
      warnings: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a plan with an invalid version", () => {
    const result = operationPlanSchema.safeParse({
      version: 2,
      summary: "Versão inválida",
      operations: [],
      warnings: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("planner parsePlanContent", () => {
  it("documents the complete FILTER_ROWS contract", () => {
    const prompt = buildSystemPrompt();

    expect(prompt).toContain('"type": "FILTER_ROWS"');
    expect(prompt).toContain('"columnId": "c1"');
    expect(prompt).toContain('"columnName": "Plano"');
    expect(prompt).toContain('"equals": "420MB"');
  });

  // parsePlanContent is not exported; validate the schema path indirectly
  // by confirming the schema rejects malformed operation payloads.
  it("rejects a plan with an invalid operation payload", () => {
    const result = operationPlanSchema.safeParse({
      version: 1,
      summary: "Inválido",
      operations: [{ type: "TRIM_WHITESPACE", columns: [] }],
      warnings: [],
    });
    expect(result.success).toBe(false);
  });
});