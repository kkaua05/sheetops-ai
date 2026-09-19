"use client";

/**
 * AiPlanningPanel — lets the user describe a transformation in natural
 * language, sends sanitized dataset profiles to the AI planner, and displays
 * the resulting operation plan with an "apply" action.
 */

import * as React from "react";
import type { Dataset } from "@/types/dataset";
import type { Operation, OperationPlan } from "@/types/operations";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { profileDataset } from "@/lib/profiler/profile-dataset";
import { sanitizeDatasetProfiles } from "@/lib/ai/sanitize-ai-context";
import { executePlan } from "@/lib/transformations/engine";
import { ChangesPreview } from "@/components/workspace/changes-preview";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Spinner,
  Textarea,
} from "@/components/ui/primitives";
import { AlertCircle, CheckCircle2, Sparkles, Wand2 } from "lucide-react";
import { LIMITS } from "@/config/limits";

const OPERATION_LABELS: Record<Operation["type"], string> = {
  TRIM_WHITESPACE: "Remover espaços",
  NORMALIZE_MULTIPLE_SPACES: "Normalizar espaços múltiplos",
  NORMALIZE_CASE: "Normalizar maiúsculas/minúsculas",
  NORMALIZE_PHONE_BR: "Normalizar telefone (BR)",
  NORMALIZE_DATE: "Normalizar data",
  NORMALIZE_DOCUMENT: "Normalizar documento",
  VALIDATE_EMAIL: "Validar e-mail",
  VALIDATE_CPF: "Validar CPF",
  VALIDATE_CNPJ: "Validar CNPJ",
  REMOVE_DUPLICATES: "Remover duplicatas",
  DROP_FULLY_EMPTY_ROWS: "Remover linhas vazias",
  RENAME_COLUMN: "Renomear coluna",
  FILTER_ROWS: "Filtrar linhas",
  SORT_ROWS: "Ordenar linhas",
  SPLIT_BY_VALUE: "Dividir por valor",
  MAP_COLUMNS: "Mapear colunas",
  MERGE_DATASETS: "Consolidar datasets",
  COMPARE_DATASETS: "Comparar datasets",
  RECONCILE_DATASETS: "Reconciliar datasets",
};

function operationSummary(op: Operation): string {
  if (op.description) return op.description;
  const label = OPERATION_LABELS[op.type] ?? op.type;
  if ("columns" in op && Array.isArray(op.columns)) {
    const names = op.columns.map((c) => c.columnName).join(", ");
    return `${label}: ${names}`;
  }
  if ("columnName" in op && op.columnName) {
    return `${label}: ${op.columnName}`;
  }
  return label;
}

export function AiPlanningPanel({ dataset }: { dataset: Dataset }) {
  const { datasets, setPlan, plan, applyResult, lastResult } = useWorkspace();
  const [prompt, setPrompt] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [applying, setApplying] = React.useState(false);

  const handleGenerate = React.useCallback(async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const profiles = sanitizeDatasetProfiles(
        Object.values(datasets).map((ds) => ({
          profile: profileDataset(ds),
          dataset: ds,
        })),
      );

      const response = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), datasets: profiles }),
      });

      const data = (await response.json()) as {
        plan?: OperationPlan;
        error?: string;
      };

      if (!response.ok || !data.plan) {
        setError(data.error ?? "Não foi possível gerar o plano.");
        return;
      }

      setPlan(data.plan);
    } catch {
      setError("Falha de conexão ao gerar o plano.");
    } finally {
      setLoading(false);
    }
  }, [prompt, datasets, setPlan]);

  const handleApply = React.useCallback(() => {
    if (!plan) return;
    setApplying(true);
    try {
      const result = executePlan(dataset, plan);
      applyResult(result);
    } finally {
      setApplying(false);
    }
  }, [plan, dataset, applyResult]);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" aria-hidden="true" />
            Automação com IA
          </CardTitle>
          <CardDescription>
            Descreva o que você quer fazer com os dados. A IA gera um plano de
            operações seguro que você pode revisar antes de aplicar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex.: remova espaços extras, normalize os telefones e remova linhas duplicadas"
            rows={4}
            maxLength={LIMITS.MAX_PROMPT_LENGTH}
            aria-label="Instrução para a IA"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {prompt.length}/{LIMITS.MAX_PROMPT_LENGTH}
            </span>
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Spinner className="size-4" />
                  Interpretando instrução com IA...
                </>
              ) : (
                <>
                  <Wand2 className="size-4" aria-hidden="true" />
                  Gerar plano
                </>
              )}
            </Button>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {plan && (
        <Card>
          <CardHeader>
            <CardTitle>Plano de operações</CardTitle>
            <CardDescription>{plan.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {plan.warnings.length > 0 && (
              <div className="space-y-1 rounded-md border border-warning/30 bg-warning/10 p-3">
                {plan.warnings.map((warning, i) => (
                  <p
                    key={i}
                    className="flex items-start gap-2 text-sm text-warning"
                  >
                    <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    {warning}
                  </p>
                ))}
              </div>
            )}

            <ol className="space-y-2">
              {plan.operations.map((op, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-md border p-3 text-sm"
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">{operationSummary(op)}</p>
                    <Badge variant="outline" className="mt-1">
                      {op.type}
                    </Badge>
                  </div>
                </li>
              ))}
            </ol>

            {plan.operations.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma operação foi sugerida para esta instrução.
              </p>
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={handleApply}
                disabled={applying || plan.operations.length === 0}
                className="gap-2"
              >
                {applying ? (
                  <Spinner className="size-4" />
                ) : (
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                )}
                Aplicar operações
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setPlan(null)}
              >
                Descartar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {lastResult && <ChangesPreview result={lastResult} />}
    </div>
  );
}