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
  GitCompareArrows,
  Layers,
  LockKeyhole,
  Moon,
  Sun,
  Table2,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { FileUpload } from "@/components/workspace/file-upload";
import { DataPreview } from "@/components/workspace/data-preview";
import { AiPlanningPanel } from "@/components/workspace/ai-planning-panel";
import { ExportToolbar } from "@/components/workspace/export-toolbar";
import { ChangesPreview } from "@/components/workspace/changes-preview";
import { MultiDatasetTools } from "@/components/workspace/multi-dataset-tools";
import { calculateDataHealth } from "@/lib/quality/calculate-data-health";
import { formatNumber } from "@/lib/utils";
import { useTheme } from "@/components/theme/theme-provider";

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

  const activeDataset = activeDatasetId ? datasets[activeDatasetId] : undefined;

  return (
    <div className="flex min-h-0 flex-1 bg-background lg:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/80 bg-card lg:flex">
        <div className="flex items-center gap-3 border-b border-border/80 px-5 py-5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Table2 className="size-5" aria-hidden="true" /></div>
          <div><p className="text-sm font-semibold tracking-tight">SheetOps AI</p><p className="text-[11px] text-muted-foreground">Operações inteligentes</p></div>
        </div>
        <div className="px-5 pb-2 pt-7 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Workspace</div>
        <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Módulos">
          {MODULES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveModule(id)}
              className={cn(
                "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors",
                activeModule === id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              aria-current={activeModule === id ? "page" : undefined}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>
        <div className="border-t border-border/80 p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-3.5 text-primary" /> Processamento local</div>
          <p className="mt-2 text-xs text-muted-foreground">{datasetOrder.length} arquivo{datasetOrder.length === 1 ? "" : "s"} importado{datasetOrder.length === 1 ? "" : "s"}</p>
          <Link href="/" className="mt-3 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" /> Voltar ao início</Link>
        </div>
      </aside>

      <div className="flex items-center justify-between border-b border-border/80 bg-card px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2"><div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Table2 className="size-4" /></div><span className="text-sm font-semibold">SheetOps AI</span></div>
        <Link href="/" aria-label="Voltar ao início" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /></Link>
      </div>

      {/* Mobile module tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border/80 bg-card px-3 py-2 lg:hidden" role="tablist" aria-label="Módulos">
        {MODULES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeModule === id}
            onClick={() => setActiveModule(id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-[9px] px-3 py-2 text-sm font-medium transition-colors",
              activeModule === id
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="hidden h-[68px] items-center justify-between border-b border-border/80 bg-card px-6 lg:flex">
          <div><p className="text-sm font-semibold">{MODULES.find((module) => module.id === activeModule)?.label}</p><p className="text-xs text-muted-foreground">Workspace de operações</p></div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" /> Processamento local</span>{themeReady ? <button type="button" onClick={toggleTheme} aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"} className="rounded-lg p-2 hover:bg-muted hover:text-foreground">{theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}</button> : <span className="size-8" aria-hidden="true" />}<CircleHelp className="size-4" aria-label="Ajuda" /></div>
        </header>
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {activeModule === "overview" && (
          <OverviewModule dataset={activeDataset} />
        )}
        {activeModule === "clean" && (
          <CleanModule dataset={activeDataset} />
        )}
        {activeModule === "merge" && <MultiDatasetTools mode="merge" />}
        {activeModule === "compare" && <MultiDatasetTools mode="compare" />}
        {activeModule === "reconcile" && <MultiDatasetTools mode="reconcile" />}
        </div>
      </main>
      </div>
    </div>
  );
}

function OverviewModule({ dataset }: { dataset?: import("@/types/dataset").Dataset }) {
  const { lastResult } = useWorkspace();
  if (!dataset) {
    return (
      <div className="flex flex-col gap-7">
        <PageHeader title="Visão geral" description="Importe uma planilha para começar sua análise." />
        <FileUpload />
      </div>
    );
  }
  const health = calculateDataHealth(dataset);
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Visão geral" description="Acompanhe a qualidade e transforme seus dados com segurança." />
      <FileUpload />
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Linhas" value={formatNumber(dataset.rows.length)} />
        <MetricCard label="Colunas" value={formatNumber(dataset.columns.length)} />
        <MetricCard label="Saúde dos dados" value={`${health.score}/100`} tone={health.score >= 80 ? "text-primary" : health.score >= 60 ? "text-amber-600" : "text-red-600"} />
      </div>
      <ExportToolbar dataset={dataset} />
      {lastResult && <ChangesPreview result={lastResult} />}
      <DataPreview dataset={dataset} />
    </div>
  );
}

function CleanModule({ dataset }: { dataset?: import("@/types/dataset").Dataset }) {
  if (!dataset) {
    return (
      <div className="flex flex-col gap-7">
        <PageHeader title="Limpeza inteligente" description="Descreva em linguagem natural o que deseja corrigir nos dados." />
        <FileUpload />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-7">
      <PageHeader title="Limpeza inteligente" description="Descreva em linguagem natural o que deseja corrigir nos dados." />
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

function PageHeader({ title, description }: { title: string; description: string }) {
  return <div><h1 className="text-2xl font-semibold tracking-tight sm:text-[30px]">{title}</h1><p className="mt-2 text-sm text-muted-foreground">{description}</p></div>;
}

function MetricCard({ label, value, tone = "" }: { label: string; value: string; tone?: string }) {
  return <div className="rounded-2xl border bg-card p-4 shadow-[0_8px_30px_rgba(35,55,40,0.04)]"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className={`mt-2 text-2xl font-semibold tracking-tight ${tone}`}>{value}</p></div>;
}