"use client";

import * as React from "react";
import { ArrowRightLeft, Check, Layers, Play, Scale, TableProperties } from "lucide-react";
import { compareDatasets } from "@/lib/compare/compare-datasets";
import { mergeDatasets } from "@/lib/merge/merge-datasets";
import { reconcileDatasets } from "@/lib/reconcile/reconcile-datasets";
import type { Dataset } from "@/types/dataset";
import type { ComparisonResult, ReconciliationResult } from "@/types/results";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@/components/ui/primitives";

interface MultiDatasetToolsProps {
  mode: "merge" | "compare" | "reconcile";
}

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
      >
        <option value="">Selecione...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Metric({ label, value, tone = "" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <TableProperties className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="font-medium">Importe pelo menos dois arquivos</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Estes módulos precisam de dois ou mais datasets para trabalhar com segurança.
        </p>
      </CardContent>
    </Card>
  );
}

function useDatasetPairs(datasets: Record<string, Dataset>, datasetOrder: string[]) {
  const available = datasetOrder.map((id) => datasets[id]).filter(Boolean);
  const first = available[0];
  const second = available[1];
  const commonColumns = first && second
    ? first.columns.filter((column) => second.columns.some((candidate) => candidate.name.trim().toLowerCase() === column.name.trim().toLowerCase()))
    : [];
  return { available, first, second, commonColumns };
}

function MergeTool({ available }: { available: Dataset[] }) {
  const { addDataset } = useWorkspace();
  const [selected, setSelected] = React.useState<string[]>(available.map((dataset) => dataset.id));
  const [addSourceColumn, setAddSourceColumn] = React.useState(true);
  const [result, setResult] = React.useState<{ name: string; rows: number; warnings: string[] } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const toggleDataset = (id: string) => {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const handleMerge = () => {
    setError(null);
    setResult(null);
    if (selected.length < 2) {
      setError("Selecione pelo menos dois arquivos para consolidar.");
      return;
    }
    try {
      const merged = mergeDatasets(
        selected.map((id) => available.find((dataset) => dataset.id === id)).filter((dataset): dataset is Dataset => Boolean(dataset)),
        { type: "MERGE_DATASETS", datasetIds: selected, addSourceColumn },
      );
      addDataset(merged.dataset);
      setResult({ name: merged.dataset.name, rows: merged.totalRows, warnings: merged.warnings });
    } catch (mergeError) {
      setError(mergeError instanceof Error ? mergeError.message : "Não foi possível consolidar os arquivos.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Layers className="size-5 text-primary" aria-hidden="true" />Consolidar arquivos</CardTitle>
        <CardDescription>Combine vários datasets usando o primeiro arquivo como esquema principal.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {available.map((dataset) => (
            <label key={dataset.id} className="flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm hover:bg-accent/50">
              <input type="checkbox" checked={selected.includes(dataset.id)} onChange={() => toggleDataset(dataset.id)} className="size-4 accent-primary" />
              <span className="min-w-0"><span className="block truncate font-medium">{dataset.name}</span><span className="text-xs text-muted-foreground">{dataset.rows.length} linhas · {dataset.columns.length} colunas</span></span>
            </label>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={addSourceColumn} onChange={(event) => setAddSourceColumn(event.target.checked)} className="size-4 accent-primary" />
          Adicionar coluna de origem (`_source_file`)
        </label>
        <Button onClick={handleMerge} disabled={selected.length < 2} className="gap-2"><Play className="size-4" aria-hidden="true" />Consolidar datasets</Button>
        {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {result && <div role="status" className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm"><p className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300"><Check className="size-4" />{result.name} criado com {result.rows} linhas.</p>{result.warnings.map((warning) => <p key={warning} className="mt-1 text-muted-foreground">{warning}</p>)}</div>}
      </CardContent>
    </Card>
  );
}

function CompareTool({ first, second, commonColumns }: { first: Dataset; second: Dataset; commonColumns: Dataset["columns"] }) {
  const [keyColumn, setKeyColumn] = React.useState(commonColumns[0]?.name ?? "");
  const [caseInsensitive, setCaseInsensitive] = React.useState(true);
  const [result, setResult] = React.useState<ComparisonResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const run = () => {
    const column = commonColumns.find((item) => item.name === keyColumn);
    if (!column) { setError("Selecione uma coluna presente nos dois arquivos."); return; }
    try { setError(null); setResult(compareDatasets(first, second, { keyColumns: [column.id], normalize: { trim: true, caseInsensitive } })); } catch (compareError) { setError(compareError instanceof Error ? compareError.message : "Não foi possível comparar os arquivos."); }
  };
  return <Card><CardHeader><CardTitle className="flex items-center gap-2"><ArrowRightLeft className="size-5 text-primary" aria-hidden="true" />Comparar datasets</CardTitle><CardDescription>Encontre registros exclusivos, idênticos e alterados entre dois arquivos.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><SelectField label="Coluna-chave comum" value={keyColumn} onChange={setKeyColumn} options={commonColumns.map((column) => ({ value: column.name, label: column.name }))} /><div className="flex items-end"><label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" checked={caseInsensitive} onChange={(event) => setCaseInsensitive(event.target.checked)} className="size-4 accent-primary" />Ignorar maiúsculas/minúsculas</label></div></div><Button onClick={run} disabled={!keyColumn} className="gap-2"><Play className="size-4" aria-hidden="true" />Executar comparação</Button>{error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}{result && <div role="status" className="grid gap-3 sm:grid-cols-4"><Metric label="Somente no arquivo A" value={result.onlyInA} /><Metric label="Somente no arquivo B" value={result.onlyInB} /><Metric label="Alterados" value={result.changed} tone="text-amber-600" /><Metric label="Idênticos" value={result.identical} tone="text-emerald-600" /></div>}</CardContent></Card>;
}

function ReconcileTool({ first, second, commonColumns }: { first: Dataset; second: Dataset; commonColumns: Dataset["columns"] }) {
  const [keyColumn, setKeyColumn] = React.useState(commonColumns[0]?.name ?? "");
  const [valueColumnA, setValueColumnA] = React.useState(first.columns.find((column) => /valor|preço|preco|total|plano|amount|value/i.test(column.name))?.name ?? first.columns[0]?.name ?? "");
  const [valueColumnB, setValueColumnB] = React.useState(second.columns.find((column) => column.name === valueColumnA)?.name ?? second.columns[0]?.name ?? "");
  const [tolerance, setTolerance] = React.useState("0");
  const [result, setResult] = React.useState<ReconciliationResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const run = () => {
    const key = commonColumns.find((column) => column.name === keyColumn);
    if (!key) { setError("Selecione uma coluna-chave presente nos dois arquivos."); return; }
    try { setError(null); setResult(reconcileDatasets(first, second, { keyColumns: [key.id], valueColumnA, valueColumnB, toleranceCents: Math.max(0, Math.round(Number(tolerance) * 100)) })); } catch (reconcileError) { setError(reconcileError instanceof Error ? reconcileError.message : "Não foi possível reconciliar os arquivos."); }
  };
  return <Card><CardHeader><CardTitle className="flex items-center gap-2"><Scale className="size-5 text-primary" aria-hidden="true" />Reconciliar valores</CardTitle><CardDescription>Compare valores entre arquivos usando centavos inteiros e tolerância explícita.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="grid gap-4 md:grid-cols-2"><SelectField label="Coluna-chave" value={keyColumn} onChange={setKeyColumn} options={commonColumns.map((column) => ({ value: column.name, label: column.name }))} /><label className="flex flex-col gap-1.5 text-sm"><span className="font-medium">Tolerância (R$)</span><Input type="number" min="0" step="0.01" value={tolerance} onChange={(event) => setTolerance(event.target.value)} /></label><SelectField label={`Valor em ${first.name}`} value={valueColumnA} onChange={setValueColumnA} options={first.columns.map((column) => ({ value: column.name, label: column.name }))} /><SelectField label={`Valor em ${second.name}`} value={valueColumnB} onChange={setValueColumnB} options={second.columns.map((column) => ({ value: column.name, label: column.name }))} /></div><Button onClick={run} disabled={!keyColumn || !valueColumnA || !valueColumnB} className="gap-2"><Play className="size-4" aria-hidden="true" />Executar reconciliação</Button>{error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}{result && <div role="status" className="grid gap-3 sm:grid-cols-3"><Metric label="Conciliados" value={result.matched} tone="text-emerald-600" /><Metric label="Fora da tolerância" value={result.outsideTolerance} tone="text-amber-600" /><Metric label="Somente em um arquivo" value={result.onlyInA + result.onlyInB} /><Metric label="Diferença total" value={`R$ ${(result.totalDifferenceCents / 100).toFixed(2).replace('.', ',')}`} /></div>}</CardContent></Card>;
}

export function MultiDatasetTools({ mode }: MultiDatasetToolsProps) {
  const { datasets, datasetOrder } = useWorkspace();
  const { available, first, second, commonColumns } = useDatasetPairs(datasets, datasetOrder);
  if (available.length < 2) return <EmptyState />;
  if (mode === "merge") return <MergeTool available={available} />;
  if (!first || !second) return <EmptyState />;
  if (mode === "compare") return <CompareTool first={first} second={second} commonColumns={commonColumns} />;
  return <ReconcileTool first={first} second={second} commonColumns={commonColumns} />;
}
