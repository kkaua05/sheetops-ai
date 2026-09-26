"use client";

/**
 * SheetOps AI — Workspace.
 *
 * The main application surface. Wraps the workspace state provider and lays
 * out the module navigation (sidebar on desktop, tabs on mobile) alongside
 * the active module's content.
 */

import * as React from "react";
import Link from "next/link";
import { WorkspaceProvider, useWorkspace } from "@/components/workspace/workspace-context";
import {
  ArrowLeft,
  BarChart3,
  CircleHelp,
  FileSpreadsheet,
  FileWarning,
  Files,
  GaugeCircle,
  GitCompareArrows,
  Layers,
  LockKeyhole,
  Moon,
  Rows3,
  Sun,
  Table2,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { FileUpload, type FileUploadHandle } from "@/components/workspace/file-upload";
import { DataPreview } from "@/components/workspace/data-preview";
import { AiPlanningPanel } from "@/components/workspace/ai-planning-panel";
import { ExportToolbar } from "@/components/workspace/export-toolbar";
import { ChangesPreview } from "@/components/workspace/changes-preview";
import { MultiDatasetTools } from "@/components/workspace/multi-dataset-tools";
import { calculateDataHealth } from "@/lib/quality/calculate-data-health";
import { formatNumber } from "@/lib/utils";
import { useTheme } from "@/components/theme/theme-provider";
import { Button, StatCard, Tooltip } from "@/components/ui/primitives";
import type { Dataset } from "@/types/dataset";

type ModuleId = "overview" | "clean" | "merge" | "compare" | "reconcile";

const MODULES: Array<{ id: ModuleId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "overview", label: "Visão geral", icon: Table2 },
  { id: "clean", label: "Limpeza com IA", icon: Wand2 },
  { id: "merge", label: "Consolidar", icon: Layers },
  { id: "compare", label: "Comparar", icon: GitCompareArrows },
  { id: "reconcile", label: "Reconciliar", icon: BarChart3 },
];

function WorkspaceShell() {
  const { datasets, datasetOrder, activeDatasetId } = useWorkspace();
  const { theme, toggleTheme } = useTheme();
  const themeReady = React.useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [activeModule, setActiveModule] = React.useState<ModuleId>("overview");
  const uploadRef = React.useRef<FileUploadHandle>(null);

  const activeDataset = activeDatasetId ? datasets[activeDatasetId] : undefined;
  const activeLabel = MODULES.find((module) => module.id === activeModule)?.label ?? "";

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background lg:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex items-center gap-3 border-b border-border px-5 py-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Table2 className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">SheetOps AI</p>
            <p className="text-[11px] text-muted-foreground">Operações inteligentes</p>
          </div>
        </div>
        <div className="px-5 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-subtle">
          Workspace
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-3" aria-label="Módulos">
          {MODULES.map(({ id, label, icon: Icon }) => {
            const active = activeModule === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveModule(id)}
                className={cn(
                  "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <span
                    className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                )}
                <Icon className={cn("size-4", active && "text-primary")} aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <LockKeyhole className="size-3.5 text-primary" aria-hidden="true" />
            Processamento local
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {datasetOrder.length} arquivo{datasetOrder.length === 1 ? "" : "s"} importado
            {datasetOrder.length === 1 ? "" : "s"}
          </p>
          <Link href="/" className="mt-3 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Voltar ao início
          </Link>
        </div>
      </aside>

      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Table2 className="size-4" aria-hidden="true" />
          </div>
          <span className="text-sm font-semibold">SheetOps AI</span>
        </div>
        <Link href="/" aria-label="Voltar ao início" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" />
        </Link>
      </div>

      {/* Mobile module tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2 lg:hidden" role="tablist" aria-label="Módulos">
        {MODULES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeModule === id}
            onClick={() => setActiveModule(id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              activeModule === id
                ? "bg-primary/10 text-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <Icon className={cn("size-4", activeModule === id && "text-primary")} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="hidden h-[64px] items-center justify-between border-b border-border bg-card px-6 lg:flex">
          <p className="flex items-center gap-1.5 text-sm">
            <span className="text-muted-foreground">Workspace</span>
            <span className="text-muted-subtle">/</span>
            <span className="font-medium text-foreground">{activeLabel}</span>
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
              Processamento local
            </span>
            {themeReady ? (
              <Tooltip label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}>
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
                  className="rounded-md p-2 hover:bg-muted hover:text-foreground"
                >
                  {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                </button>
              </Tooltip>
            ) : (
              <span className="size-8" aria-hidden="true" />
            )}
            <Tooltip label="Ajuda">
              <button
                type="button"
                aria-label="Ajuda"
                className="rounded-md p-2 hover:bg-muted hover:text-foreground"
              >
                <CircleHelp className="size-4" aria-hidden="true" />
              </button>
            </Tooltip>
          </div>
        </header>
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
            {activeModule === "overview" && (
              <OverviewModule dataset={activeDataset} datasets={datasets} datasetOrder={datasetOrder} uploadRef={uploadRef} />
            )}
            {activeModule === "clean" && <CleanModule dataset={activeDataset} uploadRef={uploadRef} />}
            {activeModule === "merge" && <MultiDatasetTools mode="merge" />}
            {activeModule === "compare" && <MultiDatasetTools mode="compare" />}
            {activeModule === "reconcile" && <MultiDatasetTools mode="reconcile" />}
          </div>
        </main>
      </div>
    </div>
  );
}

function OverviewModule({
  dataset,
  datasets,
  datasetOrder,
  uploadRef,
}: {
  dataset?: Dataset;
  datasets: Record<string, Dataset>;
  datasetOrder: string[];
  uploadRef: React.RefObject<FileUploadHandle | null>;
}) {
  const { lastResult } = useWorkspace();

  if (!dataset) {
    return (
      <div className="flex flex-col gap-7">
        <PageHeader
          title="Visão geral"
          description="Importe uma planilha para começar sua análise."
          action={
            <Button type="button" onClick={() => uploadRef.current?.open()} className="gap-2">
              <FileSpreadsheet className="size-4" aria-hidden="true" />
              Importar arquivo
            </Button>
          }
        />
        <FileUpload ref={uploadRef} />
      </div>
    );
  }

  const health = calculateDataHealth(dataset);
  const totalRows = datasetOrder.reduce((sum, id) => sum + (datasets[id]?.rows.length ?? 0), 0);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Visão geral"
        description="Gerencie e analise seus arquivos em um único fluxo."
        action={
          <Button type="button" onClick={() => uploadRef.current?.open()} className="gap-2">
            <FileSpreadsheet className="size-4" aria-hidden="true" />
            Importar arquivo
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Arquivos importados" value={formatNumber(datasetOrder.length)} icon={Files} />
        <StatCard label="Linhas analisadas" value={formatNumber(totalRows)} icon={Rows3} />
        <StatCard
          label="Problemas encontrados"
          value={formatNumber(health.totalIssues)}
          icon={FileWarning}
          tone={health.totalIssues > 0 ? "text-warning" : "text-foreground"}
        />
        <StatCard
          label="Qualidade dos dados"
          value={`${health.score}/100`}
          icon={GaugeCircle}
          tone={health.score >= 80 ? "text-primary" : health.score >= 60 ? "text-warning" : "text-destructive"}
        />
      </div>

      <div className="hidden">
        <FileUpload ref={uploadRef} />
      </div>

      <ExportToolbar dataset={dataset} />
      {lastResult && <ChangesPreview result={lastResult} />}
      <DataPreview dataset={dataset} />
    </div>
  );
}

function CleanModule({ dataset, uploadRef }: { dataset?: Dataset; uploadRef: React.RefObject<FileUploadHandle | null> }) {
  if (!dataset) {
    return (
      <div className="flex flex-col gap-7">
        <PageHeader title="Limpeza com IA" description="Descreva em linguagem natural o que deseja corrigir nos dados." />
        <FileUpload ref={uploadRef} />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-7">
      <PageHeader title="Limpeza com IA" description="Descreva em linguagem natural o que deseja corrigir nos dados." />
      <AiPlanningPanel dataset={dataset} />
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <WorkspaceProvider>
      <WorkspaceShell />
    </WorkspaceProvider>
  );
}

function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[30px]">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
