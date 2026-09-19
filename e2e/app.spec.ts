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

    await expect(page.getByRole("heading", { name: "SheetOps AI" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Começar análise" })).toBeVisible();
  });

  test("navigates to the workspace", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Começar análise" }).click();

    await expect(page).toHaveURL(/\/workspace$/);
    await expect(page.getByText("Arraste um arquivo aqui")).toBeVisible();
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
});