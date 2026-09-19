"use client";

/**
 * ExportToolbar — export the active dataset to XLSX or CSV and undo the last
 * applied transformation.
 *
 * Export modules (ExcelJS/PapaParse) are client-only and are dynamically
 * imported here so they are never bundled into the server bundle.
 */

import * as React from "react";
import type { Dataset } from "@/types/dataset";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { Button, Spinner } from "@/components/ui/primitives";
import { FileSpreadsheet, FileText, Undo2 } from "lucide-react";

type ExportFormat = "xlsx" | "csv";

function triggerDownload(url: string, fileName: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoke the object URL after the download has been initiated.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function ExportToolbar({ dataset }: { dataset: Dataset }) {
  const { undo, canUndo } = useWorkspace();
  const [exporting, setExporting] = React.useState<ExportFormat | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const baseName = React.useMemo(() => {
    const name = dataset.name.replace(/\.[^.]+$/, "");
    return `${name}-limpo`;
  }, [dataset.name]);

  const handleExport = React.useCallback(
    async (format: ExportFormat) => {
      setExporting(format);
      setError(null);
      try {
        if (format === "xlsx") {
          const { exportXlsx } = await import("@/lib/spreadsheet/export-xlsx");
          const result = await exportXlsx(dataset, { baseName });
          triggerDownload(result.url, result.fileName);
        } else {
          const { exportCsv } = await import("@/lib/spreadsheet/export-csv");
          const result = exportCsv(dataset, { baseName });
          triggerDownload(result.url, result.fileName);
        }
      } catch {
        setError("Não foi possível exportar o arquivo.");
      } finally {
        setExporting(null);
      }
    },
    [dataset, baseName],
  );

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-card p-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => handleExport("xlsx")}
        disabled={exporting !== null}
      >
        {exporting === "xlsx" ? (
          <Spinner className="size-4" />
        ) : (
          <FileSpreadsheet className="size-4" aria-hidden="true" />
        )}
        Exportar XLSX
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => handleExport("csv")}
        disabled={exporting !== null}
      >
        {exporting === "csv" ? (
          <Spinner className="size-4" />
        ) : (
          <FileText className="size-4" aria-hidden="true" />
        )}
        Exportar CSV
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={undo}
        disabled={!canUndo}
      >
        <Undo2 className="size-4" aria-hidden="true" />
        Desfazer
      </Button>
      {error && (
        <span role="alert" className="text-sm text-destructive">
          {error}
        </span>
      )}
    </div>
  );
}