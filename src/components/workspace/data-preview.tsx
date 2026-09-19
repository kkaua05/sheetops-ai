"use client";

/**
 * DataPreview — paginated, horizontally-scrollable table with a sticky header,
 * column type indicators, and a data-health summary.
 */

import * as React from "react";
import type { Dataset } from "@/types/dataset";
import { calculateDataHealth } from "@/lib/quality/calculate-data-health";
import { profileDataset } from "@/lib/profiler/profile-dataset";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives";
import { LIMITS } from "@/config/limits";
import { formatBytes, formatNumber } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

const HEALTH_LABELS: Record<string, string> = {
  excellent: "Excelente",
  good: "Boa",
  fair: "Regular",
  poor: "Ruim",
};

const HEALTH_VARIANTS: Record<string, "success" | "info" | "warning" | "error"> = {
  excellent: "success",
  good: "info",
  fair: "warning",
  poor: "error",
};

const TYPE_LABELS: Record<string, string> = {
  string: "Texto",
  number: "Número",
  date: "Data",
  boolean: "Booleano",
  email: "E-mail",
  phone: "Telefone",
  document: "Documento",
  unknown: "Desconhecido",
};

function formatCell(value: string | number | boolean | null): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

export function DataPreview({ dataset }: { dataset: Dataset }) {
  const [page, setPage] = React.useState(0);
  const health = React.useMemo(() => calculateDataHealth(dataset), [dataset]);
  const profile = React.useMemo(() => profileDataset(dataset), [dataset]);

  const pageSize = LIMITS.PREVIEW_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(dataset.rows.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * pageSize;
  const visibleRows = dataset.rows.slice(start, start + pageSize);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="min-w-0">
          <CardTitle className="truncate text-base">{dataset.name}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatNumber(dataset.rows.length)} linhas · {dataset.columns.length} colunas ·{" "}
            {formatBytes(dataset.metadata.fileSizeBytes)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden text-sm text-muted-foreground sm:inline">Saúde dos dados</span>
          <Badge variant={HEALTH_VARIANTS[health.label]}>
            {health.score}/100 · {HEALTH_LABELS[health.label]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Column type summary */}
        <div className="flex flex-wrap gap-1.5" aria-label="Tipos de coluna">
          {profile.columns.map((col) => (
            <Badge key={col.columnId} variant="outline" className="gap-1 rounded-lg border-border bg-muted/40 px-2.5 py-1">
              <span className="text-muted-foreground">{col.name}:</span>
              {TYPE_LABELS[col.inferredType] ?? col.inferredType}
            </Badge>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-border/80">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead>
              <tr className="bg-[#f8faf8]">
                <th className="sticky left-0 z-10 bg-[#f8faf8] px-3 py-3 text-left text-xs font-semibold text-muted-foreground">
                  #
                </th>
                {dataset.columns.map((col) => (
                  <th
                    key={col.id}
                    className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold text-muted-foreground"
                  >
                    <span className="block">{col.name}</span>
                    <span className="block text-xs font-normal text-muted-foreground">
                      {TYPE_LABELS[col.inferredType] ?? col.inferredType}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={dataset.columns.length + 1}
                    className="px-3 py-8 text-center text-muted-foreground"
                  >
                    Nenhum dado para exibir.
                  </td>
                </tr>
              ) : (
                visibleRows.map((row, i) => (
                  <tr
                    key={start + i}
                    className={cn("border-t border-border/70 hover:bg-accent/40", i % 2 === 1 && "bg-muted/20")}
                  >
                    <td className="sticky left-0 z-10 bg-card px-3 py-3 text-xs text-muted-foreground">
                      {start + i + 1}
                    </td>
                    {dataset.columns.map((col) => (
                      <td key={col.id} className="max-w-[240px] truncate whitespace-nowrap px-3 py-3">
                        {formatCell(row[col.id])}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Página {safePage + 1} de {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Página anterior"
                disabled={safePage === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Próxima página"
                disabled={safePage >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}