"use client";

/**
 * ChangesPreview — shows the result of the last applied operation plan:
 * summary counts, warnings, and a bounded list of cell-level changes.
 */

import * as React from "react";
import type { ProcessingResult } from "@/types/results";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { formatNumber } from "@/lib/utils";

const MAX_VISIBLE_CHANGES = 100;

function formatValue(value: string | number | boolean | null): string {
  if (value === null || value === undefined) return "∅";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

export function ChangesPreview({ result }: { result: ProcessingResult }) {
  const visibleChanges = result.changes.slice(0, MAX_VISIBLE_CHANGES);
  const hiddenCount = result.changes.length - visibleChanges.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
          Operações aplicadas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {formatNumber(result.cellsChanged)} célula{result.cellsChanged === 1 ? "" : "s"} alterada{result.cellsChanged === 1 ? "" : "s"}
          </Badge>
          {result.rowsRemoved > 0 && (
            <Badge variant="outline">
              {formatNumber(result.rowsRemoved)} linha{result.rowsRemoved === 1 ? "" : "s"} removida{result.rowsRemoved === 1 ? "" : "s"}
            </Badge>
          )}
          {result.rowsAdded > 0 && (
            <Badge variant="outline">
              {formatNumber(result.rowsAdded)} linha{result.rowsAdded === 1 ? "" : "s"} adicionada{result.rowsAdded === 1 ? "" : "s"}
            </Badge>
          )}
          <Badge variant="outline">
            {formatNumber(result.originalRowCount)} → {formatNumber(result.finalRowCount)} linhas
          </Badge>
        </div>

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="space-y-1 rounded-md border border-warning/30 bg-warning/10 p-3">
            {result.warnings.map((warning, i) => (
              <p key={i} className="flex items-start gap-2 text-sm text-warning">
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {warning.message}
              </p>
            ))}
          </div>
        )}

        {/* Cell changes */}
        {visibleChanges.length > 0 && (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Linha</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Coluna</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Antes</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Depois</th>
                </tr>
              </thead>
              <tbody>
                {visibleChanges.map((change, i) => (
                  <tr key={i} className="border-t">
                    <td className="whitespace-nowrap px-3 py-1.5 text-muted-foreground">
                      {change.rowIndex + 1}
                    </td>
                    <td className="whitespace-nowrap px-3 py-1.5">{change.columnName}</td>
                    <td className="whitespace-nowrap px-3 py-1.5 text-muted-foreground">
                      {formatValue(change.before)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-1.5 font-medium">
                      {formatValue(change.after)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {hiddenCount > 0 && (
              <p className="border-t px-3 py-2 text-xs text-muted-foreground">
                + {formatNumber(hiddenCount)} alterações adicionais não exibidas.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}