import { test, expect } from "@playwright/test";

/**
 * SheetOps AI — end-to-end smoke tests.
 *
 * These tests exercise the public surface of the app: the landing page and
 * the workspace shell. They do not depend on a live Groq API key; the AI
 * planning panel is only exercised for its empty/disabled states.
 */

test.describe("Home page", () => {
  test("renders the hero and CTA", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Suas planilhas, finalmente sob controle." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Começar análise" })).toBeVisible();
  });

  test("navigates to the workspace", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Começar análise" }).click();

    await expect(page).toHaveURL(/\/workspace$/);
    await expect(page.getByText("Arraste sua planilha aqui")).toBeVisible();
  });
});

test.describe("Workspace", () => {
  test("shows the module navigation", async ({ page }) => {
    await page.goto("/workspace");

    await expect(page.getByRole("navigation", { name: "Módulos" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Limpeza" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Automações IA" })).toBeVisible();
  });

  test("switches modules via the sidebar", async ({ page }) => {
    await page.goto("/workspace");

    await page.getByRole("button", { name: "Limpeza" }).click();
    await expect(page.getByRole("button", { name: "Limpeza" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await page.getByRole("button", { name: "Automações IA" }).click();
    await expect(page.getByRole("button", { name: "Automações IA" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("rejects an unsupported file type", async ({ page }) => {
    await page.goto("/workspace");

    const input = page.locator('input[type="file"]');
    await input.setInputFiles({
      name: "notes.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("not a spreadsheet"),
    });

    await expect(page.getByText("Formato não suportado. Use .xlsx ou .csv.")).toBeVisible();
  });

  test("imports a CSV file and shows a preview", async ({ page }) => {
    await page.goto("/workspace");

    const csv = "nome,email\nAna,ana@example.com\nBruno,bruno@example.com\n";
    const input = page.locator('input[type="file"]');
    await input.setInputFiles({
      name: "contatos.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csv),
    });

    // The dataset name should appear once parsing completes.
    await expect(page.getByText("contatos.csv")).toBeVisible();
  });

  test("enables merge, compare, and reconcile after importing two CSV files", async ({ page }) => {
    await page.goto("/workspace");

    const input = page.locator('input[type="file"]');
    const firstCsv = "cliente,plano,total\nAna,220MB,100,00\n";
    const secondCsv = "cliente,plano,total\nAna,420MB,100,00\n";

    await input.setInputFiles({
      name: "clientes-a.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(firstCsv),
    });
    await expect(page.getByText("clientes-a.csv")).toBeVisible();

    await input.setInputFiles({
      name: "clientes-b.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(secondCsv),
    });
    await expect(page.getByText("clientes-b.csv")).toBeVisible();

    await page.getByRole("button", { name: "Consolidar" }).click();
    await expect(page.locator("h1")).toHaveText("Consolidar arquivos");
    await expect(page.getByRole("button", { name: "Consolidar arquivos" })).toBeEnabled();
    await page.getByRole("button", { name: "Consolidar arquivos" }).click();
    await expect(page.getByRole("status")).toContainText("criado com");

    await page.getByRole("button", { name: "Comparar" }).click();
    await expect(page.locator("h1")).toHaveText("Comparar datasets");
    await expect(page.getByRole("button", { name: "Executar comparação" })).toBeEnabled();
    await page.getByRole("button", { name: "Executar comparação" }).click();
    await expect(page.getByRole("status")).toContainText("Idênticos");

    await page.getByRole("button", { name: "Reconciliar" }).click();
    await expect(page.locator("h1")).toHaveText("Reconciliar valores");
    await expect(page.getByRole("button", { name: "Executar reconciliação" })).toBeEnabled();
    await page.getByRole("button", { name: "Executar reconciliação" }).click();
    await expect(page.getByRole("status")).toContainText("Conciliados");
  });
});